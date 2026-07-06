export class NfseCampinasV3Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NfseCampinasV3Error';
  }
}
