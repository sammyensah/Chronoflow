// ChronoFlow - AI Planning Assistant
// Enhanced Version with Real AI Support

// ===== CONFIGURATION =====
const CONFIG = {
    aiMode: 'simulated', // 'simulated' or 'claude'
    apiKey: '',
    apiEndpoint: 'https://api.anthropic.com/v1/messages'
};

// ===== STATE MANAGEMENT =====
const state = {
    // User data
    user: {
        name: 'Utilisateur',
        email: '',
        memberSince: new Date().toLocaleDateString('fr-FR'),
        preferredWorkTime: 'morning',
        totalEvents: 0,
        bestStreak: 0,
        totalHours: 0
    },
    
    // App state
    currentWeekOffset: 0,
    currentViewMode: 'week',
    activeView: 'planning',
    activeTemplate: 'none',
    activeFilter: 'all',
    theme: 'light',
    
    // Events and data
    events: [],
    streak: 0,
    balanceScore: 0,
    badges: [],
    activityHeatmap: [],
    
    // Analytics
    productivity: {
        bestTime: 'morning',
        avgWorkHours: 0,
        lastSocialEvent: 0,
        workloadTrend: 'normal',
        energyLevel: 'optimal'
    },
    
    // Sync status
    syncStatus: {
        google: false,
        apple: false,
        notion: false
    },
    
    // AI suggestions
    aiSuggestions: []
};

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadFromLocalStorage();
    generateInitialData();
    updateAllViews();
});

// ===== INITIALIZATION =====
function initializeApp() {
    // Check for saved theme
    const savedTheme = localStorage.getItem('chronoflow_theme') || 'light';
    setTheme(savedTheme);
    
    // Check for saved AI config
    const savedAIMode = localStorage.getItem('chronoflow_ai_mode');
    const savedAPIKey = localStorage.getItem('chronoflow_api_key');
    
    if (savedAIMode) CONFIG.aiMode = savedAIMode;
    if (savedAPIKey) CONFIG.apiKey = savedAPIKey;
    
    updateAIStatus();
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });
    
    // Profile button
    document.getElementById('profileBtn').addEventListener('click', () => {
        switchView('profile');
    });
    
    // AI Input
    document.getElementById('sendBtn').addEventListener('click', handleAIInput);
    document.getElementById('aiInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleAIInput();
        }
    });
    
    // Quick actions
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const text = e.currentTarget.dataset.text;
            document.getElementById('aiInput').value = text;
            handleAIInput();
        });
    });
    
    // Planning controls
    document.getElementById('prevWeekPlanning')?.addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeekPlanning')?.addEventListener('click', () => changeWeek(1));
    document.getElementById('viewMode')?.addEventListener('change', (e) => {
        state.currentViewMode = e.target.value;
        updatePlanningView();
    });
    
    // Calendar controls
    document.getElementById('prevWeek')?.addEventListener('click', () => changeWeek(-1));
    document.getElementById('nextWeek')?.addEventListener('click', () => changeWeek(1));
    
    // Event filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.activeFilter = e.currentTarget.dataset.filter;
            filterEvents();
        });
    });
    
    // Template selection
    document.getElementById('templateSelect').addEventListener('change', (e) => {
        activateTemplate(e.target.value);
    });
    
    // Sync buttons
    document.getElementById('syncGoogle').addEventListener('click', () => syncCalendar('google'));
    document.getElementById('syncApple').addEventListener('click', () => syncCalendar('apple'));
    document.getElementById('syncNotion').addEventListener('click', () => syncCalendar('notion'));
    
    // AI Configuration
    document.getElementById('configAI').addEventListener('click', () => {
        document.getElementById('aiConfigModal').classList.add('show');
    });
    
    document.getElementById('closeAIConfig').addEventListener('click', () => {
        document.getElementById('aiConfigModal').classList.remove('show');
    });
    
    document.getElementById('saveAIConfig').addEventListener('click', saveAIConfig);
    
    document.querySelectorAll('input[name="aiMode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const apiKeySection = document.getElementById('apiKeySection');
            if (e.target.value === 'claude') {
                apiKeySection.style.display = 'block';
            } else {
                apiKeySection.style.display = 'none';
            }
        });
    });
    
    // Profile settings
    document.getElementById('saveSettings').addEventListener('click', saveUserSettings);
    
    // Plan social action
    document.getElementById('planSocial')?.addEventListener('click', () => {
        document.getElementById('aiInput').value = 'Je veux voir mes amis ce weekend';
        switchView('planning');
        handleAIInput();
    });
}

// ===== THEME MANAGEMENT =====
function toggleTheme() {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
    
    localStorage.setItem('chronoflow_theme', theme);
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
        
        // Update view-specific content
        if (viewName === 'planning') updatePlanningView();
        if (viewName === 'calendar') generateCalendar();
        if (viewName === 'insights') updateInsights();
        if (viewName === 'templates') generateTemplates();
        if (viewName === 'badges') updateBadges();
        if (viewName === 'profile') updateProfile();
    }
}

// ===== AI INPUT HANDLER =====
async function handleAIInput() {
    const input = document.getElementById('aiInput').value.trim();
    if (!input) return;
    
    const sendBtn = document.getElementById('sendBtn');
    sendBtn.disabled = true;
    document.getElementById('sendBtnText').textContent = 'Analyse en cours...';
    
    // Show loading
    document.getElementById('loadingOverlay').classList.add('show');
    
    try {
        let parsedEvents;
        
        if (CONFIG.aiMode === 'claude' && CONFIG.apiKey) {
            // Use real Claude API
            parsedEvents = await parseWithClaudeAPI(input);
        } else {
            // Use simulated AI
            parsedEvents = await parseWithSimulatedAI(input);
        }
        
        // Add events to state
        if (parsedEvents && parsedEvents.length > 0) {
            parsedEvents.forEach(event => {
                state.events.push(event);
                state.user.totalEvents++;
                state.user.totalHours += event.duration / 60;
            });
            
            // Update streak
            updateStreak();
            
            // Generate AI suggestions
            generateAISuggestions(input);
            
            // Update all views
            updateAllViews();
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Show success
            const eventCount = parsedEvents.length;
            showToast(`✨ ${eventCount} événement${eventCount > 1 ? 's' : ''} ajouté${eventCount > 1 ? 's' : ''} à ton planning !`);
            
            // Clear input
            document.getElementById('aiInput').value = '';
        } else {
            showToast('⚠️ Je n\'ai pas pu générer d\'événements. Peux-tu reformuler ?');
        }
    } catch (error) {
        console.error('Error processing AI input:', error);
        showToast('❌ Une erreur est survenue. Réessaye !');
    } finally {
        sendBtn.disabled = false;
        document.getElementById('sendBtnText').textContent = 'Générer mon planning';
        document.getElementById('loadingOverlay').classList.remove('show');
    }
}

