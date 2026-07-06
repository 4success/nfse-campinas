import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export class MissingProductionEndpointError extends NfseCampinasV3Error {
  constructor() {
    super(
      'Endpoint de produção da DPS ainda não publicado pela Prefeitura de Campinas. Informe endpoints.dps explicitamente.',
    );
    this.name = 'MissingProductionEndpointError';
  }
}
