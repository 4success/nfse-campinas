import { ConsultarSequencialRpsRequest } from '../definitions/ConsultarSequencialRpsRequest';
import { ConsultarSequencialRpsRequest1 } from '../definitions/ConsultarSequencialRpsRequest1';
import { EnviarSincronoRequest } from '../definitions/EnviarSincronoRequest';
import { EnviarSincronoRequest1 } from '../definitions/EnviarSincronoRequest1';
import { TesteEnviarRequest } from '../definitions/TesteEnviarRequest';
import { TesteEnviarRequest1 } from '../definitions/TesteEnviarRequest1';
import { EnviarRequest } from '../definitions/EnviarRequest';
import { EnviarRequest1 } from '../definitions/EnviarRequest1';
import { ConsultarLoteRequest } from '../definitions/ConsultarLoteRequest';
import { ConsultarLoteRequest1 } from '../definitions/ConsultarLoteRequest1';
import { ConsultarNotaRequest } from '../definitions/ConsultarNotaRequest';
import { ConsultarNotaRequest1 } from '../definitions/ConsultarNotaRequest1';
import { CancelarRequest } from '../definitions/CancelarRequest';
import { CancelarRequest1 } from '../definitions/CancelarRequest1';
import { ConsultarNfSeRpsRequest } from '../definitions/ConsultarNfSeRpsRequest';
import { ConsultarNfSeRpsRequest1 } from '../definitions/ConsultarNfSeRpsRequest1';

export interface LoteRps {
  consultarSequencialRps(
    consultarSequencialRpsRequest: ConsultarSequencialRpsRequest,
    callback: (
      err: any,
      result: ConsultarSequencialRpsRequest1,
      rawResponse: any,
      soapHeader: any,
      rawRequest: any,
    ) => void,
  ): void;

  enviarSincrono(
    enviarSincronoRequest: EnviarSincronoRequest,
    callback: (err: any, result: EnviarSincronoRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;

  testeEnviar(
    testeEnviarRequest: TesteEnviarRequest,
    callback: (err: any, result: TesteEnviarRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;

  enviar(
    enviarRequest: EnviarRequest,
    callback: (err: any, result: EnviarRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;

  consultarLote(
    consultarLoteRequest: ConsultarLoteRequest,
    callback: (err: any, result: ConsultarLoteRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;

  consultarNota(
    consultarNotaRequest: ConsultarNotaRequest,
    callback: (err: any, result: ConsultarNotaRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;

  cancelar(
    cancelarRequest: CancelarRequest,
    callback: (err: any, result: CancelarRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;

  consultarNFSeRps(
    consultarNfSeRpsRequest: ConsultarNfSeRpsRequest,
    callback: (err: any, result: ConsultarNfSeRpsRequest1, rawResponse: any, soapHeader: any, rawRequest: any) => void,
  ): void;
}
