import { Client as SoapClient, createClientAsync as soapCreateClientAsync } from 'soap';
import { TnsConsultarNfsePorRps } from './definitions/TnsConsultarNfsePorRps';
import { TnsConsultarNfsePorRpsResponse } from './definitions/TnsConsultarNfsePorRpsResponse';
import { TnsConsultarNfseServicoTomado } from './definitions/TnsConsultarNfseServicoTomado';
import { TnsConsultarNfseServicoTomadoResponse } from './definitions/TnsConsultarNfseServicoTomadoResponse';
import { TnsRecepcionarLoteRps } from './definitions/TnsRecepcionarLoteRps';
import { TnsRecepcionarLoteRpsResponse } from './definitions/TnsRecepcionarLoteRpsResponse';
import { TnsRecepcionarLoteRpsSincrono } from './definitions/TnsRecepcionarLoteRpsSincrono';
import { TnsRecepcionarLoteRpsSincronoResponse } from './definitions/TnsRecepcionarLoteRpsSincronoResponse';
import { TnsConsultarNfseServicoPrestado } from './definitions/TnsConsultarNfseServicoPrestado';
import { TnsConsultarNfseServicoPrestadoResponse } from './definitions/TnsConsultarNfseServicoPrestadoResponse';
import { TnsCancelarNfse } from './definitions/TnsCancelarNfse';
import { TnsCancelarNfseResponse } from './definitions/TnsCancelarNfseResponse';
import { TnsConsultarLoteRps } from './definitions/TnsConsultarLoteRps';
import { TnsConsultarLoteRpsResponse } from './definitions/TnsConsultarLoteRpsResponse';
import { TnsConsultarNfseFaixa } from './definitions/TnsConsultarNfseFaixa';
import { TnsConsultarNfseFaixaResponse } from './definitions/TnsConsultarNfseFaixaResponse';
import { TnsGerarNfse } from './definitions/TnsGerarNfse';
import { TnsGerarNfseResponse } from './definitions/TnsGerarNfseResponse';
import { TnsSubstituirNfse } from './definitions/TnsSubstituirNfse';
import { TnsSubstituirNfseResponse } from './definitions/TnsSubstituirNfseResponse';
import { NotaFiscalSoap } from './services/NotaFiscalSoap';

export interface NotaFiscalSoapClient extends SoapClient {
  NotaFiscalSoap: NotaFiscalSoap;

  ConsultarNfsePorRpsAsync(consultarNfsePorRps: TnsConsultarNfsePorRps, options?: Record<string, any>): Promise<[result: TnsConsultarNfsePorRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarNfseServicoTomadoAsync(consultarNfseServicoTomado: TnsConsultarNfseServicoTomado, options?: Record<string, any>): Promise<[result: TnsConsultarNfseServicoTomadoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  RecepcionarLoteRpsAsync(recepcionarLoteRps: TnsRecepcionarLoteRps, options?: Record<string, any>): Promise<[result: TnsRecepcionarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  RecepcionarLoteRpsSincronoAsync(recepcionarLoteRpsSincrono: TnsRecepcionarLoteRpsSincrono, options?: Record<string, any>): Promise<[result: TnsRecepcionarLoteRpsSincronoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarNfseServicoPrestadoAsync(consultarNfseServicoPrestado: TnsConsultarNfseServicoPrestado, options?: Record<string, any>): Promise<[result: TnsConsultarNfseServicoPrestadoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  CancelarNfseAsync(cancelarNfse: TnsCancelarNfse, options?: Record<string, any>): Promise<[result: TnsCancelarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarLoteRpsAsync(consultarLoteRps: TnsConsultarLoteRps, options?: Record<string, any>): Promise<[result: TnsConsultarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarNfseFaixaAsync(consultarNfseFaixa: TnsConsultarNfseFaixa, options?: Record<string, any>): Promise<[result: TnsConsultarNfseFaixaResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  GerarNfseAsync(gerarNfse: TnsGerarNfse, options?: Record<string, any>): Promise<[result: TnsGerarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  SubstituirNfseAsync(substituirNfse: TnsSubstituirNfse, options?: Record<string, any>): Promise<[result: TnsSubstituirNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create NotaFiscalSoapClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<NotaFiscalSoapClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
