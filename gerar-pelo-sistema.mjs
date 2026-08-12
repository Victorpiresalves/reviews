// Gera a review da LinfaFlow PELO SISTEMA: `generate-pressell` com o template tokenizado + o
// dossiê da oferta. É o caminho que existe e que eu tinha pulado ao escrever a página à mão.
//
// ⚠️ ANTES DE GERAR, o prompt de review precisa de estrutura. Medido: das 4 linhas de
// `pressell_prompt_versions`, a de `page_type='review'` é a mais velha (12/05/2026) e a ÚNICA sem
// bloco <ESTRUTURA OBRIGATORIA> — as outras três ganharam em 26/07 e ela ficou para trás. Sem isso
// o modelo recebe "tom imparcial + message match" e inventa a arquitetura sozinho.
//
// ⚠️ VERSÃO NOVA, nunca UPDATE na existente. O gerador faz `.order('version', desc).limit(1)`,
// então a v2 passa a valer sozinha e a v1 fica como rollback.
import fs from 'node:fs';

const REF = 'tmfeelnwpbawkfobbhoh';
const TEMPLATE = fs.readFileSync('.tmp/template-id.txt', 'utf8').trim();
const OFERTA = '7bf252f6-4532-482d-9389-8809de1eedf1';           // LinfaFlow DTC
const EMPRESA = 'd8755a1c-82fd-4995-9392-a46e879ca546';          // Secaps Black
const FUNIL = '4c030d2f-d252-4a14-be32-78b3313a4e18';

const keys = await (await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
  headers: { Authorization: `Bearer ${process.env.SUPABASE_ACCESS_TOKEN}` } })).json();
const S = keys.find((k) => k.name === 'service_role').api_key;
const api = (p, o = {}) => fetch(`https://${REF}.supabase.co${p}`, {
  ...o, headers: { apikey: S, Authorization: `Bearer ${S}`, 'Content-Type': 'application/json', ...(o.headers || {}) } });

// ── 1. prompt de review v2 ────────────────────────────────────────────────────────────────
const SYS = `Você escreve PÁGINAS DE REVIEW DE MARCA para tráfego pago de afiliado. A página é o
destino de quem BUSCOU O NOME DO PRODUTO no Google — ela já conhece o produto e quer um veredito.

<ESTRUTURA OBRIGATORIA>
A página segue 10 seções numeradas, nesta ordem, e cada uma responde uma busca de marca:
1. Alerta de golpe / como não comprar falsificado  → responde "<marca> scam"
2. O que é o produto                                → responde "what is <marca>"
3. Como funciona                                    → responde "does <marca> work"
4. Ingredientes e formulação                        → responde "<marca> ingredients"
5. Prós e contras                                   → os contras têm que ser REAIS
6. O que se pôde e o que NÃO se pôde verificar      → nunca depoimento
7. Preço, frete e política de reembolso             → responde "<marca> price/refund"
8. Um olhar na formulação                           → o que o rótulo não diz
9. Conclusão                                        → o veredito, repetido
10. FAQ                                             → uma pergunta por busca comprada
Antes da seção 1 vêm: veredito curto no TOPO (quem buscou a marca quer a resposta antes do scroll),
o bloco de método e a divulgação de afiliado.
</ESTRUTURA OBRIGATORIA>

<REGRAS INEGOCIAVEIS>
- NINGUÉM TESTOU O PRODUTO. É proibido escrever "eu testei", "nossa equipe testou", "usei por 30
  dias" ou qualquer relato de experiência. A página declara o não-uso e vira uma review de
  VERIFICAÇÃO: o que o vendedor publica, conferido na fonte e citado.
- PROIBIDO depoimento de cliente, nota em estrelas, "4,7/5", selo "Verified Purchase" e persona de
  revisor com nome ou foto. 16 CFR Part 465 trata review de quem não existe como ato enganoso.
- A página DECLARA que não é um site independente e que ganha comissão. A divulgação vai
  IMEDIATAMENTE acima de CADA CTA, não só do primeiro.
- PROIBIDO alegação de doença (edema, insuficiência venosa, linfedema), promessa de prazo
  ("em 7 dias"), promessa de resultado e antes/depois.
- A página promete MENOS que o anúncio, nunca mais. E NUNCA desmente o anúncio: se um fato do
  anúncio estiver errado, escreva o fato correto sem contradizer o anúncio na cara do leitor.
- Os CONTRAS são o ativo da página. Review que só elogia é anúncio disfarçado, e o revisor de
  política trata como deturpação.
- Preço, garantia e composição: só o que estiver na apuração fornecida. NUNCA inventar número.
</REGRAS INEGOCIAVEIS>

Escreva em INGLÊS dos EUA, tom de jornalismo de consumo: seco, específico, sem adjetivo de venda.
Frases curtas. Nada de "descubra o segredo", "revolucionário", "impressionante".`;

