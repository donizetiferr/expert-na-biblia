# Git Workflow — Expert Na Biblia

> Estrategia de branches, mensagens de commit e politicas de merge/push.
> Aplicavel a partir de V1 (commit inicial 7aa0254).

## Branches

### `main` (protegida)
- Codigo em producao (Play Store / App Store).
- Push direto: BLOQUEADO. Apenas via PR aprovada + CI verde.
- Branch protection rules recomendadas:
  - Require pull request reviews (>= 1)
  - Require status checks: `lint-type-check`, `test-unit`
  - Require up-to-date branches
  - Dismiss stale pull request approvals when new commits are pushed

### `dev` (integracao)
- Branch de integracao onde features confluem antes de ir para main.
- CI roda automaticamente; pode quebrar ocasionalmente enquanto features em desenvolvimento.
- Atualizada por merge de feature/* via PR (sem review obrigatorio).

### `feature/*` (desenvolvimento)
- Convecao: `feature/<item-id>-<slug-curto>`
- Exemplos:
  - `feature/p1-5-tela-licao`
  - `feature/p2-7-gerador-alternativas`
  - `feature/v6-onboarding-swiper`
- Vida curta: aberta quando item comeca, mergeada em `dev` quando completa.
- NAO rebasa contra `main` (apenas contra `dev` se necessario).

### `fix/*` (correcoes urgentes)
- Para hotfixes criticos que precisam ir direto para main.
- Convecao: `fix/<slug-curto>`
- Branched de `main`, PR com review obrigatorio + CI verde.
- Apos merge: cherry-pick ou back-merge para `dev`.

### `release/*` (release candidates)
- Para preparar releases (snapshot de versao).
- Convecao: `release/vX.Y.Z`
- Branched de `dev`, merge em `main` + tag.

## Conventional Commits

Mensagens seguem o padrao [Conventional Commits 1.0.0](https://www.conventionalcommits.org/).

```
<type>(<scope>): <descricao curta em portugues>

<corpo opcional explicando o que e por que>

<reference opcional ao item do roadmap>
```

### Tipos

| Type | Quando usar | Exemplo |
|------|-------------|---------|
| `feat` | Nova feature/funcionalidade | `feat(quiz): tela de placar com 3 variantes` |
| `fix` | Correcao de bug | `fix(matching): edge case em sinonimos com acento` |
| `chore` | Manutencao, refactor, infra | `chore(setup): atualizar tsconfig com noUncheckedIndexedAccess` |
| `docs` | Documentacao apenas | `docs(readme): adicionar secao de build EAS` |
| `style` | Formatacao, sem logica | `style(eslint): corrigir aspas em 5 arquivos` |
| `test` | Adicionar/corrigir testes | `test(matching): adicionar caso sinonimos` |
| `perf` | Melhoria de performance | `perf(sqlite): adicionar indice composto` |
| `ci` | CI/CD | `ci(github): adicionar job EAS preview` |

### Scope

Area do projeto afetada: `setup`, `splash`, `licoes`, `quiz`, `matching`, `m3`, `openai`, `sqlite`, `migrations`, `ci`, `audio`, `fonts`, `admob`, `notification`, etc.

## Politica de Commits

1. **Granularidade**: 1 commit por item entregue (ou 1 commit por milestone coerente).
2. **Working tree limpo**: nunca commitar com testes quebrados ou `console.log` de debug.
3. **Co-autoria**: nunca mencionar IA no commit (politica de privacidade).
4. **Assinatura**: `git config commit.gpgsign false` para este projeto pessoal (sem chave GPG).
5. **Push**: AUTORIZADO automaticamente a cada ciclo (regra global) — conta GitHub pessoal `donizetiferr`.

## Politica de Push (remoto)

- **Push normal**: AUTORIZADO. Comando: `git push origin <branch>`.
- **Push force (`--force` ou `--force-with-lease`)**: PROIBIDO sem aprovacao explicita. Hook `~/.claude/hooks/block-dangerous-git.js` bloqueia.
- **Push para branch protegida** (`main`, `release/*`): via PR, nao push direto.

## Politica de Tag (versoes)

- Tags seguem semver: `vMAJOR.MINOR.PATCH` (ex: `v0.1.0`, `v1.0.0`).
- Tag eh criada no commit de release via `git tag -a vX.Y.Z -m "mensagem"` + push.
- Tag pre-deploy obrigatoria antes de build EAS production (rollback automatico).

## Exemplo de fluxo completo

```bash
# 1. Iniciar feature
git checkout dev
git pull origin dev
git checkout -b feature/p1-5-tela-licao

# 2. Implementar
# ... edicoes, npm test, etc ...

# 3. Commitar
git add src/app/licao.tsx src/components/PerguntaCard.tsx
git commit -m "feat(licoes): tela de licao com personagem livro e input R:"

# 4. PR para dev
git push origin feature/p1-5-tela-licao
# Abrir PR no GitHub: feature/p1-5-tela-licao -> dev

# 5. Apos merge em dev e validacao, dev -> main via PR de release
```

## Politica de Protecao contra Segredos

- NUNCA commitar tokens, chaves de API ou credenciais.
- `.env`, `.env.local`, `*.keystore`, `*.jks`, `google-service-account.json` estao no `.gitignore`.
- Hook `block-dangerous-git.js` alerta se detectar tentativa de push com esses arquivos.
- API keys M3 / OpenAI vao em `expo-secure-store` no app, NAO em codigo.

## Pre-commit Checklist

Antes de `git commit`:

- [ ] `npm run type-check` (tsc --noEmit) sem erros
- [ ] `npm run lint` sem warnings novos
- [ ] `npm run format:check` OK
- [ ] `npm test` passa (Jest)
- [ ] Sem `console.log` / `print` de debug
- [ ] Sem secrets hardcoded
- [ ] Mensagem de commit segue conventional commits