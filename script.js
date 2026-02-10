// ChronoFlow V4 - Complete AI Planning Assistant
// With urgency detection, monthly calendar, insights, and complete template system

const state = {
    user: {
        name: '',
        email: '',
        avatar: '',
        totalEvents: 0,
        totalHours: 0,
        lastUsedDate: null,
        templateType: 'none',
        schedule: [] // User's schedule (courses, work hours, etc.)
    },
    events: [],
    currentWeekOffset: 0,
    currentMonthOffset: 0,
    activeView: 'planning',
    theme: 'light',
    streak: 0,
    syncedCalendars: {google: false, apple: false, notion: false}
};

// === INIT ===
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    if (!state.user.name) {
        showOnboarding();
    } else {
        initApp();
    }
    setupListeners();
});

function initApp() {
    document.getElementById('appContainer').style.display = 'block';
    document.getElementById('onboardingModal').classList.remove('show');
    updateStreakBasedOnUsage();
    setTheme(state.theme);
    updateHeaderUI();
    updateAllViews();
}

// === ONBOARDING ===
function showOnboarding() {
    document.getElementById('onboardingModal').classList.add('show');
}

function nextOnboardingStep(step) {
    if (step === 2) {
        const name = document.getElementById('onboardingName').value.trim();
        if (!name) {
            showToast('⚠️ Entre ton prénom !');
            return;
        }
        state.user.name = name;
        state.user.email = document.getElementById('onboardingEmail').value.trim();
    }
    
    document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
}

function prevOnboardingStep(step) {
    document.querySelectorAll('.onboarding-step').forEach(s => s.classList.remove('active'));
    document.querySelector(`[data-step="${step}"]`).classList.add('active');
}

function selectTemplate(template) {
    state.user.templateType = template;
    
    if (template === 'student') {
        nextOnboardingStep('3-student');
    } else if (template === 'worker') {
        nextOnboardingStep('3-worker');
    } else {
        completeOnboarding();
    }
}

function addCourseRow() {
    const container = document.getElementById('coursesContainer');
    const row = document.createElement('div');
    row.className = 'course-row';
    row.innerHTML = `
        <select class="day-select">
            <option value="1">Lundi</option>
            <option value="2">Mardi</option>
            <option value="3">Mercredi</option>
            <option value="4">Jeudi</option>
            <option value="5">Vendredi</option>
            <option value="6">Samedi</option>
        </select>
        <input type="time" class="time-input" placeholder="Début">
        <input type="time" class="time-input" placeholder="Fin">
        <input type="text" class="subject-input" placeholder="Matière">
        <button class="btn-icon" onclick="removeCourseRow(this)">🗑️</button>
    `;
    container.appendChild(row);
}

function removeCourseRow(btn) {
    btn.parentElement.remove();
}

function completeOnboarding() {
    // Save schedule if student template
    if (state.user.templateType === 'student') {
        const rows = document.querySelectorAll('.course-row');
        state.user.schedule = Array.from(rows).map(row => ({
            day: parseInt(row.querySelector('.day-select').value),
            startTime: row.querySelectorAll('.time-input')[0].value,
            endTime: row.querySelectorAll('.time-input')[1].value,
            subject: row.querySelector('.subject-input').value
        })).filter(s => s.startTime && s.endTime && s.subject);
        
        // Add courses to calendar as recurring events
        state.user.schedule.forEach(course => {
            for (let week = 0; week < 4; week++) { // 4 weeks
                const today = new Date();
                const dayDiff = course.day - today.getDay();
                const date = new Date(today);
                date.setDate(today.getDate() + dayDiff + (week * 7));
                
                state.events.push({
                    id: Date.now() + Math.random(),
                    title: `Cours ${course.subject}`,
                    type: 'study',
                    date: date,
                    startTime: course.startTime,
                    endTime: course.endTime,
                    duration: calculateDuration(course.startTime, course.endTime),
                    priority: 'high',
                    isRecurring: true
                });
            }
        });
    }
    
    state.user.firstUseDate = new Date().toISOString();
    state.user.lastUsedDate = new Date().toISOString();
    saveState();
    initApp();
    showToast(`🎉 Bienvenue ${state.user.name} !`);
}

