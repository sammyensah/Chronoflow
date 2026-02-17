// ChronoFlow V3 - Complete JavaScript with all features

const state = {
    user: null,
    accounts: {},
    events: [],
    weekOffset: 0,
    monthOffset: 0,
    monthDirection: 'right',
    activeView: 'planning',
    theme: 'light',
    streak: 0,
    lastUsedDate: null,
    template: 'custom',
    templateData: {},
    lang: 'fr',
    notifications: {events: true, daily: true},
    currentEventId: null,
    mascotMessages: [],
    verificationCode: null
};

/* === INIT === */
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    createParticles('particlesLang');
    createParticles('particles');
    createParticles('particles2');
    
    if (!state.lang) {
        document.getElementById('langScreen').style.display = 'flex';
    } else if (!state.user) {
        document.getElementById('authScreen').style.display = 'flex';
    } else {
        launchApp();
    }
});

function createParticles(id) {
    const container = document.getElementById(id);
    if (!container) return;
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.bottom = '-10px';
        p.style.setProperty('--drift', (Math.random() * 200 - 100) + 'px');
        p.style.animationDuration = (6 + Math.random() * 8) + 's';
        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.width = p.style.height = (3 + Math.random() * 4) + 'px';
        container.appendChild(p);
    }
}

/* === LANGUAGE === */
function selectLang(lang) {
    state.lang = lang;
    saveState();
    document.getElementById('langScreen').style.display = 'none';
    document.getElementById('authScreen').style.display = 'flex';
}

function changeLang(lang) {
    state.lang = lang;
    saveState();
    toast('✅ Langue changée');
}

/* === AUTH === */
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('loginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'block' : 'none';
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPassword').value;
    if (!email || !pass) { toast('⚠️ Remplis tous les champs'); return; }
    
    const account = state.accounts[email];
    if (!account) { toast('❌ Compte introuvable'); return; }
    if (account.password !== btoa(pass)) { toast('❌ Mot de passe incorrect'); return; }
    
    state.user = {...account, email};
    saveState();
    launchApp();
}

function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;
    
    if (!name || !email || !pass) { toast('⚠️ Tous les champs obligatoires'); return; }
    if (!email.includes('@')) { toast('⚠️ Email invalide'); return; }
    if (pass.length < 6) { toast('⚠️ Mot de passe : 6 caractères min'); return; }
    if (state.accounts[email]) { toast('❌ Email déjà utilisé'); return; }
    
    state.accounts[email] = {
        name,
        password: btoa(pass),
        avatar: '',
        createdAt: new Date().toISOString(),
        totalEvents: 0
    };
    
    state.user = {name, email, avatar: '', totalEvents: 0};
    state.template = 'custom';
    state.events = [];
    state.streak = 0;
    saveState();
    
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('onboardingScreen').style.display = 'flex';
}

/* === ONBOARDING === */
function goObStep(step) {
    document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
    const el = document.getElementById(step === 1 ? 'obStep1' : step === '2s' ? 'obStep2' : 'obStep2w');
    if (el) el.classList.add('active');
}

function selectProfile(type) {
    state.template = type;
    if (type === 'student') goObStep('2s');
    else if (type === 'worker') goObStep('2w');
    else finishOnboarding();
}

function addCourse() {
    const container = document.getElementById('coursesContainer');
    const row = document.createElement('div');
    row.className = 'course-row';
    row.innerHTML = `<select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select>
        <input type="time" class="tinp" value="08:00">
        <input type="time" class="tinp" value="10:00">
        <input type="text" class="sinp" placeholder="Matière">
        <button class="btn-remove" onclick="removeCourse(this)">✕</button>`;
    container.appendChild(row);
}

function removeCourse(btn) { btn.parentElement.remove(); }

