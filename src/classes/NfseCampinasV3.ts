import { PfxCertificate } from '../certificate/PfxCertificate';
import { CampinasDpsClient } from '../client/CampinasDpsClient';
import { NfseCampinasV3Endpoints, resolveConsultaEndpoint, resolveDpsEndpoint } from '../client/endpoints';
import { HttpTraceLogger } from '../client/httpTrace';
import { ConsultarNfseResult, EnviarDpsResult } from '../client/responseParser';
import { imprimirDanfse, ImprimirDanfseInput } from '../danfse/imprimirDanfse';
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

export type ConsultarNfseOptions = {
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
  traceLogger?: HttpTraceLogger;
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
    const endpoint = resolveDpsEndpoint(built?.environment || this.environment, this.options.endpoints);
    const signedXml =
      typeof input === 'string'
        ? input
        : await this.signDpsXml(built!.xml, { idAttributeTarget: built!.idAttributeTarget });
    const idDps = built?.idDps || this.extractIdDpsFromSignedXml(signedXml);
    const useClientCertificate = this.options.transport?.useClientCertificate !== false;
    const clientCertificate = useClientCertificate ? this.certificate.toPem() : undefined;
    const client = new CampinasDpsClient({
      endpoint,
      certificate: this.options.certificate,
      certPassword: this.options.certPassword,
      clientKeyPem: clientCertificate?.privateKey,
      clientCertPem: clientCertificate?.publicCert,
      timeoutMs: this.options.timeoutMs,
      requestHeaders: this.options.requestHeaders,
      debug: this.options.debug,
      traceLogger: this.options.traceLogger,
      transport: this.options.transport,
    });

    const result = await client.sendSignedDps({ signedXml, idDps, timeoutMs: options.timeoutMs });

    return result;
  }

  async consultarNfse(chaveAcesso: string, options: ConsultarNfseOptions = {}): Promise<ConsultarNfseResult> {
    if (!/^NFS[A-Z0-9]{50}$/.test(chaveAcesso)) {
      throw new ValidationError([
        { field: 'chaveAcesso', message: 'deve conter NFS seguido de 50 caracteres alfanuméricos', severity: 'error' },
      ]);
    }

    const endpoint = resolveConsultaEndpoint(this.environment, this.options.endpoints);
    const useClientCertificate = this.options.transport?.useClientCertificate !== false;
    const clientCertificate = useClientCertificate ? this.certificate.toPem() : undefined;
    const client = new CampinasDpsClient({
      endpoint,
      certificate: this.options.certificate,
      certPassword: this.options.certPassword,
      clientKeyPem: clientCertificate?.privateKey,
      clientCertPem: clientCertificate?.publicCert,
      timeoutMs: this.options.timeoutMs,
      requestHeaders: this.options.requestHeaders,
      debug: this.options.debug,
      traceLogger: this.options.traceLogger,
      transport: this.options.transport,
    });

    return client.consultarNfse({ chaveAcesso, timeoutMs: options.timeoutMs });
  }

  async cancelarNfse(_input: unknown): Promise<never> {
    throw new NotImplementedError('cancelarNfse');
  }

  async imprimirDanfse(input: ImprimirDanfseInput): Promise<string> {
    return imprimirDanfse(input);
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
    const idMatch = xml.match(/\sId\s*=\s*(["'])(DPS[^"']+)\1/);
    const referenceMatch = xml.match(/<Reference[^>]+URI\s*=\s*(["'])#(DPS[^"']+)\1/);
    const idDps = idMatch?.[2] || referenceMatch?.[2];

    if (!idDps) {
      throw new Error('XML assinado não contém Id da DPS');
    }
    return idDps;
  }
}
