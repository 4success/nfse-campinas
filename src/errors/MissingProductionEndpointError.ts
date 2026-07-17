import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export class MissingProductionEndpointError extends NfseCampinasV3Error {
  constructor(resource = 'DPS', endpointProperty = 'dps') {
    super(
      `Endpoint de produção da ${resource} ainda não publicado pela Prefeitura de Campinas. Informe endpoints.${endpointProperty} explicitamente.`,
    );
    this.name = 'MissingProductionEndpointError';
  }
}
