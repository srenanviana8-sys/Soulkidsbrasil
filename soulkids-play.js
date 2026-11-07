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
    legend:$("legend-list"),chosenIcon:$("chosen-avatar"),
    opening:$("opening-screen"),selection:$("character-selection"),openingStart:$("arcade-music-start"),
    openingQuiet:$("arcade-quiet-start"),setupSound:$("setup-sound-toggle"),
    selectionAnnouncement:$("selection-announcement"),
    slotPicker:$("slot-picker"),selectionPrompt:$("selection-prompt"),
    scoreboard:$("player-scoreboard"),otherTokens:$("other-tokens"),turnLabel:$("turn-label"),
    finishPlayers:$("finish-players"),finishTitle:$("finish-title")
  };
  if(Object.values(ui).some(item=>!item))return;

  const state = {
    selected:"ritinha",position:0,stars:0,shields:0,
    playerCount:1,selectedSlots:["ritinha"],activeSlot:0,players:[],activeIndex:0,
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
  function saveActive(){
    const player=state.players[state.activeIndex];
    if(!player)return;
    player.position=state.position;player.stars=state.stars;
    player.shields=state.shields;player.badges=state.badges;
    player.extraRoll=state.extraRoll;
  }
  function loadActive(){
    const player=state.players[state.activeIndex];
    if(!player)return;
    state.selected=player.character;
    state.position=player.position;state.stars=player.stars;
    state.shields=player.shields;state.badges=player.badges;
    state.extraRoll=player.extraRoll;
    ui.characterName.textContent=characterInfo[state.selected];
    ui.chosenIcon.className="portrait char-"+state.selected;
    ui.turnLabel.textContent="Vez do Jogador "+(state.activeIndex+1);
  }
  function renderScoreboard(){
    ui.scoreboard.replaceChildren();
    if(!state.players.length)return;
    const fragment=document.createDocumentFragment();
    state.players.forEach((p,i)=>{
      const active=i===state.activeIndex;
      const position=active?state.position:p.position;
      const stars=active?state.stars:p.stars;
      const box=document.createElement("div");
      box.className="score-player"+(active?" is-active":"");
      box.setAttribute("aria-label","Jogador "+(i+1)+", "+characterInfo[p.character]+", casa "+position+(active?", sua vez":""));
      const face=document.createElement("span");
      face.className="portrait score-avatar char-"+p.character;
      face.setAttribute("aria-hidden","true");
      const copy=document.createElement("span");copy.className="score-copy";
      const name=document.createElement("strong");
      name.textContent=(active?"▶ ":"")+"J"+(i+1)+" · "+characterInfo[p.character];
      const detail=document.createElement("small");
      detail.textContent="Casa "+position+" · ⭐ "+stars;
      copy.appendChild(name);copy.appendChild(detail);
      box.appendChild(face);box.appendChild(copy);fragment.appendChild(box);
    });
    ui.scoreboard.appendChild(fragment);
  }
  function placeToken(node,position,i,character,walking=false,active=false){
    const point=currentPoint(position);
    // Deslocamentos leves permitem reconhecer peões que ocupam a mesma casa.
    const offset=state.players.length>1?(i%2===0?-2.0:2.0):0;
    const up=state.players.length>2?(i<2?-2.0:2.0):0;
    node.style.left=Math.max(5,Math.min(95,point.x+offset))+"%";
    node.style.top=Math.max(9,Math.min(95,point.y+up))+"%";
    node.className="player-token char-"+character+(walking?" is-walking":"")+(active?" is-active-turn":"");
    node.setAttribute("aria-label","Peão de "+characterInfo[character]+" na "+(position===0?"largada":"casa "+position));
  }
  function renderPiece(){
    placeToken(ui.token,state.position,state.activeIndex,state.selected,state.moving,true);
    ui.position.textContent=state.position+"/30";
    ui.otherTokens.replaceChildren();
    if(state.players.length>1){
      const fragment=document.createDocumentFragment();
      state.players.forEach((p,i)=>{
        if(i===state.activeIndex)return;
        const node=document.createElement("span");
        placeToken(node,p.position,i,p.character,false,false);
        fragment.appendChild(node);
      });
      ui.otherTokens.appendChild(fragment);
    }
    renderScoreboard();
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
    renderScoreboard();
  }
  function announce(text){ui.turnStatus.textContent=text;}
  function updateLobby(){
    document.querySelectorAll("[data-player-count]").forEach(btn=>{
      btn.setAttribute("aria-pressed",String(Number(btn.dataset.playerCount)===state.playerCount));
    });
    ui.slotPicker.replaceChildren();
    const fragment=document.createDocumentFragment();
    for(let i=0;i<state.playerCount;i++){
      const button=document.createElement("button");button.type="button";
      button.dataset.slot=String(i);
      button.setAttribute("aria-pressed",String(i===state.activeSlot));
      button.textContent="Jogador "+(i+1);
      const small=document.createElement("span");
      small.className=state.selectedSlots[i]?"slot-character":"slot-empty";
      small.textContent=state.selectedSlots[i]?characterInfo[state.selectedSlots[i]]:"Escolher";
      button.appendChild(small);
      button.addEventListener("click",()=>{
        state.activeSlot=i;updateLobby();
      });
      fragment.appendChild(button);
    }
    ui.slotPicker.appendChild(fragment);
    const open=state.selectedSlots.findIndex(x=>!x);
    const full=open<0;
    ui.selectionPrompt.textContent=full?
      (state.playerCount===1?"Personagem pronto!":"Turma completa! Você pode trocar qualquer personagem.") :
      "Jogador "+(state.activeSlot+1)+": escolha um personagem!";
    $("play-sound").disabled=!full;
    $("play-silent").disabled=!full;
    document.querySelectorAll("[data-character]").forEach(btn=>{
      const name=btn.dataset.character;
      const own=state.selectedSlots[state.activeSlot]===name;
      const taken=state.selectedSlots.some((other,i)=>i!==state.activeSlot&&other===name);
      btn.disabled=taken;
      btn.setAttribute("aria-pressed",String(own));
      btn.classList.toggle("is-selected",own);
    });
  }
  function changePlayerCount(count){
    if(!Number.isInteger(count)||count<1||count>4||!ui.game.hidden)return;
    state.playerCount=count;
    state.selectedSlots=count===1?["ritinha"]:Array(count).fill(null);
    state.activeSlot=0;
    state.selected="ritinha";
    ui.selectionAnnouncement.textContent=count===1?"⭐ Ritinha selecionada!":"🎮 Selecione o personagem do Jogador 1.";
    updateLobby();
    sfx("select");
  }
  function selectCharacter(name){
    if(!characterInfo[name]||!ui.game.hidden)return;
    if(state.selectedSlots.some((other,i)=>i!==state.activeSlot&&other===name)){
      ui.selectionAnnouncement.textContent=characterInfo[name]+" já está com outro jogador. Escolha outro amigo.";
      return;
    }
    state.selectedSlots[state.activeSlot]=name;state.selected=name;
    ui.characterName.textContent=characterInfo[name];
    ui.chosenIcon.className="portrait char-"+name;
    ui.selectionAnnouncement.textContent="⭐ Jogador "+(state.activeSlot+1)+": "+characterInfo[name]+"!";
    if(state.playerCount>1){
      const next=state.selectedSlots.findIndex(x=>!x);
      if(next>=0)state.activeSlot=next;
    }
    updateLobby();
    if(state.soundOn&&!ui.selection.hidden&&!ui.setup.hidden)sfx("select");
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
    if(type==="select"){playTone(77,.085,.012,0,"square");playTone(84,.12,.012,.083,"triangle");}
    if(type==="intro"){[64,69,72,76].forEach((n,i)=>playTone(n,.13,.013,i*.08,"triangle"));}
  }
  const tune=[67,72,74,72,69,67,64,67,69,74,76,74,72,69,67,64];
  // Melodia autoral criada especificamente para a seleção SoulKids Play:
  // timbres retrô de fliperama, linhas de baixo e chimbal sintetizado.
  // Não reproduz nenhuma composição de jogos comerciais.
  const selectTune=[
    76,79,83,79,74,79,81,79,
    76,83,86,83,79,76,74,71,
    72,76,79,76,71,76,78,76,
    74,78,81,78,76,74,71,74
  ];
  const selectBass=[48,53,55,50];
  function stopMusic(){
    if(state.musicTimer!==null){clearTimeout(state.musicTimer);state.musicTimer=null;}
  }
  function musicBeat(){
    stopMusic();
    const inSelection=!ui.setup.hidden&&!ui.selection.hidden;
    const inGame=!ui.game.hidden&&!state.won;
    if(!state.soundOn||!state.musicOn||(!inSelection&&!inGame)||document.hidden)return;
    if(inSelection){
      const idx=state.musicNote++%selectTune.length;
      const midi=selectTune[idx];
      playTone(midi,.155,.006,0,"square");
      if(idx%2===0)playTone(midi-12,.20,.0035,0,"triangle");
      if(idx%8===0)playTone(selectBass[(idx/8)%selectBass.length],.36,.007,0,"sine");
      // Contratempo percussivo leve, sem sample ou áudio de terceiros.
      if(idx%2===1)playTone(90,.026,.0017,0,"triangle");
      state.musicTimer=setTimeout(musicBeat,205);
    }else{
      const idx=state.musicNote++%tune.length;
      playTone(tune[idx],.20,.006,0,"triangle");
      if(idx%4===0)playTone(48,.33,.0035,0,"sine");
      state.musicTimer=setTimeout(musicBeat,345);
    }
  }
  function updateSoundButtons(){
    ui.sound.setAttribute("aria-pressed",String(state.soundOn));
    ui.sound.textContent=state.soundOn?"🔊 Som ligado":"🔇 Som desligado";
    const playing=state.soundOn&&state.musicOn;
    ui.setupSound.setAttribute("aria-pressed",String(playing));
    ui.setupSound.textContent=playing?"🎵 Música ligada":"🎵 Música desligada";
  }
  function setSound(value){
    state.soundOn=Boolean(value);
    updateSoundButtons();
    if(!state.soundOn){stopMusic();}
    else {state.musicNote=0;musicBeat();}
  }
  function setMusic(value){
    state.musicOn=Boolean(value);
    ui.sound.dataset.music=String(state.musicOn);
    updateSoundButtons();
    stopMusic();
    if(state.soundOn&&state.musicOn){state.musicNote=0;musicBeat();}
  }
  function openSelection(withMusic){
    if(ui.opening.hidden)return;
    ui.opening.hidden=true;
    ui.selection.hidden=false;
    state.musicOn=Boolean(withMusic);
    setSound(withMusic);
    if(withMusic)sfx("intro");
    // A primeira ativação de áudio vem deste toque, nunca do carregamento da página.
    const first=document.querySelector('[data-character="'+state.selected+'"]');
    first?.focus?.({preventScroll:true});
  }
  function toggleSelectionMusic(){
    const on=!(state.soundOn&&state.musicOn);
    state.musicOn=on;
    setSound(on);
    if(on)sfx("intro");
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
    const extra=state.extraRoll;
    state.extraRoll=false;
    if(!extra&&state.players.length>1){
      saveActive();
      state.activeIndex=(state.activeIndex+1)%state.players.length;
      loadActive();
      renderRewards();renderPiece();
      ui.rewardNotice.textContent="🎲 Agora é a vez de "+characterInfo[state.selected]+"!";
      if(state.soundOn)sfx("select");
    }
    drawDice();
    announce(extra?"🎲 Rodada extra de "+characterInfo[state.selected]+"!":
      "Jogador "+(state.activeIndex+1)+": vez de "+characterInfo[state.selected]+". Toque no dado!");
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
    saveActive();
    state.won=true;state.ready=false;state.moving=false;stopMusic();
    ui.end.hidden=false;
    ui.finishTitle.textContent=state.players.length>1?
      characterInfo[state.selected]+" chegou ao Espaço da Conquista!":
      "Você chegou ao Espaço da Conquista!";
    ui.endBadges.textContent="Adesivos: "+state.badges.size+" de 6";
    ui.endStars.textContent=state.stars+" estrelas de descoberta";
    ui.finishPlayers.replaceChildren();
    const frag=document.createDocumentFragment();
    state.players.forEach((player,i)=>{
      const row=document.createElement("div");
      row.className="finish-player"+(i===state.activeIndex?" is-finisher":"");
      row.textContent=(i===state.activeIndex?"🏆 ":"⭐ ")+"J"+(i+1)+" · "+characterInfo[player.character]+
        " · Casa "+player.position+" · "+player.stars+" estrelas";
      frag.appendChild(row);
    });
    ui.finishPlayers.appendChild(frag);
    ui.rewardNotice.textContent="🎉 A aventura da turma foi concluída!";
    sfx("finish");
    ui.replay.focus?.({preventScroll:true});
  }
  function startGame(withSound){
    if(state.selectedSlots.length!==state.playerCount||state.selectedSlots.some(x=>!x))return;
    state.players=state.selectedSlots.map(character=>({
      character,position:0,stars:0,shields:0,badges:new Set(),extraRoll:false
    }));
    state.activeIndex=0;
    state.used={};state.ready=true;state.won=false;state.moving=false;
    state.cardOpen=false;state.turns=0;state.activeCard=null;
    state.movementToken++;
    ui.setup.hidden=true;ui.game.hidden=false;ui.card.hidden=true;ui.end.hidden=true;
    loadActive();
    ui.rewardNotice.textContent="Cada jogador conquista seu próprio álbum de adesivos!";
    state.musicOn=Boolean(withSound);setSound(withSound);
    renderRewards();renderPiece();drawDice();
    announce("Jogador 1: vez de "+characterInfo[state.selected]+". Toque no dado!");
    ui.game.scrollIntoView?.({block:"start",behavior:state.reduced?"auto":"smooth"});
    ui.die.focus?.({preventScroll:true});
  }
  function reset(){
    stopMusic();state.ready=false;state.moving=false;state.movementToken++;
    ui.card.hidden=true;ui.end.hidden=true;ui.game.hidden=true;ui.setup.hidden=false;
    ui.opening.hidden=true;ui.selection.hidden=false;
    state.players=[];state.activeIndex=0;state.activeSlot=0;
    state.selected=state.selectedSlots[0]||"ritinha";state.position=0;
    state.stars=0;state.shields=0;state.badges=new Set();
    ui.characterName.textContent=characterInfo[state.selected];
    ui.chosenIcon.className="portrait char-"+state.selected;
    updateLobby();renderPiece();
    state.musicOn=state.soundOn;setSound(state.soundOn);
    ui.setup.scrollIntoView?.({block:"start",behavior:state.reduced?"auto":"smooth"});
  }

  decorateBoard();
  document.querySelectorAll("[data-player-count]").forEach(button=>{
    button.addEventListener("click",()=>changePlayerCount(Number(button.dataset.playerCount)));
  });
  ui.openingStart.addEventListener("click",()=>openSelection(true));
  ui.openingQuiet.addEventListener("click",()=>openSelection(false));
  ui.setupSound.addEventListener("click",toggleSelectionMusic);
  document.querySelectorAll("[data-character]").forEach(btn=>{
    btn.addEventListener("click",()=>selectCharacter(btn.dataset.character));
  });
  $("play-sound")?.addEventListener("click",()=>{if(!ui.selection.hidden)startGame(state.soundOn);});
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
    else if(state.soundOn&&state.musicOn)musicBeat();
  });
  window.addEventListener("pagehide",stopMusic);
  if(state.reduced){
    document.body.classList.add("quiet");
    ui.quiet.setAttribute("aria-pressed","true");
    ui.quiet.textContent="✓ Modo tranquilo";
  }
  selectCharacter("ritinha");
  updateLobby();
})();