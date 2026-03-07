/* STUDYVERSE v4 — app.js — All 35 features */

const DEFAULT_STATE={
  name:'',grade:'',subjects:[],xp:0,level:1,streak:0,best:0,lastActive:null,
  totalDone:0,studySec:0,tasks:[],friends:[],collabs:[],challenges:[],log:[],
  ach:{},focusGoal:'',focusGoalDone:false,weeklyLog:{},weeklyXpLog:{},
  notes:'',theme:'dark',
  pomoSettings:{focusMins:25,breakMins:5,longBreakMins:15,totalCycles:4},
  dailyGoal:{tasks:5,xp:50,studyMins:30},
  flashcardDecks:[],grades:[],sessionLog:[],timetable:[],
  customTags:['urgent','exam','revision','homework','project'],
  xpMult:1.0,multExpiry:null,notifEnabled:false,streakFreezes:0,pomoSound:'chime'
};
let S=JSON.parse(JSON.stringify(DEFAULT_STATE));
let allProfiles=[],activeIdx=0;

const LS_KEY='studyverse_v4',PRO_KEY='sv4_profiles';
let saveTimer=null;
function saveData(){
  try{
    allProfiles[activeIdx]={name:S.name,grade:S.grade,snap:JSON.parse(JSON.stringify(S))};
    localStorage.setItem(PRO_KEY,JSON.stringify({p:allProfiles,a:activeIdx}));
    showSaveIndicator();
  }catch(e){console.warn(e);}
}
function loadData(){
  try{
    const r=localStorage.getItem(PRO_KEY);
    if(r){const d=JSON.parse(r);allProfiles=d.p||[];activeIdx=d.a||0;
      if(allProfiles[activeIdx]?.snap){S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),allProfiles[activeIdx].snap);ensureDefaults();return!!S.name;}}
    const leg=localStorage.getItem('studyverse_v2');
    if(leg){const lp=JSON.parse(leg);if(lp.name){S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),lp);ensureDefaults();allProfiles=[{name:S.name,grade:S.grade,snap:JSON.parse(JSON.stringify(S))}];activeIdx=0;return true;}}
    return false;
  }catch(e){return false;}
}
function ensureDefaults(){
  ['weeklyLog','weeklyXpLog','ach','log','tasks','friends','collabs','challenges',
   'pomoSettings','dailyGoal','flashcardDecks','grades','sessionLog','timetable','customTags']
  .forEach(k=>{if(!S[k])S[k]=DEFAULT_STATE[k]||{};});
  S.tasks=Array.isArray(S.tasks)?S.tasks:[];
  S.friends=Array.isArray(S.friends)?S.friends:[];
  S.collabs=Array.isArray(S.collabs)?S.collabs:[];
  S.challenges=Array.isArray(S.challenges)?S.challenges:[];
  S.flashcardDecks=Array.isArray(S.flashcardDecks)?S.flashcardDecks:[];
  S.grades=Array.isArray(S.grades)?S.grades:[];
  S.sessionLog=Array.isArray(S.sessionLog)?S.sessionLog:[];
  S.timetable=Array.isArray(S.timetable)?S.timetable:[];
  S.customTags=Array.isArray(S.customTags)?S.customTags:DEFAULT_STATE.customTags;
  S.xpMult=S.xpMult||1.0;S.notifEnabled=S.notifEnabled||false;
}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(saveData,400);}
function showSaveIndicator(){const el=document.getElementById('save-ind');if(!el)return;el.classList.add('visible');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('visible'),1800);}

const LVL=['Novice','Apprentice','Student','Scholar','Sage','Prodigy','Genius','Master','Legend','Grand Master'];
const COLS=['#A78BFA','#2DD4BF','#FB7185','#E8C97A','#38BDF8','#F472B6'];
const QTS=["Ready to conquer today's goals?","Every session counts. Let's go! 🚀","Consistency is the engine of mastery.","Your future self thanks you. 💫","Small wins compound into greatness!","Deep work = deep rewards. ✦"];
const SUB_COLS={Math:'rgba(167,139,250,',Science:'rgba(45,212,191,',English:'rgba(56,189,248,',History:'rgba(251,113,133,',Art:'rgba(249,115,22,',CS:'rgba(132,204,22,',Other:'rgba(232,201,122,'};
const ACH=[
  {id:'f1',ic:'🌱',n:'First Step',d:'Complete your first task'},
  {id:'s3',ic:'🔥',n:'On Fire',d:'3-day study streak'},
  {id:'s7',ic:'⚡',n:'Week Warrior',d:'7-day study streak'},
  {id:'s30',ic:'💫',n:'Month Master',d:'30-day streak'},
  {id:'t5',ic:'🌟',n:'Task Master',d:'Complete 5 tasks'},
  {id:'t25',ic:'💪',n:'Powerhouse',d:'Complete 25 tasks'},
  {id:'t100',ic:'🚀',n:'Centurion',d:'Complete 100 tasks'},
  {id:'lv5',ic:'🏆',n:'Lv 5 Reached',d:'Reach level 5'},
  {id:'lv10',ic:'👑',n:'Grand Scholar',d:'Reach level 10'},
  {id:'x500',ic:'💎',n:'XP Hoarder',d:'Earn 500 total XP'},
  {id:'x2k',ic:'🌠',n:'XP Legend',d:'Earn 2000 total XP'},
  {id:'st60',ic:'📚',n:'Study Hour',d:'Study for 60 minutes'},
  {id:'st5h',ic:'🧠',n:'Deep Learner',d:'Study 5 hours total'},
  {id:'fr3',ic:'🤝',n:'Social',d:'Add 3 friends'},
  {id:'co1',ic:'🤜',n:'Collaborator',d:'Complete a collab task'},
  {id:'fn1',ic:'🌙',n:'Night Owl',d:'Use DND focus mode'},
  {id:'np1',ic:'📝',n:'Note Taker',d:'Write your first study note'},
  {id:'exp1',ic:'📤',n:'Data Keeper',d:'Export your data'},
  {id:'rec1',ic:'🔁',n:'Routine Builder',d:'Create a recurring task'},
  {id:'sub1',ic:'✅',n:'Subtask Hero',d:'Complete a task with subtasks'},
  {id:'fc10',ic:'🃏',n:'Flashcard Fan',d:'Create 10+ flashcards'},
  {id:'gr5',ic:'📊',n:'Grade Logger',d:'Log 5+ grades'},
  {id:'ch1',ic:'⚔️',n:'Challenge Winner',d:'Win a friend challenge'},
  {id:'dg1',ic:'🎯',n:'Goal Crusher',d:'Hit your daily goal'},
  {id:'mult1',ic:'⚡',n:'Multiplier',d:'Activate an XP multiplier'},
];

let tmTask=null,tmDur=0,tmLeft=0,tmRunning=false,tmIv=null;
let dndMode='clock',dndSec=25*60,dndTotal=25*60,dndRun=false,dndIv=null,dndUsed=false;
let soundOn=false,ambCtx=null,ambNode=null;
let taskSortMode='created',dragSrcId=null;
let pomoState={phase:'focus',cycle:0,totalCycles:4,focusMins:25,breakMins:5,longBreakMins:15,running:false,sec:25*60,total:25*60,iv:null};
let flashDeckId=null,flashIdx=0,flashFlipped=false;
let selectedTasks=new Set();
let pwaPrompt=null;

/* ── BOOT ── */
function boot(){
  const n=document.getElementById('nm').value.trim();if(!n){document.getElementById('nm').focus();return;}
  const grade=document.getElementById('ob-grade').value;
  const subs=[...document.querySelectorAll('.ob-sub-btn.sel')].map(b=>b.dataset.sub);
  S.name=n;S.grade=grade;S.subjects=subs.length?subs:['Math','Science','English'];
  const today=new Date().toDateString();S.lastActive=today;if(!S.log.includes(today))S.log.push(today);S.streak=1;
  allProfiles=[{name:n,grade,snap:JSON.parse(JSON.stringify(S))}];activeIdx=0;
  saveData();launchApp();toast('🎉',`Welcome, ${n}!`,'tgo');requestNotifPermission();
}
document.getElementById('nm').addEventListener('keydown',e=>{if(e.key==='Enter')boot();});
function toggleObSub(el){el.classList.toggle('sel');}

function launchApp(){
  document.getElementById('ob').classList.add('hide');
  document.getElementById('app').classList.add('visible');
  
  setInterval(tickClock,1000);tickClock();spawnStars();applyTheme();syncPomoSettings();
  setTimeout(()=>{
    refresh();buildAch();initQuotes();renderWeeklySummary();renderSubChips();updPomoDisp();
    loadNotes();renderTimetable();renderFlashcards();renderGrades();renderStats();
    renderSessionLog();renderProfiles();renderDailyGoalBar();renderChallenges();populateTagFilter();renderDailyGoalSettings();
  },600);
  scheduleStreakReminder();showPWABanner();
}
window.addEventListener('DOMContentLoaded',()=>{if(loadData()&&S.name){updStreak();launchApp();}});

/* ── CLOCK ── */
function tickClock(){
  const now=new Date();
  const h=now.getHours().toString().padStart(2,'0'),m=now.getMinutes().toString().padStart(2,'0'),s=now.getSeconds().toString().padStart(2,'0');
  const ec=document.getElementById('dclk'),ed=document.getElementById('ddt');
  if(ec)ec.textContent=`${h}:${m}:${s}`;
  const D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const Mo=['January','February','March','April','May','June','July','August','September','October','November','December'];
  if(ed)ed.textContent=`${D[now.getDay()]}, ${Mo[now.getMonth()]} ${now.getDate()}`;
}

/* ── STREAK ── */
function updStreak(){
  const today=new Date().toDateString();
  if(!S.log.includes(today))S.log.push(today);
  if(S.lastActive&&S.lastActive!==today){const diff=(new Date(today)-new Date(S.lastActive))/86400000;if(diff>1&&S.streakFreezes>0){useStreakFreeze();}else S.streak=diff<=1?S.streak+1:1;}
  S.lastActive=today;if(S.streak>S.best)S.best=S.streak;scheduleSave();
}

/* ── REFRESH ── */
function refresh(){
  const done=S.tasks.filter(t=>t.done).length,pend=S.tasks.filter(t=>!t.done).length;
  const mins=Math.floor(S.studySec/60),hrs=Math.floor(mins/60);
  const ts=hrs>0?`${hrs}h ${mins%60}m`:`${mins}m`;
  const el=id=>document.getElementById(id);
  if(el('nstr'))el('nstr').textContent=S.streak;
  if(el('nxp'))el('nxp').textContent=S.xp;
  if(el('nav'))el('nav').textContent=S.name?S.name[0].toUpperCase():'?';
  [['hname',S.name],['hdone',done],['hstr',S.streak],['hlvl',S.level],['hhrs',ts]].forEach(([id,v])=>{if(el(id))el(id).textContent=v;});
  const hq=el('hq');if(hq)hq.textContent=QTS[Math.floor(Math.random()*QTS.length)];
  [['scdone',done],['scpend',pend],['scstr',S.streak]].forEach(([id,v])=>{if(el(id))el(id).textContent=v;});
  [['rwxp',S.xp],['rwlvl',S.level],['rwdone',done],['rwstr',S.best]].forEach(([id,v])=>{if(el(id))el(id).textContent=v;});
  checkXPMult();updLvlUI();const fc=el('freeze-count');if(fc)fc.textContent=S.streakFreezes||0;buildStreak();renderTasks();renderDash();renderLB();renderCollab();
  buildAch();renderWeeklySummary();renderSubChips();loadNotes();renderDailyGoalBar();renderSessionLog();updBulkBar();
}
function thr(l){return l*100+l*(l-1)*10;}
function updLvlUI(){
  const l=S.level,xp=S.xp,cur=thr(l-1),nxt=thr(l);
  const pct=Math.min(100,((xp-cur)/(nxt-cur))*100)||0;
  const ttl=LVL[Math.min(l-1,LVL.length-1)];
  const ids={lbnum:`Lv ${l}`,lbtit:`${ttl} Scholar`,lbsub:`Keep going to reach Level ${l+1}!`,lbxpf:`${xp} / ${nxt} XP`,xpnote:`${nxt-xp} XP to next level`};
  Object.entries(ids).forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v;});
  const xpf=document.getElementById('xpf');if(xpf)xpf.style.width=pct+'%';
}

