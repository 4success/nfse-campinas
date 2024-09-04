import type { Reference } from 'xml-crypto/lib/types';

export type ReferenceOptions = Partial<Reference> & Pick<Reference, 'xpath'>;