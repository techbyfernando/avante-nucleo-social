import fs from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';

const input=process.argv[2]||'index.html';
let html;
try { html=await fs.readFile(input,'utf8'); }
catch (error) {
  console.error(`Página ainda indisponível: ${input}. Auditoria não executada.`);
  process.exit(2);
}
const $=load(html);
const copy=$('body').clone();copy.find('script,style,noscript').remove();
const text=copy.text().replace(/\s+/g,' ').trim();
const checks=[];
const check=(id,passed,detail)=>checks.push({id,passed,detail});
const warnings=[];
check('language',$('html').attr('lang')==='pt-BR','Idioma esperado: pt-BR');
check('title',/Avante/i.test($('title').text()),$('title').text());
check('description',($('meta[name="description"]').attr('content')||'').length>=60,'Meta description institucional não vazia');
check('viewport',/width=device-width/.test($('meta[name="viewport"]').attr('content')||''),'Viewport responsivo');
check('single-h1',$('h1').length===1,`${$('h1').length} H1`);
check('name',/Avante N[uú]cleo Social/i.test(text)||/Avante N[uú]cleo Social/i.test($('img').map((_,e)=>$(e).attr('alt')||'').get().join(' ')),'Nome institucional no conteúdo ou marca acessível');
check('video-id',html.includes('e_FMUXOr1yQ'),'ID oficial do YouTube preservado');
check('official-phone',$('a[href="tel:+551126850301"]').length>0,'Telefone oficial');
check('official-email',$('a[href^="mailto:contato@avantenucleosocial.com.br"]').length>0,'E-mail oficial');
check('official-whatsapp',$('a[href]').toArray().some(e=>/5511947446597/.test($(e).attr('href')||'')),'WhatsApp oficial');
check('services',/centros comerciais/i.test(text)&&/socioassistencial/i.test(text)&&/treinamento/i.test(text),'Atuação, rede e treinamentos explicitados');
check('no-demo-copy',!/(arcline|copenhagen|book a test|measured training|membership|VO₂|running|cycling|swimming|fitness|€\s*\d)/i.test(text),'Ausência de copy de demonstração no texto visível (IDs/classes excluídos)');
check('no-placeholder-attributes',$('[data-8b-placeholder]').length===0,`${$('[data-8b-placeholder]').length} atributos de placeholder`);
const ids=$('[id]').map((_,e)=>$(e).attr('id')).get();
check('unique-ids',new Set(ids).size===ids.length,'IDs únicos');
const brokenAnchors=[];
$('a[href^="#"]').each((_,e)=>{const href=$(e).attr('href');if(href==='#'||!ids.includes(decodeURIComponent(href.slice(1))))brokenAnchors.push(href);});
check('anchors',brokenAnchors.length===0,brokenAnchors);
const emptyLinks=$('a').toArray().filter(e=>!$(e).attr('href')||/^(?:javascript:|\s*$)/i.test($(e).attr('href')));
check('link-targets',emptyLinks.length===0,`${emptyLinks.length} links sem destino real`);
const badTargets=$('a[target="_blank"]').toArray().filter(e=>!/(?:noopener|noreferrer)/.test($(e).attr('rel')||''));
check('external-targets',badTargets.length===0,'Links em nova aba com rel seguro');
const images=[];
for(const e of $('img').toArray()){
  const img=$(e),src=img.attr('src')||'';
  const item={src,alt:img.attr('alt'),width:img.attr('width'),height:img.attr('height')};
  if(!src.startsWith('data:')&&!/^https?:\/\//.test(src)){
    const clean=src.split(/[?#]/)[0].replace(/^\//,'');
    const candidates=[path.resolve(path.dirname(input),clean),path.resolve('public',clean)];
    item.exists=false;
    for(const file of candidates){try{await fs.access(file);item.exists=true;break;}catch{}}
  }else item.exists=Boolean(src);
  images.push(item);
}
check('image-files',images.every(i=>i.exists),images.filter(i=>!i.exists));
check('image-alts',images.every(i=>i.alt!==undefined),images.filter(i=>i.alt===undefined).map(i=>i.src));
check('image-dimensions',images.every(i=>Number(i.width)>0&&Number(i.height)>0),images.filter(i=>!(Number(i.width)>0&&Number(i.height)>0)).map(i=>i.src));
const partners=[['Internacional Shopping',/internacional/i],['Bourbon Shopping',/bourbon/i],['Jardim Sul Shopping',/jardim\s*sul/i],['Santana Parque',/santana\s*parque/i],['Campo Limpo Shopping',/campo\s*limpo/i],['Shopping Metrô Santa Cruz',/santa\s*cruz/i],['Mooca Plaza Shopping',/mooca/i],['Itapecerica Shopping',/itapecerica/i],['Shopping Center Norte',/center\s*norte/i],['West Plaza Shopping',/west\s*plaza/i]];
const imageLabels=images.map(i=>i.alt||'').join(' | ');
check('ten-official-partners',partners.every(([,re])=>re.test(imageLabels)),partners.filter(([,re])=>!re.test(imageLabels)).map(([name])=>name));
const accessiblePartnerImages=$('#partners .partner-group:not([aria-hidden="true"]) img').toArray();
const accessiblePartnerLabels=accessiblePartnerImages.map(e=>$(e).attr('alt')||'');
check('partner-accessible-count',accessiblePartnerImages.length===10&&new Set(accessiblePartnerLabels).size===10,{count:accessiblePartnerImages.length,names:accessiblePartnerLabels});
check('partner-duplicates-hidden',$('#partners .partner-group[aria-hidden="true"] img').toArray().every(e=>$(e).attr('alt')===''),'Cópias decorativas com alt vazio e grupo aria-hidden');
check('partner-context',/clientes/i.test(text),'Marcas qualificadas como clientes publicados, não financiadores inventados');
const favicon=$('link[rel~="icon"]').attr('href');
check('favicon',Boolean(favicon),favicon||'Ausente');
for(const re of [/\bONG\b/gi,/\bOSC\b/gi,/doaç[ãõ]o/gi,/volunt[aá]ri[oa]/gi,/vidas transformadas/gi,/24\s*h/gi,/certificad[oa]/gi]){
 const hits=[...text.matchAll(re)].map(m=>text.slice(Math.max(0,m.index-50),m.index+m[0].length+90));
 if(hits.length)warnings.push({type:'editorial-review',pattern:re.source,contexts:hits});
}
if(/5[.\s]?000/.test(text)&&!/(per[ií]odo|apuraç[ãõ]o|data de atualizaç[ãõ]o)/i.test(text))warnings.push({type:'metrics-period',detail:'Indicador 5.000 presente sem nota de período detectável'});
if(/N[ãa]o representam uma contagem de pessoas [uú]nicas/i.test(text))warnings.push({type:'metrics-unknown',detail:'A fonte não estabelece se os atendimentos representam pessoas únicas; registrar desconhecimento, não afirmar que não representam.'});
const iframes=$('iframe').toArray().map(e=>({src:$(e).attr('src'),title:$(e).attr('title')}));
check('iframe-titles',iframes.every(i=>Boolean(i.title)),iframes.filter(i=>!i.title));
const result={date:new Date().toISOString(),input,passed:checks.every(c=>c.passed),checks,warnings,counts:{images:images.length,links:$('a').length},limitations:['Análise estática; não comprova reprodução do vídeo, contraste, movimento, envio ou fidelidade vetorial.','Texto oculto por CSS exige confirmação em navegador.']};
await fs.mkdir('research',{recursive:true});
await fs.writeFile('research/content-audit.json',JSON.stringify(result,null,2));
console.log(JSON.stringify({passed:result.passed,failed:checks.filter(c=>!c.passed),warnings},null,2));
if(!result.passed)process.exitCode=1;
