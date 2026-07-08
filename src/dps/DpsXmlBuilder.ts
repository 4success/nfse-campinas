import xmlbuilder, { XMLElement } from 'xmlbuilder';
import { buildDpsId } from './buildDpsId';
import {
  normalizeCodigoTributacaoMunicipal,
  normalizeCodigoTributacaoNacional,
  normalizeCep,
  normalizeCnpj,
  normalizeCpf,
  normalizeMoney,
  normalizeMunicipio,
  normalizeNbs,
  normalizeNumeroDps,
  normalizeSerie,
} from './normalize';
import { ambienteToTpAmb, validateDpsInput } from './validators';
import { DpsInput, DpsXmlOptions, PrestadorDps, TomadorDps } from './types';
import { ValidationError } from '../errors/ValidationError';
import { formatDpsDate, formatDpsDateTime } from '../utils/dates';
import { sanitizeXmlText } from '../utils/xml';

export const DPS_VERSION = '1.01';
export const DPS_NAMESPACE = 'http://www.sped.fazenda.gov.br/nfse';

export type BuildDpsXmlResult = {
  xml: string;
  idDps: string;
};

function addText(parent: XMLElement, name: string, value: unknown): XMLElement | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return parent.ele(name, sanitizeXmlText(String(value)));
}

function addCpfCnpj(parent: XMLElement, entity: { cpf?: string; cnpj?: string }) {
  if (entity.cnpj) {
    addText(parent, 'CNPJ', normalizeCnpj(entity.cnpj));
    return;
  }
  if (entity.cpf) {
    addText(parent, 'CPF', normalizeCpf(entity.cpf));
  }
}

function addEndereco(parent: XMLElement, entity: TomadorDps) {
  if (!entity.endereco) {
    return;
  }

  const end = parent.ele('end');
  const endNac = end.ele('endNac');
  addText(endNac, 'cMun', normalizeMunicipio(entity.endereco.municipio));
  addText(endNac, 'CEP', entity.endereco.cep ? normalizeCep(entity.endereco.cep) : undefined);
  addText(end, 'xLgr', entity.endereco.logradouro);
  addText(end, 'nro', entity.endereco.numero);
  addText(end, 'xCpl', entity.endereco.complemento);
  addText(end, 'xBairro', entity.endereco.bairro);
}

function addPrestador(parent: XMLElement, prestador: PrestadorDps) {
  const prest = parent.ele('prest');
  addCpfCnpj(prest, prestador);
  addText(prest, 'IM', prestador.inscricaoMunicipal);
  addText(prest, 'xNome', prestador.razaoSocial);

  if (prestador.regimeTributario) {
    const regTrib = prest.ele('regTrib');
    addText(regTrib, 'opSimpNac', prestador.regimeTributario.opcaoSimplesNacional);
    addText(regTrib, 'regEspTrib', prestador.regimeTributario.regimeEspecialTributacao);
  }
}

function addTomador(parent: XMLElement, tag: 'toma' | 'dest', tomador?: TomadorDps) {
  if (!tomador) {
    return;
  }

  const toma = parent.ele(tag);
  addCpfCnpj(toma, tomador);
  addText(toma, 'NIF', tomador.nif);
  addText(toma, 'xNome', tomador.razaoSocial);
  addEndereco(toma, tomador);
  addText(toma, 'fone', tomador.telefone);
  addText(toma, 'email', tomador.email);
}

function resolveIdDps(input: DpsInput): string {
  if (input.idDps) {
    return input.idDps;
  }

  const inscricaoFederal = input.prestador.cnpj || input.prestador.cpf || '';
  return buildDpsId({
    codigoMunicipioEmissao: input.municipioEmissao,
    tipoInscricaoFederal: input.prestador.cnpj ? '2' : '1',
    inscricaoFederal,
    serie: input.serie,
    numeroDps: input.numeroDps,
  });
}