function calculateDuration(start, end) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return ((eh * 60 + em) - (sh * 60 + sm));
}

// Handle avatar upload
document.getElementById('avatarInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.user.avatar = e.target.result;
            document.getElementById('avatarPreview').innerHTML = `<img src="${e.target.result}">`;
        };
        reader.readAsDataURL(file);
    }
});

// === LISTENERS ===
function setupListeners() {
    document.getElementById('sidebarToggle')?.addEventListener('click', toggleSidebar);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);
    document.getElementById('profileBtn')?.addEventListener('click', () => switchView('profile'));
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => switchView(e.currentTarget.dataset.view));
    });
    
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => toggleQuickTag(e.currentTarget, e.currentTarget.dataset.tag));
    });
    
    document.getElementById('generateBtn')?.addEventListener('click', handleGenerate);
    
    document.getElementById('prevWeek')?.addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeek')?.addEventListener('click', () => changeWeek(1));
    
    document.getElementById('calPrevMonth')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('calNextMonth')?.addEventListener('click', () => changeMonth(1));
    
    document.querySelectorAll('.sync-btn').forEach(btn => {
        btn.addEventListener('click', (e) => syncCalendar(e.currentTarget.dataset.platform));
    });
    
    document.getElementById('saveProfile')?.addEventListener('click', saveProfile);
    document.getElementById('profileAvatarInput')?.addEventListener('change', handleProfileAvatar);
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.toggle('show');
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(state.theme);
    saveState();
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('.theme-icon').textContent = theme === 'light' ? '🌙' : '☀️';
}

function toggleQuickTag(btn, tag) {
    const textarea = document.getElementById('aiInput');
    const tagText = {
        '😴 Fatigué': 'Je suis fatigué, plus de temps libre',
        '📚 Examen urgent': 'J\'ai un examen important et j\'ai rien révisé',
        '👥 Amis': 'Voir mes amis ce weekend',
        '🏃 Sport': 'Sport 3 fois cette semaine',
        '⚖️ Équilibre': 'Besoin d\'équilibre vie/travail'
    }[tag] || '';
    
    btn.classList.toggle('active');
    
    if (btn.classList.contains('active')) {
        textarea.value = (textarea.value.trim() + '\n' + tagText).trim();
    } else {
        textarea.value = textarea.value.replace(tagText, '').trim();
    }
}

// === STREAK ===
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

// === VIEWS ===
function switchView(view) {
    state.activeView = view;
    
    document.querySelectorAll('.nav-item').forEach(i => {
        i.classList.toggle('active', i.dataset.view === view);
    });
    
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
    
    const aiInput = document.getElementById('aiInputContainer');
    aiInput.style.display = view === 'planning' ? 'block' : 'none';
    
    updateCurrentView();
}

function updateCurrentView() {
    if (state.activeView === 'planning') updatePlanningView();
    if (state.activeView === 'calendar') updateMonthlyCalendar();
    if (state.activeView === 'insights') updateInsightsView();
    if (state.activeView === 'templates') updateTemplatesView();
    if (state.activeView === 'badges') updateBadgesView();
    if (state.activeView === 'profile') updateProfileView();
}

function updateAllViews() {
    updatePlanningView();
    updateMonthlyCalendar();
}

