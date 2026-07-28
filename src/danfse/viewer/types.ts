/**
 * Derived from @notaas/danfse-viewer 1.0.1.
 * The upstream package declares the MIT License; see THIRD_PARTY_NOTICES.md.
 */

/**
 * types.ts — Tipos para o DANFSe v2.0
 *
 * Mapeamento dos campos da Nota Técnica nº 008 — SE/CGNFS-e v1.02.
 * Cada campo referencia a seção da NT onde está especificado.
 */

// ─── Subestruturas ────────────────────────────────────────────────────────────

/** Dados de pessoa (prestador, tomador, destinatário, intermediário) */
export interface DanfsePessoa {
  /** CNPJ formatado ou CPF formatado ou NIF (texto livre) */
  doc: string;
  /** Inscrição Municipal */
  IM: string;
  /** Telefone */
  fone: string;
  /** Nome / Nome Empresarial */
  xNome: string;
  /** Município / Sigla UF (ex: "Formiga / MG") */
  municipioUf: string;
  /** Código IBGE / CEP (ex: "3126109 / 35.570-000") */
  ibgeCep: string;
  /** Endereço concatenado (xLgr, nro, xCpl, xBairro) */
  endereco: string;
  /** E-mail */
  email: string;
}

/** Dados do prestador (estende Pessoa com campos tributários) */
export interface DanfsePrestador extends DanfsePessoa {
  /** Simples Nacional na Data de Competência (descrição) */
  opSimpNac: string;
  /** Regime de Apuração Tributária pelo SN (descrição) */
  regApTribSN: string;
}

// ─── DanfseData — objeto completo para renderização ──────────────────────────

export interface DanfseData {
  // ── Cabeçalho (§3) ──────────────────────────────────────────────────────
  /** Município: CCCC / CC (suprimido se cTribNac=99) */
  municipio: string;
  /** Código de tributação nacional (para regra de supressão) */
  cTribNac: string;
  /** Ambiente gerador (1=Produção, 2=Homologação) */
  ambGer: string;
  /** Tipo de ambiente (1=Produção, 2=Homologação) */
  tpAmb: string;
  /** URL do QR Code como data URI (SVG ou PNG base64) */
  qrCodeDataUri: string;

  // ── Identificação da NFS-e (§5.2) ───────────────────────────────────────
  /** Chave de acesso (50 dígitos, sem prefixo "NFS") */
  chaveAcesso: string;
  /** Número da NFS-e */
  nNFSe: string;
  /** Competência da NFS-e (DD/MM/AAAA) */
  dCompet: string;
  /** Data e Hora da Emissão da NFS-e (DD/MM/AAAA hh:mm:ss) */
  dhProc: string;
  /** Número da DPS */
  nDPS: string;
  /** Série da DPS */
  serie: string;
  /** Data e Hora da Emissão da DPS (DD/MM/AAAA hh:mm:ss) */
  dhEmi: string;
  /** Emitente da NFS-e (descrição: Prestador, Tomador, Intermediário) */
  tpEmit: string;
  /** Situação da NFS-e (descrição do cStat) */
  cStat: string;
  /** Finalidade (descrição) */
  finNFSe: string;

  // ── Pessoas (§5.3 a §5.6) ───────────────────────────────────────────────
  prestador: DanfsePrestador;
  tomador: DanfsePessoa | null; // null = não identificado (Nota 2)
  destinatario: DanfsePessoa | null; // null = não identificado (Nota 2/3)
  destinatarioIgualTomador: boolean; // true = texto-padrão (Nota 3)
  intermediario: DanfsePessoa | null; // null = não identificado (Nota 2)

  // ── Serviço Prestado (§5.7) ─────────────────────────────────────────────
  /** Código de Tributação Nacional / Municipal (nn.nn.nn / nnn) */
  codTrib: string;
  /** Código da NBS (n.nnnn.nn.nn) */
  cNBS: string;
  /** Local da Prestação / Sigla UF / País */
  localPrestacao: string;
  /** Descrição do código de tributação (sem label) */
  descCodTrib: string;
  /** Descrição do serviço */
  xDescServ: string;

