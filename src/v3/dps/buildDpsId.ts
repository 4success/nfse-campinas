import { BuildDpsIdInput } from './types';
import { normalizeNumeroDps, normalizeSerie, onlyDigits } from './normalize';

export function buildDpsId(input: BuildDpsIdInput): string {
  const codigoMunicipio = onlyDigits(input.codigoMunicipioEmissao);
  const inscricaoFederal = onlyDigits(input.inscricaoFederal);

  if (!/^\d{7}$/.test(codigoMunicipio)) {
    throw new Error('Código do município de emissão deve ter 7 dígitos');
  }

  if (input.tipoInscricaoFederal === '1' && !/^\d{11}$/.test(inscricaoFederal)) {
    throw new Error('CPF deve ter 11 dígitos');
  }

  if (input.tipoInscricaoFederal === '2' && !/^\d{14}$/.test(inscricaoFederal)) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }

  const inscricaoNormalizada =
    input.tipoInscricaoFederal === '1' ? inscricaoFederal.padStart(14, '0') : inscricaoFederal;
  const id = `DPS${codigoMunicipio}${input.tipoInscricaoFederal}${inscricaoNormalizada}${normalizeSerie(
    input.serie,
  )}${normalizeNumeroDps(input.numeroDps)}`;

  if (id.length !== 45) {
    throw new Error(`Id da DPS deve ter 45 caracteres, recebeu ${id.length}`);
  }

  return id;
}
