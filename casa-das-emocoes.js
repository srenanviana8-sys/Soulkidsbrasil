"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const nav = Array.from(document.querySelectorAll("[data-room-open]"));
  const panels = Array.from(document.querySelectorAll("[data-room-panel]"));
  const start = Array.from(document.querySelectorAll("[data-room-start]"));
  if (!nav.length || !panels.length) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const speechReady = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
  const guide = $("guide-message");
  const roomPhrases = {
    espelho: "Vamos descobrir os sentimentos? Você pode escolher um rostinho e brincar comigo!",
    calma: "Esse cantinho é para encontrar conforto. Você escolhe o que faz bem para você.",
    historias: "Trouxe histórias dos nossos amigos! Você pode escolher caminhos diferentes para cada uma."
  };
  const stampKey = "soulkids-mundo-ritinha-v1";

  function rememberVisit() {
    try {
      const data = JSON.parse(localStorage.getItem(stampKey) || "{}");
      const existing = Array.isArray(data.zones) ? data.zones.filter(x => typeof x === "string") : [];
      const zones = [...new Set([...existing, "emocoes"])].slice(-6);
      localStorage.setItem(stampKey, JSON.stringify({
        zones,
        completed: Array.isArray(data.completed) ? data.completed : []
      }));
    } catch (_) {
      // O jogo funciona mesmo sem armazenamento local.
    }
  }

  function cancelSpeech() {
    if (!speechReady) return;
    try { window.speechSynthesis.cancel(); } catch (_) {}
  }
  function speak(content) {
    if (!speechReady || !content) return;
    cancelSpeech();
    try {
      const phrase = new window.SpeechSynthesisUtterance(content);
      phrase.lang = "pt-BR";
      phrase.rate = 0.88;
      phrase.pitch = 1.02;
      window.speechSynthesis.speak(phrase);
    } catch (_) {}
  }
  if (!speechReady) {
    ["mirror-listen", "story-listen"].forEach(id => { if ($(id)) $(id).hidden = true; });
  }

  function openRoom(room, focus = false) {
    if (!roomPhrases[room]) return;
    nav.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.roomOpen === room)));
    panels.forEach(panel => { panel.hidden = panel.dataset.roomPanel !== room; });
    guide.textContent = roomPhrases[room];
    rememberVisit();
    cancelSpeech();
    const panel = $("painel-" + room);
    panel.scrollIntoView?.({behavior: reducedMotion ? "auto" : "smooth", block: "start"});
    if (focus) {
      const title = panel.querySelector("h3");
      if (title) {
        title.tabIndex = -1;
        title.focus?.({preventScroll: true});
      }
    }
  }
  nav.forEach(b => b.addEventListener("click", () => openRoom(b.dataset.roomOpen, true)));
  start.forEach(b => b.addEventListener("click", () => openRoom("espelho", true)));

  const emotions = {
    feliz: {
      image: "/ritinha-feliz.webp", alt: "Ritinha sorrindo com alegria", title: "Feliz",
      situations: [
        ["A Ritinha sorriu na brincadeira.", "O que costuma trazer alegria para você?"],
        ["Luca terminou sua construção!", "De que jeito você gosta de comemorar uma descoberta?"],
        ["Maya chamou a turma para brincar.", "Como podemos dividir um momento alegre com alguém?"]
      ]
    },
    triste: {
      image: "/ritinha-triste.webp", alt: "Ritinha com expressão triste", title: "Triste",
      situations: [
        ["A Ritinha queria brincar mais.", "O que pode ajudar quando algo de que gostamos termina?"],
        ["O desenho de Luca rasgou.", "Você prefere companhia ou um tempinho quando fica triste?"],
        ["Lia está com saudade.", "O que podemos dizer ou fazer para acolher esse sentimento?"]
      ]
    },
    bravo: {
      image: "/ritinha-bravo.webp", alt: "Ritinha contrariada, com os braços cruzados", title: "Bravo",
      situations: [
        ["Pegaram o brinquedo de Lia.", "Como ela pode mostrar que não gostou sem machucar ninguém?"],
        ["A torre de Luca caiu.", "O que você gostaria de fazer antes de tentar novamente?"],
        ["A Ritinha ficou frustrada.", "Como podemos pedir ajuda quando a frustração aparece?"]
      ]
    },
    medo: {
      image: "/ritinha-medo.webp", alt: "Ritinha demonstrando receio", title: "Com medo",
      situations: [
        ["A Ritinha ficou insegura na porta.", "O que você gostaria de conhecer antes de entrar?"],
        ["Tonico se assustou com um som.", "Como podemos deixar o ambiente mais confortável?"],
        ["Lia não conhece esta brincadeira.", "É possível observar primeiro e participar depois?"]
      ]
    },
    calmo: {
      image: "/ritinha-calmo.webp", alt: "Ritinha tranquila, de olhos fechados", title: "Calmo",
      situations: [
        ["Ritinha encontrou seu cantinho.", "Que lugares fazem você se sentir confortável?"],
        ["Maya fez uma pausa.", "Como seu corpo mostra que precisa descansar?"],
        ["Tonico observou as estrelas.", "O que você gosta de observar quando quer tranquilidade?"]
      ]
    }
  };
  // As imagens aprovadas nesta etapa representam a Ritinha. Os exemplos podem incluir toda a turma.
  const counters = Object.fromEntries(Object.keys(emotions).map(k => [k, 0]));
  let feeling = null;
  let lastMirrorMessage = "";

  function showFeeling(id, next = false) {
    const entry = emotions[id];
    if (!entry) return;
    if (next || (id === feeling && feeling !== null)) counters[id] += 1;
    feeling = id;
    const [example, question] = entry.situations[counters[id] % entry.situations.length];
    const portrait = $("mirror-face");
    portrait.src = entry.image;
    portrait.alt = entry.alt;
    $("mirror-name").textContent = "Ritinha · " + entry.title;
    $("mirror-example").textContent = example;
    $("mirror-question").textContent = question;
    $("mirror-another").disabled = false;
    lastMirrorMessage = example;
    document.querySelectorAll("[data-feeling]").forEach(b => {
      b.setAttribute("aria-pressed", String(b.dataset.feeling === id));
    });
    rememberVisit();
  }
  document.querySelectorAll("[data-feeling]").forEach(b =>
    b.addEventListener("click", () => showFeeling(b.dataset.feeling))
  );
  $("mirror-another").addEventListener("click", () => { if (feeling) showFeeling(feeling, true); });
  $("mirror-listen").addEventListener("click", () => speak(lastMirrorMessage || "Escolha um rostinho para descobrir uma emoção."));

  const calm = [
    ["Um instante só seu", "Vamos achar um lugar gostoso para descansar?"],
    ["Olhar e descobrir", "Encontre uma coisa de que você gosta."],
    ["Seu corpo tem um ritmo", "Olhe a flor. Ela se mexe devagar."],
    ["Uma pausa sensorial", "Qual cantinho faz você se sentir bem?"],
    ["Pedir o que precisa", "Você pode pedir uma pausa ou companhia."]
  ];
  let calmIndex = 0;
  function showCalm() {
    $("calm-step-title").textContent = calm[calmIndex][0];
    $("calm-step-text").textContent = calm[calmIndex][1];
    rememberVisit();
  }
  $("calm-next").addEventListener("click", () => {
    calmIndex = (calmIndex + 1) % calm.length;
    showCalm();
  });
  const glow = $("calm-glow");
  const pause = $("calm-pause");
  if (reducedMotion) {
    glow.classList.add("is-paused");
    pause.disabled = true;
    pause.textContent = "Movimento reduzido";
  } else {
    pause.addEventListener("click", () => {
      const paused = pause.getAttribute("aria-pressed") !== "true";
      pause.setAttribute("aria-pressed", String(paused));
      pause.textContent = paused ? "▶️ Retomar movimento" : "⏸ Pausar movimento";
      glow.classList.toggle("is-paused", paused);
    });
  }

  const stories = [
    {
      character: "Ritinha · A chegada",
      title: "Uma porta diferente",
      text: "Ritinha ficou insegura diante de uma porta nova.",
      choices: [
        ["Observar a sala primeiro", "Boa ideia! A Ritinha pode conhecer o lugar aos poucos, sem pressa."],
        ["Entrar acompanhada", "Ter alguém de confiança por perto também pode ajudar a Ritinha a se sentir segura."]
      ]
    },
    {
      character: "Lia · O meu espaço",
      title: "Agora eu não quero!",
      text: "Um amigo quer brincar, mas Lia disse: “Não!”.",
      choices: [
        ["Perguntar se ela prefere brincar depois", "Respeitar o momento de Lia ajuda a turma a combinar outra oportunidade."],
        ["Oferecer uma brincadeira lado a lado", "Uma proposta sem obrigação pode criar espaço para brincarem juntos, se Lia quiser."]
      ]
    },
    {
      character: "Tonico · Um jeito de participar",
      title: "O convite do Tonico",
      text: "Tonico chegou e apontou para uma peça do jogo.",
      choices: [
        ["Mostrar duas peças para ele escolher", "Dar opções ajuda a turma a entender o que Tonico está comunicando."],
        ["Esperar e observar seu gesto", "Dar tempo também é uma forma de escutar e respeitar a comunicação do Tonico."]
      ]
    },
    {
      character: "Luca · A torre caiu",
      title: "Um castelo de blocos",
      text: "A torre de Luca caiu. Ele ficou chateado.",
      choices: [
        ["Perguntar se ele quer ajuda", "Oferecer ajuda sem obrigar Luca permite que ele escolha como continuar."],
        ["Dar um tempinho antes de voltar", "Fazer uma pausa é uma possibilidade quando a frustração aparece."]
      ]
    },
    {
      character: "Maya · Vamos brincar juntos?",
      title: "A mesa da turma",
      text: "Maya chegou ao jogo, mas as peças estão longe.",
      choices: [
        ["Perguntar onde ela prefere os materiais", "Ouvir Maya ajuda a organizar a brincadeira para que ela participe com autonomia."],
        ["Aproximar uma mesa acessível", "Pensar no espaço e nas adaptações permite que mais pessoas brinquem juntas."]
      ]
    }
  ];
  let storyIndex = 0;
  let selectedStory = null;
  function renderStory() {
    const data = stories[storyIndex];
    $("story-character").textContent = data.character;
    $("story-title").textContent = data.title;
    $("story-text").textContent = data.text;
    document.querySelectorAll("[data-story-choice]").forEach(button => {
      const index = Number(button.dataset.storyChoice);
      button.textContent = data.choices[index][0];
      button.setAttribute("aria-pressed", "false");
    });
    const fb = $("story-feedback");
    fb.textContent = "";
    fb.hidden = true;
    selectedStory = null;
  }
  document.querySelectorAll("[data-story-choice]").forEach(button => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.storyChoice);
      const data = stories[storyIndex];
      if (!data.choices[index]) return;
      selectedStory = index;
      $("story-feedback").textContent = data.choices[index][1];
      $("story-feedback").hidden = false;
      document.querySelectorAll("[data-story-choice]").forEach(b =>
        b.setAttribute("aria-pressed", String(Number(b.dataset.storyChoice) === index))
      );
      rememberVisit();
    });
  });
  $("story-next").addEventListener("click", () => {
    storyIndex = (storyIndex + 1) % stories.length;
    renderStory();
    rememberVisit();
  });
  $("story-listen").addEventListener("click", () => {
    const data = stories[storyIndex];
    speak(data.title + ". " + data.text + (selectedStory === null ? "" : " " + data.choices[selectedStory][1]));
  });

  renderStory();
  const hash = window.location?.hash?.replace("#", "");
  if (roomPhrases[hash]) openRoom(hash);
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelSpeech(); });
  window.addEventListener("pagehide", cancelSpeech);
})();
