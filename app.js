const S={name:'',xp:0,level:1,streak:0,best:0,lastActive:null,totalDone:0,studySec:0,tasks:[],friends:[],collabs:[],log:[],ach:{}};
const LVL=[{t:'Novice'},{t:'Apprentice'},{t:'Student'},{t:'Scholar'},{t:'Sage'},{t:'Prodigy'},{t:'Genius'},{t:'Master'},{t:'Legend'},{t:'Grand Master'}];
const ACH=[
  {id:'f1',ic:'🌱',n:'First Step',d:'Complete your first task'},
  {id:'s3',ic:'🔥',n:'On Fire',d:'3-day study streak'},
  {id:'s7',ic:'⚡',n:'Week Warrior',d:'7-day study streak'},
  {id:'t5',ic:'🌟',n:'Task Master',d:'Complete 5 tasks'},
  {id:'t25',ic:'💪',n:'Powerhouse',d:'Complete 25 tasks'},
  {id:'lv5',ic:'🏆',n:'Lv 5 Reached',d:'Reach level 5'},
  {id:'lv10',ic:'👑',n:'Grand Scholar',d:'Reach level 10'},
  {id:'x500',ic:'💎',n:'XP Hoarder',d:'Earn 500 total XP'},
  {id:'st60',ic:'📚',n:'Study Hour',d:'Study for 60 minutes'},
  {id:'fr3',ic:'🤝',n:'Social',d:'Add 3 friends'},
  {id:'co1',ic:'🤜',n:'Collaborator',d:'Complete a collab task'},
  {id:'fn1',ic:'🌙',n:'Night Owl',d:'Use DND focus mode'},
];
const COLS=['#A78BFA','#2DD4BF','#FB7185','#E8C97A','#38BDF8','#F472B6'];
const QTS=["Ready to conquer today's goals?","Every session counts. Let's go! 🚀","Consistency is the engine of mastery.","Your future self thanks you. 💫","Small wins compound into greatness!","Deep work = deep rewards. ✦"];

let tmTask=null,tmDur=0,tmLeft=0,tmRunning=false,tmIv=null;
let dndMode='clock',dndSec=25*60,dndTotal=25*60,dndRun=false,dndIv=null,dndUsed=false;

/* ── BOOT ── */
function boot(){
  const n=document.getElementById('nm').value.trim();
  if(!n){document.getElementById('nm').focus();return;}
  S.name=n;S.lastActive=new Date().toDateString();S.log.push(S.lastActive);S.streak=1;
  document.getElementById('ob').classList.add('hide');
  document.getElementById('app').classList.add('visible');
  setInterval(tickClock,1000);tickClock();
  spawnStars();
  setTimeout(()=>{refresh();buildAch();},600);
  toast('🎉',`Welcome to StudyVerse, ${n}!`,'tgo');
}
document.getElementById('nm').addEventListener('keydown',e=>{if(e.key==='Enter')boot();});

function tickClock(){
  const now=new Date();
  const h=now.getHours().toString().padStart(2,'0'),m=now.getMinutes().toString().padStart(2,'0'),s=now.getSeconds().toString().padStart(2,'0');
  const ec=document.getElementById('dclk'),ed=document.getElementById('ddt');
  if(ec)ec.textContent=`${h}:${m}:${s}`;
  const D=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const M=['January','February','March','April','May','June','July','August','September','October','November','December'];
  if(ed)ed.textContent=`${D[now.getDay()]}, ${M[now.getMonth()]} ${now.getDate()}`;
}

function updStreak(){
  const today=new Date().toDateString();
  if(!S.log.includes(today))S.log.push(today);
  if(S.lastActive&&S.lastActive!==today){
    const diff=(new Date(today)-new Date(S.lastActive))/86400000;
    S.streak=diff<=1?S.streak+1:1;
  }
  S.lastActive=today;
  if(S.streak>S.best)S.best=S.streak;
}

/* ── REFRESH ── */
function refresh(){
  const n=S.name,done=S.tasks.filter(t=>t.done).length,pend=S.tasks.filter(t=>!t.done).length;
  const mins=Math.floor(S.studySec/60),hrs=Math.floor(mins/60);
  const ts=hrs>0?`${hrs}h ${mins%60}m`:`${mins}m`;
  document.getElementById('nstr').textContent=S.streak;
  document.getElementById('nxp').textContent=S.xp;
  document.getElementById('nav').textContent=n?n[0].toUpperCase():'?';
  const ids=['hname','hdone','hstr','hlvl','hhrs'];
  const vals=[n,done,S.streak,S.level,ts];
  ids.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=vals[i];});
  const hq=document.getElementById('hq');if(hq)hq.textContent=QTS[Math.floor(Math.random()*QTS.length)];
  [['scdone',done],['scpend',pend],['scstr',S.streak],['scxp',S.xp]].forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
  updLvlUI();buildStreak();renderTasks();renderDash();renderLB();renderCollab();buildAch();
  const ids2=['rwxp','rwlvl','rwdone','rwstr'];
  const vs2=[S.xp,S.level,done,S.best];
  ids2.forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=vs2[i];});
}

function thr(l){return l*100+l*(l-1)*10;}
function updLvlUI(){
  const l=S.level,xp=S.xp,cur=thr(l-1),nxt=thr(l);
  const pct=Math.min(100,((xp-cur)/(nxt-cur))*100)||0;
  const ttl=LVL[Math.min(l-1,LVL.length-1)].t;
  const ids={lbnum:`Lv ${l}`,lbtit:`${ttl} Scholar`,lbsub:`Keep going to reach Level ${l+1}!`,lbxpf:`${xp} / ${nxt} XP`,xpnote:`${nxt-xp} XP to next level`};
  Object.entries(ids).forEach(([id,v])=>{const el=document.getElementById(id);if(el)el.textContent=v;});
  const xpf=document.getElementById('xpf');if(xpf)xpf.style.width=pct+'%';
}