const vAtual = await (await api(`/rest/v1/pressell_prompt_versions?page_type=eq.review&select=id,version,name&order=version.desc&limit=1`)).json();
const prox = (vAtual[0]?.version ?? 1) + 1;
let promptId = null;
// Reusa a versão já criada em vez de empilhar v3, v4... a cada tentativa de geração.
if (vAtual[0] && /estrutura de 10 seções/.test(vAtual[0].name || '')) {
  promptId = vAtual[0].id;
  console.log(`prompt de review v${vAtual[0].version} reusado: ${promptId}`);
} else {
  const r = await api('/rest/v1/pressell_prompt_versions', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ name: `Review v${prox} — estrutura de 10 seções + trava de review falsa`,
      system_prompt: SYS, mode: 'template', version: prox, is_active: true, page_type: 'review',
      notes: 'Nasce porque a v1 (12/05) era a única das 4 sem <ESTRUTURA OBRIGATORIA>.' }) });
  const j = await r.json();
  if (!r.ok) { console.error('prompt falhou:', JSON.stringify(j).slice(0, 400)); process.exit(1); }
  promptId = j[0].id;
  console.log(`prompt de review v${prox}: ${promptId}`);
}

// ── 2. a apuração, que é o que a página tem de único ──────────────────────────────────────
// ⚠️ Vai por `extraInstruction` porque são FATOS DO PRODUTO, e o dossiê guarda persuasão. Sem
// isso o modelo preencheria 158 placeholders com generalidade de nutra.
const APURACAO = `FATOS APURADOS NAS PÁGINAS DO PRÓPRIO VENDEDOR em 11-12/08/2026, por leitura direta
de linfaflow.com e do checkout cc.linfaflow.com. USE SOMENTE ESTES NÚMEROS. Onde o vendedor se
contradiz, a página mostra as duas versões e manda o leitor conferir — é isso que a torna útil.

INGREDIENTES — o vendedor publica DOIS painéis no mesmo site, e eles não descrevem o mesmo produto:
 (a) popup de nutrição: "Proprietary Blend 300 mg" = Cleavers Aerial Parts (Galium aparine), Red
     Clover Flower (Trifolium pratense), Stillingia Root, Prickly Ash Bark + vegetable glycerin, water.
 (b) bloco "Full Supplement Facts": "Proprietary Herbal Blend (200mg)" = maca root, african mango
     seed, grape seed, guarana seed, eleutherococcus senticosus, astragalus, green tea leaf, gymnema
     sylvestre, coleus forskohlii, cayenne pepper, grapefruit seed, ginseng, raspberry ketones,
     L-glutamine, L-tyrosine, L-arginine, beta alanine, monoammonium glycyrrhizinate, GABA,
     L-tryptophan, L-carnitine HCl + water, citric acid. NENHUM dos 4 botânicos aparece aqui.
 Nenhum painel dá a quantidade de ingrediente individual. O (b) tem cafeína (guaraná, chá verde,
 ginseng) e um derivado de alcaçuz; o (a) não tem. NÃO afirme qual é o atual — diga que o vendedor
 não diz, e mande ler o rótulo do frasco. Descrições do vendedor para os 4 botânicos, cite como
 dele: cleavers "Encourages lymph flow and gentle cleansing"; red clover "Promotes healthy
 circulation and clear skin"; prickly ash "Boosts energy and supports microcirculation";
 stillingia "Aids gentle detox and natural drainage".

POSOLOGIA oficial: "Take 1-2 droppers (1-2 mL) once or twice daily", sob a língua ou em água/chá/
suco. Serving size 1 mL, 59 servings por frasco → cerca de dois meses na menor dose e cerca de duas
semanas na maior.

PREÇO — duas escadas. Loja: 1 frasco $29.99, 3 por $59.99, 5 por $89.99 (compare at $39.99/$119.97/
$199.95). Checkout: por frasco e com FRETE GRÁTIS — "Buy 1 Get 1 Free" $34.75/frasco ($69.50),
"Buy 2 Get 2 Free" $27.49 ($109.96), "Buy 3 Get 3 Free" $19.99 ($119.94), esta última já vem
selecionada. Upgrade de envio expresso de $9.95 vem PRÉ-MARCADO. O checkout também oferece
"12-bottle annual supply" a $24.75/mês, "billed yearly - $297.00" (assinatura anual, não pacote).

COBRANÇAS RECORRENTES — duas, diferentes:
 (1) associação "Linfaflow Wellness Club" INCLUÍDA NO CARRINHO da loja, texto literal do vendedor:
     "my cart includes a digital 'Linfaflow Wellness Club' membership with a 14-day free trial.
     Unless canceled before the trial ends, I agree and authorise Linfaflow to automatically charge
     my credit card $77 per month for a total of 6 consecutive monthly payments." = $462.
 (2) assinatura OPT-IN das gotas: "If you select a subscription... you will be charged the price
     shown above (e.g. $29.99) now and every 30 days thereafter until you cancel" e "The package
     name (e.g. 'Buy one', 'Buy 2 Get 1 FREE') will appear on your statement". O checkout diz, na
     mesma página, "Your order is a one-time purchase - no subscription, no recurring charge".

REEMBOLSO — três janelas no ar ao mesmo tempo: 30 dias E 60 dias na página do produto, 60 no banner
do checkout, 90 no rodapé do checkout. Diga as três e mande confirmar na compra.

EVIDÊNCIA — o vendedor cita "a 12-week observational study on 200 adults (ages 35-68)" e não publica
referência nenhuma. NÃO escreva "não publica evidência": publica, sem lastro conferível.

FABRICAÇÃO (afirmações do vendedor, cite como dele): formulado e envasado nos EUA em instalações
GMP-certified, cada lote third-party tested for purity and potency, livre de álcool, açúcar e glúten.

SUPORTE do vendedor (real): support@linfaflow.com, +1 (888) 811-1186, reembolsos +1 (800) 390-6035.
O e-mail tem que sair com o arroba como &#64; — a Cloudflare apaga arroba literal.

PUBLISHER: National Health News, contact&#64;nationalhealthnews.blog. Não inventar razão social nem
endereço postal.`;

