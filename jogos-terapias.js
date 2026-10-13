
"use strict";
const GAMES = {
fono:{
 title:"Sons e Sílabas",area:"Fonoaudiologia",icon:"🗣️",lead:"Escute, observe e encontre as palavras que começam com a mesma sílaba.",note:"Exploração de consciência silábica e vocabulário. O áudio é opcional; não substitui avaliação ou acompanhamento fonoaudiológico.",
 rounds:[
 {q:"Qual palavra começa com PA?",visual:"PA",options:[["🦆","PATO"],["⚽","BOLA"],["🏠","CASA"]],answer:0,why:"PATO começa com PA."},
 {q:"Qual palavra começa com BO?",visual:"BO",options:[["🐸","SAPO"],["⚽","BOLA"],["🐈","GATO"]],answer:1,why:"BOLA começa com BO."},
 {q:"Qual palavra começa com MA?",visual:"MA",options:[["🧳","MALA"],["🦆","PATO"],["🏠","CASA"]],answer:0,why:"MALA começa com MA."},
 {q:"Qual palavra começa com CA?",visual:"CA",options:[["🛵","MOTO"],["🐸","SAPO"],["🏠","CASA"]],answer:2,why:"CASA começa com CA."},
 {q:"Qual palavra começa com PI?",visual:"PI",options:[["🪁","PIPA"],["🐈","GATO"],["⚽","BOLA"]],answer:0,why:"PIPA começa com PI."},
 {q:"Qual palavra começa com SA?",visual:"SA",options:[["🍎","MAÇÃ"],["🐸","SAPO"],["🦆","PATO"]],answer:1,why:"SAPO começa com SA."}
]},
to:{
 title:"Rotina em Ordem",area:"Terapia Ocupacional",icon:"🧩",lead:"Organize três passos de atividades do cotidiano. Toque na ação que vem primeiro, depois na próxima.",note:"Atividade lúdica sobre sequenciamento de ações e autonomia. As rotinas podem ser adaptadas por profissionais e cuidadores.",
 mode:"sequence",rounds:[
 {q:"Vamos lavar as mãos!",visual:"🧼",steps:[["🚰","Molhar as mãos"],["🧴","Passar sabonete"],["💧","Enxaguar as mãos"]]},
 {q:"Vamos escovar os dentes!",visual:"🪥",steps:[["🪥","Pegar a escova"],["🫧","Colocar pasta"],["😁","Escovar os dentes"]]},
 {q:"Vamos organizar os brinquedos!",visual:"🧸",steps:[["🧩","Reunir as peças"],["📦","Colocar na caixa"],["✅","Guardar a caixa"]]},
 {q:"Vamos preparar a mesa!",visual:"🍽️",steps:[["🧽","Limpar a mesa"],["🍽️","Colocar os pratos"],["🥄","Colocar os talheres"]]}
]},
psicopedagogia:{
 title:"Descubra a Sequência",area:"Psicopedagogia",icon:"🧠",lead:"Observe o padrão de figuras e escolha qual vem em seguida. Cada desafio tem uma regra.",note:"Estimula exploração de padrões, atenção visual e raciocínio lógico, sem atribuir notas de aprendizagem ou diagnósticos.",
 rounds:[
 {q:"Qual figura continua a sequência?",visual:"🔴 🔵 🔴 🔵 ❔",options:[["🔴","Vermelho"],["🔵","Azul"],["🟡","Amarelo"]],answer:0,why:"O padrão alterna vermelho e azul."},
 {q:"Qual figura vem agora?",visual:"⭐ 🌙 ⭐ 🌙 ❔",options:[["☀️","Sol"],["🌙","Lua"],["⭐","Estrela"]],answer:2,why:"Uma estrela e uma lua se alternam."},
 {q:"Continue o grupo de três.",visual:"🔺 🔵 🟩 🔺 🔵 ❔",options:[["🟩","Quadrado"],["🔺","Triângulo"],["🔵","Círculo"]],answer:0,why:"A sequência repete triângulo, círculo e quadrado."},
 {q:"O que vem depois?",visual:"1 2 3 1 2 ❔",options:[["2","Dois"],["3","Três"],["1","Um"]],answer:1,why:"Os números 1, 2 e 3 se repetem."},
 {q:"Complete a repetição.",visual:"🍎 🍌 🍌 🍎 🍌 🍌 ❔",options:[["🍇","Uva"],["🍌","Banana"],["🍎","Maçã"]],answer:2,why:"A cada maçã seguem duas bananas."},
 {q:"Qual é a próxima figura?",visual:"🟨 🟨 🟢 🟨 🟨 ❔",options:[["🟢","Círculo verde"],["🟨","Quadrado amarelo"],["🔺","Triângulo"]],answer:0,why:"O padrão repete dois quadrados e um círculo."}
]},
fisioterapia:{
 title:"Missão Movimento",area:"Fisioterapia",icon:"🤸",lead:"Observe o desafio e escolha o gesto correspondente. Se for confortável, tente imitá-lo com ajuda.",note:"Jogo de reconhecimento de gestos e direções, não de avaliação de força, equilíbrio ou mobilidade. Movimentos são opcionais, adaptáveis e devem ser interrompidos se causarem desconforto.",
 rounds:[
 {q:"Qual gesto usa principalmente as mãos?",visual:"👐",options:[["👐","Abrir e fechar as mãos"],["🦶","Mover os pés"],["👀","Piscar os olhos"]],answer:0,why:"Abrir e fechar as mãos envolve os dedos e as mãos."},
 {q:"Qual seta aponta para cima?",visual:"☁️",options:[["⬅️","Esquerda"],["⬆️","Cima"],["⬇️","Baixo"]],answer:1,why:"A seta para cima aponta em direção ao céu."},
 {q:"Qual parte do corpo usamos ao dobrar o cotovelo?",visual:"💪",options:[["🦶","Pé"],["👂","Orelha"],["💪","Braço"]],answer:2,why:"O cotovelo é uma articulação do braço."},
 {q:"Qual gesto combina com levantar os braços?",visual:"🙆",options:[["🙆","Braços para cima"],["🦵","Dobrar os joelhos"],["🦶","Movimentar os pés"]],answer:0,why:"Elevar os braços é um gesto dos membros superiores."},
 {q:"Qual seta indica a direção à direita?",visual:"🧭",options:[["⬆️","Cima"],["➡️","Direita"],["⬅️","Esquerda"]],answer:1,why:"A seta aponta para a direita."},
 {q:"Qual opção mostra movimento de pernas?",visual:"🦵",options:[["👋","Acenar"],["👐","Abrir as mãos"],["🚶","Dar passos"]],answer:2,why:"Dar passos envolve os membros inferiores, com as adaptações necessárias."}
]}
};
const key=document.body.dataset.game;
const game=GAMES[key];
const byId=id=>document.getElementById(id);
const start=byId("start"),play=byId("play"),finish=byId("finish");
let pos=0,correct=0,step=0,firstTry=true,selectionLocked=false;
byId("title").textContent=game.title;
byId("area").textContent=game.area;
byId("intro-text").textContent=game.lead;
byId("lead-text").textContent=game.lead;
byId("hero-icon").textContent=game.icon;
byId("disclaimer").textContent=game.note;
document.title=game.title+" | SoulKids";
byId("audio").hidden=key!=="fono"||!("speechSynthesis" in window);
function say(){if(!("speechSynthesis" in window))return;window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(game.rounds[pos].q);speech.lang="pt-BR";speech.rate=.82;window.speechSynthesis.speak(speech);}
byId("audio").addEventListener("click",say);
function show(which){start.classList.toggle("hide",which!=="start");play.classList.toggle("hide",which!=="play");finish.classList.toggle("hide",which!=="finish");}
function makeChoice(glyph,label,i){const b=document.createElement("button");b.type="button";b.className="option";b.dataset.index=String(i);const span=document.createElement("span");span.className="glyph";span.setAttribute("aria-hidden","true");span.textContent=glyph;const txt=document.createElement("span");txt.textContent=label;b.append(span,txt);b.addEventListener("click",()=>choose(i,b));return b;}
function render(){
 const r=game.rounds[pos];step=0;firstTry=true;selectionLocked=false;byId("counter").textContent="Desafio "+(pos+1)+" de "+game.rounds.length;byId("progress").style.width=(((pos)/game.rounds.length)*100)+"%";
 byId("question").textContent=r.q;byId("visual").textContent=r.visual;byId("choices").replaceChildren();
 byId("feedback").hidden=true;byId("next").classList.add("hide");
 if(game.mode==="sequence"){
  const order=[1,2,0];for(const i of order)byId("choices").append(makeChoice(r.steps[i][0],r.steps[i][1],i));
  byId("step-label").textContent="Toque no passo 1 de 3";byId("step-label").hidden=false;
 } else {r.options.forEach((o,i)=>byId("choices").append(makeChoice(o[0],o[1],i)));byId("step-label").hidden=true;}
}
function respond(good,message){
 const el=byId("feedback");el.hidden=false;el.textContent=message;el.style.background=good?"#e4f7eb":"#fff4e2";el.setAttribute("role","status");
}
function choose(i,b){
 if(selectionLocked)return;
 const r=game.rounds[pos];
 if(game.mode==="sequence"){
  if(i!==step){respond(false,"Ainda não. Pense no que vem antes e tente novamente.");firstTry=false;return;}
  b.disabled=true;b.classList.add("good");step++;
  if(step===r.steps.length){selectionLocked=true;if(firstTry)correct++;respond(true,"Sequência organizada! Você completou os três passos.");byId("step-label").hidden=true;byId("next").classList.remove("hide");}
  else{byId("step-label").textContent="Agora, passo "+(step+1)+" de 3";respond(true,"Isso! Qual é o próximo passo?");}
 }else{
  if(i!==r.answer){b.classList.add("bad");firstTry=false;respond(false,"Essa não é a resposta esperada. Observe com calma e tente outra opção.");return;}
  selectionLocked=true;b.classList.add("good");if(firstTry)correct++;respond(true,r.why);byId("next").classList.remove("hide");
 }
}
function launch(){pos=0;correct=0;show("play");render();byId("question").focus();}
byId("begin").addEventListener("click",launch);
byId("again").addEventListener("click",launch);
byId("next").addEventListener("click",()=>{
 pos++;if(pos<game.rounds.length){render();byId("question").focus();}
 else{show("finish");byId("progress").style.width="100%";byId("result").textContent=correct+" de "+game.rounds.length+" desafios concluídos sem tentativas adicionais.";byId("finish-title").focus();}
});
