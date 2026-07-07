import axios, { AxiosError, AxiosResponse } from 'axios';
import https from 'https';
import { gzipSync } from 'zlib';
import { HttpError } from '../errors/HttpError';
import { parseEnviarDpsResponse, EnviarDpsResult } from './responseParser';

export type CampinasDpsClientOptions = {
  endpoint: string;
  certificate?: Buffer;
  certPassword?: string;
  clientKeyPem?: string;
  clientCertPem?: string;
  timeoutMs?: number;
  requestHeaders?: Record<string, string>;
  transport?: {
    useClientCertificate?: boolean;
  };
};

export type SendSignedDpsInput = {
  signedXml: string;
  idDps: string;
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

    try {
      const response = await axios.post(this.options.endpoint, rawRequest, {
        headers,
        httpsAgent,
        timeout: input.timeoutMs || this.options.timeoutMs,
        responseType: 'text',
        transformResponse: [(data) => data],
      });

      return parseEnviarDpsResponse({
        idDps: input.idDps,
        signedXml: input.signedXml,
        rawRequest,
        rawResponse: String(response.data || ''),
        httpStatus: response.status,
        headers: normalizeHeaders(response.headers),
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const responseBody = axiosError.response?.data === undefined ? '' : `: ${String(axiosError.response.data)}`;
      const httpMessage = status ? `HTTP ${status}${responseBody}` : axiosError.message || 'erro HTTP desconhecido';
      throw new HttpError(
        `Falha ao enviar DPS ${input.idDps}: ${httpMessage}`,
        input.idDps,
        input.signedXml,
        requestId,
        error,
      );
    }
  }
}
