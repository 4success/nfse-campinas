import { MissingProductionEndpointError } from '../errors/MissingProductionEndpointError';
import { NfseCampinasV3Environment } from '../dps/types';

export const HOMOLOGACAO_DPS_ENDPOINT = 'https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/dps';

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
