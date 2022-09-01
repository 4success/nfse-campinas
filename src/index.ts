import xmlbuilder from 'xmlbuilder';
import { createClientAsync } from './soap/loteRps';
import {
  CancelarNfseRequest,
  CancelarNfseResponse,
  ConsultaLoteRequest,
  ConsultaLoteResponse,
  ConsultarNotaRequest,
  ConsultarNotaResponse,
  ConsultaSequencialRps,
  EnvioLoteResponse,
  EnvioRpsRequest,
  TipoRecolhimento,
} from './types/nfseCampinas';
import path from 'path';
import os from 'os';
import fs from 'fs';
import crypto from 'crypto';
import { SignedXml } from 'xml-crypto';
import { DateTime } from 'luxon';
import sha1 from 'sha1';
import { XMLParser } from 'fast-xml-parser';
import { ConsultaUrlNfse, ImprimePdfNfse } from './types/dataScraper';
import chromium from 'chrome-aws-lambda';
import { URL } from 'url';
import pem from 'pem';

const parser = new XMLParser({
  ignoreDeclaration: true,
  numberParseOptions: {
    leadingZeros: true,
    hex: false,
  },
});

function MyKeyInfo(pem: { certificate: string; key: string }) {
  this.getKeyInfo = function (key, prefix) {
    prefix = prefix || '';
    prefix = prefix ? prefix + ':' : prefix;
    const certificate = pem.certificate
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .split('\n')
      .join('');

    return `<${prefix}X509Data><${prefix}X509Certificate>${certificate}</${prefix}X509Certificate></${prefix}X509Data>`;
  };
  this.getKey = function (keyInfo) {
    return Buffer.from(pem.key);
  };
}

export class NfseCampinas {
  protected readonly certTempFile: string;

  constructor(
    protected host: string,
    protected certificate: Buffer,
    protected certPassword: string,
    protected debug = false,
  ) {
    const tempPath = path.join(os.tmpdir(), `cert-${crypto.randomBytes(4).readUInt32LE(0)}`);

    fs.writeFileSync(tempPath, certificate);
    this.certTempFile = tempPath;
  }

  /**
   * Depois de usar esse método, a classe deixa de ser utilizável
   */
  public cleanup() {
    fs.unlinkSync(this.certTempFile);
  }

  async cancelarNotaFiscal(
    parametrosConsulta: CancelarNfseRequest.RootObject,
  ): Promise<CancelarNfseResponse.Ns1RetornoCancelamentoNFSe> {
    const payload = {
      'ns1:ReqCancelamentoNFSe': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation':
          'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ReqCancelamentoNFSe.xsd',
        Cabecalho: parametrosConsulta.Cabecalho,
        Lote: parametrosConsulta.Lote,
      },
    };

    const latin1Json = JSON.parse(Buffer.from(JSON.stringify(payload), 'utf8').toString('latin1'));

