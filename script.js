// ChronoFlow V4 - Complete JavaScript

const state = {
    user:null, accounts:{}, events:[], weekOffset:0, monthOffset:0,
    activeView:'planning', theme:'dark', streak:0, lastUsedDate:null,
    template:'custom', templateData:{}, lang:null, notifications:true,
    currentEventId:null, verificationCode:null, xp:0, level:1,
    totalXpEarned:0, tutorialDone:false, monthDirection:'right', weekDirection:'right',
    voiceText:'', recognition:null, tutorialStep:0
};

// XP SYSTEM
const XP_GAINS = { daily_login:15, event_created:10, week_planned:50,
    badge_1day:20, badge_3day:30, badge_7day:50, badge_14day:75, badge_30day:120,
    badge_60day:200, badge_90day:350, badge_first:25 };

const RANKS = [
    {name:'Bronze',  minLevel:1,  maxLevel:10,  cls:'rank-bronze',  icon:'🥉', color:'#CD7F32'},
    {name:'Silver',  minLevel:11, maxLevel:20,  cls:'rank-silver',  icon:'🥈', color:'#A8A9AD'},
    {name:'Gold',    minLevel:21, maxLevel:30,  cls:'rank-gold',    icon:'🥇', color:'#FFD700'},
    {name:'Diamond', minLevel:31, maxLevel:40,  cls:'rank-diamond', icon:'💎', color:'#B9F2FF'},
    {name:'Master',  minLevel:41, maxLevel:55,  cls:'rank-master',  icon:'🔮', color:'#9B59B6'},
    {name:'Legend',  minLevel:56, maxLevel:999, cls:'rank-legend',  icon:'👑', color:'#FF4500'}
];

function xpForLevel(l) {
    if (l<=5)  return Math.round(100*Math.pow(1.4,l-1));
    if (l<=15) return Math.round(250*Math.pow(1.35,l-5));
    return Math.round(800*Math.pow(1.3,l-15));
}
function getTotalXpForLevel(l) { let t=0; for(let i=1;i<l;i++) t+=xpForLevel(i); return t; }
function getCurrentLevelXp() { return state.xp - getTotalXpForLevel(state.level); }
function getXpNeededForNextLevel() { return xpForLevel(state.level); }
function getRank(l) { return RANKS.find(r=>l>=r.minLevel&&l<=r.maxLevel)||RANKS[0]; }

function addXp(amount) {
    const prev = state.level;
    state.xp += amount; state.totalXpEarned += amount;
    while (state.xp >= getTotalXpForLevel(state.level+1)) state.level++;
    if (state.level > prev) { toast('⬆️ Niveau '+state.level+' ! Nouveau costume Chronos !'); updateMascotCostume(); setTimeout(updateRankDisplays,300); }
    showXpPopup('+'+amount+' XP');
    saveState(); updateXpBar();
}

function showXpPopup(text) {
    const el = document.getElementById('xpPopup'); if(!el) return;
    el.textContent = text; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),2200);
}

function updateXpBar() {
    const ll=document.getElementById('xpLevelLabel');
    const bf=document.getElementById('xpBarFill');
    const bt=document.getElementById('xpBarText');
    const rp=document.getElementById('xpRankPill');
    if(!ll) return;
    const rank=getRank(state.level);
    const cur=getCurrentLevelXp(); const need=getXpNeededForNextLevel();
    const pct=Math.min(100,Math.round((cur/need)*100));
    ll.textContent='Niveau '+state.level;
    if(bf) bf.style.width=pct+'%';
    if(bt) bt.textContent=cur+' / '+need+' XP';
    if(rp) { rp.textContent=rank.icon+' '+rank.name; rp.className='xp-rank-pill '+rank.cls; }
}

function updateRankDisplays() {
    const rank=getRank(state.level);
    const pr=document.getElementById('profileRankDisplay');
    if(pr) pr.innerHTML='<span class="'+rank.cls+'" style="font-size:1.1rem">'+rank.icon+' '+rank.name+'</span>';
    const pa=document.getElementById('profileAvatarEl');
    if(pa) pa.className='profile-avatar avatar-'+rank.cls;
    // Chronos couleur rank
    const koro=document.getElementById('mascotKoro');
    if(koro) {
        koro.className='mascot-koro koro-rank-'+rank.cls.replace('rank-','');
        // Tie color = rank
        const tie=document.getElementById('koroTie');
        if(tie) tie.style.background=rank.color;
    }
    // Accessory équipé
    updateChronosAccessory();
}

function getMascotLevel() {
    const l=state.level;
    if(l>=15) return Math.floor((l-15)/15)+5;
    if(l>=10) return 4; if(l>=5) return 3; if(l>=3) return 2; return 1;
}

function updateMascotCostume() {
    const torso=document.getElementById('mascotTorso'); if(!torso) return;
    const lv=getMascotLevel();
    if(lv>=5) { torso.style.background='linear-gradient(160deg,#2d1b4e,#1a0f30)'; torso.style.boxShadow='0 0 20px rgba(155,89,182,0.5)'; }
    else if(lv>=3) { torso.style.background='linear-gradient(160deg,#1a3a2e,#0f2a1e)'; torso.style.border='1px solid gold'; }
    else if(lv>=2) { torso.style.background='linear-gradient(160deg,#2d1b4e,#1a0f30)'; }
}

// INIT
document.addEventListener('DOMContentLoaded', ()=>{
    loadState();
    createParticles('particlesLang'); createParticles('particles'); createParticles('particles2');
    setupAuthInputs();
    const hasLang=localStorage.getItem('cf_lang');
    if(!hasLang) document.getElementById('langScreen').style.display='flex';
    else if(!state.user) document.getElementById('authScreen').style.display='flex';
    else launchApp();
});

function createParticles(id) {
    const c=document.getElementById(id); if(!c) return;
    for(let i=0;i<20;i++) {
        const p=document.createElement('div'); p.className='particle';
        p.style.left=Math.random()*100+'%'; p.style.bottom='-10px';
        p.style.setProperty('--drift',(Math.random()*200-100)+'px');
        p.style.animationDuration=(6+Math.random()*8)+'s';
        p.style.animationDelay=(Math.random()*8)+'s';
        p.style.width=p.style.height=(3+Math.random()*4)+'px';
        c.appendChild(p);
    }
}

function setupAuthInputs() {
    document.querySelectorAll('.auth-live-input').forEach(inp=>{
        inp.addEventListener('focus',()=>inp.style.color='white');
        inp.addEventListener('blur', ()=>{ if(inp.value) inp.style.color='rgba(255,255,255,0.55)'; });
        inp.addEventListener('input',()=>inp.style.color='white');
    });
}

