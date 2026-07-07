import { XMLParser } from 'fast-xml-parser';

export type EnviarDpsMessage = {
  codigo?: string;
  descricao: string;
  campo?: string;
};

export type EnviarDpsResult = {
  status: 'autorizada' | 'rejeitada' | 'erro_http' | 'desconhecida';
  idDps: string;
  chaveAcesso?: string;
  numeroNfse?: string;
  codigoVerificacao?: string;
  nfseXmlGZipB64?: string;
  mensagens: EnviarDpsMessage[];
  parsedResponse: unknown;
  signedXml: string;
  rawRequest: string;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

export type ParseEnviarDpsResponseInput = {
  idDps: string;
  signedXml: string;
  rawRequest: string;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

function asString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
}

function localName(key: string): string {
  return key.includes(':') ? key.slice(key.lastIndexOf(':') + 1) : key;
}

function getByKey(value: Record<string, unknown>, keys: string[]): unknown {
  for (const key of Object.keys(value)) {
    if (keys.includes(localName(key))) {
      return value[key];
    }
  }
  return undefined;
}

function findFirstByKey(value: unknown, keys: string[]): unknown {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (keys.includes(localName(key))) {
      return record[key];
    }
    const nested = findFirstByKey(record[key], keys);
    if (nested !== undefined) {
      return nested;
    }
  }
  return undefined;
}

function hasKey(value: unknown, keys: string[]): boolean {
  return findFirstByKey(value, keys) !== undefined;
}

function isSuccessCStat(value: unknown): boolean {
  return asString(value) === '100';
}

function collectMessages(value: unknown): EnviarDpsMessage[] {
  const messages: EnviarDpsMessage[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') {
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }

    const record = node as Record<string, unknown>;
    const descricao = getByKey(record, ['descricao', 'xMotivo', 'mensagem', 'Message', 'message']);
    if (descricao && typeof descricao !== 'object') {
      messages.push({
        codigo: asString(getByKey(record, ['codigo', 'cStat', 'Code', 'code'])),
        descricao: String(descricao),
        campo: asString(getByKey(record, ['campo', 'field'])),
      });
    }
    Object.keys(record).forEach((key) => walk(record[key]));
  }

  walk(value);
  return messages;
}

function parseBody(rawResponse: string): unknown {
  const trimmed = rawResponse.trim();
  if (!trimmed) {
    return undefined;
  }
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }
  if (trimmed.startsWith('<')) {
    return new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', parseTagValue: false }).parse(trimmed);
  }
  return trimmed;
}

export function parseEnviarDpsResponse(input: ParseEnviarDpsResponseInput): EnviarDpsResult {
  let parsed: unknown;
  try {
    parsed = parseBody(input.rawResponse);
  } catch (error) {
    parsed = input.rawResponse;
  }

  const mensagens = collectMessages(parsed);
  const chaveAcesso = asString(findFirstByKey(parsed, ['chaveAcesso', 'chNFSe', 'ChaveAcesso']));
  const numeroNfse = asString(findFirstByKey(parsed, ['numeroNfse', 'nNFSe', 'NumeroNfse']));
  const codigoVerificacao = asString(findFirstByKey(parsed, ['codigoVerificacao', 'cVerif', 'CodigoVerificacao']));
  const nfseXmlGZipB64 = asString(findFirstByKey(parsed, ['nfseXmlGZipB64']));
  const cStat = findFirstByKey(parsed, ['cStat']);
  const hasSuccessFields = Boolean(
    chaveAcesso || numeroNfse || codigoVerificacao || nfseXmlGZipB64 || isSuccessCStat(cStat),
  );
  const hasStructuredErrors = hasKey(parsed, ['erros', 'erro', 'mensagens', 'listaMensagens', 'ListaMensagemRetorno']);
  let status: EnviarDpsResult['status'] = 'desconhecida';

  if (input.httpStatus < 200 || input.httpStatus >= 300) {
    status = 'erro_http';
  } else if (hasSuccessFields) {
    status = 'autorizada';
  } else if (hasStructuredErrors || mensagens.length > 0) {
    status = 'rejeitada';
  }

  return {
    status,
    idDps: input.idDps,
    chaveAcesso,
    numeroNfse,
    codigoVerificacao,
    nfseXmlGZipB64,
    mensagens,
    parsedResponse: parsed,
    signedXml: input.signedXml,
    rawRequest: input.rawRequest,
    rawResponse: input.rawResponse,
    httpStatus: input.httpStatus,
    headers: input.headers,
  };
}
