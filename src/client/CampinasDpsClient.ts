import axios, { AxiosError, AxiosResponse } from 'axios';
import https from 'https';
import { HttpError } from '../errors/HttpError';
import { parseEnviarDpsResponse, EnviarDpsResult } from './responseParser';

export type CampinasDpsClientOptions = {
  endpoint: string;
  certificate?: Buffer;
  certPassword?: string;
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

export class CampinasDpsClient {
  constructor(private readonly options: CampinasDpsClientOptions) {}

  async sendSignedDps(input: SendSignedDpsInput): Promise<EnviarDpsResult> {
    const requestId = `dps-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const headers = {
      'Content-Type': 'application/xml; charset=utf-8',
      Accept: 'application/xml, application/json, text/plain, */*',
      ...this.options.requestHeaders,
    };
    const useClientCertificate = this.options.transport?.useClientCertificate !== false;
    const httpsAgent =
      useClientCertificate && this.options.certificate
        ? new https.Agent({
            pfx: this.options.certificate,
            passphrase: this.options.certPassword,
            rejectUnauthorized: true,
          })
        : undefined;

    try {
      const response = await axios.post(this.options.endpoint, input.signedXml, {
        headers,
        httpsAgent,
        timeout: input.timeoutMs || this.options.timeoutMs,
        responseType: 'text',
        transformResponse: [(data) => data],
        validateStatus: () => true,
      });

      return parseEnviarDpsResponse({
        idDps: input.idDps,
        signedXml: input.signedXml,
        rawRequest: input.signedXml,
        rawResponse: String(response.data || ''),
        httpStatus: response.status,
        headers: normalizeHeaders(response.headers),
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new HttpError(
        `Falha ao enviar DPS ${input.idDps}: ${axiosError.message || 'erro HTTP desconhecido'}`,
        input.idDps,
        input.signedXml,
        requestId,
        error,
      );
    }
  }
}