// LANGUAGE
function selectLang(lang) {
    state.lang=lang; localStorage.setItem('cf_lang',lang); saveState();
    document.getElementById('langScreen').style.display='none';
    document.getElementById('authScreen').style.display='flex';
    updateLangDropdownDisplay();
}
function setLang(lang) {
    state.lang=lang; localStorage.setItem('cf_lang',lang); saveState();
    updateLangDropdownDisplay(); closeLangDD(); toast('✅ Langue changée');
}
function toggleLangDD() {
    document.getElementById('langDDMenu')?.classList.toggle('open');
    document.getElementById('langDDBtn')?.classList.toggle('open');
}
function closeLangDD() {
    document.getElementById('langDDMenu')?.classList.remove('open');
    document.getElementById('langDDBtn')?.classList.remove('open');
}
function updateLangDropdownDisplay() {
    const langs={
        fr:{name:'Français',svg:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#002395"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#ED2939"/></svg>'},
        en:{name:'English', svg:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="7"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="11"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6"/></svg>'},
        de:{name:'Deutsch', svg:'<svg viewBox="0 0 60 40"><rect width="60" height="13.3" fill="#000"/><rect y="13.3" width="60" height="13.3" fill="#DD0000"/><rect y="26.6" width="60" height="13.4" fill="#FFCE00"/></svg>'},
        es:{name:'Español', svg:'<svg viewBox="0 0 60 40"><rect width="60" height="8" fill="#c60b1e"/><rect y="8" width="60" height="24" fill="#ffc400"/><rect y="32" width="60" height="8" fill="#c60b1e"/></svg>'},
        it:{name:'Italiano',svg:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#CE2B37"/></svg>'},
        ar:{name:'العربية', svg:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#006C35"/><rect width="20" height="40" fill="#fff"/></svg>'},
        pt:{name:'Português',svg:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#E21C1C"/><rect width="24" height="40" fill="#006600"/></svg>'}
    };
    const l=langs[state.lang||'fr'];
    const flag=document.getElementById('langDDFlag');
    const name=document.getElementById('langDDName');
    if(flag) flag.innerHTML=l.svg; if(name) name.textContent=l.name;
}
document.addEventListener('click',e=>{ if(!e.target.closest('#langDDWrap')) closeLangDD(); });

// AUTH
let currentTab='login';
function switchAuthTab(tab) {
    if(tab===currentTab) return; currentTab=tab;
    const slider=document.getElementById('authTabSlider');
    const lf=document.getElementById('loginForm'); const rf=document.getElementById('registerForm');
    const tl=document.getElementById('tabLogin'); const tr=document.getElementById('tabRegister');
    if(tab==='register') {
        slider.classList.add('to-right');
        tl.classList.remove('active'); tr.classList.add('active');
        lf.style.animation='slideAuthOut 0.28s ease-out forwards';
        setTimeout(()=>{
            lf.style.display='none'; lf.classList.remove('active'); lf.style.animation='';
            rf.style.display='block'; rf.classList.add('active');
            rf.style.animation='slideAuthIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards';
            setTimeout(()=>rf.style.animation='',350);
        },250);
    } else {
        slider.classList.remove('to-right');
        tl.classList.add('active'); tr.classList.remove('active');
        rf.style.animation='none'; rf.style.opacity='0';
        setTimeout(()=>{
            rf.style.display='none'; rf.classList.remove('active'); rf.style.animation=''; rf.style.opacity='';
            lf.style.display='block'; lf.classList.add('active');
            lf.style.animation='slideAuthIn 0.32s cubic-bezier(0.16,1,0.3,1) forwards';
            setTimeout(()=>lf.style.animation='',350);
        },250);
    }
}

function handleLogin() {
    const email=document.getElementById('loginEmail').value.trim();
    const pass=document.getElementById('loginPassword').value;
    if(!email||!pass) { toast('⚠️ Remplis tous les champs'); return; }
    const acc=state.accounts[email];
    if(!acc) { toast('❌ Compte introuvable'); return; }
    if(acc.password!==btoa(pass)) { toast('❌ Mot de passe incorrect'); return; }
    state.user={...acc,email}; saveState(); launchApp();
}

function handleRegister() {
    const name=document.getElementById('regName').value.trim();
    const email=document.getElementById('regEmail').value.trim();
    const pass=document.getElementById('regPassword').value;
    if(!name||!email||!pass) { toast('⚠️ Tous les champs sont obligatoires'); return; }
    if(!email.includes('@')) { toast('⚠️ Email invalide'); return; }
    if(pass.length<6) { toast('⚠️ Mot de passe : 6 caractères minimum'); return; }
    if(state.accounts[email]) { toast('❌ Email déjà utilisé'); return; }
    state.accounts[email]={name,password:btoa(pass),avatar:'',createdAt:new Date().toISOString(),totalEvents:0};
    state.user={name,email,avatar:'',totalEvents:0};
    state.template='custom'; state.events=[]; state.streak=0; state.xp=0; state.level=1;
    saveState();
    document.getElementById('authScreen').style.display='none';
    document.getElementById('onboardingScreen').style.display='flex';
}

// ONBOARDING
function goObStep(step) {
    document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));
    let id='obStep1';
    if(step==='2s'||step===2) id='obStep2'; else if(step==='2w') id='obStep2w';
    const el=document.getElementById(id); if(el) el.classList.add('active');
}
function selectProfile(type) {
    state.template=type;
    if(type==='student') goObStep('2s');
    else if(type==='worker') goObStep('2w');
    else finishOnboarding();
}
function addCourse() {
    const c=document.getElementById('coursesContainer');
    const row=document.createElement('div'); row.className='course-row';
    row.innerHTML='<select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select><input type="time" class="tinp" value="08:00"><input type="time" class="tinp" value="10:00"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="removeCourse(this)">✕</button>';
    c.appendChild(row);
}
function removeCourse(btn) { btn.parentElement.remove(); }
function finishOnboarding() {
    if(state.template==='student') {
        const rows=document.querySelectorAll('.course-row');
        state.templateData={courses:Array.from(rows).map(r=>({
            day:parseInt(r.querySelector('.sel')?.value||1),
            start:r.querySelectorAll('.tinp')[0]?.value,
            end:r.querySelectorAll('.tinp')[1]?.value,
            subject:r.querySelector('.sinp')?.value
        })).filter(c=>c.subject)};
    } else if(state.template==='worker') {
        state.templateData={workStart:document.getElementById('workStart')?.value||'09:00',workEnd:document.getElementById('workEnd')?.value||'18:00'};
    }
    state.lastUsedDate=new Date().toISOString(); saveState();
    document.getElementById('onboardingScreen').style.display='none'; launchApp();
}

// LAUNCH APP
function launchApp() {
    document.getElementById('authScreen').style.display='none';
    document.getElementById('onboardingScreen').style.display='none';
    document.getElementById('appScreen').style.display='block';
    updateStreakBasedOnUsage(); applyTheme(state.theme); updateHeader();
    updateAllViews(); updateMascotCostume(); updateRankDisplays(); updateXpBar();
    updateLangDropdownDisplay(); setupSidebarHover(); initToggles();
    const today=new Date().toDateString();
    const ll=localStorage.getItem('cf_last_login');
    if(ll!==today) { localStorage.setItem('cf_last_login',today); setTimeout(()=>addXp(XP_GAINS.daily_login),800); }
    if(!state.tutorialDone) setTimeout(()=>document.getElementById('welcomeModal').classList.add('show'),600);
}
function reloadApp() { if(confirm('Revenir à l\'accueil ?')) location.reload(); }

// SIDEBAR
function setupSidebarHover() {
    const sb=document.getElementById('sidebar'); const tg=document.getElementById('sidebarHover');
    if(window.innerWidth>768) {
        sb.addEventListener('mouseenter',()=>sb.classList.add('expanded'));
        sb.addEventListener('mouseleave',()=>sb.classList.remove('expanded'));
    } else tg.addEventListener('click',()=>sb.classList.toggle('mobile-open'));
}

// STREAK
function updateStreakBasedOnUsage() {
    const today=new Date(); today.setHours(0,0,0,0);
    if(!state.lastUsedDate) { state.streak=0; state.lastUsedDate=new Date().toISOString(); saveState(); return; }
    const last=new Date(state.lastUsedDate); last.setHours(0,0,0,0);
    const diff=Math.floor((today-last)/86400000);
    if(diff===0) return; else if(diff===1) state.streak++; else state.streak=0;
    state.lastUsedDate=new Date().toISOString(); saveState();
}

// THEME
function applyTheme(theme) { document.documentElement.setAttribute('data-theme',theme); state.theme=theme; }
function setTheme(theme) {
    applyTheme(theme); saveState();
    // Settings toggle
    const sl=document.getElementById('themeSlider');
    const lb=document.getElementById('themeLight'); const db=document.getElementById('themeDark');
    if(sl) {
        if(theme==='dark') { sl.classList.add('to-right'); db?.classList.add('active-btn'); lb?.classList.remove('active-btn'); }
        else { sl.classList.remove('to-right'); lb?.classList.add('active-btn'); db?.classList.remove('active-btn'); }
    }
    // Header toggle
    const hs=document.getElementById('httSlider');
    if(hs) { hs.classList.toggle('to-right', theme==='dark'); }
}
function initToggles() {
    const ns=document.getElementById('notifSlider');
    if(ns) { if(!state.notifications){ns.classList.add('to-right');document.getElementById('notifNo')?.classList.add('active-btn');}else document.getElementById('notifYes')?.classList.add('active-btn'); }
    const ts=document.getElementById('themeSlider');
    if(ts) { if(state.theme==='dark'){ts.classList.add('to-right');document.getElementById('themeDark')?.classList.add('active-btn');}else{ts.classList.remove('to-right');document.getElementById('themeLight')?.classList.add('active-btn');} }
    // Header theme toggle
    const hs=document.getElementById('httSlider');
    if(hs) { hs.classList.toggle('to-right', state.theme==='dark'); }
}
function setNotif(on) {
    state.notifications=on; saveState();
    const sl=document.getElementById('notifSlider');
    const yb=document.getElementById('notifYes'); const nb=document.getElementById('notifNo');
    if(!sl) return;
    if(on) { sl.classList.remove('to-right'); yb?.classList.add('active-btn'); nb?.classList.remove('active-btn'); }
    else   { sl.classList.add('to-right');    nb?.classList.add('active-btn'); yb?.classList.remove('active-btn'); }
    toast(on?'🔔 Notifications activées':'🔕 Notifications désactivées');
}

// HEADER
function updateHeader() {
    document.getElementById('headerStreak').textContent=state.streak;
    const img=document.getElementById('headerAvatarImg'); const em=document.getElementById('headerAvatarEmoji');
    if(state.user?.avatar) { img.src=state.user.avatar; img.style.display='block'; em.style.display='none'; }
    else { img.style.display='none'; em.style.display='block'; }
}

// VIEWS
function switchView(view) {
    state.activeView=view;
    document.querySelectorAll('.nav-mini-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    const vEl=document.getElementById('view'+view.charAt(0).toUpperCase()+view.slice(1));
    if(vEl) vEl.classList.add('active');
    document.getElementById('aiPanel').style.display=view==='planning'?'block':'none';
    updateCurrentView();
}
function updateCurrentView() {
    const m={planning:updatePlanning,calendar:updateCalendar,insights:updateInsights,templates:updateTemplates,badges:updateBadges,profile:updateProfile,settings:()=>{updateLangDropdownDisplay();initToggles();}};
    m[state.activeView]?.();
}
function updateAllViews() { updatePlanning(); updateCalendar(); updateBadges(); updateProfile(); }

// TUTORIAL
function skipTutorial() { document.getElementById('welcomeModal').classList.remove('show'); state.tutorialDone=true; saveState(); }
const TUT_STEPS = [
    {view:'planning',  target:'aiPanel',      text:"Bienvenue ! 👋 Voici la zone de planning IA. Écris ce que tu dois faire — révisions, sport, rendez-vous — et je génère ton planning optimisé automatiquement !"},
    {view:'planning',  target:'planningGrid', text:"Ton planning hebdomadaire s'affiche ici ! Clique sur un événement pour changer sa priorité. Les couleurs t'aident à voir l'urgence d'un coup d'œil 🎨"},
    {view:'calendar',  target:'monthCal',     text:"Le Calendrier donne une vue mensuelle. Clique sur une date pour voir tous les événements et ton streak actuel 🔥"},
    {view:'insights',  target:'insightsGrid', text:"Les Insights affichent tes statistiques ! Heures travaillées, répartition, objectifs XP... Clique sur une carte pour les détails 📊"},
    {view:'badges',    target:'xpSection',    text:"Ici, gagne des XP et monte de niveau ! Chaque connexion, badge, et semaine planifiée rapporte des XP. Je change de costume en montant de niveau 🎖️"}
];
function startTutorial() {
    document.getElementById('welcomeModal').classList.remove('show');
    state.tutorialStep=0; runTutStep();
}
function runTutStep() {
    const step=TUT_STEPS[state.tutorialStep]; if(!step) { endTut(); return; }
    switchView(step.view);
    document.getElementById('tutOverlay').style.display='block';
    document.getElementById('tutPanel').style.display='flex';
    document.getElementById('spotlight').style.display='block';
    setTimeout(()=>{
        const t=document.getElementById(step.target);
        if(t) {
            const r=t.getBoundingClientRect(); const sp=document.getElementById('spotlight');
            sp.style.top=(r.top-8)+'px'; sp.style.left=(r.left-8)+'px';
            sp.style.width=(r.width+16)+'px'; sp.style.height=(r.height+16)+'px';
        }
    },300);
    const te=document.getElementById('tutText'); const nb=document.getElementById('tutNext');
    te.textContent=''; te.classList.remove('done'); nb.style.display='none';
    typeText(te,step.text,()=>{ te.classList.add('done'); nb.style.display='block'; });
}
function typeText(el,text,cb) {
    let i=0; el.textContent='';
    const iv=setInterval(()=>{
        if(i<text.length){el.textContent+=text[i];i++;}else{clearInterval(iv);if(cb)cb();}
    },22);
}
function tutNext() { state.tutorialStep++; if(state.tutorialStep>=TUT_STEPS.length) endTut(); else runTutStep(); }
function endTut() {
    ['tutOverlay','tutPanel','spotlight'].forEach(id=>document.getElementById(id).style.display='none');
    state.tutorialDone=true; saveState(); switchView('planning'); toast('🎉 Tutoriel terminé ! Bonne planification !');
}

// CHRONOS CHAT
function openChronosChat() { document.getElementById('chronosChatModal').classList.add('show'); }
function closeChronosChat() { document.getElementById('chronosChatModal').classList.remove('show'); }
async function sendMsg() {
    const input=document.getElementById('chatInput'); const text=input.value.trim(); if(!text) return;
    input.value=''; addChatMsg(text,'user');
    const tid=addChatMsg('...','chrono');
    try {
        const resp=await fetch('https://api.anthropic.com/v1/messages',{
            method:'POST',headers:{'Content-Type':'application/json'},
            body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,
                system:'Tu es Chronos, assistant IA de planning dans ChronoFlow. Enthousiaste, bienveillant, pratique. Contexte: streak '+state.streak+' jours, niveau '+state.level+', template '+state.template+'. Réponds en max 3 phrases en français.',
                messages:[{role:'user',content:text}]})
        });
        const data=await resp.json();
        updateChatMsg(tid,data.content?.[0]?.text||"Je suis là pour t'aider ! 😊");
    } catch(e) { updateChatMsg(tid,"Je ne peux pas me connecter en ce moment. Mais continue à planifier, tu es sur la bonne voie ! 💪"); }
}
function addChatMsg(text,type) {
    const c=document.getElementById('chatMessages'); const id='msg-'+Date.now();
    const d=document.createElement('div'); d.className='chat-msg '+(type==='chrono'?'chrono-msg':'user-msg'); d.id=id;
    d.innerHTML='<div class="chat-bubble">'+text+'</div>'; c.appendChild(d); c.scrollTop=c.scrollHeight; return id;
}
function updateChatMsg(id,text) { const el=document.getElementById(id); if(el) el.querySelector('.chat-bubble').textContent=text; document.getElementById('chatMessages').scrollTop=999999; }

// TAGS
function addTag(btn) {
    const ta=document.getElementById('aiInput'); const txt=btn.dataset.txt;
    btn.classList.toggle('active');
    if(btn.classList.contains('active')) { const cur=ta.value.trim(); animateText(ta,cur?cur+'\n'+txt:txt); }
    else ta.value=ta.value.replace(txt,'').trim();
}
function animateText(ta,text) {
    let i=0; ta.value='';
    const iv=setInterval(()=>{ if(i<text.length){ta.value+=text[i];i++;}else clearInterval(iv); },15);
}

// AI GENERATION
async function generate() {
    const input=document.getElementById('aiInput').value.trim();
    if(!input) { toast('⚠️ Écris quelque chose !'); return; }
    document.getElementById('loading').classList.add('show');
    await new Promise(r=>setTimeout(r,1500));
    const evs=parseWithUrgency(input);
    if(evs.length>0) {
        evs.forEach(e=>state.events.push(e));
        if(state.user) state.user.totalEvents=(state.user.totalEvents||0)+evs.length;
        updateAllViews(); saveState();
        document.getElementById('aiInput').value='';
        document.querySelectorAll('.tag.active').forEach(t=>t.classList.remove('active'));
        toast('✨ '+evs.length+' événement(s) créé(s) !');
        setTimeout(()=>addXp(XP_GAINS.event_created*evs.length),200); checkBadges();
    } else toast('⚠️ Reformule ta demande');
    document.getElementById('loading').classList.remove('show');
}
function parseWithUrgency(text) {
    const lower=text.toLowerCase(); const evs=[]; const today=new Date();
    const isUrgent=lower.includes('rien révisé')||lower.includes('pas révisé')||lower.includes('urgent');
    const hasExam=lower.includes('examen')||lower.includes('éval')||lower.includes('contrôle')||lower.includes('exam');
    let subj='Révision';
    const subs={maths:'Maths',français:'Français',anglais:'Anglais',physique:'Physique',chimie:'Chimie',histoire:'Histoire',sport:'Sport'};
    for(const[k,v] of Object.entries(subs)) if(lower.includes(k)){subj=v;break;}
    const dates=extractDates(lower,today);
    const examDate=dates[0]||new Date(new Date().setDate(today.getDate()+7));
    if(hasExam&&isUrgent) {
        const days=Math.max(1,Math.floor((examDate-new Date())/86400000));
        const perDay=days<3?3:2; const dur=days<3?180:120; const times=['9:00','14:00','17:00'];
        for(let i=0;i<days;i++) {
            const d=new Date(); d.setDate(d.getDate()+i+1);
            for(let j=0;j<perDay;j++) evs.push(makeEvent({title:'Révision '+subj+' #'+(j+1),type:'study',date:d,startTime:times[j],duration:dur,priority:'critical'}));
        }
        evs.push(makeEvent({title:'📝 EXAMEN '+subj.toUpperCase(),type:'study',date:examDate,startTime:'8:00',duration:180,priority:'critical'}));
    } else {
        const et=detectEventType(lower); const dur=extractDuration(lower);
        const tDates=dates.length>0?dates:[new Date(new Date().setDate(today.getDate()+1))];
        tDates.forEach(d=>evs.push(makeEvent({title:et.title,type:et.type,date:d,startTime:'14:00',duration:dur,priority:'medium'})));
    }
    return evs;
}
function makeEvent(data) {
    const[h,m]=(data.startTime||'9:00').split(':').map(Number);
    const em=h*60+m+(data.duration||60);
    return {id:Date.now()+Math.random(),title:data.title,type:data.type,date:new Date(data.date),
        startTime:data.startTime,endTime:String(Math.floor(em/60)).padStart(2,'0')+':'+String(em%60).padStart(2,'0'),
        duration:data.duration||60,priority:data.priority||'medium'};
}
function detectEventType(t) {
    if(t.includes('ami')||t.includes('amis')) return {type:'social',title:'Voir des amis'};
    if(t.includes('sport')||t.includes('gym')||t.includes('course')) return {type:'personal',title:'Sport'};
    if(t.includes('travail')||t.includes('réunion')) return {type:'work',title:'Travail'};
    if(t.includes('révision')||t.includes('étude')) return {type:'study',title:'Révisions'};
    return {type:'personal',title:'Activité personnelle'};
}
function extractDuration(t) { const h=t.match(/(\d+)\s*h/i); return h?parseInt(h[1])*60:120; }
function extractDates(t,base) {
    const dates=[]; const dm=t.match(/dans\s*(\d+)\s*jours?/i);
    if(dm){const d=new Date(base);d.setDate(base.getDate()+parseInt(dm[1]));dates.push(d);}
    if(t.includes('demain')){const d=new Date(base);d.setDate(base.getDate()+1);dates.push(d);}
    const wdays=[[1,'lundi'],[2,'mardi'],[3,'mercredi'],[4,'jeudi'],[5,'vendredi'],[6,'samedi'],[0,'dimanche']];
    wdays.forEach(([wd,name])=>{ if(t.includes(name)) dates.push(nextWeekday(wd)); });
    return [...new Set(dates.map(d=>d.toDateString()))].map(ds=>new Date(ds));
}
function nextWeekday(day) { const d=new Date(); const cur=d.getDay(); const diff=(day-cur+7)%7||7; d.setDate(d.getDate()+diff); return d; }

// PLANNING
function updatePlanning() {
    const grid=document.getElementById('planningGrid');
    const tb=document.getElementById('planningTemplateBadge');
    if(tb){const n={student:'🎓 Étudiant',worker:'💼 Travailleur',custom:'✨ Personnalisé'};tb.textContent=n[state.template]||'';}
    if(state.events.length===0){grid.innerHTML='<div class="empty-state"><div class="empty-icon">📅</div><h3>Planning vide</h3><p>Utilise l\'IA pour planifier</p></div>';updateEventsSections();updateWeekLabel();return;}
    const today=new Date(); const ws=new Date(today);
    ws.setDate(today.getDate()-today.getDay()+1+state.weekOffset*7);
    const days=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']; let html='<div class="week-grid">';
    for(let i=0;i<7;i++){
        const day=new Date(ws); day.setDate(ws.getDate()+i);
        const isT=day.toDateString()===new Date().toDateString();
        const evs=state.events.filter(e=>new Date(e.date).toDateString()===day.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
        html+='<div class="day-col'+(isT?' today':'')+'"><div class="day-col-header"><div class="day-col-name">'+days[i]+'</div><div class="day-col-num">'+day.getDate()+'</div></div><div>'+
            (evs.length===0?'<p class="hint" style="font-size:0.75rem;padding:0.5rem 0">Libre</p>':
            evs.map(e=>'<div class="event-card '+e.priority+'" onclick="showEventDetail(\''+e.id+'\')"><div class="event-title">'+e.title+'</div><div class="event-time">'+e.startTime+' – '+e.endTime+'</div></div>').join(''))+'</div></div>';
    }
    html+='</div>'; grid.innerHTML=html; updateEventsSections(); updateWeekLabel();
}
function updateEventsSections() {
    const today=new Date(); today.setHours(0,0,0,0);
    const te=state.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);return d.getTime()===today.getTime();}).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    const ue=state.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);return d>today;}).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,10);
    document.getElementById('todayList').innerHTML=te.length===0?'<p class="hint">Rien de prévu</p>':te.map(e=>'<div class="event-item" onclick="showEventDetail(\''+e.id+'\')"><div style="font-weight:700">'+e.title+'</div><div style="font-size:0.83rem;color:var(--text2)">⏰ '+e.startTime+' – '+e.endTime+'</div></div>').join('');
    document.getElementById('upcomingList').innerHTML=ue.length===0?'<p class="hint">Rien de prévu</p>':ue.map(e=>'<div class="event-item" onclick="showEventDetail(\''+e.id+'\')"><div style="font-weight:700">'+e.title+'</div><div style="font-size:0.83rem;color:var(--text2)">📅 '+new Date(e.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+' · '+e.startTime+'</div></div>').join('');
}
function updateWeekLabel() {
    const wl=document.getElementById('weekLabel'); if(!wl) return;
    if(state.weekOffset===0) wl.textContent='Cette semaine';
    else if(state.weekOffset===1) wl.textContent='Semaine prochaine';
    else if(state.weekOffset===-1) wl.textContent='Semaine dernière';
    else wl.textContent='Semaine '+(state.weekOffset>0?'+':'')+state.weekOffset;
}
function changeWeek(d) {
    state.weekOffset+=d; state.weekDirection=d>0?'right':'left';
    const grid=document.getElementById('planningGrid');
    if(grid){grid.classList.remove('slide-right','slide-left');void grid.offsetWidth;grid.classList.add('slide-'+state.weekDirection);}
    updatePlanning();
}