// === AI GENERATION (WITH URGENCY DETECTION) ===
async function handleGenerate() {
    const input = document.getElementById('aiInput').value.trim();
    
    if (!input) {
        showToast('⚠️ Écris quelque chose !');
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    document.getElementById('generateText').textContent = 'Génération...';
    document.getElementById('loadingOverlay').classList.add('show');
    
    await new Promise(r => setTimeout(r, 2000));
    
    const newEvents = await parseInputWithUrgency(input);
    
    if (newEvents.length > 0) {
        newEvents.forEach(e => {
            state.events.push(e);
            state.user.totalEvents++;
            state.user.totalHours += e.duration / 60;
        });
        
        checkWorkloadAndAlert(newEvents);
        updateAllViews();
        saveState();
        
        document.getElementById('aiInput').value = '';
        document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
        
        showToast(`✨ ${newEvents.length} événement(s) ajouté(s) !`);
    } else {
        showToast('⚠️ Impossible de générer. Reformule !');
    }
    
    btn.disabled = false;
    document.getElementById('generateText').textContent = 'Générer mon planning';
    document.getElementById('loadingOverlay').classList.remove('show');
}

async function parseInputWithUrgency(text) {
    const lower = text.toLowerCase();
    const events = [];
    const today = new Date();
    
    // URGENCY DETECTION
    const isUrgent = lower.includes('rien révisé') || lower.includes('pas révisé') || 
                     lower.includes('urgent') || lower.includes('dernière minute');
    const hasExam = lower.includes('examen') || lower.includes('éval') || lower.includes('contrôle');
    const isTired = lower.includes('fatigué') || lower.includes('épuisé');
    
    // Extract subject/topic
    let subject = 'Révision';
    const subjects = ['maths', 'français', 'anglais', 'physique', 'chimie', 'histoire', 'géo', 'svt', 'philo'];
    for (const s of subjects) {
        if (lower.includes(s)) {
            subject = s.charAt(0).toUpperCase() + s.slice(1);
            break;
        }
    }
    
    // Extract dates
    const dates = extractDates(lower, today);
    const examDate = dates[0] || new Date(today.setDate(today.getDate() + 7));
    
    // URGENCY-BASED PLANNING
    if (hasExam && isUrgent) {
        // Intensive study sessions
        const daysUntilExam = Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24));
        const sessionsPerDay = daysUntilExam < 3 ? 3 : 2; // More sessions if very urgent
        const sessionDuration = daysUntilExam < 3 ? 180 : 120; // Longer if urgent
        
        for (let i = 0; i < daysUntilExam; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            
            for (let j = 0; j < sessionsPerDay; j++) {
                const startTimes = ['9:00', '14:00', '17:00'];
                events.push(createEvent({
                    title: `Révision ${subject} (SESSION ${j+1})`,
                    type: 'study',
                    date: date,
                    startTime: startTimes[j],
                    duration: sessionDuration,
                    priority: 'critical'
                }));
            }
        }
        
        // Add exam itself
        events.push(createEvent({
            title: `📝 EXAMEN ${subject}`,
            type: 'study',
            date: examDate,
            startTime: '8:00',
            duration: 180,
            priority: 'critical'
        }));
    } else if (hasExam) {
        // Regular exam preparation
        const daysUntilExam = Math.floor((examDate - new Date()) / (1000 * 60 * 60 * 24));
        
        for (let i = 0; i < daysUntilExam; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i + 1);
            
            events.push(createEvent({
                title: `Révision ${subject}`,
                type: 'study',
                date: date,
                startTime: i % 2 === 0 ? '14:00' : '9:00',
                duration: 120,
                priority: 'high'
            }));
        }
        
        events.push(createEvent({
            title: `📝 Examen ${subject}`,
            type: 'study',
            date: examDate,
            startTime: '8:00',
            duration: 180,
            priority: 'critical'
        }));
    } else if (isTired) {
        // Rest focus
        for (let i = 1; i <= 5; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            
            events.push(createEvent({
                title: 'Temps de repos',
                type: 'personal',
                date: date,
                startTime: '15:00',
                duration: 90,
                priority: 'high'
            }));
        }
    } else {
        // Regular event
        const eventType = detectEventType(lower);
        const duration = extractDuration(lower, eventType);
        const frequency = extractFrequency(lower);
        const priority = lower.includes('important') ? 'high' : 'medium';
        
        const targetDates = dates.length > 0 ? dates : [new Date(new Date().setDate(new Date().getDate() + 1))];
        
        if (frequency > 1) {
            for (let i = 0; i < frequency; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i + 1);
                
                events.push(createEvent({
                    title: eventType.title,
                    type: eventType.type,
                    date: date,
                    startTime: generateTimeSlot(eventType.type, i),
                    duration: duration,
                    priority: priority
                }));
            }
        } else {
            targetDates.forEach(date => {
                events.push(createEvent({
                    title: eventType.title,
                    type: eventType.type,
                    date: date,
                    startTime: generateTimeSlot(eventType.type),
                    duration: duration,
                    priority: priority
                }));
            });
        }
    }
    
    return events;
}