    const xml = xmlbuilder.create(latin1Json, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });

    const signedXml = await this.getSignedXml(xmlConverted, 'Lote');
    const soapClient = await createClientAsync(this.host);
    try {
      const [wsResponse] = await soapClient.cancelarAsync({
        mensagemXml: signedXml,
      });
      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta;
      try {
        resposta = parser.parse(wsResponse.cancelarReturn.$value) as unknown as CancelarNfseResponse.RootObject;
      } catch (e) {
        throw Error(wsResponse.cancelarReturn.$value);
      }

      if (resposta['ns1:RetornoCancelamentoNFSe']) {
        return resposta['ns1:RetornoCancelamentoNFSe'];
      }
      throw Error(wsResponse.cancelarReturn.$value);
    } catch (e) {
      throw Error(e.message);
    }
  }

  async consultaSequenciaRps(
    parametrosConsulta: ConsultaSequencialRps.Request,
  ): Promise<ConsultaSequencialRps.Ns1RetornoConsultaSeqRps> {
    const payload = {
      'ns1:ConsultaSeqRps': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation': 'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ConsultaSeqRps.xsd',
        Cabecalho: {
          CodCid: parametrosConsulta.CodCid,
          IMPrestador: parametrosConsulta.IMPrestador,
          CPFCNPJRemetente: parametrosConsulta.CPFCNPJRemetente,
          SeriePrestacao: parametrosConsulta.SeriePrestacao,
          Versao: parametrosConsulta.Versao,
        },
      },
    };

    const xml = xmlbuilder.create(payload, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });

    const soapClient = await createClientAsync(this.host);
    try {
      const [wsResponse] = await soapClient.consultarSequencialRpsAsync({
        mensagemXml: xmlConverted,
      });
      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta: ConsultaSequencialRps.Response;
      try {
        resposta = parser.parse(
          wsResponse.consultarSequencialRpsReturn.$value,
        ) as unknown as ConsultaSequencialRps.Response;
      } catch (e) {
        throw Error(wsResponse.consultarSequencialRpsReturn.$value);
      }
      if (resposta['ns1:RetornoConsultaSeqRps']) {
        return resposta['ns1:RetornoConsultaSeqRps'];
      }
      throw Error(wsResponse.consultarSequencialRpsReturn.$value);
    } catch (e) {
      throw Error(e.message);
    }
  }

  async consultarLote(
    parametrosConsulta: ConsultaLoteRequest.Cabecalho,
  ): Promise<ConsultaLoteResponse.RetornoConsultaLote> {
    const payload = {
      'ns1:ReqConsultaLote': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation': 'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ReqConsultaLote.xsd',
        Cabecalho: {
          CodCidade: parametrosConsulta.CodCidade,
          CPFCNPJRemetente: parametrosConsulta.CPFCNPJRemetente,
          Versao: parametrosConsulta.Versao,
          NumeroLote: parametrosConsulta.NumeroLote,
        },
      },
    };
    const xml = xmlbuilder.create(payload, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });

    const soapClient = await createClientAsync(this.host);
    try {
      const [wsResponse] = await soapClient.consultarLoteAsync({
        mensagemXml: xmlConverted,
      });

      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta: ConsultaLoteResponse.RootObject;
      try {
        resposta = parser.parse(wsResponse.consultarLoteReturn.$value) as unknown as ConsultaLoteResponse.RootObject;
      } catch (e) {
        throw Error(wsResponse.consultarLoteReturn.$value);
      }
      if (resposta['ns1:RetornoConsultaLote']) {
        return resposta['ns1:RetornoConsultaLote'];
      }
      throw Error(wsResponse.consultarLoteReturn.$value);
    } catch (e) {
      throw Error(e.message);
    }
  }

  async enviarLoteAssincrono(request: EnvioRpsRequest.Padrao): Promise<EnvioLoteResponse.RetornoEnvioLoteRPS> {
    const payload = {
      'ns1:ReqEnvioLoteRPS': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation': 'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ReqEnvioLoteRPS.xsd',
        Cabecalho: request.Cabecalho,
        Lote: request.Lote,
      },
    };

    payload['ns1:ReqEnvioLoteRPS'].Lote.RPS = payload['ns1:ReqEnvioLoteRPS'].Lote.RPS.map((lote) => {
      const valorServico =
        lote.Itens.Item.reduce((previousValue, currentValue) => previousValue + currentValue.ValorTotal, 0) -
        lote.Deducoes.reduce((previousValue, currentValue) => previousValue + currentValue.Deducao.ValorDeduzir, 0);
      const valorDeducoes = lote.Deducoes.reduce(
        (previousValue, currentValue) => previousValue + currentValue.Deducao.ValorDeduzir,
        0,
      );
      const baseAssinatura =
        lote.InscricaoMunicipalPrestador.padStart(11, '0') +
        lote.SerieRPS.padEnd(5, ' ') +
        lote.NumeroRPS.toString().padStart(12, '0') +
        DateTime.fromISO(lote.DataEmissaoRPS).toFormat('yyyyLLdd') +
        lote.Tributacao.padEnd(2, ' ') +
        lote.SituacaoRPS +
        (lote.TipoRecolhimento === TipoRecolhimento.A_RECEBER ? 'N' : 'S') +
        valorServico.toFixed(2).replace('.', '').padStart(15, '0') +
        valorDeducoes.toFixed(2).replace('.', '').padStart(15, '0') +
        lote.CodigoAtividade.toString().padStart(10, '0') +
        lote.CPFCNPJTomador.padStart(14, '0');

      const assinaturaSha1 = sha1(baseAssinatura);

      for (let i = 0; i < lote.Itens.Item.length; i++) {
        const item = lote.Itens.Item[i];
        item.ValorTotal = item.ValorTotal.toFixed(2) as unknown as number;
        item.ValorUnitario = item.ValorUnitario.toFixed(2) as unknown as number;
      }

      return {
        Assinatura: assinaturaSha1,
        ...lote,
      };
    });

    const latin1Json = JSON.parse(Buffer.from(JSON.stringify(payload), 'utf8').toString('latin1'));

    const xml = xmlbuilder.create(latin1Json, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });
    const signedXml = await this.getSignedXml(xmlConverted, 'Lote');
    const soapClient = await createClientAsync(this.host);
    try {
      const [wsResponse] = await soapClient.enviarSincronoAsync({
        mensagemXml: signedXml.replace('<Cabecalho Id="_0">', '<Cabecalho>'),
      });

      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta: EnvioLoteResponse.RootObject;
      try {
        resposta = parser.parse(wsResponse.enviarSincronoReturn.$value) as unknown as EnvioLoteResponse.RootObject;
      } catch (e) {
        throw Error(wsResponse.enviarSincronoReturn.$value);
      }

      if (resposta['ns1:RetornoEnvioLoteRPS']) {
        return resposta['ns1:RetornoEnvioLoteRPS'];
      }
    } catch (e) {
      throw Error(e.message);
    }
  }

  async enviarLoteSincrono(request: EnvioRpsRequest.Padrao): Promise<EnvioLoteResponse.RetornoEnvioLoteRPS> {
    const payload = {
      'ns1:ReqEnvioLoteRPS': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation': 'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ReqEnvioLoteRPS.xsd',
        Cabecalho: request.Cabecalho,
        Lote: request.Lote,
      },
    };

    payload['ns1:ReqEnvioLoteRPS'].Lote.RPS = payload['ns1:ReqEnvioLoteRPS'].Lote.RPS.map((lote) => {
      const valorServico =
        lote.Itens.Item.reduce((previousValue, currentValue) => previousValue + currentValue.ValorTotal, 0) -
        lote.Deducoes.reduce((previousValue, currentValue) => previousValue + currentValue.Deducao.ValorDeduzir, 0);
      const valorDeducoes = lote.Deducoes.reduce(
        (previousValue, currentValue) => previousValue + currentValue.Deducao.ValorDeduzir,
        0,
      );
      const baseAssinatura =
        lote.InscricaoMunicipalPrestador.padStart(11, '0') +
        lote.SerieRPS.padEnd(5, ' ') +
        lote.NumeroRPS.toString().padStart(12, '0') +
        DateTime.fromISO(lote.DataEmissaoRPS).toFormat('yyyyLLdd') +
        lote.Tributacao.padEnd(2, ' ') +
        lote.SituacaoRPS +
        (lote.TipoRecolhimento === TipoRecolhimento.A_RECEBER ? 'N' : 'S') +
        valorServico.toFixed(2).replace('.', '').padStart(15, '0') +
        valorDeducoes.toFixed(2).replace('.', '').padStart(15, '0') +
        lote.CodigoAtividade.toString().padStart(10, '0') +
        lote.CPFCNPJTomador.padStart(14, '0');

      const assinaturaSha1 = sha1(baseAssinatura);

      for (let i = 0; i < lote.Itens.Item.length; i++) {
        const item = lote.Itens.Item[i];
        item.ValorTotal = item.ValorTotal.toFixed(2) as unknown as number;
        item.ValorUnitario = item.ValorUnitario.toFixed(2) as unknown as number;
      }

      return {
        Assinatura: assinaturaSha1,
        ...lote,
      };
    });

    const latin1Json = JSON.parse(Buffer.from(JSON.stringify(payload), 'utf8').toString('latin1'));

    const xml = xmlbuilder.create(latin1Json, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });
    const signedXml = await this.getSignedXml(xmlConverted, 'Lote');
    const soapClient = await createClientAsync(this.host);
    try {
      const [wsResponse] = await soapClient.enviarSincronoAsync({
        mensagemXml: signedXml.replace('<Cabecalho Id="_0">', '<Cabecalho>'),
      });

      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta: EnvioLoteResponse.RootObject;
      try {
        resposta = parser.parse(wsResponse.enviarSincronoReturn.$value) as unknown as EnvioLoteResponse.RootObject;
      } catch (e) {
        throw Error(wsResponse.enviarSincronoReturn.$value);
      }

      if (resposta['ns1:RetornoEnvioLoteRPS']) {
        return resposta['ns1:RetornoEnvioLoteRPS'];
      }
      throw Error(wsResponse.enviarSincronoReturn.$value);
    } catch (e) {
      throw Error(e.message);
    }
  }

  async testEnviarLote(request: EnvioRpsRequest.Padrao): Promise<EnvioLoteResponse.RetornoEnvioLoteRPS> {
    const payload = {
      'ns1:ReqEnvioLoteRPS': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation': 'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ReqEnvioLoteRPS.xsd',
        Cabecalho: request.Cabecalho,
        Lote: request.Lote,
      },
    };

    payload['ns1:ReqEnvioLoteRPS'].Lote.RPS = payload['ns1:ReqEnvioLoteRPS'].Lote.RPS.map((lote) => {
      const valorServico =
        lote.Itens.Item.reduce((previousValue, currentValue) => previousValue + currentValue.ValorTotal, 0) -
        lote.Deducoes.reduce((previousValue, currentValue) => previousValue + currentValue.Deducao.ValorDeduzir, 0);
      const valorDeducoes = lote.Deducoes.reduce(
        (previousValue, currentValue) => previousValue + currentValue.Deducao.ValorDeduzir,
        0,
      );
      const baseAssinatura =
        lote.InscricaoMunicipalPrestador.padStart(11, '0') +
        lote.SerieRPS.padEnd(5, ' ') +
        lote.NumeroRPS.toString().padStart(12, '0') +
        DateTime.fromISO(lote.DataEmissaoRPS).toFormat('yyyyLLdd') +
        lote.Tributacao.padEnd(2, ' ') +
        lote.SituacaoRPS +
        (lote.TipoRecolhimento === TipoRecolhimento.A_RECEBER ? 'N' : 'S') +
        valorServico.toFixed(2).replace('.', '').padStart(15, '0') +
        valorDeducoes.toFixed(2).replace('.', '').padStart(15, '0') +
        lote.CodigoAtividade.toString().padStart(10, '0') +
        lote.CPFCNPJTomador.padStart(14, '0');

      const assinaturaSha1 = sha1(baseAssinatura);

      for (let i = 0; i < lote.Itens.Item.length; i++) {
        const item = lote.Itens.Item[i];
        item.ValorTotal = item.ValorTotal.toFixed(2) as unknown as number;
        item.ValorUnitario = item.ValorUnitario.toFixed(2) as unknown as number;
      }

      return {
        Assinatura: assinaturaSha1,
        ...lote,
      };
    });

    const latin1Json = JSON.parse(Buffer.from(JSON.stringify(payload), 'utf8').toString('latin1'));

    const xml = xmlbuilder.create(latin1Json, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });
    const signedXml = await this.getSignedXml(xmlConverted, 'Lote');
    const soapClient = await createClientAsync(this.host);
    try {
      const [wsResponse] = await soapClient.testeEnviarAsync({
        mensagemXml: signedXml.replace('<Cabecalho Id="_0">', '<Cabecalho>'),
      });

      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta: EnvioLoteResponse.RootObject;
      try {
        resposta = parser.parse(wsResponse.testeEnviarReturn.$value) as unknown as EnvioLoteResponse.RootObject;
      } catch (e) {
        throw Error(wsResponse.testeEnviarReturn.$value);
      }

      if (resposta['ns1:RetornoEnvioLoteRPS']) {
        return resposta['ns1:RetornoEnvioLoteRPS'];
      }
    } catch (e) {
      throw Error(e.message);
    }
  }

  async consultarNota(parametrosConsulta: ConsultarNotaRequest): Promise<ConsultarNotaResponse.RetornoConsultaNotas> {
    const payload = {
      'ns1:ReqConsultaNotas': {
        '@xmlns:ns1': 'http://localhost:8080/WsNFe2/lote',
        '@xmlns:tipos': 'http://localhost:8080/WsNFe2/tp',
        '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        '@xsi:schemaLocation':
          'http://localhost:8080/WsNFe2/lote http://localhost:8080/WsNFe2/xsd/ReqConsultaNotas.xsd',
        Cabecalho: {
          '@Id': 'Consulta:notas',
          CodCidade: parametrosConsulta.CodCidade,
          CPFCNPJRemetente: parametrosConsulta.CPFCNPJRemetente,
          InscricaoMunicipalPrestador: parametrosConsulta.InscricaoMunicipalPrestador,
          dtInicio: parametrosConsulta.dtInicio,
          dtFim: parametrosConsulta.dtFim,
          NotaInicial: parametrosConsulta.NotaInicial,
          Versao: parametrosConsulta.Versao,
        },
      },
    };
    const xml = xmlbuilder.create(payload, { version: '1.0', encoding: 'UTF-8' });
    const xmlConverted = xml.end({ pretty: true });

    const signedXml = await this.getSignedXml(xmlConverted);
    const soapClient = await createClientAsync(this.host);

    try {
      const [wsResponse] = await soapClient.consultarNotaAsync({
        mensagemXml: signedXml,
      });

      if (this.debug) {
        console.log('request', soapClient.lastRequest);
        console.log('response', soapClient.lastResponse);
      }

      let resposta;
      try {
        resposta = parser.parse(wsResponse.consultarNotaReturn.$value) as unknown as ConsultarNotaResponse.RootObject;
      } catch (e) {
        throw Error(wsResponse.consultarNotaReturn.$value);
      }

      if (resposta['ns1:RetornoConsultaNotas']) {
        return resposta['ns1:RetornoConsultaNotas'];
      }

      throw Error(wsResponse.consultarNotaReturn.$value);
    } catch (e) {
      throw Error(e.message);
    }
  }

  protected async getSignedXml(xmlConverted: string, tagName = 'Cabecalho') {
    const pfx = fs.readFileSync(this.certTempFile);

    const pemCert: pem.Pkcs12ReadResult = await new Promise((resolve, reject) => {
      pem.readPkcs12(pfx, { p12Password: this.certPassword }, (err, cert) => {
        if (err) reject(err);
        else resolve(cert);
      });
    });

    const sig = new SignedXml();
    sig.addReference(`//*[local-name(.)='${tagName}']`, [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ]);
    sig.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';
    sig.signingKey = Buffer.from(pemCert.key);
    sig.keyInfoProvider = new MyKeyInfo({
      certificate: pemCert.cert,
      key: pemCert.key,
    });
    sig.computeSignature(xmlConverted);

    return sig.getSignedXml();
  }
}