// CALENDAR
function updateCalendar() {
    const container=document.getElementById('monthCal'); if(!container) return;
    const today=new Date(); const target=new Date(today.getFullYear(),today.getMonth()+state.monthOffset,1);
    const ml=document.getElementById('monthLabel');
    if(ml) ml.textContent=target.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
    const firstDay=new Date(target.getFullYear(),target.getMonth(),1);
    const lastDay=new Date(target.getFullYear(),target.getMonth()+1,0);
    const startOff=firstDay.getDay()===0?6:firstDay.getDay()-1;
    let html='<div class="cal-header">';
    ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].forEach(d=>{html+='<div class="cal-wday">'+d+'</div>';});
    html+='</div><div class="cal-body">';
    for(let i=0;i<startOff;i++) html+='<div class="cal-cell other"></div>';
    for(let d=1;d<=lastDay.getDate();d++) {
        const date=new Date(target.getFullYear(),target.getMonth(),d);
        const isT=date.toDateString()===today.toDateString();
        const evs=state.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).slice(0,3);
        html+='<div class="cal-cell'+(isT?' today':'')+'" onclick="showDayDetail(\''+date.toISOString()+'\')"><div class="cal-dn">'+d+'</div>'+
            (evs.length?'<div class="mini-events">'+evs.map(e=>'<div class="mini-ev '+e.priority+'">'+e.title+'</div>').join('')+'</div>':'')+'</div>';
    }
    html+='</div>';
    const dir=state.monthDirection;
    container.innerHTML=html;
    void container.offsetWidth;
    container.classList.remove('slide-right','slide-left');
    container.classList.add('slide-'+dir);
    setTimeout(()=>container.classList.remove('slide-right','slide-left'),450);
}
function changeMonth(d) { state.monthOffset+=d; state.monthDirection=d>0?'right':'left'; updateCalendar(); }

