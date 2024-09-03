import { TnsconsultarNfsePorRps } from '../definitions/TnsconsultarNfsePorRps';
import { TnsconsultarNfsePorRpsResponse } from '../definitions/TnsconsultarNfsePorRpsResponse';
import { TnsconsultarNfseServicoTomado } from '../definitions/TnsconsultarNfseServicoTomado';
import { TnsconsultarNfseServicoTomadoResponse } from '../definitions/TnsconsultarNfseServicoTomadoResponse';
import { TnsrecepcionarLoteRps } from '../definitions/TnsrecepcionarLoteRps';
import { TnsrecepcionarLoteRpsResponse } from '../definitions/TnsrecepcionarLoteRpsResponse';
import { TnsrecepcionarLoteRpsSincrono } from '../definitions/TnsrecepcionarLoteRpsSincrono';
import { TnsrecepcionarLoteRpsSincronoResponse } from '../definitions/TnsrecepcionarLoteRpsSincronoResponse';
import { TnsconsultarNfseServicoPrestado } from '../definitions/TnsconsultarNfseServicoPrestado';
import { TnsconsultarNfseServicoPrestadoResponse } from '../definitions/TnsconsultarNfseServicoPrestadoResponse';
import { TnscancelarNfse } from '../definitions/TnscancelarNfse';
import { TnscancelarNfseResponse } from '../definitions/TnscancelarNfseResponse';
import { TnsconsultarLoteRps } from '../definitions/TnsconsultarLoteRps';
import { TnsconsultarLoteRpsResponse } from '../definitions/TnsconsultarLoteRpsResponse';
import { TnsconsultarNfseFaixa } from '../definitions/TnsconsultarNfseFaixa';
import { TnsconsultarNfseFaixaResponse } from '../definitions/TnsconsultarNfseFaixaResponse';
import { TnsgerarNfse } from '../definitions/TnsgerarNfse';
import { TnsgerarNfseResponse } from '../definitions/TnsgerarNfseResponse';
import { TnssubstituirNfse } from '../definitions/TnssubstituirNfse';
import { TnssubstituirNfseResponse } from '../definitions/TnssubstituirNfseResponse';

export interface NotaFiscalSoapPort {
  ConsultarNfsePorRps(consultarNfsePorRps: TnsconsultarNfsePorRps, callback: (err: any, result: TnsconsultarNfsePorRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarNfseServicoTomado(consultarNfseServicoTomado: TnsconsultarNfseServicoTomado, callback: (err: any, result: TnsconsultarNfseServicoTomadoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  RecepcionarLoteRps(recepcionarLoteRps: TnsrecepcionarLoteRps, callback: (err: any, result: TnsrecepcionarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  RecepcionarLoteRpsSincrono(recepcionarLoteRpsSincrono: TnsrecepcionarLoteRpsSincrono, callback: (err: any, result: TnsrecepcionarLoteRpsSincronoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarNfseServicoPrestado(consultarNfseServicoPrestado: TnsconsultarNfseServicoPrestado, callback: (err: any, result: TnsconsultarNfseServicoPrestadoResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  CancelarNfse(cancelarNfse: TnscancelarNfse, callback: (err: any, result: TnscancelarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarLoteRps(consultarLoteRps: TnsconsultarLoteRps, callback: (err: any, result: TnsconsultarLoteRpsResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  ConsultarNfseFaixa(consultarNfseFaixa: TnsconsultarNfseFaixa, callback: (err: any, result: TnsconsultarNfseFaixaResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  GerarNfse(gerarNfse: TnsgerarNfse, callback: (err: any, result: TnsgerarNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;

  SubstituirNfse(substituirNfse: TnssubstituirNfse, callback: (err: any, result: TnssubstituirNfseResponse, rawResponse: any, soapHeader: any, rawRequest: any) => void): void;
}
