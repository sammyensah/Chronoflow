// ChronoFlow - AI Planning Assistant
// State Management
const state = {
    currentWeekOffset: 0,
    events: [],
    streak: 0,
    balanceScore: 78,
    productivity: {
        bestTime: "matin",
        avgWorkHours: 6.5,
        lastSocialEvent: 8
    },
    activeTemplate: "none",
    badges: [],
    activityHeatmap: []
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    generateCalendar();
    generateInsights();
    generateBadges();
    generateHeatmap();
    loadSampleData();
});

// Initialize
function initializeApp() {
    // Set initial streak
    state.streak = Math.floor(Math.random() * 15) + 1;
    document.getElementById('streak').textContent = state.streak;
    document.getElementById('streakDays').textContent = state.streak;
    
    // Generate random balance score
    state.balanceScore = Math.floor(Math.random() * 30) + 65;
    document.getElementById('balanceScore').textContent = state.balanceScore;
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => switchView(e.target.closest('.nav-item').dataset.view));
    });
    
    // AI Input
    document.getElementById('sendBtn').addEventListener('click', handleAIInput);
    document.getElementById('aiInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) handleAIInput();
    });
    
    // Quick actions
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.target.dataset.text;
            document.getElementById('aiInput').value = text;
            handleAIInput();
        });
    });
    
    // Calendar controls
    document.getElementById('prevWeek').addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeek').addEventListener('click', () => changeWeek(1));
    
    // Template selection
    document.getElementById('templateSelect').addEventListener('change', (e) => {
        activateTemplate(e.target.value);
    });
    
    // Template cards
    document.querySelectorAll('.template-activate').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const template = e.target.closest('.template-card').dataset.template;
            activateTemplate(template);
            document.getElementById('templateSelect').value = template;
        });
    });
    
    // Sync buttons (simulation)
    document.querySelectorAll('.sync-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const platform = e.target.classList.contains('google') ? 'Google Calendar' :
                           e.target.classList.contains('apple') ? 'Apple Calendar' : 'Notion';
            showToast(`Synchronisation avec ${platform} réussie ! ✓`);
        });
    });
}

// View Switching
function switchView(viewName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(`${viewName}View`).classList.add('active');
}

// AI Input Handler with NLP Simulation
function handleAIInput() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) return;
    
    // Parse input with AI simulation
    const parsedEvent = parseNaturalLanguage(input);
    
    if (parsedEvent) {
        // Add event
        state.events.push(parsedEvent);
        
        // Update calendar
        generateCalendar();
        updateEventsList();
        
        // Show success
        showToast(`✨ Événement ajouté : ${parsedEvent.title}`);
        
        // Clear input
        document.getElementById('aiInput').value = '';
        
        // Update streak (50% chance)
        if (Math.random() > 0.5) {
            state.streak++;
            document.getElementById('streak').textContent = state.streak;
            document.getElementById('streakDays').textContent = state.streak;
        }
    } else {
        showToast('⚠️ Je n\'ai pas bien compris. Peux-tu reformuler ?');
    }
}

// Natural Language Parser (Simulated AI)
function parseNaturalLanguage(text) {
    const lowercaseText = text.toLowerCase();
    
    // Extract event type
    let type = 'personal';
    let title = text;
    
    if (lowercaseText.includes('examen') || lowercaseText.includes('réviser') || 
        lowercaseText.includes('étudier') || lowercaseText.includes('cours')) {
        type = 'study';
        title = lowercaseText.includes('examen') ? 'Examen' : 'Révision';
    } else if (lowercaseText.includes('ami') || lowercaseText.includes('sortie') || 
               lowercaseText.includes('voir')) {
        type = 'social';
        title = 'Voir amis';
    } else if (lowercaseText.includes('sport') || lowercaseText.includes('gym')) {
        type = 'personal';
        title = 'Sport';
    } else if (lowercaseText.includes('travail') || lowercaseText.includes('projet') || 
               lowercaseText.includes('réunion')) {
        type = 'work';
        title = 'Travail';
    }
    
    // Extract date
    const date = extractDate(lowercaseText);
    
    // Extract duration
    const duration = extractDuration(lowercaseText);
    
    // Extract priority
    const priority = lowercaseText.includes('important') || lowercaseText.includes('urgent') ? 
                    'high' : 'normal';
    
    return {
        id: Date.now(),
        title: title,
        type: type,
        date: date,
        duration: duration,
        priority: priority,
        time: generateTimeSlot(type)
    };
}