// ===== CLAUDE API INTEGRATION =====
async function parseWithClaudeAPI(input) {
    try {
        const response = await fetch(CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CONFIG.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: `Tu es un assistant de planification intelligent. Analyse cette demande et génère des événements pour un calendrier.

Demande de l'utilisateur: "${input}"

Réponds UNIQUEMENT avec un JSON array contenant les événements. Format:
[
  {
    "title": "Nom de l'événement",
    "type": "study|work|social|personal",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "duration": minutes (nombre),
    "priority": "critical|high|medium|low",
    "notes": "description optionnelle"
  }
]

Règles:
- Détecte l'intention (fatigue = plus de temps libre, examen = révisions, etc.)
- Génère plusieurs événements si nécessaire (ex: "réviser 2h par jour" = 7 événements)
- Choisis des horaires cohérents selon le type
- Adapte la priorité selon l'importance mentionnée
- Si mention de fatigue, réduis la charge et ajoute du temps libre

Aujourd'hui: ${new Date().toISOString().split('T')[0]}

RÉPONDS UNIQUEMENT AVEC LE JSON, RIEN D'AUTRE.`
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const content = data.content[0].text.trim();
        
        // Extract JSON from response
        let jsonStr = content;
        if (content.includes('```json')) {
            jsonStr = content.split('```json')[1].split('```')[0].trim();
        } else if (content.includes('```')) {
            jsonStr = content.split('```')[1].split('```')[0].trim();
        }
        
        const events = JSON.parse(jsonStr);
        
        // Add IDs and convert dates
        return events.map(event => ({
            ...event,
            id: Date.now() + Math.random(),
            date: new Date(event.date)
        }));
        
    } catch (error) {
        console.error('Claude API error:', error);
        // Fallback to simulated AI
        return parseWithSimulatedAI(input);
    }
}

// ===== SIMULATED AI (Advanced) =====
async function parseWithSimulatedAI(input) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const lowercaseText = input.toLowerCase();
    const events = [];
    const today = new Date();
    
    // Detect context
    const isTired = lowercaseText.includes('fatigué') || lowercaseText.includes('épuisé') || 
                    lowercaseText.includes('fatigue') || lowercaseText.includes('repos');
    const needsBalance = lowercaseText.includes('équilibre') || lowercaseText.includes('trop');
    const hasExam = lowercaseText.includes('examen') || lowercaseText.includes('test');
    const wantsBreak = lowercaseText.includes('pause') || lowercaseText.includes('libre');
    
    // Extract main activity
    let mainActivity = detectActivity(lowercaseText);
    let eventType = mainActivity.type;
    let eventTitle = mainActivity.title;
    
    // Extract dates
    const dates = extractDates(lowercaseText, today);
    
    // Extract duration and frequency
    const duration = extractDuration(lowercaseText, eventType);
    const frequency = extractFrequency(lowercaseText);
    
    // Determine priority
    let priority = 'medium';
    if (lowercaseText.includes('important') || lowercaseText.includes('urgent') || 
        lowercaseText.includes('critique') || hasExam) {
        priority = 'high';
    }
    if (hasExam && lowercaseText.includes('très')) priority = 'critical';
    if (isTired || wantsBreak) priority = 'low';
    
    // Generate events based on context
    if (isTired) {
        // Add recovery time
        for (let i = 0; i < 5; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            
            events.push({
                id: Date.now() + Math.random(),
                title: 'Temps de repos',
                type: 'personal',
                date: date,
                time: '14:00',
                duration: 90,
                priority: 'high',
                notes: 'Prends soin de toi !'
            });
        }
    } else if (needsBalance) {
        // Create balanced week
        const activities = [
            { title: 'Deep work', type: 'work', time: '9:00', duration: 180, priority: 'high' },
            { title: 'Sport / Activité physique', type: 'personal', time: '17:00', duration: 60, priority: 'medium' },
            { title: 'Temps social', type: 'social', time: '19:00', duration: 120, priority: 'medium' },
            { title: 'Temps libre', type: 'personal', time: '20:00', duration: 120, priority: 'low' }
        ];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            
            // Add 2-3 activities per day
            const dailyActivities = activities.slice(0, 2 + Math.floor(Math.random() * 2));
            dailyActivities.forEach(activity => {
                events.push({
                    ...activity,
                    id: Date.now() + Math.random(),
                    date: new Date(date)
                });
            });
        }
    } else if (frequency > 1) {
        // Recurring event
        const targetDates = dates.length > 0 ? dates : [today];
        const daysToSpread = frequency;
        
        for (let i = 0; i < daysToSpread; i++) {
            const date = new Date(targetDates[0]);
            date.setDate(date.getDate() + i);
            
            events.push({
                id: Date.now() + Math.random(),
                title: eventTitle,
                type: eventType,
                date: date,
                time: generateTimeSlot(eventType, i),
                duration: duration,
                priority: priority,
                notes: `Session ${i + 1}/${daysToSpread}`
            });
        }
    } else {
        // Single or multiple specific events
        const targetDates = dates.length > 0 ? dates : [today];
        
        targetDates.forEach(date => {
            events.push({
                id: Date.now() + Math.random(),
                title: eventTitle,
                type: eventType,
                date: new Date(date),
                time: generateTimeSlot(eventType),
                duration: duration,
                priority: priority
            });
        });
    }
    
    return events;
}

// ===== HELPER FUNCTIONS FOR AI PARSING =====
function detectActivity(text) {
    const activities = [
        { keywords: ['examen', 'test', 'contrôle'], type: 'study', title: 'Examen' },
        { keywords: ['réviser', 'révision', 'étudier', 'apprendre'], type: 'study', title: 'Révision' },
        { keywords: ['cours', 'classe', 'école'], type: 'study', title: 'Cours' },
        { keywords: ['ami', 'amis', 'sortie', 'voir'], type: 'social', title: 'Voir amis' },
        { keywords: ['sport', 'gym', 'fitness', 'courir'], type: 'personal', title: 'Sport' },
        { keywords: ['travail', 'projet', 'tâche', 'job'], type: 'work', title: 'Travail' },
        { keywords: ['réunion', 'meeting', 'rendez-vous'], type: 'work', title: 'Réunion' },
        { keywords: ['repos', 'détente', 'libre', 'pause'], type: 'personal', title: 'Temps libre' },
        { keywords: ['famille', 'parents', 'enfants'], type: 'social', title: 'Temps famille' }
    ];
    
    for (const activity of activities) {
        if (activity.keywords.some(kw => text.includes(kw))) {
            return activity;
        }
    }
    
    return { type: 'personal', title: 'Activité' };
}

