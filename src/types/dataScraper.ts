export namespace ConsultaUrlNfse {
  export type Request = {
    cnpj: string,
    nfNum: string | number;
    codVerificacao: string;
    inscricaoMunicipal: string;
  }

  export type Response = {
    url: string,
    id_nota_fiscal: string,
    confirma: string,
    temPrestador: string,
    doc_prestador: string,
    numero_nota_fiscal: string,
    inscricao_prestador: string,
    cod_verificacao: string,
  }
}


export namespace ImprimePdfNfse {
  export type Return = {
    nfse: string;
    pdfBase64Content: string;
  }
}