function gainXP(amt,reason){
  const prev=S.level;S.xp+=amt;
  while(S.xp>=thr(S.level))S.level++;
  if(S.level>prev){showLU();confetti();}
  refresh();toast('⚡',`+${amt} XP — ${reason}`,'tgo');checkAch();
}

/* ── TASKS ── */
function addTask(){
  const name=document.getElementById('tname').value.trim();if(!name){document.getElementById('tname').focus();return;}
  const sub=document.getElementById('tsub').value,pri=document.getElementById('tpri').value;
  const hr=parseInt(document.getElementById('thr').value)||0;
  const mn=parseInt(document.getElementById('tmn').value)||0;
  const sc=parseInt(document.getElementById('tsc').value)||0;
  const totalSec=(hr*3600)+(mn*60)+sc||1800;
  const due=document.getElementById('tdue').value||'';
  const notes=document.getElementById('tnotes').value.trim()||'';
  S.tasks.unshift({id:Date.now(),name,sub,pri,dur:totalSec,done:false,due,notes,createdAt:Date.now()});
  ['tname','thr','tmn','tsc','tnotes'].forEach(id=>{document.getElementById(id).value='';});
  document.getElementById('tdue').value='';
  gainXP(5,'Task created');toast('📌',`"${name}" added!`,'tgo');
  // track weekly
  const today=new Date().toDateString();
  S.weeklyLog=S.weeklyLog||{};
  S.weeklyLog[today]=(S.weeklyLog[today]||{xp:0,tasks:0});
}

function completeTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t||t.done)return;
  t.done=true;S.totalDone++;
  const xp=t.pri==='high'?30:t.pri==='med'?20:10;
  gainXP(xp,`"${t.name}" completed`);confetti();updStreak();
  toast('✅',`"${t.name}" done! +${xp}XP`,'ttl');
}

function deleteTask(id){S.tasks=S.tasks.filter(t=>t.id!==id);renderTasks();renderDash();}

function fmtD(sec){
  const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
  if(h>0)return`${h}h ${m}m`;if(m>0)return`${m}m${s>0?' '+s+'s':''}`.trim();return`${s}s`;
}

function renderTasks(){
  const flt=document.getElementById('tfilter')?.value||'all';
  let act=S.tasks.filter(t=>!t.done),dn=S.tasks.filter(t=>t.done);
  if(flt!=='all')act=act.filter(t=>t.pri===flt);
  const ac=document.getElementById('actcnt');if(ac)ac.textContent=`(${act.length})`;
  const tl=document.getElementById('tlist'),dl=document.getElementById('dlist');if(!tl)return;
  tl.innerHTML=act.length?act.map(tHTML).join(''):`<div class="empty"><div class="empi">🎯</div><p>No tasks here. Add one above!</p></div>`;
  dl.innerHTML=dn.length?dn.map(tHTML).join(''):`<div class="empty" style="padding:20px"><p>No completed tasks yet</p></div>`;
}

function tHTML(t){
  const pc=t.pri==='high'?'tghi':t.pri==='med'?'tgmd':'tglo';
  const pl=t.pri==='high'?'🔴 High':t.pri==='med'?'🟡 Med':'🟢 Low';
  let dueTag='';
  if(t.due&&!t.done){
    const dueD=new Date(t.due),now=new Date(),diff=Math.ceil((dueD-now)/86400000);
    if(diff<0)dueTag=`<span class="tg tg-due-over">🚨 ${Math.abs(diff)}d overdue</span>`;
    else if(diff<=2)dueTag=`<span class="tg tg-due-soon">⚠️ Due in ${diff}d</span>`;
    else dueTag=`<span class="tg tg-due-ok">📅 Due ${t.due}</span>`;
  }
  const notesSnip=t.notes?`<div style="font-size:11px;color:var(--text3);margin-top:4px;font-style:italic">📝 ${t.notes.slice(0,60)}${t.notes.length>60?'…':''}</div>`:'';
  return`<div class="ti ${t.done?'done':''}" id="ti-${t.id}">
    <div class="ticheck ${t.done?'chk':''}" onclick="${t.done?'':(`completeTask(${t.id})`)}">
      ${t.done?'✓':''}
    </div>
    <div class="tiinfo">
      <div class="tiname">${t.name}</div>
      <div class="titags">
        <span class="tg tgsub">${t.sub}</span>
        <span class="tg ${pc}">${pl}</span>
        <span class="tg tgtm">⏱ ${fmtD(t.dur)}</span>
        ${dueTag}
      </div>
      ${notesSnip}
    </div>
    <div class="tia">
      ${!t.done?`<button class="tbtn" onclick="openTM(${t.id})">▶ Timer</button>`:''}
      ${!t.done?`<button class="tbtn" style="background:rgba(232,201,122,.07);color:var(--gold);border-color:rgba(232,201,122,.2)" onclick="openEditTask(${t.id})">✏️</button>`:''}
      <button class="tdel" onclick="deleteTask(${t.id})">✕</button>
    </div>
  </div>`;
}

function renderDash(){
  const el=document.getElementById('dashtasks');if(!el)return;
  const ts=S.tasks.filter(t=>!t.done).slice(0,4);
  if(!ts.length){el.innerHTML=`<div class="empty"><div class="empi">✅</div><p>All clear for today!</p></div>`;return;}
  el.innerHTML=ts.map(t=>`<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--rim)">
    <div class="ticheck" onclick="completeTask(${t.id})" style="cursor:pointer"></div>
    <div style="flex:1;font-size:14px">${t.name}</div>
    <span class="tg tgtm">${fmtD(t.dur)}</span>
  </div>`).join('');
}

