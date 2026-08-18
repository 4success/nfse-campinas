import { NfseCampinasV3Environment } from '../dps/types';

export const CODIGO_EVENTO_CANCELAMENTO_NFSE = '101101' as const;

export type AutorCancelamentoNfse =
  | {
      cpf: string;
      cnpj?: never;
    }
  | {
      cnpj: string;
      cpf?: never;
    };

export type CodigoMotivoCancelamentoNfse = 1 | 2 | 9;

export type CancelarNfseDadosInput = {
  chaveAcesso: string;
  autor: AutorCancelamentoNfse;
  codigoMotivo: CodigoMotivoCancelamentoNfse;
  motivo: string;
  dataHoraEvento?: string | Date;
  versaoAplicativo?: string;
  signedXml?: never;
};

export type CancelamentoNfseXmlBuilderContext = {
  ambiente: NfseCampinasV3Environment;
  versaoAplicativoPadrao: string;
  agora?: () => Date;
};

export type BuildCancelamentoNfseXmlResult = {
  xml: string;
  idPedidoRegistroEvento: string;
  chaveAcesso: string;
};
