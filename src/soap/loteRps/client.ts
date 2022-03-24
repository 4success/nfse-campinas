import {Client as SoapClient, createClientAsync as soapCreateClientAsync} from "soap";
import {ConsultarSequencialRpsRequest} from "./definitions/ConsultarSequencialRpsRequest";
import {ConsultarSequencialRpsRequest1} from "./definitions/ConsultarSequencialRpsRequest1";
import {EnviarSincronoRequest} from "./definitions/EnviarSincronoRequest";
import {EnviarSincronoRequest1} from "./definitions/EnviarSincronoRequest1";
import {TesteEnviarRequest} from "./definitions/TesteEnviarRequest";
import {TesteEnviarRequest1} from "./definitions/TesteEnviarRequest1";
import {EnviarRequest} from "./definitions/EnviarRequest";
import {EnviarRequest1} from "./definitions/EnviarRequest1";
import {ConsultarLoteRequest} from "./definitions/ConsultarLoteRequest";
import {ConsultarLoteRequest1} from "./definitions/ConsultarLoteRequest1";
import {ConsultarNotaRequest} from "./definitions/ConsultarNotaRequest";
import {ConsultarNotaRequest1} from "./definitions/ConsultarNotaRequest1";
import {CancelarRequest} from "./definitions/CancelarRequest";
import {CancelarRequest1} from "./definitions/CancelarRequest1";
import {ConsultarNfSeRpsRequest} from "./definitions/ConsultarNfSeRpsRequest";
import {ConsultarNfSeRpsRequest1} from "./definitions/ConsultarNfSeRpsRequest1";
import {LoteRpsService} from "./services/LoteRpsService";

export interface LoteRpsClient extends SoapClient {
    LoteRpsService: LoteRpsService;

    consultarSequencialRpsAsync(consultarSequencialRpsRequest: ConsultarSequencialRpsRequest): Promise<[ConsultarSequencialRpsRequest1, string, any, string]>;

    enviarSincronoAsync(enviarSincronoRequest: EnviarSincronoRequest): Promise<[EnviarSincronoRequest1, string, any, string]>;

    testeEnviarAsync(testeEnviarRequest: TesteEnviarRequest): Promise<[TesteEnviarRequest1, string, any, string]>;

    enviarAsync(enviarRequest: EnviarRequest): Promise<[EnviarRequest1, string, any, string]>;

    consultarLoteAsync(consultarLoteRequest: ConsultarLoteRequest): Promise<[ConsultarLoteRequest1, string, any, string]>;

    consultarNotaAsync(consultarNotaRequest: ConsultarNotaRequest): Promise<[ConsultarNotaRequest1, string, any, string]>;

    cancelarAsync(cancelarRequest: CancelarRequest): Promise<[CancelarRequest1, string, any, string]>;

    consultarNFSeRpsAsync(consultarNfSeRpsRequest: ConsultarNfSeRpsRequest): Promise<[ConsultarNfSeRpsRequest1, string, any, string]>;
}

/** Create LoteRpsClient */
export function createClientAsync(...args: Parameters<typeof soapCreateClientAsync>): Promise<LoteRpsClient> {
    return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
