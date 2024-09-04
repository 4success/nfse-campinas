import { TnsConsultarNfsePorRps } from '../definitions/TnsConsultarNfsePorRps';
import { TnsConsultarNfsePorRpsResponse } from '../definitions/TnsConsultarNfsePorRpsResponse';
import { TnsConsultarNfseServicoTomado } from '../definitions/TnsConsultarNfseServicoTomado';
import { TnsConsultarNfseServicoTomadoResponse } from '../definitions/TnsConsultarNfseServicoTomadoResponse';
import { TnsRecepcionarLoteRps } from '../definitions/TnsRecepcionarLoteRps';
import { TnsRecepcionarLoteRpsResponse } from '../definitions/TnsRecepcionarLoteRpsResponse';
import { TnsRecepcionarLoteRpsSincrono } from '../definitions/TnsRecepcionarLoteRpsSincrono';
import { TnsRecepcionarLoteRpsSincronoResponse } from '../definitions/TnsRecepcionarLoteRpsSincronoResponse';
import { TnsConsultarNfseServicoPrestado } from '../definitions/TnsConsultarNfseServicoPrestado';
import { TnsConsultarNfseServicoPrestadoResponse } from '../definitions/TnsConsultarNfseServicoPrestadoResponse';
import { TnsCancelarNfse } from '../definitions/TnsCancelarNfse';
import { TnsCancelarNfseResponse } from '../definitions/TnsCancelarNfseResponse';
import { TnsConsultarLoteRps } from '../definitions/TnsConsultarLoteRps';
import { TnsConsultarLoteRpsResponse } from '../definitions/TnsConsultarLoteRpsResponse';
import { TnsConsultarNfseFaixa } from '../definitions/TnsConsultarNfseFaixa';
import { TnsConsultarNfseFaixaResponse } from '../definitions/TnsConsultarNfseFaixaResponse';
import { TnsGerarNfse } from '../definitions/TnsGerarNfse';
import { TnsGerarNfseResponse } from '../definitions/TnsGerarNfseResponse';
import { TnsSubstituirNfse } from '../definitions/TnsSubstituirNfse';
import { TnsSubstituirNfseResponse } from '../definitions/TnsSubstituirNfseResponse';

export interface NotaFiscalSoapPort {
  ConsultarNfsePorRps(consultarNfsePorRps: TnsConsultarNfsePorRps, callback: (err: any, result: TnsConsultarNfsePorRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarNfseServicoTomado(consultarNfseServicoTomado: TnsConsultarNfseServicoTomado, callback: (err: any, result: TnsConsultarNfseServicoTomadoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  RecepcionarLoteRps(recepcionarLoteRps: TnsRecepcionarLoteRps, callback: (err: any, result: TnsRecepcionarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  RecepcionarLoteRpsSincrono(recepcionarLoteRpsSincrono: TnsRecepcionarLoteRpsSincrono, callback: (err: any, result: TnsRecepcionarLoteRpsSincronoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarNfseServicoPrestado(consultarNfseServicoPrestado: TnsConsultarNfseServicoPrestado, callback: (err: any, result: TnsConsultarNfseServicoPrestadoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  CancelarNfse(cancelarNfse: TnsCancelarNfse, callback: (err: any, result: TnsCancelarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarLoteRps(consultarLoteRps: TnsConsultarLoteRps, callback: (err: any, result: TnsConsultarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarNfseFaixa(consultarNfseFaixa: TnsConsultarNfseFaixa, callback: (err: any, result: TnsConsultarNfseFaixaResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  GerarNfse(gerarNfse: TnsGerarNfse, callback: (err: any, result: TnsGerarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  SubstituirNfse(substituirNfse: TnsSubstituirNfse, callback: (err: any, result: TnsSubstituirNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
