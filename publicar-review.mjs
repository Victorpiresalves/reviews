// Publica a review gerada em `reviewnaturals.com/linfaflow-review/`, injetando o kit de
// conformidade que o template do concorrente não tem.
//
// ⚠️ O TEMPLATE TRAZ OS DISCLAIMERS DELES, NÃO OS NOSSOS. A auditoria da página gerada mostrou
// rótulo de anúncio, divulgação de comissão e DSHEA presentes (o modelo escreveu), mas faltando
// a declaração de NÃO-INDEPENDÊNCIA e os blocos `pdc-*` que o Google já revisou nas 15 páginas.
// Escrever de novo à mão criaria divergência justamente no texto que existe para ser idêntico —
// então eles são copiados de `hw-affiliate/linfaflow/index.html`, que está versionado.
import fs from 'node:fs';
import path from 'node:path';

const DESTINO = 'linfaflow-review';
const KIT = fs.readFileSync('C:/Sistemas/hw-affiliate/linfaflow/index.html', 'utf8');
let html = fs.readFileSync('.tmp/gerado.html', 'utf8');

function blocoPorId(src, id) {
  const i = src.indexOf(`id="${id}"`);
  if (i < 0) throw new Error(`bloco ${id} sumiu do kit`);
  const ini = src.lastIndexOf('<', i);
  const tag = src.slice(ini + 1, src.indexOf(' ', ini));
  let d = 0, j = ini;
  for (;;) {
    const a = src.indexOf(`<${tag}`, j), b = src.indexOf(`</${tag}>`, j);
    if (b < 0) throw new Error(`bloco ${id} não fecha`);
    if (a >= 0 && a < b) { d++; j = a + 1; } else { d--; j = b + 1; if (d === 0) return src.slice(ini, b + tag.length + 3); }
  }
}
const A = blocoPorId(KIT, 'pdc-ad-label').replace(
  'or an independent product review.',
  'or an <em>independent</em> product review. It is a sponsored review written by an affiliate that is paid a commission on sales.');
const B1 = blocoPorId(KIT, 'pdc-affiliate-disclosure');
const SAUDE = blocoPorId(KIT, 'pdc-health-notice');
const DSHEA = blocoPorId(KIT, 'pdc-dshea');
const PUB = blocoPorId(KIT, 'pdc-publisher');

// ⚠️ Declaração de não-independência + não-uso, ACIMA DA DOBRA. É o que separa esta página de uma
// review falsa, e é a única coisa que o modelo não escreveu sozinho.
const METODO = `
<div id="pdc-metodo" style="max-width:900px;margin:14px auto;padding:12px 16px;border:1px solid #b9c6d0;background:#f4f8fb;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
  <strong>How this review was done, and what it is not.</strong><br>
  <strong>We have not used this product, and nobody on this page claims to have used it.</strong> There is
  no tester and no personal experience here. What we did was read what the seller publishes &mdash; the
  product page, the checkout, the ingredient panels, the prices, the billing terms and the refund policy
  &mdash; on 12 August 2026, and quote it. Where the seller&rsquo;s own pages disagree with each other,
  we show both.<br><br>
  <strong>This is not an independent review site.</strong> It is advertising published by an affiliate
  that is paid a commission when a reader buys through a link here. We cannot verify the seller&rsquo;s
  claims about what the product does, and we do not repeat them as facts.
</div>`;

html = html.replace('<body>', `<body>\n${A}`);
// Depois da 1ª seção do template (a barra de CTA do topo), antes de tudo que vende.
const p = html.indexOf('</section>');
html = html.slice(0, p + 10) + METODO + B1 + SAUDE + html.slice(p + 10);
html = html.replace('</body>', `${DSHEA}${PUB}\n</body>`);

// ⚠️ O arroba tem que sair como entidade: o Scrape Shield da Cloudflare reescreve "@" literal para
// "[email protected]" e o token gravado não tem Zone Settings:Edit para desligá-lo.
html = html.replace(/support@linfaflow\.com/g, 'support&#64;linfaflow.com')
           .replace(/contact@nationalhealthnews\.blog/g, 'contact&#64;nationalhealthnews.blog');

fs.writeFileSync(path.join(DESTINO, 'index.html'), html);

// ── guarda ────────────────────────────────────────────────────────────────────────────────
const corrido = html.replace(/\s+/g, ' ');
const texto = corrido.replace(/<[^>]*>/g, ' ').toLowerCase();
const CONCORRENTE = ['audizen', 'getaudizen', 'clickbank', 'advicehealthreview', 'nervefreedom', 'tinnitus'];
const OBRIGATORIO = [
  ['não-uso', 'We have not used this product'], ['não-independência', 'not an independent review site'],
  ['rótulo de anúncio', 'pdc-ad-label'], ['disclosure', 'pdc-affiliate-disclosure'],
  ['aviso médico', 'pdc-health-notice'], ['DSHEA', 'pdc-dshea'], ['publisher', 'pdc-publisher'],
];
const restou = CONCORRENTE.filter((c) => texto.includes(c));
const faltou = OBRIGATORIO.filter(([, m]) => !corrido.includes(m)).map(([n]) => n);
const ctas = (html.match(/data-pdc-aff-param/g) || []).length;
const fora = [...new Set([...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1]))]
  .filter((u) => !u.startsWith('https://cc.linfaflow.com'));
const arroba = /[^&#][a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(html.replace(/&#64;/g, ''));
const sobrou = (html.match(/\{\{[A-Z0-9_]+\}\}/g) || []).length;

console.log(`${DESTINO}/index.html · ${Math.round(Buffer.byteLength(html) / 1024)} KB · CTAs ${ctas}`);
console.log(`  concorrente: ${restou.join(', ') || 'nenhum'} · faltando: ${faltou.join(', ') || 'nada'}`);
console.log(`  links fora: ${fora.join(', ') || 'nenhum'} · placeholder solto: ${sobrou} · @ cru: ${arroba ? 'SIM' : 'não'}`);
if (restou.length || faltou.length || fora.length || arroba || sobrou || ctas === 0) {
  console.error('\nBUILD REPROVADA'); process.exit(1);
}
console.log('  build aprovada');
