const mockPrivateKey = { n: { toString: () => '11' }, e: { toString: () => '10001' } };
const mockIntermediateCert = {
  name: 'intermediate',
  publicKey: { n: { toString: () => '22' }, e: { toString: () => '10001' } },
};
const mockLeafCert = {
  name: 'leaf',
  publicKey: { n: { toString: () => '11' }, e: { toString: () => '10001' } },
};
const mockForge = {
  asn1: { fromDer: jest.fn() },
  pkcs12: {
    pkcs12FromAsn1: jest.fn(),
  },
  pki: {
    oids: { pkcs8ShroudedKeyBag: 'pkcs8', keyBag: 'key', certBag: 'cert' },
    privateKeyToPem: jest.fn(() => 'PRIVATE'),
    certificateToPem: jest.fn((cert) => `CERT:${cert.name}`),
  },
  util: {
    bytesToHex: jest.fn((value) => `hex:${value}`),
  },
};

jest.mock('node-forge', () => ({ __esModule: true, default: mockForge }));

import { PfxCertificate } from '../../src/certificate/PfxCertificate';

describe('PfxCertificate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockForge.pkcs12.pkcs12FromAsn1.mockReturnValue({
      getBags: ({ bagType }: { bagType: string }) => ({
        [bagType]: bagType === 'pkcs8' ? keyBags() : certBags(bagType),
      }),
    });
  });

  test('seleciona o certificado correspondente à chave privada pelo localKeyId', () => {
    const pem = new PfxCertificate(Buffer.from('PFX'), 'secret').toPem();

    expect(pem).toEqual({ privateKey: 'PRIVATE', publicCert: 'CERT:leafCERT:intermediate' });
    expect(mockForge.pki.certificateToPem).toHaveBeenCalledWith(mockLeafCert);
    expect(mockForge.pki.certificateToPem).toHaveBeenCalledWith(mockIntermediateCert);
  });
});

function keyBags() {
  return [{ key: mockPrivateKey, attributes: { localKeyId: ['leaf'] } }];
}

function certBags(bagType: string) {
  if (bagType !== 'cert') {
    return [];
  }
  return [
    { cert: mockIntermediateCert, attributes: { localKeyId: ['intermediate'] } },
    { cert: mockLeafCert, attributes: { localKeyId: ['leaf'] } },
  ];
}