function finishOnboarding() {
    if (state.template === 'student') {
        const rows = document.querySelectorAll('.course-row');
        state.templateData = {
            courses: Array.from(rows).map(r => ({
                day: parseInt(r.querySelector('.sel')?.value || 1),
                start: r.querySelectorAll('.tinp')[0]?.value,
                end: r.querySelectorAll('.tinp')[1]?.value,
                subject: r.querySelector('.sinp')?.value
            })).filter(c => c.subject)
        };
    } else if (state.template === 'worker') {
        state.templateData = {
            workStart: document.getElementById('workStart')?.value || '09:00',
            workEnd: document.getElementById('workEnd')?.value || '18:00'
        };
    }
    
    state.lastUsedDate = new Date().toISOString();
    saveState();
    document.getElementById('onboardingScreen').style.display = 'none';
    launchApp();
}

/* === LAUNCH APP === */
function launchApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    updateStreakBasedOnUsage();
    applyTheme(state.theme);
    updateHeader();
    updateAllViews();
    updateMascot();
    setupSidebarHover();
    
    document.getElementById('settingsLang').value = state.lang || 'fr';
}

function reloadApp() {
    if (confirm('Revenir à la page d\'accueil ?')) location.reload();
}

/* === SIDEBAR HOVER === */
function setupSidebarHover() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarHover');
    
    if (window.innerWidth > 768) {
        sidebar.addEventListener('mouseenter', () => sidebar.classList.add('expanded'));
        sidebar.addEventListener('mouseleave', () => sidebar.classList.remove('expanded'));
    } else {
        toggle.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }
}

/* === STREAK === */
function updateStreakBasedOnUsage() {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (!state.lastUsedDate) {
        state.streak = 0;
        state.lastUsedDate = new Date().toISOString();
        saveState();
        return;
    }
    const last = new Date(state.lastUsedDate);
    last.setHours(0,0,0,0);
    const diff = Math.floor((today - last) / 86400000);
    if (diff === 0) return;
    else if (diff === 1) state.streak++;
    else state.streak = 0;
    state.lastUsedDate = new Date().toISOString();
    saveState();
}

/* === THEME === */
function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    saveState();
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}

/* === HEADER === */
function updateHeader() {
    document.getElementById('headerStreak').textContent = state.streak;
    if (state.user?.avatar) {
        document.getElementById('headerAvatarImg').src = state.user.avatar;
        document.getElementById('headerAvatarImg').style.display = 'block';
        document.getElementById('headerAvatarEmoji').style.display = 'none';
    }
}

/* === VIEWS === */
function switchView(view) {
    state.activeView = view;
    document.querySelectorAll('.nav-mini-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const viewEl = document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`);
    if (viewEl) viewEl.classList.add('active');
    
    const aiPanel = document.getElementById('aiPanel');
    if (aiPanel) aiPanel.style.display = view === 'planning' ? 'block' : 'none';
    
    updateCurrentView();
}

function updateCurrentView() {
    const map = {
        planning: updatePlanning,
        calendar: updateCalendar,
        insights: updateInsights,
        templates: updateTemplates,
        badges: updateBadges,
        profile: updateProfile,
        settings: () => {}
    };
    map[state.activeView]?.();
}

function updateAllViews() {
    updatePlanning();
    updateCalendar();
    updateBadges();
    updateProfile();
}

/* === MASCOT === */
function updateMascot() {
    const messages = [
        {days: 0, msg: 'Bienvenue ! Commence ton aventure ! 🚀'},
        {days: 1, msg: 'Premier jour ! Continue comme ça ! 💪'},
        {days: 3, msg: '3 jours ! Tu es sur la bonne voie ! 🔥'},
        {days: 7, msg: 'Une semaine complète ! Bravo ! ✨'},
        {days: 14, msg: 'Deux semaines ! Incroyable ! 🌟'},
        {days: 21, msg: '21 jours ! Une habitude formée ! ⚡'},
        {days: 30, msg: 'UN MOIS ! Tu es une machine ! 💎'},
        {days: 60, msg: 'Deux mois ! Légende ! 👑'},
        {days: 90, msg: '90 jours ! MAESTRO absolu ! 🏆'}
    ];
    
    const current = [...messages].reverse().find(m => state.streak >= m.days);
    const bubble = document.getElementById('mascotBubble');
    if (bubble && current) {
        bubble.textContent = current.msg;
    }
}

/* === AI TAG ANIMATION === */
function addTag(btn) {
    const textarea = document.getElementById('aiInput');
    const txt = btn.dataset.txt;
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        const currentText = textarea.value.trim();
        const newText = currentText ? currentText + '\n' + txt : txt;
        animateTextInsertion(textarea, newText);
    } else {
        textarea.value = textarea.value.replace(txt, '').trim();
    }
}

