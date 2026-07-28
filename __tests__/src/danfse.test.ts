import { gzipSync } from 'zlib';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import { DanfseViewerModule, imprimirDanfse } from '../../src/danfse/imprimirDanfse';

const mockParse = jest.fn();
const mockBuild = jest.fn();
const accessKey = '1'.repeat(50);

const authorizedNfseXml = `<?xml version="1.0" encoding="UTF-8"?>
<NFSe>
  <infNFSe Id="NFS${accessKey}">
    <ambGer>1</ambGer>
    <nNFSe>2103</nNFSe>
    <dhProc>2026-07-28T10:30:00-03:00</dhProc>
    <cStat>100</cStat>
    <xLocEmi>Campinas</xLocEmi>
    <emit>
      <CNPJ>12345678000190</CNPJ>
      <IM>123456</IM>
      <xNome>Prestador de Teste</xNome>
      <enderNac>
        <cMun>3509502</cMun>
        <CEP>13010000</CEP>
        <UF>SP</UF>
      </enderNac>
    </emit>
    <DPS>
      <infDPS>
        <tpAmb>1</tpAmb>
        <dCompet>2026-07-28</dCompet>
        <dhEmi>2026-07-28T10:29:00-03:00</dhEmi>
        <nDPS>42</nDPS>
        <serie>00001</serie>
        <tpEmit>1</tpEmit>
        <prest>
          <CNPJ>12345678000190</CNPJ>
          <IM>123456</IM>
          <regTrib>
            <opSimpNac>1</opSimpNac>
            <regEspTrib>0</regEspTrib>
          </regTrib>
        </prest>
        <serv>
          <locPrest>
            <cLocPrestacao>3509502</cLocPrestacao>
          </locPrest>
          <cServ>
            <cTribNac>010601</cTribNac>
            <cTribMun>001</cTribMun>
            <cNBS>115011000</cNBS>
            <xDescServ>Serviço de teste</xDescServ>
          </cServ>
        </serv>
        <valores>
          <vServPrest>
            <vServ>100.00</vServ>
          </vServPrest>
          <trib>
            <tribMun>
              <tribISSQN>1</tribISSQN>
              <tpRetISSQN>1</tpRetISSQN>
            </tribMun>
          </trib>
        </valores>
        <IBSCBS>
          <finNFSe>0</finNFSe>
        </IBSCBS>
      </infDPS>
    </DPS>
    <valores>
      <vBC>100.00</vBC>
      <pAliqAplic>5.00</pAliqAplic>
      <vISSQN>5.00</vISSQN>
      <vTotalRet>0.00</vTotalRet>
      <vLiq>100.00</vLiq>
    </valores>
  </infNFSe>
</NFSe>`;

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

  test('usa o visualizador incorporado com o XML autorizado', async () => {
    const html = await imprimirDanfse({ xml: authorizedNfseXml });

    expect(html).toContain('DANFSe v2.0');
    expect(html).toContain('<span class="val">Ativa</span>');
    expect(html).toContain('<span class="val">NFS-e regular</span>');
    expect(html).toContain('<span class="val">1.1501.10.00</span>');
    expect(html).toContain('padding: 6mm 6mm 10mm 6mm');
  });

  test('preserva o NBS que já veio formatado no XML', async () => {
    const xml = authorizedNfseXml.replace('<cNBS>115011000</cNBS>', '<cNBS>1.1501.10.00</cNBS>');

    const html = await imprimirDanfse({ xml });

    expect(html).toContain('<span class="val">1.1501.10.00</span>');
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
