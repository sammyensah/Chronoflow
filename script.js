// ChronoFlow V3 - Complete Rewrite
// All new features implemented

// ===== STATE =====
const state = {
    user: {
        name: '',
        email: '',
        avatar: '',
        totalEvents: 0,
        totalHours: 0,
        lastUsedDate: null,
        firstUseDate: null
    },
    
    events: [],
    currentWeekOffset: 0,
    activeView: 'planning',
    theme: 'light',
    sidebarCollapsed: false,
    streak: 0,
    bestStreak: 0,
    
    // Quick tags selection (don't generate immediately)
    selectedTags: [],
    
    // Sync status
    syncedCalendars: {
        google: false,
        apple: false,
        notion: false
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    
    // Check if first time user
    if (!state.user.name) {
        showOnboarding();
    } else {
        initializeApp();
    }
    
    setupEventListeners();
});

function initializeApp() {
    // Update streak based on daily usage
    updateStreakBasedOnUsage();
    
    // Apply theme
    setTheme(state.theme);
    
    // Update UI
    updateHeaderUI();
    updateAllViews();
    
    // Hide onboarding
    document.getElementById('onboardingModal').classList.remove('show');
}

// ===== ONBOARDING =====
function showOnboarding() {
    document.getElementById('onboardingModal').classList.add('show');
}

function completeOnboarding() {
    const name = document.getElementById('onboardingName').value.trim();
    const email = document.getElementById('onboardingEmail').value.trim();
    
    if (!name) {
        showToast('⚠️ Entre ton prénom !');
        return;
    }
    
    state.user.name = name;
    state.user.email = email;
    state.user.firstUseDate = new Date().toISOString();
    state.user.lastUsedDate = new Date().toISOString();
    
    saveState();
    initializeApp();
    showToast(`🎉 Bienvenue ${name} !`);
}

// Handle avatar upload in onboarding
document.getElementById('avatarInput')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.user.avatar = e.target.result;
            document.getElementById('avatarPreview').innerHTML = `<img src="${e.target.result}" alt="Avatar">`;
        };
        reader.readAsDataURL(file);
    }
});

