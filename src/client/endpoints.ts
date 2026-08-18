import { NfseCampinasV3Environment } from '../dps/types';
import { MissingProductionEndpointError } from '../errors/MissingProductionEndpointError';

export const HOMOLOGACAO_DPS_ENDPOINT = 'https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps';
export const HOMOLOGACAO_CONSULTA_ENDPOINT = 'https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse';
export const HOMOLOGACAO_CONSULTA_DPS_ENDPOINT = HOMOLOGACAO_DPS_ENDPOINT;
export const HOMOLOGACAO_EVENTOS_ENDPOINT = HOMOLOGACAO_CONSULTA_ENDPOINT;
export const PRODUCAO_DPS_ENDPOINT = 'https://novanfse.campinas.sp.gov.br/notafiscal-adn-ws/api/adn/dps';
export const PRODUCAO_CONSULTA_ENDPOINT = 'https://novanfse.campinas.sp.gov.br/notafiscal-adn-ws/api/adn/nfse';
export const PRODUCAO_CONSULTA_DPS_ENDPOINT = PRODUCAO_DPS_ENDPOINT;

export type NfseCampinasV3Endpoints = Partial<{
  dps: string;
  consulta: string;
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
  throw new MissingProductionEndpointError('eventos de NFSe', 'eventos');
}
