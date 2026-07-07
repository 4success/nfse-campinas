import { PfxCertificate } from '../certificate/PfxCertificate';
import { CampinasDpsClient } from '../client/CampinasDpsClient';
import { NfseCampinasV3Endpoints, resolveDpsEndpoint } from '../client/endpoints';
import { EnviarDpsResult } from '../client/responseParser';
import { buildDpsId } from '../dps/buildDpsId';
import { DpsXmlBuilder } from '../dps/DpsXmlBuilder';
import { BuildDpsIdInput, DpsInput, NfseCampinasV3Environment } from '../dps/types';
import { NotImplementedError } from '../errors/NotImplementedError';
import { ValidationError } from '../errors/ValidationError';
import { DpsSigner } from '../signature/DpsSigner';
import { defaultDpsSignatureOptions, DpsSignatureOptions } from '../signature/signatureTypes';

export type EnviarDpsOptions = {
  timeoutMs?: number;
};

export type NfseCampinasV3Options = {
  environment?: NfseCampinasV3Environment;
  certificate: Buffer;
  certPassword: string;
  debug?: boolean;
  timeoutMs?: number;
  endpoints?: NfseCampinasV3Endpoints;
  applicationVersion?: string;
  requestHeaders?: Record<string, string>;
  signature?: Partial<DpsSignatureOptions>;
  transport?: {
    useClientCertificate?: boolean;
  };
};

export class NfseCampinasV3 {
  private readonly environment: NfseCampinasV3Environment;
  private readonly signatureOptions: DpsSignatureOptions;
  private readonly certificate: PfxCertificate;

  constructor(private readonly options: NfseCampinasV3Options) {
    this.environment = options.environment || 'homologacao';
    this.signatureOptions = { ...defaultDpsSignatureOptions, ...options.signature };
    this.certificate = new PfxCertificate(options.certificate, options.certPassword);
  }

  buildDpsId(input: BuildDpsIdInput): string {
    return buildDpsId(input);
  }

  buildDpsXml(input: DpsInput): string {
    return this.buildDpsXmlWithId(input).xml;
  }

  async signDpsXml(xml: string, options: Partial<DpsSignatureOptions> = {}): Promise<string> {
    return new DpsSigner(this.certificate, this.signatureOptions).sign(xml, options);
  }

  async enviarDps(input: DpsInput | string, options: EnviarDpsOptions = {}): Promise<EnviarDpsResult> {
    const built = typeof input === 'string' ? undefined : this.buildDpsXmlWithId(input);
    const signedXml =
      typeof input === 'string'
        ? input
        : await this.signDpsXml(built!.xml, { idAttributeTarget: built!.idAttributeTarget });
    const idDps = built?.idDps || this.extractIdDpsFromSignedXml(signedXml);
    const endpoint = resolveDpsEndpoint(built?.environment || this.environment, this.options.endpoints);
    const clientCertificate = this.certificate.toPem();
    const client = new CampinasDpsClient({
      endpoint,
      certificate: this.options.certificate,
      certPassword: this.options.certPassword,
      clientKeyPem: clientCertificate.privateKey,
      clientCertPem: clientCertificate.publicCert,
      timeoutMs: this.options.timeoutMs,
      requestHeaders: this.options.requestHeaders,
      transport: this.options.transport,
    });

    if (this.options.debug) {
      // tslint:disable-next-line:no-console
      console.log(`POST ${endpoint}`);
      // tslint:disable-next-line:no-console
      console.log(signedXml);
    }

    const result = await client.sendSignedDps({ signedXml, idDps, timeoutMs: options.timeoutMs });

    if (this.options.debug) {
      // tslint:disable-next-line:no-console
      console.log(`HTTP ${result.httpStatus}`);
      // tslint:disable-next-line:no-console
      console.log(result.rawResponse);
    }

    return result;
  }

  async consultarNfsePorDps(_idDps: string): Promise<never> {
    throw new NotImplementedError('consultarNfsePorDps');
  }

  async cancelarNfse(_input: unknown): Promise<never> {
    throw new NotImplementedError('cancelarNfse');
  }

  private buildDpsXmlWithId(input: DpsInput): {
    xml: string;
    idDps: string;
    environment: NfseCampinasV3Environment;
    idAttributeTarget: DpsSignatureOptions['idAttributeTarget'];
  } {
    const environment = this.resolveEffectiveEnvironment(input.ambiente);
    const idAttributeTarget = input.xml?.idAttributeTarget || this.signatureOptions.idAttributeTarget;
    const built = new DpsXmlBuilder({ idAttributeTarget: this.signatureOptions.idAttributeTarget }).build({
      ...input,
      versaoAplicativo: input.versaoAplicativo || this.options.applicationVersion || '3.0.0',
      ambiente: environment,
    });

    return { ...built, environment, idAttributeTarget };
  }

  private resolveEffectiveEnvironment(ambiente: DpsInput['ambiente']): NfseCampinasV3Environment {
    if (ambiente === 'producao' || ambiente === 1) {
      return 'producao';
    }
    if (ambiente === 'homologacao' || ambiente === 2) {
      return 'homologacao';
    }
    if (ambiente === undefined) {
      return this.environment;
    }
    throw new ValidationError([
      { field: 'ambiente', message: 'ambiente deve ser 1, 2, homologacao ou producao', severity: 'error' },
    ]);
  }

  private extractIdDpsFromSignedXml(xml: string): string {
    const match = xml.match(/\sId="(DPS[^"]+)"/) || xml.match(/<Reference[^>]+URI="#(DPS[^"]+)"/);
    if (!match) {
      throw new Error('XML assinado não contém Id da DPS');
    }
    return match[1];
  }
}