/* ── STREAK ── */
function buildStreak(){
  const g=document.getElementById('stgrid');if(!g)return;
  const today=new Date().toDateString();let html='';
  for(let i=27;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const ds=d.toDateString(),day=d.getDate();
    const isT=ds===today,done=S.log.includes(ds);
    let cls='sd';
    if(done&&isT)cls+=' done today fire';else if(done)cls+=' done';else if(isT)cls+=' today';
    html+=`<div class="${cls}">${day}</div>`;
  }
  g.innerHTML=html;
}

/* ── TASK TIMER ── */
function openTM(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  tmTask=t;tmDur=t.dur;tmLeft=t.dur;tmRunning=false;clearInterval(tmIv);
  document.getElementById('tmnm').textContent=`📌 ${t.name}`;
  document.getElementById('tmplay').textContent='▶ Start';
  updTM();document.getElementById('tmov').classList.add('open');
}
function closeTM(){document.getElementById('tmov').classList.remove('open');clearInterval(tmIv);tmRunning=false;}
function toggleTM(){
  tmRunning=!tmRunning;
  document.getElementById('tmplay').textContent=tmRunning?'⏸ Pause':'▶ Start';
  if(tmRunning){
    tmIv=setInterval(()=>{
      if(tmLeft<=0){
        clearInterval(tmIv);tmRunning=false;
        document.getElementById('tmplay').textContent='▶ Start';
        S.studySec+=tmDur;
        gainXP(Math.floor(tmDur/300)*2,'Focus session complete');
        confetti();toast('🎉','Session complete! Great work!','ttl');closeTM();return;
      }
      tmLeft--;updTM();
    },1000);
  }else clearInterval(tmIv);
}
function resetTM(){clearInterval(tmIv);tmRunning=false;tmLeft=tmDur;document.getElementById('tmplay').textContent='▶ Start';updTM();}
function updTM(){
  const m=Math.floor(tmLeft/60).toString().padStart(2,'0'),s=(tmLeft%60).toString().padStart(2,'0');
  document.getElementById('tmdisp').textContent=`${m}:${s}`;
  const pct=tmDur>0?(1-tmLeft/tmDur):0;
  document.getElementById('tmring').setAttribute('stroke-dashoffset',603.19*(1-pct));
}

/* ── DND ── */
function openDND(){
  document.getElementById('dnd').classList.add('open');
  document.body.style.overflow='hidden';
  if(!dndUsed){dndUsed=true;S.ach['fn1']=true;toast('🌙','Achievement: Night Owl!','tgo');}
}
function closeDND(){document.getElementById('dnd').classList.remove('open');document.body.style.overflow='';clearInterval(dndIv);dndRun=false;}
function dndSw(m){
  dndMode=m;
  document.getElementById('dswc').classList.toggle('active',m==='clock');
  document.getElementById('dswt').classList.toggle('active',m==='timer');
  document.getElementById('dclkv').style.display=m==='clock'?'block':'none';
  document.getElementById('dtmrv').style.display=m==='timer'?'block':'none';
  document.getElementById('dsetrow').style.display=m==='timer'?'flex':'none';
  document.getElementById('dctrls').style.display=m==='timer'?'flex':'none';
  if(m==='timer'){clearInterval(dndIv);dndRun=false;updDR();}
}
function setDT(){
  const h=parseInt(document.getElementById('dnh').value)||0;
  const m=parseInt(document.getElementById('dnm').value)||0;
  const s=parseInt(document.getElementById('dns').value)||0;
  dndSec=h*3600+m*60+s||25*60;dndTotal=dndSec;
  clearInterval(dndIv);dndRun=false;document.getElementById('dplay').textContent='▶';updDR();
}
function toggleDT(){
  dndRun=!dndRun;document.getElementById('dplay').textContent=dndRun?'⏸':'▶';
  if(dndRun){
    dndIv=setInterval(()=>{
      if(dndSec<=0){
        clearInterval(dndIv);dndRun=false;document.getElementById('dplay').textContent='▶';
        S.studySec+=dndTotal;
        const xp=Math.floor(dndTotal/300)*3;
        gainXP(xp,`Deep focus: ${fmtD(dndTotal)}`);
        confetti();toast('🌙',`Focus complete! +${xp}XP`,'tgo');return;
      }
      dndSec--;updDR();
    },1000);
  }else clearInterval(dndIv);
}
function resetDT(){clearInterval(dndIv);dndRun=false;dndSec=dndTotal;document.getElementById('dplay').textContent='▶';updDR();}
function addDTMin(m){dndSec+=m*60;dndTotal+=m*60;updDR();}
function updDR(){
  const m=Math.floor(dndSec/60).toString().padStart(2,'0'),s=(dndSec%60).toString().padStart(2,'0');
  const el=document.getElementById('dbigt');if(el)el.textContent=`${m}:${s}`;
  const pct=dndTotal>0?(1-dndSec/dndTotal):0;
  const r=document.getElementById('dring');if(r)r.setAttribute('stroke-dashoffset',816.81*(1-pct));
}

function spawnStars(){
  const c=document.getElementById('dstars');if(!c)return;
  for(let i=0;i<80;i++){
    const el=document.createElement('div');el.className='dstar';
    const sz=Math.random()*2.5+.5;
    el.style.cssText=`left:${Math.random()*100}%;top:${Math.random()*100}%;width:${sz}px;height:${sz}px;animation-duration:${2+Math.random()*5}s;animation-delay:${Math.random()*6}s;`;
    c.appendChild(el);
  }
}

/* ── NAV ── */
function goPage(id,btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.ntab').forEach(t=>t.classList.remove('active'));
  document.getElementById(`page-${id}`).classList.add('active');
  if(btn)btn.classList.add('active');
  refresh();
}

