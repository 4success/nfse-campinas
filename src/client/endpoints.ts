import { NfseCampinasV3Environment } from '../dps/types';

export const HOMOLOGACAO_DPS_ENDPOINT = 'https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse';
export const HOMOLOGACAO_CONSULTA_ENDPOINT = HOMOLOGACAO_DPS_ENDPOINT;
export const HOMOLOGACAO_CONSULTA_DPS_ENDPOINT = 'https://preprod-nfseapi.ima.sp.gov.br/notafiscal-ws/nfse/dps';
export const HOMOLOGACAO_EVENTOS_ENDPOINT = HOMOLOGACAO_CONSULTA_ENDPOINT;
export const PRODUCAO_DPS_ENDPOINT = 'https://nfseapi.campinas.sp.gov.br/notafiscal-ws/nfse';
export const PRODUCAO_CONSULTA_ENDPOINT = PRODUCAO_DPS_ENDPOINT;
export const PRODUCAO_CONSULTA_DPS_ENDPOINT = 'https://nfseapi.campinas.sp.gov.br/notafiscal-ws/nfse/dps';
export const PRODUCAO_EVENTOS_ENDPOINT = PRODUCAO_CONSULTA_ENDPOINT;

export type NfseCampinasV3Endpoints = Partial<{
  dps: string;
  consulta: string;
  /** Base da consulta por DPS, sem o identificador. Tem prioridade sobre o override legado de dps. */
  consultaDps: string;
  eventos: string;
}>;

export function resolveDpsEndpoint(
  environment: NfseCampinasV3Environment,
  endpoints: NfseCampinasV3Endpoints = {},
): string {
  if (endpoints.dps) {
    return endpoints.dps;
  }
  if (environment === 'homologacao') {
    return HOMOLOGACAO_DPS_ENDPOINT;
  }
  return PRODUCAO_DPS_ENDPOINT;
}

export function resolveConsultaEndpoint(
  environment: NfseCampinasV3Environment,
  endpoints: NfseCampinasV3Endpoints = {},
): string {
  if (endpoints.consulta) {
    return endpoints.consulta;
  }
  if (environment === 'homologacao') {
    return HOMOLOGACAO_CONSULTA_ENDPOINT;
  }
  return PRODUCAO_CONSULTA_ENDPOINT;
}

export function resolveConsultaDpsEndpoint(
  environment: NfseCampinasV3Environment,
  endpoints: NfseCampinasV3Endpoints = {},
): string {
  if (endpoints.consultaDps) {
    return endpoints.consultaDps;
  }
  // Preserva configurações antigas que usam o mesmo endpoint personalizado para envio e consulta.
  if (endpoints.dps) {
    return endpoints.dps;
  }
  if (environment === 'homologacao') {
    return HOMOLOGACAO_CONSULTA_DPS_ENDPOINT;
  }
  return PRODUCAO_CONSULTA_DPS_ENDPOINT;
}

export function resolveEventosEndpoint(
  environment: NfseCampinasV3Environment,
  endpoints: NfseCampinasV3Endpoints = {},
): string {
  if (endpoints.eventos) {
    return endpoints.eventos;
  }
  if (environment === 'homologacao') {
    return HOMOLOGACAO_EVENTOS_ENDPOINT;
  }
  return PRODUCAO_EVENTOS_ENDPOINT;
}
