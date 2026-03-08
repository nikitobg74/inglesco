// u3_l2_p4.js
(() => {

const IMG_BASE = "../../../../assets/images/u3/";
const AUDIO_BASE = "../../../../assets/audio/u3/l2/";

const app = document.getElementById("app");
const sceneImg = document.getElementById("sceneImg");
const playBtn = document.getElementById("playBtn");
const audioEl = document.getElementById("audioEl");
const questionText = document.getElementById("questionText");
const promptEl = document.getElementById("prompt");
const slotsEl = document.getElementById("slots");
const tilesEl = document.getElementById("tiles");
const resetBtn = document.getElementById("resetBtn");
const feedbackEl = document.getElementById("feedback");
const roundStatus = document.getElementById("roundStatus");
const stepStatus = document.getElementById("stepStatus");
const nextBtn = document.getElementById("nextBtn");
const finishBox = document.getElementById("finishBox");
const finishTitle = document.getElementById("finishTitle");
const finishBody = document.getElementById("finishBody");
const instrText = document.getElementById("instrText");

const UI = {
  correct: app.dataset.correct || "Correct!",
  wrong: app.dataset.wrong || "✘",
  instr: app.dataset.instr || "",
  reset: app.dataset.reset || "Reset",
  stepLabel: app.dataset.stepLabel || "Step",
  finishTitle: app.dataset.finishTitle || "Finished!",
  finishBody: app.dataset.finishBody || ""
};

instrText.textContent = UI.instr;
resetBtn.textContent = UI.reset;
finishTitle.textContent = UI.finishTitle;
finishBody.textContent = UI.finishBody;

const SCENES = [
{
key:"brown",
img:"u3.l2.p4.brown.jpg",
dialogue:"u3.l2.p4.brown.mp3",
q1:{text:"Where is the Brown family?",tiles:["They","are","at","home."]},
q2:{text:"What are they doing?",tiles:["They","are","cooking","dinner."]}
},
{
key:"wilson",
img:"u3.l2.p4.wilson.jpg",
dialogue:"u3.l2.p4.wilson.mp3",
q1:{text:"Where is the Wilson family?",tiles:["They","are","at","the","restaurant."]},
q2:{text:"What are they doing?",tiles:["They","are","eating","dinner."]}
},
{
key:"taylor",
img:"u3.l2.p4.taylor.jpg",
dialogue:"u3.l2.p4.taylor.mp3",
q1:{text:"Where is the Taylor family?",tiles:["They","are","at","the","park."]},
q2:{text:"What are they doing?",tiles:["They","are","playing","soccer."]}
},
{
key:"tim_sally",
img:"u3.l2.p4.tim.sally.jpg",
dialogue:"u3.l2.p4.tim.sally.mp3",
q1:{text:"Where are Tim and Sally?",tiles:["They","are","in","the","living","room."]},
q2:{text:"What are they doing?",tiles:["They","are","watching","a","movie."]}
},
{
key:"walker",
img:"u3.l2.p4.walker.jpg",
dialogue:"u3.l2.p4.walker.mp3",
q1:{text:"Where is the Walker family?",tiles:["They","are","in","the","bedroom."]},
q2:{text:"What are they doing?",tiles:["They","are","reading","a","book."]}
}
];

let sceneIndex = 0;
let stage = 0;

let target = [];
let pool = [];
let chosen = [];

let locked = false;
let solvedCount = 0;

function shuffle(arr){
const a = arr.slice();
for(let i=a.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[a[i],a[j]]=[a[j],a[i]];
}
return a;
}

function setFeedback(type){
if(type==="ok"){
feedbackEl.textContent=UI.correct;
feedbackEl.className="feedback ok";
}
else if(type==="no"){
feedbackEl.textContent=UI.wrong;
feedbackEl.className="feedback no";
}
else{
feedbackEl.textContent="";
feedbackEl.className="feedback";
}
}

function setSlotsState(state){
const slots=slotsEl.querySelectorAll(".slot");
slots.forEach(s=>{
s.classList.remove("ok","no");
if(state==="ok")s.classList.add("ok");
if(state==="no")s.classList.add("no");
});
}

function loadAudio(file){
audioEl.pause();
audioEl.currentTime=0;
audioEl.src=AUDIO_BASE+file;
}

function playAudio(){
playBtn.disabled=true;
audioEl.play().catch(()=>{playBtn.disabled=false});
}

function renderStatus(){
roundStatus.textContent=`${sceneIndex+1}/${SCENES.length}`;
stepStatus.textContent=`${UI.stepLabel} ${Math.min(solvedCount+1,10)}/10`;
}

function renderImage(){
sceneImg.src=IMG_BASE+SCENES[sceneIndex].img;
}

function clearArea(){
slotsEl.innerHTML="";
tilesEl.innerHTML="";
chosen=[];
target=[];
pool=[];
setSlotsState(null);
}

function renderSlots(){
slotsEl.innerHTML="";

for(let i=0;i<target.length;i++){

const slot=document.createElement("div");
slot.className="slot";

if(chosen[i]){

slot.textContent=chosen[i];
slot.classList.add("filled");

slot.addEventListener("click",()=>{
if(locked)return;
chosen.splice(i,1);
setFeedback(null);
setSlotsState(null);
renderSlots();
renderTiles();
});

}
else{
slot.textContent="____";
}

slotsEl.appendChild(slot);
}
}

function renderTiles(){

tilesEl.innerHTML="";

pool.forEach(word=>{

const btn=document.createElement("button");
btn.type="button";
btn.className="tile";
btn.textContent=word;

btn.disabled=locked||chosen.includes(word);

btn.addEventListener("click",()=>{

if(locked)return;
if(chosen.length>=target.length)return;

chosen.push(word);

setFeedback(null);
setSlotsState(null);

renderSlots();
renderTiles();

if(chosen.length===target.length){
gradeNow();
}

});

tilesEl.appendChild(btn);

});
}

function isCorrect(){
for(let i=0;i<target.length;i++){
if(chosen[i]!==target[i])return false;
}
return true;
}

function lockUI(state){
locked=state;
renderTiles();
}

function gradeNow(){

lockUI(true);

if(isCorrect()){

setSlotsState("ok");
setFeedback("ok");

solvedCount++;
renderStatus();

setTimeout(()=>{
lockUI(false);
advance();
},2000);

}
else{

setSlotsState("no");
setFeedback("no");

lockUI(false);

}

}

function startListen(){

stage=0;

clearArea();
setFeedback(null);

renderStatus();
renderImage();

finishBox.classList.add("hidden");
nextBtn.classList.add("hidden");

playBtn.disabled=false;

questionText.textContent="▶ Escucha primero";
promptEl.textContent="Pulsa Play para escuchar.";

loadAudio(SCENES[sceneIndex].dialogue);
}

function startQ(num){

stage=num;

clearArea();
setFeedback(null);
renderStatus();
renderImage();

playBtn.disabled=true;

const scene=SCENES[sceneIndex];
const q=(num===1)?scene.q1:scene.q2;

questionText.textContent=q.text;
promptEl.textContent="Ordena las palabras:";

target=q.tiles.slice();
pool=shuffle(q.tiles.slice());

renderSlots();
renderTiles();
}

function advance(){

if(stage===1){
startQ(2);
return;
}

if(stage===2){

sceneIndex++;

if(sceneIndex>=SCENES.length){
finish();
return;
}

startListen();
}

}

function finish(){

stage=3;

clearArea();
setFeedback(null);

playBtn.disabled=true;

questionText.textContent="";
promptEl.textContent="";

finishBox.classList.remove("hidden");
nextBtn.classList.remove("hidden");

roundStatus.textContent=`${SCENES.length}/${SCENES.length}`;
stepStatus.textContent=`${UI.stepLabel} 10/10`;
}

playBtn.addEventListener("click",playAudio);

resetBtn.addEventListener("click",()=>{
if(locked)return;
chosen=[];
setFeedback(null);
setSlotsState(null);
renderSlots();
renderTiles();
});

audioEl.addEventListener("ended",()=>{

playBtn.disabled=false;

if(stage===0){
startQ(1);
}

});

startListen();

})();