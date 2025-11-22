# Plano de Migração: Padrão Nacional NFSe Versão 1.2

## 📋 Resumo Executivo

Este documento descreve o plano de migração do projeto NFSe Campinas para a versão 1.2 do Padrão Nacional da Nota Fiscal de Serviços Eletrônica, baseado na Nota Técnica SE/CGNFS-e nº 004/2025.

## 🎯 Objetivo

Garantir a compatibilidade do projeto com as novas especificações da versão 1.2, preparando o sistema para a Reforma Tributária do Consumo (IBS, CBS e IS) e mantendo a conformidade com os padrões nacionais.

## 📊 Análise de Impacto

### ✅ Itens Já Compatíveis

- **Schemas XSD**: Arquivos atuais já estão na versão 1.2 (setembro/2025)
- **Estrutura XML Base**: Mantida sem alterações significativas
- **Assinatura Digital**: Sem mudanças nos algoritmos e estrutura
- **Namespace**: `http://www.sped.fazenda.gov.br/nfse` mantido

### ⚠️ Itens Requerem Atenção

#### 1. Validação de Endereços

- **Problema**: Regras mais rigorosas para campos `xCpl` (complemento) e `nro` (número)
- **Impacto**: Possíveis falhas na validação XML
- **Ação**: Revisar validações e testar com dados reais

#### 2. Novos Campos para Reforma Tributária

- **IBS** (Imposto sobre Bens e Serviços)
- **CBS** (Contribuição sobre Bens e Serviços)
- **IS** (Imposto Seletivo)
- **infComprasGovernamentais**: UASG, número da compra, código do órgão

#### 3. Novas Tabelas Nacionais

- Código de Situação Tributária (CST)
- Classificação da Tributação (cClassTrib)
- Créditos Presumidos

## 🔧 Plano de Ação

### Fase 1: Diagnóstico e Correções Imediatas

#### 1.1 Validação de Endereços

- [ ] Analisar validações atuais dos campos de endereço
- [ ] Implementar correções para regras mais estritas
- [ ] Criar testes unitários para validação de endereços
- [ ] Testar com exemplos reais do fórum ACBr

#### 1.2 Atualização de Tipos

- [ ] Verificar tipos de dados para novos campos
- [ ] Implementar interfaces TypeScript para novos tributos
- [ ] Atualizar enums para novas tabelas nacionais

### Fase 2: Implementação de Novos Funcionalidades

#### 2.1 Campos de Reforma Tributária

- [ ] Implementar grupo `IBSCBSSEL` como opcional
- [ ] Criar interfaces para IBS, CBS e IS
- [ ] Implementar grupo `infComprasGovernamentais`
- [ ] Adicionar suporte a identificação alfanumérica CNPJ

#### 2.2 Tabelas Nacionais

- [ ] Importar tabelas CST, cClassTrib e Créditos Presumidos
- [ ] Implementar validações baseadas nas novas tabelas
- [ ] Criar enums TypeScript para códigos e descrições

### Fase 3: API e Integrações

#### 3.1 Endpoints API

- [ ] Verificar atualizações nos endpoints REST
- [ ] Testar compatibilidade com versão 1.2
- [ ] Atualizar documentação da API

#### 3.2 Compatibilidade Retroativa

- [ ] Implementar parâmetros para ativação/desativação de novos campos
- [ ] Garantir compatibilidade com municípios não aderentes
- [ ] Manter suporte a versões anteriores dos schemas

### Fase 4: Testes e Validação

#### 4.1 Testes Automatizados

- [ ] Criar suíte de testes para novos campos
- [ ] Implementar testes de regressão
- [ ] Validar assinatura XML com novos elementos

#### 4.2 Testes de Homologação

- [ ] Testar com ambiente de Produção Restrita
- [ ] Validar com municípios piloto
- [ ] Verificar interoperabilidade com sistemas nacionais

### Fase 5: Documentação e Deploy

#### 5.1 Documentação

- [ ] Atualizar README com informações da v1.2
- [ ] Criar guia de migração para usuários
- [ ] Documentar novos campos e funcionalidades
- [ ] Exemplos de XML com novos elementos

