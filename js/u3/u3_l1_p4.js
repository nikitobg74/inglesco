(() => {

const CONFIG = {
  IMG_BASE: "../../../../assets/images/u3/",
  delayNext: 2000,
  hintDuration: 2000
};

const ROUNDS = [

{
img:"u3.l1.p1.woman.eating.jpg",
ctx:"Emma is at home.",
q:"What is she doing?",
left:"She is",
right:".",
answer:"eating"
},

{
img:"u3.l1.p1.man.drinking.jpg",
ctx:"John is in the bedroom.",
q:"What is he doing?",
left:"He is",
right:".",
answer:"drinking"
},

{
img:"u3.l1.p1.woman.cooking2.jpg",
ctx:"Martha is in the kitchen.",
q:"What is she doing?",
left:"She is",
right:".",
answer:"cooking"
},

{
img:"u3.l1.p1.woman.reading2.jpg",
ctx:"Jane is in the bedroom.",
q:"What is she doing?",
left:"She is",
right:".",
answer:"reading"
},

{
img:"u3.l1.p1.man.watching.jpg",
ctx:"Mateo is in the living room.",
q:"What is he doing?",
left:"He is",
right:".",
answer:"watching"
},

{
img:"u3.l1.p1.man.playing.jpg",
ctx:"Henry is at the park.",
q:"What is he doing?",
left:"He is",
right:".",
answer:"playing"
},

{
img:"u3.l1.p1.woman.singing2.jpg",
ctx:"Sherri is at the theater.",
q:"What is she doing?",
left:"She is",
right:".",
answer:"singing"
},

{
img:"u3.l1.p1.man.listening.jpg",
ctx:"I am at home.",
q:"What am I doing?",
left:"I am",
right:".",
answer:"listening"
}

];

const $ = s => document.querySelector(s);

const img = $("#sceneImg");
const counter = $("#counter");
const ctxLine = $("#ctxLine");
const qLine = $("#qLine");
const frameLeft = $("#frameLeft");
const frameRight = $("#frameRight");
const input = $("#wordInput");
const status = $("#statusBox");
const nextBtn = $("#nextBtn");

let index = 0;
let attempts = 0;
let locked = false;

function normalize(t){
return String(t || "").trim().toLowerCase();
}

function setCounter(){
counter.textContent = (index+1) + "/" + ROUNDS.length;
}

function neutral(){
status.classList.remove("ok","bad");
status.textContent="—";
input.style.borderColor="rgba(15,23,42,.18)";
}

function wrong(){
status.classList.remove("ok");
status.classList.add("bad");
status.textContent="❌";
input.style.borderColor="rgba(239,68,68,.55)";
}

function correct(){
status.classList.remove("bad");
status.classList.add("ok");
status.textContent="OK";
input.style.borderColor="rgba(34,197,94,.65)";
}

function showHint(word){

const hint = document.createElement("div");
hint.style.fontWeight="900";
hint.style.marginTop="8px";
hint.style.textAlign="center";
hint.textContent = word;

status.innerHTML="";
status.appendChild(hint);

setTimeout(()=>{
neutral();
},CONFIG.hintDuration);

}

function loadRound(i){

index=i;
attempts=0;
locked=false;

const r = ROUNDS[index];

setCounter();

img.src = CONFIG.IMG_BASE + r.img;

ctxLine.textContent=r.ctx;
qLine.textContent=r.q;

frameLeft.textContent=r.left;
frameRight.textContent=r.right;

input.value="";
input.disabled=false;
input.focus();

neutral();

}

function checkAnswer(){

if(locked) return;

const r = ROUNDS[index];
const typed = normalize(input.value);
const ans = normalize(r.answer);

if(!typed) return;

if(typed===ans){

locked=true;

correct();

input.disabled=true;

setTimeout(()=>{

let next=index+1;

if(next>=ROUNDS.length){
nextBtn.classList.remove("hidden");
return;
}

loadRound(next);

},CONFIG.delayNext);

return;

}

attempts++;

wrong();

if(attempts>=2){

showHint(r.answer);

}

}

function init(){

document.querySelectorAll(".step").forEach(step=>{
step.addEventListener("click",()=>{
const go=step.dataset.go;
if(go) location.href=go;
});
});

input.addEventListener("keydown",e=>{
if(e.key==="Enter"){
e.preventDefault();
checkAnswer();
}
});

input.addEventListener("blur",checkAnswer);

loadRound(0);

}

document.addEventListener("DOMContentLoaded",init);

})();