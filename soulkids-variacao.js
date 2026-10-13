/* SoulKids Play — seleção local de desafios, sem dados pessoais */
"use strict";
window.SoulKidsVariacao = (() => {
  function shuffle(input) {
    const a = [...input];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function history(key) {
    try {
      const v = JSON.parse(localStorage.getItem("sk-variacao-v1-" + key) || "[]");
      return Array.isArray(v) ? v.filter(x => typeof x === "string").slice(-32) : [];
    } catch (_) { return []; }
  }
  function save(key, ids) {
    try { localStorage.setItem("sk-variacao-v1-" + key, JSON.stringify(ids.slice(-32))); } catch (_) {}
  }
  function pick(key, items, count) {
    if (!items.length || count <= 0) return [];
    const old = history(key), ids = x => String(x.id);
    const unseen = shuffle(items.filter(x => !old.includes(ids(x))));
    const used = shuffle(items.filter(x => old.includes(ids(x))))
      .sort((a, b) => old.indexOf(ids(a)) - old.indexOf(ids(b)));
    const chosen = [...unseen, ...used].slice(0, Math.min(count, items.length));
    save(key, [...old, ...chosen.map(ids)]);
    return shuffle(chosen);
  }
  function options(correct, distractors, total = 3) {
    const unique = [];
    for (const o of shuffle(distractors)) {
      if (o[1] !== correct[1] && !unique.some(x => x[1] === o[1])) unique.push(o);
    }
    const result = shuffle([correct, ...unique.slice(0, Math.max(1, total - 1))]);
    return { choices: result, answer: result.findIndex(x => x[1] === correct[1]) };
  }
  return { shuffle, pick, options };
})();
