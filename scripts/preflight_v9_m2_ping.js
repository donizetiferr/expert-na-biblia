// Pre-flight V9 — ping M2.7 (OpenAI-compat /v1/chat/completions) para validar credencial + medir latencia
const fs = require('fs');
const envPath =
  'C:/Users/Donizeti/Downloads/Projetos_VSCode/Tokens API e acessos/minimax/credentials.env';
const env = fs.readFileSync(envPath, 'utf8');
const tokenMatch = env.match(/MINIMAX_AUTH_TOKEN="([^"]+)"/);
const baseMatch = env.match(/MINIMAX_BASE_URL="([^"]+)"/);
if (!tokenMatch || !baseMatch) {
  console.error('env parse fail');
  process.exit(1);
}
const TOKEN = tokenMatch[1];

// credentials.md diz que /v1 (OpenAI-compat) funciona com Token Plan key.
// Vou testar AMBOS os endpoints: /v1/chat/completions e /anthropic/v1/messages

const payloadV1 = {
  model: 'MiniMax-M2.7',
  messages: [
    { role: 'user', content: 'Responda em portugues: capital do Brasil?' },
  ],
  max_tokens: 50,
};

async function probe(url, headers, body, label) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const elapsed = Date.now() - t0;
    const status = res.status;
    const text = await res.text();
    console.log(`\n[${label}] POST ${url}`);
    console.log(`  status=${status} elapsed=${elapsed}ms bytes=${text.length}`);
    if (status === 200) {
      try {
        const json = JSON.parse(text);
        const msg = json.choices?.[0]?.message?.content || json.content?.[0]?.text || '(sem content)';
        const usage = json.usage || {};
        console.log('  content:', String(msg).slice(0, 200));
        console.log('  usage:', JSON.stringify(usage));
      } catch (e) {
        console.log('  raw(text 200):', text.slice(0, 500));
      }
    } else {
      console.log('  raw:', text.slice(0, 500));
    }
  } catch (e) {
    console.log(`\n[${label}] ERRO: ${e.message}`);
  }
}

(async () => {
  // Probe 1: /v1 (OpenAI-compat)
  await probe(
    'https://api.minimax.io/v1/chat/completions',
    {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    payloadV1,
    'OPENAI_COMPAT_V1',
  );

  // Probe 2: /anthropic/v1/messages (Anthropic SDK-style)
  const payloadAnthropic = {
    model: 'MiniMax-M2.7',
    max_tokens: 50,
    messages: [{ role: 'user', content: 'Responda em portugues: capital do Brasil?' }],
  };
  await probe(
    'https://api.minimax.io/anthropic/v1/messages',
    {
      'Content-Type': 'application/json',
      'x-api-key': TOKEN,
      'anthropic-version': '2023-06-01',
    },
    payloadAnthropic,
    'ANTHROPIC_COMPAT',
  );
})();