function animateTextInsertion(textarea, text) {
    let index = 0;
    textarea.value = '';
    const interval = setInterval(() => {
        if (index < text.length) {
            textarea.value += text[index];
            index++;
        } else {
            clearInterval(interval);
        }
    }, 15);
}

/* === AI GENERATION === */
async function generate() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) { toast('⚠️ Écris quelque chose !'); return; }
    
    document.getElementById('loading').classList.add('show');
    await new Promise(r => setTimeout(r, 2000));
    
    const newEvents = parseWithUrgency(input);
    
    if (newEvents.length > 0) {
        newEvents.forEach(e => state.events.push(e));
        if (state.user) state.user.totalEvents = (state.user.totalEvents || 0) + newEvents.length;
        
        updateAllViews();
        saveState();
        document.getElementById('aiInput').value = '';
        document.querySelectorAll('.tag.active').forEach(t => t.classList.remove('active'));
        toast(`✨ ${newEvents.length} événement(s) créé(s) !`);
        updateMascot();
    } else {
        toast('⚠️ Reformule ta demande');
    }
    
    document.getElementById('loading').classList.remove('show');
}

function parseWithUrgency(text) {
    const lower = text.toLowerCase();
    const events = [];
    const today = new Date();
    
    const isUrgent = lower.includes('rien révisé') || lower.includes('pas révisé') || lower.includes('urgent');
    const hasExam = lower.includes('examen') || lower.includes('éval') || lower.includes('contrôle');
    
    let subject = 'Révision';
    const subjects = {maths:'Maths', français:'Français', anglais:'Anglais', physique:'Physique', chimie:'Chimie', histoire:'Histoire'};
    for (const [k, v] of Object.entries(subjects)) {
        if (lower.includes(k)) { subject = v; break; }
    }
    
    const dates = extractDates(lower, today);
    const examDate = dates[0] || new Date(today.setDate(today.getDate() + 7));
    
    if (hasExam && isUrgent) {
        const daysUntil = Math.max(1, Math.floor((examDate - new Date()) / 86400000));
        const perDay = daysUntil < 3 ? 3 : 2;
        const dur = daysUntil < 3 ? 180 : 120;
        const times = ['9:00', '14:00', '17:00'];
        
        for (let i = 0; i < daysUntil; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i + 1);
            for (let j = 0; j < perDay; j++) {
                events.push(makeEvent({title:`Révision ${subject} (SESSION ${j+1})`, type:'study', date:d, startTime:times[j], duration:dur, priority:'critical'}));
            }
        }
        events.push(makeEvent({title:`📝 EXAMEN ${subject}`, type:'study', date:examDate, startTime:'8:00', duration:180, priority:'critical'}));
    } else {
        const et = detectEventType(lower);
        const dur = extractDuration(lower);
        const targetDates = dates.length > 0 ? dates : [new Date(new Date().setDate(new Date().getDate() + 1))];
        targetDates.forEach(d => {
            events.push(makeEvent({title:et.title, type:et.type, date:d, startTime:'14:00', duration:dur, priority:'medium'}));
        });
    }
    
    return events;
}