/* ── XP MULTIPLIER ── */
function checkXPMult(){
  if(S.multExpiry&&Date.now()>S.multExpiry){S.xpMult=1.0;S.multExpiry=null;}
  const b=document.getElementById('mult-badge');
  if(b){b.style.display=S.xpMult>1?'inline-flex':'none';b.textContent=`⚡${S.xpMult}×`;}
}
function activateMult(mult,mins){
  S.xpMult=mult;S.multExpiry=Date.now()+mins*60000;
  if(!S.ach['mult1']){S.ach['mult1']=true;}
  toast('⚡',`${mult}× XP active for ${mins} min!`,'ttl');checkXPMult();scheduleSave();
}
function checkEarlyBird(){const h=new Date().getHours();if(h>=5&&h<9&&S.xpMult===1.0){activateMult(1.5,60);toast('🌅','Early Bird bonus! 1.5× XP for 1h','ttl');}}
function gainXP(amt,reason){
  const eff=Math.round(amt*(S.xpMult||1));
  const prev=S.level;S.xp+=eff;
  const today=new Date().toDateString();
  S.weeklyXpLog=S.weeklyXpLog||{};S.weeklyXpLog[today]=(S.weeklyXpLog[today]||0)+eff;
  while(S.xp>=thr(S.level))S.level++;
  if(S.level>prev){showLU();confetti();}
  refresh();renderWeeklySummary();renderSubChips();
  toast('⚡',`+${eff} XP${S.xpMult>1?' ('+S.xpMult+'×)':''} — ${reason}`,'tgo');checkAch();scheduleSave();
}

/* ── TASKS ── */
function addTask(){
  const name=document.getElementById('tname').value.trim();if(!name){document.getElementById('tname').focus();return;}
  const sub=document.getElementById('tsub').value,pri=document.getElementById('tpri').value;
  const hr=parseInt(document.getElementById('thr').value)||0,mn=parseInt(document.getElementById('tmn').value)||0,sc=parseInt(document.getElementById('tsc').value)||0;
  const dur=(hr*3600)+(mn*60)+sc||1800;
  const due=document.getElementById('tdue').value||'';
  const notes=document.getElementById('tnotes').value.trim()||'';
  const recur=document.getElementById('trecur').value||'none';
  const tagV=document.getElementById('ttag').value.trim()||'';
  const tags=tagV?tagV.split(',').map(t=>t.trim()).filter(Boolean):[];
  S.tasks.unshift({id:Date.now(),name,sub,pri,dur,done:false,due,notes,recur,tags,subtasks:[],createdAt:Date.now(),completedAt:null,timeSpent:0});
  ['tname','thr','tmn','tsc','tnotes','ttag'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
  document.getElementById('tdue').value='';document.getElementById('trecur').value='none';
  const today=new Date().toDateString();S.weeklyLog=S.weeklyLog||{};S.weeklyLog[today]=S.weeklyLog[today]||{tasks:0};
  if(recur!=='none'&&!S.ach['rec1']){S.ach['rec1']=true;buildAch();toast('🔁','Achievement: Routine Builder!','tgo');}
  gainXP(5,'Task created');toast('📌',`"${name}" added!`,'tgo');scheduleSave();checkEarlyBird();
}
function completeTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t||t.done)return;
  if(t.subtasks&&t.subtasks.some(s=>!s.done)){toast('⚠️','Finish all subtasks first!','trs');return;}
  t.done=true;t.completedAt=Date.now();S.totalDone++;
  if(t.subtasks&&t.subtasks.length&&!S.ach['sub1']){S.ach['sub1']=true;buildAch();toast('✅','Achievement: Subtask Hero!','tgo');}
  const today=new Date().toDateString();S.weeklyLog=S.weeklyLog||{};S.weeklyLog[today]=S.weeklyLog[today]||{tasks:0};S.weeklyLog[today].tasks++;
  const xp=t.pri==='high'?30:t.pri==='med'?20:10;
  logSession('task',t.name,xp,0);gainXP(xp,`"${t.name}" completed`);confetti();updStreak();
  toast('✅',`"${t.name}" done! +${xp}XP`,'ttl');playCompleteSound();
  if(t.recur&&t.recur!=='none')spawnRecurring(t);
  scheduleSave();checkDailyGoal();updateChallengeProgress('tasks');
}
function spawnRecurring(t){
  const copy=JSON.parse(JSON.stringify(t));copy.id=Date.now()+1;copy.done=false;copy.completedAt=null;copy.timeSpent=0;
  copy.subtasks=(t.subtasks||[]).map(s=>({...s,done:false}));
  if(t.due){const d=new Date(t.due);if(t.recur==='daily')d.setDate(d.getDate()+1);else if(t.recur==='weekly')d.setDate(d.getDate()+7);else if(t.recur==='monthly')d.setMonth(d.getMonth()+1);copy.due=d.toISOString().slice(0,10);}
  copy.createdAt=Date.now()+2;S.tasks.unshift(copy);toast('🔁',`"${t.name}" rescheduled`,'tgo');
}
function deleteTask(id){S.tasks=S.tasks.filter(t=>t.id!==id);selectedTasks.delete(id);renderTasks();renderDash();scheduleSave();}
function addSubtask(taskId){
  const inp=document.getElementById(`sti-${taskId}`);if(!inp)return;
  const txt=inp.value.trim();if(!txt)return;
  const t=S.tasks.find(x=>x.id===taskId);if(!t)return;
  t.subtasks.push({id:Date.now(),text:txt,done:false});inp.value='';renderTasks();scheduleSave();
}
function toggleSubtask(taskId,subId){
  const t=S.tasks.find(x=>x.id===taskId);if(!t)return;
  const s=t.subtasks.find(x=>x.id===subId);if(!s)return;
  s.done=!s.done;renderTasks();scheduleSave();
}
function toggleSelectTask(id){selectedTasks.has(id)?selectedTasks.delete(id):selectedTasks.add(id);renderTasks();updBulkBar();}
function selectAllTasks(){S.tasks.filter(t=>!t.done).forEach(t=>selectedTasks.add(t.id));renderTasks();updBulkBar();}
function clearSelection(){selectedTasks.clear();renderTasks();updBulkBar();}
function bulkComplete(){[...selectedTasks].forEach(id=>completeTask(id));clearSelection();}
function bulkDelete(){if(!confirm(`Delete ${selectedTasks.size} tasks?`))return;S.tasks=S.tasks.filter(t=>!selectedTasks.has(t.id));clearSelection();renderTasks();renderDash();scheduleSave();}
function clearCompleted(){S.tasks=S.tasks.filter(t=>!t.done);renderTasks();scheduleSave();toast('🗑️','Completed tasks cleared','tgo');}
function updBulkBar(){const b=document.getElementById('bulk-bar');if(!b)return;b.style.display=selectedTasks.size?'flex':'none';const c=document.getElementById('bulk-cnt');if(c)c.textContent=`${selectedTasks.size} selected`;}
function fmtD(sec){const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;if(h>0)return`${h}h ${m}m`;if(m>0)return`${m}m${s>0?' '+s+'s':''}`.trim();return`${s}s`;}
function setSortMode(mode){taskSortMode=mode;document.querySelectorAll('.sort-btn').forEach(b=>b.classList.toggle('active',b.dataset.sort===mode));renderTasks();}
function populateTagFilter(){const sel=document.getElementById('ttagfilter');if(!sel)return;const used=new Set();S.tasks.forEach(t=>(t.tags||[]).forEach(tg=>used.add(tg)));sel.innerHTML=`<option value="">All tags</option>`+[...used].map(tg=>`<option value="${tg}">#${tg}</option>`).join('');}
function renderTasks(){
  const flt=document.getElementById('tfilter')?.value||'all';
  const query=(document.getElementById('tsearch')?.value||'').toLowerCase().trim();
  const tagF=document.getElementById('ttagfilter')?.value||'';
  let act=S.tasks.filter(t=>!t.done),dn=S.tasks.filter(t=>t.done);
  if(flt!=='all')act=act.filter(t=>t.pri===flt);
  if(tagF)act=act.filter(t=>(t.tags||[]).includes(tagF));
  if(activeSubFilter)act=act.filter(t=>t.sub===activeSubFilter);
  if(query)act=act.filter(t=>t.name.toLowerCase().includes(query)||t.sub.toLowerCase().includes(query)||(t.notes||'').toLowerCase().includes(query));
  const sortFn=(a,b)=>{if(taskSortMode==='name')return a.name.localeCompare(b.name);if(taskSortMode==='priority'){const o={high:0,med:1,low:2};return o[a.pri]-o[b.pri];}if(taskSortMode==='due'){if(!a.due&&!b.due)return 0;if(!a.due)return 1;if(!b.due)return -1;return new Date(a.due)-new Date(b.due);}return b.createdAt-a.createdAt;};
  act.sort(sortFn);
  const ac=document.getElementById('actcnt');if(ac)ac.textContent=`(${act.length})`;
  const tl=document.getElementById('tlist'),dl=document.getElementById('dlist');if(!tl)return;
  tl.innerHTML=act.length?act.map(tHTML).join(''):`<div class="empty"><div class="empi">🎯</div><p>No tasks here. Add one above!</p></div>`;
  dl.innerHTML=dn.length?dn.map(tHTML).join(''):`<div class="empty" style="padding:20px"><p>No completed tasks yet</p></div>`;
  tl.querySelectorAll('.ti[draggable]').forEach(el=>{
    el.addEventListener('dragstart',()=>{dragSrcId=parseInt(el.dataset.id);el.classList.add('dragging');});
    el.addEventListener('dragover',e=>{e.preventDefault();el.classList.add('drag-over');});
    el.addEventListener('dragleave',()=>el.classList.remove('drag-over'));
    el.addEventListener('drop',e=>{
      e.preventDefault();el.classList.remove('drag-over');
      const dstId=parseInt(el.dataset.id);if(dragSrcId===dstId)return;
      const si=S.tasks.findIndex(t=>t.id===dragSrcId),di=S.tasks.findIndex(t=>t.id===dstId);
      if(si<0||di<0)return;const[moved]=S.tasks.splice(si,1);S.tasks.splice(di,0,moved);renderTasks();scheduleSave();
    });
    el.addEventListener('dragend',()=>el.classList.remove('dragging'));
  });
}
function tHTML(t){
  const pc=t.pri==='high'?'tghi':t.pri==='med'?'tgmd':'tglo';
  const pl=t.pri==='high'?'🔴 High':t.pri==='med'?'🟡 Med':'🟢 Low';
  let dueTag='';
  if(t.due&&!t.done){const diff=Math.ceil((new Date(t.due)-new Date())/86400000);if(diff<0)dueTag=`<span class="tg tg-due-over">🚨 ${Math.abs(diff)}d overdue</span>`;else if(diff<=2)dueTag=`<span class="tg tg-due-soon">⚠️ Due in ${diff}d</span>`;else dueTag=`<span class="tg tg-due-ok">📅 ${t.due}</span>`;}
  const tagBadges=(t.tags||[]).map(tg=>`<span class="tg" style="background:rgba(56,189,248,.1);color:var(--sky);border-color:rgba(56,189,248,.2)">#${tg}</span>`).join('');
  const recurBadge=t.recur&&t.recur!=='none'?`<span class="tg" style="background:rgba(167,139,250,.1);color:var(--violet);border-color:rgba(167,139,250,.2)">🔁 ${t.recur}</span>`:'';
  const notesSnip=t.notes?`<div style="font-size:11px;color:var(--text3);margin-top:4px;font-style:italic">📝 ${t.notes.slice(0,60)}${t.notes.length>60?'…':''}</div>`:'';
  const stD=(t.subtasks||[]).filter(s=>s.done).length,stT=(t.subtasks||[]).length;
  const stBar=stT>0?`<div style="display:flex;align-items:center;gap:8px;margin-top:5px;font-size:11px;color:var(--text3)"><div style="flex:1;height:3px;background:var(--rim);border-radius:2px"><div style="height:100%;border-radius:2px;background:var(--teal);width:${Math.round(stD/stT*100)}%"></div></div>${stD}/${stT} subtasks</div>`:'';
  const stList=stT>0?`<div class="subtask-list">${(t.subtasks||[]).map(s=>`<div class="subtask-row"><div class="ticheck ${s.done?'chk':''}" style="width:16px;height:16px;font-size:9px" onclick="toggleSubtask(${t.id},${s.id})">${s.done?'✓':''}</div><span style="${s.done?'text-decoration:line-through;opacity:.45':''};">${s.text}</span></div>`).join('')}</div>`:'';
  const doneInfo=t.done&&t.completedAt?`<div style="font-size:10px;color:var(--text3);margin-top:2px">✅ ${new Date(t.completedAt).toLocaleDateString()}${t.timeSpent>0?' · '+fmtD(t.timeSpent):''}</div>`:'';
  const sel=selectedTasks.has(t.id);
  return `<div class="ti ${t.done?'done':''} ${sel?'ti-selected':''}" id="ti-${t.id}" draggable="${!t.done}" data-id="${t.id}">
    <div class="ticheck ${t.done?'chk':''}" onclick="${t.done?'':(`completeTask(${t.id})`)}">${t.done?'✓':''}</div>
    <div class="tiinfo">
      <div class="tiname">${highlightText(t.name,document.getElementById('tsearch')?.value||'')||t.name}<span class="select-dot ${sel?'sel':''}" onclick="toggleSelectTask(${t.id})"></span></div>
      <div class="titags"><span class="tg tgsub">${t.sub}</span><span class="tg ${pc}">${pl}</span><span class="tg tgtm">⏱ ${fmtD(t.dur)}</span>${dueTag}${tagBadges}${recurBadge}</div>
      ${notesSnip}${doneInfo}${stBar}
      <div class="subtask-wrap" id="stw-${t.id}" style="display:none">${stList}<div class="st-add-row"><input class="fi" id="sti-${t.id}" placeholder="Add subtask…" style="padding:5px 10px;font-size:12px" onkeydown="if(event.key==='Enter')addSubtask(${t.id})"><button class="tbtn" onclick="addSubtask(${t.id})">+</button></div></div>
    </div>
    <div class="tia">
      ${!t.done?`<button class="tbtn" onclick="openTM(${t.id})">▶</button>`:''}
      ${!t.done?`<button class="tbtn" onclick="document.getElementById('stw-${t.id}').style.display=document.getElementById('stw-${t.id}').style.display==='none'?'block':'none'" title="Subtasks">☰</button>`:''}
      ${!t.done?`<button class="tbtn" style="background:rgba(232,201,122,.07);color:var(--gold);border-color:rgba(232,201,122,.2)" onclick="openEditTask(${t.id})">✏️</button>`:''}
      <button class="tdel" onclick="deleteTask(${t.id})">✕</button>
    </div>
  </div>`;
}
function renderDash(){
  renderNextDue();
  const el=document.getElementById('dashtasks');if(!el)return;
  const ts=S.tasks.filter(t=>!t.done).slice(0,5);
  if(!ts.length){el.innerHTML=`<div class="empty"><div class="empi">✅</div><p>All clear for today!</p></div>`;return;}
  el.innerHTML=ts.map(t=>`<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--rim)">
    <div class="ticheck" onclick="completeTask(${t.id})" style="cursor:pointer"></div>
    <div style="flex:1;font-size:14px">${t.name}</div>
    <span class="tg tgtm">${fmtD(t.dur)}</span>
  </div>`).join('');
}

