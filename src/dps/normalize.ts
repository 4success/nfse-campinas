import { formatDecimal } from '../utils/decimals';

export function onlyDigits(value: string | number): string {
  return String(value).replace(/\D/g, '');
}

export function normalizeCpf(value: string): string {
  const text = String(value);
  if (!/^\d{11}$/.test(text) && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(text)) {
    throw new Error('CPF deve conter 11 dígitos ou estar no formato 000.000.000-00');
  }
  return onlyDigits(text);
}

export function normalizeCnpj(value: string): string {
  const text = String(value);
  if (/^[A-Z0-9]{12}\d{2}$/.test(text)) {
    return text;
  }
  if (/^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-\d{2}$/.test(text)) {
    return text.replace(/[./-]/g, '');
  }
  throw new Error('CNPJ deve conter 14 caracteres alfanuméricos com 2 dígitos verificadores numéricos');
}

export function normalizeCpfCnpj(value: string): string {
  try {
    return normalizeCpf(value);
  } catch (error) {
    return normalizeCnpj(value);
  }
}

export function normalizeMunicipio(value: string): string {
  const text = String(value);
  if (!/^\d{7}$/.test(text)) {
    throw new Error('Código do município deve ter 7 dígitos');
  }
  return text;
}

export function normalizeCep(value: string): string {
  const text = String(value);
  if (!/^\d{8}$/.test(text) && !/^\d{5}-\d{3}$/.test(text)) {
    throw new Error('CEP deve conter 8 dígitos ou estar no formato 00000-000');
  }
  return text.replace('-', '');
}

function ensureOnlyDigitsAndDots(value: string | number, message: string): string {
  const text = String(value);
  if (!/^\d+(?:\.\d+)*$/.test(text)) {
    throw new Error(message);
  }
  return onlyDigits(text);
}

function ensureOnlyDigits(value: string | number, message: string): string {
  const text = String(value);
  if (!/^\d+$/.test(text)) {
    throw new Error(message);
  }
  return text;
}

export function normalizeCodigoTributacaoNacional(value: string): string {
  const digits = ensureOnlyDigitsAndDots(value, 'Código de tributação nacional deve conter apenas dígitos e pontos');
  if (!digits || digits.length > 6) {
    throw new Error('Código de tributação nacional deve ter de 1 a 6 dígitos');
  }
  return digits.padStart(6, '0');
}

export function normalizeCodigoTributacaoMunicipal(value: string | number): string {
  const digits = ensureOnlyDigits(value, 'Código de tributação municipal deve conter apenas dígitos');
  if (!digits || digits.length > 3) {
    throw new Error('Código de tributação municipal deve ter de 1 a 3 dígitos');
  }
  return digits.padStart(3, '0');
}

export function normalizeNbs(value: string | number): string {
  const text = String(value);
  if (/^\d+$/.test(text) || /^\d\.\d{4}\.\d{2}\.\d{2}$/.test(text)) {
    return onlyDigits(text);
  }
  return text;
}

export function normalizeSerie(value: string | number): string {
  const digits = ensureOnlyDigits(value, 'Série da DPS deve conter apenas dígitos');
  if (!digits || digits.length > 5) {
    throw new Error('Série da DPS deve ter de 1 a 5 dígitos');
  }
  return digits.padStart(5, '0');
}

export function normalizeNumeroDps(value: string | number): string {
  const digits = ensureOnlyDigits(value, 'Número da DPS deve conter apenas dígitos');
  if (!digits || digits.length > 15) {
    throw new Error('Número da DPS deve ter de 1 a 15 dígitos');
  }
  return digits.padStart(15, '0');
}

export function normalizeMoney(value: string | number, scale = 2): string {
  const normalized = String(value).trim().replace(',', '.');
  if (normalized.startsWith('-')) {
    throw new Error('Valor decimal não pode ser negativo');
  }

  const decimalPart = normalized.split('.')[1];
  if (decimalPart && decimalPart.length > scale) {
    throw new Error(`Valor decimal deve ter no máximo ${scale} casas decimais`);
  }

  return formatDecimal(value, scale);
}