function makeEvent(data) {
    const [h, m] = (data.startTime || '9:00').split(':').map(Number);
    const endMin = h * 60 + m + (data.duration || 60);
    const endTime = data.endTime || `${String(Math.floor(endMin/60)).padStart(2,'0')}:${String(endMin%60).padStart(2,'0')}`;
    return {
        id: Date.now() + Math.random(),
        title: data.title,
        type: data.type,
        date: new Date(data.date),
        startTime: data.startTime,
        endTime: endTime,
        duration: data.duration || 60,
        priority: data.priority || 'medium'
    };
}

function detectEventType(t) {
    if (t.includes('ami')) return {type:'social', title:'Voir amis'};
    if (t.includes('sport')) return {type:'personal', title:'Sport'};
    if (t.includes('travail')) return {type:'work', title:'Travail'};
    return {type:'personal', title:'Activité'};
}

function extractDuration(t) {
    const h = t.match(/(\d+)\s*h/i);
    if (h) return parseInt(h[1]) * 60;
    return 120;
}

function extractDates(t, base) {
    const dates = [];
    const dayMatch = t.match(/dans\s*(\d+)\s*jours?/i);
    if (dayMatch) {
        const d = new Date(base);
        d.setDate(base.getDate() + parseInt(dayMatch[1]));
        dates.push(d);
    }
    if (t.includes('demain')) {
        const d = new Date(base);
        d.setDate(base.getDate() + 1);
        dates.push(d);
    }
    return dates;
}

/* === PLANNING === */
function updatePlanning() {
    const grid = document.getElementById('planningGrid');
    const tb = document.getElementById('planningTemplateBadge');
    if (tb) {
        const names = {student:'🎓 Étudiant', worker:'💼 Travailleur', custom:'✨ Personnalisé'};
        tb.textContent = names[state.template] || '';
    }
    
    if (state.events.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><h3>Planning vide</h3><p>Utilise l\'IA</p></div>';
        return;
    }
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + state.weekOffset * 7);
    
    const days = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    let html = '<div class="week-grid">';
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const isToday = day.toDateString() === new Date().toDateString();
        
        const evs = state.events
            .filter(e => new Date(e.date).toDateString() === day.toDateString())
            .sort((a,b) => a.startTime.localeCompare(b.startTime));
        
        html += `<div class="day-col${isToday ? ' today' : ''}">
            <div class="day-col-header">
                <div class="day-col-name">${days[i]}</div>
                <div class="day-col-num">${day.getDate()}</div>
            </div>
            <div>${evs.length === 0 ? '<p class="hint" style="font-size:0.75rem;padding:0.5rem 0">Libre</p>' : evs.map(e => `
                <div class="event-card ${e.priority}" onclick="showEventDetail('${e.id}')">
                    <div class="event-title">${e.title}</div>
                    <div class="event-time">${e.startTime} – ${e.endTime}</div>
                </div>`).join('')}
            </div>
        </div>`;
    }
    html += '</div>';
    grid.innerHTML = html;
    
    updateEventsSections();
    updateWeekLabel();
}

function updateEventsSections() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const todayEvs = state.events.filter(e => {
        const d = new Date(e.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
    }).sort((a,b) => a.startTime.localeCompare(b.startTime));
    
    const upcoming = state.events.filter(e => {
        const d = new Date(e.date);
        d.setHours(0,0,0,0);
        return d > today;
    }).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0,10);
    
    document.getElementById('todayList').innerHTML = todayEvs.length === 0 ? '<p class="hint">Rien</p>' :
        todayEvs.map(e => `<div class="event-item" onclick="showEventDetail('${e.id}')"><div style="font-weight:700">${e.title}</div><div style="font-size:0.83rem;color:var(--text2)">⏰ ${e.startTime} – ${e.endTime}</div></div>`).join('');
    
    document.getElementById('upcomingList').innerHTML = upcoming.length === 0 ? '<p class="hint">Rien</p>' :
        upcoming.map(e => {
            const dateStr = new Date(e.date).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
            return `<div class="event-item" onclick="showEventDetail('${e.id}')"><div style="font-weight:700">${e.title}</div><div style="font-size:0.83rem;color:var(--text2)">📅 ${dateStr} • ${e.startTime} – ${e.endTime}</div></div>`;
        }).join('');
}

