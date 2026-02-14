// ChronoFlow V3 - Full Featured Script

/* ══ STATE ══ */
const state = {
    user: null,
    accounts: {}, // {email: {name, password, avatar, createdAt}}
    events: [],
    weekOffset: 0,
    monthOffset: 0,
    activeView: 'planning',
    theme: 'light',
    streak: 0,
    lastUsedDate: null,
    template: 'custom',
    templateData: {},
    syncStatus: {google: false, apple: false, notion: false},
    voiceText: '',
    recognition: null
};

/* ══ INIT ══ */
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    createParticles('particles');
    createParticles('particles2');
    if (!state.user) {
        document.getElementById('authScreen').style.display = 'flex';
    } else {
        launchApp();
    }
});

function createParticles(containerId) {
    const container = document.getElementById(containerId);
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
        p.style.opacity = (0.3 + Math.random() * 0.5);
        container.appendChild(p);
    }
}

/* ══ AUTH ══ */
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
    if (!account) { toast('❌ Compte introuvable. Inscris-toi !'); return; }
    if (account.password !== btoa(pass)) { toast('❌ Mot de passe incorrect'); return; }

    state.user = { ...account, email };
    saveState();
    launchApp();
}

function handleRegister() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPassword').value;

    if (!name || !email || !pass) { toast('⚠️ Tous les champs sont obligatoires'); return; }
    if (!email.includes('@')) { toast('⚠️ Email invalide'); return; }
    if (pass.length < 6) { toast('⚠️ Mot de passe : 6 caractères minimum'); return; }
    if (state.accounts[email]) { toast('❌ Cet email est déjà utilisé'); return; }

    const account = {
        name,
        email,
        password: btoa(pass),
        avatar: '',
        createdAt: new Date().toISOString()
    };

    state.accounts[email] = account;
    state.user = { ...account };
    state.template = 'custom';
    state.events = [];
    state.streak = 0;
    saveState();

    // Show onboarding
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('onboardingScreen').style.display = 'flex';
    goObStep(1);
}

/* ══ ONBOARDING ══ */
function goObStep(step) {
    document.querySelectorAll('.ob-step').forEach(s => s.classList.remove('active'));
    const map = {1: 'obStep1', '2s': 'obStep2', '2w': 'obStep2w'};
    const el = document.getElementById(map[step] || 'obStep1');
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
    row.innerHTML = `
        <select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select>
        <input type="time" class="tinp" value="08:00">
        <input type="time" class="tinp" value="10:00">
        <input type="text" class="sinp" placeholder="Matière">
        <button class="btn-remove" onclick="removeCourse(this)">✕</button>`;
    container.appendChild(row);
}

function removeCourse(btn) { btn.parentElement.remove(); }

