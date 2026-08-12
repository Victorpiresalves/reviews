// Converte o HTML que o `auto-map-semantic` devolve (marcado com `_element_id="KEY"`) para o
// formato que o `generate-pressell` exige: o texto de cada elemento marcado vira `{{KEY}}`.
//
// ⚠️ ESSA CONVERSÃO É NORMALMENTE DO FRONT. O `auto-map-semantic` só CLASSIFICA — devolve
// `mapping` + `updatedHtml` com o atributo. Quem troca o texto por `{{KEY}}` é o
// `HtmlTemplateUploader`. Chamando a edge direto, a etapa fica faltando, e o sintoma é mudo:
// `generate-pressell` conta 0 placeholders, cai no caminho "geração sem template" e salva o HTML
// do CONCORRENTE inteiro, sem IA nenhuma.
//
// ⚠️ A CHAVE TEM QUE SER MAIÚSCULA [A-Z0-9_]. Está no CLAUDE.md: minúsculo vaza CRU para a página.
// Aqui isso é conferido e a chave fora do padrão é recusada em vez de gerar página com "{{cta_1}}"
// impresso na tela.
import fs from 'node:fs';

const j = JSON.parse(fs.readFileSync('.tmp/tokenizado.json', 'utf8'));
let html = j.updatedHtml;
const mapping = j.mapping;

const invalidas = mapping.map((m) => m.key).filter((k) => !/^[A-Z0-9_]+$/.test(k));
if (invalidas.length) { console.error('chaves fora do padrão [A-Z0-9_]:', invalidas.join(', ')); process.exit(1); }

// Troca o conteúdo do elemento que carrega `_element_id="KEY"` por `{{KEY}}`, respeitando
// aninhamento — os marcados são <span>/<h2>/<p> que às vezes embrulham um <a>.
let trocados = 0, naoAchados = [];
for (const { key } of mapping) {
  const marca = `_element_id="${key}"`;
  const i = html.indexOf(marca);
  if (i < 0) { naoAchados.push(key); continue; }
  const abre = html.lastIndexOf('<', i);
  const tag = html.slice(abre + 1, Math.min(html.indexOf(' ', abre), html.indexOf('>', abre)));
  const fimAbertura = html.indexOf('>', i);
  // acha o fechamento equilibrado da MESMA tag
  let d = 1, p = fimAbertura + 1;
  while (d > 0 && p < html.length) {
    const a = html.indexOf(`<${tag}`, p), b = html.indexOf(`</${tag}>`, p);
    if (b < 0) break;
    if (a >= 0 && a < b) { d++; p = a + 1; } else { d--; p = b + 1; }
  }
  const fecha = html.lastIndexOf(`</${tag}>`, p);
  if (fecha <= fimAbertura) { naoAchados.push(key); continue; }
  html = html.slice(0, fimAbertura + 1) + `{{${key}}}` + html.slice(fecha);
  trocados++;
}

const ph = [...new Set([...html.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((m) => m[1]))];
console.log(`elementos no mapping: ${mapping.length} · trocados: ${trocados} · placeholders no HTML: ${ph.length}`);
if (naoAchados.length) console.log(`não localizados (${naoAchados.length}): ${naoAchados.slice(0, 12).join(', ')}`);
console.log('seções:', [...new Set(mapping.map((m) => m.section))].join(', '));

fs.writeFileSync('.tmp/template-tokenizado.html', html);
fs.writeFileSync('.tmp/mapping.json', JSON.stringify(mapping, null, 1));
if (ph.length < 100) { console.error('\nMENOS DE 100 PLACEHOLDERS — a tokenização não pegou o template'); process.exit(1); }
console.log('ok');