function updateWeekLabel() {
    const wl = document.getElementById('weekLabel');
    if (!wl) return;
    let txt = 'Cette semaine';
    if (state.weekOffset === 1) txt = 'Semaine prochaine';
    else if (state.weekOffset === -1) txt = 'Semaine dernière';
    else if (state.weekOffset !== 0) txt = `Semaine ${state.weekOffset > 0 ? '+' : ''}${state.weekOffset}`;
    wl.textContent = txt;
}

function changeWeek(d) { state.weekOffset += d; updatePlanning(); }

/* === CALENDAR WITH SLIDE === */
function updateCalendar() {
    const container = document.getElementById('monthCal');
    if (!container) return;
    
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth() + state.monthOffset, 1);
    
    const ml = document.getElementById('monthLabel');
    if (ml) ml.textContent = target.toLocaleDateString('fr-FR', {month:'long', year:'numeric'});
    
    container.classList.remove('slide-right', 'slide-left');
    setTimeout(() => {
        container.classList.add(`slide-${state.monthDirection}`);
    }, 50);
    
    const firstDay = new Date(target.getFullYear(), target.getMonth(), 1);
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    let html = '<div class="cal-header">';
    ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].forEach(d => { html += `<div class="cal-wday">${d}</div>`; });
    html += '</div><div class="cal-body">';
    
    for (let i = 0; i < startOffset; i++) html += '<div class="cal-cell other"></div>';
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const date = new Date(target.getFullYear(), target.getMonth(), d);
        const isToday = date.toDateString() === today.toDateString();
        const evs = state.events.filter(e => new Date(e.date).toDateString() === date.toDateString()).slice(0,3);
        
        html += `<div class="cal-cell${isToday ? ' today' : ''}" onclick="showDayDetail('${date.toISOString()}')">
            <div class="cal-dn">${d}</div>
            ${evs.length ? `<div class="mini-events">${evs.map(e => `<div class="mini-ev ${e.priority}">${e.title}</div>`).join('')}</div>` : ''}
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

function changeMonth(d) {
    state.monthOffset += d;
    state.monthDirection = d > 0 ? 'right' : 'left';
    updateCalendar();
}

/* === DAY DETAIL MODAL === */
function showDayDetail(dateStr) {
    const date = new Date(dateStr);
    const evs = state.events.filter(e => new Date(e.date).toDateString() === date.toDateString()).sort((a,b) => a.startTime.localeCompare(b.startTime));
    
    const content = document.getElementById('dayDetailContent');
    content.innerHTML = `
        <h2 style="margin-bottom:1rem">${date.toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long', year:'numeric'})}</h2>
        <div style="padding:1rem;background:var(--bg);border-radius:10px;margin-bottom:1rem;text-align:center">
            <strong>Streak actuel : 🔥 ${state.streak} jours</strong>
        </div>
        ${evs.length === 0 ? '<p class="hint">Aucun événement ce jour</p>' : `
            <div style="display:flex;flex-direction:column;gap:1rem">
                ${evs.map(e => `
                    <div class="event-item" onclick="showEventDetail('${e.id}')" style="cursor:pointer">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <div>
                                <div style="font-weight:700;font-size:1.1rem">${e.title}</div>
                                <div style="color:var(--text2);margin-top:0.25rem">⏰ ${e.startTime} – ${e.endTime} (${e.duration}min)</div>
                            </div>
                            <span class="pill ${e.priority}" style="font-size:0.85rem">${{critical:'🔴', high:'🟠', medium:'🟡', low:'🟢'}[e.priority]}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
    document.getElementById('dayDetailModal').classList.add('show');
}

function closeDayDetail() {
    document.getElementById('dayDetailModal').classList.remove('show');
}

/* === INSIGHTS WITH DETAIL === */
function updateInsights() {
    const container = document.getElementById('insightsGrid');
    if (!container) return;
    
    const total = state.events.length;
    const totalH = state.events.reduce((s,e) => s + e.duration/60, 0);
    const studyEvs = state.events.filter(e => e.type === 'study');
    const studyH = studyEvs.reduce((s,e) => s + e.duration/60, 0);
    
    container.innerHTML = `
        <div class="insight-card" onclick="showInsightDetail('overview')">
            <h3>📊 Vue d'ensemble</h3>
            <div class="big-stat">${total}</div>
            <p style="color:var(--text2);margin-top:0.25rem">événements (${Math.round(totalH)}h)</p>
        </div>
        <div class="insight-card" onclick="showInsightDetail('distribution')">
            <h3>📚 Répartition</h3>
            <div class="big-stat">${studyEvs.length}</div>
            <p style="color:var(--text2);margin-top:0.25rem">études (${Math.round(studyH)}h)</p>
        </div>
    `;
}

function showInsightDetail(type) {
    const content = document.getElementById('insightDetailContent');
    
    if (type === 'overview') {
        const total = state.events.length;
        const totalH = state.events.reduce((s,e) => s + e.duration/60, 0);
        
        content.innerHTML = `
            <h2>📊 Vue d'ensemble détaillée</h2>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem;margin-top:2rem">
                <div style="text-align:center;padding:2rem;background:var(--bg);border-radius:12px">
                    <div style="font-size:3rem;font-weight:700;color:var(--primary)">${total}</div>
                    <div style="margin-top:0.5rem;color:var(--text2)">Événements totaux</div>
                </div>
                <div style="text-align:center;padding:2rem;background:var(--bg);border-radius:12px">
                    <div style="font-size:3rem;font-weight:700;color:var(--primary)">${Math.round(totalH)}</div>
                    <div style="margin-top:0.5rem;color:var(--text2)">Heures planifiées</div>
                </div>
            </div>
        `;
    } else {
        content.innerHTML = '<h2>📚 Détails répartition</h2><p>Plus de stats ici...</p>';
    }
    
    document.getElementById('insightDetailModal').classList.add('show');
}

function closeInsightDetail() {
    document.getElementById('insightDetailModal').classList.remove('show');
}

/* === EVENT DETAIL & PRIORITY === */
function showEventDetail(eventId) {
    const event = state.events.find(e => String(e.id) === String(eventId));
    if (!event) return;
    
    state.currentEventId = eventId;
    
    document.getElementById('eventDetailTitle').textContent = event.title;
    document.getElementById('eventDetailBody').innerHTML = `
        <p><strong>Date :</strong> ${new Date(event.date).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'})}</p>
        <p><strong>Horaire :</strong> ${event.startTime} – ${event.endTime}</p>
        <p><strong>Durée :</strong> ${event.duration} minutes</p>
        <p><strong>Type :</strong> ${event.type}</p>
    `;
    
    document.getElementById('eventDetailModal').classList.add('show');
}

function closeEventDetail() {
    document.getElementById('eventDetailModal').classList.remove('show');
    state.currentEventId = null;
}

function changePriority(priority) {
    if (!state.currentEventId) return;
    const event = state.events.find(e => String(e.id) === String(state.currentEventId));
    if (event) {
        event.priority = priority;
        saveState();
        updateAllViews();
        toast(`✅ Priorité changée : ${priority}`);
        closeEventDetail();
    }
}

/* === TEMPLATES === */
function updateTemplates() {
    const container = document.getElementById('templatesContent');
    if (!container) return;
    
    const templates = [
        {id:'student', label:'🎓 Étudiant', active: state.template === 'student'},
        {id:'worker', label:'💼 Travailleur', active: state.template === 'worker'},
        {id:'custom', label:'✨ Personnalisé', active: state.template === 'custom'}
    ];
    
    container.innerHTML = `<div class="template-tabs">
        ${templates.map(t => `<button class="template-tab-btn ${t.active ? 'active' : ''}" onclick="switchTemplate('${t.id}')">${t.label}</button>`).join('')}
    </div>
    <div class="template-form-card">
        <p style="color:var(--text2)">Template actif : <strong>${templates.find(t => t.active)?.label}</strong></p>
    </div>`;
}

function switchTemplate(id) {
    state.template = id;
    saveState();
    updateTemplates();
    toast(`✅ Template changé`);
}

/* === BADGES === */
function updateBadges() {
    document.getElementById('streakCount').textContent = state.streak;
    document.getElementById('streakMsg').textContent = 'Continue !';
    
    const badges = [
        {emoji:'⚡', name:'Premier pas', desc:'1er événement', msg:'Bienvenue !', unlocked: (state.user?.totalEvents || 0) >= 1},
        {emoji:'🔥', name:'3 Jours', desc:'Streak 3j', msg:'Tu commences !', unlocked: state.streak >= 3},
        {emoji:'✨', name:'Semaine', desc:'Streak 7j', msg:'Une semaine !', unlocked: state.streak >= 7},
        {emoji:'💪', name:'Quinzaine', desc:'Streak 14j', msg:'Deux semaines !', unlocked: state.streak >= 14},
        {emoji:'🌟', name:'Mois', desc:'Streak 30j', msg:'Un mois !', unlocked: state.streak >= 30},
        {emoji:'💎', name:'Deux mois', desc:'Streak 60j', msg:'Incroyable !', unlocked: state.streak >= 60},
        {emoji:'👑', name:'Légende', desc:'Streak 90j', msg:'LÉGENDE !', unlocked: state.streak >= 90}
    ];
    
    const grid = document.getElementById('badgeGrid');
    if (grid) {
        grid.innerHTML = badges.map(b => `
            <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
                <span class="badge-emoji">${b.emoji}</span>
                <div class="badge-name">${b.name}</div>
                <div class="badge-desc">${b.desc}</div>
                ${b.unlocked ? `<div class="badge-msg">"${b.msg}"</div>` : ''}
            </div>
        `).join('');
    }
}

/* === PROFILE === */
function updateProfile() {
    if (!state.user) return;
    
    document.getElementById('profileName').textContent = state.user.name;
    document.getElementById('profileEmail').textContent = state.user.email || '';
    document.getElementById('profileNameInput').value = state.user.name;
    document.getElementById('profileEmailInput').value = state.user.email || '';
    
    document.getElementById('statEvents').textContent = state.user.totalEvents || 0;
    document.getElementById('statStreak').textContent = state.streak;
    document.getElementById('statHours').textContent = Math.round(state.events.reduce((s,e) => s + e.duration/60, 0));
    document.getElementById('statBadges').textContent = calculateUnlockedBadges();
    
    if (state.user.avatar) {
        document.getElementById('profileAvatarImg').src = state.user.avatar;
        document.getElementById('profileAvatarImg').style.display = 'block';
        document.getElementById('profileAvatarEmoji').style.display = 'none';
    }
}

function calculateUnlockedBadges() {
    let count = 0;
    if ((state.user?.totalEvents || 0) >= 1) count++;
    if (state.streak >= 3) count++;
    if (state.streak >= 7) count++;
    if (state.streak >= 14) count++;
    if (state.streak >= 30) count++;
    if (state.streak >= 60) count++;
    if (state.streak >= 90) count++;
    return count;
}

function saveProfile() {
    if (!state.user) return;
    state.user.name = document.getElementById('profileNameInput').value;
    if (state.user.email && state.accounts[state.user.email]) {
        state.accounts[state.user.email].name = state.user.name;
    }
    saveState();
    updateHeader();
    updateProfile();
    toast('✅ Profil sauvegardé');
}

function handleAvatarChange(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        state.user.avatar = e.target.result;
        if (state.user.email && state.accounts[state.user.email]) {
            state.accounts[state.user.email].avatar = e.target.result;
        }
        saveState();
        updateHeader();
        updateProfile();
        toast('✅ Photo mise à jour');
    };
    reader.readAsDataURL(file);
}

