import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export class NotImplementedError extends NfseCampinasV3Error {
  constructor(operation: string) {
    super(`${operation}: endpoint ainda não publicado pela Prefeitura de Campinas`);
    this.name = 'NotImplementedError';
  }
}
