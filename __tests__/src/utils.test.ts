import { gzipSync } from 'zlib';
import { formatDecimal, roundHalfEven } from '../../src/utils/decimals';
import { isIsoDate, isIsoDateTimeWithTimezone } from '../../src/utils/dates';
import { decodeNfseXmlGZipB64 } from '../../src/utils/nfseXml';
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
    expect(isIsoDateTimeWithTimezone('2026-06-30T21:41:28-03:00')).toBe(true);
    expect(isIsoDateTimeWithTimezone('2026-06-30T21:41:28Z')).toBe(true);
    expect(isIsoDateTimeWithTimezone('2026-13-40T99:99:99-03:00')).toBe(false);
  });

  test('decodifica XML da NFSe retornado em gzip base64', () => {
    const nfseXml = '<NFSe><infNFSe Id="NFSe1" /></NFSe>';
    const nfseXmlGZipB64 = gzipSync(Buffer.from(nfseXml, 'utf8')).toString('base64');

    expect(decodeNfseXmlGZipB64(nfseXmlGZipB64)).toBe(nfseXml);
  });

  test('não remove caracteres de texto fiscal antes do XML', () => {
    expect(sanitizeXmlText('serviço 😀')).toBe('serviço 😀');
    expect(sanitizeXmlText('serviço\u0001')).toBe('serviço\u0001');
  });
});