// ── 3. gerar ──────────────────────────────────────────────────────────────────────────────
// ⚠️ `generated_pressells.user_id` é NOT NULL — o dono da pressell. Herda de uma linha existente
// da mesma empresa em vez de cravar um uuid: o guard do generate-pressell confere DONO ou
// service_role, e um user_id inventado tornaria a pressell ineditável pela tela.
const donos = await (await api('/rest/v1/generated_pressells?company_id=eq.'+EMPRESA+'&select=user_id&user_id=not.is.null&limit=1')).json();
if(!donos[0]) { console.error('nenhuma pressell da empresa para herdar user_id'); process.exit(1); }
const USER = donos[0].user_id;
const pressellId = crypto.randomUUID();
{
  const r = await api('/rest/v1/generated_pressells', {
    method: 'POST', headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ id: pressellId, company_id: EMPRESA, user_id: USER, funnel_id: FUNIL,
      title: 'LinfaFlow — Review de marca (molde Audizen, gerado pelo sistema)',
      template_used: TEMPLATE, status: 'generated', content: '' }) });
  if (!r.ok) { console.error('pressell falhou:', JSON.stringify(await r.json()).slice(0, 400)); process.exit(1); }
}
console.log('pressell:', pressellId);

console.log('gerando (158 placeholders, pode levar minutos)...');
const t0 = Date.now();
const r = await api('/functions/v1/generate-pressell', {
  method: 'POST',
  body: JSON.stringify({
    pressellId, templateId: TEMPLATE, offerId: OFERTA, promptVersionId: promptId,
    pressellType: 'review', language: 'en', productName: 'LinfaFlow',
    // Congruência: o que o ad group de MARCA promete literalmente.
    headlineAnuncio: 'LinfaFlow Reviews — See the Full Ingredient List',
    palavrasChave: 'linfaflow reviews, linfaflow ingredients, linfaflow scam, does linfaflow work, linfaflow price, linfaflow refund',
    extraInstruction: APURACAO,
  }),
});
const j = await r.json();
console.log('HTTP', r.status, 'em', Math.round((Date.now() - t0) / 1000) + 's');
console.log(JSON.stringify(j).slice(0, 900));
fs.writeFileSync('.tmp/geracao.json', JSON.stringify({ pressellId, promptId, resposta: j }, null, 1));
