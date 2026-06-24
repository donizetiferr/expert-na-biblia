// debug — ver raw response para entender formato
const fs = require('fs');
const path = require('path');

function loadToken() {
  const envPath = path.join(
    process.env.USERPROFILE || 'C:\\Users\\Donizeti',
    'Downloads',
    'Projetos_VSCode',
    'Tokens API e acessos',
    'minimax',
    'credentials.env',
  );
  const txt = fs.readFileSync(envPath, 'utf8');
  const m = txt.match(/MINIMAX_AUTH_TOKEN="([^"]+)"/);
  if (!m) throw new Error('token fail');
  return m[1];
}

const SYSTEM_PROMPT = `Voce gera a resposta canonica e 3 distrators para perguntas biblicas em portugues brasileiro.
REGRAS:
1. resposta canonica: ate 80 caracteres, terminologia biblica padrao (Almeida Revista e Corrigida), sem markdown.
2. 3 distrators: plausiveis e relacionados ao tema, mas CLARAMENTE incorretos. Mesmo tamanho da resposta canonica.
3. Se nao souber a resposta, responda {"r": "NAO SEI", "d1": "...", "d2": "...", "d3": "..."}.
4. Responda APENAS JSON estrito: {"r":"...","d1":"...","d2":"...","d3":"..."}. Sem texto antes/depois.`;

async function main() {
  const token = loadToken();

  // 3 chamadas para ver padrao
  const perguntas = [
    'O que significa a palavra "Bíblia"?',
    'Quem foi o primeiro homem criado por Deus?',
    'Quantos livros tem o Antigo Testamento?',
  ];

  for (const pergunta of perguntas) {
    console.log('\n========================================');
    console.log('PERGUNTA:', pergunta);
    const body = {
      model: 'MiniMax-M2.7',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Pergunta: ${pergunta}` },
      ],
      temperature: 0.2,
      max_tokens: 300,
    };
    const res = await fetch('https://api.minimax.io/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    const raw = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    console.log('--- RAW (first 800 chars) ---');
    console.log(raw.slice(0, 800));
    console.log('--- LENGTH ---', raw.length);
    console.log('--- USAGE ---', JSON.stringify(data.usage));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
