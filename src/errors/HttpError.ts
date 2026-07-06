import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export class HttpError extends NfseCampinasV3Error {
  constructor(
    message: string,
    public readonly idDps: string,
    public readonly signedXml: string,
    public readonly requestId: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
