/**
 * Derived from @notaas/danfse-viewer 1.0.1.
 * The upstream package declares the MIT License; see THIRD_PARTY_NOTICES.md.
 */

/**
 * parser.ts — Parse do XML da NFS-e Nacional → DanfseData
 *
 * Implementação Orientada a Objetos para extração dos campos do XML
 * retornado pelo SNNFSE conforme Nota Técnica NT-008.
 */

import { XMLParser } from 'fast-xml-parser';
import QRCode from 'qrcode';
import type { DanfseData, DanfsePessoa, DanfsePrestador } from './types';

// ─── Helpers do Módulo (Encapsulados) ────────────────────────────────────────

const DASH = '-';

function str(v: unknown): string {
  if (v === undefined || v === null || v === '') return DASH;
  return String(v).trim() || DASH;
}

function toNum(v: unknown): number {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

function fmtMoney(v: unknown): string {
  const n = toNum(v);
  if (n === 0) return DASH;
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtPct(v: unknown): string {
  const n = toNum(v);
  if (n === 0) return DASH;
  return `${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}%`;
}

function fmtNbs(v: unknown): string {
  const value = str(v);
  if (!/^\d{9}$/.test(value)) return value;
  return `${value.slice(0, 1)}.${value.slice(1, 5)}.${value.slice(5, 7)}.${value.slice(7, 9)}`;
}

function fmtCnpj(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 14) return raw;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function fmtCpf(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 11) return raw;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function fmtCep(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.length !== 8) return raw;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}-${d.slice(5)}`;
}

function fmtDate(v: unknown): string {
  const s = String(v || '');
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return str(v);
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function fmtDateTime(v: unknown): string {
  const s = String(v || '');
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})T?(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return str(v);
  return `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}:${m[6]}`;
}

function trunc(s: string, maxLen: number): string {
  if (s === DASH || s.length <= maxLen) return s;
  return s.slice(0, maxLen - 5) + '(...)';
}

function get(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

// ─── Domínios e Mapeamentos ──────────────────────────────────────────────────

const CSTAT_MAP: Record<string, string> = {
  '100': 'Ativa',
};

const FIN_NFSE_MAP: Record<string, string> = {
  '0': 'NFS-e regular',
};

// TSAmbGeradorNFSe: 1=Prefeitura | 2=Sistema Nacional da NFS-e
const AMB_GER_MAP: Record<string, string> = {
  '1': 'Prefeitura',
  '2': 'Sistema Nacional da NFS-e',
};

const TP_AMB_MAP: Record<string, string> = {
  '1': 'Produção',
  '2': 'Homologação',
};

const EMIT_MAP: Record<string, string> = {
  '1': 'Prestador',
  '2': 'Tomador',
  '3': 'Intermediário',
};

const TRIB_ISSQN_MAP: Record<string, string> = {
  '1': 'Operação Tributável',
  '2': 'Imunidade',
  '3': 'Exportação de Serviço',
  '4': 'Não Incidência',
};

const RET_ISSQN_MAP: Record<string, string> = {
  '1': 'Não Retido',
  '2': 'Retido pelo Tomador',
  '3': 'Retido pelo Intermediário',
};

const OP_SIMP_NAC_MAP: Record<string, string> = {
  '1': 'Não Optante',
  '2': 'Optante - Microempreendedor Individual (MEI)',
  '3': 'Optante - Microempresa ou Empresa de Pequeno Porte (ME/EPP)',
};

// TSRegimeApuracaoSimpNac (XSD v1.01): regime de apuração para optante ME/EPP (opSimpNac=3)
const REG_AP_TRIB_SN_MAP: Record<string, string> = {
  '1': 'Tributos federais e municipal pelo SN',
  '2': 'Tributos federais pelo SN, ISSQN por fora',
  '3': 'Tributos federais e municipal por fora do SN',
};

// TSRegEspTrib (XSD v1.01): 0=Nenhum 1=Cooperativa 2=Estimativa 3=MicroempresaMunicipal
//   4=Notário/Registrador 5=ProfissionalAutônomo 6=SociedadeProfissionais 9=Outros
const REG_ESP_TRIB_MAP: Record<string, string> = {
  '0': 'Nenhum',
  '1': 'Ato Cooperado (Cooperativa)',
  '2': 'Estimativa',
  '3': 'Microempresa Municipal',
  '4': 'Notário ou Registrador',
  '5': 'Profissional Autônomo',
  '6': 'Sociedade de Profissionais',
  '9': 'Outros',
};

// TSTipoImunidade (XSD v1.01) — art. 150 CF88; 0=tipo não informado na nota de origem
const TP_IMUNIDADE_MAP: Record<string, string> = {
  '0': 'Imunidade (tipo não informado na nota de origem)',
  '1': 'Patrimônio, renda ou serviço, uns dos outros',
  '2': 'Templos de qualquer culto',
  '3': 'Patrimônio, renda ou serviço dos partidos políticos',
  '4': 'Livros, jornais, periódicos e papel destinado à sua impressão',
  '5': 'Fonogramas e videofonogramas musicais',
};

// TBMISSQN (XSD v1.01): 1=Isenção 2=Redução BC% 3=Redução BC R$ 4=Alíquota Diferenciada
const TP_BM_MAP: Record<string, string> = {
  '1': 'Isenção',
  '2': 'Redução da BC em %',
  '3': 'Redução da BC em R$',
  '4': 'Alíquota Diferenciada',
};

const TP_SUSP_MAP: Record<string, string> = {
  '1': 'Exigibilidade Suspensa por Decisão Judicial',
  '2': 'Exigibilidade Suspensa por Processo Administrativo',
};

// TSTipoRetPISCofins (XSD v1.01): enum 0-9
const TP_RET_PIS_COFINS_MAP: Record<string, string> = {
  '0': 'PIS/COFINS/CSLL Não Retidos',
  '1': 'PIS/COFINS Retidos',
  '2': 'PIS/COFINS Não Retidos',
  '3': 'PIS/COFINS/CSLL Retidos',
  '4': 'PIS/COFINS Retidos, CSLL Não Retido',
  '5': 'PIS Retido, COFINS/CSLL Não Retido',
  '6': 'COFINS Retido, PIS/CSLL Não Retido',
  '7': 'PIS Não Retido, COFINS/CSLL Retidos',
  '8': 'PIS/COFINS Não Retidos, CSLL Retido',
  '9': 'COFINS Não Retido, PIS/CSLL Retidos',
};

// ─── Estrutura de Classes (OOP) ──────────────────────────────────────────────

export type IbgeLookup = Map<string, { name: string; uf: string }>;

export class DanfseXmlParser {
  protected xmlParser: XMLParser;
  private munLookup: Map<string, { xMun: string; uf: string }> = new Map();

  constructor() {
    this.xmlParser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
    });
  }

  private extractDoc(pessoa: Record<string, unknown>): string {
    const cnpj = pessoa.CNPJ as string | undefined;
    if (cnpj) return fmtCnpj(String(cnpj));
    const cpf = pessoa.CPF as string | undefined;
    if (cpf) return fmtCpf(String(cpf));
    const nif = pessoa.NIF as string | undefined;
    if (nif) return str(nif);
    return DASH;
  }

  private buildMunLookup(infNFSe: Record<string, unknown>, emit: Record<string, unknown>): void {
    this.munLookup.clear();
    const emitEnd = emit.enderNac as Record<string, unknown> | undefined;
    if (emitEnd?.cMun) {
      this.munLookup.set(String(emitEnd.cMun), {
        xMun: String(infNFSe.xLocEmi || emitEnd.xMun || ''),
        uf: String(emitEnd.UF || ''),
      });
    }
    const dps = (infNFSe.DPS as Record<string, unknown> | undefined) || {};
    const infDPS = ((dps as Record<string, unknown>).infDPS as Record<string, unknown> | undefined) || dps;
    const serv = ((infDPS as Record<string, unknown>).serv as Record<string, unknown> | undefined) || {};
    const locPrest = ((serv as Record<string, unknown>).locPrest as Record<string, unknown> | undefined) || {};
    const cLocPrest = String((locPrest as Record<string, unknown>).cLocPrestacao || '');
    if (cLocPrest && infNFSe.xLocPrestacao) {
      const existing = this.munLookup.get(cLocPrest);
      this.munLookup.set(cLocPrest, {
        xMun: String(infNFSe.xLocPrestacao),
        uf: existing?.uf || '',
      });
    }
    const cLocIncid = String(infNFSe.cLocIncid || '');
    if (cLocIncid && infNFSe.xLocIncid) {
      const existing = this.munLookup.get(cLocIncid);
      this.munLookup.set(cLocIncid, {
        xMun: String(infNFSe.xLocIncid),
        uf: existing?.uf || '',
      });
    }
  }

  private resolveUfFromCMun(cMun: string): string {
    const UF_MAP: Record<string, string> = {
      '11': 'RO',
      '12': 'AC',
      '13': 'AM',
      '14': 'RR',
      '15': 'PA',
      '16': 'AP',
      '17': 'TO',
      '21': 'MA',
      '22': 'PI',
      '23': 'CE',
      '24': 'RN',
      '25': 'PB',
      '26': 'PE',
      '27': 'AL',
      '28': 'SE',
      '29': 'BA',
      '31': 'MG',
      '32': 'ES',
      '33': 'RJ',
      '35': 'SP',
      '41': 'PR',
      '42': 'SC',
      '43': 'RS',
      '50': 'MS',
      '51': 'MT',
      '52': 'GO',
      '53': 'DF',
    };
    return UF_MAP[cMun.slice(0, 2)] || '';
  }

  private extractEndereco(pessoa: Record<string, unknown>): { municipioUf: string; ibgeCep: string; endereco: string } {
    const end = pessoa.end as Record<string, unknown> | undefined;
    const enderNac = pessoa.enderNac as Record<string, unknown> | undefined;

    const endNac = (end?.endNac as Record<string, unknown> | undefined) || enderNac;
    const endExt = end?.endExt as Record<string, unknown> | undefined;

    let municipioUf = DASH;
    let ibgeCep = DASH;

    if (endNac) {
      const cMun = String(endNac.cMun || '');
      const uf =
        String(endNac.UF || (end as Record<string, unknown> | undefined)?.UF || '') ||
        this.munLookup.get(cMun)?.uf ||
        this.resolveUfFromCMun(cMun);
      const lookedUp = this.munLookup.get(cMun);
      const xMun = lookedUp?.xMun || String(endNac.xMun || cMun);
      municipioUf = cMun ? `${xMun} / ${uf}` : DASH;
      const cep = String(endNac.CEP || '');
      ibgeCep = cMun ? `${cMun} / ${cep ? fmtCep(cep) : DASH}` : DASH;
    } else if (endExt) {
      municipioUf = str(endExt.xCidade);
      ibgeCep = str(endExt.cEndPost);
    }

    const parts: string[] = [];
    const addrSources = [end, endNac, endExt].filter(Boolean) as Record<string, unknown>[];
    const xLgr = addrSources.find((s) => s.xLgr)?.xLgr;
    const nro = addrSources.find((s) => s.nro)?.nro;
    const xCpl = addrSources.find((s) => s.xCpl)?.xCpl;
    const xBairro = addrSources.find((s) => s.xBairro)?.xBairro;
    if (xLgr) parts.push(String(xLgr));
    if (nro) parts.push(String(nro));
    if (xCpl) parts.push(String(xCpl));
    if (xBairro) parts.push(String(xBairro));
    const endereco = parts.length > 0 ? trunc(parts.join(', '), 80) : DASH;

    return { municipioUf, ibgeCep, endereco };
  }

  private extractPessoa(obj: Record<string, unknown> | undefined): DanfsePessoa | null {
    if (!obj) return null;
    const { municipioUf, ibgeCep, endereco } = this.extractEndereco(obj);
    return {
      doc: this.extractDoc(obj),
      IM: str(obj.IM),
      fone: str(obj.fone),
      xNome: trunc(str(obj.xNome), 80),
      municipioUf: trunc(municipioUf, 37),
      ibgeCep,
      endereco,
      email: trunc(str(obj.email), 80),
    };
  }

  public async parse(xml: string, ibgeLookup?: IbgeLookup): Promise<DanfseData> {
    const parsed = this.xmlParser.parse(xml);
    const nfse = parsed.NFSe || parsed.retNFSe?.NFSe || parsed.NFSeProc?.NFSe || parsed;
    const infNFSe = nfse.infNFSe || nfse;

    let chaveAcesso = String(infNFSe['@_Id'] || infNFSe.id || '');
    if (chaveAcesso.startsWith('NFS')) chaveAcesso = chaveAcesso.slice(3);
    if (chaveAcesso.length !== 50) chaveAcesso = str(chaveAcesso);

    const dps = infNFSe.DPS || {};
    const infDPS = dps.infDPS || dps;
    const emit = infNFSe.emit || {};

    this.buildMunLookup(infNFSe, emit as Record<string, unknown>);

    if (ibgeLookup) {
      for (const [code, info] of ibgeLookup) {
        if (!this.munLookup.has(code)) {
          this.munLookup.set(code, { xMun: info.name, uf: info.uf });
        }
      }
    }

    const prest = infDPS.prest || {};
    const prestRegTrib = prest.regTrib || {};
    const prestMerged: Record<string, unknown> = {
      ...prest,
      xNome: prest.xNome || emit.xNome,
      fone: prest.fone || emit.fone,
      email: prest.email || emit.email,
    };
    const prestEndSrc = prest.end ? prest : emit;
    const prestEnder = this.extractEndereco(prestEndSrc as Record<string, unknown>);

    const prestador: DanfsePrestador = {
      doc: this.extractDoc(prest.CNPJ || prest.CPF ? prest : (emit as Record<string, unknown>)),
      IM: str(prest.IM || emit.IM),
      fone: str(prestMerged.fone),
      xNome: trunc(str(prestMerged.xNome), 80),
      municipioUf: trunc(prestEnder.municipioUf, 37),
      ibgeCep: prestEnder.ibgeCep,
      endereco: prestEnder.endereco,
      email: trunc(str(prestMerged.email), 80),
      opSimpNac: OP_SIMP_NAC_MAP[String(prestRegTrib.opSimpNac)] || str(prestRegTrib.opSimpNac),
      regApTribSN: REG_AP_TRIB_SN_MAP[String(prestRegTrib.regApTribSN)] || str(prestRegTrib.regApTribSN),
    };

    const toma = infDPS.toma as Record<string, unknown> | undefined;
    const tomador = this.extractPessoa(toma);

    const ibscbs = infDPS.IBSCBS || infNFSe.IBSCBS || {};
    const dest = ibscbs.dest as Record<string, unknown> | undefined;
    const destinatario = this.extractPessoa(dest);

    let destinatarioIgualTomador = false;
    if (toma && dest) {
      const tomaDoc = this.extractDoc(toma);
      const destDoc = this.extractDoc(dest);
      if (tomaDoc !== DASH && tomaDoc === destDoc) {
        destinatarioIgualTomador = true;
      }
    }

    const interm = infDPS.interm as Record<string, unknown> | undefined;
    const intermediario = this.extractPessoa(interm);

    const serv = infDPS.serv || {};
    const cServ = serv.cServ || {};
    const cTribNac = str(cServ.cTribNac);
    const cTribMun = str(cServ.cTribMun || infNFSe.cTribMun);
    const xTribNac = str(cServ.xTribNac);
    const xTribMun = str(infNFSe.xTribMun);
    const descCodTrib = xTribMun !== DASH ? xTribMun : xTribNac;

    const locPrest = serv.locPrest || {};
    const xLocPrestacao = str(infNFSe.xLocPrestacao);
    const cLocPrestacao = String(locPrest.cLocPrestacao || '');
    const ufPrestacao = this.munLookup.get(cLocPrestacao)?.uf || this.resolveUfFromCMun(cLocPrestacao);
    const cPaisPrestacao = str(locPrest.cPaisPrestacao) !== DASH ? str(locPrest.cPaisPrestacao) : 'BR';
    const localPrestacao = trunc(`${xLocPrestacao} / ${ufPrestacao} / ${cPaisPrestacao}`, 42);

    const valores = infDPS.valores || infNFSe.valores || {};
    const trib = valores.trib || {};
    const tribMun = trib.tribMun || {};
    const tribISSQNRaw = String(tribMun.tribISSQN || '');
    const issqnNaoSujeito = tribISSQNRaw === '4';

    const exigSusp = tribMun.exigSusp || {};
    const bm = tribMun.BM || {};
    const vDedRed = valores.vDedRed || {};

    const tribFed = trib.tribFed || {};
    const pisCofins = tribFed.piscofins || tribFed.pisCofins || {};

    const dCompetRaw = String(infDPS.dCompet || '');
    const competYear = parseInt(dCompetRaw.slice(0, 4), 10);
    const exibirPisCofins = !isNaN(competYear) && competYear <= 2026;

    const ibscbsValores = ibscbs.valores || {};
    const ibscbsTrib = ibscbsValores.trib || {};
    const gIBSCBS = ibscbsTrib.gIBSCBS || {};
    const ibsUf = ibscbsValores.uf || {};
    const ibsMun = ibscbsValores.mun || {};
    const ibsFed = ibscbsValores.fed || {};
    const totCIBS = ibscbs.totCIBS || {};
    const gIBS = totCIBS.gIBS || {};
    const gIBSMunTot = gIBS.gIBSMunTot || {};
    const gIBSUFTot = gIBS.gIBSUFTot || {};
    const gCBS = totCIBS.gCBS || {};

    const valoresNFSe = infNFSe.valores || {};
    const valoresDPS = infDPS.valores || {};
    const vServPrest = valoresDPS.vServPrest || valoresNFSe.vServPrest || {};
    const vDescCondIncond = valoresDPS.vDescCondIncond || valoresNFSe.vDescCondIncond || {};

    const infoCompParts: string[] = [];
    const servInfoCompl = serv.infoCompl || {};
    if (servInfoCompl.xInfComp) infoCompParts.push(`Inf. Cont.: ${servInfoCompl.xInfComp}`);

    const subst = infDPS.subst || {};
    if (subst.chSubstda) infoCompParts.push(`NFS-e Subst.: ${subst.chSubstda}`);

    if (infDPS.docRef) infoCompParts.push(`Doc. Ref.: ${infDPS.docRef}`);

    const obra = serv.obra || {};
    if (obra.cObra) infoCompParts.push(`Cod. Obra: ${obra.cObra}`);

    const imovel = ibscbs.imovel || {};
    if (imovel.inscImobFisc) infoCompParts.push(`Insc. Imob.: ${imovel.inscImobFisc}`);

    const atvEvento = serv.atvEvento || {};
    if (atvEvento.idAtvEvt) infoCompParts.push(`Cod. Evt.: ${atvEvento.idAtvEvt}`);

    if (infDPS.idDocTec) infoCompParts.push(`Doc. Tec.: ${infDPS.idDocTec}`);

    if (servInfoCompl.xPed) infoCompParts.push(`Núm. Ped.: ${servInfoCompl.xPed}`);
    if (servInfoCompl.xItemPed) infoCompParts.push(`Item Ped.: ${servInfoCompl.xItemPed}`);

    if (servInfoCompl.xOutInf) infoCompParts.push(`Inf. A. T. Mun.: ${servInfoCompl.xOutInf}`);

    const totTrib = trib.totTrib || valoresNFSe.trib?.totTrib || {};
    const vTotTrib = totTrib.vTotTrib || {};
    const pTotTrib = totTrib.pTotTrib || {};
    if (vTotTrib.vTotTribFed || pTotTrib.pTotTribFed) {
      const fed = vTotTrib.vTotTribFed
        ? `R$ ${toNum(vTotTrib.vTotTribFed).toFixed(2)}`
        : `${toNum(pTotTrib.pTotTribFed).toFixed(2)}%`;
      const est = vTotTrib.vTotTribEst
        ? `R$ ${toNum(vTotTrib.vTotTribEst).toFixed(2)}`
        : `${toNum(pTotTrib.pTotTribEst).toFixed(2)}%`;
      const mun = vTotTrib.vTotTribMun
        ? `R$ ${toNum(vTotTrib.vTotTribMun).toFixed(2)}`
        : `${toNum(pTotTrib.pTotTribMun).toFixed(2)}%`;
      infoCompParts.push(
        `Totais Aproximados dos Tributos cfe. Lei nº 12.741/2012: Federais: ${fed} ; Estaduais: ${est} ; Municipais: ${mun}`,
      );
    }

    const infoCompl = infoCompParts.join(' | ');

    const emitEnderNac = emit.enderNac || (emit.end as Record<string, unknown> | undefined)?.endNac || {};
    const xLocEmi = String(
      infNFSe.xLocEmi ||
        (emitEnderNac as Record<string, unknown>).xLocEmi ||
        (emitEnderNac as Record<string, unknown>).xMun ||
        '',
    );
    const emitUf = String((emitEnderNac as Record<string, unknown>).UF || emit.UF || '');
    const municipioStr = xLocEmi ? `Município: ${xLocEmi} / ${emitUf}` : DASH;

    const tpAmbRaw = String(infDPS.tpAmb || infNFSe.tpAmb || '1');
    const cStatRaw = String(infNFSe.cStat || '');
    const cancelada = cStatRaw === '2' || cStatRaw === '102' || cStatRaw === '202';
    const substituida = cStatRaw === '3' || !!subst.chSubstda;

    const qrUrl = chaveAcesso !== DASH ? `https://www.nfse.gov.br/ConsultaPublica/?tpc=1&chave=${chaveAcesso}` : '';
    let qrCodeDataUri = '';
    if (qrUrl) {
      try {
        qrCodeDataUri = await QRCode.toDataURL(qrUrl, {
          width: 150,
          margin: 0,
          errorCorrectionLevel: 'M',
        });
      } catch {
        // fallback sem QR
      }
    }

    const exclRedBCNum =
      toNum(vDescCondIncond.vDescIncond) +
      toNum(get(ibscbsValores as Record<string, unknown>, 'vCalcReeRepRes')) +
      toNum(valoresNFSe.vISSQN) +
      toNum(pisCofins.vPIS || pisCofins.vPis) +
      toNum(pisCofins.vCOFINS || pisCofins.vCofins);

    const totIbsCbsNum = toNum(gIBS.vIBSTot) + toNum(gCBS.vCBS);
    const nNFSe = str(infNFSe.nNFSe);

    return {
      municipio: municipioStr,
      cTribNac,
      ambGer: AMB_GER_MAP[String(infNFSe.ambGer)] || str(infNFSe.ambGer),
      tpAmb: TP_AMB_MAP[tpAmbRaw] || tpAmbRaw,
      qrCodeDataUri,
      chaveAcesso,
      nNFSe,
      dCompet: fmtDate(infDPS.dCompet),
      dhProc: fmtDateTime(infNFSe.dhProc),
      nDPS: str(infDPS.nDPS),
      serie: str(infDPS.serie),
      dhEmi: fmtDateTime(infDPS.dhEmi),
      tpEmit: EMIT_MAP[String(infDPS.tpEmit)] || str(infDPS.tpEmit),
      cStat: CSTAT_MAP[cStatRaw] || str(cStatRaw),
      finNFSe: (() => {
        const raw = str(get(ibscbs as Record<string, unknown>, 'finNFSe') ?? infDPS.finNFSe);
        return FIN_NFSE_MAP[raw] || raw;
      })(),
      prestador,
      tomador,
      destinatario: destinatarioIgualTomador ? null : destinatario,
      destinatarioIgualTomador,
      intermediario,
      codTrib: cTribNac !== DASH ? `${cTribNac.replace(/(\d{2})(\d{2})(\d{2})/, '$1.$2.$3')} / ${cTribMun}` : DASH,
      cNBS: fmtNbs(cServ.cNBS),
      localPrestacao,
      descCodTrib: trunc(descCodTrib, 170),
      xDescServ: trunc(str(cServ.xDescServ || serv.xDescServ), 1300),
      issqnNaoSujeito,
      tribISSQN: TRIB_ISSQN_MAP[tribISSQNRaw] || str(tribISSQNRaw),
      localIncid: (() => {
        const cLoc = String(infNFSe.cLocIncid || '');
        // Heurística offline: se o nome do município de incidência não veio no XML, tenta buscar nas cidades do Prestador/Prestação resolvidas
        let xLoc = infNFSe.xLocIncid ? String(infNFSe.xLocIncid) : '';
        if (!xLoc && cLoc) {
          xLoc = this.munLookup.get(cLoc)?.xMun || '';
        }
        const resolvedXLoc = xLoc ? str(xLoc) : '-';

        const ufIncid = this.munLookup.get(cLoc)?.uf || this.resolveUfFromCMun(cLoc);
        const paisIncid = tribMun.cPaisResult ? String(tribMun.cPaisResult) : '';
        const parts = [resolvedXLoc];
        if (ufIncid) parts.push(ufIncid);
        if (paisIncid) parts.push(paisIncid);
        return trunc(parts.join(' / '), 42);
      })(),
      regEspTrib: trunc(REG_ESP_TRIB_MAP[String(prestRegTrib.regEspTrib)] || str(prestRegTrib.regEspTrib), 27),
      tpImunidade: trunc(TP_IMUNIDADE_MAP[String(tribMun.tpImunidade)] || str(tribMun.tpImunidade), 40),
      tpSusp: trunc(TP_SUSP_MAP[String(exigSusp.tpSusp)] || str(exigSusp.tpSusp), 40),
      nProcesso: str(exigSusp.nProcesso),
      tpBM: trunc(TP_BM_MAP[String(valoresNFSe.tpBM)] || str(valoresNFSe.tpBM), 40),
      calcBM: fmtMoney(valoresNFSe.vCalcBM || bm.vRedBCBM),
      totDedRed: fmtMoney(
        toNum(vDedRed.vDR) +
          toNum(valoresNFSe.vCalcDR) +
          toNum(get(ibscbsValores as Record<string, unknown>, 'vCalcReeRepRes')),
      ),
      vDescIncondISSQN: fmtMoney(vDescCondIncond.vDescIncond),
      vBC: fmtMoney(valoresNFSe.vBC),
      pAliqAplic: fmtPct(valoresNFSe.pAliqAplic),
      tpRetISSQN: RET_ISSQN_MAP[String(tribMun.tpRetISSQN)] || str(tribMun.tpRetISSQN),
      vISSQN: fmtMoney(valoresNFSe.vISSQN),
      vRetIRRF: fmtMoney(tribFed.vRetIRRF),
      vRetCP: fmtMoney(tribFed.vRetCP),
      vRetCSLL: fmtMoney(tribFed.vRetCSLL),
      exibirPisCofins,
      vPis: fmtMoney(pisCofins.vPis || pisCofins.vPIS),
      vCofins: fmtMoney(pisCofins.vCofins || pisCofins.vCOFINS),
      tpRetPisCofins: trunc(
        TP_RET_PIS_COFINS_MAP[String(pisCofins.tpRetPisCofins)] || str(pisCofins.tpRetPisCofins),
        35,
      ),
      cstClass: `${str(gIBSCBS.CST)} / ${str(gIBSCBS.cClassTrib)}`,
      indOpLocal: trunc(
        `${str(ibscbs.cIndOp)} / ${str(infNFSe.IBSCBS?.cLocalidadeIncid || ibscbs.cLocalidadeIncid)} / ${str(
          infNFSe.IBSCBS?.xLocalidadeIncid || ibscbs.xLocalidadeIncid,
        )}`,
        56,
      ),
      exclRedBC: fmtMoney(exclRedBCNum || undefined),
      vBCIbs: fmtMoney(ibscbsValores.vBC),
      redAliq: `${fmtPct(ibsUf.pRedAliqUF)} / ${fmtPct(ibsMun.pRedAliqMun)} / ${fmtPct(ibsFed.pRedAliqCBS)}`,
      aliqIbs: `${fmtPct(ibsUf.pIBSUF)} / ${fmtPct(ibsMun.pIBSMun)}`,
      pAliqEfetMun: fmtPct(ibsMun.pAliqEfetMun),
      vIBSMun: fmtMoney(gIBSMunTot.vIBSMun),
      pAliqEfetUF: fmtPct(ibsUf.pAliqEfetUF),
      vIBSUF: fmtMoney(gIBSUFTot.vIBSUF),
      vIBSTot: fmtMoney(gIBS.vIBSTot),
      pCBS: fmtPct(ibsFed.pCBS),
      pAliqEfetCBS: fmtPct(ibsFed.pAliqEfetCBS),
      vCBS: fmtMoney(gCBS.vCBS),
      vServ: fmtMoney(vServPrest.vServ),
      vDescIncond: fmtMoney(vDescCondIncond.vDescIncond),
      vDescCond: fmtMoney(vDescCondIncond.vDescCond),
      vTotalRet: fmtMoney(valoresNFSe.vTotalRet),
      vLiq: fmtMoney(valoresNFSe.vLiq),
      totIbsCbs: fmtMoney(totIbsCbsNum || undefined),
      vTotNF: fmtMoney(totCIBS.vTotNF),
      infoCompl: trunc(infoCompl, 2000),
      canhotNumChave: `${nNFSe} / ${chaveAcesso}`,
      cancelada,
      substituida,
      homologacao: tpAmbRaw === '2',
    };
  }
}
