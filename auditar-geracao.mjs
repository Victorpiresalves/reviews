// Audita os 158 valores gerados ANTES de publicar, e devolve a lista de placeholders para
// regenerar. O `generate-pressell` aceita `target_placeholders`, então a correção é cirúrgica:
// regenera só o que reprovou, sem jogar fora os 150 que ficaram bons.
//
// ⚠️ POR QUE AUDITAR A SAÍDA E NÃO CONFIAR NO PROMPT. O prompt v2 proíbe promessa de prazo e de
// resultado, e mesmo assim saiu "Expect support for microcirculation, reduced morning puffiness and
// a lighter feeling in the legs by the end of..." — que é exatamente isso. É a mesma regra que o
// motor de WhatsApp já pagou caro: instrução de prompt NUNCA basta, todo formato precisa de rede
// no CÓDIGO.
import fs from 'node:fs';

const v = JSON.parse(fs.readFileSync('.tmp/valores.json', 'utf8'));

// Cada regra devolve o motivo. Nada aqui é estético — são as classes que derrubam conta.
const REGRAS = [
  [/\b(edema|lymphedema|lymphoedema|venous insufficiency|lipedema|varicose)\b/i, 'alegação de doença'],
  [/\b(cure|cures|treat|treats|heal|heals|reverse|reverses)\b/i, 'verbo de tratamento'],
  [/\b(in|within|after)\s+(\d+|a few|two|three|seven|fourteen|thirty)\s*(days?|weeks?|hours?)\b/i, 'promessa de prazo'],
  [/\bby the end of\b|\bexpect (support|results?|relief|to feel)\b|\byou will (feel|see|notice|lose)\b/i, 'promessa de resultado'],
  [/\b(clinically proven|doctor recommended|scientifically proven|guaranteed results)\b/i, 'alegação de prova'],
  [/\bverified purchase\b|\b\d(\.\d)?\s*\/\s*5\b|\bout of 5 stars?\b|★|⭐/i, 'review falsa / nota'],
  [/\b(i tried|we tried|i tested|we tested|our team tested|after using it)\b/i, 'experiência de uso inexistente'],
  [/\b(miracle|breakthrough|revolutionary|game[- ]chang)/i, 'adjetivo de venda proibido'],
  [/\bSSL\b|\bcloned checkout\b|\bcounterfeit (bottles?|sellers?) (have|were|are) /i, 'fato não apurado'],
  [/\b(FDA[- ]approved|FDA approved)\b/i, 'alegação de aprovação regulatória'],
];

// Números que a página pode citar — vieram da apuração. Qualquer outro valor em dólar é invenção.
const NUMEROS_OK = ['29.99', '59.99', '89.99', '39.99', '119.97', '199.95', '34.75', '27.49', '19.99',
  '69.50', '109.96', '119.94', '9.95', '24.75', '297.00', '297', '77', '462', '30', '60', '90', '59',
  '200', '300', '12', '14', '888', '811', '1186', '800', '390', '6035', '1', '2'];

// ⚠️ O texto estatutário da DSHEA contém "diagnose, treat, cure, or prevent any disease" POR
// EXIGÊNCIA LEGAL — é a frase que a FDA manda escrever. A regra do verbo de tratamento não pode
// reprová-la, senão o guard obriga a remover a única frase que TEM que estar lá.
const ISENTOS = new Set(['FDA_DISCLAIMER']);
const ehDshea = (t) => /have not been evaluated by the Food and Drug Administration/i.test(t);

const reprovados = new Map();
for (const [k, texto] of Object.entries(v)) {
  const t = String(texto ?? '');
  if (ISENTOS.has(k) || ehDshea(t)) continue;
  const motivos = REGRAS.filter(([re]) => re.test(t)).map(([, m]) => m);
  for (const m of t.matchAll(/\$\s?([\d]+(?:\.\d{2})?)/g)) {
    if (!NUMEROS_OK.includes(m[1])) motivos.push(`valor não apurado: $${m[1]}`);
  }
  if (motivos.length) reprovados.set(k, { motivos: [...new Set(motivos)], texto: t });
}

console.log(`valores auditados: ${Object.keys(v).length} · reprovados: ${reprovados.size}`);
console.log();
for (const [k, { motivos, texto }] of reprovados) {
  console.log(`  ${k}  [${motivos.join(' + ')}]`);
  console.log(`    "${texto.replace(/\s+/g, ' ').slice(0, 150)}"`);
}
fs.writeFileSync('.tmp/reprovados.json', JSON.stringify([...reprovados.keys()], null, 1));
console.log();
console.log('para regenerar:', [...reprovados.keys()].join(', ') || '(nenhum)');