function finishOnboarding() {
    // Save template data
    if (state.template === 'student') {
        const rows = document.querySelectorAll('.course-row');
        state.templateData = {
            courses: Array.from(rows).map(row => ({
                day: parseInt(row.querySelector('.sel')?.value || 1),
                start: row.querySelectorAll('.tinp')[0]?.value,
                end: row.querySelectorAll('.tinp')[1]?.value,
                subject: row.querySelector('.sinp')?.value
            })).filter(c => c.subject),
            sessionDuration: parseInt(document.getElementById('sessionDuration')?.value || 90),
            preferredTime: document.getElementById('preferredTime')?.value || 'afternoon'
        };
        // Generate recurring courses for next 4 weeks
        generateRecurringCourses();
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
    toast(`🎉 Bienvenue ${state.user.name} !`);
}

function generateRecurringCourses() {
    if (!state.templateData.courses) return;
    const today = new Date();
    state.templateData.courses.forEach(course => {
        for (let w = 0; w < 4; w++) {
            const dayDiff = course.day - today.getDay();
            const d = new Date(today);
            d.setDate(today.getDate() + dayDiff + w * 7);
            if (d >= today) {
                state.events.push(makeEvent({
                    title: `Cours ${course.subject}`,
                    type: 'study',
                    date: d,
                    startTime: course.start || '09:00',
                    endTime: course.end || '11:00',
                    priority: 'high',
                    isRecurring: true
                }));
            }
        }
    });
}

/* ══ LAUNCH APP ══ */
function launchApp() {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('onboardingScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'block';
    updateStreakBasedOnUsage();
    applyTheme(state.theme);
    updateHeader();
    updateAllViews();
    setupSyncStatus();
}

function reloadApp() {
    if (confirm('Revenir à la page d\'accueil ?')) location.reload();
}

/* ══ STREAK ══ */
function updateStreakBasedOnUsage() {
    const today = new Date(); today.setHours(0,0,0,0);
    if (!state.lastUsedDate) { state.streak = 0; state.lastUsedDate = new Date().toISOString(); saveState(); return; }
    const last = new Date(state.lastUsedDate); last.setHours(0,0,0,0);
    const diff = Math.floor((today - last) / 86400000);
    if (diff === 0) return;
    else if (diff === 1) state.streak++;
    else state.streak = 0;
    state.lastUsedDate = new Date().toISOString();
    saveState();
}

/* ══ THEME ══ */
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

/* ══ SIDEBAR ══ */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    sidebar.classList.toggle('collapsed');
    toggle.classList.toggle('sidebar-open');
}

/* ══ HEADER ══ */
function updateHeader() {
    document.getElementById('headerStreak').textContent = state.streak;
    if (state.user?.avatar) {
        document.getElementById('headerAvatarImg').src = state.user.avatar;
        document.getElementById('headerAvatarImg').style.display = 'block';
        document.getElementById('headerAvatarEmoji').style.display = 'none';
    }
}

/* ══ VIEWS ══ */
function switchView(view) {
    state.activeView = view;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
    const aiPanel = document.getElementById('aiPanel');
    if (aiPanel) aiPanel.style.display = view === 'planning' ? 'block' : 'none';
    updateCurrentView();
}

function updateCurrentView() {
    const vmap = {
        planning: updatePlanning,
        calendar: updateCalendar,
        insights: updateInsights,
        templates: updateTemplates,
        badges: updateBadges,
        profile: updateProfile
    };
    vmap[state.activeView]?.();
}

function updateAllViews() {
    updatePlanning();
    updateCalendar();
    updateBadges();
    updateProfile();
}

/* ══ AI GENERATION ══ */
function addTag(btn) {
    const textarea = document.getElementById('aiInput');
    const txt = btn.dataset.txt;
    btn.classList.toggle('active');
    if (btn.classList.contains('active')) {
        textarea.value = (textarea.value.trim() + '\n' + txt).trim();
    } else {
        textarea.value = textarea.value.replace(txt, '').trim();
    }
}

async function generate() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) { toast('⚠️ Écris quelque chose d\'abord !'); return; }

    document.getElementById('loading').classList.add('show');
    await new Promise(r => setTimeout(r, 2000));

    const newEvents = parseWithUrgency(input);

    if (newEvents.length > 0) {
        newEvents.forEach(e => { state.events.push(e); });
        state.user.totalEvents = (state.user.totalEvents || 0) + newEvents.length;
        checkWorkload();
        updateAllViews();
        saveState();
        document.getElementById('aiInput').value = '';
        document.querySelectorAll('.tag.active').forEach(t => t.classList.remove('active'));
        toast(`✨ ${newEvents.length} événement(s) ajouté(s) !`);
    } else {
        toast('⚠️ Reformule ta demande');
    }

    document.getElementById('loading').classList.remove('show');
}

function parseWithUrgency(text) {
    const lower = text.toLowerCase();
    const events = [];
    const today = new Date();

    const isUrgent = lower.includes('rien révisé') || lower.includes('pas révisé') || lower.includes('urgent') || lower.includes('dernière minute');
    const hasExam = lower.includes('examen') || lower.includes('éval') || lower.includes('contrôle');
    const isTired = lower.includes('fatigué') || lower.includes('épuisé');

    let subject = 'Révision';
    const subjects = {maths:'Maths', français:'Français', anglais:'Anglais', physique:'Physique', chimie:'Chimie', histoire:'Histoire', géo:'Géo', svt:'SVT', philo:'Philo'};
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
                events.push(makeEvent({ title:`Révision ${subject} (SESSION ${j+1})`, type:'study', date:d, startTime:times[j], duration:dur, priority:'critical' }));
            }
        }
        events.push(makeEvent({ title:`📝 EXAMEN ${subject}`, type:'study', date:examDate, startTime:'8:00', duration:180, priority:'critical' }));
    } else if (hasExam) {
        const daysUntil = Math.max(1, Math.floor((examDate - new Date()) / 86400000));
        for (let i = 0; i < daysUntil; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i + 1);
            events.push(makeEvent({ title:`Révision ${subject}`, type:'study', date:d, startTime: i%2===0?'14:00':'9:00', duration:120, priority:'high' }));
        }
        events.push(makeEvent({ title:`📝 Examen ${subject}`, type:'study', date:examDate, startTime:'8:00', duration:180, priority:'critical' }));
    } else if (isTired) {
        for (let i = 1; i <= 5; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            events.push(makeEvent({ title:'Temps de repos', type:'personal', date:d, startTime:'15:00', duration:90, priority:'medium' }));
        }
    } else {
        const et = detectEventType(lower);
        const dur = extractDuration(lower, et.type);
        const freq = extractFrequency(lower);
        const targetDates = dates.length > 0 ? dates : [new Date(new Date().setDate(new Date().getDate() + 1))];

        if (freq > 1) {
            for (let i = 0; i < freq; i++) {
                const d = new Date();
                d.setDate(d.getDate() + i + 1);
                events.push(makeEvent({ title:et.title, type:et.type, date:d, startTime:getTimeSlot(et.type, i), duration:dur, priority:'medium' }));
            }
        } else {
            targetDates.forEach(d => {
                events.push(makeEvent({ title:et.title, type:et.type, date:d, startTime:getTimeSlot(et.type), duration:dur, priority:'medium' }));
            });
        }
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
        priority: data.priority || 'medium',
        isRecurring: data.isRecurring || false
    };
}

