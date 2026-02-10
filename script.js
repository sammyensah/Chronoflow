// ChronoFlow V4 - Clean & Functional

const state = {
    user: {name: '', email: '', totalEvents: 0, lastUsedDate: null, templateType: 'custom'},
    events: [],
    weekOffset: 0,
    monthOffset: 0,
    activeView: 'planning',
    theme: 'light',
    streak: 0
};

// Init
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    if (!state.user.name) {
        document.getElementById('onboardingModal').classList.add('show');
    } else {
        startApp();
    }
});

function startApp() {
    document.getElementById('onboardingModal').classList.remove('show');
    document.getElementById('app').style.display = 'block';
    updateStreakBasedOnUsage();
    applyTheme(state.theme);
    updateHeader();
    updateAllViews();
}

function nextStep() {
    const name = document.getElementById('userName').value.trim();
    if (!name) {
        toast('⚠️ Entre ton prénom !');
        return;
    }
    state.user.name = name;
    state.user.email = document.getElementById('userEmail').value.trim();
    
    document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-step="2"]').classList.add('active');
}

function finishOnboarding(template) {
    state.user.templateType = template;
    state.user.firstUseDate = new Date().toISOString();
    state.user.lastUsedDate = new Date().toISOString();
    saveState();
    startApp();
    toast(`🎉 Bienvenue ${state.user.name} !`);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('hidden');
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme(state.theme);
    saveState();
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const btn = document.querySelectorAll('.btn-icon')[1];
    if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
}

function updateStreakBasedOnUsage() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (!state.user.lastUsedDate) {
        state.streak = 0;
        state.user.lastUsedDate = new Date().toISOString();
        saveState();
        return;
    }
    
    const lastUsed = new Date(state.user.lastUsedDate);
    lastUsed.setHours(0,0,0,0);
    
    const daysDiff = Math.floor((today - lastUsed) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return;
    else if (daysDiff === 1) state.streak++;
    else state.streak = 0;
    
    state.user.lastUsedDate = new Date().toISOString();
    saveState();
}

