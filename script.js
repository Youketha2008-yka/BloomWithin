const STORE_KEY = "bloomwithin-demo-v2";
const emptyState = {entries:[], routineAnswers:{}, topics:[], pcos:[], menopause:[], checkins:[], quizSaved:false};
let state = loadState();
function loadState(){try{return {...emptyState,...JSON.parse(localStorage.getItem(STORE_KEY)||"{}")}}catch(e){return {...emptyState}}}
function saveState(){try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch(e){console.warn("Local save unavailable",e)}}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
document.getElementById("entryDate").value=today();

function showPage(){
  const id=(location.hash||"#home").slice(1);
  const page=document.getElementById(id);
  const target=page&&page.classList.contains("page")?page:document.getElementById("home");
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p===target));
  document.querySelectorAll("nav a[data-page]").forEach(a=>a.classList.toggle("active",a.dataset.page===target.id));
  document.getElementById("mainNav").classList.remove("open");
  document.title=`${target.dataset.title||"BloomWithin"} | BloomWithin`;
  if(target.id==="summary")renderSummary();
  if(target.id==="wellbeing")renderLatestCheckin();
  window.scrollTo({top:0,behavior:"smooth"});
}
window.addEventListener("hashchange",showPage);
document.getElementById("menuToggle").addEventListener("click",()=>document.getElementById("mainNav").classList.toggle("open"));

document.getElementById("trackerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const interests=[...document.querySelectorAll('input[name="interest"]:checked')].map(x=>x.value);
  const entry={id:Date.now(),date:document.getElementById("entryDate").value,name:document.getElementById("personName").value.trim(),age:document.getElementById("personAge").value,symptom:document.getElementById("symptom").value,impact:document.getElementById("impact").value,interests,notes:document.getElementById("entryNotes").value.trim()};
  state.entries.unshift(entry);saveState();renderEntries();
  document.getElementById("trackerStatus").textContent="Demo entry saved in this browser.";
  document.getElementById("entryNotes").value="";document.getElementById("symptom").value="";document.getElementById("impact").value="";
  document.querySelectorAll('input[name="interest"]').forEach(x=>x.checked=false);
});
function entryMarkup(e){return `<article class="entry-item"><h3>${esc(e.date)} · ${esc(e.symptom)}</h3><p><b>Impact:</b> ${esc(e.impact)}${e.name?` · <b>Name:</b> ${esc(e.name)}`:""}${e.age?` · <b>Age:</b> ${esc(e.age)}`:""}</p>${e.interests?.length?`<p><b>Interests:</b> ${e.interests.map(esc).join(", ")}</p>`:""}${e.notes?`<p>${esc(e.notes)}</p>`:""}</article>`}
function renderEntries(){const el=document.getElementById("entryList");el.innerHTML=state.entries.length?state.entries.map(entryMarkup).join(""):'<p class="empty">No entries yet. Add a demo entry to see it here.</p>'}
document.getElementById("clearEntries").addEventListener("click",()=>{if(confirm("Clear all demo symptom entries from this browser?")){state.entries=[];saveState();renderEntries();document.getElementById("trackerStatus").textContent="Demo entries cleared."}});
renderEntries();

