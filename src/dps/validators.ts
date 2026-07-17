import { isIsoDate, isIsoDateTime } from '../utils/dates';
import { ValidationIssue } from '../errors/ValidationError';
import { buildDpsId } from './buildDpsId';
import { DpsInput } from './types';
import {
  normalizeCep,
  normalizeCnpj,
  normalizeCpf,
  normalizeMoney,
  normalizeMunicipio,
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
  entity: { endereco?: { municipio?: string; cep?: string } } | undefined,
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
  if (entity.endereco.cep !== undefined && entity.endereco.cep !== '') {
    try {
      normalizeCep(entity.endereco.cep);
    } catch (error) {
      pushIssue(issues, `${field}.endereco.cep`, (error as Error).message);
    }
  }
}

function validateMoneyWhenPresent(value: string | number | undefined, field: string, issues: ValidationIssue[]) {
  if (value === undefined) {
    return;
  }

  try {
    normalizeMoney(value);
  } catch (error) {
    pushIssue(issues, field, (error as Error).message, 'warning');
  }
}

function validateRequiredWhenPresent(value: unknown, field: string, issues: ValidationIssue[]) {
  if (value === undefined || value === null || value === '') {
    pushIssue(issues, field, 'campo obrigatório');
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
  if (!isIsoDateTime(dhEmi)) {
    pushIssue(issues, 'dataHoraEmissao', 'deve estar em ISO 8601');
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
    const codigoTributacaoNacional = input.servico.codigoTributacaoNacional || '';
    if (!/^\d{6}$/.test(codigoTributacaoNacional) && !/^\d{2}\.\d{2}\.\d{2}$/.test(codigoTributacaoNacional)) {
      pushIssue(
        issues,
        'servico.codigoTributacaoNacional',
        'código de tributação nacional normalmente usa 6 dígitos ou formato 00.00.00',
        'warning',
      );
    }
    if (input.servico.codigoTributacaoMunicipal) {
      if (!/^\d{3}$/.test(String(input.servico.codigoTributacaoMunicipal))) {
        pushIssue(
          issues,
          'servico.codigoTributacaoMunicipal',
          'código de tributação municipal normalmente usa 3 dígitos',
          'warning',
        );
      }
    }
    if (
      input.servico.codigoNbs &&
      !/^\d{9}$/.test(String(input.servico.codigoNbs)) &&
      !/^\d\.\d{4}\.\d{2}\.\d{2}$/.test(String(input.servico.codigoNbs))
    ) {
      pushIssue(issues, 'servico.codigoNbs', 'código NBS normalmente usa 9 dígitos ou formato 0.0000.00.00', 'warning');
    }
    if (!input.servico.descricao) {
      pushIssue(issues, 'servico.descricao', 'descrição obrigatória');
    }
  }

  if (
    !input.valores ||
    input.valores.valorServico === undefined ||
    input.valores.valorServico === null ||
    input.valores.valorServico === ''
  ) {
    pushIssue(issues, 'valores.valorServico', 'valor do serviço obrigatório');
  } else {
    validateMoneyWhenPresent(input.valores.valorServico, 'valores.valorServico', issues);
    validateMoneyWhenPresent(input.valores.valorDescontoIncondicionado, 'valores.valorDescontoIncondicionado', issues);
    validateMoneyWhenPresent(input.valores.valorDescontoCondicionado, 'valores.valorDescontoCondicionado', issues);

    if (input.valores.tributacaoMunicipal) {
      validateMoneyWhenPresent(
        input.valores.tributacaoMunicipal.aliquota,
        'valores.tributacaoMunicipal.aliquota',
        issues,
      );
    }

    if (input.valores.tributacaoFederal?.pisCofins) {
      const pisCofins = input.valores.tributacaoFederal.pisCofins;
      validateMoneyWhenPresent(pisCofins.baseCalculo, 'valores.tributacaoFederal.pisCofins.baseCalculo', issues);
      validateMoneyWhenPresent(pisCofins.aliquotaPis, 'valores.tributacaoFederal.pisCofins.aliquotaPis', issues);
      validateMoneyWhenPresent(pisCofins.aliquotaCofins, 'valores.tributacaoFederal.pisCofins.aliquotaCofins', issues);
      validateMoneyWhenPresent(pisCofins.valorPis, 'valores.tributacaoFederal.pisCofins.valorPis', issues);
      validateMoneyWhenPresent(pisCofins.valorCofins, 'valores.tributacaoFederal.pisCofins.valorCofins', issues);
    }

    if (input.valores.tributacaoFederal) {
      validateMoneyWhenPresent(
        input.valores.tributacaoFederal.valorRetidoIrrf,
        'valores.tributacaoFederal.valorRetidoIrrf',
        issues,
      );
      validateMoneyWhenPresent(
        input.valores.tributacaoFederal.valorRetidoCsll,
        'valores.tributacaoFederal.valorRetidoCsll',
        issues,
      );
      validateMoneyWhenPresent(
        input.valores.tributacaoFederal.valorRetidoInss,
        'valores.tributacaoFederal.valorRetidoInss',
        issues,
      );
    }

    if (input.valores.totalTributos) {
      validateMoneyWhenPresent(
        input.valores.totalTributos.percentualTotalTributos,
        'valores.totalTributos.percentualTotalTributos',
        issues,
      );
      validateMoneyWhenPresent(
        input.valores.totalTributos.valorTotalTributos,
        'valores.totalTributos.valorTotalTributos',
        issues,
      );
    }
  }

  if (input.ibsCbs) {
    validateRequiredWhenPresent(input.ibsCbs.finalidadeNfse, 'ibsCbs.finalidadeNfse', issues);
    validateRequiredWhenPresent(input.ibsCbs.codigoIndicadorOperacao, 'ibsCbs.codigoIndicadorOperacao', issues);
    validateRequiredWhenPresent(input.ibsCbs.indicadorDestinatario, 'ibsCbs.indicadorDestinatario', issues);
    validateRequiredWhenPresent(input.ibsCbs.cst, 'ibsCbs.cst', issues);
    validateRequiredWhenPresent(input.ibsCbs.classificacaoTributaria, 'ibsCbs.classificacaoTributaria', issues);
  }

  return issues;
}