function createEvent(data) {
    const endTime = calculateEndTime(data.startTime, data.duration);
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

function calculateEndTime(start, durationMin) {
    const [h, m] = start.split(':').map(Number);
    const totalMin = h * 60 + m + durationMin;
    return `${Math.floor(totalMin / 60).toString().padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`;
}

// PARSING HELPERS
function detectEventType(text) {
    const types = [
        {keywords: ['ami', 'amis', 'sortie'], type: 'social', title: 'Voir amis'},
        {keywords: ['sport', 'gym'], type: 'personal', title: 'Sport'},
        {keywords: ['travail', 'projet'], type: 'work', title: 'Travail'},
        {keywords: ['repos', 'détente'], type: 'personal', title: 'Temps libre'}
    ];
    
    for (const t of types) {
        if (t.keywords.some(k => text.includes(k))) return t;
    }
    return {type: 'personal', title: 'Activité'};
}

function extractDuration(text, eventType) {
    const hourMatch = text.match(/(\d+)\s*h(eure)?s?/i);
    if (hourMatch) return parseInt(hourMatch[1]) * 60;
    
    const minMatch = text.match(/(\d+)\s*min(ute)?s?/i);
    if (minMatch) return parseInt(minMatch[1]);
    
    const defaults = {study: 120, work: 180, social: 150, personal: 60};
    return defaults[eventType.type] || 60;
}

function extractFrequency(text) {
    const match = text.match(/(\d+)\s*(fois|x)/i);
    if (match) return parseInt(match[1]);
    if (text.includes('tous les jours')) return 7;
    return 1;
}

function extractDates(text, baseDate) {
    const dates = [];
    
    if (text.includes('dans') && text.includes('jour')) {
        const match = text.match(/dans\s*(\d+)\s*jours?/i);
        if (match) {
            const date = new Date(baseDate);
            date.setDate(baseDate.getDate() + parseInt(match[1]));
            dates.push(date);
        }
    }
    
    if (text.includes('weekend') || text.includes('samedi')) {
        const saturday = new Date(baseDate);
        const daysToSat = (6 - baseDate.getDay() + 7) % 7 || 7;
        saturday.setDate(baseDate.getDate() + daysToSat);
        dates.push(saturday);
    }
    
    return dates;
}

function generateTimeSlot(type, index = 0) {
    const slots = {
        study: ['9:00', '14:00', '16:00'],
        work: ['9:00', '13:00', '15:00'],
        social: ['18:00', '19:00', '20:00'],
        personal: ['10:00', '15:00', '17:00']
    };
    return (slots[type] || slots.personal)[index % 3];
}

// WORKLOAD CHECK
function checkWorkloadAndAlert(newEvents) {
    const thisWeek = state.events.filter(e => {
        const d = new Date(e.date);
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay() + 1));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return d >= weekStart && d < weekEnd;
    });
    
    const totalH = thisWeek.reduce((s, e) => s + e.duration / 60, 0);
    
    if (totalH > 60) showWorkloadAlert('overloaded', totalH);
    else if (totalH < 10) showWorkloadAlert('underloaded', totalH);
}

