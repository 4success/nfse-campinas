import path from 'path';
import os from 'os';
import crypto from 'crypto';
import fs from 'fs';
import pem from 'pem';
import { SignedXml } from 'xml-crypto';
import { createClientAsync, NotaFiscalSoapClient } from '../soap/notafiscalsoap';
import {
  CancelarNfseInput,
  ConsultarLoteRpsInput,
  ConsultarNfseFaixaInput,
  ConsultarNfsePorRpsInput,
  ConsultarNfseServicoPrestadoInput,
  ConsultarNfseServicoTomadoInput,
  GerarNfseInput,
  RecepcionarLoteRpsInput,
  RecepcionarLoteRpsSincronoInput,
  ReferenceOptions,
  SubstituirNfseInput,
} from '../types/nfseCampinas';
import { ComputeSignatureOptions } from 'xml-crypto/lib/types';
import { XMLParser } from 'fast-xml-parser';
import xmlbuilder from 'xmlbuilder';

export class NfseCampinas {
  readonly defaultOptions: ReferenceOptions = {
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
    uri: 'rps@1',
  };
  protected readonly certTempFile: string;
  private soapClient: NotaFiscalSoapClient;

  constructor(
    protected host: string,
    protected certificate: Buffer,
    protected certPassword: string,
    protected debug: boolean = false,
  ) {
    const tempPath = path.join(os.tmpdir(), `cert-${crypto.randomBytes(4).readUInt32LE(0)}`);

    fs.writeFileSync(tempPath, certificate);
    this.certTempFile = tempPath;
  }

  /**
   * Após usar esse método, a classe deixa de ser utilizável
   */
  public cleanup() {
    fs.unlinkSync(this.certTempFile);
  }

  public async ConsultarNfsePorRps(input: ConsultarNfsePorRpsInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);

