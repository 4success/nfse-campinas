import { isIsoDate, isIsoDateTimeWithTimezone } from '../utils/dates';
import { ValidationIssue } from '../errors/ValidationError';
import { buildDpsId } from './buildDpsId';
import { DpsInput } from './types';
import {
  normalizeCodigoTributacaoMunicipal,
  normalizeCodigoTributacaoNacional,
  normalizeCnpj,
  normalizeCpf,
  normalizeMunicipio,
  normalizeNbs,
  normalizeNumeroDps,
  normalizeSerie,
} from './normalize';

const DPS_ID_PATTERN = /^DPS\d{7}(?:1\d{14}|2[A-Z0-9]{12}\d{2})\d{20}$/;

function pushIssue(
  issues: ValidationIssue[],
  field: string,
  message: string,
  severity: ValidationIssue['severity'] = 'error',
) {
  issues.push({ field, message, severity });
}

function hasCpfOrCnpj(entity: { cpf?: string; cnpj?: string } | undefined, field: string, issues: ValidationIssue[]) {
  if (!entity) {
    pushIssue(issues, field, 'grupo obrigatório');
    return;
  }

  validateCpfCnpjWhenPresent(entity, field, issues);

  if (!entity.cpf && !entity.cnpj) {
    pushIssue(issues, field, 'informe CPF ou CNPJ');
  }
}

function validateCpfCnpjWhenPresent(
  entity: { cpf?: string; cnpj?: string } | undefined,
  field: string,
  issues: ValidationIssue[],
) {
  if (!entity) {
    return;
  }

  const hasCpf = entity.cpf !== undefined && entity.cpf !== '';
  const hasCnpj = entity.cnpj !== undefined && entity.cnpj !== '';

  if (hasCpf && hasCnpj) {
    pushIssue(issues, field, 'informe CPF ou CNPJ, não ambos');
  }

  if (hasCpf) {
    try {
      normalizeCpf(entity.cpf!);
    } catch (error) {
      pushIssue(issues, `${field}.cpf`, (error as Error).message);
    }
  }
  if (hasCnpj) {
    try {
      normalizeCnpj(entity.cnpj!);
    } catch (error) {
      pushIssue(issues, `${field}.cnpj`, (error as Error).message);
    }
  }
}

function validateEnderecoMunicipioWhenPresent(
  entity: { endereco?: { municipio?: string } } | undefined,
  field: string,
  issues: ValidationIssue[],
) {
  if (!entity?.endereco) {
    return;
  }
  try {
    normalizeMunicipio(entity.endereco.municipio || '');
  } catch (error) {
    pushIssue(issues, `${field}.endereco.municipio`, (error as Error).message);
  }
}

function validateIdDpsWhenPresent(input: DpsInput, issues: ValidationIssue[]) {
  if (!input.idDps) {
    return;
  }
  if (!DPS_ID_PATTERN.test(input.idDps)) {
    pushIssue(issues, 'idDps', 'deve seguir o formato de Id da DPS');
    return;
  }

  const hasCpf = input.prestador?.cpf !== undefined && input.prestador.cpf !== '';
  const hasCnpj = input.prestador?.cnpj !== undefined && input.prestador.cnpj !== '';
  if (hasCpf === hasCnpj) {
    return;
  }

  try {
    const expectedId = buildDpsId({
      codigoMunicipioEmissao: input.municipioEmissao,
      tipoInscricaoFederal: hasCnpj ? '2' : '1',
      inscricaoFederal: hasCnpj ? input.prestador.cnpj! : input.prestador.cpf!,
      serie: input.serie,
      numeroDps: input.numeroDps,
    });

    if (input.idDps !== expectedId) {
      pushIssue(issues, 'idDps', 'deve corresponder aos dados da DPS');
    }
  } catch (_error) {
    return;
  }
}

export function ambienteToTpAmb(ambiente: DpsInput['ambiente']): 1 | 2 {
  if (ambiente === 'producao' || ambiente === 1) {
    return 1;
  }
  return 2;
}

