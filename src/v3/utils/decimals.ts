export function roundHalfEven(value: string | number, scale = 2): string {
  const normalized = String(value).trim().replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Valor decimal inválido: ${value}`);
  }

  const negative = normalized.startsWith('-');
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [integerPart, decimalPart = ''] = unsigned.split('.');
  const digits = `${integerPart}${decimalPart.padEnd(scale + 1, '0')}`.replace(/^0+(?=\d)/, '');
  const factor = 10 ** scale;
  const scaled = Math.trunc(Number(digits.slice(0, Math.max(digits.length - (decimalPart.length - scale), 0))) || 0);
  const numeric = Number(unsigned);
  const shifted = numeric * factor;
  const floor = Math.floor(shifted);
  const diff = shifted - floor;
  let rounded = floor;

  if (diff > 0.5 || (Math.abs(diff - 0.5) < Number.EPSILON && floor % 2 === 1)) {
    rounded = floor + 1;
  }

  const result = (rounded / factor).toFixed(scale);
  return negative && result !== '0'.padEnd(scale + 2, '.0') ? `-${result}` : result;
}

export function formatDecimal(value: string | number, scale = 2): string {
  return roundHalfEven(value, scale);
}
