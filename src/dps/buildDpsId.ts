import { BuildDpsIdInput } from './types';
import { normalizeCnpj, normalizeCpf, normalizeMunicipio, normalizeNumeroDps, normalizeSerie } from './normalize';

export function buildDpsId(input: BuildDpsIdInput): string {
  const codigoMunicipio = normalizeMunicipio(input.codigoMunicipioEmissao);
  const inscricaoFederal =
    input.tipoInscricaoFederal === '1' ? normalizeCpf(input.inscricaoFederal) : normalizeCnpj(input.inscricaoFederal);

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
