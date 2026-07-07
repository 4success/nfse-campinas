import { formatDecimal } from '../utils/decimals';

export function onlyDigits(value: string | number): string {
  return String(value).replace(/\D/g, '');
}

export function normalizeCpfCnpj(value: string): string {
  return onlyDigits(value);
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
  const digits = onlyDigits(value);
  if (!digits || digits.length > 3) {
    throw new Error('Código de tributação municipal deve ter de 1 a 3 dígitos');
  }
  return digits.padStart(3, '0');
}

export function normalizeNbs(value: string | number): string {
  return onlyDigits(value);
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
  return formatDecimal(value, scale);
}