// Extract date from text
function extractDate(text) {
    const today = new Date();
    
    // Check for specific dates
    const dateMatch = text.match(/(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|fév|mar|avr|mai|jun|jul|aoû|sep|oct|nov|déc)/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                           'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const month = monthNames.findIndex(m => m.startsWith(dateMatch[2].toLowerCase().substring(0, 3)));
        const date = new Date(today.getFullYear(), month, day);
        return date;
    }
    
    // Relative dates
    if (text.includes('aujourd\'hui')) {
        return new Date(today);
    } else if (text.includes('demain')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    } else if (text.includes('cette semaine')) {
        const inWeek = new Date(today);
        inWeek.setDate(inWeek.getDate() + Math.floor(Math.random() * 5) + 1);
        return inWeek;
    } else if (text.includes('semaine prochaine')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7 + Math.floor(Math.random() * 5));
        return nextWeek;
    } else if (text.includes('weekend') || text.includes('samedi') || text.includes('dimanche')) {
        const saturday = new Date(today);
        const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
        saturday.setDate(saturday.getDate() + daysUntilSaturday);
        return saturday;
    }
    
    // Default: tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
}

// Extract duration
function extractDuration(text) {
    const hourMatch = text.match(/(\d+)\s*h(eure)?s?/i);
    if (hourMatch) {
        return parseInt(hourMatch[1]) * 60;
    }
    
    const minMatch = text.match(/(\d+)\s*min(ute)?s?/i);
    if (minMatch) {
        return parseInt(minMatch[1]);
    }
    
    // Default durations by type
    if (text.includes('examen')) return 180;
    if (text.includes('réviser')) return 120;
    if (text.includes('sport')) return 60;
    if (text.includes('ami')) return 180;
    
    return 60; // Default 1h
}

// Generate time slot based on event type
function generateTimeSlot(type) {
    switch(type) {
        case 'study':
            return `${9 + Math.floor(Math.random() * 6)}:00`;
        case 'work':
            return `${9 + Math.floor(Math.random() * 8)}:00`;
        case 'social':
            return `${17 + Math.floor(Math.random() * 4)}:00`;
        case 'personal':
            return `${7 + Math.floor(Math.random() * 12)}:00`;
        default:
            return '10:00';
    }
}