#### 5.2 Preparação para Produção

- [ ] Implementar feature flags para ativação gradual
- [ ] Preparar rollback plan
- [ ] Documentar cronograma de implementação

## 📅 Marcos Importantes

### Cronograma Oficial

- **MEIs**: Obrigatório desde 01/11/2023
- **Validações Obrigatórias**: A partir de 01/01/2026
- **Implementação Gradual**: 2026-2033
- **Convivência**: Sistemas atuais + novo modelo

### Marcos do Projeto

- **Diagnóstico Completo**: Análise finalizada
- **Correções Críticas**: Validação de endereços
- **Implementação Base**: Novos campos opcionais
- **Testes Homologação**: Validação em ambiente restrito
- **Documentação**: Guias e exemplos atualizados
- **Produção**: Deploy com feature flags

## 🔍 Detalhamento Técnico

### Novos Estruturas XML

```xml
<!-- Grupo para Reforma Tributária (Opcional) -->
<IBSCBSSEL>
  <IBS>
    <!-- Campos específicos do IBS -->
  </IBS>
  <CBS>
    <!-- Campos específicos da CBS -->
  </CBS>
  <IS>
    <!-- Campos específicos do IS -->
  </IS>
</IBSCBSSEL>

<!-- Grupo de Compras Governamentais -->
<infComprasGovernamentais>
  <UASG>...</UASG>
  <nCompra>...</nCompra>
  <cOrgao>...</cOrgao>
</infComprasGovernamentais>
```

### Novas Validações

#### Endereço do Tomador

- `xCpl`: Mínimo 3 caracteres ou nulo
- `nro`: Formato mais restrito, evitar abreviações

#### Identificação CNPJ

- Preparação para formato alfanumérico
- Compatibilidade com Lei nº 14.195/2021

## 🚀 Riscos e Mitigações

### Riscos Identificados

1. **Quebra de compatibilidade** com validações antigas
2. **Rejeição em homologação** por detalhes de validação
3. **Complexidade** na implementação de novos tributos
4. **Documentação deficiente** dos novos campos

### Mitigações

1. **Testes abrangentes** e regressão automatizada
2. **Feature flags** para ativação gradual
3. **Modularização** do código de tributos
4. **Documentação detalhada** com exemplos práticos

## 📋 Checklist de Migração

### Pré-Migração

- [ ] Backup completo do código atual
- [ ] Versão atual taggeada no Git
- [ ] Testes passando 100%
- [ ] Documentação atualizada

### Migração

- [ ] Implementar correções de validação
- [ ] Adicionar novos campos opcionais
- [ ] Atualizar tipos TypeScript
- [ ] Criar novos testes

### Pós-Migração

- [ ] Testes completos passando
- [ ] Validação em ambiente de homologação
- [ ] Documentação atualizada
- [ ] Comunicar mudanças aos usuários

## 📚 Referências

- [Nota Técnica SE/CGNFS-e nº 004/2025](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/rtc/nt-004-se-cgnfse-novo-layout-rtc.pdf/view)
- [Documentação Atual - Padrão Nacional NFSe](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual)
- [Esquemas XSD v1.2](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/nfs-e_esquemas_implantacao_setembro_2025_2.zip/view)
- [Manual Contribuintes API v1.2](https://www.gov.br/nfse/pt-br/biblioteca/documentacao-tecnica/documentacao-atual/manual-contribuintes-emissor-publico-api-sistema-nacional-nfs-e-v1-2-out2025.pdf/view)

## 🔄 Manutenção Contínua

### Monitoramento

- Acompanhar atualizações dos schemas
- Verificar comunicados oficiais do CGNFS-e
- Monitorar fóruns e comunidades desenvolvedores

### Atualizações Futuras

- Preparar para novas versões dos schemas
- Manter compatibilidade com evoluções da API
- Adaptar a mudanças na legislação tributária

---

**Status**: Em elaboração  
**Versão**: 1.0  
**Última Atualização**: 22/11/2025  
**Próxima Revisão**: Pós-implementação Fase 1
