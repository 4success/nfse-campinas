import { NfseCampinas } from '../src';
import fs from 'fs';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';
import { TipoRps } from '../src/soap/notafiscalsoap/definitions/IdentificacaoRps';
import { CodigoCancelamento } from '../src/soap/notafiscalsoap/definitions/InfPedidoCancelamento';

dotenv.config();

const certFile = fs.readFileSync(process.env.CERTIFICATE_PATH);
const certPassword = process.env.CERTIFICATE_PASSWORD;

const nfse = new NfseCampinas(
  'https://homol-rps.ima.sp.gov.br/notafiscal-abrasfv203-ws/NotaFiscalSoap?wsdl',
  certFile,
  certPassword,
  true,
);

jest.setTimeout(3600000);

describe('Nfse Campinas', () => {
  beforeAll(() => {

  });

  test('ConsultarNfsePorRps', async () => {
    const response = await nfse.ConsultarNfsePorRps({
      ConsultarNfseRpsEnvio: {
        IdentificacaoRps: {
          Numero: '1',
          Tipo: TipoRps.RPS,
          Serie: '99',
        },
        Prestador: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
        },
      },
    });

    expect(response.length).toBeGreaterThan(0);
  });

  test('ConsultarNfseServicoTomado', async () => {
    const response = await nfse.ConsultarNfseServicoTomado({
      ConsultarNfseServicoTomadoEnvio: {
        Tomador: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
        },
      },
    });

    expect(response.length).toBeGreaterThan(0);
  });

  test('RecepcionarLoteRps', async () => {
    const response = await nfse.RecepcionarLoteRps({
      EnviarLoteRpsEnvio: {
        LoteRps: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
          InscricaoMunicipal: '2163896',
          NumeroLote: '1',
          QuantidadeRps: 1,
          ListaRps: {
            Rps: [{
              InfDeclaracaoPrestacaoServico: {
                Servico: {
                  CodigoCnae: 620400001,
                  CodigoMunicipio: 6291,
                  Discriminacao: 'Teste RPS',
                  Valores: {
                    ValorServicos: 10,
                    ValorDeducoes: 0,
                    ValorPis: 0,
                    ValorCofins: 0,
                    ValorInss: 0,
                    ValorCsll: 0,
                    OutrasRetencoes: 0,
                    ValTotTributos: 0,
                    ValorIss: 0,
                    Aliquota: 2,
                    ValorIr: 0,
                    DescontoCondicionado: 0,
                    DescontoIncondicionado: 0,
                  },
                },
                Tomador: {
                  IdentificacaoTomador: {
                    CpfCnpj: {
                      Cpf: '36808081867',
                    },
                  },
                  Endereco: {
                    Endereco: 'Avenida Alexandre Cazellato',
                    Numero: '378',
                    Complemento: 'CASA 20',
                    CodigoMunicipio: 6291,
                    Cep: '13148218',
                    Bairro: 'Betel',
                    Uf: 'SP',
                  },
                },
                Rps: {
                  IdentificacaoRps: {
                    Numero: '1',
                    Tipo: TipoRps.RPS,
                    Serie: '99',
                  },
                  DataEmissao: DateTime.now().toISODate(),
                  Status: '1',
                },
                Competencia: DateTime.now().toISODate(),
                Prestador: {
                  CpfCnpj: {
                    Cnpj: '15547137000138',
                  },
                  InscricaoMunicipal: '2163896',
                },
              },
            }],
          },
        },
      },
    });
    expect(response.length).toBeGreaterThan(0);
  });

  test('RecepcionarLoteRpsSincrono', async () => {
    const response = await nfse.RecepcionarLoteRpsSincrono({
      EnviarLoteRpsSincronoEnvio: {
        LoteRps: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
          InscricaoMunicipal: '2163896',
          NumeroLote: '1',
          QuantidadeRps: 1,
          ListaRps: {
            Rps: [{
              InfDeclaracaoPrestacaoServico: {
                Servico: {
                  CodigoCnae: 620400001,
                  CodigoMunicipio: 6291,
                  Discriminacao: 'Teste RPS',
                  Valores: {
                    ValorServicos: 10,
                    ValorDeducoes: 0,
                    ValorPis: 0,
                    ValorCofins: 0,
                    ValorInss: 0,
                    ValorCsll: 0,
                    OutrasRetencoes: 0,
                    ValTotTributos: 0,
                    ValorIss: 0,
                    Aliquota: 2,
                    ValorIr: 0,
                    DescontoCondicionado: 0,
                    DescontoIncondicionado: 0,
                  },
                },
                Tomador: {
                  IdentificacaoTomador: {
                    CpfCnpj: {
                      Cpf: '36808081867',
                    },
                  },
                  Endereco: {
                    Endereco: 'Avenida Alexandre Cazellato',
                    Numero: '378',
                    Complemento: 'CASA 20',
                    CodigoMunicipio: 6291,
                    Cep: '13148218',
                    Bairro: 'Betel',
                    Uf: 'SP',
                  },
                },
                Rps: {
                  IdentificacaoRps: {
                    Numero: '1',
                    Tipo: TipoRps.RPS,
                    Serie: '99',
                  },
                  DataEmissao: DateTime.now().toISODate(),
                  Status: '1',
                },
                Competencia: DateTime.now().toISODate(),
                Prestador: {
                  CpfCnpj: {
                    Cnpj: '15547137000138',
                  },
                  InscricaoMunicipal: '2163896',
                },
              },
            }],
          },
        },
      },
    });
    expect(response.length).toBeGreaterThan(0);
  });

  test('ConsultarNfseServicoPrestado', async () => {
    const response = await nfse.ConsultarNfseServicoPrestado({
      ConsultarNfseServicoPrestadoEnvio: {
        Prestador: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
        },
        PeriodoCompetencia: {
          DataFinal: DateTime.now().toISODate(),
          DataInicial: DateTime.now().minus({ day: 30 }).toISODate(),
        },
      },
    });
    expect(response.length).toBeGreaterThan(0);
  });

  test('CancelarNfse', async () => {
    const response = await nfse.CancelarNfse({
      CancelarNfseEnvio: {
        Pedido: {
          InfPedidoCancelamento: {
            CodigoCancelamento: CodigoCancelamento.ServicoNaoPrestado,
            IdentificacaoNfse: {
              Numero: '2000',
              CpfCnpj: {
                Cnpj: '15547137000138',
              },
              CodigoMunicipio: 432910311,
              InscricaoMunicipal: '02163896',
            },
          },
        },
      },
    });
    expect(response.length).toBeGreaterThan(0);
  });

  test('ConsultarLoteRps', async () => {
    const response = await nfse.ConsultarLoteRps({
      ConsultarLoteRpsEnvio: {
        Prestador: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
          InscricaoMunicipal: '2163896',
        },
        Protocolo: '0181bbef7456e26a7486482f9c1b5bb502b7600d',
      },
    });

    expect(response.length).toBeGreaterThan(0);
  });

  test('ConsultarNfseFaixa', async () => {
    const response = await nfse.ConsultarNfseFaixa({
      ConsultarNfseFaixaEnvio: {
        Faixa: {
          NumeroNfseFinal: '9999',
          NumeroNfseInicial: '1',
        },
        Prestador: {
          CpfCnpj: {
            Cnpj: '15547137000138',
          },
          InscricaoMunicipal: '002163896',
        },
        Pagina: '1',
      },
    });

    expect(response.length).toBeGreaterThan(0);
  });

  test('GerarNfse', async () => {
    const response = await nfse.GerarNfse({
      GerarNfseEnvio: {
        Rps: {
          InfDeclaracaoPrestacaoServico: {
            Servico: {
              CodigoCnae: 620400001,
              CodigoMunicipio: 432910311,
              Discriminacao: 'Teste RPS',
              IssRetido: '2',
              Valores: {
                ValorServicos: 10,
                ValorDeducoes: 0,
                ValorPis: 0,
                ValorCofins: 0,
                ValorInss: 0,
                ValorCsll: 0,
                OutrasRetencoes: 0,
                ValTotTributos: 0,
                ValorIss: 0,
                Aliquota: 2,
                ValorIr: 0,
                DescontoCondicionado: 0,
                DescontoIncondicionado: 0,
              },
            },
            Tomador: {
              IdentificacaoTomador: {
                CpfCnpj: {
                  Cpf: '36808081867',
                },
              },
              Endereco: {
                Endereco: 'Avenida Alexandre Cazellato',
                Numero: '378',
                Complemento: 'CASA 20',
                CodigoMunicipio: 6291,
                Cep: '13148218',
                Bairro: 'Betel',
                Uf: 'SP',
              },
            },
            Rps: {
              IdentificacaoRps: {
                Numero: '1',
                Tipo: TipoRps.RPS,
                Serie: '99',
              },
              DataEmissao: DateTime.now().toISODate(),
              Status: '1',
            },
            Competencia: DateTime.now().toISODate(),
            Prestador: {
              CpfCnpj: {
                Cnpj: '15547137000138',
              },
              InscricaoMunicipal: '02163896',
            },
          },
        },
      },
    });
    expect(response.length).toBeGreaterThan(0);
  });

  test('SubstituirNfse', async () => {
    const response = await nfse.SubstituirNfse({
      SubstituirNfseEnvio: {
        SubstituicaoNfse: {
          Rps: {
            InfDeclaracaoPrestacaoServico: {
              Servico: {
                CodigoCnae: 620400001,
                CodigoMunicipio: 432910311,
                Discriminacao: 'Teste RPS',
                IssRetido: '2',
                Valores: {
                  ValorServicos: 10,
                  ValorDeducoes: 0,
                  ValorPis: 0,
                  ValorCofins: 0,
                  ValorInss: 0,
                  ValorCsll: 0,
                  OutrasRetencoes: 0,
                  ValTotTributos: 0,
                  ValorIss: 0,
                  Aliquota: 2,
                  ValorIr: 0,
                  DescontoCondicionado: 0,
                  DescontoIncondicionado: 0,
                },
              },
              Tomador: {
                IdentificacaoTomador: {
                  CpfCnpj: {
                    Cpf: '36808081867',
                  },
                },
                Endereco: {
                  Endereco: 'Avenida Alexandre Cazellato',
                  Numero: '378',
                  Complemento: 'CASA 20',
                  CodigoMunicipio: 6291,
                  Cep: '13148218',
                  Bairro: 'Betel',
                  Uf: 'SP',
                },
              },
              Rps: {
                IdentificacaoRps: {
                  Numero: '1',
                  Tipo: TipoRps.RPS,
                  Serie: '99',
                },
                DataEmissao: DateTime.now().toISODate(),
                Status: '1',
              },
              Competencia: DateTime.now().toISODate(),
              Prestador: {
                CpfCnpj: {
                  Cnpj: '15547137000138',
                },
                InscricaoMunicipal: '02163896',
              },
            },
          },
          Pedido: {
            InfPedidoCancelamento: {
              CodigoCancelamento: CodigoCancelamento.ErroNaEmissao,
              IdentificacaoNfse: {
                Numero: '2000',
                CpfCnpj: {
                  Cnpj: '15547137000138',
                },
                CodigoMunicipio: 432910311,
                InscricaoMunicipal: '02163896',
              },
            },
          },
        },
      },
    });
  });

  afterAll(() => {
    nfse.cleanup();
  });

});