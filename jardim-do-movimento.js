"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const controls = [...document.querySelectorAll("[data-garden-open]")];
  const panels = [...document.querySelectorAll("[data-garden-panel]")];
  const guide = $("guide-message");
  const voicePlayer = window.SoulKidsVozRitinha;
  const voiceButton = $("ritinha-ouvir");
  let currentRoom = null;
  const voiceClip = () => "jardim-" + (currentRoom || "entrada");
  if (voiceButton && voicePlayer) {
    voicePlayer.subscribe(() => {
      const active = voicePlayer.isPlaying(voiceClip());
      voiceButton.setAttribute("aria-pressed", String(active));
      voiceButton.textContent = active ? "⏹ Parar a Ritinha" : "🔊 Ouvir a Ritinha";
      voiceButton.setAttribute("aria-label", active ? "Parar voz da Ritinha" : "Ouvir o convite da Ritinha");
    });
    voiceButton.addEventListener("click", () => {
      stopRhythm();
      voicePlayer.toggle(voiceClip());
    });
  } else if (voiceButton) {
    voiceButton.hidden = true;
  }

  if (!controls.length || !panels.length || !guide) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const musicReady = Boolean(window.AudioContext || window.webkitAudioContext);
  const prompts = {
    trilha: [
      {emoji:"🟡",title:"Caminho de cores",text:"Escolha duas cores no chão e imagine um caminho entre elas.",adapt:"Aponte as cores, mova um brinquedo ou invente a trilha numa folha.",name:"Ritinha",says:"Vamos seguir a trilha? Você pode ir do seu jeito!"},
      {emoji:"🟠",title:"Ilhas de papel",text:"Com ajuda de um adulto, marque algumas ilhas no chão e decida onde fazer uma parada.",adapt:"Escolha as ilhas com o olhar, com gestos ou movendo peças sobre a mesa.",name:"Luca",says:"Eu escolhi a ilha redonda! Qual você quer conhecer?"},
      {emoji:"🌿",title:"Caminho dos sentidos",text:"Caminhe por um trajeto seguro ou explore diferentes objetos ao longo de uma mesa.",adapt:"É possível percorrer com apoio, usando o andador ou apenas observando e escolhendo.",name:"Maya",says:"Vamos organizar o espaço para todo mundo poder participar."},
      {emoji:"⭐",title:"Siga a linha",text:"Imagine uma linha no chão e siga até um ponto de chegada do seu jeito.",adapt:"Use o dedo para acompanhar uma linha desenhada ou dê instruções a um boneco.",name:"Tonico",says:"Posso escolher esse caminho?"},
      {emoji:"🛑",title:"Agora pausa!",text:"Combine um sinal para mover e outro para parar. Alterne como preferir.",adapt:"Vale piscar, apontar, levantar um cartão ou movimentar só uma parte do corpo.",name:"Lia",says:"Hoje eu quero parar um pouquinho. Depois posso continuar!"},
      {emoji:"🌈",title:"Você cria a trilha",text:"Escolha o começo, o meio e o final de um caminho imaginário para a turma.",adapt:"Você pode desenhar três figuras, escolher cartões ou contar como a trilha seria.",name:"Ritinha",says:"Agora quero conhecer um caminho inventado por você!"}
    ],
    espelho: [
      {emoji:"🙆",title:"Braços para cima",text:"Se quiser, estenda os braços em direção ao céu, devagar.",adapt:"Você pode elevar uma mão, olhar para cima, imaginar ou observar a pose.",name:"Ritinha",says:"Quer tentar uma pose comigo?"},
      {emoji:"🙋",title:"Mão na cabeça",text:"Experimente encostar a mão na cabeça ou mostre onde ela está.",adapt:"Aponte em uma imagem ou peça ajuda para explorar o movimento.",name:"Tonico",says:"Cabeça! Eu também posso apontar."},
      {emoji:"↔️",title:"Uma pose de cada lado",text:"Estique um braço para um lado, depois experimente o outro.",adapt:"Vale girar os olhos, mover a cabeça, apontar ou escolher o lado com figuras.",name:"Lia",says:"Eu vou escolher por qual lado começar!"},
      {emoji:"🦋",title:"Abra e feche",text:"Abra os braços e depois aproxime-os, como asas de borboleta.",adapt:"Pode abrir as mãos, tocar os dedos ou imaginar a borboleta voando.",name:"Luca",says:"Minha borboleta vai voar bem alto!"},
      {emoji:"🦵",title:"Descubra o joelho",text:"Localize seu joelho e, se confortável, aproxime a mão dele.",adapt:"Indique o joelho num desenho, numa boneca ou apenas com o olhar.",name:"Maya",says:"Cada pessoa encontra um jeito de mostrar a posição."},
      {emoji:"🪞",title:"Uma pose só sua",text:"Crie uma posição do corpo e convide alguém para observar ou inventar outra.",adapt:"Uma expressão, um gesto pequeno ou uma escolha por cartão também é uma pose.",name:"Ritinha",says:"A pose pode ser diferente da minha. Quero ver sua ideia!"}
    ],
    ritmo: [
      {emoji:"👏",title:"Palma e passo",text:"Uma palma e um passo, no seu ritmo.",adapt:"Substitua o passo por um gesto, um toque ou uma escolha visual.",name:"Ritinha",says:"Vamos inventar um ritmo? Você pode acompanhar como quiser.",sequence:["palma","passo"]},
      {emoji:"🥁",title:"Duas palmas e pausa",text:"Faça duas palmas e depois uma pausa tranquila.",adapt:"Use dois toques na mesa, duas piscadas ou figuras para acompanhar.",name:"Luca",says:"Olha só: pá, pá... e agora uma pausa!",sequence:["palma","palma","pausa"]},
      {emoji:"🟢",title:"Som e silêncio",text:"Faça um som leve, uma pausa e outro som.",adapt:"Pode usar um som vocal suave, um instrumento adaptado ou só observar.",name:"Tonico",says:"Posso repetir? Som... silêncio... som!",sequence:["som","pausa","som"]},
      {emoji:"↔️",title:"De um lado para o outro",text:"Escolha um lado e depois o outro, acompanhando a sequência.",adapt:"Olhe para os lados, mova um dedo ou use dois cartões.",name:"Lia",says:"Vou escolher como quero fazer o ritmo!",sequence:["esquerda","direita","pausa"]},
      {emoji:"🌼",title:"Uma batida e outra",text:"Alterne dois sons ou dois gestos, sem precisar se apressar.",adapt:"Escolha com o olhar, com ajuda ou use uma parte do corpo confortável.",name:"Maya",says:"A turma pode usar sons e movimentos diferentes!",sequence:["toque","toque","pausa","toque"]},
      {emoji:"🌈",title:"A turma inventa",text:"Experimente palma, pausa, passo e escolha como repetir.",adapt:"Você pode montar a sequência com figuras e pedir que alguém demonstre.",name:"Ritinha",says:"Agora a sequência pode ser inventada por você!",sequence:["palma","pausa","passo","palma"]}
    ]
  };
  // Mensagens curtas para a criança; orientações completas permanecem em "Para quem acompanha".
  const childCopy = {
    trilha:[
      ["Vamos pelas cores?","Escolha duas cores!"],
      ["Eu vou pular!","Qual ilha você escolhe?"],
      ["Tem lugar para todo mundo!","Escolha seu caminho!"],
      ["Essa linha!","Siga com o corpo ou com o dedo."],
      ["Vou fazer uma pausa.","Mexer, parar, brincar!"],
      ["Sua vez de inventar!","Crie uma trilha para nós."]
    ],
    espelho:[
      ["Faz uma pose comigo?","Braços lá em cima!"],
      ["Olha a cabeça!","Aponte sua cabeça!"],
      ["Você escolhe!","Um lado, depois o outro!"],
      ["Vamos voar?","Abra e feche os braços!"],
      ["Cadê o joelho?","Mostre onde fica o joelho!"],
      ["Qual é sua pose?","Invente um movimento!"]
    ],
    ritmo:[
      ["Quer fazer um ritmo?","Palma, passo!"],
      ["Agora vem a pausa!","Palma, palma, pausa."],
      ["Som e silêncio!","Som, pausa, som."],
      ["Escolhe um lado!","Esquerda, direita, pausa."],
      ["Todo mundo junto!","Toque, toque, pausa, toque."],
      ["Sua sequência!","Palma, pausa, passo, palma."]
    ]
  };
  const positions = {trilha:0,espelho:0,ritmo:0};
  const labels={
    trilha:"🔊 Ouvir a brincadeira",
    espelho:"🔊 Ouvir a proposta",
    ritmo:"🔊 Ouvir a proposta"
  };
  if (voicePlayer) {
    voicePlayer.subscribe(()=>{
      for(const room of Object.keys(labels)){
        const button=$(room==="ritmo"?"ritmo-speak":room+"-listen");
        const active=voicePlayer.isPlaying("jardim-"+room+"-"+positions[room]);
        button.setAttribute("aria-pressed",String(active));
        button.textContent=active?"⏹ Parar a fala":labels[room];
      }
    });
  } else {
    ["trilha-listen","espelho-listen","ritmo-speak"].forEach(id=>{$(id).hidden=true;});
  }
  $("ritmo-speak").addEventListener("click",()=>{
    if(playing)stopRhythm();
    voicePlayer?.toggle("jardim-ritmo-"+positions.ritmo);
  });
  const roomFalas = {
    trilha:"Ritinha: Vamos pela trilha?",
    espelho:"Ritinha: Faz uma pose comigo?",
    ritmo:"Ritinha: Qual ritmo vamos fazer?"
  };
  const symbols = {
    palma:["👏",440],passo:["👣",330],pausa:["⏸",null],som:["🔔",520],
    esquerda:["⬅️",392],direita:["➡️",490],toque:["☝️",450]
  };
  const STORAGE = "soulkids-mundo-ritinha-v1";
  const timeouts = [];
  let ctx = null;
  let playing = false;

  function registerVisit() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE) || "{}");
      const obj = data && typeof data === "object" && !Array.isArray(data) ? data : {};
      const zones = Array.isArray(obj.zones) ? obj.zones.filter(z => typeof z === "string") : [];
      if (!zones.includes("movimento")) zones.push("movimento");
      localStorage.setItem(STORAGE,JSON.stringify({...obj,zones}));
    } catch (_) { /* A experiência não depende do armazenamento. */ }
  }
  function stopRhythm() {
    timeouts.splice(0).forEach(id => window.clearTimeout(id));
    playing=false;
    $("ritmo-stop").hidden=true;
    $("ritmo-listen").disabled=false;
    document.querySelectorAll(".beat").forEach(el=>el.classList.remove("current"));
    if(ctx && ctx.state==="running") {
      try {ctx.suspend();} catch (_) {}
    }
  }
  function render(room) {
    const item=prompts[room][positions[room]];
    for(const [part,value] of Object.entries({
      "character":item.name,"says":childCopy[room][positions[room]][0],
      "title":item.title,"text":childCopy[room][positions[room]][1],"adapt":item.adapt
    })){
      $(room+"-"+part).textContent=value;
    }
    // Retratos individuais da turma, aprovados pelo usuário.
    // Tonico é o menino de cabelo azul, com camisa verde.
    const image=$(room+"-art");
    if(image){
      const isRitinha=item.name==="Ritinha";
      const mood=(room==="espelho"&&positions.espelho===5)?"calmo":"feliz";
      const people={Luca:"luca",Tonico:"tonico",Lia:"lia",Maya:"maya"};
      const actor=people[item.name];
      const art=isRitinha
        ? "/ritinha-"+mood+".webp?v=20261014-oficial"
        : "/movimento-"+actor+".webp?v=20261014-turma";
      image.parentElement.dataset.artKind=isRitinha?"ritinha":"personagem";
      if(image.getAttribute("src")!==art) image.setAttribute("src",art);
    }
    if(room==="ritmo"){
      const beats=$("rhythm-beats");
      beats.replaceChildren();
      for(const name of item.sequence) {
        const [icon]=symbols[name];
        const b=document.createElement("span");
        b.className="beat";
        b.setAttribute("aria-label",name);
        const symbol=document.createElement("strong");
        symbol.textContent=icon;
        const caption=document.createElement("span");
        caption.textContent=name;
        b.append(symbol,caption);
        beats.appendChild(b);
      }
      beats.setAttribute("aria-label",item.sequence.join(", "));
    }
  }
  function openRoom(room, focus=false) {
    if(!(room in prompts))return;
    voicePlayer?.stop();
    currentRoom = room;
    stopRhythm();
    registerVisit();
    controls.forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.gardenOpen===room)));
    panels.forEach(p=>{p.hidden=p.dataset.gardenPanel!==room;});
    guide.textContent=roomFalas[room];
    render(room);
    const p=$("painel-"+room);
    p.scrollIntoView?.({behavior:reducedMotion?"auto":"smooth",block:"start"});
    if(focus){
      const title=p.querySelector("h3");
      if(title){title.tabIndex=-1;title.focus?.({preventScroll:true});}
    }
  }
  controls.forEach(b=>b.addEventListener("click",()=>openRoom(b.dataset.gardenOpen,true)));
  for(const room of Object.keys(prompts)){
    $(room+"-next").addEventListener("click",()=>{
      voicePlayer?.stop();
      if(playing)stopRhythm();
      positions[room]=(positions[room]+1)%prompts[room].length;
      render(room);
      registerVisit();
    });
    if(room!=="ritmo"){
      $(room+"-listen").addEventListener("click",()=>{
        voicePlayer?.toggle("jardim-"+room+"-"+positions[room]);
      });
    }
  }
  const listen=$("ritmo-listen");
  if(!musicReady)listen.textContent="▶️ Mostrar a sequência";
  function pulse(freq) {
    if(!freq || !ctx)return;
    try {
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();
      oscillator.type="sine";
      oscillator.frequency.value=freq;
      gain.gain.setValueAtTime(.025,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.14);
      oscillator.connect(gain);gain.connect(ctx.destination);
      oscillator.start();oscillator.stop(ctx.currentTime+.15);
    }catch(_){/* A sequência visual continua disponível mesmo sem som. */}
  }
  listen.addEventListener("click",()=>{
    stopRhythm();
    voicePlayer?.stop();
    const seq=prompts.ritmo[positions.ritmo].sequence;
    if(musicReady){
      try {
        ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
        ctx.resume?.();
      }catch(_){ctx=null;}
    }
    playing=true;listen.disabled=true;$("ritmo-stop").hidden=false;
    const beats=[...document.querySelectorAll(".beat")];
    seq.forEach((name,index)=>{
      timeouts.push(window.setTimeout(()=>{
        if(!playing)return;
        beats.forEach(el=>el.classList.remove("current"));
        beats[index]?.classList.add("current");
        pulse(symbols[name][1]);
      },index*670));
    });
    timeouts.push(window.setTimeout(stopRhythm,seq.length*670+350));
  });
  $("ritmo-stop").addEventListener("click",stopRhythm);
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){stopRhythm();}
  });
  window.addEventListener("pagehide",stopRhythm);
  const key=window.location?.hash?.replace("#","");
  if(key in prompts)openRoom(key);
})();
