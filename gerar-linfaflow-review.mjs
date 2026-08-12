// Review da LinfaFlow em reviewnaturals.com, construída SOBRE o template "Audizen Review".
//
// ⚠️ POR QUE ESTE TEMPLATE. `elementor_templates` b748e9e4 — clone de um concorrente com
// `competitor_days_active=286`, e o gêmeo "Nervefreedom Review" prova que o molde já foi
// parametrizado para um 2º nicho. É o único molde de review de MARCA do acervo com prova de
// sobrevivência à política, e o eixo dele casa com as buscas do ad group de marca: a seção 1
// responde "linfaflow scam", a 2-3 respondem "does linfaflow work", a 4 responde "linfaflow
// ingredients", a 10 responde o resto.
//
// ⚠️ POR QUE ESTE DOMÍNIO. `reviewnaturals.com` já é uma review-farm nossa (memopezil, brain) —
// que é exatamente o padrão medido no concorrente: UM domínio de review, uma URL por marca. E o
// worker de rastreio JÁ injeta nessa zona (conferido no /memopezil/ antes de escrever isto), então
// a página nasce medindo. Sem essa conferência, o modo de falha é "página no ar medindo zero".
//
// ⚠️ O QUE FOI HERDADO E O QUE NÃO FOI. Herdado: o CSS inteiro, a barra de CTA do topo, o bloco de
// título, o molde de cabeçalho numerado, o botão, o selo de garantia, o acordeão de FAQ e o rodapé
// de disclaimers — ou seja, o VISUAL e a ARQUITETURA. Não herdado: as reviews de 1 estrela
// assinadas ("Emily S. · Verified Purchase"), as ⭐⭐⭐⭐⭐ e a seção "Real Person Review". Ninguém
// aqui usou o produto: 16 CFR Part 465 (vigente 21/10/2024) trata review de quem não usou como ato
// enganoso com multa POR OCORRÊNCIA, e essas seções foram substituídas por conteúdo verificável —
// o que eu de fato conferi nas páginas do vendedor. A estrutura numerada permanece intacta.
//
// ⚠️ NENHUM ARTEFATO DO CONCORRENTE PODE SOBRAR. O template traz 33 links para o hoplink de
// ClickBank deles, 2 para advicehealthreview.shop e 13 imagens de um suplemento de zumbido. A
// guarda de build no fim REPROVA (exit 1) se qualquer um sobreviver — transformação de template
// clonado falha em silêncio quando alguém confia na leitura.
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('.');
const T = fs.readFileSync('.tmp/audizen.html', 'utf8');
// ⚠️ O CSS clonado carrega comentários de source map com o domínio do concorrente
// (`/* https://advicehealthreview.shop/wp-content/... */`, 8 ocorrências). Não quebra nada, mas é o
// endereço de outra pessoa publicado na nossa página — sai junto.
const CSS = fs.readFileSync('.tmp/audizen.css', 'utf8').replace(/\/\*[^*]*advicehealthreview[^*]*\*\//g, '');
const DESTINO = 'linfaflow-review';
const IMGS_ORIGEM = 'C:/Sistemas/hw-affiliate/ankle-swelling/assets';

const CHECKOUT = 'https://cc.linfaflow.com/dtcnew/checkout.php?hid=b2lkPW9mZl8wMDQyMzQ2JmFpZD1hZmZfMjkxNDkxOA%3D%3D&affid=aff_2914918';
const CONFERIDO = '12 August 2026';

// ── peças do template, na marcação original ──────────────────────────────────────────────
const idx = [...T.matchAll(/<section[^>]*elementor-top-section[^>]*>/g)].map((m) => m.index);
idx.push(T.length);
// ⚠️ Corta no ÚLTIMO `</section>` do trecho. Fatiar por índice de início leva junto o que vier
// depois da última seção — no rodapé isso era um `</div>` do wrapper de página do WordPress, e a
// contagem fechava 160 abertas contra 161 fechadas. Navegador engole; layout quebra sem erro.
const sec = (i) => {
  const bruto = T.slice(idx[i], idx[i + 1]);
  const fim = bruto.lastIndexOf('</section>');
  return fim < 0 ? bruto : bruto.slice(0, fim + 10);
};

// Troca os nós de texto visíveis de um trecho, na ordem. Preserva 100% da marcação — é isso que
// mantém o visual idêntico ao molde de 286 dias.
function trocarTextos(html, novos) {
  let k = 0;
  return html.replace(/>([^<>]+)</g, (m, t) => {
    if (t.trim().length <= 1) return m;
    const novo = k < novos.length ? novos[k] : '';
    k++;
    return '>' + novo + '<';
  });
}
// Todo link do template vira o NOSSO checkout, carimbado. Sem o data-pdc-aff-param o visitor_id
// não chega ao postback do H&W e a venda nunca vira conversão no Google Ads.
const nossoLink = (html) => html
  .replace(/href="[^"]*"/g, `href="${CHECKOUT}"`)
  .replace(/<a /g, '<a data-pdc-aff-param="subid" ');

// ⚠️ TODA peça passa por `nossoLink`, sem exceção. A 1ª versão deixou o título e os cabeçalhos
// numerados de fora — e eles são `<h2><a href="...">`, ou seja o hoplink de ClickBank do
// concorrente sobreviveu em 13 lugares. Um só que escapasse mandaria a venda para outro afiliado.
const TOPO     = nossoLink(trocarTextos(sec(0), ['VISIT THE OFFICIAL LINFAFLOW WEBSITE', '&gt;&gt;linfaflow.com&lt;&lt;']));
const TITULO   = nossoLink(trocarTextos(sec(1), ['The Truth About LinfaFlow', '- Reviews 2026 -']));
const CTA_BTN  = (rot) => nossoLink(trocarTextos(sec(21), [rot]));
const numerada = (t) => nossoLink(trocarTextos(sec(4), [t]));
// ⚠️ O rodapé do template carrega os disclaimers DELES, com o nome do concorrente enterrado no
// texto e um hoplink de ClickBank. A guarda de build reprovou a 1ª versão exatamente por isso —
// que é o modo de falha de todo template clonado: sobra artefato do dono anterior e a página sobe
// respondendo 200. Aqui os 5 nós são reescritos e o link é o nosso.
const RODAPE = nossoLink(trocarTextos(sec(29), [
  'Disclaimer: The statements made regarding this product have not been evaluated by the Food and Drug '
  + 'Administration. This product is not intended to diagnose, treat, cure or prevent any disease. The '
  + 'information on this page is not medical advice and is not a substitute for treatment. Talk to your '
  + 'doctor or pharmacist before starting any supplement, particularly alongside prescription medication, '
  + 'and keep using anything your clinician has already advised.',
  'Marketing Disclosure: this website is an advertising publisher. The owner of this website has a '
  + 'financial relationship with the product advertised here and is paid a commission when a reader buys '
  + 'through a link on this page. That commission does not change the price you pay.',
  'Advertising Disclosure: this page is an advertisement, not a news article and not an independent '
  + 'product review. We are not the manufacturer and not the seller. The product is sold by the merchant '
  + 'that operates the checkout page our buttons link to, and that merchant alone is responsible for the '
  + 'product, the order, payment, shipping, returns and refunds. Any images of people on this page are '
  + 'illustrative and are not customers.',
  'Privacy | Terms | Contact',
  '&copy; 2026 National Health News. All rights reserved.',
]));

// O bloco de conteúdo do template, com a tipografia dele, recebendo o nosso HTML.
const bloco = (interno) => `
<section class="elementor-section elementor-top-section elementor-element elementor-section-boxed elementor-section-height-default">
  <div class="elementor-container elementor-column-gap-default">
    <div class="elementor-column elementor-col-100 elementor-top-column elementor-element">
      <div class="elementor-widget-wrap elementor-element-populated">
        <div class="elementor-element elementor-widget elementor-widget-text-editor">
          <div class="elementor-widget-container"><div class="pdc-prosa">${interno}</div></div>
        </div>
      </div>
    </div>
  </div>
</section>`;

// ── blocos de conformidade, copiados da página que o Google já revisou ────────────────────
// ⚠️ Fonte: hw-affiliate/linfaflow/index.html, que ESTÁ versionado. O v2_kit-conformidade.json
// não está, e reescrever o kit à mão introduziria divergência entre as páginas justamente no
// texto que existe para ser idêntico.
const KIT = fs.readFileSync('C:/Sistemas/hw-affiliate/linfaflow/index.html', 'utf8');
function blocoPorId(html, id) {
  const i = html.indexOf(`id="${id}"`);
  if (i < 0) throw new Error(`bloco ${id} sumiu do kit`);
  const ini = html.lastIndexOf('<', i);
  const tag = html.slice(ini + 1, html.indexOf(' ', ini));
  let d = 0, j = ini;
  for (;;) {
    const a = html.indexOf(`<${tag}`, j), b = html.indexOf(`</${tag}>`, j);
    if (b < 0) throw new Error(`bloco ${id} não fecha`);
    if (a >= 0 && a < b) { d++; j = a + 1; } else { d--; j = b + 1; if (d === 0) return html.slice(ini, b + tag.length + 3); }
  }
}
const A_LABEL = blocoPorId(KIT, 'pdc-ad-label').replace(
  'or an independent product review.',
  'or an <em>independent</em> product review. It is a sponsored review written by an affiliate that is paid a commission on sales.');
const B1      = blocoPorId(KIT, 'pdc-affiliate-disclosure');
const D_SAUDE = blocoPorId(KIT, 'pdc-health-notice');
const D_NSUB  = blocoPorId(KIT, 'pdc-nao-substitui');
const DSHEA   = blocoPorId(KIT, 'pdc-dshea');
const PUB     = blocoPorId(KIT, 'pdc-publisher');

const METODO = `
<div id="pdc-metodo" style="margin:14px auto;padding:12px 14px;border:1px solid #b9c6d0;background:#f4f8fb;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">
  <strong>How this review was done, and what it is not.</strong><br>
  <strong>We have not used this product, and nobody on this page claims to have used it.</strong>
  There is no tester, no trial and no personal experience here. What we did instead was read what the
  seller publishes &mdash; the product page, the checkout, the ingredient panels, the prices, the
  billing terms and the refund policy &mdash; on ${CONFERIDO}, and quote it below. Where the
  seller&rsquo;s own pages disagree with each other, we say so and show you both.<br><br>
  <strong>This is not an independent review site.</strong> It is advertising published by an
  affiliate that is paid a commission when a reader buys through a link here. We cannot verify the
  seller&rsquo;s claims about what the product does, and we do not repeat them as facts.
</div>`;

// ── imagens: as do template são de outro produto (zumbido) e saem ─────────────────────────
fs.mkdirSync(path.join(DESTINO, 'assets'), { recursive: true });
const imgs = fs.readdirSync(IMGS_ORIGEM).filter((f) => /\.webp$/i.test(f)).sort();
for (const f of imgs) fs.copyFileSync(path.join(IMGS_ORIGEM, f), path.join(DESTINO, 'assets', f));
const figura = (i, alt) => `<figure style="margin:18px 0"><img src="./assets/${imgs[i % imgs.length]}" alt="${alt}" style="max-width:100%;height:auto;border-radius:6px;display:block;margin:0 auto"></figure>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LinfaFlow Reviews 2026 | Ingredients, Price, Billing and Refund Terms</title>
<meta name="description" content="LinfaFlow reviewed against what the seller publishes: two ingredient panels, two price ladders, a membership added at checkout and three refund windows. Advertisement.">
<meta name="robots" content="noindex">
<style>${CSS}</style>
<style>
.pdc-prosa{font-size:17px;line-height:1.75}
.pdc-prosa h3{font-size:21px;margin:26px 0 8px}
.pdc-prosa ul{padding-left:22px}.pdc-prosa li{margin:8px 0}
.pdc-tab{width:100%;border-collapse:collapse;font-size:15px;margin:14px 0;display:block;overflow-x:auto}
.pdc-tab th,.pdc-tab td{border:1px solid #ddd;padding:9px 10px;text-align:left;vertical-align:top}
.pdc-tab th{background:#f0f4f7}
.pdc-caixa{margin:18px 0;padding:14px 16px;background:#f7f7f7;border-left:4px solid #12354d}
.pdc-alerta{border-left-color:#b03a2e}
.pdc-avisocta{max-width:680px;margin:0 auto 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:#333;text-align:center}
</style>
</head>
<body>
${A_LABEL}
${TOPO}
${TITULO}

${bloco(`
<h3 style="font-size:26px;margin:0 0 10px">LINFAFLOW &mdash; SCAM OR LEGIT? Does LinfaFlow really work?</h3>
<p>Here we go through what is actually in LinfaFlow, what it costs, what else goes into your cart, and
what the seller promises about refunds. Read to the end and draw your own conclusions.</p>
${METODO}
${B1}
`)}

${D_SAUDE}

${bloco(`
<p>Rather than tell you how the product made us feel, we did the one thing a reader cannot easily do
in a hurry: we opened every page the seller publishes and compared them against each other. That is
where this review comes from, and it is all quoted below.</p>
<p><strong>What we checked on ${CONFERIDO}:</strong></p>
<ul>
  <li>The ingredient information the seller publishes &mdash; and we found <strong>two different panels</strong> on the same site.</li>
  <li>Every price on the product page and on the checkout &mdash; <strong>two different ladders</strong>.</li>
  <li>The full order text, including <strong>what is added to the cart besides the bottles</strong>.</li>
  <li>The refund policy, in every place it appears &mdash; <strong>three different windows</strong>.</li>
</ul>
<p><strong>Our verdict?</strong> LinfaFlow is a real product from a real seller, sold direct-to-consumer,
with a published refund policy and a support line printed on the seller&rsquo;s own pages. We found
nothing suggesting a scam. What we could not verify is what it does &mdash; nobody here has taken it,
and the only evidence the seller cites is given without a reference. What we <em>could</em> verify are
the terms, and several of them are worth thirty seconds before you enter a card.</p>
${figura(0, 'Legs and feet at the end of the day')}
<p>In this review you will get the unfiltered version of:</p>
<ol>
  <li>LinfaFlow scam alert &mdash; how to avoid the counterfeit</li>
  <li>What is LinfaFlow?</li>
  <li>How is it supposed to work?</li>
  <li>Ingredients: the two panels the seller publishes</li>
  <li>Pros and cons</li>
  <li>What we could and could not verify about buyers</li>
  <li>Shipping, billing and the money-back guarantee</li>
  <li>A look at the formulation</li>
  <li>Conclusion</li>
  <li>Frequently asked questions</li>
</ol>
`)}

${numerada('1 - LinfaFlow Scam Alert (How To Avoid The Counterfeit)')}
${bloco(`
<p><strong>Warning:</strong> LinfaFlow is sold direct-to-consumer on the seller&rsquo;s own site. A
listing anywhere else is not the seller &mdash; which means the seller&rsquo;s refund policy and
support are not yours to use, and there is no way to know what is in the bottle.</p>
<p>The more likely way to lose money here is not a counterfeit, though. It is what goes into the cart
alongside the bottles, and it is written in the seller&rsquo;s own order text.</p>
<div class="pdc-caixa pdc-alerta">
  <strong>The charge that is not the bottles.</strong><br>
  On the store, the order text reads: &ldquo;By placing the order, I understand and agree that my cart
  includes a digital &lsquo;Linfaflow Wellness Club&rsquo; membership with a 14-day free trial. Unless
  canceled before the trial ends, I agree and authorise Linfaflow to automatically charge my credit
  card $77 per month for a total of 6 consecutive monthly payments.&rdquo;<br><br>
  That is <strong>$462</strong>, separate from the supplement, and it starts by itself if the trial is
  not cancelled &mdash; more than five times the largest bottle package on the same page.
</div>
<div class="pdc-caixa pdc-alerta">
  <strong>And a $9.95 upgrade that is ticked for you.</strong><br>
  Shipping on the checkout is free. Below the pay button there is an expedited shipping upgrade of
  $9.95 which arrives <strong>already ticked</strong>. Untick it if you do not want it.
</div>
<p><strong>Before you pay, check three things:</strong> what is in the cart besides the bottles,
whether you selected a one-time purchase or a subscription, and what refund window that page states.</p>
`)}

${numerada('What buyers should check before paying')}
${bloco(`
<p>We are not going to show you customer reviews, because we have no way to verify a single one. What
we can show you is what the seller states, which is checkable by anyone in a minute.</p>
<div class="pdc-caixa">
  <strong>The subscription, which is a separate thing from the membership above.</strong><br>
  The drops can be bought once or on a subscription, and the seller is explicit that it is your choice:
  &ldquo;If you select a subscription&hellip; you will be charged the price shown above (e.g. $29.99)
  now and every 30 days thereafter until you cancel.&rdquo; The part worth knowing is what comes next:
  &ldquo;The package name (e.g. &lsquo;Buy one&rsquo;, &lsquo;Buy 2 Get 1 FREE&rsquo;) will appear on
  your statement&rdquo; &mdash; not the word subscription, which is what makes a recurring charge easy
  to miss for several months.<br><br>
  The checkout page is less consistent with itself: it carries &ldquo;Refills Ship Every 30 Days |
  Stop or Cancel Anytime&rdquo; and, further down the <em>same</em> page, &ldquo;Your order is a
  one-time purchase &mdash; no subscription, no recurring charge.&rdquo; Read the option you tick
  rather than the reassurance underneath it.
</div>
`)}

${numerada('2 - What is LinfaFlow?')}
${bloco(`
<p>LinfaFlow is a herbal liquid supplement taken by mouth, sold in the United States by its maker on
its own website. It is marketed for people who feel puffy or heavy in the legs, ankles, hands and
face &mdash; sock marks that are still there at lunchtime, rings that will not go on, shoes that stop
fitting by five in the afternoon.</p>
<p>The seller states it is formulated and bottled in the United States in GMP-certified facilities,
that each batch is third-party tested for purity and potency, and that the formula is free from
alcohol, sugar and gluten. Those are the seller&rsquo;s statements; we have no way to audit them.</p>
${figura(1, 'LinfaFlow drops')}
<p><strong>How the seller says it is taken:</strong> one to two droppers (1&ndash;2 mL), once or twice
daily, under the tongue or stirred into water, tea or juice.</p>
<p>If you have seen it described anywhere as &ldquo;two drops under the tongue&rdquo;, that is not what
the seller&rsquo;s directions say. A dropper holds about a millilitre &mdash; roughly twenty drops
&mdash; so the published instruction is a far larger dose than that phrase suggests. The bottle you
receive is the version that counts.</p>
<p>The label lists a serving as 1 mL and 59 servings per container. That puts a bottle at close to two
months on the smallest dose the label allows, and about two weeks on the largest &mdash; a four-fold
difference in cost per month, decided by an instruction that gives a range rather than a dose.</p>
`)}

${numerada('3 - How Is LinfaFlow Supposed To Work?')}
${bloco(`
<p>Unlike blood, which the heart pushes, lymph has no central pump. It is moved by muscle contraction,
by breathing and by pressure from outside &mdash; which is why walking and a compression garment do
something, and why products of this kind are sold as a daily routine rather than a one-off. That much
is anatomy, and it is the part of the seller&rsquo;s framing that is not in dispute.</p>
<p>What it does not tell you is how much of anything is in a dose, or whether a botanical taken by
mouth changes any of it. The seller cites &ldquo;a 12-week observational study on 200 adults (ages
35&ndash;68)&rdquo; and publishes no reference, link or source for it, so there is no way to see what
was measured or by whom. We cannot close that gap and neither can this page.</p>
`)}

${numerada('4 - LinfaFlow Ingredients: The Two Panels The Seller Publishes')}
${bloco(`
<p>This is the part the seller publishes twice, in two versions that do not describe the same product.
Both are reproduced below exactly as published on ${CONFERIDO}.</p>

<h3>Panel one &mdash; the ingredient popup on the product page</h3>
<p>This one matches the four botanicals the product description names. Each description is the
seller&rsquo;s own wording, not ours:</p>
<table class="pdc-tab">
  <tr><th style="width:36%">Proprietary Blend, 300&nbsp;mg</th><th>How the seller describes it</th></tr>
  <tr><td>Cleavers aerial parts <em>(Galium aparine)</em></td><td>&ldquo;Encourages lymph flow and gentle cleansing&rdquo;</td></tr>
  <tr><td>Red clover flower <em>(Trifolium pratense)</em></td><td>&ldquo;Promotes healthy circulation and clear skin&rdquo;</td></tr>
  <tr><td>Prickly ash bark</td><td>&ldquo;Boosts energy and supports microcirculation&rdquo;</td></tr>
  <tr><td>Stillingia root</td><td>&ldquo;Aids gentle detox and natural drainage&rdquo;</td></tr>
  <tr><td>Other ingredients</td><td>Vegetable glycerin, water</td></tr>
</table>

<h3>Panel two &mdash; the block headed &ldquo;Full Supplement Facts&rdquo; on the same site</h3>
<p>This one lists a different formula, and <strong>not one of the four botanicals above appears in
it</strong>:</p>
<table class="pdc-tab">
  <tr><th style="width:36%">Proprietary Herbal Blend, 200&nbsp;mg</th><td>Maca root extract, African
      mango seed extract, grape seed extract, guarana seed extract, eleutherococcus senticosus,
      astragalus, green tea leaf, gymnema sylvestre, coleus forskohlii, cayenne pepper, grapefruit
      seed, ginseng, raspberry ketones, L-glutamine, L-tyrosine, L-arginine, beta alanine,
      monoammonium glycyrrhizinate, GABA, L-tryptophan, L-carnitine HCl</td></tr>
  <tr><th>Other ingredients</th><td>Water, citric acid</td></tr>
  <tr><th>Serving size</th><td>1/4 teaspoon (1&nbsp;mL) &middot; 59 servings per container</td></tr>
</table>
<p>So the seller publishes two ingredient lists and two blend weights for one product, and neither
gives the amount of any single ingredient. We do not know which is current, and we are not going to
guess: a formula is not something to infer from marketing copy.</p>

<div class="pdc-caixa">
  <strong>Why this one is worth acting on.</strong><br>
  The second panel contains <strong>guarana, green tea and ginseng</strong> &mdash; caffeine and
  stimulants &mdash; plus gymnema, associated with blood sugar, and monoammonium glycyrrhizinate, a
  liquorice derivative associated with blood pressure and potassium. The first panel contains none of
  those. The two versions are not interchangeable for anyone with a reason to care what they
  swallow.<br><br>
  <strong>The only version that counts is the label on the bottle you receive.</strong> If you take
  prescription medication &mdash; particularly a diuretic, a blood thinner, or medication for blood
  pressure, blood sugar or the thyroid &mdash; or if you avoid caffeine, read that label before the
  first dose and show it to your pharmacist.
</div>
`)}

<p class="pdc-avisocta">Paid link &mdash; we earn a commission if you buy through it. It does not change your price.</p>
${CTA_BTN('Check LinfaFlow on the Official Site')}

${numerada('5 - Pros and Cons')}
${bloco(`
<h3>Pros</h3>
<ul>
  <li>Sold direct-to-consumer, so the same party takes the order, the shipping and the refund.</li>
  <li>The seller states it is formulated and bottled in the USA in GMP-certified facilities, and that each batch is third-party tested for purity and potency.</li>
  <li>Liquid drops taken at home, with no pill to swallow &mdash; and the directions allow the routine to be as short as once a day, which is the part most supplements fail on.</li>
  <li>The seller states the formula is free from alcohol, sugar and gluten.</li>
  <li>There is a published refund policy, and the seller&rsquo;s pages refer to cancelling at any time.</li>
  <li>Shipping is free on the checkout.</li>
</ul>
<h3>Cons</h3>
<ul>
  <li><strong>Two different ingredient panels</strong> on the seller&rsquo;s own site, with two blend weights and no amount given for any single ingredient.</li>
  <li><strong>A &ldquo;Wellness Club&rdquo; membership added to the cart</strong> with a free trial that bills $77 a month for six months &mdash; $462 &mdash; unless cancelled.</li>
  <li><strong>A $9.95 shipping upgrade ticked by default</strong> at the checkout.</li>
  <li><strong>Three different refund windows</strong>, two of them on the same page.</li>
  <li>Two different price ladders for the same product.</li>
  <li>The only evidence cited is &ldquo;a 12-week observational study on 200 adults&rdquo;, published without a reference we could check.</li>
  <li>Sold direct-to-consumer only, as far as we could see, so there is no way to buy a single bottle in person to try.</li>
</ul>
`)}

${numerada('6 - What We Could And Could Not Verify About Buyers')}
${bloco(`
<p>Pages like this one usually fill this section with customer testimonials. We are not going to,
because we cannot verify a single one &mdash; and a review that invents buyers is not a review.</p>
<p>Here is what we could establish instead, all of it checkable:</p>
<ul>
  <li>The seller publishes a support e-mail and two phone numbers, one of them specifically for refunds and cancellations.</li>
  <li>The seller publishes a cancellation page and states that you can cancel at any time.</li>
  <li>The seller cites a 12-week observational study on 200 adults, without any reference.</li>
  <li>We have not placed an order, so we cannot speak to delivery times, and we would not trust a page that claimed to without buying.</li>
</ul>
<p>If you want the experience of other buyers, the honest place to look is outside any page that earns
a commission on the sale &mdash; including this one.</p>
`)}

${numerada('7 - Price, Shipping and the Money-Back Guarantee')}
${bloco(`
<p>Prices differ depending on which of the seller&rsquo;s pages you land on. Both ladders below are
what each page showed on ${CONFERIDO}. The total on the payment screen is the only number that binds.</p>
<table class="pdc-tab">
  <tr><th style="width:26%">Where</th><th>What it showed</th></tr>
  <tr><td>Official store page</td><td>1 bottle $29.99, 3 bottles $59.99 and 5 bottles $89.99, with
      higher &ldquo;compare at&rdquo; prices shown alongside ($39.99, $119.97 and $199.95).</td></tr>
  <tr><td>Direct checkout<br><span style="font-size:13px;color:#555">(where our links go)</span></td>
      <td>A different ladder, priced per bottle, with shipping free: &ldquo;Buy 1 Get 1 Free&rdquo; at
      $34.75 a bottle ($69.50 total), &ldquo;Buy 2 Get 2 Free&rdquo; at $27.49 a bottle ($109.96) and
      &ldquo;Buy 3 Get 3 Free&rdquo; at $19.99 a bottle ($119.94) &mdash; the last already selected for
      you when the page loads. The same page separately offers a 12-bottle annual supply at $24.75 a
      month, &ldquo;billed yearly &ndash; $297.00&rdquo;, which is a yearly subscription rather than
      one of the three options above.</td></tr>
</table>

<h3>The refund window is published three different ways</h3>
<table class="pdc-tab">
  <tr><th style="width:36%">Where it appears</th><th>What it says</th></tr>
  <tr><td>Official product page</td><td>&ldquo;30-Day Money-Back Guarantee, no questions asked&rdquo;
      in one place, and &ldquo;60-Day Money-Back Guarantee&rdquo; in another &mdash; both on that page</td></tr>
  <tr><td>Checkout, top banner</td><td>&ldquo;60 days money back guarantee&rdquo;</td></tr>
  <tr><td>Checkout, footer</td><td>&ldquo;We allow returns or replacement for any product within 90
      days from the date of purchase&rdquo;</td></tr>
</table>
<p><strong>Treat the shortest one as the safe assumption</strong> and confirm the window in your order
confirmation. If you intend to rely on the refund, do not rely on a figure you read on a page you
cannot produce later.</p>
`)}

${numerada('8 - A Look At The Formulation')}
${bloco(`
${figura(2, 'Botanical ingredients')}
<p>The seller does not publish the amount of any single ingredient in either panel &mdash; only a
blend total, and the two panels give two different totals (300&nbsp;mg and 200&nbsp;mg). That means
there is no way, from the published information alone, to compare a dose here against a dose
anywhere else.</p>
<p>The ingredients are printed on the label of the bottle you receive. That label is the document to
read, and it is the one to take to a pharmacist if you take anything else.</p>
`)}

${numerada('9 - LinfaFlow - CONCLUSION')}
${bloco(`
<p>Everyday puffiness and heaviness &mdash; at the end of a long day, after a flight, after a salty
meal, in hot weather &mdash; is the situation this kind of product is sold for, and it is the
situation most people mean when they go looking for one. Swelling that does not settle, or that comes
with any of the warning signs at the top of this page, is a different matter and belongs with a doctor
rather than with a supplement.</p>
${D_NSUB}
<p>If you decide to try it, the four things worth doing before you pay are the same four we would do:
check what is in the cart besides the bottles, check whether you selected a one-time purchase or a
subscription, check the refund window on the page you are actually on, and read the label when the
bottle arrives. If those answers satisfy you, buy. If they do not, that is a good reason not to
&mdash; and we would rather say so than have you charged for something you did not mean to buy.</p>
<p>It is not for use during pregnancy or breastfeeding, or by anyone under 18.</p>
`)}

<p class="pdc-avisocta">Paid link &mdash; we earn a commission if you buy through it. It does not change your price.</p>
${CTA_BTN('Go to the Official LinfaFlow Site')}

${numerada('10 - LINFAFLOW FAQS')}
${bloco(`
<h3>Is LinfaFlow a scam?</h3>
<p>We found no sign of one. It is a real product from a company that publishes a refund policy, a way
to cancel and a support phone number. We have not placed an order, so we cannot speak to delivery. The
problems we found are about clarity of terms, not about whether the product exists &mdash; and they
are all listed above so you can judge them yourself.</p>

<h3>Does it work?</h3>
<p>We cannot tell you that, and we would be suspicious of a page that did. Nobody here has used it, the
published ingredient information exists in two versions that disagree, and the only evidence the seller
cites is a 12-week observational study on 200 adults given without a reference we could check.</p>

<h3>Is it a subscription?</h3>
<p>It can be, and there are two separate recurring charges to look for. The drops can be bought once or
on a subscription that renews every 30 days until cancelled. Separately, the store&rsquo;s order text
says a &ldquo;Wellness Club&rdquo; membership is included in the cart on a 14-day free trial and then
bills $77 a month for six months. Check both before you confirm.</p>

<h3>How long does a bottle last?</h3>
<p>The seller lists 59 servings of 1&nbsp;mL. At one dropper once a day that is close to two months; at
two droppers twice a day it is about two weeks. The range comes from the seller&rsquo;s own
instruction, which gives a range rather than a dose.</p>

<h3>What does it taste like?</h3>
<p>The seller does not describe the taste, and we have not tasted it. It is a herbal liquid taken under
the tongue or stirred into water, tea or juice &mdash; the seller offers the second option itself,
which is usually how a tincture is taken by people who dislike the first.</p>

<h3>How do I avoid a counterfeit?</h3>
<p>Buy on the seller&rsquo;s own site. A listing anywhere else is not the seller, which means the
refund policy and support are not yours to use.</p>

<h3>Can I take it with my medication?</h3>
<p>Ask your doctor or pharmacist, and take the bottle with you. That is the honest answer and the only
one we will give &mdash; particularly with diuretics, anticoagulants, or medication for blood pressure,
blood sugar or the thyroid. One of the two published panels contains caffeine sources and a liquorice
derivative, which is a further reason to have the actual label in front of you.</p>

<h3>What if I want a refund?</h3>
<p>Contact the seller, not us. We do not sell, ship or process payments and we cannot see your order.
The seller&rsquo;s support is reachable at support&#64;linfaflow.com and on +1 (888) 811-1186, with a
separate refunds line on +1 (800) 390-6035. Confirm your refund window at the time of purchase,
because the seller publishes three different ones.</p>
`)}

${bloco(`${DSHEA}${PUB}
<p style="margin-top:14px;font-family:Arial,Helvetica,sans-serif;font-size:13px">
<a href="https://nationalhealthnews.blog/privacy">Privacy Policy</a> &middot;
<a href="https://nationalhealthnews.blog/terms">Terms of Use</a> &middot;
<a href="https://nationalhealthnews.blog/contact">Contact</a> &middot;
<a href="https://nationalhealthnews.blog/affiliate-disclosure">Advertising &amp; Affiliate Disclosure</a></p>`)}
${RODAPE}
</body>
</html>`;

fs.writeFileSync(path.join(DESTINO, 'index.html'), html);

// ── guarda de build ──────────────────────────────────────────────────────────────────────
// ⚠️ REPROVA (exit 1). Transformação de template clonado é o caso clássico de falha silenciosa:
// sobra o nome do concorrente enterrado numa div e a página sobe respondendo 200.
const corrido = html.replace(/\s+/g, ' ');
const texto = corrido.replace(/<[^>]*>/g, ' ').toLowerCase();
const CONCORRENTE = ['audizen', 'getaudizen', 'clickbank', 'advicehealthreview', 'nervefreedom', 'tinnitus', 'hearing'];
const PROIBIDO = ['verified purchase', 'i tried', 'we tried', 'i tested', 'we tested', 'our team tested',
  'out of 5', 'star rating', '★', '⭐', 'miracle', 'clinically proven', 'doctor recommended',
  'edema', 'lymphedema', 'venous insufficiency', 'lipedema', 'in 7 days', 'in 16 days', 'guaranteed results'];
const OBRIGATORIO = [
  ['não-uso declarado', 'We have not used this product'],
  ['não-independência declarada', 'not an independent review site'],
  ['assinatura das gotas', 'every 30 days thereafter until you cancel'],
  ['associação de $462', '$77 per month for a total of 6 consecutive monthly payments'],
  ['upgrade pré-marcado', 'already ticked'],
  ['painel de 200 mg', 'Proprietary Herbal Blend, 200'],
  ['painel de 300 mg', 'Proprietary Blend, 300'],
  ['estudo sem referência', '12-week observational study'],
  ['rótulo de anúncio', 'pdc-ad-label'],
  ['disclosure de afiliado', 'pdc-affiliate-disclosure'],
  ['aviso médico', 'pdc-health-notice'],
  ['DSHEA', 'pdc-dshea'],
  ['identidade do publisher', 'pdc-publisher'],
];
const restou = CONCORRENTE.filter((c) => texto.includes(c));
const achou = PROIBIDO.filter((p) => texto.includes(p));
const faltou = OBRIGATORIO.filter(([, m]) => !corrido.includes(m)).map(([n]) => n);
const ctas = (html.match(/data-pdc-aff-param/g) || []).length;
const linksFora = [...html.matchAll(/href="(https?:\/\/[^"]+)"/g)].map((m) => m[1])
  .filter((u) => !u.startsWith('https://cc.linfaflow.com') && !u.startsWith('https://nationalhealthnews.blog'));
const arrobaCru = /[^&#][a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(html.replace(/&#64;/g, ''));

console.log(`review: ${DESTINO}/index.html · ${Math.round(Buffer.byteLength(html) / 1024)} KB · ${imgs.length} imagens`);
console.log(`  CTAs carimbados: ${ctas}`);
console.log(`  artefato do concorrente: ${restou.length ? restou.join(', ') : 'nenhum'}`);
console.log(`  proibidos: ${achou.length ? achou.join(', ') : 'nenhum'}`);
console.log(`  divulgações faltando: ${faltou.length ? faltou.join(', ') : 'nenhuma'}`);
console.log(`  links para fora: ${linksFora.length ? [...new Set(linksFora)].join(', ') : 'nenhum'}`);
if (restou.length || achou.length || faltou.length || linksFora.length || arrobaCru || ctas === 0) {
  console.error('\nBUILD REPROVADA');
  process.exit(1);
}
console.log('  build aprovada');