/* ── FRIENDS ── */
function addFriend(){
  const n=document.getElementById('fname').value.trim();if(!n)return;
  S.friends.push({id:Date.now(),name:n,xp:Math.floor(Math.random()*900)+50,col:COLS[S.friends.length%COLS.length]});
  document.getElementById('fname').value='';
  renderLB();gainXP(10,`Added friend ${n}`);toast('👥',`${n} added!`,'ttl');checkAch();
}
function gfl(xp){let l=1;while(xp>=thr(l))l++;return l;}
function renderLB(){
  const el=document.getElementById('lblist');if(!el)return;
  const me={name:S.name||'You',xp:S.xp,col:'#E8C97A',isMe:true};
  const all=[me,...S.friends].sort((a,b)=>b.xp-a.xp);
  const mx=Math.max(...all.map(f=>f.xp),1);
  el.innerHTML=all.map((f,i)=>{
    const ri=i===0?'r1':i===1?'r2':i===2?'r3':'rn';
    const rm=i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`;
    return`<div class="fc" style="${f.isMe?'border-color:rgba(232,201,122,.25);background:rgba(232,201,122,.04)':''}">
      <div class="fcrw ${ri}">${rm}</div>
      <div class="fcav" style="background:${f.col}22;border:2px solid ${f.col}44">${f.name[0].toUpperCase()}</div>
      <div class="fcinfo">
        <div class="fcname">${f.name}${f.isMe?'<span class="fcyou">YOU</span>':''}</div>
        <div class="fcst">${f.xp} XP · Level ${gfl(f.xp)}</div>
        <div class="fbt"><div class="fbf" style="width:${Math.round(f.xp/mx*100)}%;background:${f.col}"></div></div>
      </div>
    </div>`;
  }).join('');
}

/* ── COLLAB ── */
function addCollab(){
  const n=document.getElementById('cname').value.trim();if(!n)return;
  const mems=[S.name[0].toUpperCase(),...S.friends.slice(0,3).map(f=>f.name[0].toUpperCase())];
  S.collabs.unshift({id:Date.now(),name:n,progress:0,mems});
  document.getElementById('cname').value='';
  renderCollab();toast('🤝',`Collab "${n}" created!`,'ttl');
}
function progCollab(id){
  const t=S.collabs.find(x=>x.id===id);if(!t)return;
  t.progress=Math.min(100,t.progress+10);
  if(t.progress===100){S.ach['co1']=true;gainXP(50,'Collab task complete!');confetti();}
  renderCollab();
}
function renderCollab(){
  const el=document.getElementById('clist');if(!el)return;
  el.innerHTML=S.collabs.map(t=>`<div class="ct">
    <div class="cth"><div class="ctn">${t.name}</div><span class="tg tgtm">${t.progress}%</span></div>
    <div class="pbt"><div class="pbf" style="width:${t.progress}%"></div></div>
    <div class="cmr">
      <div class="cmas">${t.mems.slice(0,4).map((m,i)=>`<div class="cma" style="background:${COLS[i]}33">${m}</div>`).join('')}</div>
      <button class="btn btl bsm" onclick="progCollab(${t.id})">+10% Progress</button>
    </div>
    <div class="cnotes">
      ${(t.notes||[]).map(n=>`<div class="cnote-item">
        <div class="cnote-av" style="background:${n.col}33;color:${n.col}">${n.av}</div>
        <div class="cnote-txt">${n.text}</div>
        <div class="cnote-time">${n.time}</div>
      </div>`).join('') || '<div style="color:var(--text3);font-size:11px;padding:4px 0">No messages yet — be the first!</div>'}
      <div class="cnote-inp-row">
        <input class="fi" id="cn-inp-${t.id}" placeholder="Add a note…" style="flex:1;padding:8px 12px;font-size:12px" onkeydown="if(event.key==='Enter')addCollabNote(${t.id})">
        <button class="btn btl bsm" onclick="addCollabNote(${t.id})">Send</button>
      </div>
    </div>
  </div>`).join('');
}

/* ── ACHIEVEMENTS ── */
function buildAch(){
  const g=document.getElementById('achgrid');if(!g)return;
  g.innerHTML=ACH.map(a=>`<div class="ach ${S.ach[a.id]?'':'locked'}">
    <span class="acic">${a.ic}</span><div class="acnm">${a.n}</div><div class="acds">${a.d}</div>
  </div>`).join('');
}
function checkAch(){
  const done=S.tasks.filter(t=>t.done).length;
  [{id:'f1',c:done>=1},{id:'s3',c:S.streak>=3},{id:'s7',c:S.streak>=7},
   {id:'t5',c:done>=5},{id:'t25',c:done>=25},{id:'lv5',c:S.level>=5},
   {id:'lv10',c:S.level>=10},{id:'x500',c:S.xp>=500},
   {id:'st60',c:S.studySec>=3600},{id:'fr3',c:S.friends.length>=3}
  ].forEach(c=>{
    if(c.c&&!S.ach[c.id]){
      S.ach[c.id]=true;const a=ACH.find(x=>x.id===c.id);
      toast(a.ic,`Achievement: ${a.n}!`,'tgo');gainXP(25,`Achievement: ${a.n}`);confetti();
    }
  });buildAch();
}

/* ── LEVEL UP ── */
function showLU(){
  const t=LVL[Math.min(S.level-1,LVL.length-1)].t;
  document.getElementById('lutit').textContent=`LEVEL ${S.level}!`;
  document.getElementById('lusub').textContent=`You are now a ${t} Scholar! ✦`;
  document.getElementById('luov').classList.add('show');
}

/* ── TOAST ── */
function toast(ic,msg,cls='tgo'){
  const c=document.getElementById('toasts');
  const el=document.createElement('div');el.className=`toast ${cls}`;
  el.innerHTML=`<span class="ttic">${ic}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(()=>{el.classList.add('exit');setTimeout(()=>el.remove(),320);},3200);
}

/* ── CONFETTI ── */
function confetti(){
  const cs=['#E8C97A','#F5DFA0','#C8A84B','#2DD4BF','#A78BFA','#FB7185','#fff'];
  for(let i=0;i<50;i++){
    const el=document.createElement('div');el.className='cp';
    const sz=5+Math.random()*10;
    el.style.cssText=`left:${Math.random()*100}vw;top:-16px;width:${sz}px;height:${sz}px;background:${cs[Math.floor(Math.random()*cs.length)]};border-radius:${Math.random()>.5?'50%':'2px'};animation-duration:${1.8+Math.random()*1.2}s;animation-delay:${Math.random()*.6}s;`;
    document.body.appendChild(el);setTimeout(()=>el.remove(),3000);
  }
}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(document.getElementById('dnd').classList.contains('open'))closeDND();
    if(document.getElementById('tmov').classList.contains('open'))closeTM();
    if(document.getElementById('luov').classList.contains('show'))document.getElementById('luov').classList.remove('show');
    if(document.getElementById('profile-ov').classList.contains('open'))document.getElementById('profile-ov').classList.remove('open');
    if(document.getElementById('edit-ov').classList.contains('open'))document.getElementById('edit-ov').classList.remove('open');
  }
});
updDR();

