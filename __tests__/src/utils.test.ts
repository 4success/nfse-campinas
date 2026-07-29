import { gzipSync } from 'zlib';
import { formatDecimal, roundHalfEven } from '../../src/utils/decimals';
import { isIsoDate, isIsoDateTime } from '../../src/utils/dates';
import { assertNfseXmlMatchesDps, decodeNfseXmlGZipB64, extractDpsIdFromNfseXml } from '../../src/utils/nfseXml';
import { sanitizeXmlText } from '../../src/utils/xml';

describe('utils', () => {
  test('arredonda half-even sem ponto flutuante', () => {
    expect(roundHalfEven('1.015', 2)).toBe('1.02');
    expect(roundHalfEven('1.025', 2)).toBe('1.02');
    expect(formatDecimal('26947.275', 2)).toBe('26947.28');
  });

  test('valida datas ISO por componentes reais', () => {
    expect(isIsoDate('2026-06-30')).toBe(true);
    expect(isIsoDate('2026-02-30')).toBe(false);
    expect(isIsoDateTime('2026-06-30')).toBe(true);
    expect(isIsoDateTime('2026-06-30T21:41:28-03:00')).toBe(true);
    expect(isIsoDateTime('2026-06-30T21:41:28')).toBe(true);
    expect(isIsoDateTime('2026-07-08T16:13:36.707848125-03:00')).toBe(true);
    expect(isIsoDateTime('2026-13-40T99:99:99-03:00')).toBe(false);
  });

  test('decodifica XML da NFSe retornado em gzip base64', () => {
    const nfseXml = '<NFSe><infNFSe Id="NFSe1" /></NFSe>';
    const nfseXmlGZipB64 = gzipSync(Buffer.from(nfseXml, 'utf8')).toString('base64');

    expect(decodeNfseXmlGZipB64(nfseXmlGZipB64)).toBe(nfseXml);
  });

  test('extrai e confere o identificador da DPS embutido no XML autorizado', () => {
    const idDps = 'DPS350950221234567800019900001000000000000001';
    const xml = `<NFSe xmlns="urn:nfse"><infNFSe><DPS><infDPS Id="${idDps}" /></DPS></infNFSe></NFSe>`;

    expect(extractDpsIdFromNfseXml(xml)).toBe(idDps);
    expect(() => assertNfseXmlMatchesDps(xml, idDps)).not.toThrow();
    expect(() => assertNfseXmlMatchesDps(xml, 'DPS350950221234567800019900001000000000000002')).toThrow(
      'XML autorizado pertence à DPS',
    );
  });

  test('rejeita XML sem identificação da DPS', () => {
    expect(extractDpsIdFromNfseXml('<NFSe/>')).toBeUndefined();
    expect(() => assertNfseXmlMatchesDps('<NFSe/>', 'DPS1')).toThrow(
      'XML autorizado não contém NFSe/infNFSe/DPS/infDPS/@Id único',
    );
  });

  test.each([
    '<DPS><infDPS Id="DPS1"/></DPS>',
    '<NFSe><infNFSe/><DPS><infDPS Id="DPS1"/></DPS></NFSe>',
    '<NFSe><infNFSe><DPS><infDPS Id="DPS1"/><infDPS Id="DPS2"/></DPS></infNFSe></NFSe>',
    '<NFSe><infNFSe><DPS><infDPS Id="DPS1" ID="DPS2"/></DPS></infNFSe></NFSe>',
  ])('rejeita identificação da DPS fora da estrutura canônica ou ambígua', (xml) => {
    expect(extractDpsIdFromNfseXml(xml)).toBeUndefined();
  });

  test('não remove caracteres de texto fiscal antes do XML', () => {
    expect(sanitizeXmlText('serviço 😀')).toBe('serviço 😀');
    expect(sanitizeXmlText('serviço\u0001')).toBe('serviço\u0001');
  });
});