/* ── DAILY GOAL ── */
function checkDailyGoal(){
  const today=new Date().toDateString();
  const doneTdy=S.tasks.filter(t=>t.done&&t.completedAt&&new Date(t.completedAt).toDateString()===today).length;
  const xpTdy=S.weeklyXpLog[today]||0;const studyM=Math.floor(S.studySec/60);
  if(doneTdy>=S.dailyGoal.tasks&&xpTdy>=S.dailyGoal.xp&&studyM>=S.dailyGoal.studyMins){
    if(!S.ach['dg1']){S.ach['dg1']=true;buildAch();gainXP(50,'Daily Goal Crusher!');confetti();toast('🎯','Daily goal complete! +50 XP','ttl');}
  }
  renderDailyGoalBar();
}
function renderDailyGoalBar(){
  const today=new Date().toDateString();
  const doneTdy=S.tasks.filter(t=>t.done&&t.completedAt&&new Date(t.completedAt).toDateString()===today).length;
  const xpTdy=S.weeklyXpLog[today]||0;const studyM=Math.floor(S.studySec/60);const g=S.dailyGoal;
  const p1=Math.min(100,Math.round(doneTdy/Math.max(g.tasks,1)*100));
  const p2=Math.min(100,Math.round(xpTdy/Math.max(g.xp,1)*100));
  const p3=Math.min(100,Math.round(studyM/Math.max(g.studyMins,1)*100));
  const el=id=>document.getElementById(id);
  if(el('dg-tasks-v'))el('dg-tasks-v').textContent=`${doneTdy}/${g.tasks}`;
  if(el('dg-xp-v'))el('dg-xp-v').textContent=`${xpTdy}/${g.xp}`;
  if(el('dg-study-v'))el('dg-study-v').textContent=`${studyM}/${g.studyMins}m`;
  if(el('dg-tasks-bar'))el('dg-tasks-bar').style.width=p1+'%';
  if(el('dg-xp-bar'))el('dg-xp-bar').style.width=p2+'%';
  if(el('dg-study-bar'))el('dg-study-bar').style.width=p3+'%';
}
function renderDailyGoalSettings(){
  const el=id=>document.getElementById(id);
  if(el('dg-set-tasks'))el('dg-set-tasks').value=S.dailyGoal.tasks;
  if(el('dg-set-xp'))el('dg-set-xp').value=S.dailyGoal.xp;
  if(el('dg-set-study'))el('dg-set-study').value=S.dailyGoal.studyMins;
}
function saveDailyGoal(){
  const el=id=>document.getElementById(id);
  S.dailyGoal={tasks:parseInt(el('dg-set-tasks')?.value)||5,xp:parseInt(el('dg-set-xp')?.value)||50,studyMins:parseInt(el('dg-set-study')?.value)||30};
  scheduleSave();toast('🎯','Daily goals saved!','tgo');renderDailyGoalBar();
}

/* ── STREAK CALENDAR ── */
function buildStreak(){
  const g=document.getElementById('stgrid');if(!g)return;
  const today=new Date().toDateString();let html='';
  for(let i=27;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const ds=d.toDateString(),day=d.getDate();const isT=ds===today,done=S.log.includes(ds);let cls='sd';if(done&&isT)cls+=' done today fire';else if(done)cls+=' done';else if(isT)cls+=' today';html+=`<div class="${cls}" title="${ds}">${day}</div>`;}
  g.innerHTML=html;
}

/* ── TASK TIMER ── */
function openTM(id){const t=S.tasks.find(x=>x.id===id);if(!t)return;tmTask=t;tmDur=t.dur;tmLeft=t.dur;tmRunning=false;clearInterval(tmIv);document.getElementById('tmnm').textContent=`📌 ${t.name}`;document.getElementById('tmplay').textContent='▶ Start';updTM();document.getElementById('tmov').classList.add('open');}
function closeTM(){document.getElementById('tmov').classList.remove('open');clearInterval(tmIv);tmRunning=false;}
function resetTM(){clearInterval(tmIv);tmRunning=false;tmLeft=tmDur;document.getElementById('tmplay').textContent='▶ Start';updTM();}
function toggleTM(){
  tmRunning=!tmRunning;document.getElementById('tmplay').textContent=tmRunning?'⏸ Pause':'▶ Start';
  if(tmRunning){
    const s0=tmLeft;
    tmIv=setInterval(()=>{
      if(tmLeft<=0){clearInterval(tmIv);tmRunning=false;document.getElementById('tmplay').textContent='▶ Start';
        const spent=s0;S.studySec+=spent;if(tmTask)tmTask.timeSpent=(tmTask.timeSpent||0)+spent;
        const xp=Math.floor(spent/300)*2;logSession('focus',tmTask?tmTask.name:'Focus',xp,spent);
        gainXP(xp,'Focus session complete');confetti();toast('🎉','Session complete!','ttl');closeTM();scheduleSave();checkDailyGoal();updateChallengeProgress('study');return;}
      tmLeft--;updTM();
    },1000);
  }else clearInterval(tmIv);
}
function updTM(){const m=Math.floor(tmLeft/60).toString().padStart(2,'0'),s=(tmLeft%60).toString().padStart(2,'0');document.getElementById('tmdisp').textContent=`${m}:${s}`;const pct=tmDur>0?(1-tmLeft/tmDur):0;document.getElementById('tmring').setAttribute('stroke-dashoffset',603.19*(1-pct));}

