import { DateTime } from 'luxon';
import { ValidationIssue } from '../errors/ValidationError';
import { normalizeCnpj, normalizeCpf } from '../dps/normalize';
import { CancelamentoNfseXmlBuilderContext, CancelarNfseDadosInput } from './types';

const CHAVE_ACESSO_NFSE_PATTERN = /^\d{8}(?:1\d{14}|2[A-Z0-9]{12}\d{2})\d{27}$/;

function pushIssue(issues: ValidationIssue[], field: string, message: string) {
  issues.push({ field, message, severity: 'error' });
}

export function normalizeChaveAcessoNfse(value: string): string {
  const chaveAcesso = value.startsWith('NFS') ? value.slice(3) : value;

  if (!CHAVE_ACESSO_NFSE_PATTERN.test(chaveAcesso)) {
    throw new Error('deve conter uma chave de 50 caracteres no formato nacional, com o prefixo NFS opcional');
  }

  return chaveAcesso;
}

export function isValidDataHoraEvento(value: unknown): value is string | Date {
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }

  return typeof value === 'string' && value.includes('T') && DateTime.fromISO(value, { setZone: true }).isValid;
}

export function formatDataHoraEvento(value: string | Date): string {
  if (value instanceof Date) {
    return `${value.toISOString().slice(0, 19)}+00:00`;
  }

  return value;
}

export function validateCancelarNfseDadosInput(
  input: CancelarNfseDadosInput,
  context: CancelamentoNfseXmlBuilderContext,
  dataHoraEvento: unknown,
  versaoAplicativo: unknown,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const candidate = input as CancelarNfseDadosInput | undefined;

  if (!candidate || typeof candidate.chaveAcesso !== 'string') {
    pushIssue(issues, 'chaveAcesso', 'deve ser uma string');
  } else {
    try {
      normalizeChaveAcessoNfse(candidate.chaveAcesso);
    } catch (error) {
      pushIssue(issues, 'chaveAcesso', (error as Error).message);
    }
  }

  const autor = candidate?.autor as Record<string, unknown> | undefined;
  if (!autor || typeof autor !== 'object') {
    pushIssue(issues, 'autor', 'informe CPF ou CNPJ');
  } else {
    const hasCpf = autor.cpf !== undefined;
    const hasCnpj = autor.cnpj !== undefined;

    if (hasCpf === hasCnpj) {
      pushIssue(issues, 'autor', 'informe CPF ou CNPJ, não ambos');
    } else if (hasCpf) {
      if (typeof autor.cpf !== 'string') {
        pushIssue(issues, 'autor.cpf', 'deve ser uma string');
      } else {
        try {
          normalizeCpf(autor.cpf);
        } catch (error) {
          pushIssue(issues, 'autor.cpf', (error as Error).message);
        }
      }
    } else if (typeof autor.cnpj !== 'string') {
      pushIssue(issues, 'autor.cnpj', 'deve ser uma string');
    } else {
      try {
        normalizeCnpj(autor.cnpj);
      } catch (error) {
        pushIssue(issues, 'autor.cnpj', (error as Error).message);
      }
    }
  }

  if (![1, 2, 9].includes(candidate?.codigoMotivo as number)) {
    pushIssue(issues, 'codigoMotivo', 'deve ser 1, 2 ou 9');
  }

  if (typeof candidate?.motivo !== 'string' || candidate.motivo.length === 0) {
    pushIssue(issues, 'motivo', 'deve ser uma string não vazia');
  }

  if (!isValidDataHoraEvento(dataHoraEvento)) {
    pushIssue(issues, 'dataHoraEvento', 'deve conter uma data/hora ISO 8601 válida');
  }

  if (typeof versaoAplicativo !== 'string' || versaoAplicativo.length === 0) {
    pushIssue(issues, 'versaoAplicativo', 'deve ser uma string não vazia');
  }

  if (!['homologacao', 'producao'].includes(context.ambiente)) {
    pushIssue(issues, 'ambiente', 'deve ser homologacao ou producao');
  }

  return issues;
}
