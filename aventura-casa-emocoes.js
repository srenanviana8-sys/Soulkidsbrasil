"use strict";
(() => {
  const scene = document.getElementById("emotions-scene");
  const traveler = document.getElementById("emotions-traveler");
  const start = document.getElementById("emotions-start");
  const enter = document.getElementById("emotions-enter");
  const repeat = document.getElementById("emotions-repeat");
  const status = document.getElementById("emotions-status");
  const invitation = document.querySelector("[data-visit-emotions]");
  if (![scene, traveler, start, enter, repeat, status].every(Boolean)) return;

  // Evita anunciar duas vezes o mesmo texto: o guia já tem sua região acessível.
  if (typeof window.SoulKidsRitinha?.narrate === "function") {
    status.setAttribute("aria-live", "off");
  }

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  const tellRitinha = (text, mood) => {
    if (typeof window.SoulKidsRitinha?.narrate === "function") {
      window.SoulKidsRitinha.narrate({text, mood});
    }
  };
  const duration = 3300;
  let state = "idle";
  let fallback = null;

  function clearFallback() {
    if (fallback !== null) {
      clearTimeout(fallback);
      fallback = null;
    }
  }

  function arrive() {
    if (state !== "walking") return;
    clearFallback();
    state = "arrived";
    scene.classList.remove("is-walking");
    scene.classList.add("is-arrived");
    scene.setAttribute("data-state", state);
    status.textContent = "Chegamos! A porta da Casa das Emoções se abriu. Quer entrar e descobrir como os personagens estão se sentindo?";
    tellRitinha("Chegamos! A porta está aberta. Vamos conhecer o Jogo das Emoções?", "Que bom, chegamos!");
    start.disabled = false;
    start.hidden = true;
    enter.hidden = false;
    repeat.hidden = false;
  }

  function begin() {
    if (state === "walking") return;
    clearFallback();

    // Reinicia a animação sem sobrepor trajetos em cliques consecutivos.
    scene.classList.remove("is-walking", "is-arrived");
    void traveler.offsetWidth;

    state = "walking";
    scene.setAttribute("data-state", state);
    start.disabled = true;
    start.textContent = "A Ritinha está a caminho…";
    start.hidden = false;
    enter.hidden = true;
    repeat.hidden = true;
    status.textContent = "Ritinha: Vamos juntas até a Casa das Emoções! Acompanhe o caminho até a porta.";
    tellRitinha("Vamos juntas até a Casa das Emoções! Eu vou mostrar o caminho.", "Hora de descobrir!");

    if (reducedMotion) {
      arrive();
    } else {
      scene.classList.add("is-walking");
      fallback = setTimeout(arrive, duration + 250);
    }
  }

  traveler.addEventListener("animationend", event => {
    if (event.target === traveler && event.animationName === "ritinha-travel") arrive();
  });

  start.addEventListener("click", begin);
  repeat.addEventListener("click", begin);

  if (invitation) {
    invitation.addEventListener("click", () => {
      scene.scrollIntoView?.({behavior: reducedMotion ? "auto" : "smooth", block: "center"});
      begin();
    });
  }

  // Se a aba for colocada em segundo plano, conclui a cena para não deixá-la presa.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "walking") arrive();
  });
  window.addEventListener("pagehide", clearFallback);
})();
