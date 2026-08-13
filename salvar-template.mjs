// Salva o template tokenizado como uma linha NOVA em `elementor_templates`, pronta para o
// `generate-pressell`.
//
// ⚠️ LINHA NOVA, nunca UPDATE na b748e9e4. Aquela é o CLONE CRU do concorrente — é acervo de
// espionagem, e sobrescrevê-la destruiria a única cópia do que o concorrente publica.
//
// ⚠️ O LINK DO CONCORRENTE É LIMPO AQUI, NA BASE, não na página gerada. Se ele ficar no template,
// TODA página futura nasce com o hoplink de ClickBank de outro afiliado — e da última vez ele
// sobreviveu em 13 lugares porque a limpeza estava do lado errado do processo.
//
// ⚠️ O CSS ENTRA EMBUTIDO no <head>. O `generate-pressell` lê só `template_data.html` e o
// `deploy-pressell` publica só `generated_pressells.content`: CSS em campo separado não chega à
// página, e o sintoma é uma página sem estilo nenhum no ar.
import fs from 'node:fs';

const REF = 'tmfeelnwpbawkfobbhoh';
const CHECKOUT = 'https://cc.linfaflow.com/dtcnew/checkout.php?hid=b2lkPW9mZl8wMDQyMzQ2JmFpZD1hZmZfMjkxNDkxOA%3D%3D&affid=aff_2914918';

let corpo = fs.readFileSync('.tmp/template-tokenizado.html', 'utf8');

// ⚠️ O `auto-map-semantic` devolve o DOCUMENTO INTEIRO, não um fragmento — e embrulhar isso dentro
// do nosso `<!doctype html><html><head>` produz DOIS `</head>` na página. O injetor da Cloudflare
// troca `</head>` GLOBALMENTE, então o bloco de rastreio entra DUAS VEZES. Medido em 13/08: 3,00
// PageViews por sessão na review contra 1,02 no blog — denominador inflado ~3x, justamente no braço
// que seria comparado contra os advertoriais para decidir o que escalar. Foi assim que ela nasceu.
corpo = corpo
  .replace(/<html[^>]*>\s*<head>\s*<\/head>\s*<body[^>]*>/i, '')
  .replace(/<\/body>\s*<\/html>\s*$/i, '');

// ⚠️ O widget "Amazon-style Reviews" SAI do template, e é o único bloco que sai. Ele tem 14
// placeholders — REVIEWER_NAME_1/2, REVIEW_DATE_1/2, VERIFIED_LABEL_1/2, REVIEW_BODY_1/2 — mais
// duas estrelas SVG "1 out of 5 stars". Não existe texto que se possa gerar ali que não seja um
// comprador inventado: 16 CFR Part 465 (vigente 21/10/2024) trata review de quem não existe como
// ato enganoso, com multa civil POR OCORRÊNCIA, e o rótulo "Verified" é a agravante. Deixá-lo no
// TEMPLATE seria pior que na página: toda review futura nasceria com ele.
{
  const i = corpo.indexOf('Amazon-style Reviews');
  if (i > 0) {
    const ini = corpo.lastIndexOf('<div class="elementor-element', i);
    let d = 0, p = ini, fim = -1;
    while (p < corpo.length) {
      const a = corpo.indexOf('<div', p), b = corpo.indexOf('</div>', p);
      if (b < 0) break;
      if (a >= 0 && a < b) { d++; p = a + 4; } else { d--; p = b + 6; if (d === 0) { fim = p; break; } }
    }
    if (fim > ini) { corpo = corpo.slice(0, ini) + corpo.slice(fim); console.log('widget de review fabricada removido'); }
  }
}
const mapping = JSON.parse(fs.readFileSync('.tmp/mapping.json', 'utf8'));
const css = fs.readFileSync('.tmp/audizen.css', 'utf8')
  .replace(/\/\*[^*]*advicehealthreview[^*]*\*\//g, '');

// Todo link vira o nosso checkout, carimbado com o subid — é ele que leva o visitor_id ao postback
// do H&W. Sem o carimbo a venda volta sem casar a sessão e a conversão nunca chega ao Google Ads.
corpo = corpo
  .replace(/href="[^"]*"/g, `href="${CHECKOUT}"`)
  .replace(/<a (?!data-pdc-aff-param)/g, '<a data-pdc-aff-param="subid" ');

// ⚠️ O nome do concorrente também mora em ATRIBUTO, não só em texto e link: `alt` e `title` da foto
// do rótulo deles e um `aria-label` no acordeão de FAQ. Nenhum aparece na tela — e é justamente por
// isso que passariam. Leitor de tela e busca por imagem leem os três.
corpo = corpo.replace(/(alt|title|aria-label)="[^"]*"/gi, (m, attr) =>
  /audizen|nervefreedom|clickbank|advicehealthreview/i.test(m) ? `${attr}=""` : m);