  // ── Tributação Municipal ISSQN (§5.8) ───────────────────────────────────
  /** true = suprimir bloco ISSQN (Nota 4) */
  issqnNaoSujeito: boolean;
  /** Tipo de Tributação do ISSQN (descrição) */
  tribISSQN: string;
  /** Município / Sigla UF / País Incidência ISSQN */
  localIncid: string;
  /** Regime Especial de Tributação do ISSQN (descrição) — Nota 5 */
  regEspTrib: string;
  /** Tipo de Imunidade do ISSQN (descrição) — Nota 5 */
  tpImunidade: string;
  /** Suspensão da Exigibilidade do ISSQN (descrição) — Nota 5 */
  tpSusp: string;
  /** Número Processo Suspensão — Nota 5 */
  nProcesso: string;
  /** Benefício Municipal (descrição) — Nota 5 */
  tpBM: string;
  /** Cálculo do BM — Nota 5 */
  calcBM: string;
  /** Total Deduções/Reduções — Nota 5 */
  totDedRed: string;
  /** Desconto Incondicionado (ISSQN) — Nota 5 */
  vDescIncondISSQN: string;
  /** BC ISSQN */
  vBC: string;
  /** Alíquota Aplicada */
  pAliqAplic: string;
  /** Retenção do ISSQN (descrição) */
  tpRetISSQN: string;
  /** ISSQN Apurado */
  vISSQN: string;

  // ── Tributação Federal exceto CBS (§5.9) ────────────────────────────────
  /** IRRF */
  vRetIRRF: string;
  /** Contribuição Previdenciária Retida */
  vRetCP: string;
  /** Contribuições Sociais Retidas */
  vRetCSLL: string;
  /** true = exibir linhas PIS/COFINS (Nota 6: competência ≤ 2026) */
  exibirPisCofins: boolean;
  /** PIS – Débito Apuração Própria */
  vPis: string;
  /** COFINS – Débito Apuração Própria */
  vCofins: string;
  /** Descrição Contrib. Sociais – Retidas */
  tpRetPisCofins: string;

  // ── Tributação IBS/CBS (§5.10) ──────────────────────────────────────────
  /** CST / cClassTrib */
  cstClass: string;
  /** Ind. Operação / Cód. IBGE Inc. / Município Inc. / Sigla UF */
  indOpLocal: string;
  /** Exclusões e Reduções da Base de Cálculo */
  exclRedBC: string;
  /** Base de Cálculo Após Exclusões e Reduções */
  vBCIbs: string;
  /** Red. Alíquota IBS / Red. Alíquota CBS */
  redAliq: string;
  /** Alíquota – IBS UF / IBS Mun */
  aliqIbs: string;
  /** Alíq. Efetiva Municipal – IBS */
  pAliqEfetMun: string;
  /** Valor Apurado Municipal – IBS */
  vIBSMun: string;
  /** Alíq. Efetiva Estadual – IBS */
  pAliqEfetUF: string;
  /** Valor Apurado Estadual – IBS */
  vIBSUF: string;
  /** Valor Total Apurado – IBS */
  vIBSTot: string;
  /** Alíquota – CBS */
  pCBS: string;
  /** Alíquota Efetiva – CBS */
  pAliqEfetCBS: string;
  /** Valor Total Apurado – CBS */
  vCBS: string;

  // ── Valor Total da NFS-e (§5.11) ────────────────────────────────────────
  /** Valor da Operação / Serviço */
  vServ: string;
  /** Desconto Incondicionado (total) */
  vDescIncond: string;
  /** Desconto Condicionado */
  vDescCond: string;
  /** Total das Retenções (ISSQN / Federais) */
  vTotalRet: string;
  /** Valor Líquido da NFS-e */
  vLiq: string;
  /** Total do IBS/CBS */
  totIbsCbs: string;
  /** Valor Líquido da NFS-e + IBS/CBS */
  vTotNF: string;

  // ── Informações Complementares (§5.12) ──────────────────────────────────
  /** Conteúdo concatenado com | (ordem obrigatória) */
  infoCompl: string;

  // ── Canhoto (§5.13) — opcional ──────────────────────────────────────────
  /** Nº NFS-e / Chave NFS-e para o canhoto */
  canhotNumChave: string;

  // ── Estados visuais (§8) ────────────────────────────────────────────────
  cancelada: boolean;
  substituida: boolean;
  homologacao: boolean;
}
