import axios, { AxiosError, AxiosResponse } from 'axios';
import https from 'https';
import { gzipSync } from 'zlib';
import { HttpError } from '../errors/HttpError';
import { ConsultaHttpError } from '../errors/ConsultaHttpError';
import {
  ConsultarNfseResult,
  EnviarDpsResult,
  parseConsultarNfseResponse,
  parseEnviarDpsResponse,
} from './responseParser';
import { createHttpTracer, formatTraceBody, HttpTraceLogger } from './httpTrace';

export type CampinasDpsClientOptions = {
  endpoint: string;
  certificate?: Buffer;
  certPassword?: string;
  clientKeyPem?: string;
  clientCertPem?: string;
  timeoutMs?: number;
  requestHeaders?: Record<string, string>;
  debug?: boolean;
  traceLogger?: HttpTraceLogger;
  transport?: {
    useClientCertificate?: boolean;
  };
};

export type SendSignedDpsInput = {
  signedXml: string;
  idDps: string;
  timeoutMs?: number;
};

export type ConsultarNfseInput = {
  chaveAcesso: string;
  timeoutMs?: number;
};

function normalizeHeaders(headers: AxiosResponse['headers']): Record<string, string | string[] | undefined> {
  const normalized: Record<string, string | string[] | undefined> = {};
  Object.keys(headers || {}).forEach((key) => {
    const value = headers[key];
    normalized[key] = Array.isArray(value) ? value.map(String) : value === undefined ? undefined : String(value);
  });
  return normalized;
}

function createHttpsAgent(options: CampinasDpsClientOptions): https.Agent | undefined {
  const useClientCertificate = options.transport?.useClientCertificate !== false;
  if (!useClientCertificate) {
    return undefined;
  }
  if (options.clientKeyPem && options.clientCertPem) {
    return new https.Agent({
      key: options.clientKeyPem,
      cert: options.clientCertPem,
      rejectUnauthorized: true,
    });
  }
  if (options.certificate) {
    return new https.Agent({
      pfx: options.certificate,
      passphrase: options.certPassword,
      rejectUnauthorized: true,
    });
  }
  return undefined;
}

export class CampinasDpsClient {
  constructor(private readonly options: CampinasDpsClientOptions) {}

  async sendSignedDps(input: SendSignedDpsInput): Promise<EnviarDpsResult> {
    const requestId = `dps-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const rawRequest = JSON.stringify({ dpsXmlGZipB64: gzipSync(input.signedXml).toString('base64') });
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/xml, application/json, text/plain, */*',
      ...this.options.requestHeaders,
    };
    const httpsAgent = createHttpsAgent(this.options);
    const tracer = createHttpTracer({ enabled: this.options.debug, logger: this.options.traceLogger });
    const startedAt = Date.now();

    await tracer.logRequest({
      timestamp: new Date().toISOString(),
      requestId,
      idDps: input.idDps,
      method: 'POST',
      url: this.options.endpoint,
      headers,
      body: formatTraceBody(rawRequest),
      signedXml: input.signedXml,
    });

    try {
      const response = await axios.post(this.options.endpoint, rawRequest, {
        headers,
        httpsAgent,
        timeout: input.timeoutMs || this.options.timeoutMs,
        responseType: 'text',
        transformResponse: [(data) => data],
      });
      const normalizedHeaders = normalizeHeaders(response.headers);

      await tracer.logResponse({
        timestamp: new Date().toISOString(),
        requestId,
        idDps: input.idDps,
        durationMs: Date.now() - startedAt,
        status: response.status,
        headers: normalizedHeaders,
        body: formatTraceBody(String(response.data || '')),
      });

      return parseEnviarDpsResponse({
        idDps: input.idDps,
        signedXml: input.signedXml,
        rawRequest,
        rawResponse: String(response.data || ''),
        httpStatus: response.status,
        headers: normalizedHeaders,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const responseBody = axiosError.response?.data === undefined ? '' : `: ${String(axiosError.response.data)}`;
      const httpMessage = status ? `HTTP ${status}${responseBody}` : axiosError.message || 'erro HTTP desconhecido';
      await tracer.logError({
        timestamp: new Date().toISOString(),
        requestId,
        idDps: input.idDps,
        durationMs: Date.now() - startedAt,
        message: axiosError.message || String(error),
        status,
        headers: axiosError.response ? normalizeHeaders(axiosError.response.headers) : undefined,
        body: axiosError.response?.data === undefined ? undefined : formatTraceBody(String(axiosError.response.data)),
      });
      throw new HttpError(
        `Falha ao enviar DPS ${input.idDps}: ${httpMessage}`,
        input.idDps,
        input.signedXml,
        requestId,
        error,
      );
    }
  }

  async consultarNfse(input: ConsultarNfseInput): Promise<ConsultarNfseResult> {
    const requestId = `consulta-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const endpoint = `${this.options.endpoint.replace(/\/+$/, '')}/${encodeURIComponent(input.chaveAcesso)}`;
    const headers = {
      Accept: 'application/json, application/xml, text/plain, */*',
      ...this.options.requestHeaders,
    };
    const httpsAgent = createHttpsAgent(this.options);
    const tracer = createHttpTracer({ enabled: this.options.debug, logger: this.options.traceLogger });
    const startedAt = Date.now();

    await tracer.logRequest({
      timestamp: new Date().toISOString(),
      requestId,
      chaveAcesso: input.chaveAcesso,
      method: 'GET',
      url: endpoint,
      headers,
    });

    try {
      const response = await axios.get(endpoint, {
        headers,
        httpsAgent,
        timeout: input.timeoutMs || this.options.timeoutMs,
        responseType: 'text',
        transformResponse: [(data) => data],
      });
      const normalizedHeaders = normalizeHeaders(response.headers);
      const rawResponse = String(response.data || '');

      await tracer.logResponse({
        timestamp: new Date().toISOString(),
        requestId,
        chaveAcesso: input.chaveAcesso,
        durationMs: Date.now() - startedAt,
        status: response.status,
        headers: normalizedHeaders,
        body: formatTraceBody(rawResponse),
      });

      return parseConsultarNfseResponse({
        chaveAcesso: input.chaveAcesso,
        rawResponse,
        httpStatus: response.status,
        headers: normalizedHeaders,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const responseBody = axiosError.response?.data === undefined ? '' : `: ${String(axiosError.response.data)}`;
      const httpMessage = status ? `HTTP ${status}${responseBody}` : axiosError.message || 'erro HTTP desconhecido';
      await tracer.logError({
        timestamp: new Date().toISOString(),
        requestId,
        chaveAcesso: input.chaveAcesso,
        durationMs: Date.now() - startedAt,
        message: axiosError.message || String(error),
        status,
        headers: axiosError.response ? normalizeHeaders(axiosError.response.headers) : undefined,
        body: axiosError.response?.data === undefined ? undefined : formatTraceBody(String(axiosError.response.data)),
      });
      throw new ConsultaHttpError(
        `Falha ao consultar NFSe ${input.chaveAcesso}: ${httpMessage}`,
        input.chaveAcesso,
        requestId,
        axiosError.response
          ? parseConsultarNfseResponse({
              chaveAcesso: input.chaveAcesso,
              rawResponse: String(axiosError.response.data || ''),
              httpStatus: axiosError.response.status,
              headers: normalizeHeaders(axiosError.response.headers),
            })
          : undefined,
        error,
      );
    }
  }
}
