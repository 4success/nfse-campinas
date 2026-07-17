import { NfseCampinasV3Error } from './NfseCampinasV3Error';
import type { ConsultarNfseResult } from '../client/responseParser';

export class ConsultaHttpError extends NfseCampinasV3Error {
  constructor(
    message: string,
    public readonly chaveAcesso: string,
    public readonly requestId: string,
    public readonly response?: ConsultarNfseResult,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ConsultaHttpError';
  }
}
