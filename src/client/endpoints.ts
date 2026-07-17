import { MissingProductionEndpointError } from '../errors/MissingProductionEndpointError';
import { NfseCampinasV3Environment } from '../dps/types';

export const HOMOLOGACAO_DPS_ENDPOINT = 'https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps';
export const HOMOLOGACAO_CONSULTA_ENDPOINT = 'https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse';

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
  throw new MissingProductionEndpointError();
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
  throw new MissingProductionEndpointError('consulta', 'consulta');
}