// ⚠️ As 13 imagens são o PRODUTO DELES (o alt confessa: "Audizen_USA Exclusive Keto Drops Blend").
// Trocadas pelas da LinfaFlow, que já vivem no repo. Imagem de outro produto numa review é a
// contradição que o leitor vê antes de ler qualquer palavra.
const IMGS = fs.readdirSync('linfaflow-review/assets').filter((f) => /\.webp$/i.test(f)).sort();
let k = 0;
corpo = corpo.replace(/src="https:\/\/tmfeelnwpbawkfobbhoh\.supabase\.co\/storage[^"]*"/g,
  () => `src="./assets/${IMGS[k++ % IMGS.length]}"`)
  .replace(/srcset="[^"]*"/g, '');
console.log(`imagens trocadas: ${k} (por ${IMGS.length} da LinfaFlow)`);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{{PAGE_TITLE}}</title>
<meta name="description" content="{{META_DESCRIPTION}}">
<meta name="robots" content="noindex">
<style>${css}</style>
</head>
<body>
${corpo}
</body>
</html>`;

const RESTOS = ['audizen', 'getaudizen', 'clickbank', 'advicehealthreview', 'nervefreedom'];
const sujo = RESTOS.filter((r) => html.toLowerCase().includes(r));
if (sujo.length) { console.error('artefato do concorrente no template:', sujo.join(', ')); process.exit(1); }

const ph = [...new Set([...html.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((m) => m[1]))];
console.log(`template: ${Math.round(Buffer.byteLength(html) / 1024)} KB · ${ph.length} placeholders · limpo`);

const linha = {
  name: '[Review] Molde Audizen tokenizado — nutra US',
  description: 'Molde de review de marca clonado de concorrente com 286 dias ativo (Audizen/Nervefreedom), '
    + 'tokenizado com 170 placeholders e limpo de todo artefato do dono anterior. 10 seções numeradas, '
    + 'cada uma respondendo uma busca de marca.',
  category: 'review',
  template_type: 'review',
  product_type: 'nutra',
  is_custom: true,
  is_public: false,
  has_tracking_placeholders: true,
  competitor_name: 'New Era Negócios Digitais LTDA',
  competitor_days_active: 286,
  elements_count: ph.length,
  template_data: { html, semantic_mapping: mapping, origem_template_id: 'b748e9e4-df90-4255-9cc1-67373152a4e2' },
};

const keys = await (await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
  headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}` } })).json();
const s = keys.find((k) => k.name === 'service_role').api_key;
const r = await fetch(`https://${REF}.supabase.co/rest/v1/elementor_templates`, {
  method: 'POST',
  headers: { apikey: s, Authorization: `Bearer ${s}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify(linha),
});
const j = await r.json();
if (!r.ok) { console.error('falhou:', JSON.stringify(j).slice(0, 500)); process.exit(1); }
console.log('template salvo:', j[0].id);
fs.writeFileSync('.tmp/template-id.txt', j[0].id);
