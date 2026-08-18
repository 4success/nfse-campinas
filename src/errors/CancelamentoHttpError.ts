import type { CancelarNfseResult } from '../client/responseParser';
import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export class CancelamentoHttpError extends NfseCampinasV3Error {
  constructor(
    message: string,
    public readonly chaveAcesso: string,
    public readonly requestId: string,
    public readonly response?: CancelarNfseResult,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'CancelamentoHttpError';
  }
}