/* ── DND ── */
function openDND(){document.getElementById('dnd').classList.add('open');document.body.style.overflow='hidden';startFocusMessages();if(!dndUsed){dndUsed=true;S.ach['fn1']=true;toast('🌙','Achievement: Night Owl!','tgo');scheduleSave();}}
function closeDND(){document.getElementById('dnd').classList.remove('open');document.body.style.overflow='';clearInterval(dndIv);dndRun=false;stopAmbient();stopFocusMessages();}
function dndSw(m){
  dndMode=m;['dswc','dswt','dswp'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('active');});
  const map={clock:'dswc',timer:'dswt',pomo:'dswp'};document.getElementById(map[m])?.classList.add('active');
  document.getElementById('dclkv').style.display=m==='clock'?'block':'none';
  document.getElementById('dtmrv').style.display=m==='timer'?'block':'none';
  document.getElementById('dsetrow').style.display=m==='timer'?'flex':'none';
  document.getElementById('dctrls').style.display=m==='timer'?'flex':'none';
  document.getElementById('dndpomov').style.display=m==='pomo'?'block':'none';
  document.getElementById('dnd-pomo-ctrls').style.display=m==='pomo'?'flex':'none';
  if(m==='timer'){clearInterval(dndIv);dndRun=false;updDR();}if(m==='pomo'){clearInterval(dndIv);dndRun=false;updPomoDisp();}
}
function setDT(){const h=parseInt(document.getElementById('dnh').value)||0,m=parseInt(document.getElementById('dnm').value)||0,s=parseInt(document.getElementById('dns').value)||0;dndSec=h*3600+m*60+s||25*60;dndTotal=dndSec;clearInterval(dndIv);dndRun=false;document.getElementById('dplay').textContent='▶';updDR();}
function toggleDT(){dndRun=!dndRun;document.getElementById('dplay').textContent=dndRun?'⏸':'▶';if(dndRun){dndIv=setInterval(()=>{if(dndSec<=0){clearInterval(dndIv);dndRun=false;document.getElementById('dplay').textContent='▶';S.studySec+=dndTotal;const xp=Math.floor(dndTotal/300)*3;logSession('focus','Deep Focus',xp,dndTotal);gainXP(xp,`Deep focus: ${fmtD(dndTotal)}`);confetti();toast('🌙',`Focus complete! +${xp}XP`,'tgo');scheduleSave();checkDailyGoal();return;}dndSec--;updDR();},1000);}else clearInterval(dndIv);}
function resetDT(){clearInterval(dndIv);dndRun=false;dndSec=dndTotal;document.getElementById('dplay').textContent='▶';updDR();}
function addDTMin(m){dndSec+=m*60;dndTotal+=m*60;updDR();}
function updDR(){const m=Math.floor(dndSec/60).toString().padStart(2,'0'),s=(dndSec%60).toString().padStart(2,'0');const el=document.getElementById('dbigt');if(el)el.textContent=`${m}:${s}`;const pct=dndTotal>0?(1-dndSec/dndTotal):0;const r=document.getElementById('dring');if(r)r.setAttribute('stroke-dashoffset',816.81*(1-pct));}
function spawnStars(){const c=document.getElementById('dstars');if(!c)return;for(let i=0;i<80;i++){const el=document.createElement('div');el.className='dstar';const sz=Math.random()*2.5+.5;el.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-duration:${2+Math.random()*5}s;animation-delay:${Math.random()*6}s;`;c.appendChild(el);}}

/* ── AMBIENT SOUNDS ── */
function playAmbient(type){
  stopAmbient();
  try{
    ambCtx=new(window.AudioContext||window.webkitAudioContext)();
    const g=ambCtx.createGain();g.gain.value=0.12;g.connect(ambCtx.destination);
    if(type==='rain'||type==='white'){const buf=ambCtx.createBuffer(1,ambCtx.sampleRate*3,ambCtx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1);const src=ambCtx.createBufferSource();src.buffer=buf;src.loop=true;if(type==='rain'){const f=ambCtx.createBiquadFilter();f.type='lowpass';f.frequency.value=600;src.connect(f);f.connect(g);}else src.connect(g);src.start();ambNode=src;}
    else if(type==='forest'){const osc=ambCtx.createOscillator();osc.frequency.value=160;osc.type='sine';const lfo=ambCtx.createOscillator();lfo.frequency.value=0.3;const lg=ambCtx.createGain();lg.gain.value=40;lfo.connect(lg);lg.connect(osc.frequency);osc.connect(g);osc.start();lfo.start();ambNode=osc;}
    document.querySelectorAll('.amb-btn').forEach(b=>b.classList.toggle('active',b.dataset.amb===type));
    toast('🎵',`${type} ambient on`,'tgo');
  }catch(e){toast('❌','Audio unavailable','trs');}
}
function stopAmbient(){try{if(ambNode)ambNode.stop();if(ambCtx)ambCtx.close();}catch(e){}ambNode=null;ambCtx=null;document.querySelectorAll('.amb-btn').forEach(b=>b.classList.remove('active'));}

/* ── NAV ── */
function goPage(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.ntab,.mob-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(`page-${id}`)?.classList.add('active');
  if(btn)btn.classList.add('active');
  document.querySelectorAll(`.mob-tab[data-page="${id}"]`).forEach(b=>b.classList.add('active'));
  refresh();
  if(id==='stats')renderStats();if(id==='flashcards')renderFlashcards();if(id==='grades')renderGrades();if(id==='timetable')renderTimetable();if(id==='notes')loadNotes();
}

/* ── FRIENDS + REMOVE + CHALLENGES ── */
function addFriend(){const n=document.getElementById('fname').value.trim();if(!n)return;S.friends.push({id:Date.now(),name:n,xp:Math.floor(Math.random()*900)+50,col:COLS[S.friends.length%COLS.length]});document.getElementById('fname').value='';renderLB();gainXP(10,`Added friend ${n}`);toast('👥',`${n} added!`,'ttl');checkAch();scheduleSave();}
function removeFriend(id){if(!confirm('Remove this friend?'))return;S.friends=S.friends.filter(f=>f.id!==id);renderLB();scheduleSave();toast('👋','Friend removed','tgo');}
function gfl(xp){let l=1;while(xp>=thr(l))l++;return l;}
function renderLB(){
  const el=document.getElementById('lblist');if(!el)return;
  const me={name:S.name||'You',xp:S.xp,col:'#E8C97A',isMe:true};
  const all=[me,...S.friends].sort((a,b)=>b.xp-a.xp);
  const mx=Math.max(...all.map(f=>f.xp),1);
  el.innerHTML=all.map((f,i)=>{
    const ri=i===0?'r1':i===1?'r2':i===2?'r3':'rn',rm=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
    return `<div class="fc" style="${f.isMe?'border-color:rgba(232,201,122,.25);background:rgba(232,201,122,.04)':''}">
      <div class="fcrw ${ri}">${rm}</div>
      <div class="fcav" style="background:${f.col}22;border:2px solid ${f.col}44">${f.name[0].toUpperCase()}</div>
      <div class="fcinfo"><div class="fcname">${f.name}${f.isMe?'<span class="fcyou">YOU</span>':''}</div><div class="fcst">${f.xp} XP · Level ${gfl(f.xp)}</div><div class="fbt"><div class="fbf" style="width:${Math.round(f.xp/mx*100)}%;background:${f.col}"></div></div></div>
      ${!f.isMe?`<button class="tdel" onclick="removeFriend(${f.id})" title="Remove">✕</button>`:''}
    </div>`;
  }).join('');
}
setInterval(()=>{S.friends.forEach(f=>{if(Math.random()<.3)f.xp+=Math.floor(Math.random()*15)+1;});},30000);

/* ── Friend Challenges ── */
function openChallengeModal(){document.getElementById('challenge-ov').classList.add('open');const sel=document.getElementById('ch-friend');if(sel)sel.innerHTML=S.friends.length?S.friends.map(f=>`<option value="${f.id}">${f.name}</option>`).join(''):'<option disabled>Add friends first</option>';}
function createChallenge(){
  const name=document.getElementById('ch-name')?.value.trim()||'';if(!name){toast('⚠️','Enter a challenge name','trs');return;}
  const fid=parseInt(document.getElementById('ch-friend')?.value);if(!fid){toast('⚠️','Select a friend','trs');return;}
  const type=document.getElementById('ch-type')?.value||'tasks';
  const goal=parseInt(document.getElementById('ch-goal')?.value)||5;
  const friend=S.friends.find(f=>f.id===fid);if(!friend)return;
  S.challenges.unshift({id:Date.now(),name,fid,fName:friend.name,type,goal,myProg:0,theirProg:Math.floor(Math.random()*Math.floor(goal*.4)),done:false,won:null});
  document.getElementById('ch-name').value='';document.getElementById('challenge-ov').classList.remove('open');
  renderChallenges();toast('⚔️',`Challenge "${name}" started!`,'ttl');scheduleSave();
}
function updateChallengeProgress(type){
  (S.challenges||[]).filter(c=>!c.done&&c.type===type).forEach(c=>{
    c.myProg=Math.min(c.goal,c.myProg+1);c.theirProg=Math.min(c.goal,c.theirProg+(Math.random()<0.3?1:0));
    if(c.myProg>=c.goal){c.done=true;c.won=true;if(!S.ach['ch1']){S.ach['ch1']=true;buildAch();}gainXP(100,'Challenge won!');confetti();toast('🏆','Challenge won! +100 XP','ttl');}
    else if(c.theirProg>=c.goal){c.done=true;c.won=false;toast('😢','Challenge lost — try again!','trs');}
  });
  renderChallenges();scheduleSave();
}
function renderChallenges(){
  const el=document.getElementById('chlist');if(!el)return;
  if(!S.challenges||!S.challenges.length){el.innerHTML='<div style="color:var(--text3);font-size:13px;padding:12px 0">No challenges yet. Create one above!</div>';return;}
  el.innerHTML=S.challenges.map(c=>{
    const mp=Math.round(c.myProg/c.goal*100),tp=Math.round(c.theirProg/c.goal*100);
    return `<div class="ct" style="${c.done?'opacity:.7':''}">
      <div class="cth"><div class="ctn">${c.name}</div><span class="tg ${c.done?(c.won?'tghi':'tg-due-over'):'tgmd'}">${c.done?(c.won?'🏆 Won':'💔 Lost'):'⚔️ Active'}</span></div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:8px">vs ${c.fName} · Goal: ${c.goal} ${c.type}</div>
      <div style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span>You</span><span>${c.myProg}/${c.goal}</span></div><div class="pbt"><div class="pbf" style="width:${mp}%;background:var(--gold)"></div></div></div>
      <div><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px"><span>${c.fName}</span><span>${c.theirProg}/${c.goal}</span></div><div class="pbt"><div class="pbf" style="width:${tp}%;background:var(--rose)"></div></div></div>
      <div style="text-align:right;margin-top:8px"><button class="tdel" onclick="deleteChallenge(${c.id})">✕ Remove</button></div>
    </div>`;
  }).join('');
}


/* ── DELETE HELPERS ── */
function deleteChallenge(id){if(!confirm('Remove this challenge?'))return;S.challenges=(S.challenges||[]).filter(c=>c.id!==id);renderChallenges();scheduleSave();toast('🗑️','Challenge removed','tgo');}
function deleteCollab(id){if(!confirm('Delete this collab task?'))return;S.collabs=(S.collabs||[]).filter(c=>c.id!==id);renderCollab();scheduleSave();toast('🗑️','Collab deleted','tgo');}
function deleteFlashCard(deckId,cardId){const deck=(S.flashcardDecks||[]).find(d=>d.id===deckId);if(!deck)return;deck.cards=deck.cards.filter(c=>c.id!==cardId);renderFlashcards();scheduleSave();toast('🗑️','Card deleted','tgo');}

/* ── COLLAB ── */
function addCollab(){const n=document.getElementById('cname').value.trim();if(!n)return;const mems=[S.name[0].toUpperCase(),...S.friends.slice(0,3).map(f=>f.name[0].toUpperCase())];S.collabs.unshift({id:Date.now(),name:n,progress:0,mems,notes:[],done:false});document.getElementById('cname').value='';renderCollab();toast('🤝',`Collab "${n}" created!`,'ttl');scheduleSave();}
function progCollab(id){const t=S.collabs.find(x=>x.id===id);if(!t||t.done)return;t.progress=Math.min(100,t.progress+10);if(t.progress>=100)completeCollab(id);else{renderCollab();scheduleSave();}}
function completeCollab(id){const t=S.collabs.find(x=>x.id===id);if(!t)return;t.progress=100;t.done=true;if(!S.ach['co1']){S.ach['co1']=true;buildAch();toast('🤜','Achievement: Collaborator!','tgo');}gainXP(50,'Collab complete!');confetti();toast('🎉',`"${t.name}" collab done!`,'ttl');renderCollab();scheduleSave();}
function renderCollab(){
  const el=document.getElementById('clist');if(!el)return;
  el.innerHTML=S.collabs.map(t=>`<div class="ct${t.done?' collab-done':''}">
    <div class="cth"><div class="ctn">${t.name}</div><span class="tg ${t.done?'tghi':'tgmd'}">${t.done?'✅ Done':t.progress+'%'}</span><button class="tdel" onclick="deleteCollab(${t.id})" style="margin-left:auto">✕</button></div>
    <div class="pbt"><div class="pbf" style="width:${t.progress}%;${t.done?'background:var(--teal)':''}"></div></div>
    <div class="cmr"><div class="cmas">${t.mems.slice(0,4).map((m,i)=>`<div class="cma" style="background:${COLS[i]}33">${m}</div>`).join('')}</div>
      ${!t.done?`<div style="display:flex;gap:6px"><button class="btn btl bsm" onclick="progCollab(${t.id})">+10%</button><button class="btn bgo bsm" onclick="completeCollab(${t.id})">✓ Complete</button></div>`:'<span style="font-size:11px;color:var(--teal);font-weight:600">Completed! 🎉</span>'}
    </div>
    <div class="cnotes">
      ${(t.notes||[]).map(n=>`<div class="cnote-item"><div class="cnote-av" style="background:${n.col}33;color:${n.col}">${n.av}</div><div class="cnote-txt">${n.text}</div><div class="cnote-time">${n.time}</div></div>`).join('')||'<div style="color:var(--text3);font-size:11px;padding:4px 0">No messages yet</div>'}
      <div class="cnote-inp-row"><input class="fi" id="cn-inp-${t.id}" placeholder="Add a note…" style="flex:1;padding:8px 12px;font-size:12px" onkeydown="if(event.key==='Enter')addCollabNote(${t.id})"><button class="btn btl bsm" onclick="addCollabNote(${t.id})">Send</button></div>
    </div>
  </div>`).join('');
}
function addCollabNote(id){const inp=document.getElementById(`cn-inp-${id}`);if(!inp)return;const text=inp.value.trim();if(!text)return;const t=S.collabs.find(x=>x.id===id);if(!t)return;const now=new Date();t.notes.push({av:S.name[0].toUpperCase(),col:'#E8C97A',text,time:`${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`});inp.value='';renderCollab();gainXP(2,'Collab message');scheduleSave();}

/* ── ACHIEVEMENTS ── */
function buildAch(){
  const g=document.getElementById('achgrid');if(!g)return;
  const u=Object.values(S.ach).filter(Boolean).length,tot=ACH.length;
  const pt=document.getElementById('ach-progress-txt');if(pt)pt.textContent=`${u} / ${tot} Unlocked`;
  const pb=document.getElementById('ach-progress-bar');if(pb)pb.style.width=Math.round(u/tot*100)+'%';
  g.innerHTML=ACH.map(a=>`<div class="ach ${S.ach[a.id]?'':'locked'}" title="${a.d}"><span class="acic">${a.ic}</span><div class="acnm">${a.n}</div><div class="acds">${a.d}</div>${S.ach[a.id]?'<div class="ach-check">✓</div>':''}</div>`).join('');
}
function checkAch(){
  const done=S.tasks.filter(t=>t.done).length;
  const allFC=(S.flashcardDecks||[]).reduce((a,d)=>a+(d.cards||[]).length,0);
  [{id:'f1',c:done>=1},{id:'s3',c:S.streak>=3},{id:'s7',c:S.streak>=7},{id:'s30',c:S.streak>=30},
   {id:'t5',c:done>=5},{id:'t25',c:done>=25},{id:'t100',c:done>=100},
   {id:'lv5',c:S.level>=5},{id:'lv10',c:S.level>=10},{id:'x500',c:S.xp>=500},{id:'x2k',c:S.xp>=2000},
   {id:'st60',c:S.studySec>=3600},{id:'st5h',c:S.studySec>=18000},{id:'fr3',c:S.friends.length>=3},
   {id:'fc10',c:allFC>=10},{id:'gr5',c:(S.grades||[]).length>=5}
  ].forEach(c=>{if(c.c&&!S.ach[c.id]){S.ach[c.id]=true;const a=ACH.find(x=>x.id===c.id);toast(a.ic,`Achievement: ${a.n}!`,'tgo');gainXP(25,`Achievement: ${a.n}`);confetti();}});buildAch();
}

/* ── LEVEL UP ── */
function showLU(){const t=LVL[Math.min(S.level-1,LVL.length-1)];document.getElementById('lutit').textContent=`LEVEL ${S.level}!`;document.getElementById('lusub').textContent=`You are now a ${t} Scholar! ✦`;document.getElementById('luov').classList.add('show');}

/* ── TOAST & CONFETTI ── */
function toast(ic,msg,cls='tgo'){const c=document.getElementById('toasts');const el=document.createElement('div');el.className=`toast ${cls}`;el.innerHTML=`<span class="ttic">${ic}</span><span>${msg}</span>`;c.appendChild(el);setTimeout(()=>{el.classList.add('exit');setTimeout(()=>el.remove(),320);},3200);}
function confetti(){const cs=['#E8C97A','#F5DFA0','#C8A84B','#2DD4BF','#A78BFA','#FB7185','#fff'];for(let i=0;i<50;i++){const el=document.createElement('div');el.className='cp';const sz=5+Math.random()*10;el.style.cssText=`left:${Math.random()*100}vw;top:-16px;width:${sz}px;height:${sz}px;background:${cs[Math.floor(Math.random()*cs.length)]};border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${1.8+Math.random()*1.2}s;animation-delay:${Math.random()*.6}s;`;document.body.appendChild(el);setTimeout(()=>el.remove(),3000);}}

/* ── FOCUS GOAL ── */
function editFocusGoal(){const d=document.getElementById('fg-display'),i=document.getElementById('fg-inp');d.style.display='none';i.style.display='block';i.value=S.focusGoal;i.focus();document.getElementById('fg-done-btn').style.display=S.focusGoal?'inline-flex':'none';}
function saveFocusGoal(){const i=document.getElementById('fg-inp'),v=i.value.trim();S.focusGoal=v;const d=document.getElementById('fg-display');i.style.display='none';d.style.display='block';if(v){d.textContent=v;d.classList.remove('placeholder');document.getElementById('fg-done-btn').style.display='inline-flex';}else{d.textContent='Click to set your intention for today…';d.classList.add('placeholder');document.getElementById('fg-done-btn').style.display='none';}scheduleSave();}
function completeFocusGoal(){if(!S.focusGoal)return;S.focusGoalDone=true;gainXP(20,'Daily Focus Goal!');confetti();document.getElementById('fg-display').textContent='✅ '+S.focusGoal;document.getElementById('fg-done-btn').style.display='none';toast('🎯','Daily goal done! +20 XP','ttl');scheduleSave();}

/* ── WEEKLY SUMMARY ── */
function getWeekData(){const t=new Date(),d=[];for(let i=6;i>=0;i--){const x=new Date(t);x.setDate(x.getDate()-i);d.push(x.toDateString());}return d;}
function renderWeeklySummary(){
  const days=getWeekData();
  const wdone=days.reduce((a,d)=>(S.weeklyLog[d]?.tasks||0)+a,0);
  const wxp=days.reduce((a,d)=>(S.weeklyXpLog[d]||0)+a,0);
  const wtime=Math.floor(S.studySec/60);
  const el=id=>document.getElementById(id);
  if(el('ws-wtasks'))el('ws-wtasks').textContent=wdone;if(el('ws-wxp'))el('ws-wxp').textContent=wxp;if(el('ws-wtime'))el('ws-wtime').textContent=wtime>=60?`${Math.floor(wtime/60)}h ${wtime%60}m`:`${wtime}m`;
  renderXPChart(days);
}
function renderXPChart(days){
  const c=document.getElementById('xp-chart-bars');if(!c)return;
  const vals=days.map(d=>S.weeklyXpLog[d]||0),max=Math.max(...vals,10);
  const DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  c.innerHTML=days.map((d,i)=>{const h=Math.max(4,Math.round((vals[i]/max)*72)),date=new Date(d),isToday=d===new Date().toDateString();return `<div class="cbar-wrap"><div class="cbar" style="height:${h}px;${isToday?'background:linear-gradient(180deg,var(--gold),rgba(232,201,122,.3));box-shadow:0 0 12px rgba(232,201,122,.3)':''}">${vals[i]>0?`<span class="cbar-val">${vals[i]}</span>`:''}</div><span class="cbar-lbl" style="${isToday?'color:var(--gold)':''}">${DAY[date.getDay()]}</span></div>`;}).join('');
}
function renderSubChips(){
  const el=document.getElementById('sub-chips');if(!el)return;
  const counts={};S.tasks.forEach(t=>{counts[t.sub]=(counts[t.sub]||0)+1;});
  if(!Object.keys(counts).length){el.innerHTML='<span style="font-size:12px;color:var(--text3)">No tasks yet</span>';return;}
  el.innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([sub,n])=>{const c=SUB_COLS[sub]||'rgba(232,201,122,';return `<div class="sub-chip" style="background:${c}.08);color:${c}1);border-color:${c}.2)" onclick="filterBySubject('${sub}')">${sub} <span style="opacity:.6">${n}</span></div>`;}).join('');
}
let activeSubFilter='';
function filterBySubject(sub){activeSubFilter=activeSubFilter===sub?'':sub;goPage('tasks',document.querySelector('.ntab[data-page="tasks"]'));setTimeout(()=>{renderTasks();toast('🏷️',sub?`Showing ${sub} tasks`:'All subjects','tgo');},100);}

/* ── EDIT TASK ── */
function openEditTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  document.getElementById('edit-id').value=id;document.getElementById('edit-name').value=t.name;document.getElementById('edit-sub').value=t.sub;document.getElementById('edit-pri').value=t.pri;document.getElementById('edit-due').value=t.due||'';document.getElementById('edit-notes').value=t.notes||'';document.getElementById('edit-recur').value=t.recur||'none';document.getElementById('edit-tags').value=(t.tags||[]).join(', ');
  const h=Math.floor(t.dur/3600),m=Math.floor((t.dur%3600)/60),s=t.dur%60;
  document.getElementById('edit-hr').value=h||'';document.getElementById('edit-mn').value=m||'';document.getElementById('edit-sc').value=s||'';
  document.getElementById('edit-ov').classList.add('open');
}
function saveEditTask(){
  const id=parseInt(document.getElementById('edit-id').value);const t=S.tasks.find(x=>x.id===id);if(!t)return;
  t.name=document.getElementById('edit-name').value.trim()||t.name;t.sub=document.getElementById('edit-sub').value;t.pri=document.getElementById('edit-pri').value;t.due=document.getElementById('edit-due').value||'';t.notes=document.getElementById('edit-notes').value.trim()||'';t.recur=document.getElementById('edit-recur').value||'none';t.tags=document.getElementById('edit-tags').value.split(',').map(x=>x.trim()).filter(Boolean);
  const h=parseInt(document.getElementById('edit-hr').value)||0,m=parseInt(document.getElementById('edit-mn').value)||0,s=parseInt(document.getElementById('edit-sc').value)||0;
  t.dur=(h*3600)+(m*60)+s||t.dur;document.getElementById('edit-ov').classList.remove('open');renderTasks();toast('✏️',`"${t.name}" updated!`,'tgo');scheduleSave();
}

/* ── PROFILE MODAL ── */
function openProfile(){document.getElementById('prof-av-big').textContent=S.name?S.name[0].toUpperCase():'?';document.getElementById('prof-name-inp').value=S.name;document.getElementById('ps-xp').textContent=S.xp;document.getElementById('ps-lvl').textContent=S.level;document.getElementById('ps-done').textContent=S.tasks.filter(t=>t.done).length;document.getElementById('ps-str').textContent=S.best;const m=Math.floor(S.studySec/60);document.getElementById('ps-time').textContent=m>=60?`${Math.floor(m/60)}h`:m+'m';document.getElementById('ps-ach').textContent=Object.values(S.ach).filter(Boolean).length;document.getElementById('profile-ov').classList.add('open');}
function saveProfileName(){const n=document.getElementById('prof-name-inp').value.trim();if(!n)return;S.name=n;document.getElementById('prof-av-big').textContent=n[0].toUpperCase();refresh();toast('👤','Name updated!','tgo');scheduleSave();}

/* ── MULTI-PROFILE ── */
function renderProfiles(){
  const el=document.getElementById('profiles-list');if(!el)return;
  el.innerHTML=allProfiles.map((p,i)=>`<div class="fc" style="${i===activeIdx?'border-color:rgba(232,201,122,.3);background:rgba(232,201,122,.04)':''}">
    <div class="fcav" style="background:${COLS[i%COLS.length]}33;border:2px solid ${COLS[i%COLS.length]}55">${(p.name||'?')[0].toUpperCase()}</div>
    <div class="fcinfo"><div class="fcname">${p.name||'Unnamed'}${i===activeIdx?'<span class="fcyou">ACTIVE</span>':''}</div><div class="fcst">Grade ${p.grade||'?'}</div></div>
    ${i!==activeIdx?`<button class="btn bgo bsm" onclick="switchProfile(${i})">Switch</button>`:''}
    <button class="btn btl bsm" onclick="exportProfile(${i})" title="Export profile">📤</button>
    ${allProfiles.length>1&&i!==activeIdx?`<button class="tdel" onclick="deleteProfile(${i})">✕</button>`:''}
  </div>`).join('');
}
function addProfile(){const n=document.getElementById('new-profile-name')?.value.trim();if(!n)return;const np=JSON.parse(JSON.stringify(DEFAULT_STATE));np.name=n;allProfiles.push({name:n,grade:'',snap:np});document.getElementById('new-profile-name').value='';saveData();renderProfiles();toast('👤',`Profile "${n}" created!`,'tgo');}
function switchProfile(idx){allProfiles[activeIdx].snap=JSON.parse(JSON.stringify(S));activeIdx=idx;S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),allProfiles[idx].snap||{});ensureDefaults();saveData();refresh();applyTheme();syncPomoSettings();renderProfiles();toast('🔄',`Switched to ${S.name}`,'tgo');}
function deleteProfile(idx){if(!confirm(`Delete profile "${allProfiles[idx].name}"?`))return;allProfiles.splice(idx,1);if(activeIdx>=allProfiles.length)activeIdx=0;saveData();renderProfiles();toast('🗑️','Profile deleted','tgo');}

/* ── POMODORO ── */
function syncPomoSettings(){if(!S.pomoSettings)return;pomoState.focusMins=S.pomoSettings.focusMins;pomoState.breakMins=S.pomoSettings.breakMins;pomoState.longBreakMins=S.pomoSettings.longBreakMins;pomoState.totalCycles=S.pomoSettings.totalCycles;pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;const el=id=>document.getElementById(id);if(el('pomo-focus-min'))el('pomo-focus-min').value=pomoState.focusMins;if(el('pomo-break-min'))el('pomo-break-min').value=pomoState.breakMins;if(el('pomo-long-min'))el('pomo-long-min').value=pomoState.longBreakMins;if(el('pomo-cycles-inp'))el('pomo-cycles-inp').value=pomoState.totalCycles;}
function applyPomoSettings(){const el=id=>document.getElementById(id);const f=parseInt(el('pomo-focus-min')?.value)||25,b=parseInt(el('pomo-break-min')?.value)||5,l=parseInt(el('pomo-long-min')?.value)||15,c=parseInt(el('pomo-cycles-inp')?.value)||4;pomoState.focusMins=f;pomoState.breakMins=b;pomoState.longBreakMins=l;pomoState.totalCycles=c;S.pomoSettings={focusMins:f,breakMins:b,longBreakMins:l,totalCycles:c};resetPomo();toast('🍅','Pomodoro settings saved!','tgo');scheduleSave();}
function buildPomoDots(){const c=document.getElementById('pomo-dots');if(!c)return;c.innerHTML=Array.from({length:pomoState.totalCycles},(_,i)=>{const cls=i<pomoState.cycle?'pomo-dot done':i===pomoState.cycle&&pomoState.running?'pomo-dot active':'pomo-dot';return `<div class="${cls}"></div>`;}).join('');}
function updPomoDisp(){const m=Math.floor(pomoState.sec/60).toString().padStart(2,'0'),s=(pomoState.sec%60).toString().padStart(2,'0');const dndp=document.getElementById('pomo-disp-dnd');if(dndp)dndp.textContent=`${m}:${s}`;const el=document.getElementById('pomo-disp');if(el)el.textContent=`${m}:${s}`;const pct=pomoState.total>0?(1-pomoState.sec/pomoState.total):0;const ring=document.getElementById('pomo-ring');if(ring)ring.setAttribute('stroke-dashoffset',703.72*(1-pct));const ph=document.getElementById('pomo-phase');if(ph)ph.textContent=`${pomoState.phase==='focus'?'FOCUS':'BREAK'} · SESSION ${pomoState.cycle+1} OF ${pomoState.totalCycles}`;const sub=document.getElementById('pomo-sub');if(sub)sub.textContent=pomoState.phase==='focus'?'DEEP FOCUS':pomoState.phase==='longbreak'?'LONG BREAK':'SHORT BREAK';buildPomoDots();}
function togglePomo(){pomoState.running=!pomoState.running;document.getElementById('pomo-play').textContent=pomoState.running?'⏸':'▶';if(pomoState.running){pomoState.iv=setInterval(()=>{if(pomoState.sec<=0){clearInterval(pomoState.iv);pomoState.running=false;document.getElementById('pomo-play').textContent='▶';playChime();if(pomoState.phase==='focus'){S.studySec+=pomoState.focusMins*60;gainXP(15,'Pomodoro focus!');confetti();pomoState.cycle++;if(pomoState.cycle>=pomoState.totalCycles){pomoState.cycle=0;pomoState.phase='longbreak';pomoState.sec=pomoState.longBreakMins*60;pomoState.total=pomoState.sec;toast('🍅','All cycles done! Long break 🎉','ttl');}else{pomoState.phase='break';pomoState.sec=pomoState.breakMins*60;pomoState.total=pomoState.sec;toast('☕','Short break!','ttl');}}else{pomoState.phase='focus';pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;toast('🍅','Back to focus!','tgo');}scheduleSave();checkDailyGoal();updPomoDisp();return;}pomoState.sec--;updPomoDisp();},1000);}else clearInterval(pomoState.iv);}
function resetPomo(){clearInterval(pomoState.iv);pomoState.running=false;pomoState.cycle=0;pomoState.phase='focus';pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;document.getElementById('pomo-play').textContent='▶';updPomoDisp();}
function skipPomo(){clearInterval(pomoState.iv);pomoState.running=false;pomoState.sec=0;updPomoDisp();setTimeout(()=>{if(pomoState.phase==='focus'){pomoState.phase='break';pomoState.cycle++;if(pomoState.cycle>=pomoState.totalCycles){pomoState.cycle=0;pomoState.phase='longbreak';pomoState.sec=pomoState.longBreakMins*60;}else pomoState.sec=pomoState.breakMins*60;pomoState.total=pomoState.sec;}else{pomoState.phase='focus';pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;}updPomoDisp();document.getElementById('pomo-play').textContent='▶';},300);}

/* ── SOUND ── */
function toggleSound(){soundOn=!soundOn;['stog-el','stog-dnd'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('on',soundOn);});['sound-lbl','sound-lbl-dnd'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=soundOn?'Sound On':'Sound Off';});}
/* playChime replaced by themed version below */

/* ── THEME ── */
function applyTheme(){const isLight=S.theme==='light';document.body.classList.toggle('light-mode',isLight);const btn=document.getElementById('theme-btn');if(btn)btn.textContent=isLight?'🌙 Dark':'☀️ Light';}
function toggleTheme(){S.theme=S.theme==='dark'?'light':'dark';applyTheme();scheduleSave();toast(S.theme==='light'?'☀️':'🌙',`${S.theme} mode`,'tgo');}

/* ── NOTES ── */
function loadNotes(){const el=document.getElementById('study-notes-area');if(el&&el.value!==S.notes)el.value=S.notes||'';updNotesStats();}
function saveNotes(){const el=document.getElementById('study-notes-area');if(!el)return;updNotesStats();const prev=S.notes;S.notes=el.value;if(!prev&&S.notes&&!S.ach['np1']){S.ach['np1']=true;buildAch();toast('📝','Achievement: Note Taker!','tgo');gainXP(10,'First note');}scheduleSave();}
function clearNotes(){if(!confirm('Clear all notes?'))return;S.notes='';loadNotes();scheduleSave();toast('🗑️','Notes cleared','tgo');}

/* ── FLASHCARDS ── */
function addFlashcardDeck(){const name=document.getElementById('fc-deck-name')?.value.trim();if(!name)return;const sub=document.getElementById('fc-deck-sub')?.value||'Other';S.flashcardDecks=S.flashcardDecks||[];S.flashcardDecks.unshift({id:Date.now(),name,sub,cards:[]});document.getElementById('fc-deck-name').value='';renderFlashcards();scheduleSave();toast('🃏',`Deck "${name}" created!`,'tgo');}
function addFlashCard(deckId){const q=document.getElementById(`fcq-${deckId}`)?.value.trim(),a=document.getElementById(`fca-${deckId}`)?.value.trim();if(!q||!a){toast('⚠️','Fill Q & A','trs');return;}const deck=(S.flashcardDecks||[]).find(d=>d.id===deckId);if(!deck)return;deck.cards.push({id:Date.now(),q,a,rating:0,reviewed:0});document.getElementById(`fcq-${deckId}`).value='';document.getElementById(`fca-${deckId}`).value='';renderFlashcards();checkAch();scheduleSave();toast('✦','Card added!','tgo');}
function deleteFlashDeck(id){if(!confirm('Delete this deck?'))return;S.flashcardDecks=(S.flashcardDecks||[]).filter(d=>d.id!==id);renderFlashcards();scheduleSave();}
function startQuiz(deckId){const deck=(S.flashcardDecks||[]).find(d=>d.id===deckId);if(!deck||!deck.cards.length){toast('⚠️','Add cards first!','trs');return;}flashDeckId=deckId;flashIdx=0;flashFlipped=false;renderQuizCard();document.getElementById('flash-quiz-ov').classList.add('open');}
function renderQuizCard(){const deck=(S.flashcardDecks||[]).find(d=>d.id===flashDeckId);if(!deck)return;const card=deck.cards[flashIdx];if(!card)return;document.getElementById('fq-deck').textContent=deck.name;document.getElementById('fq-cnt').textContent=`${flashIdx+1} / ${deck.cards.length}`;document.getElementById('fq-front').textContent=card.q;document.getElementById('fq-back').textContent=card.a;const fc=document.getElementById('fq-card');if(fc)fc.classList.toggle('flipped',flashFlipped);}
function flipCard(){flashFlipped=!flashFlipped;const fc=document.getElementById('fq-card');if(fc)fc.classList.toggle('flipped',flashFlipped);}
function rateCard(rating){const deck=(S.flashcardDecks||[]).find(d=>d.id===flashDeckId);if(!deck)return;deck.cards[flashIdx].rating=rating;deck.cards[flashIdx].reviewed++;flashIdx++;flashFlipped=false;if(flashIdx>=deck.cards.length){document.getElementById('flash-quiz-ov').classList.remove('open');const good=deck.cards.filter(c=>c.rating>=3).length;gainXP(deck.cards.length*3,'Flashcard quiz!');toast('🃏',`Quiz done! ${good}/${deck.cards.length} correct`,'ttl');flashDeckId=null;renderFlashcards();scheduleSave();}else renderQuizCard();}
function renderFlashcards(){
  const el=document.getElementById('fc-list');if(!el)return;
  if(!S.flashcardDecks||!S.flashcardDecks.length){el.innerHTML='<div class="empty"><div class="empi">🃏</div><p>No decks yet. Create one above!</p></div>';return;}
  el.innerHTML=S.flashcardDecks.map(d=>`<div class="gc gcp fc-deck">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div><div class="gct" style="margin-bottom:2px"><em>🃏</em> ${d.name}</div><div style="font-size:11px;color:var(--text3)">${d.sub} · ${d.cards.length} card${d.cards.length!==1?'s':''} · ${d.cards.filter(c=>c.reviewed).length>0?Math.round(d.cards.filter(c=>c.rating>=3).length/d.cards.filter(c=>c.reviewed).length*100)+'% pass':'not reviewed'}</div></div>
      <div style="display:flex;gap:6px">${d.cards.length?`<button class="btn bgo bsm" onclick="startQuiz(${d.id})">▶ Quiz</button>`:''}<button class="tdel" onclick="deleteFlashDeck(${d.id})">✕</button></div>
    </div>
    <div class="fc-inp-row"><input class="fi" id="fcq-${d.id}" placeholder="Question…" style="flex:1"><input class="fi" id="fca-${d.id}" placeholder="Answer…" style="flex:1"><button class="btn bgh bsm" onclick="addFlashCard(${d.id})">+ Card</button></div>
    ${d.cards.length?`<div class="fc-preview">${d.cards.slice(0,4).map(c=>`<div class="fc-chip" title="${c.a}" style="display:flex;align-items:center;gap:4px">${c.q.slice(0,18)}${c.q.length>18?'…':''}<span onclick="deleteFlashCard(${d.id},${c.id})" style="cursor:pointer;opacity:.5;font-size:10px;padding:0 2px" title="Delete card">✕</span></div>`).join('')}${d.cards.length>4?`<div class="fc-chip" style="color:var(--text3)">+${d.cards.length-4}</div>`:''}</div>`:''}
  </div>`).join('');
}

/* ── GRADE TRACKER ── */
function addGrade(){const sub=document.getElementById('gr-sub')?.value,name=document.getElementById('gr-name')?.value.trim()||'Assessment',score=parseFloat(document.getElementById('gr-score')?.value),max=parseFloat(document.getElementById('gr-max')?.value)||100,date=document.getElementById('gr-date')?.value||new Date().toISOString().slice(0,10);if(isNaN(score)||score<0||score>max){toast('⚠️','Invalid score','trs');return;}S.grades=S.grades||[];S.grades.unshift({id:Date.now(),sub,name,score,max,pct:Math.round(score/max*100),date});['gr-name','gr-score'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});renderGrades();checkAch();gainXP(5,'Grade logged');toast('📊','Grade logged!','tgo');scheduleSave();}
function deleteGrade(id){S.grades=(S.grades||[]).filter(g=>g.id!==id);renderGrades();scheduleSave();}
function gradeCol(pct){return pct>=80?'var(--teal)':pct>=60?'var(--gold)':pct>=40?'rgba(249,115,22,1)':'var(--rose)';}
function renderGrades(){
  const el=document.getElementById('grades-list');if(!el)return;
  const avgEl=document.getElementById('grades-avg');
  if(!S.grades||!S.grades.length){el.innerHTML='<div class="empty"><div class="empi">📊</div><p>No grades yet.</p></div>';if(avgEl)avgEl.innerHTML='';return;}
  const bySubj={};S.grades.forEach(g=>{if(!bySubj[g.sub])bySubj[g.sub]=[];bySubj[g.sub].push(g.pct);});
  if(avgEl)avgEl.innerHTML=Object.entries(bySubj).map(([sub,pcts])=>{const avg=Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length);return `<div class="tg" style="background:${gradeCol(avg)}22;color:${gradeCol(avg)};border-color:${gradeCol(avg)}44;padding:6px 12px">${sub}: <strong>${avg}%</strong></div>`;}).join('');
  el.innerHTML=S.grades.slice(0,25).map(g=>`<div class="grade-row"><div class="grade-pct" style="background:${gradeCol(g.pct)}22;border-color:${gradeCol(g.pct)}44;color:${gradeCol(g.pct)}">${g.pct}%</div><div style="flex:1"><div style="font-size:14px;font-weight:600">${g.name}</div><div style="font-size:11px;color:var(--text3)">${g.sub} · ${g.score}/${g.max} · ${g.date}</div></div><button class="tdel" onclick="deleteGrade(${g.id})">✕</button></div>`).join('');
}

/* ── TIMETABLE ── */
const TT_DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const TT_HOURS=[7,8,9,10,11,12,13,14,15,16,17,18,19,20,21];
function addTimetableSlot(){const day=document.getElementById('tt-day')?.value,hour=parseInt(document.getElementById('tt-hour')?.value),subj=document.getElementById('tt-subj')?.value.trim()||'Study',color=document.getElementById('tt-color')?.value||'#A78BFA';S.timetable=S.timetable||[];S.timetable=S.timetable.filter(s=>!(s.day===day&&s.hour===hour));S.timetable.push({id:Date.now(),day,hour,subj,color});renderTimetable();scheduleSave();toast('📅','Slot added!','tgo');}
function removeTTSlot(id){S.timetable=(S.timetable||[]).filter(s=>s.id!==id);renderTimetable();scheduleSave();}
function renderTimetable(){
  const el=document.getElementById('tt-grid');if(!el)return;S.timetable=S.timetable||[];
  let html=`<div class="tt-wrap"><div class="tt-grid">`;
  html+=`<div class="tt-corner"></div>${TT_DAYS.map(d=>`<div class="tt-head">${d}</div>`).join('')}`;
  TT_HOURS.forEach(h=>{html+=`<div class="tt-hlabel">${h}:00</div>`;TT_DAYS.forEach(d=>{const slot=(S.timetable||[]).find(s=>s.day===d&&s.hour===h);html+=slot?`<div class="tt-cell tt-filled" style="background:${slot.color}28;border-color:${slot.color}66;color:${slot.color}" onclick="removeTTSlot(${slot.id})" title="Click to remove">${slot.subj}</div>`:`<div class="tt-cell tt-empty" onclick="prefillTT('${d}',${h})"></div>`;});});
  html+=`</div></div>`;el.innerHTML=html;
}
function prefillTT(day,hour){const ds=document.getElementById('tt-day'),hs=document.getElementById('tt-hour');if(ds)ds.value=day;if(hs)hs.value=hour;document.getElementById('tt-subj')?.focus();}

/* ── STATS ── */
function renderStats(){
  const el=id=>document.getElementById(id);
  const done=S.tasks.filter(t=>t.done).length,pend=S.tasks.filter(t=>!t.done).length;
  const rate=S.tasks.length?Math.round(done/S.tasks.length*100):0;
  const dayXP={0:0,1:0,2:0,3:0,4:0,5:0,6:0};
  Object.entries(S.weeklyXpLog||{}).forEach(([ds,xp])=>{dayXP[new Date(ds).getDay()]+=xp;});
  const bestDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][Object.entries(dayXP).sort((a,b)=>b[1]-a[1])[0][0]];
  const avgXP=Object.keys(S.weeklyXpLog||{}).length?Math.round(Object.values(S.weeklyXpLog).reduce((a,b)=>a+b,0)/Object.keys(S.weeklyXpLog).length):0;
  if(el('st-done'))el('st-done').textContent=done;if(el('st-pending'))el('st-pending').textContent=pend;if(el('st-rate'))el('st-rate').textContent=rate+'%';if(el('st-hrs'))el('st-hrs').textContent=(S.studySec/3600).toFixed(1)+'h';if(el('st-xp'))el('st-xp').textContent=S.xp;if(el('st-streak'))el('st-streak').textContent=S.best;if(el('st-avgxp'))el('st-avgxp').textContent=avgXP;if(el('st-bestday'))el('st-bestday').textContent=bestDay;if(el('st-friends'))el('st-friends').textContent=S.friends.length;
  const subCounts={};S.tasks.filter(t=>t.done).forEach(t=>{subCounts[t.sub]=(subCounts[t.sub]||0)+1;});
  const sbEl=el('stat-sub-bars');
  if(sbEl&&Object.keys(subCounts).length){const mx=Math.max(...Object.values(subCounts),1);sbEl.innerHTML=Object.entries(subCounts).sort((a,b)=>b[1]-a[1]).map(([sub,n])=>{const c=SUB_COLS[sub]||'rgba(232,201,122,';return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span style="color:${c}1)">${sub}</span><span style="color:var(--text3);font-family:'Fira Code',monospace">${n}</span></div><div style="height:6px;background:var(--rim);border-radius:3px"><div style="height:100%;border-radius:3px;background:${c}.7);width:${Math.round(n/mx*100)}%"></div></div></div>`;}).join('');}
  else if(sbEl)sbEl.innerHTML='<div style="color:var(--text3);font-size:13px">Complete tasks to see breakdown</div>';
  const ch30=el('stat-xp-30');
  if(ch30){const days30=[];for(let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days30.push(d.toDateString());}const v30=days30.map(d=>S.weeklyXpLog[d]||0),mx30=Math.max(...v30,1);ch30.innerHTML=`<div style="display:flex;align-items:flex-end;gap:2px;height:60px">${v30.map((v,i)=>{const h=Math.max(2,Math.round(v/mx30*58)),isT=days30[i]===new Date().toDateString();return `<div style="flex:1;height:${h}px;border-radius:2px 2px 0 0;background:${isT?'var(--gold)':'rgba(167,139,250,.4)'}" title="${v} XP"></div>`;}).join('')}</div><div style="font-size:10px;color:var(--text3);margin-top:4px;text-align:right">30-day XP history</div>`;}
  // Most productive hour
  const mph=getMostProductiveHour();
  const mphEl=el('st-mph');if(mphEl)mphEl.textContent=mph!==null?(mph<12?mph+'am':mph===12?'12pm':(mph-12)+'pm'):'—';
  // Next due task on dashboard
  renderNextDue();
  const hiC=S.tasks.filter(t=>t.done&&t.pri==='high').length,mdC=S.tasks.filter(t=>t.done&&t.pri==='med').length,loC=S.tasks.filter(t=>t.done&&t.pri==='low').length;
  const priEl=el('stat-pri-bars');if(priEl){const tot=hiC+mdC+loC||1;priEl.innerHTML=[['🔴 High',hiC,'var(--rose)'],['🟡 Med',mdC,'var(--gold)'],['🟢 Low',loC,'var(--teal)']].map(([lbl,cnt,col])=>`<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${lbl}</span><span style="color:var(--text3)">${cnt}</span></div><div style="height:5px;background:var(--rim);border-radius:3px"><div style="height:100%;border-radius:3px;background:${col};width:${Math.round(cnt/tot*100)}%"></div></div></div>`).join('');}
}