function showView(view) {
    state.activeView = view;
    
    document.querySelectorAll('.nav-btn').forEach((btn, i) => {
        btn.classList.toggle('active', ['planning','calendar','insights','templates','badges'][i] === view);
    });
    
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`).classList.add('active');
    
    const aiBox = document.getElementById('aiBox');
    if (aiBox) aiBox.style.display = view === 'planning' ? 'block' : 'none';
    
    updateCurrentView();
}

function goToProfile() {
    showView('profile');
}

function updateCurrentView() {
    if (state.activeView === 'planning') updatePlanning();
    if (state.activeView === 'calendar') updateCalendar();
    if (state.activeView === 'insights') updateInsights();
    if (state.activeView === 'templates') updateTemplates();
    if (state.activeView === 'badges') updateBadges();
    if (state.activeView === 'profile') updateProfile();
}

function updateAllViews() {
    updatePlanning();
    updateCalendar();
}

// AI Generation
async function generate() {
    const input = document.getElementById('aiInput').value.trim();
    
    if (!input) {
        toast('⚠️ Écris quelque chose !');
        return;
    }
    
    document.getElementById('loading').classList.add('show');
    
    await new Promise(r => setTimeout(r, 2000));
    
    const newEvents = parseInput(input);
    
    if (newEvents.length > 0) {
        newEvents.forEach(e => {
            state.events.push(e);
            state.user.totalEvents++;
        });
        
        updateAllViews();
        saveState();
        
        document.getElementById('aiInput').value = '';
        toast(`✨ ${newEvents.length} événement(s) ajouté(s) !`);
    } else {
        toast('⚠️ Reformule ta demande');
    }
    
    document.getElementById('loading').classList.remove('show');
}

function parseInput(text) {
    const lower = text.toLowerCase();
    const events = [];
    const today = new Date();
    
    const isUrgent = lower.includes('rien révisé') || lower.includes('pas révisé') || lower.includes('urgent');
    const hasExam = lower.includes('examen') || lower.includes('éval') || lower.includes('contrôle');
    
    let subject = 'Révision';
    const subjects = ['maths', 'français', 'anglais', 'physique', 'chimie', 'histoire'];
    for (const s of subjects) {
        if (lower.includes(s)) {
            subject = s.charAt(0).toUpperCase() + s.slice(1);
            break;
        }
    }
    
    const dates = getDates(lower, today);
    const examDate = dates[0] || new Date(today.setDate(today.getDate() + 7));
    
    if (hasExam && isUrgent) {
        const daysUntil = Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24));
        const sessionsPerDay = daysUntil < 3 ? 3 : 2;
        const sessionDuration = daysUntil < 3 ? 180 : 120;
        
        for (let i = 0; i < daysUntil; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            
            for (let j = 0; j < sessionsPerDay; j++) {
                const times = ['9:00', '14:00', '17:00'];
                events.push(makeEvent({
                    title: `Révision ${subject} (SESSION ${j+1})`,
                    type: 'study',
                    date: date,
                    startTime: times[j],
                    duration: sessionDuration,
                    priority: 'critical'
                }));
            }
        }
        
        events.push(makeEvent({
            title: `📝 EXAMEN ${subject}`,
            type: 'study',
            date: examDate,
            startTime: '8:00',
            duration: 180,
            priority: 'critical'
        }));
    } else {
        const eventType = getEventType(lower);
        const duration = getDuration(lower);
        const targetDates = dates.length > 0 ? dates : [new Date(new Date().setDate(new Date().getDate() + 1))];
        
        targetDates.forEach(date => {
            events.push(makeEvent({
                title: eventType.title,
                type: eventType.type,
                date: date,
                startTime: '14:00',
                duration: duration,
                priority: 'medium'
            }));
        });
    }
    
    return events;
}

function makeEvent(data) {
    const [h, m] = data.startTime.split(':').map(Number);
    const totalMin = h * 60 + m + data.duration;
    const endTime = `${Math.floor(totalMin/60).toString().padStart(2,'0')}:${(totalMin%60).toString().padStart(2,'0')}`;
    
    return {
        id: Date.now() + Math.random(),
        title: data.title,
        type: data.type,
        date: data.date,
        startTime: data.startTime,
        endTime: endTime,
        duration: data.duration,
        priority: data.priority
    };
}

function getEventType(text) {
    if (text.includes('ami')) return {type: 'social', title: 'Voir amis'};
    if (text.includes('sport')) return {type: 'personal', title: 'Sport'};
    if (text.includes('travail')) return {type: 'work', title: 'Travail'};
    return {type: 'personal', title: 'Activité'};
}

function getDuration(text) {
    const hourMatch = text.match(/(\d+)\s*h/i);
    if (hourMatch) return parseInt(hourMatch[1]) * 60;
    return 120;
}

function getDates(text, base) {
    const dates = [];
    
    if (text.includes('dans') && text.includes('jour')) {
        const match = text.match(/dans\s*(\d+)\s*jours?/i);
        if (match) {
            const date = new Date(base);
            date.setDate(base.getDate() + parseInt(match[1]));
            dates.push(date);
        }
    }
    
    if (text.includes('demain')) {
        const date = new Date(base);
        date.setDate(base.getDate() + 1);
        dates.push(date);
    }
    
    if (text.includes('samedi')) {
        const date = new Date(base);
        const daysToSat = (6 - base.getDay() + 7) % 7 || 7;
        date.setDate(base.getDate() + daysToSat);
        dates.push(date);
    }
    
    return dates;
}

// Planning View
function updatePlanning() {
    const grid = document.getElementById('planningGrid');
    
    if (state.events.length === 0) {
        grid.innerHTML = '<div class="empty"><div class="empty-icon">📅</div><h3>Planning vide</h3><p>Utilise l\'IA pour planifier</p></div>';
        document.getElementById('today').innerHTML = '<p class="empty-text">Rien</p>';
        document.getElementById('upcoming').innerHTML = '<p class="empty-text">Rien</p>';
        return;
    }
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + (state.weekOffset * 7));
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let html = '<div class="week-grid">';
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        const isToday = currentDay.toDateString() === today.toDateString();
        
        const dayEvents = state.events.filter(e => 
            new Date(e.date).toDateString() === currentDay.toDateString()
        ).sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        html += `<div class="day-col ${isToday ? 'today' : ''}">
            <div class="day-header">
                <div class="day-name">${days[i]}</div>
                <div class="day-date">${currentDay.getDate()}</div>
            </div>
            <div class="day-events">${
                dayEvents.length === 0 ? '<p class="empty-text" style="font-size:0.75rem;padding:1rem 0">Libre</p>' :
                dayEvents.map(e => `
                    <div class="event-card ${e.priority}">
                        <div class="event-title">${e.title}</div>
                        <div class="event-time">${e.startTime} - ${e.endTime}</div>
                    </div>
                `).join('')
            }</div>
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
    
    const todayEvents = state.events.filter(e => {
        const d = new Date(e.date);
        d.setHours(0,0,0,0);
        return d.getTime() === today.getTime();
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const upcoming = state.events.filter(e => {
        const d = new Date(e.date);
        d.setHours(0,0,0,0);
        return d > today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10);
    
    document.getElementById('today').innerHTML = todayEvents.length === 0 ? '<p class="empty-text">Rien</p>' :
        todayEvents.map(e => `
            <div class="event-item">
                <div style="font-weight:600">${e.title}</div>
                <div style="font-size:0.85rem;color:var(--text2)">${e.startTime} - ${e.endTime}</div>
            </div>
        `).join('');
    
    document.getElementById('upcoming').innerHTML = upcoming.length === 0 ? '<p class="empty-text">Rien</p>' :
        upcoming.map(e => {
            const d = new Date(e.date).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'});
            return `
                <div class="event-item">
                    <div style="font-weight:600">${e.title}</div>
                    <div style="font-size:0.85rem;color:var(--text2)">📅 ${d} • ${e.startTime} - ${e.endTime}</div>
                </div>
            `;
        }).join('');
}

function updateWeekLabel() {
    const label = document.getElementById('weekLabel');
    if (!label) return;
    
    let text = 'Cette semaine';
    if (state.weekOffset === 1) text = 'Semaine prochaine';
    else if (state.weekOffset === -1) text = 'Semaine dernière';
    else if (state.weekOffset !== 0) text = `Semaine ${state.weekOffset > 0 ? '+' : ''}${state.weekOffset}`;
    label.textContent = text;
}

function changeWeek(offset) {
    state.weekOffset += offset;
    updatePlanning();
}

// Calendar View
function updateCalendar() {
    const container = document.getElementById('monthCalendar');
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + state.monthOffset, 1);
    
    const monthLabel = document.getElementById('monthLabel');
    if (monthLabel) {
        monthLabel.textContent = targetMonth.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
    }
    
    const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    let html = '<div class="cal-weekdays">';
    ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach(d => {
        html += `<div class="weekday">${d}</div>`;
    });
    html += '</div><div class="cal-days">';
    
    for (let i = 0; i < startDay; i++) {
        html += '<div class="cal-day other"></div>';
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
        const isToday = date.toDateString() === today.toDateString();
        
        const dayEvents = state.events.filter(e => 
            new Date(e.date).toDateString() === date.toDateString()
        ).slice(0, 3);
        
        html += `<div class="cal-day ${isToday ? 'today' : ''}">
            <div class="day-num">${day}</div>
            ${dayEvents.length > 0 ? `
                <div class="mini-events">${
                    dayEvents.map(e => `<div class="mini-event ${e.priority}">${e.title}</div>`).join('')
                }</div>
            ` : ''}
        </div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function changeMonth(offset) {
    state.monthOffset += offset;
    updateCalendar();
}

// Insights
function updateInsights() {
    const container = document.getElementById('insightsContent');
    const totalEvents = state.events.length;
    const studyEvents = state.events.filter(e => e.type === 'study');
    
    container.innerHTML = `
        <div class="insight-card">
            <h3>📊 Vue d'ensemble</h3>
            <p style="font-size:2rem;font-weight:700;color:var(--primary);margin:1rem 0">${totalEvents}</p>
            <p>Événements planifiés</p>
        </div>
        <div class="insight-card">
            <h3>📚 Répartition</h3>
            <div style="margin-top:1rem">
                <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem">
                    <span>Études</span>
                    <strong>${studyEvents.length}</strong>
                </div>
            </div>
        </div>
    `;
}

// Templates
function updateTemplates() {
    const container = document.getElementById('templatesContent');
    container.innerHTML = `
        <div class="insight-card">
            <h3>🎯 Template actif</h3>
            <p style="font-size:1.2rem;margin-top:1rem">
                ${state.user.templateType === 'student' ? '🎓 Étudiant' : 
                  state.user.templateType === 'worker' ? '💼 Travailleur' : '✨ Personnalisé'}
            </p>
        </div>
    `;
}

// Badges
function updateBadges() {
    document.getElementById('streakDays').textContent = state.streak;
    
    const badges = [
        {icon: '⚡', name: 'Débutant', desc: '1er événement', unlocked: state.user.totalEvents >= 1},
        {icon: '🔥', name: '3 jours', desc: 'Streak 3j', unlocked: state.streak >= 3},
        {icon: '✨', name: 'Semaine', desc: 'Streak 7j', unlocked: state.streak >= 7},
    ];
    
    document.getElementById('badgesGrid').innerHTML = badges.map(b => `
        <div class="badge ${b.unlocked ? '' : 'locked'}">
            <div class="badge-icon">${b.icon}</div>
            <div style="font-weight:600;margin-bottom:0.5rem">${b.name}</div>
            <div style="font-size:0.75rem;color:var(--text2)">${b.desc}</div>
        </div>
    `).join('');
}

// Profile
function updateProfile() {
    document.getElementById('profileName').textContent = state.user.name;
    document.getElementById('statEvents').textContent = state.user.totalEvents;
    document.getElementById('statStreak').textContent = state.streak;
}

function updateHeader() {
    const streakEl = document.getElementById('streakNum');
    if (streakEl) streakEl.textContent = state.streak;
}

// Utils
function toast(msg) {
    const toastEl = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (toastEl && toastMsg) {
        toastMsg.textContent = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 3000);
    }
}

// Storage
function saveState() {
    try {
        localStorage.setItem('chronoflow_v4', JSON.stringify({
            user: state.user,
            events: state.events,
            theme: state.theme,
            streak: state.streak
        }));
    } catch (e) {console.error(e)}
}

function loadState() {
    try {
        const saved = localStorage.getItem('chronoflow_v4');
        if (saved) {
            const data = JSON.parse(saved);
            state.user = data.user || state.user;
            state.events = (data.events || []).map(e => ({...e, date: new Date(e.date)}));
            state.theme = data.theme || 'light';
            state.streak = data.streak || 0;
        }
    } catch (e) {console.error(e)}
}

window.ChronoFlow = {state, saveState};
