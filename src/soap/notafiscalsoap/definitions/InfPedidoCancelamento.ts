import { IdentificacaoNfse } from './IdentificacaoNfse';

/**
 * InfPedidoCancelamento
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.abrasf.org.br/nfse.xsd`
 */
export interface InfPedidoCancelamento {
  /** IdentificacaoNfse */
  IdentificacaoNfse: IdentificacaoNfse;
  /** xs:string */
  CodigoCancelamento?: CodigoCancelamento;
}

export enum CodigoCancelamento {
  ErroNaEmissao = '1',
  ServicoNaoPrestado = '2',
  ErroAssinatura = '3',
  DuplicidadeNota = '4',
  ErroProcessamento = '5',
}
