import sqlite3
import requests
import json
import re
import time
import os

# V23.G.1 (seguranca): token NUNCA hardcoded. Le de MINIMAX_API_KEY ou do cofre
# (Tokens API e acessos/minimax/credentials.env). Antes havia o token em texto plano aqui.
def _load_token():
    env = os.environ.get("MINIMAX_API_KEY")
    if env:
        return env
    cofre = os.path.join(
        os.environ.get("USERPROFILE", os.path.expanduser("~")),
        "Downloads", "Projetos_VSCode", "Tokens API e acessos", "minimax", "credentials.env",
    )
    try:
        with open(cofre, "r", encoding="utf-8") as f:
            for line in f:
                m = re.search(r'MINIMAX_AUTH_TOKEN="([^"]+)"', line)
                if m:
                    return m.group(1)
    except OSError:
        pass
    raise RuntimeError("MINIMAX_API_KEY nao encontrado (env ou cofre credentials.env)")


API_KEY = _load_token()
API_URL = "https://api.minimax.io/v1"
DB_PATH = "data/db.sqlite"
N = 50  # perguntas a processar

def call_m3(pergunta):
    payload = {
        "model": "MiniMax-M2.7",
        "messages": [
            {"role": "system", "content": "Voce eh um teologo especialista em Biblia. Responda de forma clara, concisa e biblicamente fiel. Use ate 3 paragrafos. Inclua citacao biblica relevante se aplicavel. Responda em JSON com a chave 'resposta'."},
            {"role": "user", "content": f"Pergunta: {pergunta}"}
        ],
        "max_tokens": 400,
        "temperature": 0.3
    }
    headers = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}
    try:
        r = requests.post(f"{API_URL}/chat/completions", json=payload, headers=headers, timeout=60)
        if r.status_code != 200:
            return None
        data = r.json()
        content = data['choices'][0]['message']['content']
        content = re.sub(r'<think[^>]*>.*?think>', '', content, flags=re.DOTALL).strip()
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group(0))
                return parsed.get('resposta', content)
            except:
                return content
        return content
    except Exception as e:
        print(f"  ERRO: {e}", flush=True)
        return None

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute("""
SELECT p.id, p.texto 
FROM perguntas p 
JOIN licoes l ON p.licao_id = l.id 
WHERE l.modulo_id = 'FB01'
ORDER BY p.id 
LIMIT ?
""", (N,))
samples = c.fetchall()
print(f"[M3] {len(samples)} perguntas selecionadas", flush=True)

success = 0
fail = 0
t_start = time.time()

for i, (pid, ptexto) in enumerate(samples, 1):
    t0 = time.time()
    resp = call_m3(ptexto)
    elapsed = time.time() - t0
    
    if resp and len(resp) > 20:
        c.execute('INSERT OR REPLACE INTO respostas_canonicas VALUES (?, ?, ?, ?)',
                  (pid, resp, 0.85, '2026-06-23'))
        success += 1
        if i % 5 == 0 or i == 1 or i == len(samples):
            print(f"  [{i:2}/{len(samples)}] OK ({elapsed:.1f}s) | {pid}", flush=True)
    else:
        fail += 1
        print(f"  [{i:2}/{len(samples)}] FALHOU | {pid}", flush=True)
    conn.commit()
    time.sleep(0.3)  # rate limit

total_elapsed = time.time() - t_start
print(f"\n[M3] CONCLUIDO em {total_elapsed:.0f}s: {success} sucessos, {fail} falhas", flush=True)

c.execute('SELECT COUNT(*) FROM respostas_canonicas')
total = c.fetchone()[0]
print(f"[M3] Banco agora tem {total} respostas canonicas", flush=True)
conn.close()
