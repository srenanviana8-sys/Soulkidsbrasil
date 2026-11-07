"use strict";
// Executar na raiz do repositório: node tests/biblia-personagens.test.cjs
const fs=require("node:fs");
const assert=require("node:assert/strict");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const data=JSON.parse(fs.readFileSync(path.join(root,"dados/personagens-soulkids.json"),"utf8"));
const doc=fs.readFileSync(path.join(root,"docs/BIBLIA_PERSONAGENS_SOULKIDS.md"),"utf8");
const ids=["ritinha","ravi","tonico","luca","maya","lia","ray"];
const names=data.characters.map(c=>c.id);
assert.deepEqual([...names].sort(),[...ids].sort(),"Elenco canônico deve conter 7 integrantes");
assert.equal(new Set(names).size,names.length,"Identificadores duplicados");
assert.equal(data.policy.no_unapproved_visual_changes,true);
assert.equal(data.policy.no_diagnostic_labels_in_stories,true);
assert.equal(data.policy.voice_no_autoplay,true);
assert.equal(data.reference_assets.character_sheet_status,"incompleto");
const by=id=>data.characters.find(c=>c.id===id);
assert.equal(by("ravi").catchphrase.text,"Boa, jovem!");
assert.equal(by("ravi").catchphrase.status,"aprovado");
assert.ok(by("ravi").retired_phrases.includes("Aí eu gostei!"));
assert.equal(by("ritinha").catchphrase.text,"Tá goxxxtando ou tá amando?!");
assert.equal(by("ritinha").voice.status,"aprovada_para_a_ritinha");
assert.equal(by("tonico").catchphrase.status,"marca_expressiva");
assert.equal(by("luca").catchphrase.status,"padrao_de_fala");
assert.equal(by("lia").catchphrase.status,"reacao_caracteristica");
for(const id of ["maya","ray"]){
  assert.equal(by(id).catchphrase.status,"nao_definido");
  assert.equal(by(id).catchphrase.text,null);
}
for(const c of data.characters){
  assert.ok(c.visual_core.length>=3,"Dados visuais incompletos: "+c.id);
  assert.ok(c.visual_reference.length>12,"Referência não especificada: "+c.id);
  assert.ok(c.dont.length>=2,"Restrições ausentes: "+c.id);
  assert.ok(doc.includes("### "+c.display_name+" —")||doc.includes("### "+c.display_name+" —"),"Ficha ausente no documento: "+c.id);
}
assert.equal(data.fiction_constraints.gibi1_clues,5);
assert.equal(data.fiction_constraints.ray_appears_only_at_end,true);
assert.ok(data.visual_audit.some(x=>x.id==="troca_luca_tonico"));
assert.ok(doc.includes("movimento-luca.webp")&&doc.includes("movimento-tonico.webp"));
for(const ref of Object.values(data.reference_assets).filter(x=>typeof x==="string"&&/\.(pdf|webp|md)$/i.test(x))){
  assert.ok(fs.existsSync(path.join(root,ref)),"Referência visual/voz inexistente: "+ref);
}
console.log("PASSOU — Bíblia SoulKids: 7 personagens, bordões e referências verificados.");
