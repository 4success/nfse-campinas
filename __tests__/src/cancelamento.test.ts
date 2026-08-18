import nock from 'nock';
import { SignedXml } from 'xml-crypto';
import { gunzipSync } from 'zlib';
import { NfseCampinasV3 } from '../../src/classes/NfseCampinasV3';
import { CampinasDpsClient } from '../../src/client/CampinasDpsClient';
import { HOMOLOGACAO_EVENTOS_ENDPOINT, resolveEventosEndpoint } from '../../src/client/endpoints';
import { parseCancelarNfseResponse } from '../../src/client/responseParser';
import { MissingProductionEndpointError } from '../../src/errors/MissingProductionEndpointError';
import { ValidationError } from '../../src/errors/ValidationError';

const mockToPem = jest.fn(() => ({ privateKey: 'PRIVATE', publicCert: 'PUBLIC' }));

jest.mock('../../src/certificate/PfxCertificate', () => ({
  PfxCertificate: jest.fn().mockImplementation(() => ({
    toPem: mockToPem,
  })),
}));

jest.mock('xml-crypto');

function mockEventSignature(signedXml: string) {
  const signer = {
    addReference: jest.fn(),
    computeSignature: jest.fn(),
    getSignedXml: jest.fn().mockReturnValue(signedXml),
  };

  jest.mocked(SignedXml).mockImplementation(() => signer as unknown as SignedXml);
  return signer;
}