function detectEventType(t) {
    if (t.includes('ami')) return {type:'social', title:'Voir amis'};
    if (t.includes('sport') || t.includes('gym')) return {type:'personal', title:'Sport'};
    if (t.includes('travail') || t.includes('projet')) return {type:'work', title:'Travail'};
    if (t.includes('repos') || t.includes('détente')) return {type:'personal', title:'Temps libre'};
    return {type:'personal', title:'Activité'};
}

function extractDuration(t, type) {
    const h = t.match(/(\d+)\s*h/i);
    if (h) return parseInt(h[1]) * 60;
    const m = t.match(/(\d+)\s*min/i);
    if (m) return parseInt(m[1]);
    return {study:120, work:180, social:150, personal:60}[type] || 60;
}

function extractFrequency(t) {
    const m = t.match(/(\d+)\s*(fois|x)/i);
    if (m) return parseInt(m[1]);
    if (t.includes('tous les jours')) return 7;
    return 1;
}

function extractDates(t, base) {
    const dates = [];
    const dayMatch = t.match(/dans\s*(\d+)\s*jours?/i);
    if (dayMatch) { const d = new Date(base); d.setDate(base.getDate() + parseInt(dayMatch[1])); dates.push(d); }
    if (t.includes('demain')) { const d = new Date(base); d.setDate(base.getDate() + 1); dates.push(d); }
    if (t.includes('samedi')) { const d = new Date(base); d.setDate(base.getDate() + ((6 - base.getDay() + 7) % 7 || 7)); dates.push(d); }
    return dates;
}

function getTimeSlot(type, idx = 0) {
    return ({study:['9:00','14:00','16:00'], work:['9:00','13:00','15:00'], social:['18:00','19:00','20:00'], personal:['10:00','15:00','17:00']}[type] || ['14:00'])[idx % 3];
}

/* ══ WORKLOAD ══ */
function checkWorkload() {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
    const weekEvents = state.events.filter(e => { const d = new Date(e.date); return d >= weekStart && d < weekEnd; });
    const hours = weekEvents.reduce((s, e) => s + (e.duration || 0) / 60, 0);
    if (hours > 60) showWorkloadAlert('overloaded', hours);
    else if (hours < 10 && weekEvents.length > 0) showWorkloadAlert('light', hours);
}

function showWorkloadAlert(type, hours) {
    document.getElementById('workloadTitle').textContent = type === 'overloaded' ? '⚠️ Planning surchargé !' : '💤 Planning très léger';
    document.getElementById('workloadMsg').textContent = type === 'overloaded'
        ? `${Math.round(hours)}h cette semaine, c'est beaucoup ! Veux-tu alléger ?`
        : `Seulement ${Math.round(hours)}h planifiées. Veux-tu ajouter des activités ?`;
    document.getElementById('workloadModal').classList.add('show');
}

function adjustWorkload() {
    state.events = state.events.filter(e => e.priority !== 'low');
    closeModal('workloadModal');
    updateAllViews();
    saveState();
    toast('✅ Planning ajusté !');
}

function closeModal(id) { document.getElementById(id).classList.remove('show'); }

