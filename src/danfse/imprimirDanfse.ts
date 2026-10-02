import { XMLParser } from 'fast-xml-parser';
import { decodeNfseXmlGZipB64 } from '../utils/nfseXml';
import { DanfseHtmlBuilder as EmbeddedDanfseHtmlBuilder } from './viewer/builder';
import { DanfseXmlParser as EmbeddedDanfseXmlParser } from './viewer/parser';

export type ImprimirDanfseInput = (
  | {
      xml: string;
      nfseXmlGZipB64?: never;
    }
  | {
      xml?: never;
      nfseXmlGZipB64: string;
    }
) & { descricaoServico?: string };

export type DanfseViewerModule = {
  DanfseXmlParser: new () => { parse(xml: string): Promise<unknown> };
  DanfseHtmlBuilder: new () => { build(data: unknown): string };
};

const embeddedDanfseViewer = {
  DanfseXmlParser: EmbeddedDanfseXmlParser,
  DanfseHtmlBuilder: EmbeddedDanfseHtmlBuilder,
} as unknown as DanfseViewerModule;

export async function imprimirDanfse(input: ImprimirDanfseInput, viewer?: DanfseViewerModule): Promise<string> {
  if (input.descricaoServico !== undefined && typeof input.descricaoServico !== 'string') {
    throw new TypeError('descricaoServico deve ser uma string');
  }
  const xml = resolveXml(input);
  const { DanfseHtmlBuilder, DanfseXmlParser } = viewer || embeddedDanfseViewer;
  const data = await new DanfseXmlParser().parse(xml);

  return new DanfseHtmlBuilder().build(restoreDescriptionLineBreaks(xml, data, input.descricaoServico));
}

function restoreDescriptionLineBreaks(xml: string, data: unknown, description?: string): unknown {
  if (description === undefined || !data || typeof data !== 'object' || !('xDescServ' in data)) return data;

  // A projeção do visualizador pode estar truncada. Compare o texto integral,
  // decodificado do XML, sem aparar espaços nem alterar o documento assinado.
  const parsed = new XMLParser({ parseTagValue: false, trimValues: false, htmlEntities: true }).parse(xml);
  const nfse = parsed.NFSe || parsed.retNFSe?.NFSe || parsed.NFSeProc?.NFSe || parsed;
  const infNFSe = nfse.infNFSe || nfse;
  const dps = infNFSe.DPS || {};
  const serv = (dps.infDPS || dps).serv || {};
  const authorized = serv.cServ?.xDescServ ?? serv.xDescServ;
  if (
    typeof authorized !== 'string' ||
    !authorized ||
    authorized.replace(/[\r\n]/g, '') !== description.replace(/[\r\n]/g, '')
  ) {
    return data;
  }
  return { ...data, xDescServ: description };
}

function resolveXml(input: ImprimirDanfseInput): string {
  if ('xml' in input && input.xml) {
    return input.xml;
  }
  if ('nfseXmlGZipB64' in input && input.nfseXmlGZipB64) {
    return decodeNfseXmlGZipB64(input.nfseXmlGZipB64);
  }
  throw new Error('Informe o XML autorizado da NFSe ou nfseXmlGZipB64 para imprimir o DANFSe');
}
