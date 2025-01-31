import type { Reference } from 'xml-crypto/lib/types';

export type ReferenceOptions = Partial<Reference> & Pick<Reference, 'xpath'>;

export type ImprimirNfseRequest = {
  cnpj: string;
  inscricaoMunicipal: string;
  numeroNfse: string;
  codigoVerificacao: string;
}