const routineQuestions=[
 {q:"How does your usual sleep routine feel?",options:["Mostly restful","It varies from day to day","I often struggle to sleep","I haven't noticed"]},
 {q:"How do you usually fit movement into your day?",options:["A walk or activity I enjoy","Small bits when I can","I spend most of the day sitting","It depends on the day"]},
 {q:"How would you describe your everyday energy?",options:["Fairly steady","Up and down","Often low","Not sure"]},
 {q:"When you feel stressed, what sounds most helpful?",options:["Talk to someone I trust","A quiet break or breathing","Movement or time outdoors","I'm still figuring that out"]}
];
let routineIndex=0;
function renderRoutine(){const q=routineQuestions[routineIndex];document.getElementById("routineCount").textContent=routineIndex+1;document.getElementById("routineQuiz").innerHTML=`<h2 class="question-title">${q.q}</h2><div class="quiz-options">${q.options.map((o,i)=>`<label class="quiz-option"><input type="radio" name="routineAnswer" value="${esc(o)}" ${state.routineAnswers[routineIndex]===o?"checked":""}><span>${esc(o)}</span></label>`).join("")}</div>`;document.getElementById("routineBack").disabled=routineIndex===0;document.getElementById("routineNext").textContent=routineIndex===routineQuestions.length-1?"Finish questions ✓":"Next question →";}
document.getElementById("routineBack").addEventListener("click",()=>{if(routineIndex>0){routineIndex--;renderRoutine()}});
document.getElementById("routineNext").addEventListener("click",()=>{const selected=document.querySelector('input[name="routineAnswer"]:checked');if(selected)state.routineAnswers[routineIndex]=selected.value;if(routineIndex<routineQuestions.length-1){routineIndex++;renderRoutine()}else{document.getElementById("routineStatus").textContent="You've reached the end! Save your demo responses below when you're ready.";document.getElementById("routineQuiz").innerHTML=`<h2 class="question-title">Nice work checking in 🌿</h2><p class="muted">There are no scores or perfect routines. Your answers are simply a reflection prompt.</p>`;document.getElementById("routineNext").disabled=true;}});
renderRoutine();

const topicNotes={
 pcos:"PCOS can affect menstrual cycles, skin and hair patterns. These signs can have other causes, so a qualified healthcare professional can help assess concerns.",
 periods:"Menstrual patterns can vary. If a change concerns you, is persistent, or affects daily life, consider discussing it with a qualified healthcare professional.",
 menopause:"Menopause experiences vary. Support is available; seek professional advice if symptoms affect everyday life or if you have bleeding after menopause.",
 wellbeing:"Rest, connection, enjoyable activities and a kind check-in may support everyday wellbeing. If difficult feelings persist or feel overwhelming, reach out to a trusted person or qualified professional."
};
document.querySelectorAll("[data-topic]").forEach(b=>b.addEventListener("click",()=>{const t=b.dataset.topic;document.getElementById("topicAnswer").textContent=topicNotes[t];state.topics=[...new Set([...state.topics,t])];saveState()}));
document.getElementById("saveQuiz").addEventListener("click",()=>{const selected=document.querySelector('input[name="routineAnswer"]:checked');if(selected)state.routineAnswers[routineIndex]=selected.value;state.quizSaved=true;saveState();document.getElementById("quizStatus").textContent="Your demo routine responses have been saved locally."});

function saveSelections(id,key,statusId,label){const values=[...document.querySelectorAll(`#${id} input:checked`)].map(x=>x.value);state[key]=values;saveState();document.getElementById(statusId).textContent=values.length?`${values.length} demo selection(s) saved.`:"Your empty selection has been saved."; }
document.getElementById("savePcos").addEventListener("click",()=>saveSelections("pcosOptions","pcos","pcosStatus","PCOS"));
document.getElementById("saveMeno").addEventListener("click",()=>saveSelections("menoOptions","menopause","menoStatus","Menopause"));

document.getElementById("wellbeingForm").addEventListener("submit",e=>{
 e.preventDefault();const mood=document.querySelector('input[name="mood"]:checked');const need=document.getElementById("todayNeed").value.trim();if(!mood||!need){document.getElementById("wellbeingStatus").textContent="Choose a mood and fill in what you need today.";return}
 state.checkins.unshift({id:Date.now(),date:today(),mood:mood.value,need});saveState();document.getElementById("todayNeed").value="";document.querySelectorAll('input[name="mood"]').forEach(x=>x.checked=false);document.getElementById("wellbeingStatus").textContent="Your check-in has been saved in this browser.";renderLatestCheckin();
});
function renderLatestCheckin(){const c=state.checkins[0];document.getElementById("latestCheckin").textContent=c?`${c.date} · Feeling ${c.mood}. “${c.need}”`:"No check-in saved yet."}
function renderSummary(){
 document.getElementById("summaryEntryCount").textContent=state.entries.length;document.getElementById("summaryPcosCount").textContent=state.pcos.length;document.getElementById("summaryMenoCount").textContent=state.menopause.length;document.getElementById("summaryCheckinCount").textContent=state.checkins.length;
 document.getElementById("summaryEntries").innerHTML=state.entries.length?state.entries.map(entryMarkup).join(""):'<p class="empty">No symptom entries to summarise yet.</p>';
 const topics=[];if(state.pcos.length)topics.push("PCOS: "+state.pcos.join(", "));if(state.menopause.length)topics.push("Menopause: "+state.menopause.join(", "));if(state.topics.length)topics.push("Health topics explored: "+state.topics.join(", "));if(state.quizSaved)topics.push("Daily routine mini-game: responses saved");document.getElementById("summaryLearning").textContent=topics.join(" · ")||"No learning choices saved yet.";
 document.getElementById("summaryCheckins").innerHTML=state.checkins.length?state.checkins.map(c=>`<article class="entry-item"><h3>${esc(c.date)} · Feeling ${esc(c.mood)}</h3><p>${esc(c.need)}</p></article>`).join(""):"No check-ins saved yet.";
}
document.getElementById("printSummary").addEventListener("click",()=>window.print());

