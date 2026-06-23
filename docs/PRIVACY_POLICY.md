# Privacy Policy — Expert Na Bíblia

> Ultima atualizacao: 2026-06-23
> Versao do app: 1.0.0
> Publico-alvo: LGPD (Lei Geral de Protecao de Dados) — adultos

## Dados Coletados

O app **Expert Na Bíblia** NAO coleta dados pessoais identificaveis (PII). Especificamente:

- **Nao coletamos**: nome, email, telefone, CPF, endereco, geolocalizacao, contatos, fotos, microphone.
- **Nao requeremos cadastro/login**: app funciona 100% offline apos download.
- **Dados gerados localmente** (no device do usuario): progresso de licoes (modulos concluidos, streak diario, ranking quiz). Esses dados ficam apenas no SQLite local do device e podem ser resetados pelo usuario em Configuracoes > Resetar progresso.

## Servicos de Terceiros

### 1. Minimax M2.7 (IA para avaliacao de respostas)
- **Proposito**: avaliar respostas abertas nas licoes quando nao ha match canonico local.
- **Dados enviados**: a pergunta + a resposta digitada pelo usuario.
- **Politica do provedor**: https://platform.minimax.io/docs/token-plan/privacy
- **Quando eh acionado**: apenas quando o matching local nao atinge score >= 0.85.
- **API key**: armazenada em expo-secure-store (criptografada no keychain/keystore do device).

### 2. OpenAI GPT-4o-mini (fallback)
- **Proposito**: avaliacao secundaria quando Minimax M2.7 falha (quota excedida, timeout).
- **Dados enviados**: mesma natureza do Minimax.
- **Politica do provedor**: https://openai.com/policies/privacy-policy
- **Quando eh acionado**: erro de rede/timeout em M3.

### 3. Google AdMob (anuncios)
- **Proposito**: monetizacao via anuncios em modo FREE.
- **Dados enviados**: identificador de dispositivo (Advertising ID), coarse location (opcional, conforme politica do Google).
- **Quando eh acionado**: usuario navegando em Modo Licoes/Quiz (telas NAO-criticas).
- **Consentimento**: dialog GDPR exibido na primeira execucao. Usuario pode revogar em Configuracoes.
- **NUNCA em**: splash, Tela Final, Tela Feedback (regras do projeto).
- **Opt-out**: settings.notificacoes = false desabilita.

### 4. Sentry / Crashlytics (telemetria de erros)
- **Proposito**: capturar crashes anonimos para melhorar estabilidade.
- **Dados enviados**: stack trace + versao do app + device model. NAO inclui conteudo das respostas do usuario.
- **Politica do provedor**: https://sentry.io/privacy/

## Permissoes Solicitadas

- **NOTIFICATIONS** (Android): para enviar lembretes diarios de estudo (opt-in).
- **INTERNET** (Android): para chamadas a M3/OpenAI/AdMob.
- Nenhuma outra permissao solicitada.

## Direitos do Usuario (LGPD)

Conforme Lei 13.709/2018, o usuario tem direito a:

1. **Acesso**: solicitar informacoes sobre dados coletados (nenhum PII).
2. **Correcao**: dados locais podem ser editados/resetados em Configuracoes.
3. **Exclusao**: "Resetar progresso" apaga todos os dados locais.
4. **Portabilidade**: dados locais estao em SQLite embarcado; resetar remove tudo.
5. **Revogacao de consentimento**: AdMob pode ser desativado em Configuracoes.

## Encarregado de Dados (DPO)

- Donizeti Ferreira
- Contato via Google Play Console (quando publicado) ou e-mail de suporte.

## Mudancas nesta Politica

Notificaremos via atualizacao do app caso haja alteracoes relevantes. Data da ultima atualizacao indicada no topo deste documento.

## Base Legal

- LGPD Art. 7, II — tutelado pelo consentimento (opt-in explicito para notificacoes e AdMob).
- LGPD Art. 7, IX — interesse legitimo (telemetria de crashes para melhoramento do app).

---

**Hospedagem sugerida**: GitHub Pages em `donizetiferr.github.io/expert-na-biblia/privacy`
**URL esperada** (apos publicacao): https://donizetiferr.github.io/expert-na-biblia/privacy