/* ── FOCUS GOAL ── */
S.focusGoal=''; S.focusGoalDone=false;
function editFocusGoal(){
  const disp=document.getElementById('fg-display'),inp=document.getElementById('fg-inp');
  disp.style.display='none';inp.style.display='block';
  inp.value=S.focusGoal;inp.focus();
  document.getElementById('fg-done-btn').style.display=S.focusGoal?'inline-flex':'none';
}
function saveFocusGoal(){
  const inp=document.getElementById('fg-inp'),v=inp.value.trim();
  S.focusGoal=v;
  const disp=document.getElementById('fg-display');
  inp.style.display='none';disp.style.display='block';
  if(v){disp.textContent=v;disp.classList.remove('placeholder');document.getElementById('fg-done-btn').style.display='inline-flex';}
  else{disp.textContent='Click to set your intention for today…';disp.classList.add('placeholder');document.getElementById('fg-done-btn').style.display='none';}
}
function completeFocusGoal(){
  if(!S.focusGoal)return;
  S.focusGoalDone=true;
  gainXP(20,'Daily Focus Goal completed!');confetti();
  document.getElementById('fg-display').textContent='✅ '+S.focusGoal;
  document.getElementById('fg-done-btn').style.display='none';
  toast('🎯','Daily goal done! +20 XP','ttl');
}

/* ── WEEKLY SUMMARY ── */
S.weeklyLog=S.weeklyLog||{};
S.weeklyXpLog=S.weeklyXpLog||{};
function getWeekData(){
  const today=new Date(),days=[];
  for(let i=6;i>=0;i--){const d=new Date(today);d.setDate(d.getDate()-i);days.push(d.toDateString());}
  return days;
}
function renderWeeklySummary(){
  const days=getWeekData();
  const wdone=days.reduce((a,d)=>(S.weeklyLog[d]?.tasks||0)+a,0);
  const wxp=days.reduce((a,d)=>(S.weeklyXpLog[d]||0)+a,0);
  const wtime=Math.floor(S.studySec/60);
  ['ws-wtasks','ws-wxp'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=[wdone,wxp][i];});
  const wte=document.getElementById('ws-wtime');if(wte)wte.textContent=wtime>=60?`${Math.floor(wtime/60)}h ${wtime%60}m`:`${wtime}m`;
  renderXPChart(days);
}
function renderXPChart(days){
  const c=document.getElementById('xp-chart-bars');if(!c)return;
  const vals=days.map(d=>S.weeklyXpLog[d]||0);
  const max=Math.max(...vals,10);
  const DAY=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  c.innerHTML=days.map((d,i)=>{
    const h=Math.max(4,Math.round((vals[i]/max)*72));
    const date=new Date(d);
    const isToday=d===new Date().toDateString();
    return`<div class="cbar-wrap">
      <div class="cbar" style="height:${h}px;${isToday?'background:linear-gradient(180deg,var(--gold),rgba(232,201,122,.3));box-shadow:0 0 12px rgba(232,201,122,.3)':''}">
        ${vals[i]>0?`<span class="cbar-val">${vals[i]}</span>`:''}
      </div>
      <span class="cbar-lbl" style="${isToday?'color:var(--gold)':''}">${DAY[date.getDay()]}</span>
    </div>`;
  }).join('');
}

/* ── SUBJECT CHIPS ── */
const SUB_COLS={Math:'rgba(167,139,250,',Science:'rgba(45,212,191,',English:'rgba(56,189,248,',History:'rgba(251,113,133,',Art:'rgba(249,115,22,',CS:'rgba(132,204,22,',Other:'rgba(232,201,122,'};
function renderSubChips(){
  const el=document.getElementById('sub-chips');if(!el)return;
  const counts={};
  S.tasks.forEach(t=>{counts[t.sub]=(counts[t.sub]||0)+1;});
  if(!Object.keys(counts).length){el.innerHTML='<span style="font-size:12px;color:var(--text3)">No tasks yet</span>';return;}
  el.innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([sub,n])=>{
    const c=SUB_COLS[sub]||'rgba(232,201,122,';
    return`<div class="sub-chip" style="background:${c}.08);color:${c}1);border-color:${c}.2)" onclick="filterBySubject('${sub}')">${sub} <span style="opacity:.6">${n}</span></div>`;
  }).join('');
}
function filterBySubject(sub){
  goPage('tasks',document.querySelectorAll('.ntab')[1]);
  setTimeout(()=>{
    const flt=document.getElementById('tfilter');
    if(flt){flt.value='all';}
    renderTasks();
    toast('🏷️',`Showing ${sub} tasks`,'tgo');
  },100);
}

