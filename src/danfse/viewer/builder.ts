/**
 * Derived from @notaas/danfse-viewer 1.0.1, with the upstream NT-008 v1.02
 * layout changes through commit d064b1adbd87825d2b61d34ac6b7bed06a3b4017.
 * The upstream package declares the MIT License; see THIRD_PARTY_NOTICES.md.
 */

/**
 * builder.ts — Gerador de HTML inline do DANFSe v2.0
 *
 * Implementação Orientada a Objetos para renderização do template HTML.
 * Layout conforme NT-008 v1.02 — formato A4 retrato (210×297mm).
 *
 * Estrutura de cada bloco:
 *   - 1ª <tr> (row-sec-top): Col1 = título do bloco (fundo cinza),
 *     Cols 2-4 = primeiros campos do bloco.
 *   - <tr> subsequentes: campos restantes.
 */

import type { DanfseData, DanfsePessoa } from './types';
import { LOGO_NFSE_PNG_BASE64 } from './logo';

export interface IDanfseBuilder {
  build(data: DanfseData): string;
}

export class DanfseHtmlBuilder implements IDanfseBuilder {
  protected esc(s: string): string {
    if (!s) return '';
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  protected getLogoUri(): string {
    return `data:image/png;base64,${LOGO_NFSE_PNG_BASE64}`;
  }

  /**
   * Gera as linhas de uma pessoa (Prestador, Tomador, Destinatário, Intermediário).
   *
   * Quando a pessoa existe:
   *   Row 1 (row-sec-top): [Título bg-cinza] [CNPJ] [IM ou vazio] [Telefone]
   *   Row 2: [Nome colspan=2] [Município] [Código IBGE / CEP]
   *   Row 3: [Endereço colspan=2] [E-mail colspan=2]
   *
   * Quando a pessoa não existe:
   *   Row única de supressão (supr) com texto centralizado e bordas.
   */
  private buildPessoaRows(
    title: string,
    pessoa: DanfsePessoa | null,
    suppText: string,
    opts?: { showIM?: boolean },
  ): string {
    if (!pessoa) {
      return `<tr class="row-sec-top"><td colspan="4" class="supr">${this.esc(suppText)}</td></tr>`;
    }

    const showIM = opts?.showIM !== false;

    return `
<tr class="row-sec-top">
  <td class="sec-title-label bg-cinza">${this.esc(title)}</td>
  <td class="c"><span class="lbl">CNPJ / CPF / NIF</span><span class="val">${this.esc(pessoa.doc)}</span></td>
  ${
    showIM
      ? `<td class="c"><span class="lbl">Indicador Municipal (Inscrição)</span><span class="val">${this.esc(
          pessoa.IM,
        )}</span></td>`
      : '<td class="c"></td>'
  }
  <td class="c"><span class="lbl">Telefone</span><span class="val">${this.esc(pessoa.fone)}</span></td>
</tr>
<tr>
  <td class="c" colspan="2"><span class="lbl">Nome / Nome Empresarial</span><span class="val">${this.esc(
    pessoa.xNome,
  )}</span></td>
  <td class="c"><span class="lbl">Município / Sigla UF</span><span class="val">${this.esc(
    pessoa.municipioUf,
  )}</span></td>
  <td class="c"><span class="lbl">Código IBGE / CEP</span><span class="val">${this.esc(pessoa.ibgeCep)}</span></td>
</tr>
<tr>
  <td class="c" colspan="2"><span class="lbl">Endereço</span><span class="val">${this.esc(pessoa.endereco)}</span></td>
  <td class="c" colspan="2"><span class="lbl">E-mail</span><span class="val">${this.esc(pessoa.email)}</span></td>
</tr>`;
  }

  public build(data: DanfseData): string {
    const stateClasses: string[] = [];
    if (data.homologacao) stateClasses.push('homologacao');
    if (data.cancelada) stateClasses.push('cancelada');
    if (data.substituida) stateClasses.push('substituida');
    const cls = stateClasses.join(' ');

    const logoDataUri = this.getLogoUri();

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>DANFSe v2.0</title>
<style>
@page { size: A4 portrait; margin: 0; }
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
html, body { margin: 0; padding: 0; background: #fff; }

:root {
  --f-label: Arial, Helvetica, sans-serif;
  --f-val: "Microsoft Sans Serif", Tahoma, Arial, sans-serif;
  --borda-ext: 1pt solid #000;
  --borda: .5pt solid #000;
}

.folha {
  position: relative;
  width: 210mm; min-height: 297mm;
  margin: 0 auto;
  padding: 6mm 6mm 10mm 6mm;
  background: #fff;
  color: #000;
  font-family: var(--f-val);
  font-size: 7pt;
  line-height: 1.25;
}

/* ── Borda externa do formulário (NT-008 §2.2.2: margem 0,15–0,20cm; §2.2.3: borda 1pt) ── */
.form-borda {
  border: var(--borda-ext);
  padding: 1.5mm;
  margin-bottom: 8mm;
}

/* ── tabela principal ── */
table.danfse {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
table.danfse td {
  border: none;
  vertical-align: top;
  padding: 2pt 3pt;
  overflow: hidden;
}

/* ── Célula padrão (NT-008: Alt. = 0,63–0,67cm) ── */
.c { height: 6.7mm; }
.c .lbl {
  display: block;
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 6pt;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: .5pt;
}
tr.ident-row .lbl {
  font-size: 7pt;
  text-transform: uppercase;
}
.c .val {
  display: block;
  font-family: var(--f-val);
  font-size: 7pt;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.c .val.wrap { white-space: normal; word-break: break-word; }

/* ── Linha do título do bloco (título na col1 + campos nas cols 2-4) ── */
tr.row-sec-top td {
  border-top: var(--borda);
}
.sec-title-label {
  background: #f2f2f2 !important;
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 7pt;
  text-transform: uppercase;
  height: 6.7mm;
  vertical-align: middle;
  padding-left: 3pt;
  white-space: nowrap;
  overflow: hidden;
}

/* ── Supressão (Nota 2 — quando bloco é omitido) ── */
.supr {
  font-family: var(--f-val);
  font-size: 6.5pt;
  height: 6mm;
  vertical-align: middle;
  text-align: center;
  padding: 3pt 4pt;
  font-style: italic;
  color: #444;
}

/* ── Sombreamento 5% (NT-008) ── */
.bg-cinza {
  background: #f2f2f2 !important;
}

/* ── Cabeçalho ── */
.cab {
  background: #f2f2f2;
  height: 12mm;
  vertical-align: middle;
  border-bottom: var(--borda) !important;
}

/* ── Canhoto ── */
table.canhoto-table {
  width: 100%;
  border-collapse: collapse;
  border: var(--borda);
  table-layout: fixed;
}
table.canhoto-table td.canhoto-cell {
  border: var(--borda) !important;
  height: 8mm;
  vertical-align: top;
  padding: 2pt 3pt;
}
table.canhoto-table td.canhoto-cell .lbl {
  display: block;
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 5pt;
  color: #000;
  margin-bottom: 2px;
  text-transform: uppercase;
}
table.canhoto-table td.canhoto-cell .val {
  display: block;
  font-family: var(--f-val);
  font-size: 5.5pt;
  color: #000;
}
.cab-logo { width: 50mm; text-align: center; }
.cab-logo img { max-height: 10mm; max-width: 46mm; }
.cab-titulo {
  text-align: center;
  font-family: var(--f-label);
  font-weight: 700;
  font-size: 10pt;
  line-height: 1.3;
}
.cab-titulo .sub { font-size: 8pt; font-weight: 400; }
.cab-titulo .val-jur { display: none; color: #e30613; font-size: 9pt; font-weight: 700; }
.homologacao .cab-titulo .val-jur { display: block; }
.cab-info {
  font-size: 6pt;
  line-height: 1.4;
  padding: 2pt 3pt;
  white-space: nowrap;
}
.cab-info strong { font-size: 8pt; }

/* ── QR Code (NT-008: 1,52cm × 1,52cm; texto 6pt 3 linhas) ── */
.c-qr {
  vertical-align: top;
  padding: 6mm 2mm 1mm 2mm;
  text-align: center;
}
.c-qr img.qr-img {
  width: 15.2mm;
  height: 15.2mm;
  margin-bottom: 1mm;
}
.c-qr .qr-txt {
  font-family: var(--f-val);
  font-size: 6pt;
  line-height: 1.2;
  text-align: justify;
  color: #000;
  word-break: break-word;
}

/* ── Marca d'água ── */
.marca {
  position: absolute;
  inset: 0;
  display: none;
  align-items: center; justify-content: center;
  pointer-events: none;
  z-index: 50;
}
.marca span {
  font-family: var(--f-label);
  font-size: 72pt;
  color: rgba(0,0,0,.30);
  transform: rotate(-45deg);
  white-space: nowrap;
}
.cancelada .marca.cancel { display: flex; }
.substituida .marca.subst { display: flex; }

/* ── Desc. serviço e info compl expandem ── */
.desc-serv .val.wrap { font-size: 6.5pt; line-height: 1.3; }
.info-compl .val.wrap { font-size: 6.5pt; line-height: 1.3; }

/* ── Info Complementares título full-width ── */
tr.sec-title-full td {
  border-top: var(--borda);
}
</style>
</head>
<body>
<div class="folha ${cls}">
  <!-- Marca d'água -->
  <div class="marca cancel"><span>CANCELADA</span></div>
  <div class="marca subst"><span>SUBSTITUÍDA</span></div>

<div class="form-borda">
<table class="danfse">
  <colgroup><col style="width:25%"><col style="width:25%"><col style="width:25%"><col style="width:25%"></colgroup>
  <!-- ═══ CABEÇALHO ═══ -->
  <tr>
    <td class="cab cab-logo" colspan="1"><img src="${logoDataUri}" alt="NFS-e"></td>
    <td class="cab cab-titulo" colspan="2">
      DANFSe v2.0<br>
      <span class="sub">Documento Auxiliar da NFS-e</span>
      <div class="val-jur">NFS-e SEM VALIDADE JURÍDICA</div>
    </td>
    <td class="cab cab-info">
      ${data.cTribNac !== '99' ? `<strong>${this.esc(data.municipio)}</strong><br>` : ''}
      Ambiente Gerador: ${this.esc(data.ambGer)}<br>
      Tipo de Ambiente: ${this.esc(data.tpAmb)}
    </td>
  </tr>

  <!-- ═══ IDENTIFICAÇÃO DA NFS-e ═══ -->
  <tr class="ident-row">
    <td class="c" colspan="3"><span class="lbl">CHAVE DE ACESSO DA NFS-E</span><span class="val" style="font-size:7.5pt;letter-spacing:.3pt">${this.esc(
      data.chaveAcesso,
    )}</span></td>
    <td class="c-qr" rowspan="4">
      ${data.qrCodeDataUri ? `<img class="qr-img" src="${data.qrCodeDataUri}" alt="QR">` : ''}
      <div class="qr-txt">A autenticidade desta NFS-e pode ser verificada pela leitura deste código QR ou pela consulta da chave de acesso no portal nacional da NFS-e</div>
    </td>
  </tr>
  <tr class="ident-row">
    <td class="c"><span class="lbl">NÚMERO DA NFS-E</span><span class="val">${this.esc(data.nNFSe)}</span></td>
    <td class="c"><span class="lbl">COMPETÊNCIA DA NFS-E</span><span class="val">${this.esc(data.dCompet)}</span></td>
    <td class="c"><span class="lbl">DATA E HORA DA EMISSÃO DA NFS-E</span><span class="val">${this.esc(
      data.dhProc,
    )}</span></td>
  </tr>
  <tr class="ident-row">
    <td class="c"><span class="lbl">NÚMERO DA DPS</span><span class="val">${this.esc(data.nDPS)}</span></td>
    <td class="c"><span class="lbl">SÉRIE DA DPS</span><span class="val">${this.esc(data.serie)}</span></td>
    <td class="c"><span class="lbl">DATA E HORA DA EMISSÃO DA DPS</span><span class="val">${this.esc(
      data.dhEmi,
    )}</span></td>
  </tr>
  <tr class="ident-row">
    <td class="c bg-cinza"><span class="lbl">EMITENTE DA NFS-E</span><span class="val"><strong>${this.esc(
      data.tpEmit,
    )}</strong></span></td>
    <td class="c"><span class="lbl">SITUAÇÃO DA NFS-E</span><span class="val">${this.esc(data.cStat)}</span></td>
    <td class="c"><span class="lbl">FINALIDADE</span><span class="val">${this.esc(data.finNFSe)}</span></td>
  </tr>

  <!-- ═══ PRESTADOR / FORNECEDOR ═══ -->
  <tr class="row-sec-top">
    <td class="sec-title-label bg-cinza">Prestador / Fornecedor</td>
    <td class="c"><span class="lbl">CNPJ / CPF / NIF</span><span class="val">${this.esc(data.prestador.doc)}</span></td>
    <td class="c"><span class="lbl">Indicador Municipal (Inscrição)</span><span class="val">${this.esc(
      data.prestador.IM,
    )}</span></td>
    <td class="c"><span class="lbl">Telefone</span><span class="val">${this.esc(data.prestador.fone)}</span></td>
  </tr>
  <tr>
    <td class="c" colspan="2"><span class="lbl">Nome / Nome Empresarial</span><span class="val">${this.esc(
      data.prestador.xNome,
    )}</span></td>
    <td class="c"><span class="lbl">Município / Sigla UF</span><span class="val">${this.esc(
      data.prestador.municipioUf,
    )}</span></td>
    <td class="c"><span class="lbl">Código IBGE / CEP</span><span class="val">${this.esc(
      data.prestador.ibgeCep,
    )}</span></td>
  </tr>
  <tr>
    <td class="c" colspan="2"><span class="lbl">Endereço</span><span class="val">${this.esc(
      data.prestador.endereco,
    )}</span></td>
    <td class="c" colspan="2"><span class="lbl">E-mail</span><span class="val">${this.esc(
      data.prestador.email,
    )}</span></td>
  </tr>
  <tr>
    <td class="c" colspan="2"><span class="lbl">Simples Nacional na Data de Competência</span><span class="val">${this.esc(
      data.prestador.opSimpNac,
    )}</span></td>
    <td class="c" colspan="2"><span class="lbl">Regime de Apuração Tributária pelo SN</span><span class="val">${this.esc(
      data.prestador.regApTribSN,
    )}</span></td>
  </tr>

  <!-- ═══ TOMADOR / ADQUIRENTE ═══ -->
  ${this.buildPessoaRows(
    'Tomador / Adquirente',
    data.tomador,
    'TOMADOR/ADQUIRENTE DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e',
  )}

  <!-- ═══ DESTINATÁRIO ═══ -->
  ${
    data.destinatarioIgualTomador
      ? `<tr class="row-sec-top"><td colspan="4" class="supr">O DESTINATÁRIO É O PRÓPRIO TOMADOR/ADQUIRENTE DA OPERAÇÃO</td></tr>`
      : this.buildPessoaRows(
          'Destinatário da Operação',
          data.destinatario,
          'DESTINATÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e',
          { showIM: false },
        )
  }

  <!-- ═══ INTERMEDIÁRIO ═══ -->
  ${this.buildPessoaRows(
    'Intermediário da Operação',
    data.intermediario,
    'INTERMEDIÁRIO DA OPERAÇÃO NÃO IDENTIFICADO NA NFS-e',
  )}

  <!-- ═══ SERVIÇO PRESTADO ═══ -->
  <tr class="row-sec-top">
    <td class="sec-title-label bg-cinza">Serviço Prestado</td>
    <td class="c"><span class="lbl">Código de Tributação Nacional / Municipal</span><span class="val">${this.esc(
      data.codTrib,
    )}</span></td>
    <td class="c"><span class="lbl">Código da NBS</span><span class="val">${this.esc(data.cNBS)}</span></td>
    <td class="c"><span class="lbl">Local da Prestação / Sigla UF / País</span><span class="val">${this.esc(
      data.localPrestacao,
    )}</span></td>
  </tr>
  <tr>
    <td class="c" colspan="4" style="height:auto;min-height:4mm"><span class="val wrap" style="font-size:6pt">${this.esc(
      data.descCodTrib,
    )}</span></td>
  </tr>
  <tr class="desc-serv">
    <td class="c" colspan="4" style="height:auto;min-height:8mm"><span class="lbl">Descrição do Serviço</span><span class="val wrap">${this.esc(
      data.xDescServ,
    )}</span></td>
  </tr>

  <!-- ═══ TRIBUTAÇÃO MUNICIPAL (ISSQN) ═══ -->
  ${
    data.issqnNaoSujeito
      ? `
  <tr class="row-sec-top"><td colspan="4" class="supr">TRIBUTAÇÃO MUNICIPAL (ISSQN) - OPERAÇÃO NÃO SUJEITA AO ISSQN</td></tr>
  `
      : `
  <tr class="row-sec-top">
    <td class="sec-title-label bg-cinza">Tributação Municipal (ISSQN)</td>
    <td class="c"><span class="lbl">Tipo de Tributação do ISSQN</span><span class="val">${this.esc(
      data.tribISSQN,
    )}</span></td>
    <td class="c" colspan="2"><span class="lbl">Município / Sigla UF / País de Incidência do ISSQN</span><span class="val">${this.esc(
      data.localIncid,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">Regime Especial de Tributação do ISSQN</span><span class="val">${this.esc(
      data.regEspTrib,
    )}</span></td>
    <td class="c"><span class="lbl">Tipo de Imunidade do ISSQN</span><span class="val">${this.esc(
      data.tpImunidade,
    )}</span></td>
    <td class="c"><span class="lbl">Suspensão da Exigibilidade do ISSQN</span><span class="val">${this.esc(
      data.tpSusp,
    )}</span></td>
    <td class="c"><span class="lbl">Número Processo Suspensão</span><span class="val">${this.esc(
      data.nProcesso,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">Benefício Municipal</span><span class="val">${this.esc(data.tpBM)}</span></td>
    <td class="c"><span class="lbl">Cálculo do BM</span><span class="val">${this.esc(data.calcBM)}</span></td>
    <td class="c"><span class="lbl">Total Deduções/Reduções</span><span class="val">${this.esc(
      data.totDedRed,
    )}</span></td>
    <td class="c"><span class="lbl">Desconto Incondicionado</span><span class="val">${this.esc(
      data.vDescIncondISSQN,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">BC ISSQN</span><span class="val">${this.esc(data.vBC)}</span></td>
    <td class="c"><span class="lbl">Alíquota Aplicada</span><span class="val">${this.esc(data.pAliqAplic)}</span></td>
    <td class="c"><span class="lbl">Retenção do ISSQN</span><span class="val">${this.esc(data.tpRetISSQN)}</span></td>
    <td class="c"><span class="lbl">ISSQN Apurado</span><span class="val">${this.esc(data.vISSQN)}</span></td>
  </tr>
  `
  }

  <!-- ═══ TRIBUTAÇÃO FEDERAL (EXCETO CBS) ═══ -->
  <tr class="row-sec-top">
    <td class="sec-title-label bg-cinza">Tributação Federal (Exceto CBS)</td>
    <td class="c"><span class="lbl">IRRF</span><span class="val">${this.esc(data.vRetIRRF)}</span></td>
    <td class="c"><span class="lbl">Contribuição Previdenciária - Retida</span><span class="val">${this.esc(
      data.vRetCP,
    )}</span></td>
    <td class="c"><span class="lbl">Contribuições Sociais - Retidas</span><span class="val">${this.esc(
      data.vRetCSLL,
    )}</span></td>
  </tr>
  ${
    data.exibirPisCofins
      ? `
  <tr>
    <td class="c"><span class="lbl">PIS - Débito Apuração Própria</span><span class="val">${this.esc(
      data.vPis,
    )}</span></td>
    <td class="c"><span class="lbl">COFINS - Débito Apuração Própria</span><span class="val">${this.esc(
      data.vCofins,
    )}</span></td>
    <td class="c" colspan="2"><span class="lbl">Descrição Contribuições Sociais - Retidas</span><span class="val">${this.esc(
      data.tpRetPisCofins,
    )}</span></td>
  </tr>
  `
      : ''
  }

  <!-- ═══ TRIBUTAÇÃO IBS / CBS ═══ -->
  <tr class="row-sec-top">
    <td class="sec-title-label bg-cinza">Tributação IBS / CBS</td>
    <td class="c"><span class="lbl">CST / cClassTrib</span><span class="val">${this.esc(data.cstClass)}</span></td>
    <td class="c" colspan="2"><span class="lbl">Indicador de Operação / Código IBGE Incidência / Município Incidência / UF</span><span class="val">${this.esc(
      data.indOpLocal,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">Exclusões e Reduções da Base de Cálculo</span><span class="val">${this.esc(
      data.exclRedBC,
    )}</span></td>
    <td class="c"><span class="lbl">Base de Cálculo Após Exclusões e Reduções</span><span class="val">${this.esc(
      data.vBCIbs,
    )}</span></td>
    <td class="c"><span class="lbl">Reduções da Alíquota IBS / Reduções da Alíquota CBS</span><span class="val">${this.esc(
      data.redAliq,
    )}</span></td>
    <td class="c"><span class="lbl">Alíquota IBS UF / IBS Municipal</span><span class="val">${this.esc(
      data.aliqIbs,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">Alíquota Efetiva Municipal – IBS</span><span class="val">${this.esc(
      data.pAliqEfetMun,
    )}</span></td>
    <td class="c"><span class="lbl">Valor Apurado Municipal – IBS</span><span class="val">${this.esc(
      data.vIBSMun,
    )}</span></td>
    <td class="c"><span class="lbl">Alíquota Efetiva Estadual – IBS</span><span class="val">${this.esc(
      data.pAliqEfetUF,
    )}</span></td>
    <td class="c"><span class="lbl">Valor Apurado Estadual – IBS</span><span class="val">${this.esc(
      data.vIBSUF,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">Valor Total Apurado – IBS</span><span class="val">${this.esc(
      data.vIBSTot,
    )}</span></td>
    <td class="c"><span class="lbl">Alíquota – CBS</span><span class="val">${this.esc(data.pCBS)}</span></td>
    <td class="c"><span class="lbl">Alíquota Efetiva – CBS</span><span class="val">${this.esc(
      data.pAliqEfetCBS,
    )}</span></td>
    <td class="c"><span class="lbl">Valor Total Apurado – CBS</span><span class="val">${this.esc(data.vCBS)}</span></td>
  </tr>

  <!-- ═══ VALOR TOTAL DA NFS-e ═══ -->
  <tr class="row-sec-top">
    <td class="sec-title-label bg-cinza">Valor Total da NFS-e</td>
    <td class="c"><span class="lbl">Valor da Operação / Serviço</span><span class="val"><strong>${this.esc(
      data.vServ,
    )}</strong></span></td>
    <td class="c"><span class="lbl">Desconto Incondicionado</span><span class="val">${this.esc(
      data.vDescIncond,
    )}</span></td>
    <td class="c"><span class="lbl">Desconto Condicionado</span><span class="val">${this.esc(
      data.vDescCond,
    )}</span></td>
  </tr>
  <tr>
    <td class="c"><span class="lbl">Total das Retenções (ISSQN / Federais)</span><span class="val">${this.esc(
      data.vTotalRet,
    )}</span></td>
    <td class="c"><span class="lbl">Valor Líquido da NFS-e</span><span class="val"><strong>${this.esc(
      data.vLiq,
    )}</strong></span></td>
    <td class="c"><span class="lbl">Total do IBS/CBS</span><span class="val">${this.esc(data.totIbsCbs)}</span></td>
    <td class="c bg-cinza"><span class="lbl">Valor Líquido + IBS/CBS</span><span class="val"><strong>${this.esc(
      data.vTotNF,
    )}</strong></span></td>
  </tr>

  <!-- ═══ INFORMAÇÕES COMPLEMENTARES ═══ -->
  <tr class="sec-title-full">
    <td class="sec-title-label bg-cinza" colspan="4">Informações Complementares</td>
  </tr>
  <tr class="info-compl">
    <td class="c" colspan="4" style="height:auto;min-height:20mm"><span class="val wrap">${this.esc(
      data.infoCompl,
    )}</span></td>
  </tr>

  <!-- ═══ CANHOTO (Nota 11 — opcional, implementado) ═══ -->
  ${
    data.canhotNumChave
      ? `
  <tr>
    <td colspan="4" style="padding-top: 40pt; padding-bottom: 4pt;">
      <table class="canhoto-table">
        <tr>
          <td class="canhoto-cell" style="width: 25%;"><span class="lbl">**** DATA CIENTIFICAÇÃO:</span><span class="val"></span></td>
          <td class="canhoto-cell" style="width: 45%;"><span class="lbl">IDENTIFICAÇÃO E ASSINATURA</span><span class="val"></span></td>
          <td class="canhoto-cell" style="width: 30%;"><span class="lbl">Nº NFS-e / CHAVE NFS-e</span><span class="val" style="font-size:5.5pt;letter-spacing:.2pt;word-break:break-all">${this.esc(
            data.canhotNumChave,
          )}</span></td>
        </tr>
      </table>
    </td>
  </tr>
  `
      : ''
  }
</table>
</div>

</div>
</body>
</html>`;
  }
}