function showDayDetail(dateStr) {
    const date=new Date(dateStr);
    const evs=state.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    const priorLabels={critical:'🔴 Critique',high:'🟠 Haute',medium:'🟡 Moyenne',low:'🟢 Basse'};
    document.getElementById('dayDetailContent').innerHTML=
        '<h2 style="margin-bottom:1rem">'+date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</h2>'+
        '<div style="padding:1rem;background:var(--bg);border-radius:10px;margin-bottom:1rem;text-align:center"><span style="font-size:1.5rem">🔥</span> <strong>Streak : '+state.streak+' jours</strong></div>'+
        (evs.length===0?'<p class="hint">Aucun événement ce jour</p>':
        '<div style="display:flex;flex-direction:column;gap:1rem">'+evs.map(e=>
            '<div class="event-item" onclick="showEventDetail(\''+e.id+'\')" style="cursor:pointer"><div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:700;font-size:1.05rem">'+e.title+'</div><div style="color:var(--text2);font-size:0.85rem">⏰ '+e.startTime+' – '+e.endTime+' · '+e.duration+'min</div></div><span class="pill '+e.priority+'">'+priorLabels[e.priority]+'</span></div></div>'
        ).join('')+'</div>');
    document.getElementById('dayDetailModal').classList.add('show');
}
function closeDayDetail() { document.getElementById('dayDetailModal').classList.remove('show'); }

