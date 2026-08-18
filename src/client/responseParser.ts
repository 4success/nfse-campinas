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

export type ConsultarNfseAlerta = {
  codigo?: string;
  mensagem: string;
};

export type ConsultarNfseResult = {
  chaveAcesso: string;
  tipoAmbiente?: string;
  versaoAplicativo?: string;
  dataHoraProcessamento?: string;
  nfseXmlGZipB64?: string;
  alertas: ConsultarNfseAlerta[];
  parsedResponse: unknown;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

export type ParseConsultarNfseResponseInput = {
  chaveAcesso: string;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

export type ConsultarDpsResult = {
  idDps: string;
  chaveAcesso?: string;
  tipoAmbiente?: string;
  versaoAplicativo?: string;
  dataHoraProcessamento?: string;
  alertas: ConsultarNfseAlerta[];
  parsedResponse: unknown;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

export type ParseConsultarDpsResponseInput = {
  idDps: string;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

export type CancelarNfseAlerta = {
  codigo?: string;
  mensagem: string;
  complemento?: string;
};

export type CancelarNfseResult = {
  chaveAcesso: string;
  tipoAmbiente?: string;
  versaoAplicativo?: string;
  dataHoraProcessamento?: string;
  eventoXmlGZipB64?: string;
  nfseXmlGZipB64?: string;
  alertas: CancelarNfseAlerta[];
  parsedResponse: unknown;
  signedXml: string;
  rawRequest: string;
  rawResponse: string;
  httpStatus: number;
  headers: Record<string, string | string[] | undefined>;
};

export type ParseCancelarNfseResponseInput = {
  chaveAcesso: string;
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

function isAccessKey(value: string | undefined): value is string {
  return Boolean(value && (/^NFS[A-Z0-9]{50}$/.test(value) || /^[A-Z0-9]{50}$/.test(value)));
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

function collectAlertas(value: unknown): ConsultarNfseAlerta[] {
  const alertas = findFirstByKey(value, ['alertas']);
  if (!Array.isArray(alertas)) {
    return [];
  }

  return alertas.flatMap((alerta) => {
    if (!alerta || typeof alerta !== 'object') {
      return [];
    }
    const record = alerta as Record<string, unknown>;
    const mensagem = getByKey(record, ['mensagem', 'message']);
    if (!mensagem || typeof mensagem === 'object') {
      return [];
    }
    return [{ codigo: asString(getByKey(record, ['codigo', 'code'])), mensagem: String(mensagem) }];
  });
}

function collectConsultaAlertas(value: unknown): ConsultarNfseAlerta[] {
  const alertas = collectAlertas(value);
  if (alertas.length > 0) {
    return alertas;
  }
  return collectMessages(value).map((message) => ({
    codigo: message.codigo,
    mensagem: message.descricao,
  }));
}

function collectCancelamentoAlertas(value: unknown): CancelarNfseAlerta[] {
  const container = findFirstByKey(value, [
    'alertas',
    'Alertas',
    'erros',
    'Erros',
    'erro',
    'Erro',
    'mensagens',
    'Mensagens',
  ]);
  const items = Array.isArray(container) ? container : container && typeof container === 'object' ? [container] : [];
  const alertas = items.flatMap((item): CancelarNfseAlerta[] => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const record = item as Record<string, unknown>;
    const mensagem = getByKey(record, ['mensagem', 'Mensagem', 'descricao', 'Descricao', 'message', 'Message']);
    if (!mensagem || typeof mensagem === 'object') {
      return [];
    }

    const codigo = asString(getByKey(record, ['codigo', 'Codigo', 'code', 'Code']));
    const complemento = asString(getByKey(record, ['complemento', 'Complemento']));
    return [
      {
        ...(codigo === undefined ? {} : { codigo }),
        mensagem: String(mensagem),
        ...(complemento === undefined ? {} : { complemento }),
      },
    ];
  });

  if (alertas.length > 0) {
    return alertas;
  }

  return collectMessages(value).map((message) => ({
    ...(message.codigo === undefined ? {} : { codigo: message.codigo }),
    mensagem: message.descricao,
  }));
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

export function parseConsultarNfseResponse(input: ParseConsultarNfseResponseInput): ConsultarNfseResult {
  let parsed: unknown;
  try {
    parsed = parseBody(input.rawResponse);
  } catch (_error) {
    parsed = input.rawResponse;
  }

  return {
    chaveAcesso: input.chaveAcesso,
    tipoAmbiente: asString(findFirstByKey(parsed, ['tipoAmbiente'])),
    versaoAplicativo: asString(findFirstByKey(parsed, ['versaoAplicativo'])),
    dataHoraProcessamento: asString(findFirstByKey(parsed, ['dataHoraProcessamento'])),
    nfseXmlGZipB64: asString(findFirstByKey(parsed, ['nfseXmlGZipB64'])),
    alertas: collectAlertas(parsed),
    parsedResponse: parsed,
    rawResponse: input.rawResponse,
    httpStatus: input.httpStatus,
    headers: input.headers,
  };
}

export function parseConsultarDpsResponse(input: ParseConsultarDpsResponseInput): ConsultarDpsResult {
  let parsed: unknown;
  try {
    parsed = parseBody(input.rawResponse);
  } catch (_error) {
    parsed = input.rawResponse;
  }

  const structuredAccessKey = asString(findFirstByKey(parsed, ['chaveAcesso', 'chNFSe', 'ChaveAcesso']));
  const plainAccessKeyCandidate = typeof parsed === 'string' ? parsed.trim().replace(/^"(.*)"$/, '$1') : undefined;
  const chaveAcesso = isAccessKey(structuredAccessKey)
    ? structuredAccessKey
    : isAccessKey(plainAccessKeyCandidate)
    ? plainAccessKeyCandidate
    : undefined;

  return {
    idDps: input.idDps,
    chaveAcesso,
    tipoAmbiente: asString(findFirstByKey(parsed, ['tipoAmbiente'])),
    versaoAplicativo: asString(findFirstByKey(parsed, ['versaoAplicativo'])),
    dataHoraProcessamento: asString(findFirstByKey(parsed, ['dataHoraProcessamento'])),
    alertas: collectConsultaAlertas(parsed),
    parsedResponse: parsed,
    rawResponse: input.rawResponse,
    httpStatus: input.httpStatus,
    headers: input.headers,
  };
}

export function parseCancelarNfseResponse(input: ParseCancelarNfseResponseInput): CancelarNfseResult {
  let parsed: unknown;
  try {
    parsed = parseBody(input.rawResponse);
  } catch (_error) {
    parsed = input.rawResponse;
  }

  return {
    chaveAcesso: input.chaveAcesso,
    tipoAmbiente: asString(findFirstByKey(parsed, ['tipoAmbiente'])),
    versaoAplicativo: asString(findFirstByKey(parsed, ['versaoAplicativo'])),
    dataHoraProcessamento: asString(findFirstByKey(parsed, ['dataHoraProcessamento'])),
    eventoXmlGZipB64: asString(findFirstByKey(parsed, ['eventoXmlGZipB64'])),
    nfseXmlGZipB64: asString(findFirstByKey(parsed, ['nfseXmlGZipB64'])),
    alertas: collectCancelamentoAlertas(parsed),
    parsedResponse: parsed,
    signedXml: input.signedXml,
    rawRequest: input.rawRequest,
    rawResponse: input.rawResponse,
    httpStatus: input.httpStatus,
    headers: input.headers,
  };
}