/* ── EDIT TASK ── */
function openEditTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-name').value=t.name;
  document.getElementById('edit-sub').value=t.sub;
  document.getElementById('edit-pri').value=t.pri;
  document.getElementById('edit-due').value=t.due||'';
  document.getElementById('edit-notes').value=t.notes||'';
  const h=Math.floor(t.dur/3600),m=Math.floor((t.dur%3600)/60),s=t.dur%60;
  document.getElementById('edit-hr').value=h||'';
  document.getElementById('edit-mn').value=m||'';
  document.getElementById('edit-sc').value=s||'';
  document.getElementById('edit-ov').classList.add('open');
}
function saveEditTask(){
  const id=parseInt(document.getElementById('edit-id').value);
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  t.name=document.getElementById('edit-name').value.trim()||t.name;
  t.sub=document.getElementById('edit-sub').value;
  t.pri=document.getElementById('edit-pri').value;
  t.due=document.getElementById('edit-due').value||'';
  t.notes=document.getElementById('edit-notes').value.trim()||'';
  const h=parseInt(document.getElementById('edit-hr').value)||0;
  const m=parseInt(document.getElementById('edit-mn').value)||0;
  const s=parseInt(document.getElementById('edit-sc').value)||0;
  t.dur=(h*3600)+(m*60)+s||t.dur;
  document.getElementById('edit-ov').classList.remove('open');
  renderTasks();toast('✏️',`"${t.name}" updated!`,'tgo');
}

/* ── PROFILE ── */
function openProfile(){
  const n=S.name;
  document.getElementById('prof-av-big').textContent=n?n[0].toUpperCase():'?';
  document.getElementById('prof-name-inp').value=n;
  document.getElementById('ps-xp').textContent=S.xp;
  document.getElementById('ps-lvl').textContent=S.level;
  document.getElementById('ps-done').textContent=S.tasks.filter(t=>t.done).length;
  document.getElementById('ps-str').textContent=S.best;
  const m=Math.floor(S.studySec/60);
  document.getElementById('ps-time').textContent=m>=60?`${Math.floor(m/60)}h`:m+'m';
  document.getElementById('ps-ach').textContent=Object.values(S.ach).filter(Boolean).length;
  document.getElementById('profile-ov').classList.add('open');
}
function saveProfileName(){
  const n=document.getElementById('prof-name-inp').value.trim();
  if(!n)return;
  S.name=n;
  document.getElementById('prof-av-big').textContent=n[0].toUpperCase();
  refresh();toast('👤','Name updated!','tgo');
}

/* ── COLLAB NOTES ── */
function addCollabNote(id){
  const inp=document.getElementById(`cn-inp-${id}`);if(!inp)return;
  const text=inp.value.trim();if(!text)return;
  const t=S.collabs.find(x=>x.id===id);if(!t)return;
  if(!t.notes)t.notes=[];
  const now=new Date();
  t.notes.push({av:S.name[0].toUpperCase(),col:'#E8C97A',text,time:`${now.getHours()}:${now.getMinutes().toString().padStart(2,'0')}`});
  inp.value='';
  renderCollab();gainXP(2,'Collab message sent');
}

/* ── POMODORO ── */
let pomoState={phase:'focus',cycle:0,totalCycles:4,focusMins:25,breakMins:5,longBreakMins:15,running:false,sec:25*60,total:25*60,iv:null};
const POMO_COLORS={focus:'url(#pg)',break:'url(#pg2)'};
function buildPomoDots(){
  const c=document.getElementById('pomo-dots');if(!c)return;
  c.innerHTML=Array.from({length:pomoState.totalCycles},(_,i)=>{
    const cls=i<pomoState.cycle?'pomo-dot done':i===pomoState.cycle&&pomoState.running?'pomo-dot active':'pomo-dot';
    return`<div class="${cls}"></div>`;
  }).join('');
}
function updPomoDisp(){
  const m=Math.floor(pomoState.sec/60).toString().padStart(2,'0'),s=(pomoState.sec%60).toString().padStart(2,'0');
  const el=document.getElementById('pomo-disp');if(el)el.textContent=`${m}:${s}`;
  const pct=pomoState.total>0?(1-pomoState.sec/pomoState.total):0;
  const ring=document.getElementById('pomo-ring');if(ring)ring.setAttribute('stroke-dashoffset',703.72*(1-pct));
  const ph=document.getElementById('pomo-phase');
  if(ph)ph.textContent=`${pomoState.phase==='focus'?'FOCUS':'BREAK'} · SESSION ${pomoState.cycle+1} OF ${pomoState.totalCycles}`;
  const sub=document.getElementById('pomo-sub');
  if(sub)sub.textContent=pomoState.phase==='focus'?'DEEP FOCUS':pomoState.phase==='longbreak'?'LONG BREAK':'SHORT BREAK';
  buildPomoDots();
}
function togglePomo(){
  pomoState.running=!pomoState.running;
  document.getElementById('pomo-play').textContent=pomoState.running?'⏸':'▶';
  if(pomoState.running){
    pomoState.iv=setInterval(()=>{
      if(pomoState.sec<=0){
        clearInterval(pomoState.iv);pomoState.running=false;
        document.getElementById('pomo-play').textContent='▶';
        playChime();
        if(pomoState.phase==='focus'){
          S.studySec+=pomoState.focusMins*60;
          gainXP(15,'Pomodoro focus complete!');confetti();
          pomoState.cycle++;
          if(pomoState.cycle>=pomoState.totalCycles){
            pomoState.cycle=0;pomoState.phase='longbreak';
            pomoState.sec=pomoState.longBreakMins*60;pomoState.total=pomoState.sec;
            toast('🍅','All 4 cycles done! Long break time 🎉','ttl');
          } else {
            pomoState.phase='break';
            pomoState.sec=pomoState.breakMins*60;pomoState.total=pomoState.sec;
            toast('☕','Focus done! Take a 5 min break','ttl');
          }
        } else {
          pomoState.phase='focus';
          pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;
          toast('🍅','Break over — back to focus!','tgo');
        }
        updPomoDisp();return;
      }
      pomoState.sec--;updPomoDisp();
    },1000);
  } else clearInterval(pomoState.iv);
}
function resetPomo(){
  clearInterval(pomoState.iv);pomoState.running=false;pomoState.cycle=0;pomoState.phase='focus';
  pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;
  document.getElementById('pomo-play').textContent='▶';updPomoDisp();
}
function skipPomo(){
  clearInterval(pomoState.iv);pomoState.running=false;
  pomoState.sec=0;updPomoDisp();
  setTimeout(()=>{
    if(pomoState.phase==='focus'){pomoState.phase='break';pomoState.cycle++;if(pomoState.cycle>=pomoState.totalCycles){pomoState.cycle=0;pomoState.phase='longbreak';pomoState.sec=pomoState.longBreakMins*60;}else{pomoState.sec=pomoState.breakMins*60;}pomoState.total=pomoState.sec;}
    else{pomoState.phase='focus';pomoState.sec=pomoState.focusMins*60;pomoState.total=pomoState.sec;}
    updPomoDisp();document.getElementById('pomo-play').textContent='▶';
  },300);
}