describe('cancelamento de NFSe', () => {
  const chaveAcesso = 'NFS35095022215547137000138000000000210026073571802007';
  const chaveSemPrefixo = chaveAcesso.slice(3);
  const signedXml =
    '<?xml version="1.0"?><evento-opaco><conteudo>preservar sem alterações</conteudo><Signature>assinatura-teste</Signature></evento-opaco>';
  const dadosCancelamento = {
    chaveAcesso,
    autor: { cnpj: '12.345.678/0001-99' },
    codigoMotivo: 2 as const,
    motivo: 'Serviço não prestado & contrato <desfeito> 😀',
    dataHoraEvento: '2026-08-18T10:30:45-03:00',
    versaoAplicativo: '3.4.0-test',
  };

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  test('resolve somente o endpoint de eventos oficialmente publicado', () => {
    expect(HOMOLOGACAO_EVENTOS_ENDPOINT).toBe('https://preprod-nfse.ima.sp.gov.br/notafiscal-adn-ws/api/adn/nfse');
    expect(resolveEventosEndpoint('homologacao')).toBe(HOMOLOGACAO_EVENTOS_ENDPOINT);
    expect(resolveEventosEndpoint('homologacao', { eventos: 'https://eventos.local/nfse/' })).toBe(
      'https://eventos.local/nfse/',
    );
    expect(resolveEventosEndpoint('producao', { eventos: 'https://eventos-producao.local/nfse' })).toBe(
      'https://eventos-producao.local/nfse',
    );
    expect(() => resolveEventosEndpoint('producao')).toThrow(MissingProductionEndpointError);
  });

  test('envia o pedido assinado em JSON GZip/Base64 para a rota síncrona de eventos', async () => {
    const endpoint = 'https://eventos.local/nfse/';
    const scope = nock('https://eventos.local')
      .post(`/nfse/${chaveAcesso}/eventos`, (body) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        expect(Object.keys(payload)).toEqual(['pedidoRegistroEventoXmlGZipB64']);
        expect(gunzipSync(Buffer.from(payload.pedidoRegistroEventoXmlGZipB64, 'base64')).toString('utf8')).toBe(
          signedXml,
        );
        return true;
      })
      .matchHeader('content-type', /application\/json/)
      .reply(
        201,
        JSON.stringify({
          tipoAmbiente: 2,
          versaoAplicativo: '1.0',
          eventoXmlGZipB64: 'H4sIAAAAAAAA',
          alertas: [],
        }),
        { 'content-type': 'application/json' },
      );

    const result = await new CampinasDpsClient({
      endpoint,
      transport: { useClientCertificate: false },
    }).cancelarNfse({ chaveAcesso, signedXml });

    expect(result).toMatchObject({
      chaveAcesso,
      signedXml,
      tipoAmbiente: '2',
      versaoAplicativo: '1.0',
      eventoXmlGZipB64: 'H4sIAAAAAAAA',
      alertas: [],
      httpStatus: 201,
    });
    expect(JSON.parse(result.rawRequest)).toHaveProperty('pedidoRegistroEventoXmlGZipB64');
    expect(result.rawResponse).toContain('eventoXmlGZipB64');
    expect(scope.isDone()).toBe(true);
  });

  test('codifica a chave de acesso ao montar a rota no cliente de baixo nível', async () => {
    const scope = nock('https://eventos.local')
      .post('/nfse/NFS%2F1/eventos')
      .reply(200, JSON.stringify({ eventoXmlGZipB64: 'H4sIAAAAAAAA', alertas: [] }), {
        'content-type': 'application/json',
      });

    const result = await new CampinasDpsClient({
      endpoint: 'https://eventos.local/nfse',
      transport: { useClientCertificate: false },
    }).cancelarNfse({ chaveAcesso: 'NFS/1', signedXml });

    expect(result.chaveAcesso).toBe('NFS/1');
    expect(scope.isDone()).toBe(true);
  });

  test('preserva resposta e alertas da Prefeitura em erro HTTP', async () => {
    const rawResponse = JSON.stringify({
      tipoAmbiente: 2,
      alertas: [{ codigo: 'E1102', mensagem: 'NFS-e já cancelada' }],
    });
    nock('https://eventos-error.local').post(`/nfse/${chaveAcesso}/eventos`).reply(400, rawResponse, {
      'content-type': 'application/json',
    });

    await expect(
      new CampinasDpsClient({
        endpoint: 'https://eventos-error.local/nfse',
        transport: { useClientCertificate: false },
      }).cancelarNfse({ chaveAcesso, signedXml }),
    ).rejects.toMatchObject({
      chaveAcesso,
      response: {
        chaveAcesso,
        signedXml,
        tipoAmbiente: '2',
        alertas: [{ codigo: 'E1102', mensagem: 'NFS-e já cancelada' }],
        rawResponse,
        httpStatus: 400,
      },
    });
  });

  test.each([
    [
      'lista de erros',
      { erros: [{ Codigo: 'E1103', Descricao: 'Pedido de evento rejeitado', Complemento: 'campo infPedReg' }] },
    ],
    [
      'erro singular',
      { erro: { Codigo: 'E1103', Descricao: 'Pedido de evento rejeitado', Complemento: 'campo infPedReg' } },
    ],
  ])('normaliza %s do padrão nacional sem perder o complemento', (_formato, response) => {
    const result = parseCancelarNfseResponse({
      chaveAcesso,
      signedXml,
      rawRequest: '{}',
      rawResponse: JSON.stringify(response),
      httpStatus: 400,
      headers: { 'content-type': 'application/json' },
    });

    expect(result.alertas).toEqual([
      {
        codigo: 'E1103',
        mensagem: 'Pedido de evento rejeitado',
        complemento: 'campo infPedReg',
      },
    ]);
  });

  test('parser preserva campos conhecidos, conteúdo bruto e extensões da resposta', () => {
    const rawRequest = JSON.stringify({ pedidoRegistroEventoXmlGZipB64: 'H4sIAAAAAAAA' });
    const rawResponse = JSON.stringify({
      tipoAmbiente: 2,
      versaoAplicativo: '1.0',
      dataHoraProcessamento: '2026-08-18T10:00:00-03:00',
      eventoXmlGZipB64: 'EVENTO_GZIP_BASE64',
      alertas: [],
      extensaoPrefeitura: { protocolo: '123' },
    });

    const result = parseCancelarNfseResponse({
      chaveAcesso,
      signedXml,
      rawRequest,
      rawResponse,
      httpStatus: 200,
      headers: { 'content-type': 'application/json' },
    });

    expect(result).toMatchObject({
      chaveAcesso,
      signedXml,
      tipoAmbiente: '2',
      versaoAplicativo: '1.0',
      dataHoraProcessamento: '2026-08-18T10:00:00-03:00',
      eventoXmlGZipB64: 'EVENTO_GZIP_BASE64',
      alertas: [],
      rawRequest,
      rawResponse,
      httpStatus: 200,
      parsedResponse: { extensaoPrefeitura: { protocolo: '123' } },
    });
  });

  test('fachada usa endpoint de eventos customizado sem alterar nem reassinar o XML', async () => {
    const scope = nock('https://eventos-fachada.local')
      .post(`/nfse/${chaveSemPrefixo}/eventos`, (body) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        return gunzipSync(Buffer.from(payload.pedidoRegistroEventoXmlGZipB64, 'base64')).toString('utf8') === signedXml;
      })
      .reply(200, JSON.stringify({ eventoXmlGZipB64: 'H4sIAAAAAAAA', alertas: [] }), {
        'content-type': 'application/json',
      });
    const nfse = new NfseCampinasV3({
      environment: 'producao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { eventos: 'https://eventos-fachada.local/nfse' },
      transport: { useClientCertificate: false },
    });

    const result = await nfse.cancelarNfse({ chaveAcesso: chaveSemPrefixo, signedXml });

    expect(result).toMatchObject({
      chaveAcesso: chaveSemPrefixo,
      signedXml,
      eventoXmlGZipB64: 'H4sIAAAAAAAA',
    });
    expect(mockToPem).not.toHaveBeenCalled();
    expect(scope.isDone()).toBe(true);
  });

  test('gera XML 101101 público com Id, ordem e escape determinísticos', () => {
    const nfse = new NfseCampinasV3({
      environment: 'homologacao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    const xml = nfse.buildCancelamentoNfseXml(dadosCancelamento);

    expect(xml).toContain('<pedRegEvento');
    expect(xml).toContain('xmlns="http://www.sped.fazenda.gov.br/nfse"');
    expect(xml).toContain('versao="1.01"');
    expect(xml).toContain(`<infPedReg Id="PRE${chaveSemPrefixo}101101">`);
    expect(xml).toContain('<tpAmb>2</tpAmb>');
    expect(xml).toContain('<verAplic>3.4.0-test</verAplic>');
    expect(xml).toContain('<dhEvento>2026-08-18T10:30:45-03:00</dhEvento>');
    expect(xml).toContain('<CNPJAutor>12345678000199</CNPJAutor>');
    expect(xml).toContain(`<chNFSe>${chaveSemPrefixo}</chNFSe>`);
    expect(xml).toContain('<e101101><xDesc>Cancelamento de NFS-e</xDesc><cMotivo>2</cMotivo>');
    expect(xml).toContain('<xMotivo>Serviço não prestado &amp; contrato &lt;desfeito&gt; 😀</xMotivo>');
    expect(xml).not.toContain('<nPedRegEvento>');

    const orderedFragments = [
      '<tpAmb>',
      '<verAplic>',
      '<dhEvento>',
      '<CNPJAutor>',
      '<chNFSe>',
      '<e101101>',
      '<xDesc>',
      '<cMotivo>',
      '<xMotivo>',
    ];
    let previousIndex = -1;
    orderedFragments.forEach((fragment) => {
      const currentIndex = xml.indexOf(fragment);
      expect(currentIndex).toBeGreaterThan(previousIndex);
      previousIndex = currentIndex;
    });
  });

  test('gera autor CPF e data padrão válida a partir do relógio atual', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-18T13:45:30.789Z'));

    try {
      const nfse = new NfseCampinasV3({
        environment: 'producao',
        certificate: Buffer.from('CERT'),
        certPassword: 'secret',
        applicationVersion: '3.4.0-sdk',
        transport: { useClientCertificate: false },
      });

      const xml = nfse.buildCancelamentoNfseXml({
        chaveAcesso: chaveSemPrefixo,
        autor: { cpf: '123.456.789-01' },
        codigoMotivo: 1,
        motivo: 'Erro na emissão da nota',
      });
      const dataHoraEvento = xml.match(/<dhEvento>([^<]+)<\/dhEvento>/)?.[1];

      expect(xml).toContain('<tpAmb>1</tpAmb>');
      expect(xml).toContain('<verAplic>3.4.0-sdk</verAplic>');
      expect(xml).toContain('<CPFAutor>12345678901</CPFAutor>');
      expect(xml).not.toContain('<CNPJAutor>');
      expect(dataHoraEvento).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
      expect(new Date(dataHoraEvento!).getTime()).toBe(new Date('2026-08-18T13:45:30.000Z').getTime());
    } finally {
      jest.useRealTimers();
    }
  });

  test('assina o XML público referenciando infPedReg e posicionando Signature depois dele', async () => {
    const unsignedXml = `<?xml version="1.0"?><pedRegEvento><infPedReg Id="PRE${chaveSemPrefixo}101101"><tpAmb>2</tpAmb></infPedReg></pedRegEvento>`;
    const generatedSignedXml = unsignedXml.replace(
      '</infPedReg>',
      '</infPedReg><Signature xmlns="http://www.w3.org/2000/09/xmldsig#"></Signature>',
    );
    const signer = mockEventSignature(generatedSignedXml);
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    const result = await nfse.signCancelamentoNfseXml(unsignedXml);

    expect(result).toBe(generatedSignedXml);
    expect(SignedXml).toHaveBeenCalledWith(
      expect.objectContaining({
        privateKey: 'PRIVATE',
        publicCert: 'PUBLIC',
      }),
    );
    expect(signer.addReference).toHaveBeenCalledWith(
      expect.objectContaining({
        xpath: `//*[local-name(.)='infPedReg' and @Id='PRE${chaveSemPrefixo}101101']`,
        uri: `#PRE${chaveSemPrefixo}101101`,
      }),
    );
    expect(signer.computeSignature).toHaveBeenCalledWith(unsignedXml, {
      prefix: '',
      location: { reference: "//*[local-name(.)='infPedReg']", action: 'after' },
    });
    expect(mockToPem).toHaveBeenCalled();
  });

  test('fachada automática gera, assina e transmite mantendo a chave original na rota', async () => {
    const generatedSignedXml = `<?xml version="1.0"?><pedRegEvento><infPedReg Id="PRE${chaveSemPrefixo}101101"></infPedReg><Signature>assinatura-gerada</Signature></pedRegEvento>`;
    const signer = mockEventSignature(generatedSignedXml);
    const scope = nock('https://eventos-auto.local')
      .post(`/nfse/${chaveAcesso}/eventos`, (body) => {
        const payload = typeof body === 'string' ? JSON.parse(body) : body;
        return (
          gunzipSync(Buffer.from(payload.pedidoRegistroEventoXmlGZipB64, 'base64')).toString('utf8') ===
          generatedSignedXml
        );
      })
      .reply(200, JSON.stringify({ eventoXmlGZipB64: 'EVENTO_AUTO', alertas: [] }), {
        'content-type': 'application/json',
      });
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { eventos: 'https://eventos-auto.local/nfse' },
      transport: { useClientCertificate: false },
    });

    const result = await nfse.cancelarNfse(dadosCancelamento);
    const unsignedXml = signer.computeSignature.mock.calls[0]?.[0] as string;

    expect(unsignedXml).toContain(`<infPedReg Id="PRE${chaveSemPrefixo}101101">`);
    expect(unsignedXml).toContain(`<chNFSe>${chaveSemPrefixo}</chNFSe>`);
    expect(unsignedXml).toContain('<tpAmb>2</tpAmb>');
    expect(result).toMatchObject({
      chaveAcesso,
      signedXml: generatedSignedXml,
      eventoXmlGZipB64: 'EVENTO_AUTO',
    });
    expect(SignedXml).toHaveBeenCalledTimes(1);
    expect(mockToPem).toHaveBeenCalled();
    expect(scope.isDone()).toBe(true);
  });

  test('resolve a ausência de endpoint de produção antes de assinar o pedido automático', async () => {
    const nfse = new NfseCampinasV3({
      environment: 'producao',
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.cancelarNfse(dadosCancelamento)).rejects.toBeInstanceOf(MissingProductionEndpointError);
    expect(SignedXml).not.toHaveBeenCalled();
    expect(mockToPem).not.toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });

  test('rejeita mistura de XML assinado com dados estruturados sem assinar nem enviar', async () => {
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { eventos: 'https://nao-deve-enviar.local/nfse' },
      transport: { useClientCertificate: false },
    });

    await expect(nfse.cancelarNfse({ ...dadosCancelamento, signedXml } as any)).rejects.toMatchObject({
      name: ValidationError.name,
      issues: expect.arrayContaining([expect.objectContaining({ severity: 'error' })]),
    });
    expect(SignedXml).not.toHaveBeenCalled();
    expect(mockToPem).not.toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });

  test('valida os dados estruturados sem exigir signedXml', async () => {
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      endpoints: { eventos: 'https://nao-deve-enviar.local/nfse' },
      transport: { useClientCertificate: false },
    });

    let caught: unknown;
    try {
      await nfse.cancelarNfse({ chaveAcesso } as any);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(ValidationError);
    const fields = (caught as ValidationError).issues.map((issue) => issue.field);
    expect(fields).toEqual(expect.arrayContaining(['autor', 'codigoMotivo', 'motivo']));
    expect(fields).not.toContain('signedXml');
    expect(SignedXml).not.toHaveBeenCalled();
    expect(mockToPem).not.toHaveBeenCalled();
    expect(nock.isDone()).toBe(true);
  });

  test.each([{ autor: {} }, { autor: { cpf: '123.456.789-01', cnpj: '12.345.678/0001-99' } }])(
    'exige autor com exatamente um entre CPF e CNPJ: %p',
    async ({ autor }) => {
      const nfse = new NfseCampinasV3({
        certificate: Buffer.from('CERT'),
        certPassword: 'secret',
        endpoints: { eventos: 'https://nao-deve-enviar.local/nfse' },
        transport: { useClientCertificate: false },
      });

      let caught: unknown;
      try {
        await nfse.cancelarNfse({ ...dadosCancelamento, autor } as any);
      } catch (error) {
        caught = error;
      }

      expect(caught).toBeInstanceOf(ValidationError);
      expect((caught as ValidationError).issues.some((issue) => issue.field.startsWith('autor'))).toBe(true);
      expect(SignedXml).not.toHaveBeenCalled();
      expect(mockToPem).not.toHaveBeenCalled();
      expect(nock.isDone()).toBe(true);
    },
  );

  test.each([
    [{ chaveAcesso: 'invalida', signedXml }, 'chaveAcesso'],
    [{ chaveAcesso, signedXml: '   ' }, 'signedXml'],
  ])('fachada rejeita entrada inválida antes da rede: %s', async (input, field) => {
    const nfse = new NfseCampinasV3({
      certificate: Buffer.from('CERT'),
      certPassword: 'secret',
      transport: { useClientCertificate: false },
    });

    await expect(nfse.cancelarNfse(input)).rejects.toMatchObject({
      name: ValidationError.name,
      issues: [expect.objectContaining({ field, severity: 'error' })],
    });
    expect(nock.isDone()).toBe(true);
  });
});