/* ══ SYNC ══ */
async function syncCalendar(btn) {
    const platform = btn.dataset.platform;
    btn.disabled = true;
    toast(`🔄 Synchronisation ${platform}...`);
    await new Promise(r => setTimeout(r, 2000));
    state.syncStatus[platform] = true;
    const statusEl = document.getElementById(`sync${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
    if (statusEl) { statusEl.textContent = '✓'; statusEl.classList.add('synced'); }
    saveState();
    toast(`✅ Synchronisé avec ${platform} !`);
    btn.disabled = false;
}

function setupSyncStatus() {
    Object.entries(state.syncStatus).forEach(([p, synced]) => {
        if (synced) {
            const el = document.getElementById(`sync${p.charAt(0).toUpperCase() + p.slice(1)}`);
            if (el) { el.textContent = '✓'; el.classList.add('synced'); }
        }
    });
}

/* ══ VOICE ══ */
function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast('⚠️ Navigateur non supporté pour la reconnaissance vocale'); return; }

    state.recognition = new SpeechRecognition();
    state.recognition.lang = 'fr-FR';
    state.recognition.interimResults = true;
    state.recognition.continuous = false;

    document.getElementById('voiceTranscript').textContent = '';
    document.getElementById('voiceStatus').textContent = 'Parle maintenant...';
    document.getElementById('voiceConfirm').style.display = 'none';
    document.getElementById('voiceModal').classList.add('show');
    document.getElementById('voiceBtn').classList.add('recording');

    state.recognition.onresult = (e) => {
        const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
        document.getElementById('voiceTranscript').textContent = transcript;
        state.voiceText = transcript;
        if (e.results[0].isFinal) {
            document.getElementById('voiceStatus').textContent = '✅ Parole reconnue !';
            document.getElementById('voiceConfirm').style.display = 'block';
        }
    };

    state.recognition.onerror = () => {
        document.getElementById('voiceStatus').textContent = '❌ Erreur de reconnaissance';
        document.getElementById('voiceBtn').classList.remove('recording');
    };

    state.recognition.onend = () => {
        document.getElementById('voiceBtn').classList.remove('recording');
    };

    state.recognition.start();
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
    toast('✅ Texte ajouté dans le champ IA');
}

/* ══ PLANNING VIEW ══ */
function updatePlanning() {
    const grid = document.getElementById('planningGrid');
    const todayEl = document.getElementById('todayList');
    const upcomingEl = document.getElementById('upcomingList');

    // Template badge
    const tb = document.getElementById('planningTemplateBadge');
    if (tb) {
        const names = {student:'🎓 Étudiant', worker:'💼 Travailleur', custom:'✨ Personnalisé'};
        tb.textContent = names[state.template] || '';
        tb.style.display = state.template !== 'custom' ? 'inline' : 'none';
    }

    if (state.events.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><h3>Planning vide</h3><p>Utilise l\'IA pour planifier</p></div>';
        todayEl.innerHTML = '<p class="hint">Rien pour aujourd\'hui</p>';
        upcomingEl.innerHTML = '<p class="hint">Rien à venir</p>';
        return;
    }

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + state.weekOffset * 7);

    const dayNames = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
    let html = '<div class="week-grid">';

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        const isToday = day.toDateString() === new Date().toDateString();

        const evs = state.events
            .filter(e => new Date(e.date).toDateString() === day.toDateString())
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

        html += `<div class="day-col${isToday ? ' today' : ''}">
            <div class="day-col-header">
                <div class="day-col-name">${dayNames[i]}</div>
                <div class="day-col-num">${day.getDate()}</div>
            </div>
            <div>${evs.length === 0 ? '<p class="hint" style="font-size:0.75rem;padding:0.5rem 0">Libre</p>' : evs.map(e => `
                <div class="event-card ${e.priority}">
                    <div class="event-title">${e.title}</div>
                    <div class="event-time">${e.startTime} – ${e.endTime}</div>
                </div>`).join('')}
            </div>
        </div>`;
    }
    html += '</div>';
    grid.innerHTML = html;

    // Today
    const todayDate = new Date(); todayDate.setHours(0,0,0,0);
    const todayEvs = state.events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d.getTime() === todayDate.getTime(); }).sort((a,b) => a.startTime.localeCompare(b.startTime));
    todayEl.innerHTML = todayEvs.length === 0 ? '<p class="hint">Rien pour aujourd\'hui</p>' :
        todayEvs.map(e => `<div class="event-item"><div style="font-weight:700">${e.title}</div><div style="font-size:0.83rem;color:var(--text2)">⏰ ${e.startTime} – ${e.endTime}</div></div>`).join('');

    // Upcoming
    const upcoming = state.events.filter(e => { const d = new Date(e.date); d.setHours(0,0,0,0); return d > todayDate; })
        .sort((a,b) => new Date(a.date) - new Date(b.date)).slice(0, 10);
    upcomingEl.innerHTML = upcoming.length === 0 ? '<p class="hint">Rien à venir</p>' :
        upcoming.map(e => {
            const dateStr = new Date(e.date).toLocaleDateString('fr-FR', {weekday:'long', day:'numeric', month:'long'});
            return `<div class="event-item"><div style="font-weight:700">${e.title}</div><div style="font-size:0.83rem;color:var(--text2)">📅 ${dateStr} • ${e.startTime} – ${e.endTime}</div></div>`;
        }).join('');

    // Week label
    const wl = document.getElementById('weekLabel');
    if (wl) {
        let txt = 'Cette semaine';
        if (state.weekOffset === 1) txt = 'Semaine prochaine';
        else if (state.weekOffset === -1) txt = 'Semaine dernière';
        else if (state.weekOffset !== 0) txt = `Semaine ${state.weekOffset > 0 ? '+' : ''}${state.weekOffset}`;
        wl.textContent = txt;
    }
}

function changeWeek(d) { state.weekOffset += d; updatePlanning(); }

/* ══ CALENDAR VIEW ══ */
function updateCalendar() {
    const container = document.getElementById('monthCal');
    if (!container) return;
    const today = new Date();
    const target = new Date(today.getFullYear(), today.getMonth() + state.monthOffset, 1);
    const ml = document.getElementById('monthLabel');
    if (ml) ml.textContent = target.toLocaleDateString('fr-FR', {month:'long', year:'numeric'});

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
        const evs = state.events.filter(e => new Date(e.date).toDateString() === date.toDateString()).slice(0, 3);

        html += `<div class="cal-cell${isToday ? ' today' : ''}">
            <div class="cal-dn">${d}</div>
            ${evs.length ? `<div class="mini-events">${evs.map(e => `<div class="mini-ev ${e.priority}">${e.title}</div>`).join('')}</div>` : ''}
        </div>`;
    }
    html += '</div>';
    container.innerHTML = html;
}

function changeMonth(d) { state.monthOffset += d; updateCalendar(); }

/* ══ INSIGHTS VIEW ══ */
function updateInsights() {
    const container = document.getElementById('insightsGrid');
    if (!container) return;

    const total = state.events.length;
    const totalHours = state.events.reduce((s, e) => s + (e.duration || 0) / 60, 0);
    const studyEvs = state.events.filter(e => e.type === 'study');
    const workEvs = state.events.filter(e => e.type === 'work');
    const socialEvs = state.events.filter(e => e.type === 'social');
    const personalEvs = state.events.filter(e => e.type === 'personal');
    const criticalEvs = state.events.filter(e => e.priority === 'critical');

    const studyH = studyEvs.reduce((s, e) => s + e.duration / 60, 0);
    const workH = workEvs.reduce((s, e) => s + e.duration / 60, 0);
    const socialH = socialEvs.reduce((s, e) => s + e.duration / 60, 0);
    const balanceScore = total > 0 ? Math.round(((socialEvs.length + personalEvs.length) / total) * 100) : 0;

    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
    weekStart.setHours(0,0,0,0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
    const thisWeekEvs = state.events.filter(e => { const d = new Date(e.date); return d >= weekStart && d < weekEnd; });
    const thisWeekH = thisWeekEvs.reduce((s, e) => s + e.duration / 60, 0);

    container.innerHTML = `
        <div class="insight-card">
            <h3>📊 Vue d'ensemble</h3>
            <div class="big-stat">${total}</div>
            <p style="color:var(--text2);margin-top:0.25rem">événements planifiés</p>
            <div style="margin-top:1rem;font-size:0.9rem">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                    <span>Total heures</span><strong>${Math.round(totalHours)}h</strong>
                </div>
                <div style="display:flex;justify-content:space-between">
                    <span>Streak actuel</span><strong>🔥 ${state.streak} jours</strong>
                </div>
            </div>
        </div>

        <div class="insight-card">
            <h3>📚 Répartition activités</h3>
            ${[
                {label:'Études', val:studyH, color:'#3B82F6', count:studyEvs.length},
                {label:'Travail', val:workH, color:'#8B5CF6', count:workEvs.length},
                {label:'Social', val:socialH, color:'#10B981', count:socialEvs.length},
                {label:'Personnel', val:personalEvs.reduce((s,e) => s+e.duration/60,0), color:'#F59E0B', count:personalEvs.length}
            ].map(item => `
                <div style="margin-bottom:0.85rem">
                    <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:0.3rem">
                        <span>${item.label}</span>
                        <span style="font-weight:600">${item.count} event. (${Math.round(item.val)}h)</span>
                    </div>
                    <div class="insight-bar">
                        <div class="insight-bar-fill" style="width:${totalHours > 0 ? Math.round(item.val/totalHours*100) : 0}%;background:${item.color}"></div>
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="insight-card">
            <h3>⚖️ Score d'équilibre</h3>
            <div class="big-stat" style="color:${balanceScore >= 60 ? '#10B981' : balanceScore >= 40 ? '#F59E0B' : '#EF4444'}">${balanceScore}%</div>
            <p style="color:var(--text2);margin-top:0.25rem">vie perso + social</p>
            <div class="insight-bar" style="margin-top:1rem">
                <div class="insight-bar-fill" style="width:${balanceScore}%;background:${balanceScore >= 60 ? '#10B981' : balanceScore >= 40 ? '#F59E0B' : '#EF4444'}"></div>
            </div>
            <p style="font-size:0.82rem;margin-top:0.5rem;color:var(--text2)">${balanceScore >= 60 ? '✅ Bon équilibre !' : balanceScore >= 40 ? '⚠️ Ajoute plus de temps perso' : '❌ Trop peu de vie sociale/perso'}</p>
        </div>

        <div class="insight-card">
            <h3>📅 Cette semaine</h3>
            <div class="big-stat">${thisWeekEvs.length}</div>
            <p style="color:var(--text2);margin-top:0.25rem">événements (${Math.round(thisWeekH)}h)</p>
            <p style="font-size:0.82rem;margin-top:0.75rem;color:var(--text2)">
                ${thisWeekH > 50 ? '⚠️ Semaine très chargée' : thisWeekH > 30 ? '✅ Semaine bien remplie' : '💤 Semaine légère'}
            </p>
        </div>

        <div class="insight-card">
            <h3>🚨 Priorité critique</h3>
            <div class="big-stat" style="color:var(--critical)">${criticalEvs.length}</div>
            <p style="color:var(--text2);margin-top:0.25rem">événements urgents</p>
            ${criticalEvs.slice(0,3).map(e => `
                <div style="margin-top:0.6rem;padding:0.5rem;background:rgba(239,68,68,0.08);border-radius:8px;font-size:0.83rem">
                    <strong>${e.title}</strong><br>
                    <span style="color:var(--text2)">${new Date(e.date).toLocaleDateString('fr-FR', {day:'numeric',month:'short'})}</span>
                </div>
            `).join('')}
        </div>

        <div class="insight-card">
            <h3>💡 Recommandations IA</h3>
            <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:0.5rem">
                ${balanceScore < 40 ? '<div style="padding:0.75rem;background:rgba(59,130,246,0.08);border-radius:8px;font-size:0.85rem">💙 Ajoute plus de temps social ou personnel dans ton planning</div>' : ''}
                ${thisWeekH > 55 ? '<div style="padding:0.75rem;background:rgba(245,158,11,0.08);border-radius:8px;font-size:0.85rem">⚠️ Semaine très chargée. Pense à te reposer !</div>' : ''}
                ${state.streak === 0 ? '<div style="padding:0.75rem;background:rgba(16,185,129,0.08);border-radius:8px;font-size:0.85rem">🔥 Reviens chaque jour pour maintenir ton streak !</div>' : ''}
                ${criticalEvs.length > 3 ? '<div style="padding:0.75rem;background:rgba(239,68,68,0.08);border-radius:8px;font-size:0.85rem">🚨 Trop d\'urgences ! Organise-toi en avance.</div>' : ''}
                ${total === 0 ? '<div style="padding:0.75rem;background:rgba(255,107,53,0.08);border-radius:8px;font-size:0.85rem">📝 Commence par planifier ta semaine avec l\'IA !</div>' : ''}
                ${total > 10 && balanceScore >= 60 ? '<div style="padding:0.75rem;background:rgba(16,185,129,0.08);border-radius:8px;font-size:0.85rem">🌟 Excellent ! Tu as un très bon équilibre.</div>' : ''}
            </div>
        </div>
    `;
}

/* ══ TEMPLATES VIEW ══ */
function updateTemplates() {
    const container = document.getElementById('templatesContent');
    if (!container) return;

    const templates = [
        {id:'student', label:'🎓 Étudiant', active: state.template === 'student'},
        {id:'worker', label:'💼 Travailleur', active: state.template === 'worker'},
        {id:'custom', label:'✨ Personnalisé', active: state.template === 'custom'}
    ];

    let html = `<div class="template-tabs">
        ${templates.map(t => `<button class="template-tab-btn ${t.active ? 'active' : ''}" onclick="switchTemplate('${t.id}')">${t.label}</button>`).join('')}
    </div>`;

    if (state.template === 'student') {
        html += `
        <div class="template-form-card">
            <h3 style="margin-bottom:1.25rem">🎓 Configuration Étudiant</h3>
            <div id="tplCoursesContainer">
                ${(state.templateData.courses || []).map(c => `
                    <div class="course-row">
                        <select class="sel">
                            ${['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d, i) => `<option value="${i+1}" ${c.day===i+1?'selected':''}>${d}</option>`).join('')}
                        </select>
                        <input type="time" class="tinp" value="${c.start || '08:00'}">
                        <input type="time" class="tinp" value="${c.end || '10:00'}">
                        <input type="text" class="sinp" value="${c.subject || ''}" placeholder="Matière">
                        <button class="btn-remove" onclick="removeTplCourse(this)">✕</button>
                    </div>
                `).join('')}
                ${(state.templateData.courses || []).length === 0 ? `
                    <div class="course-row">
                        <select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select>
                        <input type="time" class="tinp" value="08:00">
                        <input type="time" class="tinp" value="10:00">
                        <input type="text" class="sinp" placeholder="Matière">
                        <button class="btn-remove" onclick="removeTplCourse(this)">✕</button>
                    </div>` : ''}
            </div>
            <button class="btn-secondary" onclick="addTplCourse()" style="margin-bottom:1.5rem">+ Ajouter un cours</button>
            <div class="form-group"><label>Durée de révision idéale</label>
                <select id="tplSessionDuration">
                    <option value="60" ${state.templateData.sessionDuration===60?'selected':''}>1 heure</option>
                    <option value="90" ${state.templateData.sessionDuration===90?'selected':''}>1h30</option>
                    <option value="120" ${state.templateData.sessionDuration===120?'selected':''}>2 heures</option>
                    <option value="180" ${state.templateData.sessionDuration===180?'selected':''}>3 heures</option>
                </select>
            </div>
            <div class="form-group"><label>Moment préféré</label>
                <select id="tplPreferredTime">
                    <option value="morning" ${state.templateData.preferredTime==='morning'?'selected':''}>Matin</option>
                    <option value="afternoon" ${state.templateData.preferredTime==='afternoon'?'selected':''}>Après-midi</option>
                    <option value="evening" ${state.templateData.preferredTime==='evening'?'selected':''}>Soir</option>
                </select>
            </div>
            <button class="btn-primary" onclick="saveTplStudent()">Enregistrer les changements</button>
        </div>`;
    } else if (state.template === 'worker') {
        html += `
        <div class="template-form-card">
            <h3 style="margin-bottom:1.25rem">💼 Configuration Travailleur</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
                <div class="form-group"><label>Début de journée</label><input type="time" id="tplWorkStart" value="${state.templateData.workStart || '09:00'}"></div>
                <div class="form-group"><label>Fin de journée</label><input type="time" id="tplWorkEnd" value="${state.templateData.workEnd || '18:00'}"></div>
            </div>
            <button class="btn-primary" onclick="saveTplWorker()">Enregistrer les changements</button>
        </div>`;
    } else {
        html += `<div class="template-form-card"><p style="color:var(--text2)">Mode personnalisé : utilise directement l'IA pour générer ton planning.</p></div>`;
    }

    container.innerHTML = html;
}

function switchTemplate(id) {
    state.template = id;
    saveState();
    updateTemplates();
    updatePlanning();
    toast(`✅ Template changé : ${{student:'Étudiant', worker:'Travailleur', custom:'Personnalisé'}[id]}`);
}

function addTplCourse() {
    const container = document.getElementById('tplCoursesContainer');
    const row = document.createElement('div');
    row.className = 'course-row';
    row.innerHTML = `<select class="sel"><option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option></select>
        <input type="time" class="tinp" value="08:00">
        <input type="time" class="tinp" value="10:00">
        <input type="text" class="sinp" placeholder="Matière">
        <button class="btn-remove" onclick="removeTplCourse(this)">✕</button>`;
    container.appendChild(row);
}

function removeTplCourse(btn) { btn.parentElement.remove(); }

function saveTplStudent() {
    const rows = document.querySelectorAll('#tplCoursesContainer .course-row');
    state.templateData.courses = Array.from(rows).map(r => ({
        day: parseInt(r.querySelector('.sel').value),
        start: r.querySelectorAll('.tinp')[0].value,
        end: r.querySelectorAll('.tinp')[1].value,
        subject: r.querySelector('.sinp').value
    })).filter(c => c.subject);
    state.templateData.sessionDuration = parseInt(document.getElementById('tplSessionDuration').value);
    state.templateData.preferredTime = document.getElementById('tplPreferredTime').value;
    saveState();
    toast('✅ Template étudiant sauvegardé !');
}

function saveTplWorker() {
    state.templateData.workStart = document.getElementById('tplWorkStart').value;
    state.templateData.workEnd = document.getElementById('tplWorkEnd').value;
    saveState();
    toast('✅ Template travailleur sauvegardé !');
}

/* ══ BADGES VIEW ══ */
function updateBadges() {
    const streakEl = document.getElementById('streakCount');
    const msgEl = document.getElementById('streakMsg');
    if (streakEl) streakEl.textContent = state.streak;

    const messages = [
        {days:0, msg:'Commence ton aventure ChronoFlow !'},
        {days:3, msg:'🔥 3 jours ! Tu démarres fort !'},
        {days:7, msg:'✨ Une semaine complète ! Incroyable !'},
        {days:14, msg:'💪 Deux semaines ! Tu es sur une belle lancée !'},
        {days:21, msg:'⚡ 21 jours = une nouvelle habitude formée !'},
        {days:30, msg:'🌟 UN MOIS ! Tu es une machine !'},
        {days:60, msg:'💎 Deux mois ! Tu es au top !'},
        {days:90, msg:'👑 90 jours ! Légende absolue !'}
    ];

    const currentMsg = [...messages].reverse().find(m => state.streak >= m.days);
    if (msgEl) msgEl.textContent = currentMsg?.msg || 'Continue chaque jour !';

    const badges = [
        {emoji:'⚡', name:'Premier pas', desc:'1er événement créé', msg:'Bienvenue dans ChronoFlow !', day:0, unlocked: (state.user?.totalEvents || 0) >= 1},
        {emoji:'🔥', name:'3 Jours', desc:'Streak de 3 jours', msg:'Tu commences à prendre l\'habitude !', day:3, unlocked: state.streak >= 3},
        {emoji:'📅', name:'Une semaine', desc:'Streak de 7 jours', msg:'7 jours sans faillir, respect !', day:7, unlocked: state.streak >= 7},
        {emoji:'💪', name:'Quinzaine', desc:'Streak de 14 jours', msg:'Deux semaines de régularité !', day:14, unlocked: state.streak >= 14},
        {emoji:'⚡', name:'3 semaines', desc:'Streak de 21 jours', msg:'21 jours = nouvelle habitude créée !', day:21, unlocked: state.streak >= 21},
        {emoji:'🌟', name:'Un mois', desc:'Streak de 30 jours', msg:'UN MOIS ! Tu gères ta vie comme un pro !', day:30, unlocked: state.streak >= 30},
        {emoji:'🎯', name:'Organisé', desc:'50 événements planifiés', msg:'Tu planifies tout. Respect !', day:null, unlocked: (state.user?.totalEvents || 0) >= 50},
        {emoji:'💎', name:'Deux mois', desc:'Streak de 60 jours', msg:'60 jours ! Tu es une machine !', day:60, unlocked: state.streak >= 60},
        {emoji:'👑', name:'Légende', desc:'Streak de 90 jours', msg:'90 jours ! Tu es une LÉGENDE de la productivité !', day:90, unlocked: state.streak >= 90},
        {emoji:'🏆', name:'100 Événements', desc:'100 événements créés', msg:'Tu es un maître de la planification !', day:null, unlocked: (state.user?.totalEvents || 0) >= 100},
    ];

    const grid = document.getElementById('badgeGrid');
    if (grid) {
        grid.innerHTML = badges.map(b => `
            <div class="badge-card ${b.unlocked ? 'unlocked' : 'locked'}">
                <span class="badge-emoji">${b.emoji}</span>
                <div class="badge-name">${b.name}</div>
                <div class="badge-desc">${b.desc}</div>
                ${b.day !== null ? `<div class="badge-day">${b.day} jours</div>` : ''}
                ${b.unlocked ? `<div class="badge-msg">"${b.msg}"</div>` : ''}
            </div>
        `).join('');
    }
}

/* ══ PROFILE VIEW ══ */
function updateProfile() {
    if (!state.user) return;
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    if (nameEl) nameEl.textContent = state.user.name;
    if (emailEl) emailEl.textContent = state.user.email || '';

    const nameInput = document.getElementById('profileNameInput');
    const emailInput = document.getElementById('profileEmailInput');
    if (nameInput) nameInput.value = state.user.name;
    if (emailInput) emailInput.value = state.user.email || '';

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
    const total = state.user?.totalEvents || 0;
    let count = 0;
    if (total >= 1) count++;
    if (state.streak >= 3) count++;
    if (state.streak >= 7) count++;
    if (state.streak >= 14) count++;
    if (state.streak >= 21) count++;
    if (state.streak >= 30) count++;
    if (total >= 50) count++;
    if (state.streak >= 60) count++;
    if (state.streak >= 90) count++;
    if (total >= 100) count++;
    return count;
}

function saveProfile() {
    state.user.name = document.getElementById('profileNameInput').value;
    // Email NOT editable
    if (state.user.email && state.accounts[state.user.email]) {
        state.accounts[state.user.email].name = state.user.name;
        state.accounts[state.user.email].avatar = state.user.avatar || '';
    }
    saveState();
    updateHeader();
    updateProfile();
    toast('✅ Profil sauvegardé !');
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
        toast('✅ Photo mise à jour !');
    };
    reader.readAsDataURL(file);
}

/* ══ UTILS ══ */
function toast(msg) {
    const el = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    if (!el || !msgEl) return;
    msgEl.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3500);
}

/* ══ STORAGE ══ */
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
            syncStatus: state.syncStatus
        }));
    } catch(e) { console.error('Save error:', e); }
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
            state.syncStatus = d.syncStatus || {google:false, apple:false, notion:false};
        }
    } catch(e) { console.error('Load error:', e); }
}

window.ChronoFlow = {state, saveState, toast};