// Calendar Generation
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (state.currentWeekOffset * 7));
    
    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        // Check if today
        if (currentDay.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }
        
        // Day header
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <span class="day-name">${dayNames[i]}</span>
            <span class="day-number">${currentDay.getDate()}</span>
        `;
        dayDiv.appendChild(dayHeader);
        
        // Events for this day
        const dayEvents = document.createElement('div');
        dayEvents.className = 'day-events';
        
        const eventsForDay = state.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === currentDay.toDateString();
        });
        
        eventsForDay.forEach(event => {
            const eventBlock = document.createElement('div');
            eventBlock.className = `event-block ${event.type}`;
            eventBlock.textContent = `${event.time} ${event.title}`;
            eventBlock.title = `${event.title} - ${event.duration}min`;
            dayEvents.appendChild(eventBlock);
        });
        
        dayDiv.appendChild(dayEvents);
        calendarGrid.appendChild(dayDiv);
        
        // Animate
        dayDiv.style.animationDelay = `${i * 0.05}s`;
    }
    
    // Update week label
    updateWeekLabel(startOfWeek);
}

function updateWeekLabel(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    const start = startDate.toLocaleDateString('fr-FR', options);
    const end = endDate.toLocaleDateString('fr-FR', options);
    
    document.getElementById('currentWeek').textContent = `${start} - ${end}`;
}

function changeWeek(offset) {
    state.currentWeekOffset += offset;
    generateCalendar();
}

// Events List
function updateEventsList() {
    const eventsList = document.getElementById('eventsList');
    eventsList.innerHTML = '';
    
    if (state.events.length === 0) {
        eventsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Aucun événement planifié. Utilise l\'assistant IA pour en ajouter !</p>';
        return;
    }
    
    // Sort by date
    const sortedEvents = [...state.events].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEvents.forEach((event, index) => {
        const eventItem = document.createElement('div');
        eventItem.className = 'event-item';
        eventItem.style.animationDelay = `${index * 0.05}s`;
        
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
        
        eventItem.innerHTML = `
            <div class="event-title">${event.title}</div>
            <div class="event-details">
                <span class="event-time">📅 ${dateStr}</span>
                <span class="event-duration">⏱️ ${event.duration} min</span>
                <span class="event-time">🕐 ${event.time}</span>
            </div>
        `;
        
        eventsList.appendChild(eventItem);
    });
}

// Insights Generation
function generateInsights() {
    // Productivity insight
    const timeOfDay = state.productivity.bestTime === "matin" ? "le matin" : 
                     state.productivity.bestTime === "après-midi" ? "l'après-midi" : "le soir";
    document.getElementById('bestTime').textContent = `Tu es plus productif ${timeOfDay}`;
    
    // Prediction
    const predictions = [
        "Ta semaine prochaine risque d'être chargée",
        "Semaine prochaine plus légère, profites-en !",
        "Attention : 3 deadlines la semaine prochaine",
        "Bonne nouvelle : semaine prochaine bien équilibrée"
    ];
    document.getElementById('prediction').textContent = predictions[Math.floor(Math.random() * predictions.length)];
    
    // Social insight
    const daysSinceSocial = state.productivity.lastSocialEvent;
    if (daysSinceSocial > 7) {
        document.getElementById('socialInsight').textContent = `Tu n'as pas vu tes amis depuis ${daysSinceSocial} jours`;
    } else {
        document.getElementById('socialInsight').textContent = `Super ! Tu as vu tes amis il y a ${daysSinceSocial} jours`;
    }
    
    // Time chart
    generateTimeChart();
}

function generateTimeChart() {
    const chartBars = document.getElementById('timeChart');
    chartBars.innerHTML = '';
    
    const activities = [
        { label: 'Travail/Études', type: 'work', hours: Math.random() * 8 + 4 },
        { label: 'Révisions', type: 'study', hours: Math.random() * 5 + 2 },
        { label: 'Vie sociale', type: 'social', hours: Math.random() * 4 + 1 },
        { label: 'Loisirs', type: 'personal', hours: Math.random() * 3 + 1 },
        { label: 'Sommeil', type: 'sleep', hours: Math.random() * 2 + 7 }
    ];
    
    const maxHours = 24;
    
    activities.forEach((activity, index) => {
        const percentage = (activity.hours / maxHours) * 100;
        
        const barDiv = document.createElement('div');
        barDiv.className = 'chart-bar';
        barDiv.innerHTML = `
            <div class="bar-label">${activity.label}</div>
            <div class="bar-container">
                <div class="bar-fill ${activity.type}" style="width: ${percentage}%">
                    ${activity.hours.toFixed(1)}h
                </div>
            </div>
        `;
        
        chartBars.appendChild(barDiv);
    });
}

// Template Activation
function activateTemplate(templateName) {
    if (templateName === 'none') {
        showToast('Template désactivé');
        state.activeTemplate = 'none';
        return;
    }
    
    state.activeTemplate = templateName;
    
    const templates = {
        student: {
            name: '🎓 Étudiant en examen',
            events: [
                { title: 'Révision maths', type: 'study', duration: 120, time: '9:00' },
                { title: 'Révision physique', type: 'study', duration: 120, time: '14:00' },
                { title: 'Pause sport', type: 'personal', duration: 60, time: '17:00' }
            ]
        },
        freelance: {
            name: '💼 Freelance équilibré',
            events: [
                { title: 'Deep work', type: 'work', duration: 240, time: '9:00' },
                { title: 'Réunion client', type: 'work', duration: 60, time: '14:00' },
                { title: 'Temps perso', type: 'personal', duration: 120, time: '17:00' }
            ]
        },
        parent: {
            name: '👨‍👩‍👧 Parent actif',
            events: [
                { title: 'Temps famille', type: 'social', duration: 120, time: '8:00' },
                { title: 'Travail', type: 'work', duration: 180, time: '10:00' },
                { title: 'Tâches ménagères', type: 'personal', duration: 60, time: '16:00' }
            ]
        }
    };
    
    const template = templates[templateName];
    
    // Add template events for next 3 days
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        template.events.forEach(event => {
            state.events.push({
                ...event,
                id: Date.now() + Math.random(),
                date: date
            });
        });
    }
    
    generateCalendar();
    updateEventsList();
    showToast(`Template "${template.name}" activé ! 3 jours planifiés automatiquement.`);
}

