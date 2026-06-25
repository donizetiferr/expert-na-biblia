# Release Keystore — Expert Na Biblia (V17)

**Path**: `C:\ENB\android\app\expert-na-biblia-release.keystore`
**Alias**: `expert-na-biblia`
**Storepass**: `expert2026`
**Keypass**: `expert2026`
**Validity**: 10000 dias (~27 anos, ate 2053)
**Algorithm**: RSA 2048 + SHA256withRSA
**SHA1**: `B6:7B:40:DD:0D:08:96:47:CB:5E:29:7B:60:C9:BD:48:D9:BF:31:4C`
**SHA256**: `BD:DC:CB:57:26:5C:61:AD:3E:DC:6D:BA:87:D5:E3:B2:0A:46:7F:6C:27:A6:98:E2:63:B9:2F:A4:53:37:5D:E2`

## Gerado em 2026-06-25 (V17 T1)

Para gerar novo: `keytool -genkeypair -keystore expert-na-biblia-release.keystore -alias expert-na-biblia -keyalg RSA -keysize 2048 -validity 10000 -storepass expert2026 -keypass expert2026 -dname "CN=Expert Na Biblia, OU=Mobile Apps, O=Donizeti, L=Brasilia, ST=DF, C=BR"`

## AVISO — BACKUP OBRIGATORIO

Este keystore eh a IDENTIDADE do app na Play Store. Se perder, NAO podera mais publicar atualizacoes do mesmo app (assinatura muda).
- NUNCA versionar no git (ja esta em `.gitignore` convencao)
- Fazer backup em local seguro (cofre / HD externo / gerenciador de senhas)
- Mesmo keystore usado em todas as versoes futuras (V18, V19, ...)