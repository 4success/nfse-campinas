import { DpsSigner } from './DpsSigner';

export function verifySignature(xml: string, signer: DpsSigner): boolean {
  return signer.verify(xml);
}