const replies=[
 {keys:["pcos","polycystic"],text:"PCOS is a hormonal condition that can affect people differently. Changes in periods, skin or hair can have many causes. I can't tell what is causing a symptom, but a qualified healthcare professional can assess your history and discuss whether evaluation is appropriate."},
 {keys:["menopause","hot flash","night sweat"],text:"Menopause is a natural life stage, and experiences vary. Some people notice changes in periods, temperature, sleep, concentration or mood. If symptoms affect everyday life, a healthcare professional can discuss suitable support. Bleeding after menopause should be checked by a healthcare professional."},
 {keys:["period","cycle","menstrual"],text:"Menstrual patterns can change for different reasons. If a change is persistent, worrying, or affecting daily life, consider speaking with a qualified healthcare professional. Tracking dates and questions may help you prepare for that conversation."},
 {keys:["stress","sad","low","sorrow","upset","anxious","overwhelmed","feel"],text:"Thank you for putting that into words. You don't have to solve everything at once. If it feels helpful, try naming one small thing you need right now—rest, a little space, a chat with someone you trust, or practical help. If these feelings persist or feel too heavy to manage, reach out to a trusted adult or qualified professional."},
 {keys:["appointment","doctor","clinician","healthcare"],text:"You could write down what changed, roughly when it began, how often it happens, how it affects everyday life, and any questions you want answered. You don't need to figure out the cause yourself; a qualified healthcare professional can help assess it."},
 {keys:["sleep","routine","habit","energy"],text:"Routines look different for everyone. A gentle place to start might be a consistent wind-down time, a short break, drinking water when thirsty, or a bit of movement you enjoy. Choose what is realistic for you—this isn't a test."},
 {keys:["hello","hi","hey"],text:"Hi there 🌿 What would you like to explore today—PCOS awareness, menopause, tracking changes, or a little reflection about how you're feeling?"},
];
function getReply(message){const m=message.toLowerCase();const found=replies.find(r=>r.keys.some(k=>m.includes(k)));return found?found.text:"I'm glad you asked. I can share general information about PCOS, periods, menopause, everyday routines and emotional wellbeing. I can't diagnose or give personalised medical advice. Could you try asking about one of those topics, or share what kind of general information would be useful? For personal health concerns, please speak with a qualified healthcare professional."}
function addBubble(text,who){const div=document.createElement("div");div.className=`bubble ${who}`;div.textContent=text;document.getElementById("chatMessages").appendChild(div);document.getElementById("chatMessages").scrollTop=document.getElementById("chatMessages").scrollHeight}
function sendChat(text){const message=text.trim();if(!message)return;addBubble(message,"user");addBubble(getReply(message),"assistant")}
document.getElementById("chatForm").addEventListener("submit",e=>{e.preventDefault();const input=document.getElementById("chatInput");sendChat(input.value);input.value=""});
document.querySelectorAll("[data-prompt]").forEach(b=>b.addEventListener("click",()=>sendChat(b.dataset.prompt)));
showPage();renderLatestCheckin();