export function redactSensitiveXml(value: string): string {
  return value
    .replace(/(^|\D)\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}(?=\D|$)/g, '$1***CNPJ***')
    .replace(/(^|\D)\d{3}\.?\d{3}\.?\d{3}-?\d{2}(?=\D|$)/g, '$1***CPF***')
    .replace(/<X509Certificate>[\s\S]*?<\/X509Certificate>/g, '<X509Certificate>***REDACTED***</X509Certificate>');
}
