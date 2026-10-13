"use strict";
const SK=window.SoulKidsVariacao;
const key=document.body.dataset.game;
const $=id=>document.getElementById(id);
const syllables=[
 ["PA","PATO","🦆"],["BO","BOLA","⚽"],["MA","MALA","🧳"],["CA","CASA","🏠"],
 ["PI","PIPA","🪁"],["SA","SAPO","🐸"],["GA","GATO","🐈"],["LA","LATA","🥫"],
 ["PE","PERA","🍐"],["MO","MOTO","🛵"],["FO","FOCA","🦭"],["LI","LIVRO","📚"],
 ["BE","BEBÊ","👶"],["DA","DADO","🎲"],["LU","LUA","🌙"],["VI","VIOLÃO","🎸"],
 ["NA","NAVIO","🚢"],["TA","TATU","🦔"],["CO","COCO","🥥"],["CE","CEBOLA","🧅"],
 ["RA","RATO","🐭"],["NO","NOVE","9️⃣"],["SO","SOPA","🥣"],["JA","JANELA","🪟"],
 ["FI","FITA","🎀"],["BA","BALA","🍬"],["FE","FEIRA","🛍️"],["LE","LEÃO","🦁"]
];
const rhymes=[
 ["GATO","🐱","PATO","🦆"],["BOLA","⚽","MOLA","🌀"],["PÃO","🍞","MÃO","✋"],
 ["MALA","🧳","SALA","🏠"],["LEÃO","🦁","BALÃO","🎈"],["JANELA","🪟","PANELA","🍲"],
 ["COELHO","🐰","ESPELHO","🪞"],["FLOR","🌼","AMOR","❤️"],["CARRO","🚗","BARRO","🟤"],
 ["RATO","🐭","GATO","🐈"],["SAPATO","👟","PATO","🦆"],["CADEIRA","🪑","FEIRA","🛍️"]
];
const routines=[
 ["Lavar as mãos","🧼",[["🚰","Abrir a torneira"],["💧","Molhar as mãos"],["🧴","Passar sabonete"],["🫧","Enxaguar as mãos"]]],
 ["Escovar os dentes","🪥",[["🪥","Pegar a escova"],["🫧","Colocar a pasta"],["😁","Escovar os dentes"],["💧","Enxaguar a boca"]]],
 ["Guardar brinquedos","🧸",[["🧩","Reunir os brinquedos"],["🔎","Separar as peças"],["📦","Colocar na caixa"],["✅","Guardar a caixa"]]],
 ["Preparar a mesa","🍽️",[["🧽","Limpar a mesa"],["🍽️","Colocar os pratos"],["🥄","Distribuir talheres"],["🥤","Colocar os copos"]]],
 ["Arrumar a mochila","🎒",[["📋","Conferir os materiais"],["📚","Guardar os cadernos"],["✏️","Guardar o estojo"],["🎒","Fechar a mochila"]]],
 ["Cuidar da planta","🌻",[["🚿","Pegar o regador"],["💧","Colocar água"],["🪴","Ir até a planta"],["🌻","Regar com cuidado"]]],
 ["Fazer um desenho","🎨",[["📃","Pegar uma folha"],["🖍️","Escolher as cores"],["🎨","Fazer o desenho"],["🧺","Guardar os materiais"]]],
 ["Calçar o tênis","👟",[["🧦","Separar as meias"],["🦶","Calçar as meias"],["👟","Pegar o tênis"],["✅","Calçar o tênis"]]],
 ["Organizar livros","📚",[["📚","Reunir os livros"],["🔎","Separar por tamanho"],["📖","Colocar na estante"],["✅","Conferir se ficou organizado"]]],
 ["Preparar o lanche","🍌",[["🧼","Lavar as mãos"],["🍌","Escolher uma fruta"],["🍽️","Colocar no prato"],["🪑","Sentar à mesa"]]],
 ["Começar um jogo de tabuleiro","🎲",[["📦","Abrir a caixa"],["🎲","Separar as peças"],["🤝","Combinar as regras"],["🎉","Começar a partida"]]],
 ["Preparar material de pintura","🖌️",[["🧥","Colocar avental"],["🗞️","Proteger a mesa"],["🖌️","Separar os pincéis"],["🎨","Começar a pintura"]]],
 ["Arrumar a cama","🛏️",[["🧸","Retirar os brinquedos"],["🛏️","Esticar o lençol"],["🛌","Ajeitar o travesseiro"],["✅","Colocar a colcha"]]],
 ["Organizar o material da escola","✏️",[["📚","Separar os cadernos"],["✏️","Conferir os lápis"],["📏","Guardar a régua"],["🎒","Colocar tudo na mochila"]]],
 ["Preparar a hora da leitura","📖",[["📚","Escolher um livro"],["🛋️","Encontrar lugar confortável"],["📖","Abrir na primeira página"],["👀","Começar a ler as figuras"]]]
];
const patternEmojis=[
 ["🍎","🍌","🍇","🍓"],["🐱","🐶","🐸","🦊"],["🔴","🔵","🟡","🟢"],
 ["🌻","🌷","🌼","🍀"],["⭐","🌙","☀️","☁️"],["🚗","🚌","🚲","🚀"],
 ["🟡","🔺","🟩","🔵"],["🍊","🍐","🥕","🍆"],["💛","💙","💚","💜"],
 ["🎈","🎁","🎀","🎉"],["🐢","🐬","🦋","🐝"],["⚽","🏀","🎾","🏐"]
];
function makeFono(level){
 const total=level===1?2:level===2?3:4;
 const initial=syllables.map(([syllable,word,emoji],index)=>{
  const distractors=syllables.filter(([sy])=>sy!==syllable).map(([,w,e])=>[e,w]);
  return {id:"ini-"+syllable,q:"Qual palavra começa com "+syllable+"?",visual:syllable,
   build(){const opts=SK.options([emoji,word],distractors,total);return {...opts}},
   why:word+" começa com "+syllable+"."}
 });
 const rhyming=rhymes.map(([word,icon,answer,iconAnswer],index)=>({
  id:"rima-"+index,q:"Qual palavra rima com "+word+"?",visual:icon+" "+word,
  build(){const distractors=syllables.filter(([,w])=>w!==word && w!==answer && !w.endsWith(answer.slice(-3))).map(([,w,e])=>[e,w]);const options=SK.options([iconAnswer,answer],distractors,total);return options},
  why:word+" e "+answer+" têm sons finais parecidos."
 }));
 let bank=level===1?initial:level===2?[...initial,...rhyming.slice(0,8)]:[...initial,...rhyming];
 return bank;
}
function makeTo(level){
 return routines.map(([title,icon,steps],i)=>({id:"rotina-"+i,q:"Vamos organizar: "+title+"!",visual:icon,steps:steps.slice(0,level===1?2:level===2?3:4)}));
}
function makePatterns(level){
 const result=[];
 for(let i=0;i<patternEmojis.length;i++){
  const [a,b,c,d]=patternEmojis[i];
  const patterns=[
   {kind:1,id:"ab-"+i,visual:[a,b,a,b,"❔"],right:a,why:"O padrão alterna duas figuras."},
   {kind:2,id:"aab-"+i,visual:[a,a,b,a,a,"❔"],right:b,why:"O padrão repete duas figuras iguais e uma diferente."},
   {kind:2,id:"abc-"+i,visual:[a,b,c,a,b,"❔"],right:c,why:"O padrão repete um grupo de três figuras."},
   {kind:3,id:"abb-"+i,visual:[a,b,b,a,b,"❔"],right:b,why:"O padrão repete uma figura e depois duas iguais."},
   {kind:3,id:"abcd-"+i,visual:[a,b,c,d,a,b,c,"❔"],right:d,why:"O padrão repete quatro figuras na mesma ordem."}
  ];
  for(const p of patterns)if(level>=p.kind)result.push({
   id:p.id,q:"Descubra qual figura vem em seguida",visual:p.visual.join(" "),
   build(){return SK.options([p.right,p.right],[a,b,c,d].filter(x=>x!==p.right).map(x=>[x,x]),level===1?2:level===2?3:4)},
   why:p.why
  });
 }
 if(level===3)for(let start=1;start<=8;start++)for(const step of [2,3]){
  const seq=[start,start+step,start+step*2,start+step*3],right=start+4*step;
  result.push({id:"num-"+start+"-"+step,q:"Qual número continua a sequência?",visual:[...seq,"❔"].join(" "),
   build(){return SK.options([String(right),String(right)],[right-step,right+step,right+step*2,right-1].map(x=>[String(x),String(x)]),4)},
   why:"A sequência aumenta "+step+" a cada passo."});
 }
 return result;
}
const META={
 fono:{title:"Sons e Sílabas",area:"Fonoaudiologia",icon:"🗣️",
  lead:"Descubra sons iniciais e rimas. As perguntas variam de uma partida para outra.",
  note:"Jogo de linguagem e consciência fonológica, não substitui orientação fonoaudiológica.",factory:makeFono},
 to:{title:"Rotina em Ordem",area:"Terapia Ocupacional",icon:"🧩",
  lead:"Organize diferentes atividades do cotidiano. As situações e posições dos cartões mudam.",
  note:"Atividade lúdica sobre sequenciamento; rotinas reais podem ter outras etapas e adaptações.",factory:makeTo,mode:"sequence"},
 psicopedagogia:{title:"Descubra a Sequência",area:"Psicopedagogia",icon:"🧠",
  lead:"Encontre padrões de formas, figuras e números. Cada rodada traz novas combinações.",
  note:"Exploração educativa de padrões e raciocínio, sem finalidade de avaliação psicopedagógica.",factory:makePatterns}
};
const game=META[key];
let difficulty=2,rounds=[],pos=0,correct=0,step=0,firstTry=true,selectionLocked=false,shownOptions=[];
const start=$("start"),play=$("play"),finish=$("finish");
$("title").textContent=game.title;$("area").textContent=game.area;
$("intro-text").textContent=game.lead;$("lead-text").textContent=game.lead;
$("hero-icon").textContent=game.icon;$("disclaimer").textContent=game.note;
document.title=game.title+" | SoulKids";
$("audio").hidden=key!=="fono"||!("speechSynthesis" in window);
document.querySelectorAll("[data-difficulty]").forEach(b=>b.addEventListener("click",()=>{
 difficulty=Number(b.dataset.difficulty);
 document.querySelectorAll("[data-difficulty]").forEach(x=>{const active=x===b;x.classList.toggle("selected",active);x.setAttribute("aria-pressed",String(active))});
}));
function say(){if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(rounds[pos].q);speech.lang="pt-BR";speech.rate=.83;window.speechSynthesis.speak(speech)}
$("audio").addEventListener("click",say);
function show(which){start.classList.toggle("hide",which!=="start");play.classList.toggle("hide",which!=="play");finish.classList.toggle("hide",which!=="finish")}
function makeChoice(glyph,label,i){const b=document.createElement("button");b.type="button";b.className="option";b.dataset.index=String(i);
 const icon=document.createElement("span");icon.className="glyph";icon.setAttribute("aria-hidden","true");icon.textContent=glyph;
 const txt=document.createElement("span");txt.textContent=label;b.append(icon,txt);b.addEventListener("click",()=>choose(i,b));return b}
