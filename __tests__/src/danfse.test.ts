import { gzipSync } from 'zlib';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import { DanfseViewerModule, imprimirDanfse } from '../../src/danfse/imprimirDanfse';
import { DanfseXmlParser } from '../../src/danfse/viewer/parser';

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

const originalDpsIbsCbs = `<IBSCBS>
          <finNFSe>0</finNFSe>
        </IBSCBS>`;

const declaredIbsCbs = `<IBSCBS>
  <finNFSe>0</finNFSe>
  <cIndOp>100301</cIndOp>
  <valores>
    <trib><gIBSCBS><CST>000</CST><cClassTrib>000001</cClassTrib></gIBSCBS></trib>
  </valores>
</IBSCBS>`;

const assessedIbsCbs = `<IBSCBS>
  <valores>
    <vBC>73.21</vBC>
    <uf><pIBSUF>0.10</pIBSUF><pAliqEfetUF>0.10</pAliqEfetUF></uf>
    <mun><pIBSMun>0.00</pIBSMun><pAliqEfetMun>0.00</pAliqEfetMun></mun>
    <fed><pCBS>0.90</pCBS><pAliqEfetCBS>0.90</pAliqEfetCBS></fed>
  </valores>
  <totCIBS>
    <vTotNF>100.73</vTotNF>
    <gIBS>
      <vIBSTot>0.07</vIBSTot>
      <gIBSUFTot><vIBSUF>0.07</vIBSUF></gIBSUFTot>
      <gIBSMunTot><vIBSMun>0.00</vIBSMun></gIBSMunTot>
    </gIBS>
    <gCBS><vCBS>0.66</vCBS></gCBS>
  </totCIBS>
</IBSCBS>`;