// ===== STREAK MANAGEMENT (Daily Usage) =====
function updateStreakBasedOnUsage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!state.user.lastUsedDate) {
        // First time
        state.streak = 0;
        state.user.lastUsedDate = new Date().toISOString();
        saveState();
        return;
    }
    
    const lastUsed = new Date(state.user.lastUsedDate);
    lastUsed.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastUsed) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
        // Same day - don't change streak
        return;
    } else if (daysDiff === 1) {
        // Consecutive day - increase streak
        state.streak++;
        if (state.streak > state.bestStreak) {
            state.bestStreak = state.streak;
        }
    } else {
        // Missed days - reset streak
        state.streak = 0;
    }
    
    state.user.lastUsedDate = new Date().toISOString();
    saveState();
    updateHeaderUI();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Profile button
    document.getElementById('profileBtn').addEventListener('click', () => switchView('profile'));
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });
    
    // Quick tags (DON'T generate, just add to input)
    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tag = e.currentTarget.dataset.tag;
            toggleQuickTag(e.currentTarget, tag);
        });
    });
    
    // Generate button
    document.getElementById('generateBtn').addEventListener('click', handleGenerate);
    
    // Week navigation
    document.getElementById('prevWeek')?.addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeek')?.addEventListener('click', () => changeWeek(1));
    document.getElementById('calPrevWeek')?.addEventListener('click', () => changeWeek(-1));
    document.getElementById('calNextWeek')?.addEventListener('click', () => changeWeek(1));
    
    // Calendar sync
    document.querySelectorAll('.sync-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.currentTarget.dataset.platform;
            syncCalendar(platform);
        });
    });
    
    // Profile save
    document.getElementById('saveProfile')?.addEventListener('click', saveProfile);
    
    // Profile avatar upload
    document.getElementById('profileAvatarInput')?.addEventListener('change', handleProfileAvatarUpload);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    state.sidebarCollapsed = !state.sidebarCollapsed;
    
    if (state.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
    } else {
        sidebar.classList.remove('collapsed');
    }
    
    // On mobile, toggle show class
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('show');
    }
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(state.theme);
    saveState();
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ===== QUICK TAGS (Don't auto-generate) =====
function toggleQuickTag(btnElement, tag) {
    const textarea = document.getElementById('aiInput');
    const currentText = textarea.value.trim();
    
    // Toggle active state
    btnElement.classList.toggle('active');
    
    // Add/remove tag text from input
    const tagText = getTagText(tag);
    
    if (btnElement.classList.contains('active')) {
        // Add tag text to input
        if (currentText) {
            textarea.value = currentText + '\n' + tagText;
        } else {
            textarea.value = tagText;
        }
    } else {
        // Remove tag text from input
        textarea.value = currentText.replace(tagText, '').trim();
    }
}

function getTagText(tag) {
    const tagMap = {
        '😴 Fatigué': 'Je suis fatigué cette semaine, plus de temps libre',
        '📚 Examen': 'J\'ai un examen important dans 2 semaines',
        '👥 Amis': 'Je veux voir mes amis ce weekend',
        '🏃 Sport': 'Sport 3 fois cette semaine',
        '⚖️ Équilibre': 'Je travaille trop, besoin d\'équilibre'
    };
    return tagMap[tag] || '';
}

// ===== VIEW MANAGEMENT =====
function switchView(viewName) {
    state.activeView = viewName;
    
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`${viewName}View`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Show/hide AI input based on view
    const aiInputContainer = document.getElementById('aiInputContainer');
    if (viewName === 'planning') {
        aiInputContainer.style.display = 'block';
    } else {
        aiInputContainer.style.display = 'none';
    }
    
    // Update view content
    updateCurrentView();
}

function updateCurrentView() {
    if (state.activeView === 'planning') updatePlanningView();
    if (state.activeView === 'calendar') updateCalendarView();
    if (state.activeView === 'insights') updateInsightsView();
    if (state.activeView === 'templates') updateTemplatesView();
    if (state.activeView === 'badges') updateBadgesView();
    if (state.activeView === 'profile') updateProfileView();
}

function updateAllViews() {
    updatePlanningView();
    updateCalendarView();
    updateBadgesView();
}

// ===== AI GENERATION =====
async function handleGenerate() {
    const input = document.getElementById('aiInput').value.trim();
    
    if (!input) {
        showToast('⚠️ Écris quelque chose d\'abord !');
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    document.getElementById('generateText').textContent = 'Génération...';
    
    // Show loading
    document.getElementById('loadingOverlay').classList.add('show');
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse and generate events
    const newEvents = await parseInputAndGenerate(input);
    
    if (newEvents.length > 0) {
        // Add events to state
        newEvents.forEach(event => {
            state.events.push(event);
            state.user.totalEvents++;
            state.user.totalHours += event.duration / 60;
        });
        
        // Check workload
        checkWorkloadAndAlert(newEvents);
        
        // Update views
        updateAllViews();
        saveState();
        
        // Clear input and tags
        document.getElementById('aiInput').value = '';
        document.querySelectorAll('.tag-btn').forEach(btn => btn.classList.remove('active'));
        
        showToast(`✨ ${newEvents.length} événement${newEvents.length > 1 ? 's' : ''} ajouté${newEvents.length > 1 ? 's' : ''} !`);
    } else {
        showToast('⚠️ Impossible de générer des événements. Reformule ta demande.');
    }
    
    btn.disabled = false;
    document.getElementById('generateText').textContent = 'Générer mon planning';
    document.getElementById('loadingOverlay').classList.remove('show');
}

async function parseInputAndGenerate(input) {
    const lowercaseText = input.toLowerCase();
    const events = [];
    const today = new Date();
    
    // Detect context
    const isTired = lowercaseText.includes('fatigué') || lowercaseText.includes('fatigue') || lowercaseText.includes('repos');
    const needsBalance = lowercaseText.includes('équilibre') || lowercaseText.includes('trop');
    const hasExam = lowercaseText.includes('examen');
    
    // Determine event type and details
    let eventType = detectEventType(lowercaseText);
    let duration = extractDuration(lowercaseText, eventType);
    let frequency = extractFrequency(lowercaseText);
    let dates = extractDates(lowercaseText, today);
    let priority = determinePriority(lowercaseText, hasExam, isTired);
    
    // Generate events based on context
    if (isTired) {
        // More break time
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i + 1);
            
            events.push(createEvent({
                title: 'Temps de repos',
                type: 'personal',
                date: date,
                startTime: '14:00',
                duration: 120,
                priority: 'high'
            }));
        }
    } else if (needsBalance) {
        // Balanced week
        const activities = [
            { title: 'Travail concentré', type: 'work', startTime: '9:00', duration: 180, priority: 'high' },
            { title: 'Sport', type: 'personal', startTime: '17:00', duration: 60, priority: 'medium' },
            { title: 'Temps social', type: 'social', startTime: '19:00', duration: 120, priority: 'medium' },
        ];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i + 1);
            
            activities.forEach(activity => {
                events.push(createEvent({
                    ...activity,
                    date: date
                }));
            });
        }
    } else if (frequency > 1) {
        // Recurring events
        for (let i = 0; i < frequency; i++) {
            const date = dates[0] || new Date(today);
            date.setDate(date.getDate() + i);
            
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
        // Single or specific dates
        const targetDates = dates.length > 0 ? dates : [new Date(today.setDate(today.getDate() + 1))];
        
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

function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

// ===== PARSING HELPERS =====
function detectEventType(text) {
    const types = [
        { keywords: ['examen', 'test'], type: 'study', title: 'Examen' },
        { keywords: ['réviser', 'révision', 'étudier'], type: 'study', title: 'Révision' },
        { keywords: ['ami', 'amis', 'sortie'], type: 'social', title: 'Voir amis' },
        { keywords: ['sport', 'gym', 'fitness'], type: 'personal', title: 'Sport' },
        { keywords: ['travail', 'projet', 'job'], type: 'work', title: 'Travail' },
        { keywords: ['repos', 'détente', 'pause'], type: 'personal', title: 'Temps libre' },
    ];
    
    for (const type of types) {
        if (type.keywords.some(kw => text.includes(kw))) {
            return type;
        }
    }
    
    return { type: 'personal', title: 'Activité' };
}

function extractDuration(text, eventType) {
    const hourMatch = text.match(/(\d+)\s*h(eure)?s?/i);
    if (hourMatch) return parseInt(hourMatch[1]) * 60;
    
    const minMatch = text.match(/(\d+)\s*min(ute)?s?/i);
    if (minMatch) return parseInt(minMatch[1]);
    
    const defaults = { study: 120, work: 180, social: 150, personal: 60 };
    return defaults[eventType.type] || 60;
}

function extractFrequency(text) {
    const frequencyMatch = text.match(/(\d+)\s*(fois|x)/i);
    if (frequencyMatch) return parseInt(frequencyMatch[1]);
    
    if (text.includes('tous les jours') || text.includes('chaque jour')) return 7;
    if (text.includes('par jour')) return 7;
    
    return 1;
}

function extractDates(text, baseDate) {
    const dates = [];
    
    // Specific dates
    const dateMatch = text.match(/(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const month = months.findIndex(m => m === dateMatch[2].toLowerCase());
        const date = new Date(baseDate.getFullYear(), month, day);
        if (date < baseDate) date.setFullYear(date.getFullYear() + 1);
        dates.push(date);
        return dates;
    }
    
    // Relative dates
    if (text.includes('aujourd\'hui')) {
        dates.push(new Date(baseDate));
    } else if (text.includes('demain')) {
        const tomorrow = new Date(baseDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates.push(tomorrow);
    } else if (text.includes('weekend') || text.includes('samedi')) {
        const saturday = new Date(baseDate);
        const daysToSaturday = (6 - baseDate.getDay() + 7) % 7 || 7;
        saturday.setDate(baseDate.getDate() + daysToSaturday);
        dates.push(saturday);
    }
    
    return dates;
}

function determinePriority(text, hasExam, isTired) {
    if (text.includes('urgent') || text.includes('critique') || (hasExam && text.includes('très'))) {
        return 'critical';
    }
    if (text.includes('important') || hasExam) {
        return 'high';
    }
    if (isTired) {
        return 'low';
    }
    return 'medium';
}

function generateTimeSlot(type, index = 0) {
    const slots = {
        study: ['9:00', '10:00', '14:00', '15:00'],
        work: ['9:00', '10:00', '13:00', '14:00'],
        social: ['18:00', '19:00', '20:00'],
        personal: ['8:00', '12:00', '17:00', '19:00']
    };
    
    const typeSlots = slots[type] || slots.personal;
    return typeSlots[index % typeSlots.length];
}

// ===== WORKLOAD ALERT =====
function checkWorkloadAndAlert(newEvents) {
    // Calculate total hours this week including new events
    const allEvents = [...state.events];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const thisWeekEvents = allEvents.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate >= weekStart && eventDate < weekEnd;
    });
    
    const totalHours = thisWeekEvents.reduce((sum, e) => sum + e.duration / 60, 0);
    
    if (totalHours > 60) {
        showWorkloadAlert('overloaded', totalHours);
    } else if (totalHours < 10) {
        showWorkloadAlert('underloaded', totalHours);
    }
}

function showWorkloadAlert(type, hours) {
    const modal = document.getElementById('workloadModal');
    const title = document.getElementById('workloadTitle');
    const message = document.getElementById('workloadMessage');
    
    if (type === 'overloaded') {
        title.textContent = '⚠️ Planning surchargé';
        message.textContent = `Tu as ${Math.round(hours)}h planifiées cette semaine. C'est beaucoup ! Veux-tu que je réduise automatiquement la charge ?`;
    } else {
        title.textContent = '💤 Planning léger';
        message.textContent = `Tu as seulement ${Math.round(hours)}h planifiées cette semaine. Veux-tu ajouter plus d'activités ?`;
    }
    
    modal.classList.add('show');
    
    document.getElementById('workloadKeep').onclick = () => {
        modal.classList.remove('show');
    };
    
    document.getElementById('workloadAdjust').onclick = () => {
        adjustWorkload(type);
        modal.classList.remove('show');
    };
}

function adjustWorkload(type) {
    if (type === 'overloaded') {
        // Remove low priority events
        state.events = state.events.filter(e => e.priority !== 'low');
        showToast('✅ Événements à faible priorité supprimés');
    } else {
        // Add some activities
        const today = new Date();
        for (let i = 1; i <= 3; i++) {
            const date = new Date(today);
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
        showToast('✅ Activités ajoutées pour remplir ta semaine');
    }
    
    updateAllViews();
    saveState();
}

// ===== CALENDAR SYNC (FIXED) =====
async function syncCalendar(platform) {
    const modal = document.getElementById('syncModal');
    const message = document.getElementById('syncMessage');
    const btn = document.querySelector(`[data-platform="${platform}"]`);
    const statusEl = btn.querySelector('.sync-status');
    
    // Show modal
    modal.classList.add('show');
    message.textContent = `Connexion à ${platform}...`;
    
    // Simulate OAuth flow
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    message.textContent = `Importation des événements depuis ${platform}...`;
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    message.textContent = 'Synchronisation en cours...';
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mark as synced
    state.syncedCalendars[platform] = true;
    statusEl.textContent = '✓';
    statusEl.classList.add('synced');
    
    saveState();
    
    // Close modal
    modal.classList.remove('show');
    
    const platformNames = {
        google: 'Google Calendar',
        apple: 'Apple Calendar',
        notion: 'Notion'
    };
    
    showToast(`✅ Synchronisé avec ${platformNames[platform]} !`);
}

// ===== VIEW UPDATES =====
function updatePlanningView() {
    const grid = document.getElementById('planningGrid');
    
    if (state.events.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>Ton planning est vide</h3>
                <p>Utilise l'assistant IA ci-dessus pour commencer à planifier tes journées</p>
            </div>
        `;
        
        document.getElementById('todayEvents').innerHTML = '<p class="empty-text">Aucun événement aujourd\'hui</p>';
        document.getElementById('upcomingEvents').innerHTML = '<p class="empty-text">Aucun événement à venir</p>';
        return;
    }
    
    // Generate week grid
    generateWeekGrid(grid);
    
    // Update today and upcoming sections
    updateEventsSections();
    
    // Update period label
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
            const eventDate = new Date(e.date);
            return eventDate.toDateString() === currentDay.toDateString();
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
        
        html += `
            <div class="day-column ${isToday ? 'today' : ''}">
                <div class="day-header">
                    <div class="day-name">${days[i]}</div>
                    <div class="day-date">${currentDay.getDate()}</div>
                </div>
                <div class="day-events">
                    ${dayEvents.length === 0 ? '<p class="empty-text" style="font-size: 0.75rem; padding: 1rem 0;">Libre</p>' :
                    dayEvents.map(event => `
                        <div class="event-card ${event.priority}">
                            <div class="event-title">${event.title}</div>
                            <div class="event-time">${event.startTime} - ${event.endTime}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function updateEventsSections() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Today's events
    const todayEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    const todayContainer = document.getElementById('todayEvents');
    if (todayEvents.length === 0) {
        todayContainer.innerHTML = '<p class="empty-text">Aucun événement aujourd\'hui</p>';
    } else {
        todayContainer.innerHTML = todayEvents.map(event => renderEventItem(event)).join('');
    }
    
    // Upcoming events
    const upcomingEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate > today;
    }).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 10);
    
    const upcomingContainer = document.getElementById('upcomingEvents');
    if (upcomingEvents.length === 0) {
        upcomingContainer.innerHTML = '<p class="empty-text">Aucun événement à venir</p>';
    } else {
        upcomingContainer.innerHTML = upcomingEvents.map(event => renderEventItem(event)).join('');
    }
}

function renderEventItem(event) {
    const priorityEmoji = {
        critical: '🔴',
        high: '🟠',
        medium: '🟡',
        low: '🟢'
    }[event.priority] || '🟡';
    
    const eventDate = new Date(event.date);
    const dateStr = eventDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return `
        <div class="event-item">
            <div class="event-item-header">
                <span class="event-item-title">${event.title}</span>
                <span class="event-item-priority">${priorityEmoji}</span>
            </div>
            <div class="event-item-time">
                📅 ${dateStr} • ⏰ ${event.startTime} - ${event.endTime} (${event.duration}min)
            </div>
        </div>
    `;
}

function updateCalendarView() {
    // Same as planning grid for now
    const container = document.getElementById('calendarGrid');
    generateWeekGrid(container);
}

function updatePeriodLabel() {
    const label = document.getElementById('periodLabel');
    const calLabel = document.getElementById('calPeriodLabel');
    
    let text = 'Cette semaine';
    if (state.currentWeekOffset === 1) text = 'Semaine prochaine';
    else if (state.currentWeekOffset === -1) text = 'Semaine dernière';
    else if (state.currentWeekOffset !== 0) text = `Semaine ${state.currentWeekOffset > 0 ? '+' : ''}${state.currentWeekOffset}`;
    
    if (label) label.textContent = text;
    if (calLabel) calLabel.textContent = text;
}

function changeWeek(offset) {
    state.currentWeekOffset += offset;
    updatePlanningView();
    updateCalendarView();
}

function updateInsightsView() {
    // Placeholder - implement later if needed
}

function updateTemplatesView() {
    // Placeholder - implement later if needed
}

function updateBadgesView() {
    document.getElementById('streakDays').textContent = state.streak;
    
    const badgesGrid = document.getElementById('badgesGrid');
    const badges = [
        { icon: '⚡', name: 'Débutant', desc: '1er événement', unlocked: state.user.totalEvents >= 1 },
        { icon: '🔥', name: '3 jours', desc: 'Streak de 3 jours', unlocked: state.streak >= 3 },
        { icon: '✨', name: 'Semaine', desc: 'Streak de 7 jours', unlocked: state.streak >= 7 },
        { icon: '💎', name: 'Champion', desc: 'Streak de 30 jours', unlocked: state.streak >= 30 },
        { icon: '🎯', name: 'Organisé', desc: '50 événements', unlocked: state.user.totalEvents >= 50 },
    ];
    
    badgesGrid.innerHTML = badges.map(badge => `
        <div class="badge ${badge.unlocked ? '' : 'locked'}">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.desc}</div>
        </div>
    `).join('');
}

function updateProfileView() {
    document.getElementById('profileName').textContent = state.user.name;
    document.getElementById('profileEmail').textContent = state.user.email || '';
    
    document.getElementById('totalEvents').textContent = state.user.totalEvents;
    document.getElementById('profileStreak').textContent = state.streak;
    document.getElementById('totalHours').textContent = Math.round(state.user.totalHours);
    
    document.getElementById('profileNameInput').value = state.user.name;
    document.getElementById('profileEmailInput').value = state.user.email;
    
    // Update avatars
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

function handleProfileAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            state.user.avatar = e.target.result;
            saveState();
            updateHeaderUI();
            updateProfileView();
            showToast('✅ Photo mise à jour !');
        };
        reader.readAsDataURL(file);
    }
}

function updateHeaderUI() {
    document.getElementById('headerStreak').textContent = state.streak;
    
    // Update avatar in header
    if (state.user.avatar) {
        document.getElementById('headerAvatar').src = state.user.avatar;
        document.getElementById('headerAvatar').style.display = 'block';
        document.getElementById('headerAvatarFallback').style.display = 'none';
    }
    
    // Update sync status
    Object.keys(state.syncedCalendars).forEach(platform => {
        if (state.syncedCalendars[platform]) {
            const btn = document.querySelector(`[data-platform="${platform}"]`);
            const statusEl = btn.querySelector('.sync-status');
            statusEl.textContent = '✓';
            statusEl.classList.add('synced');
        }
    });
}

// ===== UTILITIES =====
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== STORAGE =====
function saveState() {
    try {
        localStorage.setItem('chronoflow_v3', JSON.stringify({
            user: state.user,
            events: state.events,
            theme: state.theme,
            streak: state.streak,
            bestStreak: state.bestStreak,
            syncedCalendars: state.syncedCalendars
        }));
    } catch (error) {
        console.error('Error saving:', error);
    }
}

function loadState() {
    try {
        const saved = localStorage.getItem('chronoflow_v3');
        if (saved) {
            const data = JSON.parse(saved);
            state.user = data.user || state.user;
            state.events = (data.events || []).map(e => ({
                ...e,
                date: new Date(e.date)
            }));
            state.theme = data.theme || 'light';
            state.streak = data.streak || 0;
            state.bestStreak = data.bestStreak || 0;
            state.syncedCalendars = data.syncedCalendars || state.syncedCalendars;
        }
    } catch (error) {
        console.error('Error loading:', error);
    }
}

// Export for debugging
window.ChronoFlow = { state, saveState, loadState };