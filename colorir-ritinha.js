
"use strict";
const drawings={
 ritinha:{name:"Ritinha e a bola",sub:"A Ritinha tem óculos grandes, cabelos lisos e camiseta com listras verticais.",kind:"ritinha",props:"bola"},
 luca:{name:"Luca e as estrelas",sub:"Uma cena da turma para explorar cores, formas e criatividade.",kind:"luca",props:"estrelas"},
 tonico:{name:"Tonico e os blocos",sub:"Tonico está brincando com peças grandes e coloridas.",kind:"tonico",props:"blocos"},
 lia:{name:"Lia e as flores",sub:"Lia está num jardim cheio de formas para pintar.",kind:"lia",props:"flores"},
 maya:{name:"Maya e o parque",sub:"Maya brinca ao ar livre com seu andador.",kind:"maya",props:"parque"},
 ice:{name:"ICE Kid",sub:"Um super-herói de cabelo claro e traje de gelo para inventar cores.",kind:"ice",props:"gelo"}
};
const colors=["#ffffff","#f5c6b8","#dc9958","#674137","#f7ce4c","#ec776d","#ffadd5","#79d0cc","#7aa8ec","#a587db"];
const palette=document.getElementById("palette");
let selected="#f7ce4c";let current="ritinha";
for(const c of colors){const btn=document.createElement("button");btn.type="button";btn.className="swatch";btn.style.background=c;btn.setAttribute("aria-label",c==="#ffffff"?"Branco (apagar)":"Escolher cor "+c);btn.setAttribute("aria-pressed",String(c===selected));btn.addEventListener("click",()=>{selected=c;for(const ch of palette.children)ch.setAttribute("aria-pressed",String(ch===btn));});palette.append(btn);}
const P=(tag,attrs="")=>"<"+tag+" "+attrs+">";
function ink(s){return '<g fill="#fff" stroke="#172331" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+s+"</g>";}
const shape=(tag,attr)=>"<"+tag+" "+attr+" data-paint='1' fill='#fff'/>";
function circle(cx,cy,r){return shape("circle","cx='"+cx+"' cy='"+cy+"' r='"+r+"'");}
function star(x,y,r){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const rad=i%2?r*.46:r;pts.push((x+rad*Math.cos(a)).toFixed(1)+","+(y+rad*Math.sin(a)).toFixed(1));}return shape("polygon","points='"+pts.join(" ")+"'");}
function clouds(){return ink('<path d="M50 156 Q14 145 37 114 Q48 100 64 113 Q77 75 107 94 Q128 99 132 122 Q161 125 153 148 Q146 163 120 159 Z" fill="none"/><path d="M429 136 Q418 111 445 102 Q459 76 483 100 Q505 100 514 123 Q537 127 530 148 L448 150 Z" fill="none"/>');}
function details(kind){
 const girl=kind==="ritinha"||kind==="lia"||kind==="maya";
 const glasses=kind==="ritinha";
 const hair=kind==="ice"?'<path d="M48 71 L37 45 L61 51 L66 28 L87 46 L106 22 L131 48 L154 27 L154 54 L175 47 L168 85 Q112 49 48 85 Z" data-paint="1" fill="#fff"/>':
 girl?'<path d="M41 81 Q37 23 109 16 Q174 22 181 82 L177 159 L161 164 L156 88 Q124 85 116 58 Q95 80 55 85 L57 160 L39 165 Z" data-paint="1" fill="#fff"/>':
 '<path d="M49 73 Q32 26 93 26 L120 19 L137 33 Q168 21 172 76 L150 62 L139 71 L125 62 L107 70 L86 60 L70 76 Z" data-paint="1" fill="#fff"/>';
 const cheek=glasses?'<g fill="none"><circle cx="77" cy="108" r="22"/><circle cx="144" cy="108" r="22"/><path d="M100 108 Q110 100 122 108 M56 103 L45 99 M165 103 L176 99"/></g>':"";
 const stripes=glasses?'<path d="M83 174 L83 254 M99 171 L99 258 M117 173 L117 256 M135 173 L135 249" fill="none"/>':"";
 const body=kind==="luca"?
 '<path d="M70 163 Q112 153 150 165 Q181 193 171 267 Q112 289 53 265 Q42 197 70 163 Z" data-paint="1" fill="#fff"/>':
 kind==="ice"?
 '<path d="M75 166 L142 166 L174 260 L52 260 Z" data-paint="1" fill="#fff"/><path d="M114 178 L128 206 L115 232 L104 203 Z" data-paint="1" fill="#fff"/>':
 '<path d="M67 169 Q106 159 151 171 L159 254 Q108 266 61 252 Z" data-paint="1" fill="#fff"/>';
 const shorts=kind==="ice"?
 '<path d="M60 261 L163 261 L145 300 L113 283 L79 299 Z" data-paint="1" fill="#fff"/>':
 '<path d="M63 259 Q109 269 157 259 L155 303 L117 290 L107 314 L62 294 Z" data-paint="1" fill="#fff"/>';
 const walker=kind==="maya"?
 '<g fill="none"><path d="M22 224 L23 345 L196 345 L198 225 M22 243 L75 244 M150 244 L198 242 M23 281 L198 281"/><circle cx="23" cy="350" r="12" data-paint="1" fill="#fff"/><circle cx="197" cy="350" r="12" data-paint="1" fill="#fff"/></g>':"";
 return ink(
 hair+
 shape("ellipse",'cx="111" cy="107" rx="62" ry="67"')+
 '<path d="M48 82 Q76 84 92 61 Q113 80 138 64 Q149 79 171 82" fill="none"/>'+
 '<ellipse cx="91" cy="105" rx="4" ry="6" fill="#172331" stroke="none"/><ellipse cx="134" cy="105" rx="4" ry="6" fill="#172331" stroke="none"/>'+
 '<path d="M107 119 Q113 124 118 119 M96 138 Q113 152 131 137" fill="none"/>'+
 cheek+
 shape("path",'d="M57 178 L31 196 L16 239 Q23 247 34 246 L74 211 Z"')+
 shape("path",'d="M158 180 L185 199 L207 241 Q199 250 187 244 L152 211 Z"')+
 body+stripes+shorts+
 shape("path",'d="M73 293 L101 300 L98 369 L68 366 Z"')+
 shape("path",'d="M124 298 L148 293 L158 363 L129 367 Z"')+
 shape("path",'d="M65 360 Q54 371 47 377 Q66 391 102 379 L99 362 Z"')+
 shape("path",'d="M125 362 L154 358 Q180 376 174 382 L129 382 Z"')+
 walker
 );
}
function propDrawing(props){
 switch(props){
 case "bola":return ink(circle(445,540,65)+'<path d="M381 539 Q444 490 508 539 M445 477 Q473 540 445 601 M408 486 L488 583" fill="none"/>'+star(487,245,28));
 case "estrelas":return ink(star(448,258,55)+star(488,399,30)+star(385,460,20));
 case "blocos":return ink(shape("rect",'x="388" y="460" width="78" height="78" rx="6"')+shape("rect",'x="448" y="544" width="85" height="85" rx="6"')+shape("rect",'x="367" y="559" width="72" height="72" rx="6"')+circle(426,494,23)+star(488,576,23));
 case "flores":return ink('<path d="M441 610 V469 M492 602 V525" fill="none"/>'+circle(441,462,25)+circle(413,455,24)+circle(467,443,22)+circle(439,430,23)+circle(493,519,24)+circle(462,504,21)+circle(516,500,22)+star(405,230,30));
 case "parque":return ink('<path d="M387 624 V345 M493 624 V345 M378 348 Q441 295 504 348 M402 620 H500" fill="none"/>'+shape("rect",'x="409" y="441" width="75" height="95" rx="12"')+circle(392,258,21)+star(485,230,25));
 case "gelo":return ink(star(452,340,69)+star(490,505,35)+star(387,524,22)+'<path d="M450 230 V275 M423 250 L477 250 M470 216 L492 240" fill="none"/>');
 }
 return "";
}
function render(){
 const d=drawings[current];document.getElementById("scene-desc").textContent=d.sub;
 const body=ink('<rect x="15" y="15" width="570" height="750" rx="17" fill="none" stroke-width="2.8"/><path d="M36 91 H564 M36 702 H564" stroke-width="2" fill="none"/>')+
 clouds()+
 '<g transform="translate(55 185) scale(1.35)">'+details(d.kind)+'</g>'+
 propDrawing(d.props)+
 ink('<path d="M52 666 Q300 648 546 666" fill="none"/>');
 const s='<svg id="drawing" viewBox="0 0 600 780" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Desenho para colorir de '+d.name+'"><rect width="600" height="780" fill="#fff"/>'+
 '<text x="300" y="60" text-anchor="middle" font-size="31" font-weight="800" font-family="Arial, sans-serif" fill="#152541">'+d.name+'</text>'+
 body+'<text x="300" y="736" text-anchor="middle" font-size="17" font-weight="700" font-family="Arial, sans-serif" fill="#152541">SoulKids • Crie as suas cores!</text></svg>';
 document.getElementById("art").innerHTML=s;
}
document.getElementById("scene").addEventListener("change",e=>{current=e.target.value;render()});
document.getElementById("art").addEventListener("click",e=>{const shape=e.target.closest("[data-paint]");if(shape)shape.setAttribute("fill",selected)});
document.getElementById("reset").addEventListener("click",render);
document.getElementById("print").addEventListener("click",()=>window.print());
document.getElementById("save").addEventListener("click",()=>{
 const svg=document.getElementById("drawing");const serialized=new XMLSerializer().serializeToString(svg);const url=URL.createObjectURL(new Blob([serialized],{type:"image/svg+xml;charset=utf-8"}));
 const img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");canvas.width=1800;canvas.height=2340;const c=canvas.getContext("2d");c.fillStyle="#fff";c.fillRect(0,0,1800,2340);c.drawImage(img,0,0,1800,2340);URL.revokeObjectURL(url);const a=document.createElement("a");a.download="SoulKids-"+current+"-colorir.png";a.href=canvas.toDataURL("image/png");a.click()};img.onerror=()=>{URL.revokeObjectURL(url);alert("Não foi possível salvar a imagem. Utilize a opção Imprimir / salvar PDF.")};img.src=url;
});
render();
