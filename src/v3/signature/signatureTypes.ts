export type DpsSignatureOptions = {
  idAttributeTarget: 'infDPS' | 'DPS';
  idAttributeName: 'Id';
  signaturePrefix?: '' | 'ds';
  canonicalizationAlgorithm: string;
  signatureAlgorithm: string;
  digestAlgorithm: string;
  transforms: string[];
};

export const defaultDpsSignatureOptions: DpsSignatureOptions = {
  idAttributeTarget: 'infDPS',
  idAttributeName: 'Id',
  signaturePrefix: '',
  canonicalizationAlgorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  signatureAlgorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
  digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
  transforms: [
    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
    'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
  ],
};