/* === SETTINGS === */
function requestPasswordChange() {
    state.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    document.getElementById('pwdEmail').textContent = state.user.email;
    toast(`📧 Code envoyé : ${state.verificationCode}`);
    document.getElementById('passwordModal').classList.add('show');
}

function confirmPasswordChange() {
    const code = document.getElementById('pwdCode').value;
    const newPwd = document.getElementById('pwdNew').value;
    
    if (code !== state.verificationCode) {
        toast('❌ Code incorrect');
        return;
    }
    
    if (newPwd.length < 6) {
        toast('⚠️ Mot de passe : 6 caractères min');
        return;
    }
    
    if (state.user.email && state.accounts[state.user.email]) {
        state.accounts[state.user.email].password = btoa(newPwd);
        saveState();
        toast('✅ Mot de passe changé !');
        closeModal('passwordModal');
    }
}

function exportData() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chronoflow_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast('✅ Données exportées');
}

function deleteAccount() {
    if (confirm('Supprimer ton compte ? Cette action est irréversible.')) {
        if (state.user?.email) delete state.accounts[state.user.email];
        localStorage.removeItem('cf_v3');
        location.reload();
    }
}

/* === VOICE === */
function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { toast('⚠️ Navigateur non supporté'); return; }
    
    const recognition = new SR();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    
    document.getElementById('voiceTranscript').textContent = '';
    document.getElementById('voiceStatus').textContent = 'Parle...';
    document.getElementById('voiceConfirm').style.display = 'none';
    document.getElementById('voiceModal').classList.add('show');
    document.getElementById('voiceBtn').classList.add('recording');
    
    recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        document.getElementById('voiceTranscript').textContent = transcript;
        state.voiceText = transcript;
        if (e.results[0].isFinal) {
            document.getElementById('voiceStatus').textContent = '✅ Parole reconnue';
            document.getElementById('voiceConfirm').style.display = 'block';
        }
    };
    
    recognition.onerror = () => {
        document.getElementById('voiceStatus').textContent = '❌ Erreur';
        document.getElementById('voiceBtn').classList.remove('recording');
    };
    
    recognition.onend = () => {
        document.getElementById('voiceBtn').classList.remove('recording');
    };
    
    recognition.start();
    state.recognition = recognition;
}

