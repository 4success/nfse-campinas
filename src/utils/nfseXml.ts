import { XMLParser } from 'fast-xml-parser';
import { gunzipSync } from 'zlib';
import { ValidationError } from '../errors/ValidationError';

export function decodeNfseXmlGZipB64(nfseXmlGZipB64: string): string {
  return gunzipSync(Buffer.from(nfseXmlGZipB64, 'base64')).toString('utf8');
}

function localName(key: string): string {
  return key.includes(':') ? key.slice(key.lastIndexOf(':') + 1) : key;
}

function getSingleChild(value: unknown, expectedLocalName: string): unknown {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  if (Array.isArray(value)) {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const matches = Object.entries(record).filter(([key]) => localName(key) === expectedLocalName);
  if (matches.length !== 1 || Array.isArray(matches[0][1])) {
    return undefined;
  }
  return matches[0][1];
}

export function extractDpsIdFromNfseXml(xml: string): string | undefined {
  try {
    const parsed = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: false,
      parseTagValue: false,
    }).parse(xml);
    const nfse = getSingleChild(parsed, 'NFSe');
    const infNfse = getSingleChild(nfse, 'infNFSe');
    const dps = getSingleChild(infNfse, 'DPS');
    const infDps = getSingleChild(dps, 'infDPS');
    if (!infDps || typeof infDps !== 'object' || Array.isArray(infDps)) {
      return undefined;
    }

    const attributes = infDps as Record<string, unknown>;
    const ids = [attributes['@_Id'], attributes['@_ID']].filter(
      (value) => value !== undefined && value !== null && String(value) !== '',
    );
    return ids.length === 1 ? String(ids[0]) : undefined;
  } catch (_error) {
    return undefined;
  }
}

export function assertNfseXmlMatchesDps(xml: string, expectedDpsId: string): void {
  const actualDpsId = extractDpsIdFromNfseXml(xml);
  if (!actualDpsId) {
    throw new ValidationError([
      {
        field: 'idDps',
        message: 'XML autorizado não contém NFSe/infNFSe/DPS/infDPS/@Id único',
        severity: 'error',
      },
    ]);
  }
  if (actualDpsId !== expectedDpsId) {
    throw new ValidationError([
      {
        field: 'idDps',
        message: `XML autorizado pertence à DPS ${actualDpsId}, não à DPS ${expectedDpsId}`,
        severity: 'error',
      },
    ]);
  }
}