const historicalIbsCbs = assessedIbsCbs.replace(
  '<valores>',
  '<valores><trib><gIBSCBS><CST>000</CST><cClassTrib>000001</cClassTrib></gIBSCBS></trib>',
);

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

  test('projeta a apuração municipal e preserva a classificação da DPS no mesmo XML autorizado', async () => {
    const xml = authorizedNfseXml
      .replace(originalDpsIbsCbs, declaredIbsCbs)
      .replace('</infNFSe>', assessedIbsCbs + '</infNFSe>');

    const data = await new DanfseXmlParser().parse(xml);
    const html = await imprimirDanfse({ xml });

    expect(data.cstClass).toBe('000 / 000001');
    expect(data.vBCIbs).toBe('R$\u00a073,21');
    expect(data.aliqIbs).toBe('0,10% / 0,00%');
    expect(data.pAliqEfetUF).toBe('0,10%');
    expect(data.pCBS).toBe('0,90%');
    expect(data.pAliqEfetCBS).toBe('0,90%');
    expect(data.vIBSTot).toBe('R$\u00a00,07');
    expect(data.vCBS).toBe('R$\u00a00,66');
    expect(data.totIbsCbs).toBe('R$\u00a00,73');
    expect(data.vTotNF).toBe('R$\u00a0100,73');
    expect(html).toContain('<span class="val">R$\u00a073,21</span>');
    expect(html).toContain('<span class="val">R$\u00a00,66</span>');
    expect(html).toContain('<span class="val"><strong>R$\u00a0100,73</strong></span>');
  });

  test.each(['DPS', 'NFSe'])('preserva a apuração histórica disponível somente no bloco %s', async (block) => {
    const xml =
      block === 'DPS'
        ? authorizedNfseXml.replace(originalDpsIbsCbs, historicalIbsCbs)
        : authorizedNfseXml.replace(originalDpsIbsCbs, '').replace('</infNFSe>', historicalIbsCbs + '</infNFSe>');

    const data = await new DanfseXmlParser().parse(xml);

    expect(data.cstClass).toBe('000 / 000001');
    expect(data.vBCIbs).toBe('R$\u00a073,21');
    expect(data.pCBS).toBe('0,90%');
    expect(data.vCBS).toBe('R$\u00a00,66');
    expect(data.vTotNF).toBe('R$\u00a0100,73');
  });

  test('preserva o NBS que já veio formatado no XML', async () => {
    const xml = authorizedNfseXml.replace('<cNBS>115011000</cNBS>', '<cNBS>1.1501.10.00</cNBS>');

    const html = await imprimirDanfse({ xml });

    expect(html).toContain('<span class="val">1.1501.10.00</span>');
  });

  test('usa a alíquota da DPS autorizada quando a apuração não repete pAliqAplic', async () => {
    const xml = authorizedNfseXml
      .replace('<pAliqAplic>5.00</pAliqAplic>', '')
      .replace('<tpRetISSQN>1</tpRetISSQN>', '<tpRetISSQN>1</tpRetISSQN><pAliq>2.00</pAliq>');

    const data = await new DanfseXmlParser().parse(xml);

    expect(data.pAliqAplic).toBe('2,00%');
    expect(data.vBC).toBe('R$\u00a0100,00');
    expect(data.vISSQN).toBe('R$\u00a05,00');
    expect(data.vLiq).toBe('R$\u00a0100,00');
  });

  test('prioriza pAliqAplic, inclusive zero, e não calcula alíquota ausente', async () => {
    const xml = authorizedNfseXml.replace(
      '<tpRetISSQN>1</tpRetISSQN>',
      '<tpRetISSQN>1</tpRetISSQN><pAliq>2.00</pAliq>',
    );
    expect((await new DanfseXmlParser().parse(xml)).pAliqAplic).toBe('5,00%');
    expect(
      (await new DanfseXmlParser().parse(xml.replace('<pAliqAplic>5.00</pAliqAplic>', '<pAliqAplic>0</pAliqAplic>')))
        .pAliqAplic,
    ).toBe('0,00%');
    expect(
      (await new DanfseXmlParser().parse(authorizedNfseXml.replace('<pAliqAplic>5.00</pAliqAplic>', ''))).pAliqAplic,
    ).toBe('-');
  });

  test('mantém separados os horários da DPS e da NFS-e presentes no XML', async () => {
    const data = await new DanfseXmlParser().parse(authorizedNfseXml);
    expect(data.dhEmi).toBe('28/07/2026 10:29:00');
    expect(data.dhProc).toBe('28/07/2026 10:30:00');
    const missing = authorizedNfseXml.replace('<dhEmi>2026-07-28T10:29:00-03:00</dhEmi>', '');
    expect((await new DanfseXmlParser().parse(missing)).dhEmi).toBe('-');
  });

  const tomadorXml = `<toma><CPF>12345678901</CPF><xNome>Tomador de Teste</xNome>
    <end><endNac><cMun>3536505</cMun><CEP>13140000</CEP></endNac>
      <xLgr>Rua de Teste</xLgr><nro>1</nro></end><fone>11999990000</fone></toma>`;

  test('resolve o município pelo nome de incidência no XML e identifica indDest=0', async () => {
    const xml = authorizedNfseXml
      .replace('<serv>', tomadorXml + '<serv>')
      .replace('<finNFSe>0</finNFSe>', '<finNFSe>0</finNFSe><indDest>0</indDest>')
      .replace(
        '</infNFSe>',
        '<IBSCBS><cLocalidadeIncid>3536505</cLocalidadeIncid><xLocalidadeIncid>Paulínia</xLocalidadeIncid></IBSCBS></infNFSe>',
      );

    const data = await new DanfseXmlParser().parse(xml);
    const html = await imprimirDanfse({ xml });
    expect(data.tomador.municipioUf).toBe('Paulínia / SP');
    expect(data.tomador.fone).toBe('11999990000');
    expect(data.destinatarioIgualTomador).toBe(true);
    expect(html).toContain('O DESTINATÁRIO É O PRÓPRIO TOMADOR/ADQUIRENTE DA OPERAÇÃO');
    expect(html).not.toContain('DESTINATÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e');
  });

  test('não inventa município, telefone ou destinatário quando não constam do XML', async () => {
    const xml = authorizedNfseXml.replace('<serv>', tomadorXml.replace('<fone>11999990000</fone>', '') + '<serv>');
    const data = await new DanfseXmlParser().parse(xml);
    expect(data.tomador.municipioUf).toBe('3536505 / SP');
    expect(data.tomador.fone).toBe('-');
    expect(data.prestador.fone).toBe('-');
    expect(data.destinatarioIgualTomador).toBe(false);
    expect(data.destinatario).toBeNull();
  });

  test('preserva destinatário explícito e telefones disponíveis no XML', async () => {
    const destXml = '<dest><CPF>98765432100</CPF><xNome>Destinatário de Teste</xNome><fone>11988880000</fone></dest>';
    const xml = authorizedNfseXml
      .replace('<serv>', tomadorXml + '<serv>')
      .replace('<finNFSe>0</finNFSe>', '<finNFSe>0</finNFSe><indDest>1</indDest>' + destXml)
      .replace('<xNome>Prestador de Teste</xNome>', '<xNome>Prestador de Teste</xNome><fone>1933330000</fone>');
    const data = await new DanfseXmlParser().parse(xml);
    expect(data.destinatarioIgualTomador).toBe(false);
    expect(data.destinatario.fone).toBe('11988880000');
    expect(data.prestador.fone).toBe('1933330000');
    const html = await imprimirDanfse({ xml });
    expect(html).toContain('Destinatário de Teste');
    expect(html).toContain('11988880000');
    expect(html).toContain('1933330000');
  });

  test('distingue alíquota zero de campo ausente sem alterar valores monetários', async () => {
    const xml = authorizedNfseXml.replace('</infNFSe>', assessedIbsCbs + '</infNFSe>');
    const data = await new DanfseXmlParser().parse(xml);
    expect(data.aliqIbs).toBe('0,10% / 0,00%');
    expect(data.pAliqEfetMun).toBe('0,00%');
    expect(data.redAliq).toBe('- / - / -');
    expect(data.vIBSMun).toBe('-');
    expect(data.vBCIbs).toBe('R$\u00a073,21');
    expect(data.vLiq).toBe('R$\u00a0100,00');
  });

  test('exige XML autorizado ou nfseXmlGZipB64', async () => {
    await expect(imprimirDanfse({} as Parameters<typeof imprimirDanfse>[0], viewer)).rejects.toThrow(
      'Informe o XML autorizado da NFSe ou nfseXmlGZipB64 para imprimir o DANFSe',
    );
  });

  test.each(['\n', '\r\n', '\r'])('restaura apenas quebras %j na descrição de apresentação', async (breaks) => {
    const xml = authorizedNfseXml.replace('Serviço de teste', 'LINHA ALINHA B');
    const input = { xml, descricaoServico: `LINHA A${breaks}${breaks}LINHA B` };
    const html = await imprimirDanfse(input);

    expect(html).toContain(input.descricaoServico);
    expect(html).toContain('.desc-serv .val.wrap { white-space: pre-wrap; }');
    expect(input.xml).toBe(xml);
  });

  test('mantém quebras do próprio XML quando não há complemento', async () => {
    const xml = authorizedNfseXml.replace('Serviço de teste', 'LINHA A\n\nLINHA B');
    const html = await imprimirDanfse({ xml });

    expect(html).toContain('LINHA A\n\nLINHA B');
    expect(html).toContain('.desc-serv .val.wrap { white-space: pre-wrap; }');
  });

  test.each(['LINHA A LINHA B', 'LINHA A\tLINHA B', 'LINHA A\nOUTRA', 'linha A\nLINHA B'])(
    'ignora complemento que altera caracteres diferentes de CR/LF: %j',
    async (descricaoServico) => {
      const xml = authorizedNfseXml.replace('Serviço de teste', 'LINHA ALINHA B');
      const input = { xml, descricaoServico };

      expect(await imprimirDanfse(input)).toBe(await imprimirDanfse({ xml }));
    },
  );

  test('não aceita igualdade obtida removendo espaços das bordas do XML', async () => {
    const xml = authorizedNfseXml.replace('Serviço de teste', '  LINHA ALINHA B  ');
    const input = { xml, descricaoServico: 'LINHA A\nLINHA B' };

    expect(await imprimirDanfse(input)).toBe(await imprimirDanfse({ xml }));
  });

  test('compara a descrição integral antes da projeção truncada do visualizador', async () => {
    const description = 'A'.repeat(1400) + 'FINAL';
    const xml = authorizedNfseXml.replace('Serviço de teste', description);
    const valid = { xml, descricaoServico: 'A'.repeat(1400) + '\nFINAL' };
    const truncated = { xml, descricaoServico: (await new DanfseXmlParser().parse(xml)).xDescServ + '\n' };
    const changed = { xml, descricaoServico: 'A'.repeat(1400) + '\nDIFERENTE' };

    expect(await imprimirDanfse(valid)).toContain(valid.descricaoServico);
    expect(await imprimirDanfse(truncated)).toBe(await imprimirDanfse({ xml }));
    expect(await imprimirDanfse(changed)).toBe(await imprimirDanfse({ xml }));
  });

  test('compara entidades XML decodificadas uma vez e mantém o escape HTML', async () => {
    const xml = authorizedNfseXml.replace('Serviço de teste', 'A&amp;B&lt;script&gt;C&lt;/script&gt;');
    const input = { xml, descricaoServico: 'A&\nB<script>C</script>' };
    const html = await imprimirDanfse(input);
    const doubleEncoded = { xml, descricaoServico: 'A&amp;\nB<script>C</script>' };

    expect(html).toContain('A&amp;\nB&lt;script&gt;C&lt;/script&gt;');
    expect(html).not.toContain('<script>C</script>');
    expect(await imprimirDanfse(doubleEncoded)).toBe(await imprimirDanfse({ xml }));
  });

  test('preserva XML compactado, assinatura e todos os outros dados de apresentação', async () => {
    const xml = authorizedNfseXml
      .replace('Serviço de teste', 'LINHA ALINHA B')
      .replace('</NFSe>', '<Signature>ASSINATURA SINTÉTICA</Signature></NFSe>');
    const input = {
      nfseXmlGZipB64: gzipSync(Buffer.from(xml)).toString('base64'),
      descricaoServico: 'LINHA A\nLINHA B',
    };
    const originalInput = { ...input };
    const parse = jest.fn((originalXml: string) => new DanfseXmlParser().parse(originalXml));
    const build = jest.fn(() => 'HTML');
    const controlledViewer: DanfseViewerModule = {
      DanfseXmlParser: jest.fn().mockImplementation(() => ({ parse })),
      DanfseHtmlBuilder: jest.fn().mockImplementation(() => ({ build })),
    };

    await imprimirDanfse(input, controlledViewer);

    expect(parse).toHaveBeenCalledWith(xml);
    expect(build).toHaveBeenCalledWith({
      ...(await new DanfseXmlParser().parse(xml)),
      xDescServ: input.descricaoServico,
    });
    expect(input).toEqual(originalInput);
  });

  test('distingue referência numérica XML de uma sequência literal semelhante', async () => {
    const numericXml = authorizedNfseXml.replace('Serviço de teste', 'A&#38;B');
    const literalXml = authorizedNfseXml.replace('Serviço de teste', 'A&amp;#38;B');
    const description = 'A&\nB';
    const numeric = { xml: numericXml, descricaoServico: description };
    const literal = { xml: literalXml, descricaoServico: description };

    expect(await imprimirDanfse(numeric)).toContain('A&amp;\nB');
    expect(await imprimirDanfse(literal)).toBe(await imprimirDanfse({ xml: literalXml }));
  });

  test.each([null, 1, true, {}, []])('rejeita complemento com tipo inválido: %j', async (descricaoServico) => {
    const input = { xml: authorizedNfseXml, descricaoServico } as unknown as Parameters<typeof imprimirDanfse>[0];

    await expect(imprimirDanfse(input)).rejects.toThrow('descricaoServico deve ser uma string');
  });

  test('fachada NfseCampinasV3 expõe imprimirDanfse', async () => {
    const nfse = new NfseCampinasV3({ certificate: Buffer.from(''), certPassword: '' });

    expect(typeof nfse.imprimirDanfse).toBe('function');
  });
});
