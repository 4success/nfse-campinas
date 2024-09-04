import {
  ConsultarLoteRpsEnvio,
  ConsultarNfseFaixaEnvio,
  ConsultarNfseRpsEnvio,
  ConsultarNfseServicoPrestadoEnvio,
  ConsultarNfseServicoTomadoEnvio,
  DeclaracaoPrestacaoServico,
  EnviarLoteRpsEnvio,
  EnviarLoteRpsSincronoEnvio,
  Pedido,
  SubstituirNfseEnvio,
} from '../soap/notafiscalsoap';
import type { Reference } from 'xml-crypto/lib/types';

export type ConsultarNfsePorRpsInput = {
  ConsultarNfseRpsEnvio?: Omit<ConsultarNfseRpsEnvio, 'Signature'>;
}

export type ConsultarNfseServicoTomadoInput = {
  ConsultarNfseServicoTomadoEnvio?: Omit<ConsultarNfseServicoTomadoEnvio, 'Signature'>;
}

export type RecepcionarLoteRpsInput = {
  EnviarLoteRpsEnvio?: Omit<EnviarLoteRpsEnvio, 'Signature'>;
}
export type RecepcionarLoteRpsSincronoInput = {
  EnviarLoteRpsSincronoEnvio?: Omit<EnviarLoteRpsSincronoEnvio, 'Signature'>;
}

export type ConsultarNfseServicoPrestadoInput = {
  ConsultarNfseServicoPrestadoEnvio?: Omit<ConsultarNfseServicoPrestadoEnvio, 'Signature'>;
}

export type CancelarNfseInput = {
  CancelarNfseEnvio: {
    Pedido: Omit<Pedido, 'Signature'>,
  }
}

export type ConsultarLoteRpsInput = {
  ConsultarLoteRpsEnvio?: Omit<ConsultarLoteRpsEnvio, 'Signature'>;
}

export type ConsultarNfseFaixaInput = {
  ConsultarNfseFaixaEnvio?: Omit<ConsultarNfseFaixaEnvio, 'Signature'>;
}

export type GerarNfseInput = {
  GerarNfseEnvio: {
    Rps: Omit<DeclaracaoPrestacaoServico, 'Signature'>;
  }
}

export type SubstituirNfseInput = {
  SubstituirNfseEnvio?: Omit<SubstituirNfseEnvio, 'Signature'>;
}

export type ReferenceOptions = Partial<Reference> & Pick<Reference, 'xpath'>;