function extractDates(text, baseDate) {
    const dates = [];
    
    // Specific month/day patterns
    const dateMatch = text.match(/(\d{1,2})\s*(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|fév|mar|avr|jun|jul|aoû|sep|oct|nov|déc)/i);
    if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const monthNames = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 
                           'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
        const month = monthNames.findIndex(m => m.startsWith(dateMatch[2].toLowerCase().substring(0, 3)));
        const date = new Date(baseDate.getFullYear(), month, day);
        if (date < baseDate) date.setFullYear(date.getFullYear() + 1);
        dates.push(date);
    }
    
    // Relative dates
    if (text.includes('aujourd\'hui')) {
        dates.push(new Date(baseDate));
    }
    if (text.includes('demain')) {
        const tomorrow = new Date(baseDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates.push(tomorrow);
    }
    if (text.includes('ce weekend') || text.includes('weekend')) {
        const saturday = new Date(baseDate);
        const daysUntilSaturday = (6 - baseDate.getDay() + 7) % 7 || 7;
        saturday.setDate(baseDate.getDate() + daysUntilSaturday);
        dates.push(saturday);
        
        const sunday = new Date(saturday);
        sunday.setDate(saturday.getDate() + 1);
        dates.push(sunday);
    }
    if (text.includes('cette semaine') && dates.length === 0) {
        // Default to tomorrow if no specific day mentioned
        const tomorrow = new Date(baseDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates.push(tomorrow);
    }
    if (text.includes('semaine prochaine')) {
        const nextWeek = new Date(baseDate);
        nextWeek.setDate(nextWeek.getDate() + 7);
        dates.push(nextWeek);
    }
    
    // If no dates detected, default to tomorrow
    if (dates.length === 0) {
        const tomorrow = new Date(baseDate);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dates.push(tomorrow);
    }
    
    return dates;
}

function extractDuration(text, eventType) {
    const hourMatch = text.match(/(\d+)\s*h(eure)?s?/i);
    if (hourMatch) return parseInt(hourMatch[1]) * 60;
    
    const minMatch = text.match(/(\d+)\s*min(ute)?s?/i);
    if (minMatch) return parseInt(minMatch[1]);
    
    // Defaults by type
    const defaults = {
        study: 120,
        work: 180,
        social: 150,
        personal: 60
    };
    
    return defaults[eventType] || 60;
}

function extractFrequency(text) {
    const frequencyMatch = text.match(/(\d+)\s*(fois|x)/i);
    if (frequencyMatch) return parseInt(frequencyMatch[1]);
    
    if (text.includes('tous les jours') || text.includes('chaque jour')) return 7;
    if (text.includes('par jour')) {
        const daysMatch = text.match(/pendant\s*(\d+)\s*jours?/i);
        if (daysMatch) return parseInt(daysMatch[1]);
        return 7; // Default week
    }
    
    return 1;
}

function generateTimeSlot(type, dayIndex = 0) {
    const slots = {
        study: ['9:00', '10:00', '14:00', '15:00', '16:00'],
        work: ['9:00', '10:00', '11:00', '14:00', '15:00'],
        social: ['17:00', '18:00', '19:00', '20:00'],
        personal: ['7:00', '8:00', '12:00', '17:00', '18:00']
    };
    
    const typeSlots = slots[type] || slots.personal;
    const index = dayIndex % typeSlots.length;
    return typeSlots[index];
}

// ===== AI SUGGESTIONS =====
function generateAISuggestions(input) {
    const suggestions = [];
    const lowercaseText = input.toLowerCase();
    
    // Check workload
    const thisWeekEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return eventDate >= weekStart && eventDate < weekEnd;
    });
    
    const totalHours = thisWeekEvents.reduce((sum, e) => sum + e.duration / 60, 0);
    
    if (totalHours > 50) {
        suggestions.push("⚠️ Tu travailles trop cette semaine ! Pense à prendre du temps pour toi.");
    }
    
    // Check social events
    const socialEvents = state.events.filter(e => e.type === 'social');
    const lastSocial = socialEvents.length > 0 ? 
        Math.floor((new Date() - new Date(socialEvents[socialEvents.length - 1].date)) / (1000 * 60 * 60 * 24)) : 
        14;
    
    if (lastSocial > 10) {
        suggestions.push("🤝 Tu n'as pas vu tes amis depuis plus de 10 jours. Une sortie te ferait du bien !");
    }
    
    // Context-specific suggestions
    if (lowercaseText.includes('examen')) {
        suggestions.push("📚 N'oublie pas de faire des pauses régulières pendant tes révisions (technique Pomodoro).");
    }
    
    if (lowercaseText.includes('fatigué')) {
        suggestions.push("😴 Assure-toi de dormir 7-8h par nuit. Le sommeil est crucial pour ta performance !");
    }
    
    // Show suggestions
    if (suggestions.length > 0) {
        const suggestionsDiv = document.getElementById('aiSuggestions');
        suggestionsDiv.innerHTML = suggestions.map(s => `<p><strong>IA:</strong> ${s}</p>`).join('');
        suggestionsDiv.classList.add('show');
        
        setTimeout(() => {
            suggestionsDiv.classList.remove('show');
        }, 8000);
    }
}