/* ── SESSION LOG ── */
function logSession(type,name,xp,duration){S.sessionLog=S.sessionLog||[];S.sessionLog.unshift({type,name,xp,duration,time:Date.now(),date:new Date().toDateString()});if(S.sessionLog.length>100)S.sessionLog=S.sessionLog.slice(0,100);}
function renderSessionLog(){
  const el=document.getElementById('session-log-list');if(!el)return;
  if(!S.sessionLog||!S.sessionLog.length){el.innerHTML='<div style="color:var(--text3);font-size:13px;padding:8px 0">Complete tasks or run timers to see your history.</div>';return;}
  el.innerHTML=S.sessionLog.slice(0,20).map(s=>{const t=new Date(s.time);const hm=`${t.getHours().toString().padStart(2,'0')}:${t.getMinutes().toString().padStart(2,'0')}`;return `<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--rim)"><div style="font-size:18px">${s.type==='task'?'✅':s.type==='focus'?'⏱':'🍅'}</div><div style="flex:1"><div style="font-size:13px;font-weight:500">${s.name}</div><div style="font-size:11px;color:var(--text3)">${s.date} · ${hm}${s.duration>0?' · '+fmtD(s.duration):''}</div></div><div style="font-size:12px;color:var(--gold);font-family:'Fira Code',monospace;font-weight:600">+${s.xp} XP</div></div>`;}).join('');
}

