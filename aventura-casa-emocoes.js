"use strict";
(() => {
  const scene = document.getElementById("emotions-scene");
  const path = document.getElementById("emotions-progress");
  const start = document.getElementById("emotions-start");
  const enter = document.getElementById("emotions-enter");
  const repeat = document.getElementById("emotions-repeat");
  const status = document.getElementById("emotions-status");
  const invitation = document.querySelector("[data-visit-emotions]");
  if (![scene, path, start, enter, repeat, status].every(Boolean)) return;

  // A personagem oficial narra pela guia já existente; não há uma versão inventada no cenário.
  const narrate = (text, mood) => {
    if (typeof window.SoulKidsRitinha?.narrate === "function") {
      window.SoulKidsRitinha.narrate({text, mood});
    }
  };
  // A guia já possui a região ao vivo, evitando leitura duplicada do mesmo aviso.
  if (typeof window.SoulKidsRitinha?.narrate === "function") {
    status.setAttribute("aria-live", "off");
  }

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const duration = 3300;
  let state = "idle";
  let timeoutId = null;

  function clearFallback() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
  function arrive() {
    if (state !== "walking") return;
    clearFallback();
    state = "arrived";
    scene.classList.remove("is-walking");
    scene.classList.add("is-arrived");
    scene.setAttribute("data-state", "arrived");

    status.textContent = "Chegamos! O caminho se iluminou e a porta da Casa das Emoções se abriu. Quer entrar para descobrir sentimentos com a turma?";
    narrate("Chegamos! A porta está aberta. Vamos descobrir as emoções?", "Que bom, chegamos!");
    start.disabled = false;
    start.hidden = true;
    enter.hidden = false;
    repeat.hidden = false;
  }

  function begin() {
    if (state === "walking") return;
    clearFallback();

    // Apaga as luzes anteriores para o próximo passeio não sobrepor animações.
    scene.classList.remove("is-arrived", "is-walking");
    void path.getBoundingClientRect();

    state = "walking";
    scene.setAttribute("data-state", "walking");
    start.disabled = true;
    start.textContent = "Iluminando o caminho…";
    start.hidden = false;
    enter.hidden = true;
    repeat.hidden = true;

    status.textContent = "Ritinha: Vamos juntas! Olhe as luzinhas pelo caminho até a Casa das Emoções.";
    narrate("Vamos juntas até a Casa das Emoções! Siga as luzinhas pelo caminho.", "Nossa aventura começou!");

    if (reducedMotion) {
      arrive();
    } else {
      scene.classList.add("is-walking");
      timeoutId = setTimeout(arrive, duration + 250);
    }
  }

  // A própria animação sinaliza sua conclusão; o temporizador cobre navegadores sem animationend.
  path.addEventListener("animationend", event => {
    if (event.target === path && event.animationName === "story-light-path") arrive();
  });
  start.addEventListener("click", begin);
  repeat.addEventListener("click", begin);
  if (invitation) {
    invitation.addEventListener("click", () => {
      scene.scrollIntoView?.({behavior: reducedMotion ? "auto" : "smooth", block: "center"});
      begin();
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "walking") arrive();
  });
  window.addEventListener("pagehide", clearFallback);
})();