// ===== AI SUGGESTIONS =====
function generateAISuggestions(input) {
    const suggestions = [];
    const lowercaseText = input.toLowerCase();
    
    // Check workload
    const thisWeekEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return eventDate >= weekStart && eventDate < weekEnd;
    });
    
    const totalHours = thisWeekEvents.reduce((sum, e) => sum + e.duration / 60, 0);
    
    if (totalHours > 50) {
        suggestions.push("⚠️ Tu travailles trop cette semaine ! Pense à prendre du temps pour toi.");
    }
    
    // Check social events
    const socialEvents = state.events.filter(e => e.type === 'social');
    const lastSocial = socialEvents.length > 0 ? 
        Math.floor((new Date() - new Date(socialEvents[socialEvents.length - 1].date)) / (1000 * 60 * 60 * 24)) : 
        14;
    
    if (lastSocial > 10) {
        suggestions.push("🤝 Tu n'as pas vu tes amis depuis plus de 10 jours. Une sortie te ferait du bien !");
    }
    
    // Context-specific suggestions
    if (lowercaseText.includes('examen')) {
        suggestions.push("📚 N'oublie pas de faire des pauses régulières pendant tes révisions (technique Pomodoro).");
    }
    
    if (lowercaseText.includes('fatigué')) {
        suggestions.push("😴 Assure-toi de dormir 7-8h par nuit. Le sommeil est crucial pour ta performance !");
    }
    
    // Show suggestions
    if (suggestions.length > 0) {
        const suggestionsDiv = document.getElementById('aiSuggestions');
        suggestionsDiv.innerHTML = suggestions.map(s => `<p><strong>IA:</strong> ${s}</p>`).join('');
        suggestionsDiv.classList.add('show');
        
        setTimeout(() => {
            suggestionsDiv.classList.remove('show');
        }, 8000);
    }
}

// ===== PLANNING VIEW (Main View) =====
function updatePlanningView() {
    const container = document.getElementById('planningContainer');
    if (!container) return;
    
    if (state.currentViewMode === 'week') {
        generateWeekPlanningView(container);
    } else if (state.currentViewMode === 'day') {
        generateDayPlanningView(container);
    }
    
    updateEventsList();
    updatePeriodLabel();
}