function render(){
 const r=rounds[pos];step=0;firstTry=true;selectionLocked=false;
 $("counter").textContent="Desafio "+(pos+1)+" de "+rounds.length;
 $("progress").style.width=(pos/rounds.length*100)+"%";
 $("question").textContent=r.q;$("visual").textContent=r.visual;
 $("choices").replaceChildren();$("feedback").hidden=true;$("next").classList.add("hide");
 if(game.mode==="sequence"){
  for(const i of SK.shuffle(r.steps.map((_,index)=>index)))$("choices").append(makeChoice(...r.steps[i],i));
  $("step-label").textContent="Toque no passo 1 de "+r.steps.length;$("step-label").hidden=false;
 }else{
  shownOptions=r.build();
  shownOptions.choices.forEach((o,i)=>$("choices").append(makeChoice(o[0],o[1],i)));
  $("step-label").hidden=true;
 }
}
function respond(good,message){const el=$("feedback");el.hidden=false;el.textContent=message;el.style.background=good?"#e4f7eb":"#fff4e2";el.setAttribute("role","status")}
function choose(i,b){
 if(selectionLocked)return;
 const r=rounds[pos];
 if(game.mode==="sequence"){
  if(i!==step){respond(false,"Ainda não. Pense no que vem antes e tente outra vez.");firstTry=false;return}
  b.disabled=true;b.classList.add("good");step++;
  if(step===r.steps.length){selectionLocked=true;if(firstTry)correct++;respond(true,"Você organizou a sequência!");$("step-label").hidden=true;$("next").classList.remove("hide")}
  else {$("step-label").textContent="Agora, passo "+(step+1)+" de "+r.steps.length;respond(true,"Isso! Qual é o próximo passo?")}
 } else{
  if(i!==shownOptions.answer){b.classList.add("bad");firstTry=false;respond(false,"Essa ainda não é a resposta esperada. Observe e tente outra opção.");return}
  selectionLocked=true;b.classList.add("good");if(firstTry)correct++;
  respond(true,r.why);$("next").classList.remove("hide");
 }
}
function launch(){
 const bank=game.factory(difficulty);
 const count=difficulty===1?5:difficulty===2?6:7;
 rounds=SK.pick(key+"-nivel-"+difficulty,bank,count);
 pos=0;correct=0;show("play");render();$("question").focus();
}
$("begin").addEventListener("click",launch);$("again").addEventListener("click",launch);
$("next").addEventListener("click",()=>{
 pos++;
 if(pos<rounds.length){render();$("question").focus()}else{
  show("finish");$("progress").style.width="100%";
  $("result").textContent=correct+" de "+rounds.length+" desafios concluídos na primeira tentativa.";
  $("finish-title").focus();
 }
});
