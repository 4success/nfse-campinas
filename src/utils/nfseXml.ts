import { gunzipSync } from 'zlib';

export function decodeNfseXmlGZipB64(nfseXmlGZipB64: string): string {
  return gunzipSync(Buffer.from(nfseXmlGZipB64, 'base64')).toString('utf8');
}