/* ── SOUND ── */
let soundOn=false;
function toggleSound(){soundOn=!soundOn;const el=document.getElementById('stog-el'),lbl=document.getElementById('sound-lbl');if(el)el.classList.toggle('on',soundOn);if(lbl)lbl.textContent=soundOn?'Sound On':'Sound Off';}
function playChime(){
  if(!soundOn)return;
  try{
    const ctx=new(window.AudioContext||window.webkitAudioContext)();
    const notes=[523,659,784,1047];
    notes.forEach((f,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.frequency.value=f;osc.type='sine';
      gain.gain.setValueAtTime(0,ctx.currentTime+i*.15);
      gain.gain.linearRampToValueAtTime(.2,ctx.currentTime+i*.15+.05);
      gain.gain.linearRampToValueAtTime(0,ctx.currentTime+i*.15+.4);
      osc.start(ctx.currentTime+i*.15);osc.stop(ctx.currentTime+i*.15+.4);
    });
  }catch(e){}
}

/* ── EXTEND dndSw for pomodoro ── */
const _origDndSw=dndSw;
function dndSw(m){
  dndMode=m;
  ['dswc','dswt','dswp'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.remove('active');});
  const map={clock:'dswc',timer:'dswt',pomo:'dswp'};
  const active=document.getElementById(map[m]);if(active)active.classList.add('active');
  document.getElementById('dclkv').style.display=m==='clock'?'block':'none';
  document.getElementById('dtmrv').style.display=m==='timer'?'block':'none';
  document.getElementById('dsetrow').style.display=m==='timer'?'flex':'none';
  document.getElementById('dctrls').style.display=m==='timer'?'flex':'none';
  document.getElementById('dndpomov').style.display=m==='pomo'?'block':'none';
  document.getElementById('dnd-pomo-ctrls').style.display=m==='pomo'?'flex':'none';
  if(m==='timer'){clearInterval(dndIv);dndRun=false;updDR();}
  if(m==='pomo'){clearInterval(dndIv);dndRun=false;updPomoDisp();}
}

/* ── SIMULATE FRIEND ACTIVITY (weekly XP drift) ── */
setInterval(()=>{
  S.friends.forEach(f=>{if(Math.random()<.3)f.xp+=Math.floor(Math.random()*15)+1;});
},30000);

/* ── PATCH gainXP to track weekly ── */
const _origGainXP=gainXP;
function gainXP(amt,reason){
  const prev=S.level;S.xp+=amt;
  S.weeklyXpLog=S.weeklyXpLog||{};
  const today=new Date().toDateString();
  S.weeklyXpLog[today]=(S.weeklyXpLog[today]||0)+amt;
  while(S.xp>=thr(S.level))S.level++;
  if(S.level>prev){showLU();confetti();}
  refresh();renderWeeklySummary();renderSubChips();
  toast('⚡',`+${amt} XP — ${reason}`,'tgo');checkAch();
}

/* ── PATCH completeTask to track weekly ── */
const _origComplete=completeTask;
function completeTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t||t.done)return;
  t.done=true;S.totalDone++;
  S.weeklyLog=S.weeklyLog||{};
  const today=new Date().toDateString();
  S.weeklyLog[today]=S.weeklyLog[today]||{tasks:0};
  S.weeklyLog[today].tasks++;
  const xp=t.pri==='high'?30:t.pri==='med'?20:10;
  gainXP(xp,`"${t.name}" completed`);confetti();updStreak();
  toast('✅',`"${t.name}" done! +${xp}XP`,'ttl');
}

/* ── INIT EXTRAS ── */
setTimeout(()=>{renderWeeklySummary();renderSubChips();updPomoDisp();},700);