function generateWeekPlanningView(container) {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (state.currentWeekOffset * 7));
    
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    
    let html = '<div class="week-planning-grid">';
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        
        const dayEvents = state.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === currentDay.toDateString();
        }).sort((a, b) => a.time.localeCompare(b.time));
        
        const isToday = currentDay.toDateString() === today.toDateString();
        
        html += `
            <div class="week-day-column ${isToday ? 'today' : ''}">
                <div class="day-column-header">
                    <div class="day-name">${days[i]}</div>
                    <div class="day-date">${currentDay.getDate()}/${currentDay.getMonth() + 1}</div>
                </div>
                <div class="day-column-events">
                    ${dayEvents.length === 0 ? '<div class="no-events">Aucun événement</div>' : 
                    dayEvents.map(event => `
                        <div class="planning-event ${event.priority}" data-id="${event.id}">
                            <div class="event-title-planning">${event.title}</div>
                            <div class="event-time-planning">${event.time} • ${event.duration}min</div>
                            ${event.notes ? `<div class="event-notes">${event.notes}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Add inline styles for week grid
    html = `
        <style>
            .week-planning-grid {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1rem;
                min-height: 500px;
            }
            .week-day-column {
                background: var(--bg-secondary);
                border-radius: var(--radius-md);
                padding: var(--space-md);
                border: 1px solid var(--border);
            }
            .week-day-column.today {
                border: 2px solid var(--primary);
                background: var(--bg-hover);
            }
            .day-column-header {
                text-align: center;
                padding-bottom: var(--space-sm);
                margin-bottom: var(--space-sm);
                border-bottom: 2px solid var(--border);
            }
            .day-name {
                font-weight: 700;
                font-size: 0.875rem;
                color: var(--text-secondary);
                text-transform: uppercase;
            }
            .day-date {
                font-size: 1.25rem;
                font-weight: 700;
                color: var(--text-primary);
                margin-top: 4px;
            }
            .day-column-events {
                display: flex;
                flex-direction: column;
                gap: var(--space-xs);
            }
            .no-events {
                text-align: center;
                color: var(--text-muted);
                font-size: 0.875rem;
                padding: var(--space-lg) 0;
            }
            .event-notes {
                font-size: 0.75rem;
                color: var(--text-muted);
                margin-top: 4px;
                font-style: italic;
            }
            @media (max-width: 1200px) {
                .week-planning-grid {
                    grid-template-columns: repeat(4, 1fr);
                }
            }
            @media (max-width: 768px) {
                .week-planning-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
            @media (max-width: 480px) {
                .week-planning-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    ` + html;
    
    container.innerHTML = html;
}

function generateDayPlanningView(container) {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + state.currentWeekOffset);
    
    const dayEvents = state.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.toDateString() === targetDate.toDateString();
    }).sort((a, b) => a.time.localeCompare(b.time));
    
    let html = `
        <div class="day-view-header">
            <h3>${targetDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
        </div>
        <div class="time-grid">
    `;
    
    const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm
    
    hours.forEach(hour => {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        const slotEvents = dayEvents.filter(e => {
            const eventHour = parseInt(e.time.split(':')[0]);
            return eventHour === hour;
        });
        
        html += `
            <div class="time-slot">
                <div class="time-label">${timeSlot}</div>
                <div class="slot-content">
                    ${slotEvents.map(event => `
                        <div class="planning-event ${event.priority}">
                            <div class="event-title-planning">${event.title}</div>
                            <div class="event-time-planning">${event.time} • ${event.duration}min</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function updateEventsList() {
    const eventsList = document.getElementById('eventsList');
    if (!eventsList) return;
    
    const filteredEvents = state.events.filter(event => {
        if (state.activeFilter === 'all') return true;
        return event.type === state.activeFilter;
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Aucun événement trouvé.</p>';
        return;
    }
    
    eventsList.innerHTML = filteredEvents.map((event, index) => {
        const eventDate = new Date(event.date);
        const dateStr = eventDate.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
        
        const priorityEmoji = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢'
        }[event.priority] || '🟡';
        
        return `
            <div class="event-item" style="animation-delay: ${index * 0.05}s">
                <div class="event-title">${priorityEmoji} ${event.title}</div>
                <div class="event-details">
                    <span class="event-time">📅 ${dateStr}</span>
                    <span class="event-duration">⏱️ ${event.duration} min</span>
                    <span class="event-time">🕐 ${event.time}</span>
                </div>
                ${event.notes ? `<div style="margin-top: 8px; font-size: 0.875rem; color: var(--text-muted);">${event.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}

function filterEvents() {
    updateEventsList();
}

function updatePeriodLabel() {
    const periodEl = document.getElementById('currentPeriod');
    if (!periodEl) return;
    
    if (state.currentViewMode === 'week') {
        if (state.currentWeekOffset === 0) {
            periodEl.textContent = 'Cette semaine';
        } else if (state.currentWeekOffset === 1) {
            periodEl.textContent = 'Semaine prochaine';
        } else if (state.currentWeekOffset === -1) {
            periodEl.textContent = 'Semaine dernière';
        } else {
            periodEl.textContent = `Semaine ${state.currentWeekOffset > 0 ? '+' : ''}${state.currentWeekOffset}`;
        }
    } else {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + state.currentWeekOffset);
        periodEl.textContent = targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    }
}

function changeWeek(offset) {
    state.currentWeekOffset += offset;
    if (state.activeView === 'planning') {
        updatePlanningView();
    } else if (state.activeView === 'calendar') {
        generateCalendar();
    }
}

// ===== CALENDAR VIEW =====
function generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;
    
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
        
        if (currentDay.toDateString() === today.toDateString()) {
            dayDiv.classList.add('today');
        }
        
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.innerHTML = `
            <span class="day-name">${dayNames[i]}</span>
            <span class="day-number">${currentDay.getDate()}</span>
        `;
        dayDiv.appendChild(dayHeader);
        
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
        
        dayDiv.style.animationDelay = `${i * 0.05}s`;
    }
    
    updateWeekLabel(startOfWeek);
}

function updateWeekLabel(startDate) {
    const weekEl = document.getElementById('currentWeek');
    if (!weekEl) return;
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    const start = startDate.toLocaleDateString('fr-FR', options);
    const end = endDate.toLocaleDateString('fr-FR', options);
    
    weekEl.textContent = `${start} - ${end}`;
}

// ===== INSIGHTS =====
function updateInsights() {
    calculateBalanceScore();
    analyzeProductivity();
    generatePredictions();
    analyzeSocialLife();
    analyzeEnergyLevel();
    generateRecommendations();
    updateTimeChart();
}

function calculateBalanceScore() {
    const recentEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
    });
    
    const workHours = recentEvents.filter(e => e.type === 'work' || e.type === 'study')
        .reduce((sum, e) => sum + e.duration / 60, 0);
    const personalHours = recentEvents.filter(e => e.type === 'personal' || e.type === 'social')
        .reduce((sum, e) => sum + e.duration / 60, 0);
    
    const totalHours = workHours + personalHours || 1;
    const idealRatio = 0.6; // 60% work, 40% personal
    const actualRatio = workHours / totalHours;
    
    const score = Math.max(0, Math.min(100, 100 - Math.abs(actualRatio - idealRatio) * 200));
    state.balanceScore = Math.round(score);
    
    document.getElementById('balanceScore').textContent = state.balanceScore;
    
    const scoreCircle = document.getElementById('scoreCircle');
    if (scoreCircle) {
        if (score >= 80) {
            scoreCircle.style.background = 'linear-gradient(135deg, var(--success), #00D68F)';
        } else if (score >= 60) {
            scoreCircle.style.background = 'linear-gradient(135deg, var(--warning), #FFB84D)';
        } else {
            scoreCircle.style.background = 'linear-gradient(135deg, var(--danger), #FF6B8A)';
        }
    }
    
    const detail = document.getElementById('balanceDetail');
    if (detail) {
        if (score >= 80) {
            detail.textContent = 'Excellent équilibre ! Continue comme ça 🎉';
        } else if (score >= 60) {
            detail.textContent = 'Bon équilibre, quelques ajustements possibles';
        } else {
            detail.textContent = 'Attention à ton équilibre vie/travail !';
        }
    }
}

function analyzeProductivity() {
    const morningEvents = state.events.filter(e => {
        const hour = parseInt(e.time.split(':')[0]);
        return hour >= 6 && hour < 12;
    });
    
    const afternoonEvents = state.events.filter(e => {
        const hour = parseInt(e.time.split(':')[0]);
        return hour >= 12 && hour < 18;
    });
    
    const eveningEvents = state.events.filter(e => {
        const hour = parseInt(e.time.split(':')[0]);
        return hour >= 18;
    });
    
    let bestTime = 'matin';
    let maxEvents = morningEvents.length;
    
    if (afternoonEvents.length > maxEvents) {
        bestTime = 'après-midi';
        maxEvents = afternoonEvents.length;
    }
    if (eveningEvents.length > maxEvents) {
        bestTime = 'soir';
    }
    
    state.productivity.bestTime = bestTime;
    
    const bestTimeEl = document.getElementById('bestTime');
    if (bestTimeEl) {
        const timeOfDay = bestTime === 'matin' ? 'le matin' : 
                         bestTime === 'après-midi' ? 'l\'après-midi' : 'le soir';
        bestTimeEl.textContent = `Tu es plus productif ${timeOfDay}`;
    }
    
    const detailEl = document.getElementById('productivityDetail');
    if (detailEl) {
        detailEl.textContent = `Basé sur ${maxEvents} événements planifiés à ces heures`;
    }
}

function generatePredictions() {
    const nextWeekEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const nextWeekStart = new Date(now);
        nextWeekStart.setDate(now.getDate() + 7);
        const nextWeekEnd = new Date(nextWeekStart);
        nextWeekEnd.setDate(nextWeekStart.getDate() + 7);
        return eventDate >= nextWeekStart && eventDate < nextWeekEnd;
    });
    
    const totalHours = nextWeekEvents.reduce((sum, e) => sum + e.duration / 60, 0);
    const highPriorityCount = nextWeekEvents.filter(e => e.priority === 'high' || e.priority === 'critical').length;
    
    const predictionEl = document.getElementById('prediction');
    const detailEl = document.getElementById('predictionDetail');
    
    if (predictionEl && detailEl) {
        if (totalHours > 50) {
            predictionEl.textContent = '⚠️ Semaine prochaine très chargée !';
            detailEl.textContent = `${Math.round(totalHours)}h planifiées, ${highPriorityCount} tâches prioritaires`;
        } else if (totalHours > 30) {
            predictionEl.textContent = '📊 Semaine prochaine normale';
            detailEl.textContent = `${Math.round(totalHours)}h planifiées, charge équilibrée`;
        } else {
            predictionEl.textContent = '✅ Semaine prochaine légère';
            detailEl.textContent = `${Math.round(totalHours)}h planifiées, profites-en !`;
        }
    }
}

function analyzeSocialLife() {
    const socialEvents = state.events.filter(e => e.type === 'social').sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const lastSocial = socialEvents.length > 0 ? 
        Math.floor((new Date() - new Date(socialEvents[0].date)) / (1000 * 60 * 60 * 24)) : 
        30;
    
    const socialEl = document.getElementById('socialInsight');
    if (socialEl) {
        if (lastSocial > 14) {
            socialEl.textContent = `😟 Tu n'as pas vu tes amis depuis ${lastSocial} jours`;
        } else if (lastSocial > 7) {
            socialEl.textContent = `🙂 Tu as vu tes amis il y a ${lastSocial} jours`;
        } else {
            socialEl.textContent = `🎉 Bonne vie sociale ! Dernière sortie il y a ${lastSocial} jours`;
        }
    }
    
    state.productivity.lastSocialEvent = lastSocial;
}

function analyzeEnergyLevel() {
    const thisWeekEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return eventDate >= weekStart && eventDate < weekEnd;
    });
    
    const totalHours = thisWeekEvents.reduce((sum, e) => sum + e.duration / 60, 0);
    
    const energyEl = document.getElementById('energyInsight');
    const detailEl = document.getElementById('energyDetail');
    
    if (energyEl && detailEl) {
        if (totalHours > 55) {
            energyEl.textContent = '😰 Attention au burnout';
            detailEl.textContent = `${Math.round(totalHours)}h cette semaine, c'est trop !`;
            state.productivity.energyLevel = 'low';
        } else if (totalHours > 45) {
            energyEl.textContent = '😅 Charge élevée';
            detailEl.textContent = `${Math.round(totalHours)}h cette semaine, fais attention`;
            state.productivity.energyLevel = 'medium';
        } else {
            energyEl.textContent = '✨ Niveau optimal';
            detailEl.textContent = `${Math.round(totalHours)}h cette semaine, bon rythme !`;
            state.productivity.energyLevel = 'optimal';
        }
    }
}

function generateRecommendations() {
    const recommendations = [];
    
    if (state.balanceScore < 60) {
        recommendations.push('Rééquilibre ton planning entre travail et vie personnelle');
    }
    
    if (state.productivity.lastSocialEvent > 10) {
        recommendations.push('Planifie une sortie avec tes amis cette semaine');
    }
    
    if (state.productivity.energyLevel === 'low') {
        recommendations.push('Prends du temps de repos, tu es en surcharge');
    }
    
    const studyEvents = state.events.filter(e => e.type === 'study');
    if (studyEvents.length > 10) {
        recommendations.push('Pense à espacer tes sessions de révision pour mieux mémoriser');
    }
    
    const container = document.getElementById('aiRecommendations');
    if (container) {
        if (recommendations.length === 0) {
            container.innerHTML = '<div class="recommendation-item">Tout va bien ! Continue comme ça 👍</div>';
        } else {
            container.innerHTML = recommendations.map(r => `
                <div class="recommendation-item">💡 ${r}</div>
            `).join('');
        }
    }
}

function updateTimeChart() {
    const chartBars = document.getElementById('timeChart');
    if (!chartBars) return;
    
    const recentEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return eventDate >= weekAgo;
    });
    
    const activities = {
        work: { label: 'Travail', hours: 0, type: 'work' },
        study: { label: 'Études', hours: 0, type: 'study' },
        social: { label: 'Vie sociale', hours: 0, type: 'social' },
        personal: { label: 'Loisirs', hours: 0, type: 'personal' }
    };
    
    recentEvents.forEach(event => {
        if (activities[event.type]) {
            activities[event.type].hours += event.duration / 60;
        }
    });
    
    const maxHours = 24;
    
    chartBars.innerHTML = Object.values(activities).map(activity => {
        const percentage = Math.min(100, (activity.hours / maxHours) * 100);
        
        return `
            <div class="chart-bar">
                <div class="bar-label">${activity.label}</div>
                <div class="bar-container">
                    <div class="bar-fill ${activity.type}" style="width: ${percentage}%">
                        ${activity.hours.toFixed(1)}h
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== TEMPLATES =====
function generateTemplates() {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;
    
    const templates = [
        {
            id: 'student',
            emoji: '🎓',
            name: 'Étudiant en examen',
            desc: 'Optimise ton temps de révision avec des sessions espacées et des pauses régulières',
            features: [
                'Blocs de révision 2-3h optimisés',
                'Pauses automatiques toutes les heures',
                'Sommeil protégé (7-8h minimum)',
                'Rappels intelligents avant examens',
                'Détection de surcharge cognitive'
            ]
        },
        {
            id: 'freelance',
            emoji: '💼',
            name: 'Freelance équilibré',
            desc: 'Balance projets clients, développement perso et vie privée intelligemment',
            features: [
                'Deep work sessions (4-6h/jour max)',
                'Time blocking automatique par projet',
                'Frontières strictes travail/perso',
                'Journées sans réunions protégées',
                'Détection du surmenage'
            ]
        },
        {
            id: 'parent',
            emoji: '👨‍👩‍👧',
            name: 'Parent actif',
            desc: 'Jongle entre famille, travail et temps personnel sans stress',
            features: [
                'Créneaux famille sacrés et protégés',
                'Tâches ménagères réparties intelligemment',
                '"Me time" garanti chaque jour',
                'Synchro multi-calendriers famille',
                'Alertes fatigue parentale'
            ]
        }
    ];
    
    grid.innerHTML = templates.map((template, index) => `
        <div class="template-card ${state.activeTemplate === template.id ? 'active' : ''}" data-template="${template.id}" style="animation-delay: ${index * 0.1}s">
            <div class="template-header">
                <span class="template-emoji">${template.emoji}</span>
                <h3>${template.name}</h3>
                <span class="template-status" id="${template.id}Status">${state.activeTemplate === template.id ? '✓ Actif' : ''}</span>
            </div>
            <p class="template-desc">${template.desc}</p>
            <ul class="template-features">
                ${template.features.map(f => `<li>✓ ${f}</li>`).join('')}
            </ul>
            <button class="template-activate" onclick="activateTemplate('${template.id}')">
                ${state.activeTemplate === template.id ? 'Désactiver' : 'Activer'}
            </button>
        </div>
    `).join('');
}

function activateTemplate(templateId) {
    if (templateId === 'none' || state.activeTemplate === templateId) {
        state.activeTemplate = 'none';
        document.getElementById('templateSelect').value = 'none';
        showToast('Template désactivé');
        generateTemplates();
        saveToLocalStorage();
        return;
    }
    
    state.activeTemplate = templateId;
    document.getElementById('templateSelect').value = templateId;
    
    const templateConfigs = {
        student: {
            name: '🎓 Étudiant en examen',
            events: [
                { title: 'Révision session 1', type: 'study', duration: 120, time: '9:00', priority: 'high' },
                { title: 'Pause active', type: 'personal', duration: 30, time: '11:30', priority: 'medium' },
                { title: 'Révision session 2', type: 'study', duration: 120, time: '14:00', priority: 'high' },
                { title: 'Sport / Détente', type: 'personal', duration: 60, time: '17:00', priority: 'medium' },
                { title: 'Révision légère', type: 'study', duration: 60, time: '19:00', priority: 'low' }
            ]
        },
        freelance: {
            name: '💼 Freelance équilibré',
            events: [
                { title: 'Deep work - Projet principal', type: 'work', duration: 240, time: '9:00', priority: 'critical' },
                { title: 'Pause déjeuner', type: 'personal', duration: 60, time: '13:00', priority: 'medium' },
                { title: 'Réunions & Emails', type: 'work', duration: 90, time: '14:00', priority: 'medium' },
                { title: 'Dev perso / Apprentissage', type: 'personal', duration: 60, time: '16:00', priority: 'low' },
                { title: 'Temps libre', type: 'personal', duration: 120, time: '18:00', priority: 'high' }
            ]
        },
        parent: {
            name: '👨‍👩‍👧 Parent actif',
            events: [
                { title: 'Routine matinale famille', type: 'social', duration: 90, time: '7:00', priority: 'critical' },
                { title: 'Travail concentré', type: 'work', duration: 180, time: '9:30', priority: 'high' },
                { title: 'Tâches ménagères', type: 'personal', duration: 45, time: '13:00', priority: 'medium' },
                { title: 'Travail - Session 2', type: 'work', duration: 120, time: '14:00', priority: 'medium' },
                { title: 'Temps famille', type: 'social', duration: 180, time: '17:00', priority: 'critical' },
                { title: '"Me time"', type: 'personal', duration: 60, time: '20:30', priority: 'high' }
            ]
        }
    };
    
    const template = templateConfigs[templateId];
    
    // Add template events for next 5 days
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        // Skip weekends for work templates
        if (templateId === 'freelance' && (date.getDay() === 0 || date.getDay() === 6)) {
            continue;
        }
        
        template.events.forEach(event => {
            state.events.push({
                ...event,
                id: Date.now() + Math.random(),
                date: new Date(date)
            });
            state.user.totalEvents++;
            state.user.totalHours += event.duration / 60;
        });
    }
    
    updateAllViews();
    saveToLocalStorage();
    showToast(`✨ Template "${template.name}" activé ! 5 jours planifiés automatiquement.`);
    generateTemplates();
}

// ===== BADGES & ACHIEVEMENTS =====
function updateBadges() {
    const badgesGrid = document.getElementById('badgesGrid');
    if (!badgesGrid) return;
    
    // Update streak display
    document.getElementById('streakDays').textContent = state.streak;
    
    const allBadges = [
        { icon: '⚡', name: 'Débutant', desc: '1er événement créé', condition: () => state.user.totalEvents >= 1 },
        { icon: '🔥', name: 'Éclair', desc: '3 jours consécutifs', condition: () => state.streak >= 3 },
        { icon: '✨', name: 'Semaine Parfaite', desc: '7 jours de suite', condition: () => state.streak >= 7 },
        { icon: '💎', name: 'Diamant', desc: '30 jours actifs', condition: () => state.streak >= 30 },
        { icon: '🎯', name: 'Organisé', desc: '50 événements créés', condition: () => state.user.totalEvents >= 50 },
        { icon: '🌟', name: 'Équilibre Master', desc: 'Score 85%+', condition: () => state.balanceScore >= 85 },
        { icon: '📚', name: 'Studieux', desc: '100h d\'étude', condition: () => {
            const studyHours = state.events.filter(e => e.type === 'study').reduce((sum, e) => sum + e.duration / 60, 0);
            return studyHours >= 100;
        }},
        { icon: '🤝', name: 'Social Butterfly', desc: '20 événements sociaux', condition: () => {
            return state.events.filter(e => e.type === 'social').length >= 20;
        }},
        { icon: '💼', name: 'Workaholic', desc: '200h de travail', condition: () => {
            const workHours = state.events.filter(e => e.type === 'work').reduce((sum, e) => sum + e.duration / 60, 0);
            return workHours >= 200;
        }},
        { icon: '🏆', name: 'Champion', desc: 'Tous les badges', condition: () => false } // Always locked
    ];
    
    let unlockedCount = 0;
    
    badgesGrid.innerHTML = allBadges.map((badge, index) => {
        const unlocked = badge.condition();
        if (unlocked) unlockedCount++;
        
        return `
            <div class="badge ${unlocked ? 'unlocked' : 'locked'}" style="animation-delay: ${index * 0.1}s">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
                <div class="badge-desc">${badge.desc}</div>
            </div>
        `;
    }).join('');
    
    document.getElementById('badgesEarned').textContent = unlockedCount;
    
    // Update streak progress
    const nextGoal = state.streak < 3 ? 3 : state.streak < 7 ? 7 : state.streak < 30 ? 30 : 60;
    const progress = (state.streak / nextGoal) * 100;
    document.getElementById('streakProgress').style.width = `${Math.min(100, progress)}%`;
    document.getElementById('streakGoal').textContent = state.streak >= nextGoal ? 
        'Objectif atteint ! 🎉' : 
        `Prochain: ${nextGoal} jours (${nextGoal - state.streak} restants)`;
}

function generateHeatmap() {
    const heatmapGrid = document.getElementById('heatmapGrid');
    if (!heatmapGrid) return;
    
    heatmapGrid.innerHTML = '';
    
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dayEvents = state.events.filter(e => {
            const eventDate = new Date(e.date);
            return eventDate.toDateString() === date.toDateString();
        });
        
        let level = 0;
        if (dayEvents.length > 0) level = 1;
        if (dayEvents.length >= 3) level = 2;
        if (dayEvents.length >= 5) level = 3;
        if (dayEvents.length >= 7) level = 4;
        
        const day = document.createElement('div');
        day.className = `heatmap-day level-${level}`;
        day.title = `${date.toLocaleDateString('fr-FR')} - ${dayEvents.length} événements`;
        heatmapGrid.appendChild(day);
    }
}

// ===== PROFILE =====
function updateProfile() {
    document.getElementById('userName').textContent = state.user.name;
    document.getElementById('userEmail').textContent = state.user.email || 'Nouvel utilisateur';
    document.getElementById('memberSince').textContent = state.user.memberSince;
    
    document.getElementById('totalEvents').textContent = state.user.totalEvents;
    document.getElementById('bestStreak').textContent = state.user.bestStreak;
    document.getElementById('totalHours').textContent = Math.round(state.user.totalHours);
    
    // Count unlocked badges
    // (simplified - in real app would check all conditions)
    const unlockedCount = state.streak >= 3 ? 2 : state.user.totalEvents >= 1 ? 1 : 0;
    document.getElementById('badgesEarned').textContent = unlockedCount;
    
    // Set form values
    document.getElementById('userNameInput').value = state.user.name;
    document.getElementById('preferredWorkTime').value = state.user.preferredWorkTime;
    
    if (CONFIG.apiKey) {
        document.getElementById('apiKeyInput').value = CONFIG.apiKey;
    }
}

function saveUserSettings() {
    state.user.name = document.getElementById('userNameInput').value || 'Utilisateur';
    state.user.preferredWorkTime = document.getElementById('preferredWorkTime').value;
    
    const apiKey = document.getElementById('apiKeyInput').value;
    if (apiKey) {
        CONFIG.apiKey = apiKey;
        localStorage.setItem('chronoflow_api_key', apiKey);
    }
    
    saveToLocalStorage();
    updateProfile();
    showToast('✅ Paramètres sauvegardés !');
}

// ===== CALENDAR SYNC =====
async function syncCalendar(platform) {
    const statusEl = document.getElementById(`${platform}Status`);
    const button = document.getElementById(`sync${platform.charAt(0).toUpperCase() + platform.slice(1)}`);
    
    button.disabled = true;
    statusEl.textContent = '⏳';
    statusEl.style.background = 'var(--warning)';
    
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    state.syncStatus[platform] = true;
    statusEl.textContent = '✓';
    statusEl.style.background = 'var(--success)';
    
    button.disabled = false;
    
    const platformNames = {
        google: 'Google Calendar',
        apple: 'Apple Calendar',
        notion: 'Notion Calendar'
    };
    
    showToast(`✅ Synchronisé avec ${platformNames[platform]} !`);
    saveToLocalStorage();
}

// ===== AI CONFIGURATION =====
function updateAIStatus() {
    const dot = document.getElementById('aiStatusDot');
    const text = document.getElementById('aiStatusText');
    
    if (CONFIG.aiMode === 'claude' && CONFIG.apiKey) {
        dot.style.background = 'var(--primary)';
        text.textContent = 'Claude IA (réelle)';
    } else {
        dot.style.background = 'var(--success)';
        text.textContent = 'Simulée (gratuite)';
    }
}

function saveAIConfig() {
    const selectedMode = document.querySelector('input[name="aiMode"]:checked').value;
    CONFIG.aiMode = selectedMode;
    
    if (selectedMode === 'claude') {
        const apiKey = document.getElementById('apiKeyConfig').value;
        if (!apiKey) {
            showToast('⚠️ Clé API requise pour Claude !');
            return;
        }
        CONFIG.apiKey = apiKey;
        localStorage.setItem('chronoflow_api_key', apiKey);
    }
    
    localStorage.setItem('chronoflow_ai_mode', selectedMode);
    updateAIStatus();
    
    document.getElementById('aiConfigModal').classList.remove('show');
    showToast(selectedMode === 'claude' ? '✅ Claude IA activée !' : '✅ IA simulée activée');
}

// ===== UTILITY FUNCTIONS =====
function updateStreak() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === today.toDateString();
    });
    
    const yesterdayEvents = state.events.filter(e => {
        const eventDate = new Date(e.date);
        return eventDate.toDateString() === yesterday.toDateString();
    });
    
    if (todayEvents.length > 0) {
        if (yesterdayEvents.length > 0 || state.streak === 0) {
            state.streak++;
        }
    }
    
    if (state.streak > state.user.bestStreak) {
        state.user.bestStreak = state.streak;
    }
    
    document.getElementById('streak').textContent = state.streak;
}

function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3500);
}

function updateAllViews() {
    if (state.activeView === 'planning') updatePlanningView();
    if (state.activeView === 'calendar') generateCalendar();
    if (state.activeView === 'insights') updateInsights();
    if (state.activeView === 'badges') {
        updateBadges();
        generateHeatmap();
    }
}

// ===== LOCALSTORAGE =====
function saveToLocalStorage() {
    try {
        localStorage.setItem('chronoflow_state', JSON.stringify({
            user: state.user,
            events: state.events,
            streak: state.streak,
            activeTemplate: state.activeTemplate,
            syncStatus: state.syncStatus,
            balanceScore: state.balanceScore
        }));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('chronoflow_state');
        if (saved) {
            const data = JSON.parse(saved);
            state.user = data.user || state.user;
            state.events = (data.events || []).map(e => ({
                ...e,
                date: new Date(e.date)
            }));
            state.streak = data.streak || 0;
            state.activeTemplate = data.activeTemplate || 'none';
            state.syncStatus = data.syncStatus || state.syncStatus;
            state.balanceScore = data.balanceScore || 0;
            
            // Update UI
            document.getElementById('streak').textContent = state.streak;
            document.getElementById('templateSelect').value = state.activeTemplate;
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

// ===== INITIAL DATA GENERATION =====
function generateInitialData() {
    // Only generate if no events exist
    if (state.events.length > 0) return;
    
    // Generate some sample data
    const today = new Date();
    state.streak = Math.floor(Math.random() * 5) + 1;
    state.user.totalEvents = state.events.length;
    state.user.bestStreak = state.streak;
    
    // Add a few sample events
    const sampleEvents = [
        {
            id: Date.now() + 1,
            title: 'Bienvenue sur ChronoFlow !',
            type: 'personal',
            date: new Date(today),
            duration: 15,
            time: '10:00',
            priority: 'low',
            notes: 'Commence à planifier ton quotidien'
        }
    ];
    
    state.events = sampleEvents;
    state.user.totalEvents = 1;
    
    updateAllViews();
}

// ===== EXPORT FOR DEBUGGING =====
window.ChronoFlow = {
    state,
    CONFIG,
    activateTemplate,
    switchView,
    updateAllViews
};