// INSIGHTS
function updateInsights() {
    const container=document.getElementById('insightsGrid'); if(!container) return;
    const total=state.events.length;
    const totalH=state.events.reduce((s,e)=>s+e.duration/60,0);
    const byType=(t)=>state.events.filter(e=>e.type===t).reduce((s,e)=>s+e.duration/60,0);
    const now2=new Date(); const wks=new Date(now2); wks.setDate(now2.getDate()-now2.getDay()+1); wks.setHours(0,0,0,0);
    const wke=new Date(wks); wke.setDate(wks.getDate()+7);
    const wkEvs=state.events.filter(e=>{const d=new Date(e.date);return d>=wks&&d<wke;});
    const wkH=wkEvs.reduce((s,e)=>s+e.duration/60,0);
    const critEvs=state.events.filter(e=>e.priority==='critical');
    const rank=getRank(state.level);

    container.innerHTML=
    '<div class="insight-card" onclick="showInsightDetail(\'overview\')"><h3>📊 Vue d\'ensemble</h3><div class="big-stat">'+total+'</div><p style="color:var(--text2);margin-top:0.25rem">événements · '+Math.round(totalH)+'h total</p><div class="insight-bar"><div class="insight-bar-fill" style="width:'+Math.min(100,totalH*2)+'%"></div></div></div>'+
    '<div class="insight-card" onclick="showInsightDetail(\'distribution\')"><h3>📚 Répartition</h3><div style="font-size:0.85rem;margin-top:0.5rem">'+
        [['📖 Études',byType('study')],['💼 Travail',byType('work')],['👥 Social',byType('social')],['⚡ Personnel',byType('personal')]].map(([l,h])=>
        '<div style="display:flex;justify-content:space-between;margin-bottom:0.6rem;align-items:center"><span>'+l+'</span><div style="display:flex;align-items:center;gap:0.5rem"><div style="width:70px;height:5px;background:var(--border);border-radius:999px;overflow:hidden"><div style="width:'+Math.min(100,totalH?Math.round((h/totalH)*100):0)+'%;height:100%;background:var(--primary);border-radius:999px"></div></div><strong>'+Math.round(h)+'h</strong></div></div>').join('')+
    '</div></div>'+
    '<div class="insight-card" onclick="showInsightDetail(\'week\')"><h3>📅 Cette semaine</h3><div class="big-stat">'+wkEvs.length+'</div><p style="color:var(--text2);margin-top:0.25rem">'+Math.round(wkH)+'h planifiées</p><p style="font-size:0.8rem;color:var(--primary);margin-top:0.75rem;font-weight:600">🎯 Planifie 5h → +'+XP_GAINS.week_planned+' XP</p></div>'+
    '<div class="insight-card" onclick="showInsightDetail(\'critical\')"><h3>🚨 Priorités critiques</h3><div class="big-stat" style="color:var(--critical)">'+critEvs.length+'</div><p style="color:var(--text2);margin-top:0.25rem">événements urgents</p></div>'+
    '<div class="insight-card" onclick="showInsightDetail(\'xp\')"><h3>⚡ Objectifs XP</h3><div style="font-size:0.85rem;margin-top:0.75rem">'+
        [['📅 Connexion quotidienne',XP_GAINS.daily_login],['✅ Événement créé',XP_GAINS.event_created],['📋 Semaine planifiée',XP_GAINS.week_planned],['🏅 Badge 7 jours',XP_GAINS.badge_7day]].map(([l,x])=>'<div style="display:flex;justify-content:space-between;margin-bottom:0.5rem"><span>'+l+'</span><span style="color:var(--primary);font-weight:700">+'+x+' XP</span></div>').join('')+
    '</div></div>'+
    '<div class="insight-card" onclick="showInsightDetail(\'streak\')"><h3>🔥 Streak</h3><div class="big-stat">'+state.streak+'</div><p style="color:var(--text2);margin-top:0.25rem">jours consécutifs</p><p style="font-size:0.8rem;color:var(--primary);margin-top:0.75rem;font-weight:600">'+rank.icon+' '+rank.name+' · Niveau '+state.level+'</p></div>';
}