export function validateDpsInput(input: DpsInput): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const dhEmi =
    input.dataHoraEmissao instanceof Date
      ? Number.isNaN(input.dataHoraEmissao.getTime())
        ? undefined
        : input.dataHoraEmissao.toISOString()
      : input.dataHoraEmissao;
  const dCompet =
    input.dataCompetencia instanceof Date
      ? Number.isNaN(input.dataCompetencia.getTime())
        ? undefined
        : input.dataCompetencia.toISOString().slice(0, 10)
      : input.dataCompetencia;

  if (![1, 2, 'homologacao', 'producao', undefined].includes(input.ambiente)) {
    pushIssue(issues, 'ambiente', 'ambiente deve ser 1, 2, homologacao ou producao');
  }
  const tipoEmitente = input.tipoEmitente as unknown;
  if (tipoEmitente === undefined || tipoEmitente === null || tipoEmitente === '') {
    pushIssue(issues, 'tipoEmitente', 'tipo de emitente obrigatório');
  }
  validateIdDpsWhenPresent(input, issues);
  try {
    normalizeSerie(input.serie);
  } catch (error) {
    pushIssue(issues, 'serie', (error as Error).message);
  }
  try {
    normalizeNumeroDps(input.numeroDps);
  } catch (error) {
    pushIssue(issues, 'numeroDps', (error as Error).message);
  }
  if (!isIsoDateTimeWithTimezone(dhEmi)) {
    pushIssue(issues, 'dataHoraEmissao', 'deve estar em ISO 8601 com timezone');
  }
  if (!isIsoDate(dCompet)) {
    pushIssue(issues, 'dataCompetencia', 'deve estar em YYYY-MM-DD');
  }
  try {
    normalizeMunicipio(input.municipioEmissao);
  } catch (error) {
    pushIssue(issues, 'municipioEmissao', (error as Error).message);
  }

  hasCpfOrCnpj(input.prestador, 'prestador', issues);
  validateCpfCnpjWhenPresent(input.tomador, 'tomador', issues);
  validateCpfCnpjWhenPresent(input.destinatario, 'destinatario', issues);
  validateEnderecoMunicipioWhenPresent(input.tomador, 'tomador', issues);
  validateEnderecoMunicipioWhenPresent(input.destinatario, 'destinatario', issues);

  if (!input.servico) {
    pushIssue(issues, 'servico', 'grupo obrigatório');
  } else {
    try {
      normalizeMunicipio(input.servico.municipioPrestacao);
    } catch (error) {
      pushIssue(issues, 'servico.municipioPrestacao', (error as Error).message);
    }
    try {
      if (!/^\d{6}$/.test(normalizeCodigoTributacaoNacional(input.servico.codigoTributacaoNacional || ''))) {
        pushIssue(issues, 'servico.codigoTributacaoNacional', 'deve ter 6 dígitos');
      }
    } catch (error) {
      pushIssue(issues, 'servico.codigoTributacaoNacional', (error as Error).message);
    }
    if (input.servico.codigoTributacaoMunicipal) {
      try {
        normalizeCodigoTributacaoMunicipal(input.servico.codigoTributacaoMunicipal);
      } catch (error) {
        pushIssue(issues, 'servico.codigoTributacaoMunicipal', (error as Error).message);
      }
    }
    if (input.servico.codigoNbs && !/^\d{9}$/.test(normalizeNbs(input.servico.codigoNbs))) {
      pushIssue(issues, 'servico.codigoNbs', 'deve ter 9 dígitos', 'warning');
    }
    if (!input.servico.descricao) {
      pushIssue(issues, 'servico.descricao', 'descrição obrigatória');
    }
  }

  if (!input.valores || input.valores.valorServico === undefined) {
    pushIssue(issues, 'valores.valorServico', 'valor do serviço obrigatório');
  }

  return issues;
}