// Badges System
function generateBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    badgesGrid.innerHTML = '';
    
    const allBadges = [
        { icon: '🔥', name: 'Semaine Parfaite', desc: '7 jours de suite', unlocked: state.streak >= 7 },
        { icon: '⚡', name: 'Éclair', desc: '3 jours consécutifs', unlocked: state.streak >= 3 },
        { icon: '🎯', name: 'Focus Master', desc: '10h de deep work', unlocked: Math.random() > 0.5 },
        { icon: '🌟', name: 'Équilibre', desc: 'Score 80%+', unlocked: state.balanceScore >= 80 },
        { icon: '🏆', name: 'Champion', desc: '30 jours actifs', unlocked: false },
        { icon: '📚', name: 'Studieux', desc: '50h d\'étude', unlocked: Math.random() > 0.6 },
        { icon: '🤝', name: 'Social Butterfly', desc: '5 sorties/mois', unlocked: Math.random() > 0.7 },
        { icon: '💪', name: 'Persévérant', desc: '15 jours de suite', unlocked: state.streak >= 15 }
    ];
    
    allBadges.forEach((badge, index) => {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = `badge ${badge.unlocked ? '' : 'locked'}`;
        badgeDiv.style.animationDelay = `${index * 0.1}s`;
        badgeDiv.innerHTML = `
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            <div class="badge-desc">${badge.desc}</div>
        `;
        badgesGrid.appendChild(badgeDiv);
    });
}

// Activity Heatmap
function generateHeatmap() {
    const heatmapGrid = document.getElementById('heatmapGrid');
    heatmapGrid.innerHTML = '';
    
    // Generate 30 days of activity
    for (let i = 29; i >= 0; i--) {
        const day = document.createElement('div');
        const level = Math.floor(Math.random() * 5);
        day.className = `heatmap-day level-${level}`;
        day.title = `Il y a ${i} jours - ${level} événements`;
        heatmapGrid.appendChild(day);
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Load Sample Data
function loadSampleData() {
    const today = new Date();
    
    // Add some sample events
    const sampleEvents = [
        {
            id: 1,
            title: 'Révision maths',
            type: 'study',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            duration: 120,
            time: '14:00',
            priority: 'high'
        },
        {
            id: 2,
            title: 'Voir amis',
            type: 'social',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
            duration: 180,
            time: '18:00',
            priority: 'normal'
        },
        {
            id: 3,
            title: 'Sport',
            type: 'personal',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
            duration: 60,
            time: '17:00',
            priority: 'normal'
        }
    ];
    
    state.events = sampleEvents;
    updateEventsList();
}

// Simulated Calendar Sync (would connect to real APIs in production)
class CalendarSync {
    static async syncGoogle() {
        // In production: OAuth2 flow with Google Calendar API
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Synchronisé avec Google Calendar' });
            }, 1000);
        });
    }
    
    static async syncApple() {
        // In production: CalDAV protocol with Apple Calendar
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Synchronisé avec Apple Calendar' });
            }, 1000);
        });
    }
    
    static async syncNotion() {
        // In production: Notion API integration
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Synchronisé avec Notion Calendar' });
            }, 1000);
        });
    }
}

// Export for use in other modules
window.ChronoFlow = {
    state,
    parseNaturalLanguage,
    generateCalendar,
    activateTemplate,
    CalendarSync
};
