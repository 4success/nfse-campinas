export function redactSensitiveXml(value: string): string {
  return value
    .replace(/\d{3}\.?\d{3}\.?\d{3}-?\d{2}/g, '***CPF***')
    .replace(/\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}/g, '***CNPJ***')
    .replace(/<X509Certificate>[\s\S]*?<\/X509Certificate>/g, '<X509Certificate>***REDACTED***</X509Certificate>');
}
