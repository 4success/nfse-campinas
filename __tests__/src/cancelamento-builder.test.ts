import { ValidationError } from '../../src/errors/ValidationError';
import { CancelamentoNfseXmlBuilder, NFSE_NAMESPACE } from '../../src/eventos/CancelamentoNfseXmlBuilder';
import { CODIGO_EVENTO_CANCELAMENTO_NFSE } from '../../src/eventos/types';

describe('CancelamentoNfseXmlBuilder', () => {
  const inscricaoFederalAlfanumerica = 'ABCD1234EFG112';
  const chaveAcesso = `350950222${inscricaoFederalAlfanumerica}${'0'.repeat(27)}`;

  test('gera o pedRegEvento 101101 na ordem oficial e normaliza somente formatos documentados', () => {
    const builder = new CancelamentoNfseXmlBuilder({
      ambiente: 'homologacao',
      versaoAplicativoPadrao: '3.4.0',
      agora: () => new Date('2026-08-18T17:30:45.789Z'),
    });

    const result = builder.build({
      chaveAcesso: `NFS${chaveAcesso}`,
      autor: { cnpj: 'AB.CD1.234/EFG1-12' },
      codigoMotivo: 1,
      motivo: ' Motivo & <teste> ',
    });

    const id = `PRE${chaveAcesso}${CODIGO_EVENTO_CANCELAMENTO_NFSE}`;
    expect(result).toEqual({
      chaveAcesso,
      idPedidoRegistroEvento: id,
      xml:
        `<?xml version="1.0" encoding="UTF-8"?>` +
        `<pedRegEvento xmlns="${NFSE_NAMESPACE}" versao="1.01">` +
        `<infPedReg Id="${id}">` +
        `<tpAmb>2</tpAmb>` +
        `<verAplic>3.4.0</verAplic>` +
        `<dhEvento>2026-08-18T17:30:45+00:00</dhEvento>` +
        `<CNPJAutor>ABCD1234EFG112</CNPJAutor>` +
        `<chNFSe>${chaveAcesso}</chNFSe>` +
        `<e101101>` +
        `<xDesc>Cancelamento de NFS-e</xDesc>` +
        `<cMotivo>1</cMotivo>` +
        `<xMotivo> Motivo &amp; &lt;teste&gt; </xMotivo>` +
        `</e101101>` +
        `</infPedReg>` +
        `</pedRegEvento>`,
    });
    expect(result.xml).not.toContain('nPedRegEvento');
  });

  test('preserva data/hora, versão e motivo informados e normaliza CPF formatado', () => {
    const builder = new CancelamentoNfseXmlBuilder({
      ambiente: 'producao',
      versaoAplicativoPadrao: 'default',
    });

    const result = builder.build({
      chaveAcesso: `350950221${'0'.repeat(14)}${'1'.repeat(27)}`,
      autor: { cpf: '123.456.789-01' },
      codigoMotivo: 9,
      motivo: 'curto',
      dataHoraEvento: '2026-08-18T14:30:45-03:00',
      versaoAplicativo: 'app-informado',
    });

    expect(result.xml).toContain('<tpAmb>1</tpAmb>');
    expect(result.xml).toContain('<verAplic>app-informado</verAplic>');
    expect(result.xml).toContain('<dhEvento>2026-08-18T14:30:45-03:00</dhEvento>');
    expect(result.xml).toContain('<CPFAutor>12345678901</CPFAutor>');
    expect(result.xml).toContain('<xMotivo>curto</xMotivo>');
  });

  test.each([
    [{ chaveAcesso: 'invalida' }, 'chaveAcesso'],
    [{ autor: { cpf: '12345678901', cnpj: '12345678901234' } }, 'autor'],
    [{ codigoMotivo: 3 }, 'codigoMotivo'],
    [{ motivo: '' }, 'motivo'],
    [{ dataHoraEvento: '2026-02-30T10:00:00-03:00' }, 'dataHoraEvento'],
  ])('rejeita dados necessários inválidos: %s', (override, field) => {
    const builder = new CancelamentoNfseXmlBuilder({
      ambiente: 'homologacao',
      versaoAplicativoPadrao: '3.4.0',
    });
    const input = {
      chaveAcesso,
      autor: { cnpj: inscricaoFederalAlfanumerica },
      codigoMotivo: 2,
      motivo: 'Motivo informado sem alteração',
      dataHoraEvento: '2026-08-18T14:30:45-03:00',
      ...override,
    } as any;

    expect(() => builder.build(input)).toThrow(
      expect.objectContaining({
        name: ValidationError.name,
        message: expect.stringContaining('Pedido de Registro de Evento inválido'),
        issues: expect.arrayContaining([expect.objectContaining({ field, severity: 'error' })]),
      }),
    );
  });
});