function showWorkloadAlert(type, hours) {
    const modal = document.getElementById('workloadModal');
    document.getElementById('workloadTitle').textContent = type === 'overloaded' ? '⚠️ Planning surchargé' : '💤 Planning léger';
    document.getElementById('workloadMessage').textContent = type === 'overloaded' ? 
        `${Math.round(hours)}h cette semaine. C'est beaucoup ! Ajuster ?` :
        `${Math.round(hours)}h cette semaine. Ajouter plus d'activités ?`;
    
    modal.classList.add('show');
    
    document.getElementById('workloadKeep').onclick = () => modal.classList.remove('show');
    document.getElementById('workloadAdjust').onclick = () => {
        if (type === 'overloaded') {
            state.events = state.events.filter(e => e.priority !== 'low');
        } else {
            for (let i = 1; i <= 3; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                state.events.push(createEvent({
                    title: 'Temps libre',
                    type: 'personal',
                    date: date,
                    startTime: '17:00',
                    duration: 60,
                    priority: 'low'
                }));
            }
        }
        updateAllViews();
        saveState();
        modal.classList.remove('show');
        showToast('✅ Planning ajusté !');
    };
}

// === CALENDAR SYNC ===
async function syncCalendar(platform) {
    const modal = document.getElementById('syncModal');
    modal.classList.add('show');
    
    await new Promise(r => setTimeout(r, 2000));
    
    state.syncedCalendars[platform] = true;
    
    const btn = document.querySelector(`[data-platform="${platform}"]`);
    const status = btn.querySelector('.sync-status');
    status.textContent = '✓';
    status.classList.add('synced');
    
    saveState();
    modal.classList.remove('show');
    showToast('✅ Synchronisé !');
}

// === PLANNING VIEW ===
function updatePlanningView() {
    const grid = document.getElementById('planningGrid');
    
    if (state.events.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><h3>Planning vide</h3><p>Utilise l\'IA pour planifier</p></div>';
        document.getElementById('todayEvents').innerHTML = '<p class="empty-text">Rien aujourd\'hui</p>';
        document.getElementById('upcomingEvents').innerHTML = '<p class="empty-text">Rien à venir</p>';
        return;
    }
    
    generateWeekGrid(grid);
    updateEventsSections();
    updatePeriodLabel();
}

