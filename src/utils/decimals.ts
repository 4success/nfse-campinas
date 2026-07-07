export function roundHalfEven(value: string | number, scale = 2): string {
  const normalized = String(value).trim().replace(',', '.');
  if (!Number.isInteger(scale) || scale < 0) {
    throw new Error(`Escala decimal inválida: ${scale}`);
  }
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Valor decimal inválido: ${value}`);
  }

  const negative = normalized.startsWith('-');
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [integerPart, decimalPart = ''] = unsigned.split('.');
  const keptDecimals = decimalPart.padEnd(scale, '0').slice(0, scale);
  const roundingDigit = Number(decimalPart[scale] || '0');
  const remainingDecimals = decimalPart.slice(scale + 1);
  let rounded = BigInt(`${integerPart}${keptDecimals}` || '0');
  const isTie = roundingDigit === 5 && !/[1-9]/.test(remainingDecimals);

  if (roundingDigit > 5 || (isTie && rounded % 2n === 1n) || (roundingDigit === 5 && !isTie)) {
    rounded += 1n;
  }

  if (scale === 0) {
    const result = rounded.toString();
    return negative && rounded !== 0n ? `-${result}` : result;
  }

  const digits = rounded.toString().padStart(scale + 1, '0');
  const integer = digits.slice(0, -scale);
  const decimals = digits.slice(-scale);
  const result = `${integer}.${decimals}`;
  return negative && rounded !== 0n ? `-${result}` : result;
}

export function formatDecimal(value: string | number, scale = 2): string {
  return roundHalfEven(value, scale);
}
