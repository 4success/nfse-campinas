import { Client as SoapClient, createClientAsync as soapCreateClientAsync } from 'soap';
import { TnsconsultarNfsePorRps } from './definitions/TnsconsultarNfsePorRps';
import { TnsconsultarNfsePorRpsResponse } from './definitions/TnsconsultarNfsePorRpsResponse';
import { TnsconsultarNfseServicoTomado } from './definitions/TnsconsultarNfseServicoTomado';
import { TnsconsultarNfseServicoTomadoResponse } from './definitions/TnsconsultarNfseServicoTomadoResponse';
import { TnsrecepcionarLoteRps } from './definitions/TnsrecepcionarLoteRps';
import { TnsrecepcionarLoteRpsResponse } from './definitions/TnsrecepcionarLoteRpsResponse';
import { TnsrecepcionarLoteRpsSincrono } from './definitions/TnsrecepcionarLoteRpsSincrono';
import { TnsrecepcionarLoteRpsSincronoResponse } from './definitions/TnsrecepcionarLoteRpsSincronoResponse';
import { TnsconsultarNfseServicoPrestado } from './definitions/TnsconsultarNfseServicoPrestado';
import { TnsconsultarNfseServicoPrestadoResponse } from './definitions/TnsconsultarNfseServicoPrestadoResponse';
import { TnscancelarNfse } from './definitions/TnscancelarNfse';
import { TnscancelarNfseResponse } from './definitions/TnscancelarNfseResponse';
import { TnsconsultarLoteRps } from './definitions/TnsconsultarLoteRps';
import { TnsconsultarLoteRpsResponse } from './definitions/TnsconsultarLoteRpsResponse';
import { TnsconsultarNfseFaixa } from './definitions/TnsconsultarNfseFaixa';
import { TnsconsultarNfseFaixaResponse } from './definitions/TnsconsultarNfseFaixaResponse';
import { TnsgerarNfse } from './definitions/TnsgerarNfse';
import { TnsgerarNfseResponse } from './definitions/TnsgerarNfseResponse';
import { TnssubstituirNfse } from './definitions/TnssubstituirNfse';
import { TnssubstituirNfseResponse } from './definitions/TnssubstituirNfseResponse';
import { NotaFiscalSoap } from './services/NotaFiscalSoap';

export interface NotaFiscalSoapClient extends SoapClient {
  NotaFiscalSoap: NotaFiscalSoap;

  ConsultarNfsePorRpsAsync(consultarNfsePorRps: TnsconsultarNfsePorRps, options?: Record<string, any>): Promise<[result: TnsconsultarNfsePorRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarNfseServicoTomadoAsync(consultarNfseServicoTomado: TnsconsultarNfseServicoTomado, options?: Record<string, any>): Promise<[result: TnsconsultarNfseServicoTomadoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  RecepcionarLoteRpsAsync(recepcionarLoteRps: TnsrecepcionarLoteRps, options?: Record<string, any>): Promise<[result: TnsrecepcionarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  RecepcionarLoteRpsSincronoAsync(recepcionarLoteRpsSincrono: TnsrecepcionarLoteRpsSincrono, options?: Record<string, any>): Promise<[result: TnsrecepcionarLoteRpsSincronoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarNfseServicoPrestadoAsync(consultarNfseServicoPrestado: TnsconsultarNfseServicoPrestado, options?: Record<string, any>): Promise<[result: TnsconsultarNfseServicoPrestadoResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  CancelarNfseAsync(cancelarNfse: TnscancelarNfse, options?: Record<string, any>): Promise<[result: TnscancelarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarLoteRpsAsync(consultarLoteRps: TnsconsultarLoteRps, options?: Record<string, any>): Promise<[result: TnsconsultarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  ConsultarNfseFaixaAsync(consultarNfseFaixa: TnsconsultarNfseFaixa, options?: Record<string, any>): Promise<[result: TnsconsultarNfseFaixaResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  GerarNfseAsync(gerarNfse: TnsgerarNfse, options?: Record<string, any>): Promise<[result: TnsgerarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;

  SubstituirNfseAsync(substituirNfse: TnssubstituirNfse, options?: Record<string, any>): Promise<[result: TnssubstituirNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any]>;
}

/** Create NotaFiscalSoapClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<NotaFiscalSoapClient> {
  return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