function stopVoice() {
    if (state.recognition) state.recognition.stop();
    document.getElementById('voiceModal').classList.remove('show');
    document.getElementById('voiceBtn').classList.remove('recording');
}

function confirmVoice() {
    if (state.voiceText) {
        document.getElementById('aiInput').value = state.voiceText;
    }
    stopVoice();
    toast('✅ Texte ajouté');
}

/* === UTILS === */
function toast(msg) {
    const el = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    if (!el || !msgEl) return;
    msgEl.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3500);
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

/* === STORAGE === */
function saveState() {
    try {
        localStorage.setItem('cf_v3', JSON.stringify({
            user: state.user,
            accounts: state.accounts,
            events: state.events,
            template: state.template,
            templateData: state.templateData,
            theme: state.theme,
            streak: state.streak,
            lastUsedDate: state.lastUsedDate,
            lang: state.lang,
            notifications: state.notifications
        }));
    } catch(e) { console.error(e); }
}

function loadState() {
    try {
        const saved = localStorage.getItem('cf_v3');
        if (saved) {
            const d = JSON.parse(saved);
            state.user = d.user || null;
            state.accounts = d.accounts || {};
            state.events = (d.events || []).map(e => ({...e, date: new Date(e.date)}));
            state.template = d.template || 'custom';
            state.templateData = d.templateData || {};
            state.theme = d.theme || 'light';
            state.streak = d.streak || 0;
            state.lastUsedDate = d.lastUsedDate || null;
            state.lang = d.lang || null;
            state.notifications = d.notifications || {events:true, daily:true};
        }
    } catch(e) { console.error(e); }
}

window.ChronoFlow = {state, saveState, toast};