    try {
      return await client.ConsultarNfsePorRpsAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='ConsultarNfseRpsEnvio']`,
                action: 'append',
              },
            }, {
              xpath: `//*[local-name(.)='ConsultarNfseRpsEnvio']`,
              isEmptyUri: true,
            },
            pemCert,
          );
        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async ConsultarNfseServicoTomado(input: ConsultarNfseServicoTomadoInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);

    try {
      return await client.ConsultarNfseServicoTomadoAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='ConsultarNfseServicoTomadoEnvio']`,
                action: 'append',
              },
            }, {
              xpath: `//*[local-name(.)='ConsultarNfseServicoTomadoEnvio']`,
              isEmptyUri: true,
            },
            pemCert,
          );
        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async RecepcionarLoteRps(input: RecepcionarLoteRpsInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);

    try {
      return await client.RecepcionarLoteRpsAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
                action: 'after',
              },
            }, {
              xpath: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
            },
            pemCert,
          );
        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async RecepcionarLoteRpsSincrono(input: RecepcionarLoteRpsSincronoInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);

    try {
      return await client.RecepcionarLoteRpsSincronoAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
                action: 'after',
              },
            }, {
              xpath: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
            },
            pemCert,
          );
        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async ConsultarNfseServicoPrestado(input: ConsultarNfseServicoPrestadoInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);

    try {
      return await client.ConsultarNfseServicoPrestadoAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='ConsultarNfseServicoPrestadoEnvio']`,
                action: 'append',
              },
            }, {
              xpath: `//*[local-name(.)='ConsultarNfseServicoPrestadoEnvio']`,
              isEmptyUri: true,
            },
            pemCert,
          );
        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async CancelarNfse(input: CancelarNfseInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);
    try {
      return await client.CancelarNfseAsync(input, {
        postProcess: (xml: string) => this.getSignedXml(xml, {
            location: {
              reference: `//*[local-name(.)='InfPedidoCancelamento']`,
              action: 'after',
            },
          }, {
            xpath: `//*[local-name(.)='InfPedidoCancelamento']`,
          },
          pemCert,
        ),
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async ConsultarLoteRps(input: ConsultarLoteRpsInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);
    try {
      return await client.ConsultarLoteRpsAsync(input, {
        postProcess: (xml: string) => this.getSignedXml(xml, {
            location: {
              reference: `//*[local-name(.)='ConsultarLoteRpsEnvio']`,
              action: 'append',
            },
          }, {
            xpath: `//*[local-name(.)='ConsultarLoteRpsEnvio']`,
            isEmptyUri: true,
          },
          pemCert,
        ),
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async ConsultarNfseFaixa(input: ConsultarNfseFaixaInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);
    try {
      return await client.ConsultarNfseFaixaAsync(input, {
        postProcess: (xml: string) => this.getSignedXml(xml, {
            location: {
              reference: `//*[local-name(.)='ConsultarNfseFaixaEnvio']`,
              action: 'append',
            },
          }, {
            xpath: `//*[local-name(.)='ConsultarNfseFaixaEnvio']`,
            isEmptyUri: true,
          },
          pemCert,
        ),
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }

  }

  public async GerarNfse(input: GerarNfseInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);
    try {
      return await client.GerarNfseAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
                action: 'after',
              },
            }, {
              xpath: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
            },
            pemCert,
          );

        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  public async SubstituirNfse(input: SubstituirNfseInput) {
    const [client, pemCert] = await Promise.all([
      this.getSoapClient(),
      this.getPemCert(),
    ]);
    try {
      return await client.SubstituirNfseAsync(input, {
        postProcess: (originalXML: string) => {
          return this.getSignedXml(originalXML, {
              location: {
                reference: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
                action: 'after',
              },
            }, {
              xpath: `//*[local-name(.)='InfDeclaracaoPrestacaoServico']`,
            },
            pemCert,
          );
        },
      });
    } catch (err) {
      throw err;
    } finally {
      this.logLastRequestResponse(client);
    }
  }

  protected getSignedXml(xml: string, computeOptions: ComputeSignatureOptions, referenceOptions: ReferenceOptions, pemCert: pem.Pkcs12ReadResult) {
    const sig = new SignedXml({
      privateKey: pemCert.key,
      publicCert: pemCert.cert,
      implicitTransforms: ['http://www.w3.org/TR/2001/REC-xml-c14n-20010315'],
    });

    sig.addReference({
      ...this.defaultOptions,
      ...referenceOptions,
    });

    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
    sig.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

    /**
     * Aqui é necessário extrair somente o XML do conteúdo dentro do body para efetuar a assinatura
     * (por um motivo desconhecido). Mas funciona dessa forma!
     */
    const parser = new XMLParser({
      ignoreDeclaration: true,
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      numberParseOptions: {
        leadingZeros: true,
        hex: false,
      },
    });

    const parsedXml = parser.parse(xml);
    const messageJsObject = parsedXml['soap:Envelope']['soap:Body'];

    const bodyXml = xmlbuilder.create(messageJsObject, { headless: true });
    const xmlConverted = bodyXml.end();

    sig.computeSignature(xmlConverted, computeOptions);
    const signedXml = sig.getSignedXml();

    /**
     * Após assinado, precisamos reconstruir o XML original inserindo a parte da assinatura
     * Os namespaces e atributos serão preservados
     */
    parsedXml['soap:Envelope']['soap:Body'] = '';
    const bodyEnvelope = xmlbuilder.create(parsedXml);

    const bodyEnvelopeString = bodyEnvelope.end({ pretty: false });
    return bodyEnvelopeString.replace('<soap:Body/>', `<soap:Body>${signedXml}</soap:Body>`);
  }

  private logLastRequestResponse(client: NotaFiscalSoapClient) {
    if (this.debug) {
      console.log(client.lastRequest);
      console.log(client.lastResponse);
    }
  }

  private async getPemCert(): Promise<pem.Pkcs12ReadResult> {
    const pfx = fs.readFileSync(this.certTempFile);
    return await new Promise((resolve, reject) => {
      pem.readPkcs12(pfx, { p12Password: this.certPassword }, (err, cert) => {
        if (err) reject(err);
        else resolve(cert);
      });
    });
  }

  private async getSoapClient() {
    if (!this.soapClient) {
      this.soapClient = await createClientAsync(this.host);
    }
    return this.soapClient;
  }
}