/* ── PUSH NOTIFS ── */
function requestNotifPermission(){if(!('Notification' in window))return;if(Notification.permission==='default')Notification.requestPermission().then(p=>{S.notifEnabled=(p==='granted');scheduleSave();});else S.notifEnabled=(Notification.permission==='granted');}
function scheduleStreakReminder(){const now=new Date(),target=new Date();target.setHours(20,0,0,0);if(now>target)target.setDate(target.getDate()+1);setTimeout(()=>{if(S.notifEnabled&&Notification.permission==='granted'&&!S.log.includes(new Date().toDateString()))new Notification('StudyVerse 📚',{body:`Don't break your ${S.streak}-day streak!`});scheduleStreakReminder();},target-now);}
function sendTestNotif(){requestNotifPermission();if(Notification.permission==='granted'){new Notification('StudyVerse 📚',{body:`${S.tasks.filter(t=>!t.done).length} pending tasks. Keep going, ${S.name}!`});toast('🔔','Test notification sent!','tgo');}else toast('❌','Enable browser notifications first','trs');}

/* ── CALENDAR EXPORT ── */
function exportCalendar(){
  const tasks=S.tasks.filter(t=>t.due&&!t.done);if(!tasks.length){toast('📅','No tasks with due dates to export','trs');return;}
  let ics='BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyVerse//EN\n';
  tasks.forEach(t=>{const d=t.due.replace(/-/g,'');ics+=`BEGIN:VEVENT\nUID:${t.id}@sv\nDTSTART;VALUE=DATE:${d}\nDTEND;VALUE=DATE:${d}\nSUMMARY:${t.name} [${t.sub}]\nDESCRIPTION:Priority: ${t.pri}.${t.notes?' '+t.notes:''}\nEND:VEVENT\n`;});
  ics+='END:VCALENDAR';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='studyverse_tasks.ics';a.click();
  toast('📅',`${tasks.length} task${tasks.length!==1?'s':''} exported to calendar`,'tgo');
}

