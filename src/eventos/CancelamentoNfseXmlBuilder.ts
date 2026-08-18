import xmlbuilder, { XMLElement } from 'xmlbuilder';
import { normalizeCnpj, normalizeCpf } from '../dps/normalize';
import { ValidationError } from '../errors/ValidationError';
import {
  BuildCancelamentoNfseXmlResult,
  CancelamentoNfseXmlBuilderContext,
  CancelarNfseDadosInput,
  CODIGO_EVENTO_CANCELAMENTO_NFSE,
} from './types';
import { formatDataHoraEvento, normalizeChaveAcessoNfse, validateCancelarNfseDadosInput } from './validators';

export const PEDIDO_REGISTRO_EVENTO_VERSION = '1.01';
export const NFSE_NAMESPACE = 'http://www.sped.fazenda.gov.br/nfse';

function addText(parent: XMLElement, name: string, value: string | number): XMLElement {
  return parent.ele(name).txt(String(value));
}

function ambienteToTpAmb(ambiente: CancelamentoNfseXmlBuilderContext['ambiente']): 1 | 2 {
  return ambiente === 'producao' ? 1 : 2;
}

export class CancelamentoNfseXmlBuilder {
  constructor(private readonly context: CancelamentoNfseXmlBuilderContext) {}

  build(input: CancelarNfseDadosInput): BuildCancelamentoNfseXmlResult {
    const dataHoraEvento = input?.dataHoraEvento ?? this.context.agora?.() ?? new Date();
    const versaoAplicativo = input?.versaoAplicativo ?? this.context.versaoAplicativoPadrao;
    const issues = validateCancelarNfseDadosInput(input, this.context, dataHoraEvento, versaoAplicativo);

    if (issues.length > 0) {
      throw new ValidationError(issues, 'Pedido de Registro de Evento inválido');
    }

    const chaveAcesso = normalizeChaveAcessoNfse(input.chaveAcesso);
    const idPedidoRegistroEvento = `PRE${chaveAcesso}${CODIGO_EVENTO_CANCELAMENTO_NFSE}`;
    const root = xmlbuilder
      .create('pedRegEvento', { encoding: 'UTF-8' })
      .att('xmlns', NFSE_NAMESPACE)
      .att('versao', PEDIDO_REGISTRO_EVENTO_VERSION);
    const infPedReg = root.ele('infPedReg').att('Id', idPedidoRegistroEvento);

    addText(infPedReg, 'tpAmb', ambienteToTpAmb(this.context.ambiente));
    addText(infPedReg, 'verAplic', versaoAplicativo);
    addText(infPedReg, 'dhEvento', formatDataHoraEvento(dataHoraEvento));

    if ('cnpj' in input.autor && input.autor.cnpj !== undefined) {
      addText(infPedReg, 'CNPJAutor', normalizeCnpj(input.autor.cnpj));
    } else {
      addText(infPedReg, 'CPFAutor', normalizeCpf(input.autor.cpf));
    }

    addText(infPedReg, 'chNFSe', chaveAcesso);
    const evento = infPedReg.ele(`e${CODIGO_EVENTO_CANCELAMENTO_NFSE}`);
    addText(evento, 'xDesc', 'Cancelamento de NFS-e');
    addText(evento, 'cMotivo', input.codigoMotivo);
    addText(evento, 'xMotivo', input.motivo);

    return {
      xml: root.end({ pretty: false }),
      idPedidoRegistroEvento,
      chaveAcesso,
    };
  }
}
