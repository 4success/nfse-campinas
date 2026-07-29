import type { ConsultarDpsResult } from '../client/responseParser';
import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export class ConsultaDpsHttpError extends NfseCampinasV3Error {
  constructor(
    message: string,
    public readonly idDps: string,
    public readonly requestId: string,
    public readonly response?: ConsultarDpsResult,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ConsultaDpsHttpError';
  }
}