/* ── QUOTE SYSTEM ── */
const QUOTES_DB = [
  {t:"The secret of getting ahead is getting started.",a:"Mark Twain"},
  {t:"It always seems impossible until it's done.",a:"Nelson Mandela"},
  {t:"Don't watch the clock; do what it does. Keep going.",a:"Sam Levenson"},
  {t:"The beautiful thing about learning is that no one can take it away from you.",a:"B.B. King"},
  {t:"Success is the sum of small efforts, repeated day in and day out.",a:"Robert Collier"},
  {t:"Believe you can and you're halfway there.",a:"Theodore Roosevelt"},
  {t:"Education is the most powerful weapon which you can use to change the world.",a:"Nelson Mandela"},
  {t:"The more that you read, the more things you will know.",a:"Dr. Seuss"},
  {t:"You don't have to be great to start, but you have to start to be great.",a:"Zig Ziglar"},
  {t:"An investment in knowledge pays the best interest.",a:"Benjamin Franklin"},
  {t:"The expert in anything was once a beginner.",a:"Helen Hayes"},
  {t:"Push yourself, because no one else is going to do it for you.",a:"Unknown"},
  {t:"Great things never come from comfort zones.",a:"Neil Strauss"},
  {t:"Dream it. Wish it. Do it.",a:"Unknown"},
  {t:"Success doesn't just find you. You have to go out and get it.",a:"Unknown"},
  {t:"The harder you work for something, the greater you'll feel when you achieve it.",a:"Unknown"},
  {t:"Don't stop when you're tired. Stop when you're done.",a:"Unknown"},
  {t:"Wake up with determination. Go to bed with satisfaction.",a:"Unknown"},
  {t:"Do something today that your future self will thank you for.",a:"Sean Patrick Flanery"},
  {t:"Little things make big days.",a:"Unknown"},
  {t:"It's going to be hard, but hard does not mean impossible.",a:"Unknown"},
  {t:"Don't wait for opportunity. Create it.",a:"Unknown"},
  {t:"Study hard, for the well is deep and our brains are shallow.",a:"Richard Baxter"},
  {t:"The mind is not a vessel to be filled, but a fire to be kindled.",a:"Plutarch"},
  {t:"Develop a passion for learning. If you do, you will never cease to grow.",a:"Anthony J. D'Angelo"},
  {t:"Learning is not attained by chance; it must be sought with ardor and attended with diligence.",a:"Abigail Adams"},
  {t:"Genius is one percent inspiration and ninety-nine percent perspiration.",a:"Thomas Edison"},
  {t:"The only way to do great work is to love what you do.",a:"Steve Jobs"},
  {t:"In the middle of difficulty lies opportunity.",a:"Albert Einstein"},
  {t:"What you get by achieving your goals is not as important as what you become.",a:"Zig Ziglar"},
];

let qIdx = Math.floor(Math.random() * QUOTES_DB.length);
let qPaused = false;
let qInterval = null;
let qProgressAnim = null;

function showQuote(idx, direction) {
  const qtxt = document.getElementById('qtxt');
  const qauthor = document.getElementById('qauthor');
  const qcnt = document.getElementById('qcnt');
  if (!qtxt) return;

  // fade out
  qtxt.classList.remove('fade-in');
  qtxt.classList.add('fade-out');
  qauthor.classList.remove('fade-in');
  qauthor.classList.add('fade-out');

  setTimeout(() => {
    const q = QUOTES_DB[idx];
    qtxt.textContent = '\u201C' + q.t + '\u201D';
    qauthor.textContent = '— ' + q.a;
    qcnt.textContent = (idx + 1) + ' / ' + QUOTES_DB.length;

    qtxt.classList.remove('fade-out');
    qtxt.classList.add('fade-in');
    qauthor.classList.remove('fade-out');
    qauthor.classList.add('fade-in');

    // restart progress bar
    restartProgressBar();
  }, 550);
}

function restartProgressBar() {
  const bar = document.getElementById('qprogbar');
  if (!bar) return;
  // remove and re-add to restart CSS animation
  bar.style.animation = 'none';
  bar.offsetHeight; // reflow
  bar.style.animation = '';
  bar.style.animation = 'qprog 20s linear forwards';
}

function nextQuote() {
  qIdx = (qIdx + 1) % QUOTES_DB.length;
  showQuote(qIdx);
  resetQTimer();
}

function prevQuote() {
  qIdx = (qIdx - 1 + QUOTES_DB.length) % QUOTES_DB.length;
  showQuote(qIdx);
  resetQTimer();
}

function toggleQuotePause() {
  qPaused = !qPaused;
  const btn = document.getElementById('qpausebtn');
  const bar = document.getElementById('qprogbar');
  if (qPaused) {
    btn.textContent = '▶ Resume';
    btn.classList.add('qpause-active');
    clearInterval(qInterval);
    if (bar) bar.style.animationPlayState = 'paused';
  } else {
    btn.textContent = '⏸ Pause';
    btn.classList.remove('qpause-active');
    if (bar) bar.style.animationPlayState = 'running';
    resetQTimer();
  }
}

function resetQTimer() {
  clearInterval(qInterval);
  if (!qPaused) {
    qInterval = setInterval(() => {
      qIdx = (qIdx + 1) % QUOTES_DB.length;
      showQuote(qIdx);
    }, 20000);
  }
}

function initQuotes() {
  // Shuffle so every session starts differently
  qIdx = Math.floor(Math.random() * QUOTES_DB.length);
  const q = QUOTES_DB[qIdx];
  const qtxt = document.getElementById('qtxt');
  const qauthor = document.getElementById('qauthor');
  const qcnt = document.getElementById('qcnt');
  if (qtxt) qtxt.textContent = '\u201C' + q.t + '\u201D';
  if (qauthor) qauthor.textContent = '— ' + q.a;
  if (qcnt) qcnt.textContent = (qIdx + 1) + ' / ' + QUOTES_DB.length;
  restartProgressBar();
  resetQTimer();
}

// Init quotes after app boots — hook into boot()
const _origBoot = boot;
// We already defined boot above, so we patch initQuotes into setTimeout in boot call
// Instead, call initQuotes after app becomes visible
setTimeout(initQuotes, 1200);