function generateWeekGrid(container) {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1 + (state.currentWeekOffset * 7));
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    let html = '<div class="week-grid">';
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(weekStart);
        currentDay.setDate(weekStart.getDate() + i);
        const isToday = currentDay.toDateString() === today.toDateString();
        
        const dayEvents = state.events.filter(e => {
            return new Date(e.date).toDateString() === currentDay.toDateString();
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        html += `<div class="day-column ${isToday ? 'today' : ''}">
            <div class="day-header">
                <div class="day-name">${days[i]}</div>
                <div class="day-date">${currentDay.getDate()}</div>
            </div>
            <div class="day-events">${
                dayEvents.length === 0 ? '<p class="empty-text" style="font-size:0.75rem;padding:1rem 0;">Libre</p>' :
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
    container.innerHTML = html;
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
    
    document.getElementById('todayEvents').innerHTML = todayEvents.length === 0 ? '<p class="empty-text">Rien aujourd\'hui</p>' :
        todayEvents.map(renderEvent).join('');
    
    document.getElementById('upcomingEvents').innerHTML = upcoming.length === 0 ? '<p class="empty-text">Rien à venir</p>' :
        upcoming.map(renderEvent).join('');
}

function renderEvent(e) {
    const emoji = {critical: '🔴', high: '🟠', medium: '🟡', low: '🟢'}[e.priority] || '🟡';
    const d = new Date(e.date).toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long'});
    
    return `<div class="event-item">
        <div class="event-item-header">
            <span class="event-item-title">${e.title}</span>
            <span class="event-item-priority">${emoji}</span>
        </div>
        <div class="event-item-time">📅 ${d} • ⏰ ${e.startTime} - ${e.endTime}</div>
    </div>`;
}

function updatePeriodLabel() {
    const label = document.getElementById('periodLabel');
    let text = 'Cette semaine';
    if (state.currentWeekOffset === 1) text = 'Semaine prochaine';
    else if (state.currentWeekOffset === -1) text = 'Semaine dernière';
    else if (state.currentWeekOffset !== 0) text = `Semaine ${state.currentWeekOffset > 0 ? '+' : ''}${state.currentWeekOffset}`;
    label.textContent = text;
}

function changeWeek(offset) {
    state.currentWeekOffset += offset;
    updatePlanningView();
}

// === MONTHLY CALENDAR ===
function updateMonthlyCalendar() {
    const container = document.getElementById('monthlyCalendar');
    const today = new Date();
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + state.currentMonthOffset, 1);
    
    const monthLabel = document.getElementById('calMonthLabel');
    monthLabel.textContent = targetMonth.toLocaleDateString('fr-FR', {month: 'long', year: 'numeric'});
    
    const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    let html = '<div class="calendar-weekdays">';
    ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].forEach(d => {
        html += `<div class="weekday-label">${d}</div>`;
    });
    html += '</div><div class="calendar-days">';
    
    for (let i = 0; i < startDay; i++) {
        html += '<div class="calendar-day-cell other-month"></div>';
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
        const isToday = date.toDateString() === today.toDateString();
        
        const dayEvents = state.events.filter(e => {
            return new Date(e.date).toDateString() === date.toDateString();
        }).slice(0, 3);
        
        html += `<div class="calendar-day-cell ${isToday ? 'today' : ''}">
            <div class="day-number">${day}</div>
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
    state.currentMonthOffset += offset;
    updateMonthlyCalendar();
}

// === INSIGHTS ===
function updateInsightsView() {
    const container = document.getElementById('insightsContent');
    
    const totalEvents = state.events.length;
    const totalHours = state.events.reduce((s, e) => s + e.duration / 60, 0);
    const studyEvents = state.events.filter(e => e.type === 'study');
    const workEvents = state.events.filter(e => e.type === 'work');
    const socialEvents = state.events.filter(e => e.type === 'social');
    
    html = `
        <div class="insight-card">
            <h3>📊 Vue d'ensemble</h3>
            <p style="font-size: 2rem; font-weight: 700; color: var(--primary);">${totalEvents}</p>
            <p>Événements planifiés</p>
            <p style="margin-top: 1rem; font-size: 1.5rem; font-weight: 600;">${Math.round(totalHours)}h</p>
            <p style="color: var(--text-muted);">Total d'heures</p>
        </div>
        
        <div class="insight-card">
            <h3>📚 Répartition</h3>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
                <div style="display: flex; justify-content: space-between;">
                    <span>Études</span>
                    <strong>${studyEvents.length} (${Math.round(studyEvents.reduce((s,e) => s + e.duration/60, 0))}h)</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Travail</span>
                    <strong>${workEvents.length} (${Math.round(workEvents.reduce((s,e) => s + e.duration/60, 0))}h)</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Social</span>
                    <strong>${socialEvents.length} (${Math.round(socialEvents.reduce((s,e) => s + e.duration/60, 0))}h)</strong>
                </div>
            </div>
        </div>
        
        <div class="insight-card">
            <h3>⚡ Productivité</h3>
            <p style="margin-top: 1rem;">Tes événements les plus fréquents sont liés aux <strong>études</strong>.</p>
            <p style="margin-top: 0.5rem; color: var(--text-muted);">Continue comme ça !</p>
        </div>
    `;
    
    container.innerHTML = html;
}

// === TEMPLATES ===
function updateTemplatesView() {
    const container = document.getElementById('templatesContent');
    
    html = `
        <div class="insight-card">
            <h3>🎓 Template actif</h3>
            <p style="font-size: 1.2rem; margin-top: 1rem;">
                ${state.user.templateType === 'student' ? '🎓 Étudiant' : 
                  state.user.templateType === 'worker' ? '💼 Travailleur' : '✨ Personnalisé'}
            </p>
            ${state.user.schedule.length > 0 ? `
                <h4 style="margin-top: 1.5rem; font-size: 0.95rem;">Emploi du temps :</h4>
                <div style="margin-top: 0.5rem; font-size: 0.85rem;">
                    ${state.user.schedule.map(s => `
                        <div style="padding: 0.5rem; background: var(--bg-hover); border-radius: 6px; margin-bottom: 0.5rem;">
                            ${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][s.day]} ${s.startTime} - ${s.endTime} : ${s.subject}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = html;
}

// === BADGES ===
function updateBadgesView() {
    document.getElementById('streakDays').textContent = state.streak;
    
    const badges = [
        {icon: '⚡', name: 'Débutant', desc: '1er événement', unlocked: state.user.totalEvents >= 1},
        {icon: '🔥', name: '3 jours', desc: 'Streak 3j', unlocked: state.streak >= 3},
        {icon: '✨', name: 'Semaine', desc: 'Streak 7j', unlocked: state.streak >= 7},
        {icon: '💎', name: 'Champion', desc: 'Streak 30j', unlocked: state.streak >= 30},
    ];
    
    document.getElementById('badgesGrid').innerHTML = badges.map(b => `
        <div class="badge ${b.unlocked ? '' : 'locked'}">
            <div class="badge-icon">${b.icon}</div>
            <div class="badge-name">${b.name}</div>
            <div class="badge-desc">${b.desc}</div>
        </div>
    `).join('');
}

// === PROFILE ===
function updateProfileView() {
    document.getElementById('profileName').textContent = state.user.name;
    document.getElementById('profileEmail').textContent = state.user.email || '';
    document.getElementById('totalEvents').textContent = state.user.totalEvents;
    document.getElementById('profileStreak').textContent = state.streak;
    document.getElementById('totalHours').textContent = Math.round(state.user.totalHours);
    
    document.getElementById('profileNameInput').value = state.user.name;
    document.getElementById('profileEmailInput').value = state.user.email;
    
    if (state.user.avatar) {
        document.getElementById('profileAvatar').src = state.user.avatar;
        document.getElementById('profileAvatar').style.display = 'block';
        document.getElementById('profileAvatarFallback').style.display = 'none';
    }
}

function saveProfile() {
    state.user.name = document.getElementById('profileNameInput').value;
    state.user.email = document.getElementById('profileEmailInput').value;
    saveState();
    updateHeaderUI();
    showToast('✅ Profil sauvegardé !');
}

function handleProfileAvatar(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.user.avatar = e.target.result;
            saveState();
            updateHeaderUI();
            updateProfileView();
        };
        reader.readAsDataURL(file);
    }
}

function updateHeaderUI() {
    document.getElementById('headerStreak').textContent = state.streak;
    if (state.user.avatar) {
        document.getElementById('headerAvatar').src = state.user.avatar;
        document.getElementById('headerAvatar').style.display = 'block';
        document.getElementById('headerAvatarFallback').style.display = 'none';
    }
}

// === UTILS ===
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMessage').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// === STORAGE ===
function saveState() {
    try {
        localStorage.setItem('chronoflow_v4', JSON.stringify({
            user: state.user,
            events: state.events,
            theme: state.theme,
            streak: state.streak,
            syncedCalendars: state.syncedCalendars
        }));
    } catch (e) {console.error(e);}
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
            state.syncedCalendars = data.syncedCalendars || state.syncedCalendars;
        }
    } catch (e) {console.error(e);}
}

window.ChronoFlow = {state, saveState};