/* ── DATA EXPORT/IMPORT/RESET ── */
function exportData(){const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`studyverse_backup_${new Date().toISOString().slice(0,10)}.json`;a.click();if(!S.ach['exp1']){S.ach['exp1']=true;buildAch();toast('📤','Achievement: Data Keeper!','tgo');gainXP(10,'Exported data');}toast('📦','Data exported!','tgo');}
function importData(){document.getElementById('import-file').click();}
function handleImport(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=ev=>{try{const parsed=JSON.parse(ev.target.result);if(!parsed.name){toast('❌','Invalid backup file','trs');return;}S=Object.assign(JSON.parse(JSON.stringify(DEFAULT_STATE)),parsed);ensureDefaults();saveData();refresh();applyTheme();syncPomoSettings();toast('📥','Data imported!','ttl');}catch{toast('❌','Failed to parse file','trs');}};reader.readAsText(file);e.target.value='';}
function resetAllData(){if(!confirm('⚠️ Reset ALL data? Cannot be undone!'))return;localStorage.removeItem(LS_KEY);localStorage.removeItem(PRO_KEY);location.reload();}

/* ── PWA ── */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pwaPrompt=e;});
function showPWABanner(){const bar=document.getElementById('pwa-bar');if(!bar||localStorage.getItem('pwa-dismissed'))return;setTimeout(()=>{if(pwaPrompt||/android|iphone|ipad/i.test(navigator.userAgent))bar.style.display='flex';},3000);}
function installPWA(){const bar=document.getElementById('pwa-bar');if(bar)bar.style.display='none';if(pwaPrompt){pwaPrompt.prompt();pwaPrompt.userChoice.then(()=>{pwaPrompt=null;});}else toast('📲','Use browser → "Add to Home Screen"','ttl');localStorage.setItem('pwa-dismissed','1');}
function dismissPWA(){const bar=document.getElementById('pwa-bar');if(bar)bar.style.display='none';localStorage.setItem('pwa-dismissed','1');}

/* ── SETTINGS ── */
function openSettings(){document.getElementById('settings-ov').classList.add('open');renderDailyGoalSettings();}
function closeSettings(){document.getElementById('settings-ov').classList.remove('open');}

/* ── KEYBOARD SHORTCUTS ── */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){['dnd','tmov','luov','profile-ov','edit-ov','settings-ov','flash-quiz-ov','challenge-ov'].forEach(id=>{const el=document.getElementById(id);if(!el)return;if(el.classList.contains('open')){el.classList.remove('open');if(id==='dnd')document.body.style.overflow='';}if(el.classList.contains('show'))el.classList.remove('show');});}
  if(e.key==='?'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))openSettings();
  if(e.key==='f'&&e.ctrlKey&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();document.getElementById('tsearch')?.focus();}
});

updDR();

