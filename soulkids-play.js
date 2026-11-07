"use strict";
(() => {
  // SoulKids Play — Aventura na Clínica
  // Jogo recreativo de tabuleiro, sem cadastro, analytics ou dados clínicos.
  const categoryInfo = {
    corpo:{label:"Corpo",icon:"💪",color:"blue",badge:"Selo Corpo"},
    imaginacao:{label:"Imaginação",icon:"💡",color:"green",badge:"Selo Imaginação"},
    emocao:{label:"Emoção",icon:"❤️",color:"yellow",badge:"Selo Emoção"},
    desafio:{label:"Desafio",icon:"❗",color:"red",badge:"Selo Desafio"},
    fono:{label:"Fono",icon:"💬",color:"purple",badge:"Selo Comunicação"},
    surpresa:{label:"Surpresa",icon:"⭐",color:"gold",badge:"Selo Surpresa"}
  };
  const track = [
    "corpo","imaginacao","emocao","desafio","fono","surpresa",
    "imaginacao","fono","corpo","emocao","surpresa","desafio",
    "fono","corpo","surpresa","imaginacao","desafio","emocao",
    "surpresa","desafio","imaginacao","fono","emocao","corpo",
    "desafio","surpresa","emocao","corpo","fono","imaginacao"
  ];
  // 30 cartas, cinco de cada categoria. As propostas admitem ajuda e adaptação.
  const decks = {
    corpo:[
      {title:"Três pulinhos",action:"Pule três vezes ou movimente os braços três vezes.",icon:"🦘"},
      {title:"Estátua da turma",action:"Faça uma pose e segure por alguns segundos, com apoio se precisar.",icon:"🗿"},
      {title:"Alto e baixo",action:"Mostre algo lá em cima e algo lá embaixo.",icon:"🙌"},
      {title:"Passos de animal",action:"Escolha um animal e imite seus movimentos ou gestos.",icon:"🐻"},
      {title:"Ritmo das palmas",action:"Faça duas palmas e uma pausa. Quem está junto pode acompanhar.",icon:"👏"}
    ],
    imaginacao:[
      {title:"Quem sou eu?",action:"Finja que é um animal. Vale falar, gesticular ou apontar.",icon:"🐱"},
      {title:"Objeto mágico",action:"Imagine outro jeito de usar uma almofada.",icon:"🪄"},
      {title:"Era uma vez...",action:"Comece uma história com: 'Um dia, na SoulKids...'",icon:"📖"},
      {title:"Superpoder",action:"Invente um poder e faça uma pose.",icon:"🦸"},
      {title:"Uma aventura",action:"Imagine que o corredor virou uma floresta. O que aparece?",icon:"🌳"}
    ],
    emocao:[
      {title:"Rostinho expressivo",action:"Mostre ou escolha um rosto alegre, triste ou bravo.",icon:"😊"},
      {title:"Como estou?",action:"Diga, aponte ou mostre uma emoção de hoje.",icon:"💛"},
      {title:"Pausa tranquila",action:"Se quiser, respire devagar ou faça um pequeno descanso.",icon:"🌿"},
      {title:"Algo de que gosto",action:"Conte ou mostre algo que faz você sorrir.",icon:"🥰"},
      {title:"Amigo do lado",action:"Como você ajudaria um amigo que está chateado?",icon:"🤝"}
    ],
    desafio:[
      {title:"Poça no corredor!",action:"Uma poça bloqueou a passagem. Volte duas casas para contorná-la.",icon:"💦",effect:{move:-2}},
      {title:"Chegou na hora!",action:"Você chegou a tempo da brincadeira. Avance uma casa!",icon:"⏰",effect:{move:1}},
      {title:"O cone rolou!",action:"Um cone caiu na trilha. Volte uma casa para organizar o caminho.",icon:"🚧",effect:{move:-1}},
      {title:"Trabalho em equipe",action:"A turma abriu uma passagem. Avance duas casas!",icon:"🙌",effect:{move:2}},
      {title:"Hora de reorganizar",action:"A sala precisa de espaço. Volte uma casa e procure outra rota.",icon:"🧩",effect:{move:-1}}
    ],
    fono:[
      {title:"Mostre o que quer",action:"Escolha algo e comunique por fala, gesto, olhar ou figura.",icon:"🗣️"},
      {title:"Duas descobertas",action:"Nomeie ou aponte duas coisas da clínica.",icon:"👀"},
      {title:"Posso brincar?",action:"Faça um pedido do seu jeito, com ou sem ajuda.",icon:"🧸"},
      {title:"Escolha da turma",action:"Escolha entre brincar de bola ou de argolas. Mostre sua escolha.",icon:"🎈"},
      {title:"Som ou movimento",action:"Escolha um som, gesto ou expressão e convide alguém a repetir.",icon:"🎶"}
    ],
    surpresa:[
      {title:"Ravi apareceu!",action:"'Boa, jovem!' A turma encontrou um atalho. Avance uma casa.",icon:"🌟",effect:{move:1}},
      {title:"Ajuda da Ray",action:"Ray encontrou um passe de ajuda. Guarde-o para evitar um retrocesso.",icon:"🛡️",effect:{shield:1}},
      {title:"Estrela brilhante",action:"Você descobriu uma estrela extra para a coleção!",icon:"✨",effect:{stars:2}},
      {title:"Bilhete especial",action:"Você pode jogar o dado outra vez após esta carta.",icon:"🎲",effect:{extraRoll:true}},
      {title:"Porta secreta",action:"Uma passagem apareceu! Avance duas casas.",icon:"🚪",effect:{move:2}}
    ]
  };
  const characterInfo = {
    ritinha:"Ritinha",tonico:"Tonico",luca:"Luca",lia:"Lia",maya:"Maya"
  };
  const $ = id => document.getElementById(id);
  const ui = {
    setup:$("setup-screen"),game:$("board-game"),board:$("board-frame"),track:$("track-tiles"),
    route:$("route-path"),shadow:$("route-shadow"),dashes:$("route-dashes"),token:$("player-token"),die:$("dice-button"),cube:$("dice-cube"),
    diceStatus:$("dice-status"),turnStatus:$("turn-status"),characterName:$("chosen-name"),
    stars:$("stars-total"),shields:$("shields-total"),position:$("position-total"),
    card:$("card-modal"),cardCategory:$("card-category"),cardTitle:$("card-title"),
    cardText:$("card-text"),cardIcon:$("card-icon"),cardEffect:$("card-effect"),
    cardDone:$("card-done"),cardHelp:$("card-help"),cardShield:$("card-shield"),
    badgeGrid:$("badge-grid"),rewardNotice:$("reward-notice"),end:$("finish-modal"),
    endBadges:$("finish-badges"),endStars:$("finish-stars"),replay:$("replay"),
    sound:$("sound-toggle"),quiet:$("quiet-toggle"),guide:$("guide-print"),
    legend:$("legend-list"),chosenIcon:$("chosen-avatar")
  };
  if(Object.values(ui).some(item=>!item))return;

  const state = {
    selected:"ritinha",position:0,stars:0,shields:0,
    badges:new Set(),used:{},ready:false,moving:false,cardOpen:false,
    won:false,extraRoll:false,turns:0,activeCard:null,
    soundOn:false,musicOn:false,context:null,musicTimer:null,musicNote:0,
    reduced:window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches??false,
    movementToken:0
  };
  const COLS=6,ROWS=5;
  const spaces=Array.from({length:30},(_,i)=>{
    const row=Math.floor(i/COLS),col=i%COLS;
    const mapped=row%2===0?col:COLS-1-col;
    return {x:10+mapped*16,y:83-row*15,n:i+1,category:track[i]};
  });
  const begin={x:10,y:94};
  const end={x:96,y:15};
  const currentPoint=position=>position<=0?begin:spaces[Math.min(30,position)-1];

  function decorateBoard(){
    // Conecta as 30 casas numa trilha única e clara, sem falsa numeração.
    const p=[begin,...spaces,end];
    const d=p.map((v,i)=>(i?"L":"M")+(v.x*10).toFixed(1)+" "+(v.y*6.2).toFixed(1)).join(" ");
    ui.route.setAttribute("d",d);
    ui.shadow.setAttribute("d",d);
    ui.dashes.setAttribute("d",d);
    ui.track.replaceChildren();
    const fragment=document.createDocumentFragment();
    spaces.forEach(space=>{
      const cfg=categoryInfo[space.category],button=document.createElement("button");
      button.type="button";button.className="path-tile tile-"+cfg.color;
      button.style.left=space.x+"%";button.style.top=space.y+"%";
      button.setAttribute("aria-label","Casa "+space.n+": "+cfg.label);
      button.title="Casa "+space.n+" — "+cfg.label;
      const symbol=document.createElement("span");symbol.className="tile-symbol";symbol.textContent=cfg.icon;
      const num=document.createElement("span");num.className="tile-number";num.textContent=String(space.n);
      button.appendChild(symbol);button.appendChild(num);
      button.addEventListener("click",()=>tellTile(space));
      fragment.appendChild(button);
    });
    ui.track.appendChild(fragment);
    ui.legend.replaceChildren();
    Object.entries(categoryInfo).forEach(([cat,cfg])=>{
      const el=document.createElement("span");el.className="legend-chip";
      el.innerHTML="";el.textContent=cfg.icon+" "+cfg.label;
      el.dataset.category=cat;ui.legend.appendChild(el);
    });
  }
  function tellTile(space){
    if(!state.ready||state.moving||state.cardOpen)return;
    ui.turnStatus.textContent="Casa "+space.n+": "+categoryInfo[space.category].label+". Jogue o dado para chegar lá!";
  }
  function renderPiece(){
    const point=currentPoint(state.position);
    ui.token.style.left=point.x+"%";ui.token.style.top=point.y+"%";
    ui.position.textContent=state.position+"/30";
    ui.token.setAttribute("aria-label","Peça de "+characterInfo[state.selected]+" na "+(state.position===0?"largada":"casa "+state.position));
    ui.token.className="player-token char-"+state.selected;
  }
  function renderRewards(){
    ui.stars.textContent=String(state.stars);
    ui.shields.textContent=String(state.shields);
    ui.badgeGrid.replaceChildren();
    Object.entries(categoryInfo).forEach(([cat,cfg])=>{
      const badge=document.createElement("span");
      const got=state.badges.has(cat);
      badge.className="badge-slot"+(got?" is-earned":"");
      badge.textContent=(got?"🏅 ":"◌ ")+cfg.label;
      badge.setAttribute("aria-label",cfg.badge+(got?" conquistado":" ainda não conquistado"));
      ui.badgeGrid.appendChild(badge);
    });
  }
  function announce(text){
    ui.turnStatus.textContent=text;
  }
  function selectCharacter(name){
    if(!characterInfo[name])return;
    state.selected=name;
    document.querySelectorAll("[data-character]").forEach(btn=>{
      const selected=btn.dataset.character===name;
      btn.setAttribute("aria-pressed",String(selected));
      btn.classList.toggle("is-selected",selected);
    });
    ui.characterName.textContent=characterInfo[name];
    ui.chosenIcon.className="portrait char-"+name;
    renderPiece();
  }

  function audioContext(){
    const API=window.AudioContext||window.webkitAudioContext;
    if(!API||!state.soundOn)return null;
    try{
      if(!state.context)state.context=new API();
      state.context.resume?.().catch?.(()=>{});
      return state.context;
    }catch(_){return null;}
  }
  function playTone(midi,duration=0.14,volume=0.014,offset=0,type="sine"){
    const c=audioContext();if(!c)return;
    try{
      const oscillator=c.createOscillator(),gain=c.createGain(),when=c.currentTime+offset;
      oscillator.type=type;
      oscillator.frequency.setValueAtTime(440*Math.pow(2,(midi-69)/12),when);
      gain.gain.setValueAtTime(.0001,when);
      gain.gain.exponentialRampToValueAtTime(volume,when+.016);
      gain.gain.exponentialRampToValueAtTime(.0001,when+duration);
      oscillator.connect(gain);gain.connect(c.destination);
      oscillator.start(when);oscillator.stop(when+duration+.025);
    }catch(_){}
  }
  function sfx(type){
    if(!state.soundOn)return;
    if(type==="step"){playTone(39,.085,.013,0,"triangle");playTone(47,.065,.007,.025,"sine");}
    if(type==="roll"){playTone(67,.08,.017);playTone(72,.11,.018,.07);}
    if(type==="card"){playTone(69,.12,.018);playTone(76,.15,.018,.12);}
    if(type==="star"){playTone(72,.13,.019);playTone(79,.19,.019,.12);}
    if(type==="oops"){playTone(55,.14,.015,0,"triangle");playTone(52,.18,.014,.12,"triangle");}
    if(type==="finish"){[60,64,67,72].forEach((n,i)=>playTone(n,.22,.019,i*.13));}
  }
  const tune=[67,72,74,72,69,67,64,67,69,74,76,74,72,69,67,64];
  function stopMusic(){
    if(state.musicTimer!==null){clearTimeout(state.musicTimer);state.musicTimer=null;}
  }
  function musicBeat(){
    stopMusic();
    if(!state.soundOn||!state.musicOn||ui.game.hidden||state.won||document.hidden)return;
    const index=state.musicNote++%tune.length;
    playTone(tune[index],.20,.006,0,"triangle");
    if(index%4===0)playTone(48,.33,.0035,0,"sine");
    state.musicTimer=setTimeout(musicBeat,345);
  }
  function setSound(value){
    state.soundOn=Boolean(value);
    ui.sound.setAttribute("aria-pressed",String(state.soundOn));
    ui.sound.textContent=state.soundOn?"🔊 Som ligado":"🔇 Som desligado";
    if(!state.soundOn){stopMusic();}
    else {musicBeat();}
  }
  function setMusic(value){
    state.musicOn=Boolean(value);
    ui.sound.dataset.music=String(state.musicOn);
    if(state.soundOn){stopMusic();if(state.musicOn)musicBeat();}
  }

  function drawDice(){
    ui.cube.dataset.value="1";
    ui.cube.classList.add("is-spinning");
    ui.die.disabled=false;
    ui.die.setAttribute("aria-label","Dado girando. Toque para parar.");
    ui.diceStatus.textContent="Toque no dado para parar!";
  }
  function stopDice(value){
    ui.cube.classList.remove("is-spinning");
    ui.cube.dataset.value=String(value);
    ui.die.disabled=true;
    ui.die.setAttribute("aria-label","O dado parou no número "+value);
    ui.diceStatus.textContent="Saiu "+value+"!";
    sfx("roll");
  }
  function moveSteps(destination,onDone){
    const to=Math.max(0,Math.min(30,destination));
    state.moving=true;
    const token=++state.movementToken;
    const walk=()=>{
      if(token!==state.movementToken)return;
      if(state.position===to){
        state.moving=false;
        renderPiece();onDone();return;
      }
      state.position+=(state.position<to?1:-1);
      renderPiece();sfx("step");
      setTimeout(walk,state.reduced?35:240);
    };
    setTimeout(walk,state.reduced?35:150);
  }
  function takeCard(category){
    const deck=decks[category];
    if(!state.used[category]||state.used[category].length===deck.length)state.used[category]=[];
    const available=deck.map((_,i)=>i).filter(i=>!state.used[category].includes(i));
    const index=available[Math.floor(Math.random()*available.length)];
    state.used[category].push(index);
    return deck[index];
  }
  function effectText(effect){
    if(!effect)return "Você participou! Ganhe uma estrela.";
    const parts=[];
    if(effect.move)parts.push((effect.move>0?"Avance ":"Volte ")+Math.abs(effect.move)+" casa"+(Math.abs(effect.move)===1?"":"s"));
    if(effect.stars)parts.push("+"+effect.stars+" estrelas extras");
    if(effect.shield)parts.push("+1 passe de ajuda");
    if(effect.extraRoll)parts.push("Jogue o dado novamente");
    return parts.join(" · ");
  }
  function openCard(){
    const cat=track[state.position-1],info=categoryInfo[cat],card=takeCard(cat);
    state.activeCard={cat,card};
    state.cardOpen=true;
    ui.card.hidden=false;
    ui.card.dataset.category=cat;
    ui.cardCategory.textContent=info.icon+" "+info.label;
    ui.cardTitle.textContent=card.title;
    ui.cardText.textContent=card.action;
    ui.cardIcon.textContent=card.icon;
    ui.cardEffect.textContent=effectText(card.effect);
    const backwards=card.effect?.move<0;
    ui.cardShield.hidden=!(backwards&&state.shields>0);
    ui.cardDone.focus?.({preventScroll:true});
    announce("Carta "+info.label+": "+card.title);
    sfx("card");
  }
  function collectBadge(category){
    if(state.badges.has(category))return false;
    state.badges.add(category);
    const cfg=categoryInfo[category];
    ui.rewardNotice.textContent="🏅 Novo adesivo: "+cfg.badge+"!";
    renderRewards();return true;
  }
  function resolveCard(useShield=false){
    if(!state.cardOpen||!state.activeCard)return;
    const {cat,card}=state.activeCard;
    state.cardOpen=false;state.activeCard=null;ui.card.hidden=true;
    state.stars+=1+(card.effect?.stars||0);
    const earned=collectBadge(cat);
    let move=card.effect?.move||0;
    if(move<0&&useShield&&state.shields>0){
      state.shields--;move=0;
      ui.rewardNotice.textContent="🛡️ Passe usado: o retrocesso foi evitado!";
    } else if(card.effect?.shield) {
      state.shields++;
      ui.rewardNotice.textContent="🛡️ Novo passe de ajuda!";
    } else if(earned) {
      // Mantém o aviso do selo, sem somar recompensas clínicas.
    } else if(card.effect?.stars) {
      ui.rewardNotice.textContent="⭐ Estrelas extras na coleção!";
    } else {
      ui.rewardNotice.textContent="⭐ Obrigado por participar!";
    }
    renderRewards();sfx("star");
    state.extraRoll=Boolean(card.effect?.extraRoll);
    if(move!==0){
      const target=Math.max(0,Math.min(30,state.position+move));
      announce(move>0?"Atalho! Vamos avançar.":"Um imprevisto! Voltamos algumas casas.");
      sfx(move<0?"oops":"star");
      moveSteps(target,afterCard);
    }else{
      afterCard();
    }
  }
  function afterCard(){
    if(state.position>=30){finishGame();return;}
    state.ready=true;state.moving=false;
    drawDice();
    announce(state.extraRoll?"🎲 Rodada extra! Toque no dado novamente.":"Sua vez! Toque no dado para descobrir o próximo caminho.");
    state.extraRoll=false;
    ui.die.focus?.({preventScroll:true});
  }
  function roll(){
    if(!state.ready||state.moving||state.cardOpen||state.won||ui.game.hidden)return;
    const value=1+Math.floor(Math.random()*6);
    state.ready=false;state.turns++;
    stopDice(value);
    announce(characterInfo[state.selected]+" vai caminhar "+value+" casa"+(value===1?"":"s")+"!");
    moveSteps(state.position+value,()=>{
      if(state.position<1){afterCard();return;}
      openCard();
    });
  }
  function finishGame(){
    state.won=true;state.ready=false;stopMusic();
    ui.end.hidden=false;
    ui.endBadges.textContent="Adesivos: "+state.badges.size+" de 6";
    ui.endStars.textContent=state.stars+" estrelas de descoberta";
    ui.rewardNotice.textContent="🎉 Você chegou ao Espaço da Conquista!";
    sfx("finish");
    ui.replay.focus?.({preventScroll:true});
  }
  function startGame(withSound){
    state.position=0;state.stars=0;state.shields=0;state.badges.clear();
    state.used={};state.ready=true;state.won=false;state.moving=false;
    state.cardOpen=false;state.turns=0;state.activeCard=null;
    state.extraRoll=false;state.movementToken++;
    ui.setup.hidden=true;ui.game.hidden=false;ui.card.hidden=true;ui.end.hidden=true;
    ui.rewardNotice.textContent="Complete cartas e descubra adesivos da turma!";
    ui.characterName.textContent=characterInfo[state.selected];
    state.musicOn=Boolean(withSound);
    setSound(withSound);
    renderRewards();renderPiece();drawDice();
    announce("O dado está girando. Toque nele para parar e começar a aventura.");
    ui.die.focus?.({preventScroll:true});
  }
  function reset(){
    stopMusic();state.ready=false;state.movementToken++;
    ui.card.hidden=true;ui.end.hidden=true;ui.game.hidden=true;ui.setup.hidden=false;
  }

  decorateBoard();
  document.querySelectorAll("[data-character]").forEach(btn=>{
    btn.addEventListener("click",()=>selectCharacter(btn.dataset.character));
  });
  $("play-sound")?.addEventListener("click",()=>startGame(true));
  $("play-silent")?.addEventListener("click",()=>startGame(false));
  ui.die.addEventListener("click",roll);
  ui.cardDone.addEventListener("click",()=>resolveCard(false));
  ui.cardHelp.addEventListener("click",()=>resolveCard(false));
  ui.cardShield.addEventListener("click",()=>resolveCard(true));
  ui.replay.addEventListener("click",reset);
  ui.sound.addEventListener("click",()=>{
    state.musicOn=!state.soundOn?true:state.musicOn;
    setSound(!state.soundOn);
  });
  ui.quiet.addEventListener("click",()=>{
    state.reduced=!state.reduced;
    document.body.classList.toggle("quiet",state.reduced);
    ui.quiet.setAttribute("aria-pressed",String(state.reduced));
    ui.quiet.textContent=state.reduced?"✓ Modo tranquilo":"🌿 Modo tranquilo";
  });
  ui.guide.addEventListener("click",()=>window.print());
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){stopMusic();}
    else if(state.soundOn&&state.musicOn&&state.ready&&!ui.game.hidden)musicBeat();
  });
  window.addEventListener("pagehide",stopMusic);
  if(state.reduced){
    document.body.classList.add("quiet");
    ui.quiet.setAttribute("aria-pressed","true");
    ui.quiet.textContent="✓ Modo tranquilo";
  }
  selectCharacter("ritinha");
})();