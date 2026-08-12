// Corrige os 5 valores que a auditoria reprovou e RE-RENDERIZA o content a partir do template.
//
// ⚠️ POR QUE À MÃO E NÃO POR REGENERAÇÃO. O `target_placeholders` do `generate-pressell` rodou
// (updated_at mudou, uma chave a mais) e NÃO sobrescreveu os alvos — o caminho de regeneração
// parcial não fecha o ciclo quando o content já está preenchido. Depurar a edge custaria um ciclo
// de deploy; e o que falta são 5 strings curtas onde o modelo insiste em inventar fato que não foi
// apurado. O sistema gerou 153 de 158 bem: essa é a parte que importa.
//
// ⚠️ O QUE CADA UM ERRAVA: SSL e checkout clonado (nunca apurados), falsificação em marketplace
// (idem), prazo de processamento e de entrega (idem), promessa de resultado com prazo, e uma
// afirmação sobre o que o produto faz no corpo. Todas são a mesma classe: o modelo preenchendo
// lacuna com plausibilidade em vez de com fato.
import fs from 'node:fs';

const REF = 'tmfeelnwpbawkfobbhoh';
const PRESSELL = '2f0fc95b-e736-4267-a8f0-3c6251fd7a3c';

const CORRIGIDOS = {
  SCAM_TYPE_1:
    'Any listing outside the seller&rsquo;s own site &mdash; the refund policy and the support line only apply to orders placed there.',
  SCAM_WARNING_DESC_1:
    'We found no evidence of counterfeits, and we are not going to invent any. The real reason to buy on the seller&rsquo;s own site is simpler: it is the only place where the published refund window and the support numbers are yours to use.',
  FAQ_ANSWER_3:
    'We cannot tell you, and we would be wary of a page that did. Nobody here has taken it, the seller publishes two different ingredient panels, and the only evidence cited is a 12-week observational study on 200 adults given without a reference we could check.',
  MARKET_COMPARISON:
    'Compression garments and prescribed medication do things a supplement does not do. The seller positions these drops as a daily routine alongside them, not as a replacement &mdash; and if a clinician has already advised something, keep doing it.',
  SHIPPING_PROCESS_1:
    'Shipping is free on the seller&rsquo;s checkout, and an expedited upgrade of $9.95 arrives already ticked below the pay button. We have not placed an order, so we cannot tell you how long delivery takes.',
};

const keys = await (await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
  headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}` } })).json();
const S = keys.find((k) => k.name === 'service_role').api_key;
const api = (p, o = {}) => fetch(`https://${REF}.supabase.co${p}`, {
  ...o, headers: { apikey: S, Authorization: `Bearer ${S}`, 'Content-Type': 'application/json', ...(o.headers || {}) } });

const [pres] = await (await api(`/rest/v1/generated_pressells?id=eq.${PRESSELL}&select=placeholder_values,template_used`)).json();
const valores = { ...pres.placeholder_values, ...CORRIGIDOS };

const [tpl] = await (await api(`/rest/v1/elementor_templates?id=eq.${pres.template_used}&select=template_data`)).json();
let content = tpl.template_data.html;

// Re-render: mesma substituição que o gerador faz. Placeholder sem valor fica VISÍVEL de propósito
// — some é pior, porque a página sobe com um buraco que ninguém vê.
const semValor = [];
content = content.replace(/\{\{([A-Z0-9_]+)\}\}/g, (m, k) => {
  if (valores[k] === undefined) { semValor.push(k); return m; }
  return String(valores[k]);
});

console.log(`valores: ${Object.keys(valores).length} · corrigidos à mão: ${Object.keys(CORRIGIDOS).length}`);
console.log(`placeholders sem valor: ${semValor.length ? [...new Set(semValor)].join(', ') : 'nenhum'}`);
console.log(`content: ${Math.round(Buffer.byteLength(content) / 1024)} KB`);

const r = await api(`/rest/v1/generated_pressells?id=eq.${PRESSELL}`, {
  method: 'PATCH', headers: { Prefer: 'return=minimal' },
  body: JSON.stringify({ content, placeholder_values: valores, status: 'edited' }) });
if (!r.ok) { console.error('patch falhou:', await r.text()); process.exit(1); }

fs.writeFileSync('.tmp/valores.json', JSON.stringify(valores, null, 1));
fs.writeFileSync('.tmp/gerado.html', content);
console.log('gravado.');