function showInsightDetail(type) {
    const content=document.getElementById('insightDetailContent');
    const total=state.events.length; const totalH=state.events.reduce((s,e)=>s+e.duration/60,0);
    const byType=(t)=>state.events.filter(e=>e.type===t).reduce((s,e)=>s+e.duration/60,0);
    let html='';
    if(type==='overview') {
        html='<h2 style="margin-bottom:1.5rem">📊 Vue d\'ensemble</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1.5rem">'+
            [['Événements',total,''],['Heures totales',Math.round(totalH),'h'],['Niveau',state.level,'']].map(([l,v,u])=>'<div style="text-align:center;padding:1.5rem;background:var(--bg);border-radius:12px"><div style="font-size:2.5rem;font-weight:700;color:var(--primary)">'+v+u+'</div><div style="margin-top:0.5rem;color:var(--text2)">'+l+'</div></div>').join('')+'</div>';
    } else if(type==='distribution') {
        html='<h2 style="margin-bottom:1.5rem">📚 Répartition détaillée</h2><p style="color:var(--text2);margin-bottom:1.5rem">Objectif : 10h d\'études → <strong style="color:var(--primary)">+40 XP</strong></p>'+
            [['study','📖 Études'],['work','💼 Travail'],['social','👥 Social'],['personal','⚡ Personnel']].map(([t,l])=>{ const h=Math.round(byType(t)); const pct=totalH?Math.round((h/totalH)*100):0; return '<div style="margin-bottom:1.25rem"><div style="display:flex;justify-content:space-between;margin-bottom:0.4rem"><span style="font-weight:600">'+l+'</span><span style="color:var(--text2)">'+h+'h · '+pct+'%</span></div><div class="insight-bar"><div class="insight-bar-fill" style="width:'+pct+'%"></div></div></div>'; }).join('');
    } else if(type==='week') {
        const wks=new Date(); wks.setDate(wks.getDate()-wks.getDay()+1); wks.setHours(0,0,0,0);
        const wke=new Date(wks); wke.setDate(wks.getDate()+7);
        const wkE=state.events.filter(e=>{const d=new Date(e.date);return d>=wks&&d<wke;});
        html='<h2 style="margin-bottom:1.5rem">📅 Cette semaine</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;margin-bottom:1.5rem">'+
            [['Événements',wkE.length,''],['Heures',Math.round(wkE.reduce((s,e)=>s+e.duration/60,0)),'h']].map(([l,v,u])=>'<div style="text-align:center;padding:1.5rem;background:var(--bg);border-radius:12px"><div style="font-size:2.5rem;font-weight:700;color:var(--primary)">'+v+u+'</div><div style="color:var(--text2)">'+l+'</div></div>').join('')+'</div>'+
            '<p style="color:var(--primary);font-weight:600">🎯 Planifie une semaine complète → <strong>+'+XP_GAINS.week_planned+' XP</strong></p>';
    } else if(type==='critical') {
        const crit=state.events.filter(e=>e.priority==='critical');
        html='<h2 style="margin-bottom:1.5rem">🚨 Événements critiques</h2>'+
            (crit.length===0?'<p class="hint">Aucun événement critique. Bravo ! 🎉</p>':
            '<div style="display:flex;flex-direction:column;gap:0.75rem">'+crit.map(e=>'<div class="event-item"><div style="font-weight:700">'+e.title+'</div><div style="color:var(--text2);font-size:0.85rem">'+new Date(e.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+' · '+e.startTime+'</div></div>').join('')+'</div>');
    } else if(type==='xp') {
        html='<h2 style="margin-bottom:1.5rem">⚡ Système XP</h2><p style="color:var(--text2);margin-bottom:1.5rem">XP total gagné : <strong style="color:var(--primary)">'+state.totalXpEarned+'</strong></p>'+
            '<div style="display:grid;gap:0.75rem">'+Object.entries(XP_GAINS).map(([k,v])=>'<div style="display:flex;justify-content:space-between;padding:0.75rem;background:var(--bg);border-radius:8px"><span>'+k.replace(/_/g,' ')+'</span><span style="color:var(--primary);font-weight:700">+'+v+' XP</span></div>').join('')+'</div>';
    } else if(type==='streak') {
        html='<h2 style="margin-bottom:1.5rem">🔥 Streak</h2><div style="text-align:center;padding:2rem;background:var(--bg);border-radius:16px;margin-bottom:1.5rem"><div style="font-size:5rem;font-weight:700;color:var(--primary)">'+state.streak+'</div><div style="color:var(--text2);margin-top:0.5rem">jours consécutifs</div></div>'+
            [[1,'⚡',XP_GAINS.badge_1day],[3,'🔥',XP_GAINS.badge_3day],[7,'✨',XP_GAINS.badge_7day],[14,'💪',XP_GAINS.badge_14day],[30,'🌟',XP_GAINS.badge_30day],[60,'💎',XP_GAINS.badge_60day],[90,'👑',XP_GAINS.badge_90day]].map(([d,em,xp])=>'<div style="display:flex;justify-content:space-between;align-items:center;padding:0.6rem;border-radius:8px;background:'+(state.streak>=d?'rgba(255,107,53,0.1)':'var(--bg)')+';border:1px solid '+(state.streak>=d?'var(--primary)':'var(--border)')+';margin-bottom:0.5rem"><span>'+em+' '+d+' jours</span><span style="color:var(--primary);font-weight:700">'+(state.streak>=d?'✅ ':'')+'+'+xp+' XP</span></div>').join('');
    }
    content.innerHTML=html;
    document.getElementById('insightDetailModal').classList.add('show');
}
function closeInsightDetail() { document.getElementById('insightDetailModal').classList.remove('show'); }

// EVENT DETAIL
function showEventDetail(eventId) {
    const ev=state.events.find(e=>String(e.id)===String(eventId)); if(!ev) return;
    state.currentEventId=eventId;
    document.getElementById('eventDetailTitle').textContent=ev.title;
    const pl={critical:'🔴 Critique',high:'🟠 Haute',medium:'🟡 Moyenne',low:'🟢 Basse'};
    document.getElementById('eventDetailBody').innerHTML='<p><strong>Date :</strong> '+new Date(ev.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</p><p><strong>Horaire :</strong> '+ev.startTime+' – '+ev.endTime+'</p><p><strong>Durée :</strong> '+ev.duration+' min</p><p><strong>Priorité actuelle :</strong> <span class="pill '+ev.priority+'">'+pl[ev.priority]+'</span></p>';
    document.getElementById('eventDetailModal').classList.add('show');
}
function closeEventDetail() { document.getElementById('eventDetailModal').classList.remove('show'); state.currentEventId=null; }
function changePriority(p) {
    if(!state.currentEventId) return;
    const ev=state.events.find(e=>String(e.id)===String(state.currentEventId));
    if(ev){ev.priority=p;saveState();updateAllViews();toast('✅ Priorité changée');closeEventDetail();}
}

// TEMPLATES
function updateTemplates() {
    const c=document.getElementById('templatesContent'); if(!c) return;
    const tabs=['student','worker','custom']; const labels=['🎓 Étudiant','💼 Travailleur','✨ Personnalisé'];
    const idx=tabs.indexOf(state.template);
    let html='<div style="display:flex;position:relative;background:var(--bg);padding:4px;border-radius:12px;border:1px solid var(--border);margin-bottom:1.5rem;max-width:500px;margin-left:auto;margin-right:auto">'+
        '<div id="tplSlider" style="position:absolute;top:4px;left:4px;width:calc(33.33% - 2.67px);height:calc(100% - 8px);background:var(--primary);border-radius:8px;transition:transform 0.35s cubic-bezier(0.16,1,0.3,1);z-index:0;box-shadow:0 2px 8px rgba(255,107,53,0.3);transform:translateX('+idx*100+'%)"></div>'+
        tabs.map((t,i)=>'<button style="flex:1;padding:0.65rem 1rem;border:none;background:transparent;border-radius:8px;font-weight:600;font-size:0.875rem;cursor:pointer;color:'+(state.template===t?'white':'var(--text2)')+';font-family:inherit;position:relative;z-index:1;transition:color 0.25s" onclick="switchTemplate(\''+t+'\')">'+labels[i]+'</button>').join('')+'</div>';
    if(state.template==='student') {
        html+='<div class="template-form-card"><h3 style="margin-bottom:1.25rem">🎓 Configuration Étudiant</h3><div id="tplCC">'+
            ((state.templateData.courses||[]).length===0?'<div class="course-row"><select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select><input type="time" class="tinp" value="08:00"><input type="time" class="tinp" value="10:00"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="removeTplCourse(this)">✕</button></div>':
            (state.templateData.courses||[]).map(c=>'<div class="course-row"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'" '+(c.day===i+1?'selected':'')+'>'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="'+(c.start||'08:00')+'"><input type="time" class="tinp" value="'+(c.end||'10:00')+'"><input type="text" class="sinp" value="'+(c.subject||'')+'" placeholder="Matière"><button class="btn-remove" onclick="removeTplCourse(this)">✕</button></div>').join(''))+'</div>'+
            '<button class="btn-secondary" onclick="addTplCourse()" style="margin:1rem 0">+ Ajouter un cours</button><button class="btn-primary" onclick="saveTplStudent()">Enregistrer</button></div>';
    } else if(state.template==='worker') {
        html+='<div class="template-form-card"><h3 style="margin-bottom:1.25rem">💼 Configuration Travailleur</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem"><div class="form-group"><label>Début</label><input type="time" id="tplWS" value="'+(state.templateData.workStart||'09:00')+'"></div><div class="form-group"><label>Fin</label><input type="time" id="tplWE" value="'+(state.templateData.workEnd||'18:00')+'"></div></div><button class="btn-primary" onclick="saveTplWorker()" style="margin-top:0.5rem">Enregistrer</button></div>';
    } else {
        html+='<div class="template-form-card"><p style="color:var(--text2);text-align:center;padding:1rem">Mode personnalisé : utilise l\'IA pour planifier librement.</p></div>';
    }
    c.innerHTML=html;
}
function switchTemplate(id) {
    state.template=id; saveState(); updateTemplates(); updatePlanning(); toast('✅ Template changé');
}
function addTplCourse() {
    const c=document.getElementById('tplCC'); if(!c) return;
    const row=document.createElement('div'); row.className='course-row';
    row.innerHTML='<select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select><input type="time" class="tinp" value="08:00"><input type="time" class="tinp" value="10:00"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="removeTplCourse(this)">✕</button>';
    c.appendChild(row);
}
function removeTplCourse(btn) { btn.parentElement.remove(); }
function saveTplStudent() {
    const rows=document.querySelectorAll('#tplCC .course-row');
    state.templateData.courses=Array.from(rows).map(r=>({day:parseInt(r.querySelector('.sel').value),start:r.querySelectorAll('.tinp')[0].value,end:r.querySelectorAll('.tinp')[1].value,subject:r.querySelector('.sinp').value})).filter(c=>c.subject);
    saveState(); toast('✅ Template étudiant sauvegardé !');
}
function saveTplWorker() {
    state.templateData.workStart=document.getElementById('tplWS')?.value||'09:00';
    state.templateData.workEnd=document.getElementById('tplWE')?.value||'18:00';
    saveState(); toast('✅ Template travailleur sauvegardé !');
}

// BADGES
const ALL_BADGES=[
    {id:'first',  emoji:'⚡',name:'Premier pas', desc:'1er événement créé',  xp:XP_GAINS.badge_first,msg:'Bienvenue dans l\'aventure !', cond:()=>(state.user?.totalEvents||0)>=1},
    {id:'3d',     emoji:'🔥',name:'3 Jours',     desc:'Streak de 3 jours',   xp:XP_GAINS.badge_3day, msg:'Tu prends l\'habitude !',       cond:()=>state.streak>=3},
    {id:'7d',     emoji:'✨',name:'Semaine',      desc:'Streak de 7 jours',   xp:XP_GAINS.badge_7day, msg:'Une semaine complète !',         cond:()=>state.streak>=7},
    {id:'14d',    emoji:'💪',name:'Quinzaine',   desc:'Streak de 14 jours',  xp:XP_GAINS.badge_14day,msg:'Deux semaines !',                cond:()=>state.streak>=14},
    {id:'30d',    emoji:'🌟',name:'Un mois',     desc:'Streak de 30 jours',  xp:XP_GAINS.badge_30day,msg:'Un mois, incroyable !',          cond:()=>state.streak>=30},
    {id:'60d',    emoji:'💎',name:'Deux mois',   desc:'Streak de 60 jours',  xp:XP_GAINS.badge_60day,msg:'Tu es une machine !',            cond:()=>state.streak>=60},
    {id:'90d',    emoji:'👑',name:'Légende',     desc:'Streak de 90 jours',  xp:XP_GAINS.badge_90day,msg:'LÉGENDE ABSOLUE !',              cond:()=>state.streak>=90},
    {id:'ev10',   emoji:'📋',name:'Planificateur',desc:'10 événements',      xp:30,msg:'Tu organises comme un pro !',    cond:()=>(state.user?.totalEvents||0)>=10},
    {id:'ev50',   emoji:'🗓️',name:'Organisateur',desc:'50 événements',       xp:80,msg:'Organisation au top !',          cond:()=>(state.user?.totalEvents||0)>=50},
];
const unlockedBadges=new Set(JSON.parse(localStorage.getItem('cf_badges')||'[]'));
function checkBadges() {
    ALL_BADGES.forEach(b=>{ if(!unlockedBadges.has(b.id)&&b.cond()){ unlockedBadges.add(b.id); localStorage.setItem('cf_badges',JSON.stringify([...unlockedBadges])); toast('🏅 Badge débloqué : '+b.name+' !'); if(b.xp>0) setTimeout(()=>addXp(b.xp),500); }});
}
function updateBadges() {
    const sc=document.getElementById('streakCount'); const sm=document.getElementById('streakMsg');
    if(sc) sc.textContent=state.streak;
    if(sm) { const msgs=[[90,'LÉGENDE ! 90 jours ! 👑'],[60,'INCROYABLE ! 2 mois ! 💎'],[30,'UN MOIS ! Bravo ! 🌟'],[14,'Deux semaines ! 💪'],[7,'Une semaine ! ✨'],[3,'3 jours ! 🔥'],[0,'Lance-toi ! 🚀']]; sm.textContent=(msgs.find(([d])=>state.streak>=d)||[0,'Continue !'])[1]; }
    checkBadges(); updateXpBar();
    const grid=document.getElementById('badgeGrid'); if(!grid) return;
    grid.innerHTML=ALL_BADGES.map(b=>{ const u=b.cond(); return '<div class="badge-card '+(u?'unlocked':'locked')+'"><span class="badge-emoji">'+b.emoji+'</span><div class="badge-name">'+b.name+'</div><div class="badge-desc">'+b.desc+'</div><span class="badge-xp">+'+b.xp+' XP</span>'+(u?'<span class="badge-msg">"'+b.msg+'"</span>':'')+'</div>'; }).join('');
}

// PROFILE
function updateProfile() {
    if(!state.user) return;
    document.getElementById('profileName').textContent=state.user.name;
    document.getElementById('profileEmail').textContent=state.user.email||'';
    document.getElementById('profileNameInput').value=state.user.name;
    document.getElementById('profileEmailInput').value=state.user.email||'';
    document.getElementById('statEvents').textContent=state.user.totalEvents||0;
    document.getElementById('statStreak').textContent=state.streak;
    document.getElementById('statHours').textContent=Math.round(state.events.reduce((s,e)=>s+e.duration/60,0));
    document.getElementById('statBadges').textContent=ALL_BADGES.filter(b=>b.cond()).length;
    if(state.user.avatar){document.getElementById('profileAvatarImg').src=state.user.avatar;document.getElementById('profileAvatarImg').style.display='block';document.getElementById('profileAvatarEmoji').style.display='none';}
    updateRankDisplays();
}
function saveProfile() {
    if(!state.user) return;
    state.user.name=document.getElementById('profileNameInput').value;
    if(state.user.email&&state.accounts[state.user.email]) state.accounts[state.user.email].name=state.user.name;
    saveState(); updateHeader(); updateProfile(); toast('✅ Profil sauvegardé');
}
function handleAvatarChange(input) {
    const file=input.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=e=>{state.user.avatar=e.target.result;if(state.user.email&&state.accounts[state.user.email])state.accounts[state.user.email].avatar=e.target.result;saveState();updateHeader();updateProfile();toast('✅ Photo mise à jour');};
    reader.readAsDataURL(file);
}

// SETTINGS
function requestPasswordChange() {
    state.verificationCode=Math.floor(100000+Math.random()*900000).toString();
    document.getElementById('pwdEmail').textContent=state.user.email;
    toast('📧 Code envoyé : '+state.verificationCode);
    document.getElementById('passwordModal').classList.add('show');
}
function confirmPasswordChange() {
    const code=document.getElementById('pwdCode').value; const newPwd=document.getElementById('pwdNew').value;
    if(code!==state.verificationCode){toast('❌ Code incorrect');return;}
    if(newPwd.length<6){toast('⚠️ Mot de passe : 6 caractères minimum');return;}
    if(state.user.email&&state.accounts[state.user.email]){state.accounts[state.user.email].password=btoa(newPwd);saveState();toast('✅ Mot de passe changé !');closeModal('passwordModal');}
}
function exportData() {
    const data=JSON.stringify(state,null,2);
    const blob=new Blob([data],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='chronoflow_'+new Date().toISOString().split('T')[0]+'.json'; a.click();
    toast('✅ Données exportées');
}
function deleteAccount() {
    if(confirm('Supprimer définitivement ton compte ?')){if(state.user?.email)delete state.accounts[state.user.email];localStorage.clear();location.reload();}
}

// VOICE
function startVoice() {
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){toast('⚠️ Navigateur non supporté');return;}
    const r=new SR(); r.lang='fr-FR'; r.interimResults=true;
    document.getElementById('voiceTranscript').textContent=''; document.getElementById('voiceStatus').textContent='Parle...';
    document.getElementById('voiceConfirm').style.display='none'; document.getElementById('voiceModal').classList.add('show'); document.getElementById('voiceBtn').classList.add('recording');
    r.onresult=e=>{const t=Array.from(e.results).map(r=>r[0].transcript).join('');document.getElementById('voiceTranscript').textContent=t;state.voiceText=t;if(e.results[0].isFinal){document.getElementById('voiceStatus').textContent='✅ Parole reconnue';document.getElementById('voiceConfirm').style.display='block';}};
    r.onerror=()=>{document.getElementById('voiceStatus').textContent='❌ Erreur';document.getElementById('voiceBtn').classList.remove('recording');};
    r.onend=()=>document.getElementById('voiceBtn').classList.remove('recording');
    r.start(); state.recognition=r;
}
function stopVoice() {
    if(state.recognition)state.recognition.stop();
    document.getElementById('voiceModal').classList.remove('show'); document.getElementById('voiceBtn').classList.remove('recording');
}
function confirmVoice() { if(state.voiceText)document.getElementById('aiInput').value=state.voiceText; stopVoice(); toast('✅ Texte ajouté'); }

// UTILS
function toast(msg) {
    const el=document.getElementById('toast'); const me=document.getElementById('toastMsg');
    if(!el||!me) return; me.textContent=msg; el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),3500);
}
function closeModal(id) { document.getElementById(id)?.classList.remove('show'); }

// STORAGE
function saveState() {
    try {
        localStorage.setItem('cf_v4',JSON.stringify({
            user:state.user,accounts:state.accounts,events:state.events,
            template:state.template,templateData:state.templateData,
            theme:state.theme,streak:state.streak,lastUsedDate:state.lastUsedDate,
            lang:state.lang,notifications:state.notifications,
            xp:state.xp,level:state.level,totalXpEarned:state.totalXpEarned,
            tutorialDone:state.tutorialDone
        }));
    } catch(e){console.error(e);}
}
function loadState() {
    try {
        state.lang=localStorage.getItem('cf_lang')||null;
        const saved=localStorage.getItem('cf_v4');
        if(saved){
            const d=JSON.parse(saved);
            state.user=d.user||null; state.accounts=d.accounts||{};
            state.events=(d.events||[]).map(e=>({...e,date:new Date(e.date)}));
            state.template=d.template||'custom'; state.templateData=d.templateData||{};
            state.theme=d.theme||'dark'; state.streak=d.streak||0;
            state.lastUsedDate=d.lastUsedDate||null;
            state.notifications=d.notifications!==undefined?d.notifications:true;
            state.xp=d.xp||0; state.level=d.level||1; state.totalXpEarned=d.totalXpEarned||0;
            state.tutorialDone=d.tutorialDone||false;
        }
        document.documentElement.setAttribute('data-theme',state.theme||'dark');
    } catch(e){console.error(e);}
}

window.ChronoFlow={state,saveState,toast};

/* ════════════════════════════════════════
   NOUVELLES FONCTIONS V4.1
════════════════════════════════════════ */

// TUTORIAL LOCK ÉCRAN
function runTutStep() {
    const step=TUT_STEPS[state.tutorialStep]; if(!step) { endTut(); return; }
    switchView(step.view);
    document.body.classList.add('tutorial-locked');
    document.getElementById('tutOverlay').style.display='block';
    document.getElementById('tutPanel').style.display='flex';
    document.getElementById('spotlight').style.display='block';
    // Bloquer le scroll et les clics hors tutorial
    document.getElementById('tutOverlay').style.pointerEvents='all';
    setTimeout(()=>{
        const t=document.getElementById(step.target);
        if(t) {
            const r=t.getBoundingClientRect(); const sp=document.getElementById('spotlight');
            sp.style.top=(r.top-8)+'px'; sp.style.left=(r.left-8)+'px';
            sp.style.width=(r.width+16)+'px'; sp.style.height=(r.height+16)+'px';
        }
    },350);
    const te=document.getElementById('tutText'); const nb=document.getElementById('tutNext');
    te.textContent=''; te.classList.remove('done'); nb.style.display='none';
    typeText(te,step.text,()=>{ te.classList.add('done'); nb.style.display='block'; });
}
function endTut() {
    ['tutOverlay','tutPanel','spotlight'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
    document.body.classList.remove('tutorial-locked');
    state.tutorialDone=true; saveState(); switchView('planning'); toast('🎉 Tutoriel terminé ! Bonne planification !');
}

// RANK MODAL
function openRankModal() {
    const rank=getRank(state.level);
    const totalForRank=(r)=>getTotalXpForLevel(r.minLevel);
    document.getElementById('rankModalContent').innerHTML=RANKS.map(r=>{
        const isCur=r.name===rank.name;
        const reached=state.level>=r.minLevel;
        const xpNeeded=totalForRank(r);
        return '<div class="rank-row'+(isCur?' current':'')+(reached?'':' locked')+'" style="border-left:4px solid '+(reached?r.color:'var(--border)')+'">'+
            '<div class="rank-icon">'+r.icon+'</div>'+
            '<div class="rank-info"><strong>'+r.name+'</strong>'+
            '<span>Niveaux '+r.minLevel+(r.maxLevel<999?'–'+r.maxLevel:'+')+'</span></div>'+
            '<div class="rank-xp-badge" style="'+(reached?'background:'+r.color+'22;color:'+r.color:'')+'">'+
            (reached?'✅ Atteint':'Niveau '+r.minLevel+' · '+xpNeeded+' XP total')+'</div></div>';
    }).join('');
    document.getElementById('rankModal').classList.add('show');
}
function closeRankModal() { document.getElementById('rankModal').classList.remove('show'); }

// BADGES - XP BAR UPDATE (sans streak)
function updateXpBar() {
    const ll=document.getElementById('xpLevelLabel');
    const bf=document.getElementById('xpBarFill');
    const bt=document.getElementById('xpBarText');
    const rp=document.getElementById('xpRankPill');
    if(!ll) return;
    const rank=getRank(state.level);
    const cur=getCurrentLevelXp(); const need=getXpNeededForNextLevel();
    const pct=Math.min(100,Math.round((cur/need)*100));
    ll.textContent='Niveau '+state.level;
    if(bf) bf.style.width=pct+'%';
    if(bt) bt.textContent=cur+' / '+need+' XP';
    if(rp) { rp.textContent=rank.icon+' '+rank.name+' ▼'; rp.className='xp-rank-pill '+rank.cls; }
    updateChronosBadgeMsg();
}

// MESSAGE CHRONOS SUR ONGLET BADGES
const NEXT_LEVEL_REWARDS = {
    2:'accès au costume Sombre pour Chronos ! 🌑',
    3:'la cravate Dorée pour Chronos ✨',
    5:'le costume Étoilé pour Chronos 🌟',
    8:'les lunettes de Maître 👓',
    10:'le costume Diamant 💎',
    15:'la cape de Légende 🦸',
    20:'les ailes de Chronos 🪶',
    30:'la couronne ultime 👑',
};
function getNextRewardMsg() {
    const levels=Object.keys(NEXT_LEVEL_REWARDS).map(Number).sort((a,b)=>a-b);
    const next=levels.find(l=>l>state.level);
    if(!next) return 'Tu as tout débloqué ! Tu es une légende absolue ! 👑';
    const reward=NEXT_LEVEL_REWARDS[next];
    const gap=next-state.level;
    return 'Plus que <strong>'+gap+' niveau'+(gap>1?'x':'')+' pour débloquer '+reward+'</strong>';
}
function updateChronosBadgeMsg() {
    const el=document.getElementById('chronoBadgeBubble');
    if(el) el.innerHTML='Au <strong>niveau '+state.level+'</strong> ! '+getNextRewardMsg();
}

// CASIER / LOCKER
const CHRONOS_ITEMS = [
    {id:'default',    icon:'👔', name:'Costume de base',  lvl:1,   type:'suit'},
    {id:'dark',       icon:'🌑', name:'Costume Sombre',   lvl:2,   type:'suit'},
    {id:'gold_tie',   icon:'✨', name:'Cravate Dorée',    lvl:3,   type:'tie'},
    {id:'star_suit',  icon:'🌟', name:'Costume Étoilé',   lvl:5,   type:'suit'},
    {id:'glasses',    icon:'👓', name:'Lunettes Maître',  lvl:8,   type:'acc'},
    {id:'diamond',    icon:'💎', name:'Costume Diamant',  lvl:10,  type:'suit'},
    {id:'cape',       icon:'🦸', name:'Cape Légende',     lvl:15,  type:'acc'},
    {id:'wings',      icon:'🪶', name:'Ailes',            lvl:20,  type:'acc'},
    {id:'crown',      icon:'👑', name:'Couronne',         lvl:30,  type:'acc'},
];
let equippedItem = localStorage.getItem('cf_equipped')||'default';
function updateLockerGrid() {
    const grid=document.getElementById('lockerGrid'); if(!grid) return;
    grid.innerHTML=CHRONOS_ITEMS.map(item=>{
        const unlocked=state.level>=item.lvl;
        const isEquipped=equippedItem===item.id;
        return '<div class="locker-item'+(isEquipped?' equipped':'')+(unlocked?'':' locked')+'" onclick="'+(unlocked?'equipItem(\''+item.id+'\')':'')+'">'+
            '<div class="li-icon">'+item.icon+'</div>'+
            '<div class="li-name">'+item.name+'</div>'+
            '<div class="li-lvl">Niv. '+item.lvl+'</div>'+
            (isEquipped?'<div class="li-badge">Équipé</div>':(unlocked?'':'🔒'))+
            '</div>';
    }).join('');
}
function equipItem(id) {
    equippedItem=id; localStorage.setItem('cf_equipped',id);
    updateLockerGrid(); updateChronosAccessory();
    toast('✅ Équipement changé !');
}
function updateChronosAccessory() {
    const acc=document.getElementById('koroAccessory'); if(!acc) return;
    const item=CHRONOS_ITEMS.find(i=>i.id===equippedItem);
    if(item && item.type==='acc') { acc.textContent=item.icon; acc.style.opacity='1'; }
    else acc.style.opacity='0';
    // Suit changes
    const suit=document.getElementById('koroSuit');
    const tie=document.getElementById('koroTie');
    if(suit && equippedItem==='dark') { suit.style.background='linear-gradient(160deg,#0a0a0a,#111)'; }
    else if(suit && equippedItem==='star_suit') { suit.style.background='linear-gradient(160deg,#1a1040,#2d1b6e)'; suit.style.boxShadow='0 0 8px rgba(155,89,182,0.5)'; }
    else if(suit && equippedItem==='diamond') { suit.style.background='linear-gradient(160deg,#0a2a3a,#0d3d5a)'; suit.style.boxShadow='0 0 8px rgba(185,242,255,0.5)'; }
    else if(suit) { suit.style.background=''; suit.style.boxShadow=''; }
    if(tie && equippedItem==='gold_tie') { tie.style.background='linear-gradient(180deg,#FFD700,#c4a800)'; }
    else if(tie) { tie.style.background=''; }
}

// MODE CHAT TOGGLE
let chatMode='talk';
function setChatMode(mode) {
    chatMode=mode;
    const sl=document.getElementById('cmtSlider');
    const tb=document.getElementById('cmtTalk');
    const lb=document.getElementById('cmtLocker');
    const tv=document.getElementById('chatTalkView');
    const lv=document.getElementById('chatLockerView');
    if(mode==='locker') {
        sl.classList.add('to-right');
        tb.classList.remove('active'); lb.classList.add('active');
        tv.style.display='none'; lv.style.display='block';
        updateLockerGrid();
    } else {
        sl.classList.remove('to-right');
        lb.classList.remove('active'); tb.classList.add('active');
        lv.style.display='none'; tv.style.display='block';
    }
}

// TUTORIAL STEPS - ajout étape Chronos
const TUT_STEPS_OVERRIDE = [
    {view:'planning',  target:'aiPanel',      text:"Bienvenue ! 👋 Voici la zone de planning IA. Écris ce que tu dois faire — révisions, sport, rendez-vous — et je génère ton planning optimisé automatiquement !"},
    {view:'planning',  target:'planningGrid', text:"Ton planning hebdomadaire s'affiche ici ! Clique sur un événement pour changer sa priorité. Les couleurs t'aident à voir l'urgence d'un coup d'œil 🎨"},
    {view:'calendar',  target:'monthCal',     text:"Le Calendrier donne une vue mensuelle. Clique sur une date pour voir tous les événements de la journée 📅"},
    {view:'insights',  target:'insightsGrid', text:"Les Insights affichent tes statistiques ! Heures travaillées, répartition, objectifs XP... Clique sur une carte pour les détails 📊"},
    {view:'badges',    target:'xpSection',    text:"Ici, gagne des XP et monte de niveau ! Chaque connexion, badge, et semaine planifiée rapporte des XP 🎖️"},
    {view:'planning',  target:'mascot',       text:"Et moi, Chronos ! 🌟 Clique sur moi pour me parler et me poser des questions sur ton planning. Dans l'onglet 'Casier', tu peux me changer de costume en débloquant des équipements en montant de niveau !"},
];

// Overwrite TUT_STEPS at runtime
document.addEventListener('DOMContentLoaded', ()=>{
    // Override TUT_STEPS with new version including Chronos step
    if(typeof TUT_STEPS !== 'undefined') {
        TUT_STEPS.length=0;
        TUT_STEPS_OVERRIDE.forEach(s=>TUT_STEPS.push(s));
    }
});

// UPDATEBADGES - sans streak
function updateBadges() {
    checkBadges(); updateXpBar();
    const grid=document.getElementById('badgeGrid'); if(!grid) return;
    grid.innerHTML=ALL_BADGES.map(b=>{ const u=b.cond(); return '<div class="badge-card '+(u?'unlocked':'locked')+'"><span class="badge-emoji">'+b.emoji+'</span><div class="badge-name">'+b.name+'</div><div class="badge-desc">'+b.desc+'</div><span class="badge-xp">+'+b.xp+' XP</span>'+(u?'<span class="badge-msg">"'+b.msg+'"</span>':'')+'</div>'; }).join('');
    // Message Chronos contextuel
    setTimeout(updateChronosBadgeMsg, 100);
}
