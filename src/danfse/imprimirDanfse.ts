import { decodeNfseXmlGZipB64 } from '../utils/nfseXml';

export type ImprimirDanfseInput =
  | {
      xml: string;
      nfseXmlGZipB64?: never;
    }
  | {
      xml?: never;
      nfseXmlGZipB64: string;
    };

export type DanfseViewerModule = {
  DanfseXmlParser: new () => { parse(xml: string): Promise<unknown> };
  DanfseHtmlBuilder: new () => { build(data: unknown): string };
};

function loadDanfseViewer(): Promise<DanfseViewerModule> {
  return Promise.resolve(require('@notaas/danfse-viewer') as DanfseViewerModule);
}

export async function imprimirDanfse(input: ImprimirDanfseInput, viewer?: DanfseViewerModule): Promise<string> {
  const xml = resolveXml(input);
  const { DanfseHtmlBuilder, DanfseXmlParser } = viewer || (await loadDanfseViewer());
  const data = await new DanfseXmlParser().parse(xml);

  return new DanfseHtmlBuilder().build(data);
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
