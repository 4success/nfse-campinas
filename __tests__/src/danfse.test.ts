import { gzipSync } from 'zlib';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import { DanfseViewerModule, imprimirDanfse } from '../../src/danfse/imprimirDanfse';

const mockParse = jest.fn();
const mockBuild = jest.fn();

const viewer: DanfseViewerModule = {
  DanfseXmlParser: jest.fn().mockImplementation(() => ({ parse: mockParse })),
  DanfseHtmlBuilder: jest.fn().mockImplementation(() => ({ build: mockBuild })),
};

describe('imprimirDanfse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParse.mockResolvedValue({ chaveAcesso: 'NFS123' });
    mockBuild.mockReturnValue('<html><body>DANFSe</body></html>');
  });

  test('gera HTML a partir do XML autorizado', async () => {
    const xml = '<NFSe><infNFSe Id="NFS123"></infNFSe></NFSe>';

    const html = await imprimirDanfse({ xml }, viewer);

    expect(mockParse).toHaveBeenCalledWith(xml);
    expect(mockBuild).toHaveBeenCalledWith({ chaveAcesso: 'NFS123' });
    expect(html).toBe('<html><body>DANFSe</body></html>');
  });

  test('gera HTML a partir do nfseXmlGZipB64', async () => {
    const xml = '<NFSe><infNFSe Id="NFS123"></infNFSe></NFSe>';
    const nfseXmlGZipB64 = gzipSync(Buffer.from(xml, 'utf8')).toString('base64');

    await imprimirDanfse({ nfseXmlGZipB64 }, viewer);

    expect(mockParse).toHaveBeenCalledWith(xml);
  });

  test('exige XML autorizado ou nfseXmlGZipB64', async () => {
    await expect(imprimirDanfse({} as Parameters<typeof imprimirDanfse>[0], viewer)).rejects.toThrow(
      'Informe o XML autorizado da NFSe ou nfseXmlGZipB64 para imprimir o DANFSe',
    );
  });

  test('fachada NfseCampinasV3 expõe imprimirDanfse', async () => {
    const nfse = new NfseCampinasV3({ certificate: Buffer.from(''), certPassword: '' });

    expect(typeof nfse.imprimirDanfse).toBe('function');
  });
});