export class DataScraper {
  public static async consultaLinkNfse(payload: ConsultaUrlNfse.Request): Promise<ConsultaUrlNfse.Response> {
    let browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    try {
      const page = await browser.defaultPage();
      await page.goto('https://nfse.campinas.sp.gov.br/NotaFiscal/verificarAutenticidade.php');

      await page.waitForTimeout(2000);

      await (await page.$('#rPrest')).type(payload.cnpj.toString());
      await (await page.$('#rNumNota')).type(payload.nfNum.toString());
      await (await page.$('#rCodigoVerificacao')).type(payload.codVerificacao.toString());
      await (await page.$('#rInsMun')).type(payload.inscricaoMunicipal.toString());

      const image = await page.$x("//*[@id='coluna5B']/form/table/tbody/tr[5]/td[4]/img");
      const srcProperty = await image[0].getProperty('src');
      const nfUrl: string = await srcProperty.jsonValue();

      const url = new URL(nfUrl);
      const code_b64 = url.searchParams.get('gd_code');
      const code = Buffer.from(code_b64, 'base64').toString();

      await (await page.$('#rSelo')).type(code);
      await (await page.$('#btnVerificar')).click();

      const newWindowTarget = await browser.waitForTarget(
        (target) => target.url().indexOf('https://nfse.campinas.sp.gov.br/NotaFiscal/notaFiscal.php') > -1,
        {
          timeout: 10000,
        },
      );

      const searchParams = new URL(newWindowTarget.url()).searchParams;
      const returnObject: ConsultaUrlNfse.Response = {
        url: newWindowTarget.url(),
        id_nota_fiscal: Buffer.from(searchParams.get('id_nota_fiscal'), 'base64').toString(),
        confirma: Buffer.from(searchParams.get('confirma'), 'base64').toString(),
        temPrestador: Buffer.from(searchParams.get('temPrestador'), 'base64').toString(),
        doc_prestador: Buffer.from(searchParams.get('doc_prestador'), 'base64').toString(),
        numero_nota_fiscal: Buffer.from(searchParams.get('numero_nota_fiscal'), 'base64').toString(),
        inscricao_prestador: Buffer.from(searchParams.get('inscricao_prestador'), 'base64').toString(),
        cod_verificacao: Buffer.from(searchParams.get('cod_verificacao'), 'base64').toString(),
      };

      returnObject.url = returnObject.url.replace('notaFiscal.php', 'visualizarNota.php');
      return returnObject;
    } catch (error) {
      throw error;
    } finally {
      browser.close();
    }
  }

  public static async imprimePdfNfse(linkNfse: string): Promise<ImprimePdfNfse.Return> {
    const searchParams = new URL(linkNfse).searchParams;
    const nfseNum = Buffer.from(searchParams.get('numero_nota_fiscal'), 'base64').toString('utf8');

    let browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    });

    try {
      const page = await browser.defaultPage();
      await page.goto(linkNfse);

      await page.waitForTimeout(2000);
      const pdfBuffer = (await page.pdf({
        format: 'a4',
        margin: {
          top: '0',
          right: '0.4in',
          bottom: '0.4in',
          left: '0.4in',
        },
      })) as Buffer;

      return {
        nfse: nfseNum,
        pdfBase64Content: pdfBuffer.toString('base64'),
      };
    } catch (error) {
      throw error;
    } finally {
      browser.close();
    }
  }
}