export class DpsXmlBuilder {
  constructor(private readonly defaultOptions: DpsXmlOptions = {}) {}

  build(input: DpsInput): BuildDpsXmlResult {
    const validationMode = input.validationMode || 'strict';
    const issues = validationMode === 'off' ? [] : validateDpsInput(input);
    const errors = validationMode === 'off' ? [] : issues.filter((issue) => issue.severity === 'error');

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    const options = { ...this.defaultOptions, ...input.xml };
    const idTarget = options.idAttributeTarget || 'infDPS';
    const idDps = resolveIdDps(input);
    const rootAttributes: Record<string, string> = { versao: DPS_VERSION };

    if (options.namespace !== false) {
      rootAttributes.xmlns = options.namespace || DPS_NAMESPACE;
    }
    if (idTarget === 'DPS') {
      rootAttributes.Id = idDps;
    }

    const root = xmlbuilder.create('DPS', { encoding: 'UTF-8', standalone: false }).att(rootAttributes);
    const infDpsAttributes = idTarget === 'infDPS' ? { Id: idDps } : undefined;
    const infDps = root.ele('infDPS', infDpsAttributes);

    addText(infDps, 'tpAmb', ambienteToTpAmb(input.ambiente));
    addText(infDps, 'dhEmi', formatDpsDateTime(input.dataHoraEmissao));
    addText(infDps, 'verAplic', input.versaoAplicativo || DPS_VERSION);
    addText(infDps, 'serie', normalizeSerie(input.serie));
    addText(infDps, 'nDPS', normalizeNumeroDps(input.numeroDps));
    addText(infDps, 'dCompet', formatDpsDate(input.dataCompetencia));
    addText(infDps, 'tpEmit', input.tipoEmitente);
    addText(infDps, 'cLocEmi', normalizeMunicipio(input.municipioEmissao));

    addPrestador(infDps, input.prestador);
    addTomador(infDps, 'toma', input.tomador);
    addTomador(infDps, 'dest', input.destinatario);

    const serv = infDps.ele('serv');
    const locPrest = serv.ele('locPrest');
    addText(locPrest, 'cLocPrestacao', normalizeMunicipio(input.servico.municipioPrestacao));
    const cServ = serv.ele('cServ');
    addText(cServ, 'cTribNac', normalizeCodigoTributacaoNacional(input.servico.codigoTributacaoNacional));
    addText(
      cServ,
      'cTribMun',
      input.servico.codigoTributacaoMunicipal
        ? normalizeCodigoTributacaoMunicipal(input.servico.codigoTributacaoMunicipal)
        : undefined,
    );
    addText(cServ, 'xDescServ', input.servico.descricao);
    addText(cServ, 'cNBS', input.servico.codigoNbs ? normalizeNbs(input.servico.codigoNbs) : undefined);

    const valores = infDps.ele('valores');
    const vServPrest = valores.ele('vServPrest');
    addText(vServPrest, 'vServ', normalizeMoney(input.valores.valorServico));
    if (
      input.valores.valorDescontoIncondicionado !== undefined ||
      input.valores.valorDescontoCondicionado !== undefined
    ) {
      const vDescCondIncond = valores.ele('vDescCondIncond');
      addText(
        vDescCondIncond,
        'vDescIncond',
        input.valores.valorDescontoIncondicionado !== undefined
          ? normalizeMoney(input.valores.valorDescontoIncondicionado)
          : undefined,
      );
      addText(
        vDescCondIncond,
        'vDescCond',
        input.valores.valorDescontoCondicionado !== undefined
          ? normalizeMoney(input.valores.valorDescontoCondicionado)
          : undefined,
      );
    }

    const hasTributacao = Boolean(
      input.valores.tributacaoMunicipal || input.valores.tributacaoFederal || input.valores.totalTributos,
    );
    const trib = hasTributacao ? valores.ele('trib') : undefined;

    if (input.valores.tributacaoMunicipal && trib) {
      const tribMun = trib.ele('tribMun');
      addText(tribMun, 'tribISSQN', input.valores.tributacaoMunicipal.tributacaoIssqn);
      addText(tribMun, 'tpRetISSQN', input.valores.tributacaoMunicipal.tipoRetencaoIssqn);
      addText(
        tribMun,
        'pAliq',
        input.valores.tributacaoMunicipal.aliquota !== undefined
          ? normalizeMoney(input.valores.tributacaoMunicipal.aliquota, 2)
          : undefined,
      );
    }

    if (input.valores.tributacaoFederal && trib) {
      const tribFed = trib.ele('tribFed');
      const pisCofins = input.valores.tributacaoFederal.pisCofins;
      if (pisCofins) {
        const piscofins = tribFed.ele('piscofins');
        addText(piscofins, 'CST', pisCofins.cst);
        addText(
          piscofins,
          'vBCPisCofins',
          pisCofins.baseCalculo !== undefined ? normalizeMoney(pisCofins.baseCalculo) : undefined,
        );
        addText(
          piscofins,
          'pAliqPis',
          pisCofins.aliquotaPis !== undefined ? normalizeMoney(pisCofins.aliquotaPis) : undefined,
        );
        addText(
          piscofins,
          'pAliqCofins',
          pisCofins.aliquotaCofins !== undefined ? normalizeMoney(pisCofins.aliquotaCofins) : undefined,
        );
        addText(piscofins, 'vPis', pisCofins.valorPis !== undefined ? normalizeMoney(pisCofins.valorPis) : undefined);
        addText(
          piscofins,
          'vCofins',
          pisCofins.valorCofins !== undefined ? normalizeMoney(pisCofins.valorCofins) : undefined,
        );
        addText(piscofins, 'tpRetPisCofins', pisCofins.tipoRetencaoPisCofins);
      }
      addText(
        tribFed,
        'vRetIRRF',
        input.valores.tributacaoFederal.valorRetidoIrrf !== undefined
          ? normalizeMoney(input.valores.tributacaoFederal.valorRetidoIrrf)
          : undefined,
      );
      addText(
        tribFed,
        'vRetCSLL',
        input.valores.tributacaoFederal.valorRetidoCsll !== undefined
          ? normalizeMoney(input.valores.tributacaoFederal.valorRetidoCsll)
          : undefined,
      );
      addText(
        tribFed,
        'vRetINSS',
        input.valores.tributacaoFederal.valorRetidoInss !== undefined
          ? normalizeMoney(input.valores.tributacaoFederal.valorRetidoInss)
          : undefined,
      );
    }

    if (input.valores.totalTributos && trib) {
      const totTrib = trib.ele('totTrib');
      addText(totTrib, 'indTotTrib', input.valores.totalTributos.indicadorTotalTributos);
      addText(
        totTrib,
        'pTotTrib',
        input.valores.totalTributos.percentualTotalTributos !== undefined
          ? normalizeMoney(input.valores.totalTributos.percentualTotalTributos)
          : undefined,
      );
      addText(
        totTrib,
        'vTotTrib',
        input.valores.totalTributos.valorTotalTributos !== undefined
          ? normalizeMoney(input.valores.totalTributos.valorTotalTributos)
          : undefined,
      );
    }

    if (input.ibsCbs) {
      const ibsCbs = infDps.ele('IBSCBS');
      addText(ibsCbs, 'finNFSe', input.ibsCbs.finalidadeNfse);
      addText(ibsCbs, 'cIndOp', input.ibsCbs.codigoIndicadorOperacao);
      addText(ibsCbs, 'indDest', input.ibsCbs.indicadorDestinatario);
      addText(ibsCbs, 'cClassTrib', input.ibsCbs.classificacaoTributaria);
      addText(ibsCbs, 'indZFManAlc', input.ibsCbs.indicadorZonaFrancaManausAlc);
    }

    return {
      idDps,
      xml: root.end({ pretty: false }),
    };
  }
}
