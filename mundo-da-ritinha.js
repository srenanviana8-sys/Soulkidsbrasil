"use strict";
(() => {
  // Armazenamento apenas de visitas e IDs de missões, sem dados pessoais.
  const STORAGE="soulkids-mundo-ritinha-v1";
  const allZones=["emocoes","movimento","palavras","descobertas","cozinha","missao"];
  const missions=[
    {icon:"🌈",title:"Caça às cores",text:"Escolham três cores e procurem objetos dessas cores pela casa. Contem onde cada um estava.",adapt:"Aponte, olhe ou escolha cartões com as cores; não é necessário caminhar."},
    {icon:"🎵",title:"Orquestra da cozinha",text:"Criem ritmos com palmas, batidas leves na mesa ou objetos seguros. Cada pessoa inventa um ritmo para o outro repetir.",adapt:"Use um dedo, um som vocal ou um instrumento adaptado. Controle o volume."},
    {icon:"📖",title:"História de três objetos",text:"Escolham três objetos da casa e inventem juntos uma história em que todos aparecem.",adapt:"A história pode ser construída com gestos, figuras, comunicação alternativa ou uma palavra por vez."},
    {icon:"🙂",title:"Espelho das emoções",text:"Façam expressões de alegria, surpresa e dúvida. Conversem sobre quando esses sentimentos aparecem.",adapt:"Use cartões ilustrados ou escolha palavras em vez de imitar expressões; ninguém precisa demonstrar uma emoção."},
    {icon:"🧸",title:"Uma casa para os brinquedos",text:"Criem uma moradia imaginária para um brinquedo com caixas, tecidos ou almofadas.",adapt:"Deixe as peças ao alcance e escolha materiais adequados à idade e à mobilidade."},
    {icon:"🟨",title:"Desenho gigante",text:"Façam juntos um desenho cheio de linhas, círculos e caminhos sobre uma folha grande.",adapt:"Prenda a folha na mesa e use lápis de pega mais grossa, pincel ou ajuda de um adulto."},
    {icon:"🧩",title:"Detetives das formas",text:"Procurem coisas redondas, quadradas ou retangulares pelo ambiente. Inventem novos nomes para os achados.",adapt:"As formas podem ser apresentadas próximas da criança, por toque ou imagem."},
    {icon:"🍓",title:"Descobrindo cheiros",text:"Com um adulto, observem cheiros de frutas, ervas ou ingredientes familiares e contem o que lembram.",adapt:"É opcional cheirar ou tocar; respeite alergias, sensibilidades sensoriais e preferências."},
    {icon:"🪁",title:"Vento de papel",text:"Façam leques com uma folha e observem o que muda quando movem o ar perto de uma fita leve.",adapt:"Um adulto pode movimentar o leque; a criança pode apenas observar e escolher o momento."},
    {icon:"🚂",title:"Trenzinho de palavras",text:"Cada pessoa fala uma palavra; a seguinte tenta inventar outra que começa com o último som ouvido.",adapt:"Comece com figuras e duas opções; gestos e comunicação alternativa também valem."},
    {icon:"🌳",title:"Trilha de almofadas",text:"Criem um caminho com almofadas firmes para um boneco percorrer. Se for adequado, experimentem percorrê-lo também.",adapt:"A criança pode guiar o boneco com as mãos ou dar instruções; não é preciso subir em almofadas."},
    {icon:"🎨",title:"Museu da família",text:"Escolham três desenhos ou objetos feitos em casa, criem títulos e contem a história de cada obra.",adapt:"A criança pode apontar, escolher cartões ou deixar que um adulto descreva suas escolhas."},
    {icon:"🤝",title:"Troca de turnos",text:"Inventem um jogo curto em que cada pessoa faz uma ação por vez e passa a oportunidade para outra.",adapt:"A ação pode ser pressionar um botão, olhar para um objeto ou escolher uma carta."},
    {icon:"🌻",title:"Jardim inventado",text:"Desenhem ou montem um jardim imaginário usando recortes grandes, papéis ou blocos.",adapt:"Use figuras prontas e evite peças pequenas caso não sejam seguras para a criança."},
    {icon:"🔊",title:"Que som foi esse?",text:"Um adulto faz sons suaves com objetos familiares. A criança escolhe de onde o som pode ter vindo.",adapt:"Apresente também pistas visuais e respeite quem se incomoda com determinados sons."},
    {icon:"📦",title:"O que cabe na caixa?",text:"Separem objetos seguros e descubram quais cabem em uma caixa. Experimentem posições diferentes.",adapt:"Traga os objetos até a criança; ela pode escolher verbalmente, por gesto ou por imagem."},
    {icon:"💫",title:"Constelação de estrelas",text:"Desenhem pontos no papel e liguem alguns deles para formar imagens inventadas.",adapt:"Use pontos grandes e grossos; o adulto pode fazer as linhas seguindo o olhar ou a escolha da criança."},
    {icon:"🪑",title:"Dança sentada",text:"Escolham uma música e criem movimentos de mãos, braços ou cabeça que acompanhem o ritmo.",adapt:"Movimentos são opcionais e dentro do conforto; assistir e escolher a música também é participar."},
    {icon:"🍽️",title:"Mesa de faz de conta",text:"Organizem um lanche imaginário para bonecos. Quem participa escolhe onde ficam pratos e copos de brinquedo.",adapt:"Use objetos grandes e leves; não é preciso consumir alimentos."},
    {icon:"🏁",title:"Carrinhos e caminhos",text:"Desenhem uma pista para carrinhos ou pequenos bonecos e inventem obstáculos com papel.",adapt:"Movimentem a pista ou o brinquedo até a criança e ofereçam apoio para a escolha do caminho."},
    {icon:"🧼",title:"Passos da rotina",text:"Criem cartões com três passos de uma atividade do dia e conversem sobre a ordem deles.",adapt:"Use imagens reais ou pictogramas e aceite formas diferentes de executar uma rotina."},
    {icon:"🎭",title:"Teatro de meias",text:"Com duas meias limpas, inventem personagens e uma conversa engraçada.",adapt:"Um adulto pode movimentar os personagens conforme as escolhas comunicadas pela criança."},
    {icon:"🍊",title:"Feira de faz de conta",text:"Façam uma banca de frutas imaginária com desenhos. Criem uma lista e brinquem de escolher três itens.",adapt:"A criança pode apontar ou escolher imagens; não há obrigação de provar alimentos."},
    {icon:"📚",title:"Final diferente",text:"Escolham uma história conhecida e inventem juntos outro final para os personagens.",adapt:"Ofereça duas possibilidades por vez, com desenhos ou frases curtas."},
    {icon:"🫧",title:"Bolhas imaginárias",text:"Desenhem bolhas grandes e pequenas num papel e escolham nomes e caminhos para elas.",adapt:"A proposta não precisa usar água nem sabão; pode ser totalmente desenhada."},
    {icon:"🔍",title:"Procura de detalhes",text:"Observem uma imagem juntos. Cada pessoa escolhe um detalhe para o outro encontrar.",adapt:"Amplie a imagem, descreva os detalhes e dê tempo para responder."},
    {icon:"🧶",title:"Caminho de linhas",text:"Usando canetinhas grossas, tracem caminhos que se cruzam e levem a um tesouro desenhado.",adapt:"O traçado pode ser realizado com ajuda, apontamento ou uma escolha entre caminhos prontos."},
    {icon:"🌙",title:"Boa-noite dos brinquedos",text:"Inventem uma pequena rotina noturna para os brinquedos: guardar, contar história e desejar boa-noite.",adapt:"Use apenas os passos relevantes para a criança; qualquer ordem funcional pode ser conversada."},
    {icon:"🎈",title:"Uma festa surpresa",text:"Planejem uma festa de faz de conta: quem viria, qual seria a música e que brincadeiras aconteceriam?",adapt:"Faça perguntas de duas opções e permita respostas por comunicação alternativa."},
    {icon:"🗺️",title:"Mapa do tesouro",text:"Desenhem um mapa simples com três lugares e escolham onde o tesouro imaginário ficará escondido.",adapt:"O adulto pode desenhar e a criança escolher os lugares; não precisa percorrer o mapa fisicamente."},
    {icon:"💌",title:"Mensagem carinhosa",text:"Façam um bilhete ou desenho para agradecer a alguém por uma atitude gentil.",adapt:"Uma palavra, um gesto, uma figura ou um olhar escolhido podem compor a mensagem."}
  ];
  const $=id=>document.getElementById(id);
  const safeRead=()=>{
    try{
      const data=JSON.parse(localStorage.getItem(STORAGE)||"{}");
      return {
        zones:Array.isArray(data.zones)?data.zones.filter(x=>allZones.includes(x)).slice(-6):[],
        completed:Array.isArray(data.completed)?data.completed.filter(x=>Number.isInteger(x)&&x>=0&&x<missions.length).slice(-31):[]
      };
    }catch(_){return {zones:[],completed:[]}}
  };
  const state=safeRead();
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(state))}catch(_){}};
  const visit=zone=>{
    if(!allZones.includes(zone)||state.zones.includes(zone))return;
    state.zones.push(zone);save();renderPassport();
  };
  function renderPassport(){
    for(const node of document.querySelectorAll("[data-passport]")) {
      const seen=state.zones.includes(node.dataset.passport);
      node.classList.toggle("yes",seen);
      node.setAttribute("aria-label",node.querySelector(".name").textContent+(seen?" — carimbo conquistado":" — ainda não visitado"));
    }
    for(const node of document.querySelectorAll("[data-stamp-label]")){
      const seen=state.zones.includes(node.dataset.stampLabel);
      node.textContent=seen?"✓ Explorou":"Para explorar";
      node.classList.toggle("visited",seen);
    }
    $("passport-count").textContent=state.zones.length+" de "+allZones.length+" descobertas";
  }
  for(const link of document.querySelectorAll("[data-explore]")){
    link.addEventListener("click",()=>visit(link.dataset.explore));
  }
  const now=new Date();
  const dateKey=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-");
  const dayNumber=Number(dateKey.slice(0,4))*372+Number(dateKey.slice(5,7))*31+Number(dateKey.slice(8,10));
  const daily=(dayNumber*13+7)%missions.length;
  let current=daily;
  const dateLabel=new Intl.DateTimeFormat("pt-BR",{day:"numeric",month:"long"}).format(now);
  function renderMission(surprise=false){
    const mission=missions[current];
    $("mission-date").textContent=(surprise?"Missão surpresa • ":"Missão de "+dateLabel+" • ")+"Brincando em família";
    $("mission-heading").textContent=surprise?"Uma nova surpresa para você!":"Missão do dia";
    $("mission-icon").textContent=mission.icon;
    $("mission-title").textContent=mission.title;
    $("mission-text").textContent=mission.text;
    $("mission-adapt").textContent=mission.adapt;
    const done=state.completed.includes(current);
    $("mark-mission").setAttribute("aria-pressed",String(done));
    $("mark-mission").textContent=done?"✓ Missão vivida!":"Concluímos juntos ✓";
  }
  $("another-mission").addEventListener("click",()=>{
    if(missions.length===1)return;
    const choices=missions.map((_,i)=>i).filter(i=>i!==current);
    current=choices[Math.floor(Math.random()*choices.length)];
    renderMission(true);
  });
  $("mark-mission").addEventListener("click",()=>{
    if(!state.completed.includes(current))state.completed.push(current);
    if(!state.zones.includes("missao"))state.zones.push("missao");
    save();renderPassport();renderMission(current!==daily);
  });
  $("print-mission").addEventListener("click",()=>window.print());
  renderPassport();renderMission();
})();
