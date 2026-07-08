export type HttpTraceLogger = (prefix: string, data: unknown) => void | Promise<void>;

export type HttpTracer = {
  logRequest(data: unknown): Promise<void>;
  logResponse(data: unknown): Promise<void>;
  logError(data: unknown): Promise<void>;
};

export type CreateHttpTracerOptions = {
  enabled?: boolean;
  logger?: HttpTraceLogger;
};

export function formatTraceBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body ?? null;
  }

  const trimmed = body.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return JSON.parse(trimmed);
    } catch (_error) {
      return body;
    }
  }

  return body;
}

function defaultLogger(prefix: string, data: unknown) {
  // tslint:disable-next-line:no-console
  console.log(`\n${prefix}`);
  // tslint:disable-next-line:no-console
  console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
}

export function createHttpTracer(options: CreateHttpTracerOptions = {}): HttpTracer {
  const logger = options.logger || defaultLogger;

  async function log(prefix: string, data: unknown) {
    if (!options.enabled) {
      return;
    }

    try {
      await logger(prefix, data);
    } catch (_error) {
      return;
    }
  }

  return {
    logRequest: (data) => log('Request:', data),
    logResponse: (data) => log('Response:', data),
    logError: (data) => log('Error:', data),
  };
}