/* ── QUOTES ── */
const QUOTES_DB=[{t:"The secret of getting ahead is getting started.",a:"Mark Twain"},{t:"It always seems impossible until it's done.",a:"Nelson Mandela"},{t:"Don't watch the clock; do what it does. Keep going.",a:"Sam Levenson"},{t:"The beautiful thing about learning is that no one can take it away from you.",a:"B.B. King"},{t:"Success is the sum of small efforts, repeated day in and day out.",a:"Robert Collier"},{t:"Believe you can and you're halfway there.",a:"Theodore Roosevelt"},{t:"The more that you read, the more things you will know.",a:"Dr. Seuss"},{t:"You don't have to be great to start, but you have to start to be great.",a:"Zig Ziglar"},{t:"An investment in knowledge pays the best interest.",a:"Benjamin Franklin"},{t:"The expert in anything was once a beginner.",a:"Helen Hayes"},{t:"Don't stop when you're tired. Stop when you're done.",a:"Unknown"},{t:"Wake up with determination. Go to bed with satisfaction.",a:"Unknown"},{t:"Do something today that your future self will thank you for.",a:"Sean Patrick Flanery"},{t:"Study hard, for the well is deep and our brains are shallow.",a:"Richard Baxter"},{t:"The mind is not a vessel to be filled, but a fire to be kindled.",a:"Plutarch"},{t:"Genius is one percent inspiration and ninety-nine percent perspiration.",a:"Thomas Edison"},{t:"The only way to do great work is to love what you do.",a:"Steve Jobs"},{t:"In the middle of difficulty lies opportunity.",a:"Albert Einstein"},{t:"Consistency is the engine of mastery.",a:"Unknown"},{t:"Great things never come from comfort zones.",a:"Neil Strauss"},{t:"Don't wait for opportunity. Create it.",a:"Unknown"},{t:"Push yourself, because no one else is going to do it for you.",a:"Unknown"},{t:"Dream it. Wish it. Do it.",a:"Unknown"},{t:"Develop a passion for learning. If you do, you will never cease to grow.",a:"Anthony J. D'Angelo"},{t:"What you get by achieving your goals is not as important as what you become.",a:"Zig Ziglar"}];
let qIdx=Math.floor(Math.random()*QUOTES_DB.length),qPaused=false,qInterval=null;
function showQuote(idx){const qtxt=document.getElementById('qtxt'),qa=document.getElementById('qauthor'),qc=document.getElementById('qcnt');if(!qtxt)return;qtxt.classList.add('fade-out');qa.classList.add('fade-out');setTimeout(()=>{const q=QUOTES_DB[idx];qtxt.textContent='\u201C'+q.t+'\u201D';qa.textContent='— '+q.a;if(qc)qc.textContent=(idx+1)+' / '+QUOTES_DB.length;qtxt.classList.remove('fade-out');qtxt.classList.add('fade-in');qa.classList.remove('fade-out');qa.classList.add('fade-in');restartProgressBar();},500);}
function restartProgressBar(){const bar=document.getElementById('qprogbar');if(!bar)return;bar.style.animation='none';bar.offsetHeight;bar.style.animation='qprog 20s linear forwards';}
function nextQuote(){qIdx=(qIdx+1)%QUOTES_DB.length;showQuote(qIdx);resetQTimer();}
function prevQuote(){qIdx=(qIdx-1+QUOTES_DB.length)%QUOTES_DB.length;showQuote(qIdx);resetQTimer();}
function toggleQuotePause(){qPaused=!qPaused;const btn=document.getElementById('qpausebtn'),bar=document.getElementById('qprogbar');if(qPaused){btn.textContent='▶ Resume';btn.classList.add('qpause-active');clearInterval(qInterval);if(bar)bar.style.animationPlayState='paused';}else{btn.textContent='⏸ Pause';btn.classList.remove('qpause-active');if(bar)bar.style.animationPlayState='running';resetQTimer();}}
function resetQTimer(){clearInterval(qInterval);if(!qPaused)qInterval=setInterval(()=>{qIdx=(qIdx+1)%QUOTES_DB.length;showQuote(qIdx);},20000);}
function initQuotes(){qIdx=Math.floor(Math.random()*QUOTES_DB.length);const q=QUOTES_DB[qIdx],qtxt=document.getElementById('qtxt'),qa=document.getElementById('qauthor'),qc=document.getElementById('qcnt');if(qtxt)qtxt.textContent='\u201C'+q.t+'\u201D';if(qa)qa.textContent='— '+q.a;if(qc)qc.textContent=(qIdx+1)+' / '+QUOTES_DB.length;restartProgressBar();resetQTimer();}

/* ── STREAK FREEZE ── */
function buyStreakFreeze(){
  if(S.streakFreezes>0){toast('🧊','You already have a streak freeze!','trs');return;}
  if(S.xp<50){toast('⚠️','Need 50 XP to buy a streak freeze','trs');return;}
  S.xp-=50;S.streakFreezes=(S.streakFreezes||0)+1;
  refresh();toast('🧊','Streak Freeze purchased! Your streak is protected for 1 day.','ttl');scheduleSave();
}
function useStreakFreeze(){
  if(!S.streakFreezes)return false;
  S.streakFreezes--;
  toast('🧊','Streak Freeze used! Streak protected.','ttl');scheduleSave();return true;
}

/* ── TIMETABLE EXPORT ── */
function exportTimetable(){
  const tt=S.timetable||[];if(!tt.length){toast('📅','No timetable slots to export','trs');return;}
  const DMAP={Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6,Sun:0};
  let ics='BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//StudyVerse//EN\n';
  tt.forEach(s=>{
    const dow=DMAP[s.day];const now=new Date();
    const diff=(dow-now.getDay()+7)%7;
    const d=new Date(now);d.setDate(d.getDate()+diff);
    const ds=d.toISOString().slice(0,10).replace(/-/g,'');
    const hs=s.hour.toString().padStart(2,'0');
    ics+=`BEGIN:VEVENT\nUID:tt-${s.id}@sv\nDTSTART:${ds}T${hs}0000\nDTEND:${ds}T${(s.hour+1).toString().padStart(2,'0')}0000\nSUMMARY:${s.subj}\nRRULE:FREQ=WEEKLY\nEND:VEVENT\n`;
  });
  ics+='END:VCALENDAR';
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));a.download='studyverse_timetable.ics';a.click();
  toast('📅',`${tt.length} timetable slots exported`,'tgo');
}

/* ── NOTES ENHANCEMENTS ── */
function updNotesStats(){
  const el=document.getElementById('study-notes-area');if(!el)return;
  const txt=el.value;const words=txt.trim()?txt.trim().split(/\s+/).length:0;const chars=txt.length;
  const wc=document.getElementById('notes-wordcount');if(wc)wc.textContent=`${words} words · ${chars} chars`;
}
function toggleMarkdownPreview(){
  const ta=document.getElementById('study-notes-area');
  const prev=document.getElementById('md-preview');
  if(!ta||!prev)return;
  const isShow=prev.style.display==='block';
  if(isShow){prev.style.display='none';ta.style.display='block';}
  else{
    prev.style.display='block';ta.style.display='none';
    prev.innerHTML=simpleMarkdown(ta.value);
  }
  const btn=document.getElementById('md-toggle-btn');
  if(btn)btn.textContent=isShow?'👁 Preview':'✏️ Edit';
}
function simpleMarkdown(txt){
  return txt
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/^### (.+)$/gm,'<h3>$1</h3>')
    .replace(/^## (.+)$/gm,'<h2>$1</h2>')
    .replace(/^# (.+)$/gm,'<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,'<em>$1</em>')
    .replace(/`(.+?)`/g,'<code>$1</code>')
    .replace(/^- (.+)$/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g,'<ul>$&</ul>')
    .replace(/\n/g,'<br>');
}

/* ── FOCUS MOTIVATIONAL MESSAGES ── */
const FOCUS_MSGS=[
  "You're doing great! Keep the momentum going. 🔥",
  "Every minute of deep work compounds. Stay locked in. ⚡",
  "Distractions can wait. Your future self is watching. 🎯",
  "This session is building something real. Push through! 💪",
  "Flow state unlocked. Don't break it now! 🌊",
  "You're in the arena. Champions don't quit mid-session. 🏆",
  "The hardest part was starting. You already won that. ✦",
  "Sharpen your mind. Every rep counts. 🧠",
];
let focusMsgTimer=null;
function startFocusMessages(){
  clearInterval(focusMsgTimer);
  focusMsgTimer=setInterval(()=>{
    if(document.getElementById('dnd')?.classList.contains('open')){
      const msg=FOCUS_MSGS[Math.floor(Math.random()*FOCUS_MSGS.length)];
      const el=document.getElementById('dnd-motivate');
      if(el){el.textContent=msg;el.classList.remove('fm-show');void el.offsetWidth;el.classList.add('fm-show');}
    }
  },90000);
}
function stopFocusMessages(){clearInterval(focusMsgTimer);}

/* ── QUICK-ADD FAB ── */
function toggleFAB(){
  const m=document.getElementById('fab-menu');
  if(!m)return;
  const isOpen=m.style.opacity==='1';
  m.style.opacity=isOpen?'0':'1';
  m.style.pointerEvents=isOpen?'none':'auto';
  m.style.transform=isOpen?'translateY(8px)':'translateY(0)';
  document.getElementById('fab-btn-icon').textContent=isOpen?'＋':'✕';
}
function fabAddTask(){
  document.getElementById('fab-menu')?.classList.remove('open');
  goPage('tasks',document.querySelector('.ntab[data-page="tasks"]'));
  setTimeout(()=>document.getElementById('tname')?.focus(),300);
}
function fabOpenPomo(){
  document.getElementById('fab-menu')?.classList.remove('open');
  goPage('focus',document.querySelector('.ntab[data-page="focus"]'));
}
function fabOpenDND(){
  document.getElementById('fab-menu')?.classList.remove('open');
  openDND();
}

/* ── POMO SOUND THEMES ── */
let pomoSoundTheme='chime';
function setPomoSound(theme){pomoSoundTheme=theme;document.querySelectorAll('.pst-btn').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));toast('🔔',`Sound: ${theme}`,'tgo');}
function playChime(){
  if(!soundOn)return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    if(pomoSoundTheme==='chime'){
      [523,659,784,1047].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0,ctx.currentTime+i*.15);g.gain.linearRampToValueAtTime(.2,ctx.currentTime+i*.15+.05);g.gain.linearRampToValueAtTime(0,ctx.currentTime+i*.15+.4);o.start(ctx.currentTime+i*.15);o.stop(ctx.currentTime+i*.15+.4);});
    }else if(pomoSoundTheme==='bell'){
      const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;o.type='sine';g.gain.setValueAtTime(.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+2);o.start(ctx.currentTime);o.stop(ctx.currentTime+2);
    }else if(pomoSoundTheme==='ding'){
      [1047,1319].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type='triangle';g.gain.setValueAtTime(.25,ctx.currentTime+i*.12);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.12+.6);o.start(ctx.currentTime+i*.12);o.stop(ctx.currentTime+i*.12+.6);});
    }
  }catch(e){}
}

/* ── PROFILE EXPORT ── */
function exportProfile(idx){
  const p=allProfiles[idx];if(!p)return;
  const blob=new Blob([JSON.stringify(p.snap||{},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`sv4_profile_${(p.name||'profile').replace(/\s/g,'_')}.json`;a.click();
  toast('📤',`Profile "${p.name}" exported!`,'tgo');
}

/* ── TASK COMPLETE SOUND ── */
function playCompleteSound(){
  if(!soundOn)return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    [523,659,784].forEach((f,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(0,ctx.currentTime+i*.08);g.gain.linearRampToValueAtTime(.15,ctx.currentTime+i*.08+.04);g.gain.linearRampToValueAtTime(0,ctx.currentTime+i*.08+.25);o.start(ctx.currentTime+i*.08);o.stop(ctx.currentTime+i*.08+.25);});
  }catch(e){}
}

/* ── PRODUCTIVE HOUR ANALYSIS ── */
function getMostProductiveHour(){
  const hours=new Array(24).fill(0);
  (S.sessionLog||[]).forEach(s=>{const h=new Date(s.time).getHours();hours[h]+=s.xp||0;});
  const mx=Math.max(...hours);if(!mx)return null;
  return hours.indexOf(mx);
}

/* ── NEXT DUE TASK ── */
function getNextDueTask(){
  const pending=S.tasks.filter(t=>!t.done&&t.due).sort((a,b)=>new Date(a.due)-new Date(b.due));
  return pending[0]||null;
}
function renderNextDue(){
  const el=document.getElementById('next-due-task');if(!el)return;
  const t=getNextDueTask();
  if(!t){el.innerHTML='<span style="color:var(--text3);font-size:13px">No upcoming due dates 🎉</span>';return;}
  const diff=Math.ceil((new Date(t.due)-new Date())/86400000);
  const urgCls=diff<0?'var(--rose)':diff<=2?'var(--gold)':'var(--teal)';
  el.innerHTML=`<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(255,255,255,.03);border-radius:10px;border:1px solid var(--rim)">
    <div style="font-size:22px">${diff<0?'🚨':diff<=2?'⚠️':'📅'}</div>
    <div style="flex:1"><div style="font-size:14px;font-weight:600">${t.name}</div>
    <div style="font-size:11px;color:var(--text3)">${t.sub} · ${diff<0?Math.abs(diff)+'d overdue':diff===0?'Due today':diff+'d left'}</div></div>
    <button class="btn bsm" style="background:${urgCls}22;color:${urgCls};border-color:${urgCls}44;font-size:11px" onclick="completeTask(${t.id})">✓ Done</button>
  </div>`;
}

/* ── TEXT HIGHLIGHT ── */
function highlightText(text,query){
  if(!query||!query.trim())return text;
  const re=new RegExp('('+query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','gi');
  return text.replace(re,'<mark style="background:rgba(232,201,122,.35);color:var(--gold);border-radius:2px;padding:0 1px">$1</mark>');
}

