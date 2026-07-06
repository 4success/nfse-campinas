import { NfseCampinasV3Error } from './NfseCampinasV3Error';

export type ValidationIssueSeverity = 'error' | 'warning';

export type ValidationIssue = {
  field: string;
  message: string;
  severity: ValidationIssueSeverity;
};

export class ValidationError extends NfseCampinasV3Error {
  constructor(public readonly issues: ValidationIssue[]) {
    super(`DPS inválida: ${issues.map((issue) => `${issue.field}: ${issue.message}`).join('; ')}`);
    this.name = 'ValidationError';
  }
}
