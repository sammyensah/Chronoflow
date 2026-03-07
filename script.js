// ChronoFlow V5 — Complete Rewrite

/* ═══ STATE ═══ */
const S = {
  user:null, accounts:{}, events:[], weekOffset:0, monthOffset:0, monthDir:'right',
  activeView:'planning', theme:'dark', streak:0, lastUsedDate:null,
  template:'custom', templateData:{maxStudy:4,maxLeisure:3,breakMin:10,courses:[],workStart:'09:00',workEnd:'18:00',maxWork:8},
  lang:'fr', notifications:true,
  currentEventId:null, verificationCode:null,
  xp:0, level:1, totalXpEarned:0, tutorialDone:false, tutStep:0,
  voiceText:'', recognition:null,
  sessionActive:false, sessionTimer:null, sessionPhase:'work', sessionPhaseIdx:0,
  sessionCurrentPhaseSec:0, sessionPhaseElapsed:0,
  sessionWorkSec:0, sessionBreakSec:0, sessionTotalSec:0, sessionElapsed:0,
  equippedItem:'default',
  todos:[]
};
let pendingReviseText = '';
let sessionBeepInterval = null;
let curAuthTab = 'login';
let chatMode = 'talk';

/* ═══ I18N ═══ */
const LANGS = {
  fr:{
    nav_planning:'Planning',nav_calendar:'Calendrier',nav_insights:'Insights',nav_templates:'Templates',nav_badges:'Badges',nav_settings:'Paramètres',
    btn_generate:'Générer',start_session:'Lancer une session de révision',
    today:"📍 Aujourd'hui",upcoming:'📅 À venir',profile:'Profil',
    events:'Événements',streak:'Streak',hours:'Heures',badges:'Badges',info:'Informations',firstname:'Prénom',save:'Sauvegarder',
    language:'Langue',notifications:'Notifications',theme:'Thème',api_key:'Clé API Anthropic',api_hint:'Clé stockée localement.',
    privacy:'Confidentialité',change_pwd:'Changer le mot de passe',data:'Données',export:'Exporter mes données',delete_account:'Supprimer mon compte',
    talk:'💬 Parler',locker:'🎒 Casier',ai_assistant:'Assistant IA',yes:'Oui',no:'Non',close:'Fermer',cancel:'Annuler',start:'Démarrer',
    all_ranks:'🏆 Tous les Rangs',change_priority:'Priorité :',
    session_duration:'Durée totale (h)',work_block:'Bloc travail (min)',break_block:'Pause (min)',
    exit_session_title:'Quitter la session ?',exit_session_desc:'Ta progression sera perdue.',no_stay:'Rester',yes_quit:'Quitter',
    login_tab:'Se connecter',register_tab:"S'inscrire",
    wcTitle:'Bonjour ! Je suis Chronos !',wcDesc:'Ton assistant IA. Veux-tu un tutoriel ?',wcSkip:'Non merci',wcStart:'Oui ✨',
    week_this:'Cette semaine',week_next:'Semaine prochaine',week_prev:'Semaine dernière',free:'Libre',no_events:'Aucun événement',
    loading:'Chronos analyse ta demande...',work_phase:'Travail 💪',break_phase:'Pause ☕',session_phase:'Session',break_label:'Pause',
    revise_title:'📚 Que veux-tu réviser ?',revise_subject:'Matière',revise_date:'Pour quand ?',revise_gen:'Générer 🚀',
    error_field:'Remplis tous les champs',error_email:'Email invalide',error_pwd:'Mot de passe : 6 caractères minimum',
    error_email_used:'Email déjà utilisé',error_account:'Compte introuvable',error_pwd_wrong:'Mot de passe incorrect',
    error_pwd_no_match:'Les mots de passe ne correspondent pas',
    lang_changed:'✅ Langue changée',
    tut1:"Bienvenue ! 👋 Voici la zone IA. Décris ton planning et je génère tout automatiquement !",
    tut2:"Ton planning hebdomadaire s'affiche ici. Les cours de ton template y apparaissent aussi !",
    tut3:"Le calendrier mensuel. Clique sur une date pour voir tous les événements 📅",
    tut4:"Les Insights te montrent tes stats et ta progression 📊",
    tut5:"Ici tu gagnes des XP et tu montes de niveau ! 🎖️",
    tut6:"Je suis Chronos ! Clique sur moi pour me parler ou changer mon costume dans le Casier 🌟",tut7:"Chaque semaine, je t'afficherai un bilan complet de ce que tu as accompli — avec des stats et des conseils pour la semaine à venir ! 📊",
    obChooseProfile:'Choisis ton profil',obStudentTitle:'🎓 Configuration Étudiant',obWorkerTitle:'💼 Configuration Travailleur',obCustomTitle:'✨ Configuration Personnalisée',
    pcStudent:'Étudiant',pcWorker:'Travailleur',pcCustom:'Personnalisé',pcStudentDesc:'Cours, révisions, examens',pcWorkerDesc:'Projets, réunions, deadlines',pcCustomDesc:'Je configure moi-même',
    btnAddCourse:'Ajouter un cours',btnBack:'Retour',btnFinish:'Terminer',
    lblMaxStudy:'Max révision/jour (h)',lblMaxLeisure:'Max loisirs/jour (h)',lblBreakBetween:'Pause entre événements (min)',
    lblWorkStart:'Début journée',lblWorkEnd:'Fin journée',lblMaxWork:'Max travail/jour (h)',lblBreakW:'Pause entre tâches (min)',
    lblMaxStudyC:'Max révision/jour (h)',lblMaxLeisureC:'Max loisirs/jour (h)',lblBreakC:'Pause (min)',
    lblEmail:'Email',lblPassword:'Mot de passe',lblName:'Prénom',lblEmailR:'Email',lblPasswordR:'Mot de passe',
    lblPasswordConfirm:'Confirmer le mot de passe',
    btnLogin:'Se connecter →',btnRegister:'Créer mon compte →',
    forgot_pwd_link:'Mot de passe oublié ?',forgot_pwd_title:'🔐 Mot de passe oublié',
    forgot_pwd_desc:'Saisis ton email pour recevoir un lien de réinitialisation.',
    forgot_pwd_send:'Envoyer le lien',forgot_pwd_sent:'✅ Email envoyé ! Vérifie ta boîte mail.',
    forgot_pwd_error:'Adresse email introuvable.',
    // Days short
    day_s_mon:'Lun',day_s_tue:'Mar',day_s_wed:'Mer',day_s_thu:'Jeu',day_s_fri:'Ven',day_s_sat:'Sam',day_s_sun:'Dim',
    // Days long
    day_monday:'Lundi',day_tuesday:'Mardi',day_wednesday:'Mercredi',day_thursday:'Jeudi',day_friday:'Vendredi',day_saturday:'Samedi',day_sunday:'Dimanche',
    // Months short
    month_jan:'Jan',month_feb:'Fév',month_mar:'Mar',month_apr:'Avr',month_may:'Mai',month_jun:'Jun',
    month_jul:'Jul',month_aug:'Aoû',month_sep:'Sep',month_oct:'Oct',month_nov:'Nov',month_dec:'Déc',
    // Week label
    week_n:'Sem.',
    // Sidebar streak
    sb_streak_label:'jour streak',
    // AI placeholder
    ai_placeholder:"Dis-moi ce que tu veux planifier...\nEx : J'ai un exam de maths dans 3 jours, aide-moi à réviser",
    // Toasts
    toast_events_created:'événement(s) créé(s) !',toast_reformulate:'Reformule ta demande',
    toast_template_saved:'Template sauvegardé !',toast_template_changed:'Template changé !',
    toast_equipped:'Équipement changé !',toast_profile_saved:'Profil sauvegardé',
    toast_pwd_changed:'Mot de passe changé',toast_exported:'Données exportées !',
    toast_todo_added:'Ajouté à la to-do list !',toast_todo_write_something:'Écris quelque chose !',
    toast_session_done:'Session terminée ! Bien joué !',toast_key_saved:'Clé API enregistrée',
    // Todo
    todo_done_all:'Tout est fait !',todo_placeholder:'Ajouter une tâche...',todo_add_btn:'Ajouter',
    // Confirm dialogs
    confirm_reload_title:'Revenir à l\'accueil ?',confirm_reload_msg:'Toute progression non sauvegardée sera perdue.',
    confirm_delete_title:'Supprimer le compte ?',confirm_delete_msg:'Cette action est irréversible. Toutes tes données seront supprimées.',
    confirm_yes:'Confirmer',confirm_no:'Annuler',
    // Session
    session_back:'✕ Quitter',
    // Notifications
    notif_resume_in10:'Reprends dans 10 secondes !',
    notif_break:'Pause ! Repose-toi bien 😊',
    notif_work_resume:'Reprends le travail ! 💪',
    notif_level_up:'Niveau {level} !',
    // Level up
    lvlup_title:'⬆️ Niveau {level} !',lvlup_reward:'Tu débloqueras {reward} pour Chronos !',lvlup_keep_going:'Continue comme ça ! 💪',
    // Badge hint
    badge_hint_done:'Tu as tout débloqué ! 👑',
    badge_hint_next:'Niveau {level} → tu débloqueras {reward} pour Chronos !',
    // Locker
    locker_equipped:'Équipé',locker_locked:'🔒',locker_level:'Niv.',
    // Insights
    ins_today:"Aujourd'hui",ins_this_week:'Cette semaine',ins_this_month:'Ce mois',
    ins_events:'événements',ins_hours:'heures',ins_active_days:'jours actifs',
    ins_heatmap_title:'Activité — 52 semaines',ins_heatmap_less:'Moins',ins_heatmap_more:'Plus',
    ins_xp_title:'XP — 30 jours',ins_donut_title:'Répartition',ins_donut_no_events:'Aucun événement',
    ins_wow_title:'Cette semaine vs semaine passée',
    ins_wow_hours:'Heures planifiées',ins_wow_events:'Événements',ins_wow_study:'Sessions étude',ins_wow_streak:'Streak',
    // Donut type labels
    type_study:'Révision',type_work:'Travail',type_sport:'Sport',type_social:'Social',type_leisure:'Loisirs',type_other:'Autre',
    // Weekly review
    wr_title:'Bilan de ta semaine 📊',wr_subtitle:'Chronos a analysé ta semaine',
    wr_stat_hours:'Heures planifiées',wr_stat_study:'Révision',wr_stat_events:'Événements',
    wr_stat_days:'Jours actifs',wr_stat_streak:'Streak 🔥',wr_stat_level:'Niveau',
    wr_chronos_feedback:'💬 Feedback de Chronos',wr_later:'Plus tard',wr_plan_week:'📋 Planifier la semaine →',
    wr_feedback_excellent:'🔥 Excellente semaine ! Tu as planifié {h}h — tu es dans le top !',
    wr_feedback_good:'👍 Bonne semaine avec {h}h planifiées. Continue sur cette lancée !',
    wr_feedback_ok:'📈 Semaine modérée avec {h}h. La semaine prochaine, essaie de viser 10h+ !',
    wr_feedback_light:'💡 Semaine légère ({h}h). Commence doucement — même 30min/jour font une grande différence !',
    wr_advice_regular:"💡 Pour la semaine prochaine : maintiens cette régularité ! Planifie tes sessions à l'avance pour ne pas perdre ton élan.",
    wr_advice_plan:"💡 Pour la semaine prochaine : essaie de planifier au moins 5 jours actifs. Utilise la génération IA pour créer ton planning en un clic !",
    // Chronos speech
    chronos_morning:'☀️ Bonne matinée ! Prêt à planifier ?',
    chronos_lunch:'🍽️ Pause déjeuner bien méritée !',
    chronos_afternoon:"⚡ L'après-midi, c'est pour les productifs !",
    chronos_evening:'🌙 Soirée de révision ? Je suis là !',
    chronos_night:'🌟 Tu travailles tard ! Courage !',
    chronos_streak:'🔥 {streak} jours de streak ! Légendaire !',
    chronos_session_done:'🎉 Session terminée ! Super boulot !',
    chronos_xp:'⚡ +{xp} XP ! Excellent !',
    chronos_badge:'🏅 Badge débloqué : {name} ! Bravo !',
    chronos_tip1:'💡 Conseil : planifie tes révisions en blocs de 25min !',
    chronos_tip2:'🎯 Objectif de la semaine : battre ton streak !',
    chronos_tip3:'📚 Tu as des événements non révisés cette semaine ?',
    chronos_tip4:'⚡ Une session de 20min maintenant vaut 1h demain !',
    chronos_tip5:'🌟 Niveau {level} — tu es presque au prochain !',
    // Password strength
    pwd_weak:'Faible',pwd_medium:'Moyen',pwd_strong:'Fort',pwd_very_strong:'Très fort',
    // Loader messages
    loader_1:'Chronos prépare ton planning... ⚡',loader_2:'Synchronisation de tes données... 📡',
    loader_3:'Chargement de tes événements... 📅',loader_4:'Prêt à être productif ? 🚀',
    // Error
    error_oops:'Oups !',error_generic:'Quelque chose s\'est mal passé.',error_retry:'Réessayer',
    // Date formatting helpers
    on_date:'le',at_time:'à',
    // Insights stat labels (for ins-stat-cards)
    isc_this_week:'Cette semaine',isc_study_sessions:'Sessions étude',isc_streak:'Streak actuel',isc_xp_total:'XP total',
  },
  en:{
    nav_planning:'Planning',nav_calendar:'Calendar',nav_insights:'Insights',nav_templates:'Templates',nav_badges:'Badges',nav_settings:'Settings',
    btn_generate:'Generate',start_session:'Start a study session',
    today:'📍 Today',upcoming:'📅 Upcoming',profile:'Profile',
    events:'Events',streak:'Streak',hours:'Hours',badges:'Badges',info:'Information',firstname:'First name',save:'Save',
    language:'Language',notifications:'Notifications',theme:'Theme',api_key:'Anthropic API Key',api_hint:'Key stored locally.',
    privacy:'Privacy',change_pwd:'Change password',data:'Data',export:'Export my data',delete_account:'Delete account',
    talk:'💬 Chat',locker:'🎒 Locker',ai_assistant:'AI Assistant',yes:'Yes',no:'No',close:'Close',cancel:'Cancel',start:'Start',
    all_ranks:'🏆 All Ranks',change_priority:'Priority:',
    session_duration:'Total duration (h)',work_block:'Work block (min)',break_block:'Break (min)',
    exit_session_title:'Exit session?',exit_session_desc:'Your progress will be lost.',no_stay:'Stay',yes_quit:'Exit',
    login_tab:'Log in',register_tab:'Sign up',
    wcTitle:'Hello! I am Chronos!',wcDesc:'Your AI assistant. Want a tutorial?',wcSkip:'No thanks',wcStart:'Yes ✨',
    week_this:'This week',week_next:'Next week',week_prev:'Last week',free:'Free',no_events:'No events',
    loading:'Chronos is analyzing...',work_phase:'Work 💪',break_phase:'Break ☕',session_phase:'Session',break_label:'Break',
    revise_title:'📚 What to study?',revise_subject:'Subject',revise_date:'By when?',revise_gen:'Generate 🚀',
    error_field:'Fill in all fields',error_email:'Invalid email',error_pwd:'Password: at least 6 characters',
    error_email_used:'Email already used',error_account:'Account not found',error_pwd_wrong:'Incorrect password',
    lang_changed:'✅ Language changed',
    tut1:"Welcome! 👋 This is the AI zone. Describe your schedule and I'll generate it automatically!",
    tut2:'Your weekly schedule appears here. Template courses show up too!',
    tut3:'Monthly calendar. Click a date to see all events 📅',
    tut4:'Insights show your stats and progress 📊',
    tut5:'Here you earn XP and level up! 🎖️',
    tut6:"I'm Chronos! Click me to chat or change my costume in the Locker 🌟",tut7:"Every week on Monday, I'll show you a full review of what you accomplished — with stats and advice for the week ahead! 📊",
    obChooseProfile:'Choose your profile',obStudentTitle:'🎓 Student Setup',obWorkerTitle:'💼 Worker Setup',obCustomTitle:'✨ Custom Setup',
    pcStudent:'Student',pcWorker:'Worker',pcCustom:'Custom',pcStudentDesc:'Classes, studying, exams',pcWorkerDesc:'Projects, meetings, deadlines',pcCustomDesc:'I set it up myself',
    btnAddCourse:'Add a class',btnBack:'Back',btnFinish:'Finish',
    lblMaxStudy:'Max study/day (h)',lblMaxLeisure:'Max leisure/day (h)',lblBreakBetween:'Break between events (min)',
    lblWorkStart:'Day start',lblWorkEnd:'Day end',lblMaxWork:'Max work/day (h)',lblBreakW:'Break between tasks (min)',
    lblMaxStudyC:'Max study/day (h)',lblMaxLeisureC:'Max leisure/day (h)',lblBreakC:'Break (min)',
    lblEmail:'Email',lblPassword:'Password',lblName:'First name',lblEmailR:'Email',lblPasswordR:'Password',
    lblPasswordConfirm:'Confirm password',
    btnLogin:'Log in →',btnRegister:'Create account →',
    error_pwd_no_match:'Passwords do not match',
    forgot_pwd_link:'Forgot password?',forgot_pwd_title:'🔐 Forgot password',
    forgot_pwd_desc:'Enter your email to receive a reset link.',
    forgot_pwd_send:'Send link',forgot_pwd_sent:'✅ Email sent! Check your inbox.',
    forgot_pwd_error:'Email address not found.',
    day_s_mon:'Mon',day_s_tue:'Tue',day_s_wed:'Wed',day_s_thu:'Thu',day_s_fri:'Fri',day_s_sat:'Sat',day_s_sun:'Sun',
    day_monday:'Monday',day_tuesday:'Tuesday',day_wednesday:'Wednesday',day_thursday:'Thursday',day_friday:'Friday',day_saturday:'Saturday',day_sunday:'Sunday',
    month_jan:'Jan',month_feb:'Feb',month_mar:'Mar',month_apr:'Apr',month_may:'May',month_jun:'Jun',
    month_jul:'Jul',month_aug:'Aug',month_sep:'Sep',month_oct:'Oct',month_nov:'Nov',month_dec:'Dec',
    week_n:'Wk.',sb_streak_label:'day streak',
    ai_placeholder:"Tell me what you want to schedule...\nEx: I have a math exam in 3 days, help me study",
    toast_events_created:'event(s) created!',toast_reformulate:'Rephrase your request',
    toast_template_saved:'Template saved!',toast_template_changed:'Template changed!',
    toast_equipped:'Costume changed!',toast_profile_saved:'Profile saved',
    toast_pwd_changed:'Password changed',toast_exported:'Data exported!',
    toast_todo_added:'Added to to-do list!',toast_todo_write_something:'Write something!',
    toast_session_done:'Session complete! Well done!',toast_key_saved:'API key saved',
    todo_done_all:'All done!',todo_placeholder:'Add a task...',todo_add_btn:'Add',
    confirm_reload_title:'Go back to home?',confirm_reload_msg:'Any unsaved progress will be lost.',
    confirm_delete_title:'Delete account?',confirm_delete_msg:'This action is irreversible. All your data will be deleted.',
    confirm_yes:'Confirm',confirm_no:'Cancel',
    session_back:'✕ Exit',
    notif_resume_in10:'Resume in 10 seconds!',notif_break:'Break time! Rest well 😊',
    notif_work_resume:'Back to work! 💪',notif_level_up:'Level {level}!',
    lvlup_title:'⬆️ Level {level}!',lvlup_reward:'You will unlock {reward} for Chronos!',lvlup_keep_going:'Keep it up! 💪',
    badge_hint_done:'You unlocked everything! 👑',
    badge_hint_next:'Level {level} → you will unlock {reward} for Chronos!',
    locker_equipped:'Equipped',locker_locked:'🔒',locker_level:'Lv.',
    ins_today:'Today',ins_this_week:'This week',ins_this_month:'This month',
    ins_events:'events',ins_hours:'hours',ins_active_days:'active days',
    ins_heatmap_title:'Activity — 52 weeks',ins_heatmap_less:'Less',ins_heatmap_more:'More',
    ins_xp_title:'XP — 30 days',ins_donut_title:'Breakdown',ins_donut_no_events:'No events',
    ins_wow_title:'This week vs last week',
    ins_wow_hours:'Planned hours',ins_wow_events:'Events',ins_wow_study:'Study sessions',ins_wow_streak:'Streak',
    type_study:'Study',type_work:'Work',type_sport:'Sport',type_social:'Social',type_leisure:'Leisure',type_other:'Other',
    wr_title:'Your weekly review 📊',wr_subtitle:'Chronos analyzed your week',
    wr_stat_hours:'Planned hours',wr_stat_study:'Study',wr_stat_events:'Events',
    wr_stat_days:'Active days',wr_stat_streak:'Streak 🔥',wr_stat_level:'Level',
    wr_chronos_feedback:'💬 Chronos Feedback',wr_later:'Later',wr_plan_week:'📋 Plan next week →',
    wr_feedback_excellent:'🔥 Excellent week! You planned {h}h — you are at the top!',
    wr_feedback_good:'👍 Good week with {h}h planned. Keep it up!',
    wr_feedback_ok:'📈 Moderate week with {h}h. Next week, try to aim for 10h+!',
    wr_feedback_light:'💡 Light week ({h}h). Start slowly — even 30min/day makes a big difference!',
    wr_advice_regular:'💡 For next week: maintain this regularity! Plan your sessions in advance to keep your momentum.',
    wr_advice_plan:'💡 For next week: try to plan at least 5 active days. Use AI generation to create your schedule in one click!',
    chronos_morning:'☀️ Good morning! Ready to plan?',chronos_lunch:'🍽️ Well-deserved lunch break!',
    chronos_afternoon:'⚡ Afternoons are for productive people!',chronos_evening:'🌙 Evening study session? I am here!',
    chronos_night:'🌟 Working late! Keep going!',
    chronos_streak:'🔥 {streak} day streak! Legendary!',chronos_session_done:'🎉 Session done! Great job!',
    chronos_xp:'⚡ +{xp} XP! Excellent!',chronos_badge:'🏅 Badge unlocked: {name}! Congrats!',
    chronos_tip1:'💡 Tip: plan your study sessions in 25min blocks!',
    chronos_tip2:'🎯 Weekly goal: beat your streak!',
    chronos_tip3:'📚 Do you have unreviewed events this week?',
    chronos_tip4:'⚡ A 20min session now is worth 1h tomorrow!',
    chronos_tip5:'🌟 Level {level} — you are almost at the next one!',
    pwd_weak:'Weak',pwd_medium:'Medium',pwd_strong:'Strong',pwd_very_strong:'Very strong',
    loader_1:'Chronos is preparing your schedule... ⚡',loader_2:'Syncing your data... 📡',
    loader_3:'Loading your events... 📅',loader_4:'Ready to be productive? 🚀',
    error_oops:'Oops!',error_generic:'Something went wrong.',error_retry:'Retry',
    on_date:'on',at_time:'at',
    isc_this_week:'This week',isc_study_sessions:'Study sessions',isc_streak:'Current streak',isc_xp_total:'Total XP',
  },
  de:{
    nav_planning:'Planung',nav_calendar:'Kalender',nav_insights:'Einblicke',nav_templates:'Vorlagen',nav_badges:'Abzeichen',nav_settings:'Einstellungen',
    btn_generate:'Generieren',start_session:'Lernsitzung starten',
    today:'📍 Heute',upcoming:'📅 Bevorstehend',profile:'Profil',events:'Ereignisse',streak:'Serie',hours:'Stunden',badges:'Abzeichen',info:'Informationen',firstname:'Vorname',save:'Speichern',
    language:'Sprache',notifications:'Benachrichtigungen',theme:'Thema',api_key:'Anthropic API-Schlüssel',api_hint:'Schlüssel lokal gespeichert.',
    privacy:'Datenschutz',change_pwd:'Passwort ändern',data:'Daten',export:'Daten exportieren',delete_account:'Konto löschen',
    talk:'💬 Sprechen',locker:'🎒 Spind',ai_assistant:'KI-Assistent',yes:'Ja',no:'Nein',close:'Schließen',cancel:'Abbrechen',start:'Starten',
    all_ranks:'🏆 Alle Ränge',change_priority:'Priorität:',
    session_duration:'Gesamtdauer (h)',work_block:'Arbeitsblock (Min)',break_block:'Pause (Min)',
    exit_session_title:'Sitzung beenden?',exit_session_desc:'Dein Fortschritt geht verloren.',no_stay:'Bleiben',yes_quit:'Verlassen',
    login_tab:'Anmelden',register_tab:'Registrieren',
    wcTitle:'Hallo! Ich bin Chronos!',wcDesc:'Dein KI-Assistent. Tutorial gewünscht?',wcSkip:'Nein danke',wcStart:'Ja ✨',
    week_this:'Diese Woche',week_next:'Nächste Woche',week_prev:'Letzte Woche',free:'Frei',no_events:'Keine Ereignisse',
    loading:'Chronos analysiert...',work_phase:'Arbeit 💪',break_phase:'Pause ☕',session_phase:'Sitzung',break_label:'Pause',
    revise_title:'📚 Was möchtest du lernen?',revise_subject:'Fach',revise_date:'Bis wann?',revise_gen:'Generieren 🚀',
    error_field:'Alle Felder ausfüllen',error_email:'Ungültige E-Mail',error_pwd:'Passwort: mind. 6 Zeichen',
    error_email_used:'E-Mail bereits verwendet',error_account:'Konto nicht gefunden',error_pwd_wrong:'Falsches Passwort',
    lang_changed:'✅ Sprache geändert',
    tut1:"Willkommen! 👋 Dies ist die KI-Zone. Beschreibe deinen Zeitplan und ich generiere ihn!",
    tut2:'Dein Wochenplan erscheint hier. Kurse aus der Vorlage werden auch angezeigt.',
    tut3:'Monatskalender. Klicke auf ein Datum um Ereignisse zu sehen 📅',
    tut4:'Einblicke zeigen deine Statistiken 📊',tut5:'Hier verdienst du XP und steigst auf! 🎖️',
    tut6:"Ich bin Chronos! Klick mich um zu chatten oder mein Kostüm im Spind zu ändern 🌟",
    obChooseProfile:'Profil wählen',obStudentTitle:'🎓 Schüler-Einrichtung',obWorkerTitle:'💼 Arbeiter-Einrichtung',obCustomTitle:'✨ Benutzerdefiniert',
    pcStudent:'Schüler',pcWorker:'Arbeiter',pcCustom:'Benutzerdefiniert',pcStudentDesc:'Kurse, Lernen, Prüfungen',pcWorkerDesc:'Projekte, Meetings, Deadlines',pcCustomDesc:'Ich richte es selbst ein',
    btnAddCourse:'Kurs hinzufügen',btnBack:'Zurück',btnFinish:'Fertig',
    lblMaxStudy:'Max Lernen/Tag (h)',lblMaxLeisure:'Max Freizeit/Tag (h)',lblBreakBetween:'Pause zwischen Events (Min)',
    lblWorkStart:'Arbeitsbeginn',lblWorkEnd:'Arbeitsende',lblMaxWork:'Max Arbeit/Tag (h)',lblBreakW:'Pause zwischen Aufgaben (Min)',
    lblMaxStudyC:'Max Lernen/Tag (h)',lblMaxLeisureC:'Max Freizeit/Tag (h)',lblBreakC:'Pause (Min)',
    lblEmail:'E-Mail',lblPassword:'Passwort',lblName:'Vorname',lblEmailR:'E-Mail',lblPasswordR:'Passwort',
    lblPasswordConfirm:'Passwort bestätigen',
    btnLogin:'Anmelden →',btnRegister:'Konto erstellen →',
    error_pwd_no_match:'Passwörter stimmen nicht überein',
    forgot_pwd_link:'Passwort vergessen?',forgot_pwd_title:'🔐 Passwort vergessen',
    forgot_pwd_desc:'Gib deine E-Mail ein, um einen Reset-Link zu erhalten.',
    forgot_pwd_send:'Link senden',forgot_pwd_sent:'✅ E-Mail gesendet! Prüfe dein Postfach.',
    forgot_pwd_error:'E-Mail-Adresse nicht gefunden.',
    tut7:'Jeden Montag zeige ich dir eine vollständige Wochenübersicht mit Statistiken und Tipps! 📊',
    day_s_mon:'Mo',day_s_tue:'Di',day_s_wed:'Mi',day_s_thu:'Do',day_s_fri:'Fr',day_s_sat:'Sa',day_s_sun:'So',
    day_monday:'Montag',day_tuesday:'Dienstag',day_wednesday:'Mittwoch',day_thursday:'Donnerstag',day_friday:'Freitag',day_saturday:'Samstag',day_sunday:'Sonntag',
    month_jan:'Jan',month_feb:'Feb',month_mar:'Mär',month_apr:'Apr',month_may:'Mai',month_jun:'Jun',
    month_jul:'Jul',month_aug:'Aug',month_sep:'Sep',month_oct:'Okt',month_nov:'Nov',month_dec:'Dez',
    week_n:'KW',sb_streak_label:'Tage Serie',
    ai_placeholder:"Sag mir, was du planen möchtest...\nBsp: Ich habe in 3 Tagen eine Matheprüfung, hilf mir beim Lernen",
    toast_events_created:'Ereignis(se) erstellt!',toast_reformulate:'Formuliere deine Anfrage um',
    toast_template_saved:'Vorlage gespeichert!',toast_template_changed:'Vorlage geändert!',
    toast_equipped:'Kostüm geändert!',toast_profile_saved:'Profil gespeichert',
    toast_pwd_changed:'Passwort geändert',toast_exported:'Daten exportiert!',
    toast_todo_added:'Zur To-do-Liste hinzugefügt!',toast_todo_write_something:'Schreib etwas!',
    toast_session_done:'Sitzung abgeschlossen! Gut gemacht!',toast_key_saved:'API-Schlüssel gespeichert',
    todo_done_all:'Alles erledigt!',todo_placeholder:'Aufgabe hinzufügen...',todo_add_btn:'Hinzufügen',
    confirm_reload_title:'Zur Startseite?',confirm_reload_msg:'Nicht gespeicherter Fortschritt geht verloren.',
    confirm_delete_title:'Konto löschen?',confirm_delete_msg:'Diese Aktion ist unwiderruflich. Alle Daten werden gelöscht.',
    confirm_yes:'Bestätigen',confirm_no:'Abbrechen',
    session_back:'✕ Beenden',
    notif_resume_in10:'In 10 Sekunden weiter!',notif_break:'Pause! Erhole dich 😊',
    notif_work_resume:'Weiter arbeiten! 💪',notif_level_up:'Level {level}!',
    lvlup_title:'⬆️ Level {level}!',lvlup_reward:'Du schaltest {reward} für Chronos frei!',lvlup_keep_going:'Weiter so! 💪',
    badge_hint_done:'Du hast alles freigeschaltet! 👑',
    badge_hint_next:'Level {level} → du schaltest {reward} für Chronos frei!',
    locker_equipped:'Ausgerüstet',locker_locked:'🔒',locker_level:'Lv.',
    ins_today:'Heute',ins_this_week:'Diese Woche',ins_this_month:'Dieser Monat',
    ins_events:'Ereignisse',ins_hours:'Stunden',ins_active_days:'aktive Tage',
    ins_heatmap_title:'Aktivität — 52 Wochen',ins_heatmap_less:'Weniger',ins_heatmap_more:'Mehr',
    ins_xp_title:'XP — 30 Tage',ins_donut_title:'Aufteilung',ins_donut_no_events:'Keine Ereignisse',
    ins_wow_title:'Diese Woche vs letzte Woche',
    ins_wow_hours:'Geplante Stunden',ins_wow_events:'Ereignisse',ins_wow_study:'Lernsitzungen',ins_wow_streak:'Serie',
    type_study:'Lernen',type_work:'Arbeit',type_sport:'Sport',type_social:'Sozial',type_leisure:'Freizeit',type_other:'Sonstiges',
    wr_title:'Deine Wochenübersicht 📊',wr_subtitle:'Chronos hat deine Woche analysiert',
    wr_stat_hours:'Geplante Stunden',wr_stat_study:'Lernen',wr_stat_events:'Ereignisse',
    wr_stat_days:'Aktive Tage',wr_stat_streak:'Serie 🔥',wr_stat_level:'Level',
    wr_chronos_feedback:'💬 Chronos Feedback',wr_later:'Später',wr_plan_week:'📋 Nächste Woche planen →',
    wr_feedback_excellent:'🔥 Exzellente Woche! Du hast {h}h geplant — du bist spitze!',
    wr_feedback_good:'👍 Gute Woche mit {h}h geplant. Weiter so!',
    wr_feedback_ok:'📈 Moderate Woche mit {h}h. Nächste Woche: Ziel 10h+!',
    wr_feedback_light:'💡 Leichte Woche ({h}h). Fang langsam an — selbst 30min/Tag macht einen Unterschied!',
    wr_advice_regular:'💡 Für nächste Woche: halte diese Regelmäßigkeit! Plane deine Sitzungen im Voraus.',
    wr_advice_plan:'💡 Für nächste Woche: versuche mindestens 5 aktive Tage zu planen. Nutze die KI-Generierung!',
    chronos_morning:'☀️ Guten Morgen! Bereit zu planen?',chronos_lunch:'🍽️ Wohlverdiente Mittagspause!',
    chronos_afternoon:'⚡ Der Nachmittag gehört den Produktiven!',chronos_evening:'🌙 Abendliches Lernen? Ich bin dabei!',
    chronos_night:'🌟 Du arbeitest spät! Weiter so!',
    chronos_streak:'🔥 {streak} Tage Serie! Legendär!',chronos_session_done:'🎉 Sitzung beendet! Super!',
    chronos_xp:'⚡ +{xp} XP! Ausgezeichnet!',chronos_badge:'🏅 Abzeichen freigeschaltet: {name}! Bravo!',
    chronos_tip1:'💡 Tipp: Plane Lernsitzungen in 25-Min-Blöcken!',
    chronos_tip2:'🎯 Wochenziel: deinen Streak brechen!',
    chronos_tip3:'📚 Hast du diese Woche nicht revidierte Ereignisse?',
    chronos_tip4:'⚡ Eine 20-Min-Sitzung jetzt = 1h morgen!',
    chronos_tip5:'🌟 Level {level} — du bist fast beim nächsten!',
    pwd_weak:'Schwach',pwd_medium:'Mittel',pwd_strong:'Stark',pwd_very_strong:'Sehr stark',
    loader_1:'Chronos erstellt deinen Plan... ⚡',loader_2:'Daten synchronisieren... 📡',
    loader_3:'Ereignisse laden... 📅',loader_4:'Bereit produktiv zu sein? 🚀',
    error_oops:'Hoppla!',error_generic:'Etwas ist schiefgelaufen.',error_retry:'Erneut versuchen',
    on_date:'am',at_time:'um',
    isc_this_week:'Diese Woche',isc_study_sessions:'Lernsitzungen',isc_streak:'Aktueller Streak',isc_xp_total:'Gesamt-XP',
  },
  es:{
    nav_planning:'Planificación',nav_calendar:'Calendario',nav_insights:'Estadísticas',nav_templates:'Plantillas',nav_badges:'Logros',nav_settings:'Ajustes',
    btn_generate:'Generar',start_session:'Iniciar sesión de estudio',
    today:'📍 Hoy',upcoming:'📅 Próximos',profile:'Perfil',events:'Eventos',streak:'Racha',hours:'Horas',badges:'Logros',info:'Información',firstname:'Nombre',save:'Guardar',
    language:'Idioma',notifications:'Notificaciones',theme:'Tema',api_key:'Clave API Anthropic',api_hint:'Clave almacenada localmente.',
    privacy:'Privacidad',change_pwd:'Cambiar contraseña',data:'Datos',export:'Exportar mis datos',delete_account:'Eliminar cuenta',
    talk:'💬 Hablar',locker:'🎒 Casillero',ai_assistant:'Asistente IA',yes:'Sí',no:'No',close:'Cerrar',cancel:'Cancelar',start:'Iniciar',
    all_ranks:'🏆 Todos los Rangos',change_priority:'Prioridad:',
    session_duration:'Duración total (h)',work_block:'Bloque trabajo (min)',break_block:'Descanso (min)',
    exit_session_title:'¿Salir?',exit_session_desc:'Tu progreso se perderá.',no_stay:'Quedarme',yes_quit:'Salir',
    login_tab:'Iniciar sesión',register_tab:'Registrarse',
    wcTitle:'¡Hola! Soy Chronos!',wcDesc:'Tu asistente IA. ¿Tutorial?',wcSkip:'No gracias',wcStart:'¡Sí ✨',
    week_this:'Esta semana',week_next:'Próxima semana',week_prev:'Semana pasada',free:'Libre',no_events:'Sin eventos',
    loading:'Chronos está analizando...',work_phase:'Trabajo 💪',break_phase:'Descanso ☕',session_phase:'Sesión',break_label:'Descanso',
    revise_title:'📚 ¿Qué estudiar?',revise_subject:'Materia',revise_date:'¿Para cuándo?',revise_gen:'Generar 🚀',
    error_field:'Completa todos los campos',error_email:'Email inválido',error_pwd:'Contraseña: mín. 6 caracteres',
    error_email_used:'Email ya usado',error_account:'Cuenta no encontrada',error_pwd_wrong:'Contraseña incorrecta',
    lang_changed:'✅ Idioma cambiado',
    tut1:"¡Bienvenido! 👋 Zona IA. ¡Describe tu horario y lo genero automáticamente!",
    tut2:'Tu horario semanal. Los cursos del modelo también aparecen.',
    tut3:'Calendario mensual. Clic en fecha para ver eventos 📅',tut4:'Estadísticas muestran tu progreso 📊',
    tut5:'¡Aquí ganas XP y subes de nivel! 🎖️',tut6:"¡Soy Chronos! Clic para chatear o cambiar disfraz en el Casillero 🌟",
    obChooseProfile:'Elige tu perfil',obStudentTitle:'🎓 Estudiante',obWorkerTitle:'💼 Trabajador',obCustomTitle:'✨ Personalizado',
    pcStudent:'Estudiante',pcWorker:'Trabajador',pcCustom:'Personalizado',pcStudentDesc:'Clases, estudio, exámenes',pcWorkerDesc:'Proyectos, reuniones, plazos',pcCustomDesc:'Lo configuro yo',
    btnAddCourse:'Añadir clase',btnBack:'Volver',btnFinish:'Terminar',
    lblMaxStudy:'Máx. estudio/día (h)',lblMaxLeisure:'Máx. ocio/día (h)',lblBreakBetween:'Pausa entre eventos (min)',
    lblWorkStart:'Inicio jornada',lblWorkEnd:'Fin jornada',lblMaxWork:'Máx. trabajo/día (h)',lblBreakW:'Pausa entre tareas (min)',
    lblMaxStudyC:'Máx. estudio/día (h)',lblMaxLeisureC:'Máx. ocio/día (h)',lblBreakC:'Pausa (min)',
    lblEmail:'Email',lblPassword:'Contraseña',lblName:'Nombre',lblEmailR:'Email',lblPasswordR:'Contraseña',
    lblPasswordConfirm:'Confirmar contraseña',
    btnLogin:'Iniciar sesión →',btnRegister:'Crear cuenta →',
    error_pwd_no_match:'Las contraseñas no coinciden',
    forgot_pwd_link:'¿Olvidaste tu contraseña?',forgot_pwd_title:'🔐 Contraseña olvidada',
    forgot_pwd_desc:'Ingresa tu email para recibir un enlace de restablecimiento.',
    forgot_pwd_send:'Enviar enlace',forgot_pwd_sent:'✅ ¡Email enviado! Revisa tu bandeja.',
    forgot_pwd_error:'Dirección de email no encontrada.',
    tut7:'Cada lunes te mostraré un resumen completo de tu semana con estadísticas y consejos! 📊',
    day_s_mon:'Lun',day_s_tue:'Mar',day_s_wed:'Mié',day_s_thu:'Jue',day_s_fri:'Vie',day_s_sat:'Sáb',day_s_sun:'Dom',
    day_monday:'Lunes',day_tuesday:'Martes',day_wednesday:'Miércoles',day_thursday:'Jueves',day_friday:'Viernes',day_saturday:'Sábado',day_sunday:'Domingo',
    month_jan:'Ene',month_feb:'Feb',month_mar:'Mar',month_apr:'Abr',month_may:'May',month_jun:'Jun',
    month_jul:'Jul',month_aug:'Ago',month_sep:'Sep',month_oct:'Oct',month_nov:'Nov',month_dec:'Dic',
    week_n:'Sem.',sb_streak_label:'días racha',
    ai_placeholder:"Dime qué quieres planificar...\nEj: Tengo un examen de mates en 3 días, ayúdame a estudiar",
    toast_events_created:'evento(s) creado(s)!',toast_reformulate:'Reformula tu solicitud',
    toast_template_saved:'¡Plantilla guardada!',toast_template_changed:'¡Plantilla cambiada!',
    toast_equipped:'¡Disfraz cambiado!',toast_profile_saved:'Perfil guardado',
    toast_pwd_changed:'Contraseña cambiada',toast_exported:'¡Datos exportados!',
    toast_todo_added:'¡Añadido a la lista!',toast_todo_write_something:'¡Escribe algo!',
    toast_session_done:'¡Sesión terminada! ¡Bien hecho!',toast_key_saved:'Clave API guardada',
    todo_done_all:'¡Todo hecho!',todo_placeholder:'Añadir tarea...',todo_add_btn:'Añadir',
    confirm_reload_title:'¿Volver al inicio?',confirm_reload_msg:'El progreso no guardado se perderá.',
    confirm_delete_title:'¿Eliminar cuenta?',confirm_delete_msg:'Esta acción es irreversible. Se eliminarán todos tus datos.',
    confirm_yes:'Confirmar',confirm_no:'Cancelar',
    session_back:'✕ Salir',
    notif_resume_in10:'¡Retoma en 10 segundos!',notif_break:'¡Descanso! Relájate 😊',
    notif_work_resume:'¡Vuelve al trabajo! 💪',notif_level_up:'¡Nivel {level}!',
    lvlup_title:'⬆️ ¡Nivel {level}!',lvlup_reward:'¡Desbloquearás {reward} para Chronos!',lvlup_keep_going:'¡Sigue así! 💪',
    badge_hint_done:'¡Lo desbloqueaste todo! 👑',
    badge_hint_next:'Nivel {level} → desbloquearás {reward} para Chronos!',
    locker_equipped:'Equipado',locker_locked:'🔒',locker_level:'Niv.',
    ins_today:'Hoy',ins_this_week:'Esta semana',ins_this_month:'Este mes',
    ins_events:'eventos',ins_hours:'horas',ins_active_days:'días activos',
    ins_heatmap_title:'Actividad — 52 semanas',ins_heatmap_less:'Menos',ins_heatmap_more:'Más',
    ins_xp_title:'XP — 30 días',ins_donut_title:'Distribución',ins_donut_no_events:'Sin eventos',
    ins_wow_title:'Esta semana vs semana pasada',
    ins_wow_hours:'Horas planificadas',ins_wow_events:'Eventos',ins_wow_study:'Sesiones estudio',ins_wow_streak:'Racha',
    type_study:'Estudio',type_work:'Trabajo',type_sport:'Deporte',type_social:'Social',type_leisure:'Ocio',type_other:'Otro',
    wr_title:'Tu resumen semanal 📊',wr_subtitle:'Chronos analizó tu semana',
    wr_stat_hours:'Horas planificadas',wr_stat_study:'Estudio',wr_stat_events:'Eventos',
    wr_stat_days:'Días activos',wr_stat_streak:'Racha 🔥',wr_stat_level:'Nivel',
    wr_chronos_feedback:'💬 Feedback de Chronos',wr_later:'Después',wr_plan_week:'📋 Planificar semana →',
    wr_feedback_excellent:'🔥 ¡Semana excelente! Planificaste {h}h — ¡estás en lo más alto!',
    wr_feedback_good:'👍 Buena semana con {h}h planificadas. ¡Sigue así!',
    wr_feedback_ok:'📈 Semana moderada con {h}h. ¡La próxima semana apunta a 10h+!',
    wr_feedback_light:'💡 Semana ligera ({h}h). Empieza despacio — ¡incluso 30min/día hace una gran diferencia!',
    wr_advice_regular:'💡 Para la próxima semana: ¡mantén esta regularidad! Planifica tus sesiones con anticipación.',
    wr_advice_plan:'💡 Para la próxima semana: intenta planificar al menos 5 días activos. ¡Usa la generación IA!',
    chronos_morning:'☀️ ¡Buenos días! ¿Listo para planificar?',chronos_lunch:'🍽️ ¡Pausa de almuerzo bien merecida!',
    chronos_afternoon:'⚡ ¡Las tardes son para los productivos!',chronos_evening:'🌙 ¿Sesión nocturna? ¡Aquí estoy!',
    chronos_night:'🌟 ¡Trabajas tarde! ¡Ánimo!',
    chronos_streak:'🔥 ¡{streak} días de racha! ¡Legendario!',chronos_session_done:'🎉 ¡Sesión terminada! ¡Genial!',
    chronos_xp:'⚡ +{xp} XP! ¡Excelente!',chronos_badge:'🏅 ¡Insignia desbloqueada: {name}! ¡Bravo!',
    chronos_tip1:'💡 Consejo: ¡planifica tus sesiones en bloques de 25min!',
    chronos_tip2:'🎯 Objetivo semanal: ¡supera tu racha!',
    chronos_tip3:'📚 ¿Tienes eventos sin revisar esta semana?',
    chronos_tip4:'⚡ ¡Una sesión de 20min ahora vale 1h mañana!',
    chronos_tip5:'🌟 Nivel {level} — ¡casi en el siguiente!',
    pwd_weak:'Débil',pwd_medium:'Medio',pwd_strong:'Fuerte',pwd_very_strong:'Muy fuerte',
    loader_1:'Chronos prepara tu plan... ⚡',loader_2:'Sincronizando tus datos... 📡',
    loader_3:'Cargando tus eventos... 📅',loader_4:'¿Listo para ser productivo? 🚀',
    error_oops:'¡Vaya!',error_generic:'Algo salió mal.',error_retry:'Reintentar',
    on_date:'el',at_time:'a las',
    isc_this_week:'Esta semana',isc_study_sessions:'Sesiones estudio',isc_streak:'Racha actual',isc_xp_total:'XP total',
  },
  it:{
    nav_planning:'Pianificazione',nav_calendar:'Calendario',nav_insights:'Statistiche',nav_templates:'Modelli',nav_badges:'Badge',nav_settings:'Impostazioni',
    btn_generate:'Genera',start_session:'Inizia sessione di studio',
    today:'📍 Oggi',upcoming:'📅 In arrivo',profile:'Profilo',events:'Eventi',streak:'Serie',hours:'Ore',badges:'Badge',info:'Informazioni',firstname:'Nome',save:'Salva',
    language:'Lingua',notifications:'Notifiche',theme:'Tema',api_key:'Chiave API Anthropic',api_hint:'Chiave salvata localmente.',
    privacy:'Privacy',change_pwd:'Cambia password',data:'Dati',export:'Esporta dati',delete_account:'Elimina account',
    talk:'💬 Parla',locker:'🎒 Armadietto',ai_assistant:'Assistente IA',yes:'Sì',no:'No',close:'Chiudi',cancel:'Annulla',start:'Avvia',
    all_ranks:'🏆 Tutti i Rank',change_priority:'Priorità:',
    session_duration:'Durata totale (h)',work_block:'Blocco lavoro (min)',break_block:'Pausa (min)',
    exit_session_title:'Uscire?',exit_session_desc:'I progressi andranno persi.',no_stay:'Rimani',yes_quit:'Esci',
    login_tab:'Accedi',register_tab:'Registrati',
    wcTitle:'Ciao! Sono Chronos!',wcDesc:'Il tuo assistente IA. Tutorial?',wcSkip:'No grazie',wcStart:'Sì ✨',
    week_this:'Questa settimana',week_next:'Settimana prossima',week_prev:'Settimana scorsa',free:'Libero',no_events:'Nessun evento',
    loading:'Chronos sta analizzando...',work_phase:'Lavoro 💪',break_phase:'Pausa ☕',session_phase:'Sessione',break_label:'Pausa',
    revise_title:'📚 Cosa studiare?',revise_subject:'Materia',revise_date:'Per quando?',revise_gen:'Genera 🚀',
    error_field:'Compila tutti i campi',error_email:'Email non valida',error_pwd:'Password: min. 6 caratteri',
    error_email_used:'Email già usata',error_account:'Account non trovato',error_pwd_wrong:'Password errata',
    lang_changed:'✅ Lingua cambiata',
    tut1:"Benvenuto! 👋 Zona IA. Descrivi l'orario e lo genero automaticamente!",
    tut2:'Il piano settimanale appare qui. Anche i corsi del modello!',
    tut3:'Calendario mensile. Clicca su una data 📅',tut4:'Le statistiche mostrano i progressi 📊',
    tut5:'Qui guadagni XP e sali di livello! 🎖️',tut6:"Sono Chronos! Cliccami per chattare o cambiare costume nell'Armadietto 🌟",
    obChooseProfile:'Scegli il profilo',obStudentTitle:'🎓 Studente',obWorkerTitle:'💼 Lavoratore',obCustomTitle:'✨ Personalizzato',
    pcStudent:'Studente',pcWorker:'Lavoratore',pcCustom:'Personalizzato',pcStudentDesc:'Lezioni, studio, esami',pcWorkerDesc:'Progetti, riunioni, scadenze',pcCustomDesc:'Lo configuro io',
    btnAddCourse:'Aggiungi corso',btnBack:'Indietro',btnFinish:'Termina',
    lblMaxStudy:'Max studio/giorno (h)',lblMaxLeisure:'Max svago/giorno (h)',lblBreakBetween:'Pausa tra eventi (min)',
    lblWorkStart:'Inizio giornata',lblWorkEnd:'Fine giornata',lblMaxWork:'Max lavoro/giorno (h)',lblBreakW:'Pausa tra attività (min)',
    lblMaxStudyC:'Max studio/giorno (h)',lblMaxLeisureC:'Max svago/giorno (h)',lblBreakC:'Pausa (min)',
    lblEmail:'Email',lblPassword:'Password',lblName:'Nome',lblEmailR:'Email',lblPasswordR:'Password',
    lblPasswordConfirm:'Conferma password',
    btnLogin:'Accedi →',btnRegister:'Crea account →',
    error_pwd_no_match:'Le password non corrispondono',
    forgot_pwd_link:'Password dimenticata?',forgot_pwd_title:'🔐 Password dimenticata',
    forgot_pwd_desc:'Inserisci la tua email per ricevere un link di reset.',
    forgot_pwd_send:'Invia link',forgot_pwd_sent:'✅ Email inviata! Controlla la tua casella.',
    forgot_pwd_error:'Indirizzo email non trovato.',
    tut7:'Ogni lunedì ti mostrerò un resoconto completo della tua settimana con statistiche e consigli! 📊',
    day_s_mon:'Lun',day_s_tue:'Mar',day_s_wed:'Mer',day_s_thu:'Gio',day_s_fri:'Ven',day_s_sat:'Sab',day_s_sun:'Dom',
    day_monday:'Lunedì',day_tuesday:'Martedì',day_wednesday:'Mercoledì',day_thursday:'Giovedì',day_friday:'Venerdì',day_saturday:'Sabato',day_sunday:'Domenica',
    month_jan:'Gen',month_feb:'Feb',month_mar:'Mar',month_apr:'Apr',month_may:'Mag',month_jun:'Giu',
    month_jul:'Lug',month_aug:'Ago',month_sep:'Set',month_oct:'Ott',month_nov:'Nov',month_dec:'Dic',
    week_n:'Sett.',sb_streak_label:'giorni serie',
    ai_placeholder:"Dimmi cosa vuoi pianificare...\nEs: Ho un esame di matematica tra 3 giorni, aiutami a studiare",
    toast_events_created:'evento/i creato/i!',toast_reformulate:'Riformula la tua richiesta',
    toast_template_saved:'Modello salvato!',toast_template_changed:'Modello cambiato!',
    toast_equipped:'Costume cambiato!',toast_profile_saved:'Profilo salvato',
    toast_pwd_changed:'Password cambiata',toast_exported:'Dati esportati!',
    toast_todo_added:'Aggiunto alla lista!',toast_todo_write_something:'Scrivi qualcosa!',
    toast_session_done:'Sessione completata! Ottimo!',toast_key_saved:'Chiave API salvata',
    todo_done_all:'Tutto fatto!',todo_placeholder:'Aggiungi attività...',todo_add_btn:'Aggiungi',
    confirm_reload_title:'Tornare alla home?',confirm_reload_msg:'I progressi non salvati andranno persi.',
    confirm_delete_title:'Eliminare account?',confirm_delete_msg:'Questa azione è irreversibile. Tutti i dati saranno eliminati.',
    confirm_yes:'Conferma',confirm_no:'Annulla',
    session_back:'✕ Esci',
    notif_resume_in10:'Riprendi tra 10 secondi!',notif_break:'Pausa! Riposati 😊',
    notif_work_resume:'Torna al lavoro! 💪',notif_level_up:'Livello {level}!',
    lvlup_title:'⬆️ Livello {level}!',lvlup_reward:'Sbloccherai {reward} per Chronos!',lvlup_keep_going:'Continua così! 💪',
    badge_hint_done:'Hai sbloccato tutto! 👑',
    badge_hint_next:'Livello {level} → sbloccherai {reward} per Chronos!',
    locker_equipped:'Equipaggiato',locker_locked:'🔒',locker_level:'Lv.',
    ins_today:'Oggi',ins_this_week:'Questa settimana',ins_this_month:'Questo mese',
    ins_events:'eventi',ins_hours:'ore',ins_active_days:'giorni attivi',
    ins_heatmap_title:'Attività — 52 settimane',ins_heatmap_less:'Meno',ins_heatmap_more:'Più',
    ins_xp_title:'XP — 30 giorni',ins_donut_title:'Ripartizione',ins_donut_no_events:'Nessun evento',
    ins_wow_title:'Questa settimana vs settimana scorsa',
    ins_wow_hours:'Ore pianificate',ins_wow_events:'Eventi',ins_wow_study:'Sessioni studio',ins_wow_streak:'Serie',
    type_study:'Studio',type_work:'Lavoro',type_sport:'Sport',type_social:'Sociale',type_leisure:'Svago',type_other:'Altro',
    wr_title:'Il tuo riepilogo settimanale 📊',wr_subtitle:'Chronos ha analizzato la tua settimana',
    wr_stat_hours:'Ore pianificate',wr_stat_study:'Studio',wr_stat_events:'Eventi',
    wr_stat_days:'Giorni attivi',wr_stat_streak:'Serie 🔥',wr_stat_level:'Livello',
    wr_chronos_feedback:'💬 Feedback di Chronos',wr_later:'Dopo',wr_plan_week:'📋 Pianifica la settimana →',
    wr_feedback_excellent:'🔥 Settimana eccellente! Hai pianificato {h}h — sei al top!',
    wr_feedback_good:'👍 Buona settimana con {h}h pianificate. Continua così!',
    wr_feedback_ok:'📈 Settimana moderata con {h}h. La prossima settimana punta a 10h+!',
    wr_feedback_light:'💡 Settimana leggera ({h}h). Inizia piano — anche 30min/giorno fa una grande differenza!',
    wr_advice_regular:"💡 Per la prossima settimana: mantieni questa regolarità! Pianifica le sessioni in anticipo.",
    wr_advice_plan:'💡 Per la prossima settimana: cerca di pianificare almeno 5 giorni attivi. Usa la generazione IA!',
    chronos_morning:'☀️ Buona mattina! Pronto a pianificare?',chronos_lunch:'🍽️ Pausa pranzo ben meritata!',
    chronos_afternoon:"⚡ Il pomeriggio è per i produttivi!",chronos_evening:'🌙 Sessione serale? Sono qui!',
    chronos_night:'🌟 Lavori tardi! Coraggio!',
    chronos_streak:'🔥 {streak} giorni di serie! Leggendario!',chronos_session_done:'🎉 Sessione terminata! Ottimo lavoro!',
    chronos_xp:'⚡ +{xp} XP! Eccellente!',chronos_badge:'🏅 Badge sbloccato: {name}! Bravo!',
    chronos_tip1:'💡 Consiglio: pianifica le sessioni in blocchi da 25min!',
    chronos_tip2:'🎯 Obiettivo settimanale: battere la tua serie!',
    chronos_tip3:'📚 Hai eventi non rivisti questa settimana?',
    chronos_tip4:'⚡ Una sessione da 20min ora vale 1h domani!',
    chronos_tip5:'🌟 Livello {level} — quasi al prossimo!',
    pwd_weak:'Debole',pwd_medium:'Medio',pwd_strong:'Forte',pwd_very_strong:'Molto forte',
    loader_1:'Chronos prepara il tuo piano... ⚡',loader_2:'Sincronizzazione dati... 📡',
    loader_3:'Caricamento eventi... 📅',loader_4:'Pronto a essere produttivo? 🚀',
    error_oops:'Ops!',error_generic:'Qualcosa è andato storto.',error_retry:'Riprova',
    on_date:'il',at_time:'alle',
    isc_this_week:'Questa settimana',isc_study_sessions:'Sessioni studio',isc_streak:'Serie attuale',isc_xp_total:'XP totali',
  },
  pt:{
    nav_planning:'Planejamento',nav_calendar:'Calendário',nav_insights:'Insights',nav_templates:'Modelos',nav_badges:'Conquistas',nav_settings:'Configurações',
    btn_generate:'Gerar',start_session:'Iniciar sessão de estudo',
    today:'📍 Hoje',upcoming:'📅 Em breve',profile:'Perfil',events:'Eventos',streak:'Sequência',hours:'Horas',badges:'Conquistas',info:'Informações',firstname:'Nome',save:'Salvar',
    language:'Idioma',notifications:'Notificações',theme:'Tema',api_key:'Chave API Anthropic',api_hint:'Chave salva localmente.',
    privacy:'Privacidade',change_pwd:'Alterar senha',data:'Dados',export:'Exportar dados',delete_account:'Excluir conta',
    talk:'💬 Falar',locker:'🎒 Armário',ai_assistant:'Assistente IA',yes:'Sim',no:'Não',close:'Fechar',cancel:'Cancelar',start:'Iniciar',
    all_ranks:'🏆 Todos os Ranks',change_priority:'Prioridade:',
    session_duration:'Duração total (h)',work_block:'Bloco trabalho (min)',break_block:'Pausa (min)',
    exit_session_title:'Sair da sessão?',exit_session_desc:'O progresso será perdido.',no_stay:'Ficar',yes_quit:'Sair',
    login_tab:'Entrar',register_tab:'Cadastrar',
    wcTitle:'Olá! Eu sou Chronos!',wcDesc:'Seu assistente IA. Tutorial?',wcSkip:'Não obrigado',wcStart:'Sim ✨',
    week_this:'Esta semana',week_next:'Próxima semana',week_prev:'Semana passada',free:'Livre',no_events:'Sem eventos',
    loading:'Chronos está analisando...',work_phase:'Trabalho 💪',break_phase:'Pausa ☕',session_phase:'Sessão',break_label:'Pausa',
    revise_title:'📚 O que estudar?',revise_subject:'Matéria',revise_date:'Para quando?',revise_gen:'Gerar 🚀',
    error_field:'Preencha todos os campos',error_email:'Email inválido',error_pwd:'Senha: mín. 6 caracteres',
    error_email_used:'Email já usado',error_account:'Conta não encontrada',error_pwd_wrong:'Senha incorreta',
    lang_changed:'✅ Idioma alterado',
    tut1:"Bem-vindo! 👋 Zona IA. Descreva o horário e gero automaticamente!",
    tut2:'O planejamento semanal aparece aqui. Cursos do modelo também!',
    tut3:'Calendário mensal. Clique numa data 📅',tut4:'Insights mostram seu progresso 📊',
    tut5:'Aqui ganha XP e sobe de nível! 🎖️',tut6:"Sou Chronos! Clique para conversar ou trocar fantasia no Armário 🌟",
    obChooseProfile:'Escolha seu perfil',obStudentTitle:'🎓 Estudante',obWorkerTitle:'💼 Trabalhador',obCustomTitle:'✨ Personalizado',
    pcStudent:'Estudante',pcWorker:'Trabalhador',pcCustom:'Personalizado',pcStudentDesc:'Aulas, revisão, exames',pcWorkerDesc:'Projetos, reuniões, prazos',pcCustomDesc:'Eu mesmo configuro',
    btnAddCourse:'Adicionar aula',btnBack:'Voltar',btnFinish:'Terminar',
    lblMaxStudy:'Máx. estudo/dia (h)',lblMaxLeisure:'Máx. lazer/dia (h)',lblBreakBetween:'Pausa entre eventos (min)',
    lblWorkStart:'Início do dia',lblWorkEnd:'Fim do dia',lblMaxWork:'Máx. trabalho/dia (h)',lblBreakW:'Pausa entre tarefas (min)',
    lblMaxStudyC:'Máx. estudo/dia (h)',lblMaxLeisureC:'Máx. lazer/dia (h)',lblBreakC:'Pausa (min)',
    lblEmail:'Email',lblPassword:'Senha',lblName:'Nome',lblEmailR:'Email',lblPasswordR:'Senha',
    lblPasswordConfirm:'Confirmar senha',
    btnLogin:'Entrar →',btnRegister:'Criar conta →',
    error_pwd_no_match:'As senhas não coincidem',
    forgot_pwd_link:'Esqueceu a senha?',forgot_pwd_title:'🔐 Senha esquecida',
    forgot_pwd_desc:'Digite seu email para receber um link de redefinição.',
    forgot_pwd_send:'Enviar link',forgot_pwd_sent:'✅ Email enviado! Verifique sua caixa de entrada.',
    forgot_pwd_error:'Endereço de email não encontrado.',
    tut7:'Toda segunda-feira mostrarei um resumo completo da sua semana com estatísticas e dicas! 📊',
    day_s_mon:'Seg',day_s_tue:'Ter',day_s_wed:'Qua',day_s_thu:'Qui',day_s_fri:'Sex',day_s_sat:'Sáb',day_s_sun:'Dom',
    day_monday:'Segunda',day_tuesday:'Terça',day_wednesday:'Quarta',day_thursday:'Quinta',day_friday:'Sexta',day_saturday:'Sábado',day_sunday:'Domingo',
    month_jan:'Jan',month_feb:'Fev',month_mar:'Mar',month_apr:'Abr',month_may:'Mai',month_jun:'Jun',
    month_jul:'Jul',month_aug:'Ago',month_sep:'Set',month_oct:'Out',month_nov:'Nov',month_dec:'Dez',
    week_n:'Sem.',sb_streak_label:'dias seguidos',
    ai_placeholder:"Diga-me o que quer planificar...\nEx: Tenho um exame de matemática em 3 dias, ajude-me a estudar",
    toast_events_created:'evento(s) criado(s)!',toast_reformulate:'Reformule sua solicitação',
    toast_template_saved:'Modelo salvo!',toast_template_changed:'Modelo alterado!',
    toast_equipped:'Fantasia alterada!',toast_profile_saved:'Perfil salvo',
    toast_pwd_changed:'Senha alterada',toast_exported:'Dados exportados!',
    toast_todo_added:'Adicionado à lista!',toast_todo_write_something:'Escreva algo!',
    toast_session_done:'Sessão concluída! Muito bem!',toast_key_saved:'Chave API salva',
    todo_done_all:'Tudo feito!',todo_placeholder:'Adicionar tarefa...',todo_add_btn:'Adicionar',
    confirm_reload_title:'Voltar ao início?',confirm_reload_msg:'O progresso não salvo será perdido.',
    confirm_delete_title:'Excluir conta?',confirm_delete_msg:'Esta ação é irreversível. Todos os dados serão excluídos.',
    confirm_yes:'Confirmar',confirm_no:'Cancelar',
    session_back:'✕ Sair',
    notif_resume_in10:'Retome em 10 segundos!',notif_break:'Pausa! Descanse bem 😊',
    notif_work_resume:'Volte ao trabalho! 💪',notif_level_up:'Nível {level}!',
    lvlup_title:'⬆️ Nível {level}!',lvlup_reward:'Você desbloqueará {reward} para o Chronos!',lvlup_keep_going:'Continue assim! 💪',
    badge_hint_done:'Você desbloqueou tudo! 👑',
    badge_hint_next:'Nível {level} → você desbloqueará {reward} para o Chronos!',
    locker_equipped:'Equipado',locker_locked:'🔒',locker_level:'Nv.',
    ins_today:'Hoje',ins_this_week:'Esta semana',ins_this_month:'Este mês',
    ins_events:'eventos',ins_hours:'horas',ins_active_days:'dias ativos',
    ins_heatmap_title:'Atividade — 52 semanas',ins_heatmap_less:'Menos',ins_heatmap_more:'Mais',
    ins_xp_title:'XP — 30 dias',ins_donut_title:'Distribuição',ins_donut_no_events:'Sem eventos',
    ins_wow_title:'Esta semana vs semana passada',
    ins_wow_hours:'Horas planejadas',ins_wow_events:'Eventos',ins_wow_study:'Sessões de estudo',ins_wow_streak:'Sequência',
    type_study:'Estudo',type_work:'Trabalho',type_sport:'Esporte',type_social:'Social',type_leisure:'Lazer',type_other:'Outro',
    wr_title:'Seu resumo semanal 📊',wr_subtitle:'Chronos analisou sua semana',
    wr_stat_hours:'Horas planejadas',wr_stat_study:'Estudo',wr_stat_events:'Eventos',
    wr_stat_days:'Dias ativos',wr_stat_streak:'Sequência 🔥',wr_stat_level:'Nível',
    wr_chronos_feedback:'💬 Feedback do Chronos',wr_later:'Depois',wr_plan_week:'📋 Planejar semana →',
    wr_feedback_excellent:'🔥 Semana excelente! Você planejou {h}h — está no topo!',
    wr_feedback_good:'👍 Boa semana com {h}h planejadas. Continue assim!',
    wr_feedback_ok:'📈 Semana moderada com {h}h. Na próxima tente atingir 10h+!',
    wr_feedback_light:'💡 Semana leve ({h}h). Comece devagar — mesmo 30min/dia faz grande diferença!',
    wr_advice_regular:'💡 Para a próxima semana: mantenha esta regularidade! Planeje suas sessões com antecedência.',
    wr_advice_plan:'💡 Para a próxima semana: tente planejar pelo menos 5 dias ativos. Use a geração IA!',
    chronos_morning:'☀️ Bom dia! Pronto para planejar?',chronos_lunch:'🍽️ Pausa para almoço bem merecida!',
    chronos_afternoon:'⚡ As tardes são para os produtivos!',chronos_evening:'🌙 Sessão noturna? Estou aqui!',
    chronos_night:'🌟 Trabalhando tarde! Coragem!',
    chronos_streak:'🔥 {streak} dias seguidos! Lendário!',chronos_session_done:'🎉 Sessão concluída! Ótimo trabalho!',
    chronos_xp:'⚡ +{xp} XP! Excelente!',chronos_badge:'🏅 Conquista desbloqueada: {name}! Parabéns!',
    chronos_tip1:'💡 Dica: planeje suas sessões em blocos de 25min!',
    chronos_tip2:'🎯 Meta semanal: superar sua sequência!',
    chronos_tip3:'📚 Você tem eventos não revisados esta semana?',
    chronos_tip4:'⚡ Uma sessão de 20min agora vale 1h amanhã!',
    chronos_tip5:'🌟 Nível {level} — quase no próximo!',
    pwd_weak:'Fraca',pwd_medium:'Média',pwd_strong:'Forte',pwd_very_strong:'Muito forte',
    loader_1:'Chronos prepara seu plano... ⚡',loader_2:'Sincronizando dados... 📡',
    loader_3:'Carregando eventos... 📅',loader_4:'Pronto para ser produtivo? 🚀',
    error_oops:'Ops!',error_generic:'Algo deu errado.',error_retry:'Tentar novamente',
    on_date:'em',at_time:'às',
    isc_this_week:'Esta semana',isc_study_sessions:'Sessões estudo',isc_streak:'Sequência atual',isc_xp_total:'XP total',
  },
  ar:{
    nav_planning:'التخطيط',nav_calendar:'التقويم',nav_insights:'الإحصاءات',nav_templates:'القوالب',nav_badges:'الشارات',nav_settings:'الإعدادات',
    btn_generate:'توليد',start_session:'بدء جلسة مراجعة',
    today:'📍 اليوم',upcoming:'📅 القادمة',profile:'الملف',events:'أحداث',streak:'سلسلة',hours:'ساعات',badges:'شارات',info:'معلومات',firstname:'الاسم',save:'حفظ',
    language:'اللغة',notifications:'إشعارات',theme:'موضوع',api_key:'مفتاح API',api_hint:'المفتاح محفوظ محليًا.',
    privacy:'خصوصية',change_pwd:'تغيير كلمة المرور',data:'بيانات',export:'تصدير',delete_account:'حذف الحساب',
    talk:'💬 تحدث',locker:'🎒 خزانة',ai_assistant:'مساعد ذكي',yes:'نعم',no:'لا',close:'إغلاق',cancel:'إلغاء',start:'ابدأ',
    all_ranks:'🏆 الرتب',change_priority:'أولوية:',
    session_duration:'المدة (ساعة)',work_block:'كتلة عمل (دقيقة)',break_block:'راحة (دقيقة)',
    exit_session_title:'الخروج؟',exit_session_desc:'سيُفقد تقدمك.',no_stay:'بقاء',yes_quit:'خروج',
    login_tab:'دخول',register_tab:'تسجيل',
    wcTitle:'مرحبًا! أنا كرونوس!',wcDesc:'مساعدك الذكي. هل تريد شرحًا؟',wcSkip:'لا شكرًا',wcStart:'نعم ✨',
    week_this:'هذا الأسبوع',week_next:'الأسبوع القادم',week_prev:'الأسبوع الماضي',free:'حر',no_events:'لا أحداث',
    loading:'كرونوس يحلل...',work_phase:'عمل 💪',break_phase:'راحة ☕',session_phase:'جلسة',break_label:'استراحة',
    revise_title:'📚 ماذا تريد أن تراجع؟',revise_subject:'المادة',revise_date:'لمتى؟',revise_gen:'توليد 🚀',
    error_field:'أكمل جميع الحقول',error_email:'بريد غير صالح',error_pwd:'كلمة المرور: 6 أحرف على الأقل',
    error_email_used:'البريد مستخدم',error_account:'الحساب غير موجود',error_pwd_wrong:'كلمة مرور خاطئة',
    lang_changed:'✅ تم تغيير اللغة',
    tut1:"مرحبًا! 👋 منطقة الذكاء الاصطناعي. صف جدولك وسأولده تلقائيًا!",
    tut2:'جدولك الأسبوعي يظهر هنا. مواد القالب تظهر أيضًا!',
    tut3:'التقويم الشهري. انقر على تاريخ 📅',tut4:'الإحصاءات تُظهر تقدمك 📊',
    tut5:'هنا تكسب XP وترتقي بالمستويات! 🎖️',tut6:"أنا كرونوس! انقر عليّ للمحادثة أو تغيير الملابس من الخزانة 🌟",
    obChooseProfile:'اختر ملفك',obStudentTitle:'🎓 إعداد الطالب',obWorkerTitle:'💼 إعداد العامل',obCustomTitle:'✨ مخصص',
    pcStudent:'طالب',pcWorker:'عامل',pcCustom:'مخصص',pcStudentDesc:'دروس، مراجعة، امتحانات',pcWorkerDesc:'مشاريع، اجتماعات، مواعيد',pcCustomDesc:'أنا أهيؤه بنفسي',
    btnAddCourse:'إضافة درس',btnBack:'رجوع',btnFinish:'إنهاء',
    lblMaxStudy:'أقصى مراجعة/يوم (ساعة)',lblMaxLeisure:'أقصى ترفيه/يوم (ساعة)',lblBreakBetween:'استراحة بين الأحداث (دقيقة)',
    lblWorkStart:'بداية اليوم',lblWorkEnd:'نهاية اليوم',lblMaxWork:'أقصى عمل/يوم (ساعة)',lblBreakW:'استراحة بين المهام (دقيقة)',
    lblMaxStudyC:'أقصى مراجعة/يوم (ساعة)',lblMaxLeisureC:'أقصى ترفيه/يوم (ساعة)',lblBreakC:'استراحة (دقيقة)',
    lblEmail:'البريد الإلكتروني',lblPassword:'كلمة المرور',lblName:'الاسم',lblEmailR:'البريد الإلكتروني',lblPasswordR:'كلمة المرور',
    lblPasswordConfirm:'تأكيد كلمة المرور',
    btnLogin:'تسجيل الدخول →',btnRegister:'إنشاء حساب →',
    error_pwd_no_match:'كلمتا المرور غير متطابقتين',
    forgot_pwd_link:'نسيت كلمة المرور؟',forgot_pwd_title:'🔐 نسيت كلمة المرور',
    forgot_pwd_desc:'أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين.',
    forgot_pwd_send:'إرسال الرابط',forgot_pwd_sent:'✅ تم إرسال البريد! تحقق من صندوق الوارد.',
    forgot_pwd_error:'عنوان البريد الإلكتروني غير موجود.',
    tut7:'كل يوم اثنين، سأعرض عليك ملخصاً كاملاً لأسبوعك مع إحصاءات ونصائح! 📊',
    day_s_mon:'إث',day_s_tue:'ثل',day_s_wed:'أر',day_s_thu:'خم',day_s_fri:'جم',day_s_sat:'سب',day_s_sun:'أح',
    day_monday:'الإثنين',day_tuesday:'الثلاثاء',day_wednesday:'الأربعاء',day_thursday:'الخميس',day_friday:'الجمعة',day_saturday:'السبت',day_sunday:'الأحد',
    month_jan:'يناير',month_feb:'فبراير',month_mar:'مارس',month_apr:'أبريل',month_may:'مايو',month_jun:'يونيو',
    month_jul:'يوليو',month_aug:'أغسطس',month_sep:'سبتمبر',month_oct:'أكتوبر',month_nov:'نوفمبر',month_dec:'ديسمبر',
    week_n:'أسبوع',sb_streak_label:'يوم متواصل',
    ai_placeholder:"أخبرني ماذا تريد أن تخطط...\nمثال: لدي امتحان رياضيات بعد 3 أيام، ساعدني في المراجعة",
    toast_events_created:'تم إنشاء الحدث/الأحداث!',toast_reformulate:'أعد صياغة طلبك',
    toast_template_saved:'تم حفظ القالب!',toast_template_changed:'تم تغيير القالب!',
    toast_equipped:'تم تغيير الزي!',toast_profile_saved:'تم حفظ الملف الشخصي',
    toast_pwd_changed:'تم تغيير كلمة المرور',toast_exported:'تم تصدير البيانات!',
    toast_todo_added:'تمت الإضافة إلى القائمة!',toast_todo_write_something:'اكتب شيئاً!',
    toast_session_done:'انتهت الجلسة! أحسنت!',toast_key_saved:'تم حفظ مفتاح API',
    todo_done_all:'كل شيء جاهز!',todo_placeholder:'أضف مهمة...',todo_add_btn:'إضافة',
    confirm_reload_title:'العودة للرئيسية؟',confirm_reload_msg:'ستُفقد التغييرات غير المحفوظة.',
    confirm_delete_title:'حذف الحساب؟',confirm_delete_msg:'هذا الإجراء لا رجعة فيه. ستُحذف جميع بياناتك.',
    confirm_yes:'تأكيد',confirm_no:'إلغاء',
    session_back:'✕ خروج',
    notif_resume_in10:'استأنف خلال 10 ثواني!',notif_break:'استراحة! استرح جيداً 😊',
    notif_work_resume:'عد إلى العمل! 💪',notif_level_up:'المستوى {level}!',
    lvlup_title:'⬆️ المستوى {level}!',lvlup_reward:'ستفتح {reward} لـ كرونوس!',lvlup_keep_going:'استمر هكذا! 💪',
    badge_hint_done:'فتحت كل شيء! 👑',
    badge_hint_next:'المستوى {level} → ستفتح {reward} لـ كرونوس!',
    locker_equipped:'مجهّز',locker_locked:'🔒',locker_level:'مست.',
    ins_today:'اليوم',ins_this_week:'هذا الأسبوع',ins_this_month:'هذا الشهر',
    ins_events:'أحداث',ins_hours:'ساعات',ins_active_days:'أيام نشطة',
    ins_heatmap_title:'النشاط — 52 أسبوعاً',ins_heatmap_less:'أقل',ins_heatmap_more:'أكثر',
    ins_xp_title:'XP — 30 يوماً',ins_donut_title:'التوزيع',ins_donut_no_events:'لا أحداث',
    ins_wow_title:'هذا الأسبوع مقابل الأسبوع الماضي',
    ins_wow_hours:'ساعات مخططة',ins_wow_events:'أحداث',ins_wow_study:'جلسات دراسة',ins_wow_streak:'سلسلة',
    type_study:'مراجعة',type_work:'عمل',type_sport:'رياضة',type_social:'اجتماعي',type_leisure:'ترفيه',type_other:'أخرى',
    wr_title:'ملخص أسبوعك 📊',wr_subtitle:'حلّل كرونوس أسبوعك',
    wr_stat_hours:'ساعات مخططة',wr_stat_study:'مراجعة',wr_stat_events:'أحداث',
    wr_stat_days:'أيام نشطة',wr_stat_streak:'سلسلة 🔥',wr_stat_level:'المستوى',
    wr_chronos_feedback:'💬 تعليق كرونوس',wr_later:'لاحقاً',wr_plan_week:'📋 تخطيط الأسبوع →',
    wr_feedback_excellent:'🔥 أسبوع رائع! خططت لـ {h} ساعة — أنت في القمة!',
    wr_feedback_good:'👍 أسبوع جيد مع {h} ساعة. استمر!',
    wr_feedback_ok:'📈 أسبوع معتدل مع {h} ساعة. الأسبوع القادم استهدف 10 ساعات+!',
    wr_feedback_light:'💡 أسبوع خفيف ({h} ساعة). ابدأ ببطء — حتى 30 دقيقة/يوم تحدث فرقاً كبيراً!',
    wr_advice_regular:'💡 للأسبوع القادم: حافظ على هذا الانتظام! خطط لجلساتك مسبقاً.',
    wr_advice_plan:'💡 للأسبوع القادم: حاول تخطيط 5 أيام نشطة على الأقل. استخدم توليد الذكاء الاصطناعي!',
    chronos_morning:'☀️ صباح الخير! مستعد للتخطيط؟',chronos_lunch:'🍽️ استراحة غداء مستحقة!',
    chronos_afternoon:'⚡ بعد الظهر للأشخاص المنتجين!',chronos_evening:'🌙 جلسة مسائية؟ أنا هنا!',
    chronos_night:'🌟 تعمل حتى الليل! شجاعة!',
    chronos_streak:'🔥 {streak} يوم متواصل! أسطوري!',chronos_session_done:'🎉 انتهت الجلسة! عمل رائع!',
    chronos_xp:'⚡ +{xp} XP! ممتاز!',chronos_badge:'🏅 تم فتح الشارة: {name}! أحسنت!',
    chronos_tip1:'💡 نصيحة: خطط لجلسات المراجعة في كتل 25 دقيقة!',
    chronos_tip2:'🎯 هدف الأسبوع: تجاوز سلسلتك!',
    chronos_tip3:'📚 هل لديك أحداث لم تراجعها هذا الأسبوع؟',
    chronos_tip4:'⚡ جلسة 20 دقيقة الآن تعادل ساعة غداً!',
    chronos_tip5:'🌟 المستوى {level} — أنت قريب من التالي!',
    pwd_weak:'ضعيفة',pwd_medium:'متوسطة',pwd_strong:'قوية',pwd_very_strong:'قوية جداً',
    loader_1:'كرونوس يعدّ خطتك... ⚡',loader_2:'مزامنة بياناتك... 📡',
    loader_3:'تحميل أحداثك... 📅',loader_4:'هل أنت مستعد للإنتاجية؟ 🚀',
    error_oops:'عذراً!',error_generic:'حدث خطأ ما.',error_retry:'إعادة المحاولة',
    on_date:'في',at_time:'الساعة',
    isc_this_week:'هذا الأسبوع',isc_study_sessions:'جلسات الدراسة',isc_streak:'السلسلة الحالية',isc_xp_total:'مجموع XP',
  }
};

function T(key){ return (LANGS[S.lang]||LANGS.fr)[key]||key; }

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=T(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ el.placeholder=T(el.dataset.i18nPlaceholder); });
  const ids={
    authTagline:'wcDesc', loadingTxt:'loading',
    wcTitle:'wcTitle', wcDesc:'wcDesc', wcSkip:'wcSkip', wcStart:'wcStart',
    tabLogin:'login_tab', tabRegister:'register_tab',
    lblEmail:'lblEmail',lblPassword:'lblPassword',lblName:'lblName',lblEmailR:'lblEmailR',lblPasswordR:'lblPasswordR',
    lblPasswordConfirm:'lblPasswordConfirm',
    btnLogin:'btnLogin',btnRegister:'btnRegister',
    forgotPwdLink:'forgot_pwd_link',
    forgotPwdTitle:'forgot_pwd_title',forgotPwdDesc:'forgot_pwd_desc',forgotPwdSend:'forgot_pwd_send',
    customConfirmNo:'confirm_no',customConfirmYes:'confirm_yes',
    lblMaxStudy:'lblMaxStudy',lblMaxLeisure:'lblMaxLeisure',lblBreakBetween:'lblBreakBetween',
    lblWorkStart:'lblWorkStart',lblWorkEnd:'lblWorkEnd',lblMaxWork:'lblMaxWork',lblBreakW:'lblBreakW',
    lblMaxStudyC:'lblMaxStudyC',lblMaxLeisureC:'lblMaxLeisureC',lblBreakC:'lblBreakC',
    btnAddCourse:'btnAddCourse',btnBack:'btnBack',btnFinish:'btnFinish',
    obChooseProfile:'obChooseProfile',obStudentTitle:'obStudentTitle',obWorkerTitle:'obWorkerTitle',obCustomTitle:'obCustomTitle',
    pcStudent:'pcStudent',pcWorker:'pcWorker',pcCustom:'pcCustom',
    pcStudentDesc:'pcStudentDesc',pcWorkerDesc:'pcWorkerDesc',pcCustomDesc:'pcCustomDesc',
    reviseTitle:'revise_title',reviseSubjectLabel:'revise_subject',reviseDateLabel:'revise_date',reviseConfirm:'revise_gen',
    chronoInitMsg:'wcDesc'
  };
  for(const [id,key] of Object.entries(ids)){const el=document.getElementById(id);if(el)el.textContent=T(key);}
  ['planning','calendar','insights','templates','badges','settings'].forEach(v=>{
    const el=document.querySelector('[data-view="'+v+'"] .nav-label');if(el)el.textContent=T('nav_'+v);
  });
  // Apply RTL for Arabic
  document.documentElement.lang = S.lang;
  document.documentElement.dir = (S.lang==='ar') ? 'rtl' : 'ltr';
}

/* ═══ XP / RANKS ═══ */
const XP_GAINS={daily_login:15,event_created:10,week_planned:50,badge_1day:20,badge_3day:30,badge_7day:50,badge_14day:75,badge_30day:120,badge_60day:200,badge_90day:350,badge_first:25};
const RANKS=[
  {name:'Bronze', minLv:1,  maxLv:8,   cls:'rank-bronze', icon:'🥉', color:'#CD7F32'},
  {name:'Silver', minLv:9,  maxLv:18,  cls:'rank-silver', icon:'🥈', color:'#A8A9AD'},
  {name:'Gold',   minLv:19, maxLv:30,  cls:'rank-gold',   icon:'🥇', color:'#FFD700'},
  {name:'Diamond',minLv:31, maxLv:45,  cls:'rank-diamond',icon:'💎', color:'#B9F2FF'},
  {name:'Master', minLv:46, maxLv:65,  cls:'rank-master', icon:'🔮', color:'#9B59B6'},
  {name:'Legend', minLv:66, maxLv:999, cls:'rank-legend', icon:'👑', color:'#FF4500'}
];
function xpForLv(l){if(l<=3)return 80*l;if(l<=10)return Math.round(150*Math.pow(1.3,l-3));if(l<=30)return Math.round(400*Math.pow(1.2,l-10));return Math.round(1200*Math.pow(1.15,l-30));}
function totalXpForLv(l){let t=0;for(let i=1;i<l;i++)t+=xpForLv(i);return t;}
function curLvXp(){return S.xp-totalXpForLv(S.level);}
function nextLvXp(){return xpForLv(S.level);}
function getRank(l){return RANKS.find(r=>l>=r.minLv&&l<=r.maxLv)||RANKS[0];}

function addXp(amt){
  const prev=S.level; S.xp+=amt; S.totalXpEarned+=amt;
  while(S.xp>=totalXpForLv(S.level+1))S.level++;
  if(S.level>prev){const reward=LEVEL_REWARDS[S.level]||null;showLevelUpNotif(S.level,reward);updateMascot();syncAllKoros();setTimeout(updateRankDisplays,300);if(S.notifications)sendNotif('⬆️ ChronoFlow',T('notif_level_up').replace('{level}',S.level)+(reward?' '+T('lvlup_reward').replace('{reward}',reward):''));saveState();}
  showXpPop('+'+amt+' XP'); saveState(); updateXpBar();
}
function showXpPop(txt){const el=document.getElementById('xpPopup');if(!el)return;el.textContent=txt;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2000);}

function updateXpBar(){
  const rank=getRank(S.level);
  const cur=curLvXp(),need=nextLvXp(),pct=Math.min(100,Math.round((cur/need)*100));
  const ll=document.getElementById('xpLevelLabel');if(ll)ll.textContent=T('wr_stat_level')+' '+S.level;
  const bf=document.getElementById('xpBarFill');if(bf)bf.style.width=pct+'%';
  const bt=document.getElementById('xpBarText');if(bt)bt.textContent=cur+' / '+need+' XP';
  const rp=document.getElementById('xpRankPill');
  if(rp){rp.textContent=rank.icon+' '+rank.name+' ▼';rp.className='xp-rank-pill '+rank.cls;}
  updateBadgeHint();
}
function updateRankDisplays(){
  const rank=getRank(S.level);
  const rb=document.getElementById('profileRankBadge');if(rb)rb.innerHTML='<span class="'+rank.cls+'" style="font-weight:700">'+rank.icon+' '+rank.name+'</span>';
  const ab=document.getElementById('headerAvatarBtn');if(ab){ab.style.borderColor=rank.color;ab.style.boxShadow='0 0 10px '+rank.color+'55';}
  updateMascot();
}

/* ═══ CHRONOS LOCKER ═══ */
const CHRONOS_ITEMS=[
  {id:'default', icon:'👔', name:'Costume de base', lvl:1,  type:'suit', bg:''},
  {id:'dark',    icon:'🌑', name:'Costume Sombre',  lvl:2,  type:'suit', bg:'linear-gradient(160deg,#080808,#111)'},
  {id:'gold_tie',icon:'✨', name:'Cravate Dorée',   lvl:3,  type:'tie'},
  {id:'star',    icon:'🌟', name:'Costume Étoilé',  lvl:5,  type:'suit', bg:'linear-gradient(160deg,#1a1040,#2d1b6e)'},
  {id:'glasses', icon:'👓', name:'Lunettes',        lvl:8,  type:'acc'},
  {id:'diamond', icon:'💎', name:'Costume Diamant', lvl:10, type:'suit', bg:'linear-gradient(160deg,#0a2a3a,#0d3d5a)'},
  {id:'cape',    icon:'🦸', name:'Cape Légende',    lvl:15, type:'acc'},
  {id:'wings',   icon:'🪶', name:'Ailes',           lvl:20, type:'acc'},
  {id:'batman',  icon:'🦇', name:'Costume Batman',  lvl:25, type:'suit', bg:'linear-gradient(160deg,#0a0a0a,#1a1a1a)'},
  {id:'crown',   icon:'👑', name:'Couronne',        lvl:30, type:'acc'},
  {id:'ironman', icon:'🤖', name:'Armure Iron Man', lvl:35, type:'suit', bg:'linear-gradient(160deg,#8B0000,#FFD700)'},
  {id:'wizard',  icon:'🧙', name:'Chapeau Mage',    lvl:40, type:'acc'},
  {id:'halo',    icon:'😇', name:'Auréole',         lvl:50, type:'acc'},
];
const LEVEL_REWARDS={2:'costume Sombre 🌑',3:'Cravate Dorée ✨',5:'costume Étoilé 🌟',8:'Lunettes 👓',10:'costume Diamant 💎',15:'Cape 🦸',20:'Ailes 🪶',25:'costume Batman 🦇',30:'Couronne 👑',35:'Armure Iron Man 🤖',40:'Chapeau Mage 🧙',50:'Auréole 😇'};

function updateMascot(){
  const rank=getRank(S.level);
  const rankKey=rank.cls.replace('rank-',''); // e.g. 'gold'
  // Apply rank class to ALL chronos-figure elements
  document.querySelectorAll('.chronos-figure').forEach(el=>{
    el.className=el.className.replace(/ch-rank-\S+/g,'').trim();
    el.classList.add('ch-rank-'+rankKey);
  });
  // Apply equipped item to gown color
  const item=CHRONOS_ITEMS.find(i=>i.id===S.equippedItem)||CHRONOS_ITEMS[0];
  document.querySelectorAll('.ch-gown').forEach(el=>{
    el.style.background=item.type==='suit'&&item.bg?item.bg:'';
  });
  document.querySelectorAll('.ch-tie').forEach(el=>{
    el.style.background=S.equippedItem==='gold_tie'?'linear-gradient(180deg,#FFD700,#c4a800)':'';
  });
  // Profile avatar border = rank color
  const av=document.querySelector('.profile-av');
  if(av){av.style.borderColor=rank.color;av.style.boxShadow='0 0 0 3px '+rank.color+'33';}
}
function updateLockerGrid(){
  const g=document.getElementById('lockerGrid');if(!g)return;
  g.innerHTML=CHRONOS_ITEMS.map(item=>{
    const un=S.level>=item.lvl,eq=S.equippedItem===item.id;
    return '<div class="locker-item'+(eq?' equipped':'')+(un?'':' locked')+'" onclick="'+(un?'equipItem(\''+item.id+'\')':'')+'">'
      +'<div class="li-icon">'+item.icon+'</div><div class="li-name">'+item.name+'</div><div class="li-lvl">'+T('locker_level')+item.lvl+'</div>'
      +(eq?'<div class="li-badge">'+T('locker_equipped')+'</div>':(un?'':T('locker_locked')))+'</div>';
  }).join('');
}
function equipItem(id){S.equippedItem=id;localStorage.setItem('cf_equipped',id);updateLockerGrid();updateMascot();toast('✅ '+T('toast_equipped'));saveState();}

/* ═══ BADGES ═══ */
const ALL_BADGES=[
  {id:'first',emoji:'⚡',name:'Premier pas',  desc:'1er événement',      xp:XP_GAINS.badge_first, msg:"Bienvenue !",         cond:()=>(S.user?.totalEvents||0)>=1},
  {id:'3d',   emoji:'🔥',name:'3 Jours',      desc:'Streak de 3 jours',  xp:XP_GAINS.badge_3day,  msg:"Bonne habitude !",    cond:()=>S.streak>=3},
  {id:'7d',   emoji:'✨',name:'Semaine',      desc:'Streak de 7 jours',  xp:XP_GAINS.badge_7day,  msg:"Une semaine !",       cond:()=>S.streak>=7},
  {id:'14d',  emoji:'💪',name:'Quinzaine',    desc:'Streak de 14 jours', xp:XP_GAINS.badge_14day, msg:"Deux semaines !",     cond:()=>S.streak>=14},
  {id:'30d',  emoji:'🌟',name:'Un mois',      desc:'Streak de 30 jours', xp:XP_GAINS.badge_30day, msg:"Un mois !",           cond:()=>S.streak>=30},
  {id:'60d',  emoji:'💎',name:'Deux mois',    desc:'Streak de 60 jours', xp:XP_GAINS.badge_60day, msg:"Tu es une machine !", cond:()=>S.streak>=60},
  {id:'90d',  emoji:'👑',name:'Légende',      desc:'Streak de 90 jours', xp:XP_GAINS.badge_90day, msg:"LÉGENDE !",           cond:()=>S.streak>=90},
  {id:'ev10', emoji:'📋',name:'Planificateur',desc:'10 événements',      xp:30, msg:"Pro !",                                 cond:()=>(S.user?.totalEvents||0)>=10},
  {id:'ev50', emoji:'🗓️',name:'Organisateur', desc:'50 événements',      xp:80, msg:"Top !",                                 cond:()=>(S.user?.totalEvents||0)>=50},
];
const unlockedBadges=new Set(); // chargé depuis Firestore via loadBadgesFromUser()
function checkBadges(){
  ALL_BADGES.forEach(b=>{if(!unlockedBadges.has(b.id)&&b.cond()){unlockedBadges.add(b.id);saveState();toast('🏅 Badge : '+b.name);if(b.xp>0)setTimeout(()=>addXpV2(b.xp),500);}});
}
function updateBadgeHint(){
  const el=document.getElementById('chronoBadgeText');if(!el)return;
  const next=Object.keys(LEVEL_REWARDS).map(Number).sort((a,b)=>a-b).find(l=>l>S.level);
  if(!next){el.innerHTML=T('badge_hint_done');return;}
  el.innerHTML=T('badge_hint_next').replace('{level}','<strong>'+next+'</strong>').replace('{reward}','<strong>'+LEVEL_REWARDS[next]+'</strong>');
}

/* ═══ TUTORIAL ═══ */
const TUT_STEPS=[
  {view:'planning',target:'aiPanel',      txtKey:'tut1'},
  {view:'planning',target:'planningGrid', txtKey:'tut2'},
  {view:'calendar',target:'monthCal',     txtKey:'tut3'},
  {view:'insights',target:'insightsGrid', txtKey:'tut4'},
  {view:'badges',  target:'xpSection',    txtKey:'tut5'},
  {view:'planning',target:'mascot',       txtKey:'tut6'},
  {view:'insights',target:'weeklyReviewBtnInsights', txtKey:'tut7'},
];

/* ═══ FLAG SVGs ═══ */
const FLAG_SVGS={
  fr:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#002395"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#ED2939"/></svg>',
  en:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="7"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="11"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6"/></svg>',
  de:'<svg viewBox="0 0 60 40"><rect width="60" height="13.3" fill="#000"/><rect y="13.3" width="60" height="13.3" fill="#DD0000"/><rect y="26.6" width="60" height="13.4" fill="#FFCE00"/></svg>',
  es:'<svg viewBox="0 0 60 40"><rect width="60" height="8" fill="#c60b1e"/><rect y="8" width="60" height="24" fill="#ffc400"/><rect y="32" width="60" height="8" fill="#c60b1e"/></svg>',
  it:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#CE2B37"/></svg>',
  pt:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#E21C1C"/><rect width="24" height="40" fill="#006600"/><circle cx="24" cy="20" r="8" fill="#FFFF00" stroke="#006600" stroke-width="1.5"/></svg>',
  ar:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#006C35"/><rect width="20" height="40" fill="#fff"/><circle cx="32" cy="20" r="7" fill="#006C35" stroke="#fff" stroke-width="2"/></svg>',
};
const LANG_NAMES={fr:'Français',en:'English',de:'Deutsch',es:'Español',it:'Italiano',pt:'Português',ar:'العربية'};

/* ═══ PARTICLES ═══ */
function makeParticles(id){
  const c=document.getElementById(id);if(!c)return;
  for(let i=0;i<18;i++){const p=document.createElement('div');p.className='particle';p.style.cssText='left:'+Math.random()*100+'%;bottom:-10px;--drift:'+(Math.random()*200-100)+'px;animation-duration:'+(6+Math.random()*8)+'s;animation-delay:'+(Math.random()*8)+'s;width:'+(3+Math.random()*4)+'px;height:'+(3+Math.random()*4)+'px';c.appendChild(p);}
}

/* ═══ INIT ═══ */
function initApp(){
  S.lang = localStorage.getItem('cf_lang') || 'fr';
  S.equippedItem = localStorage.getItem('cf_equipped') || 'default';
  applyTheme(localStorage.getItem('cf_theme') || 'dark');
  makeParticles('particlesLang');makeParticles('particles');makeParticles('particles2');
  applyI18n();
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')handleEsc();
    if((e.key===' '||e.key==='Spacebar')&&S.sessionActive&&e.target.tagName!=='INPUT'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();toggleSession();}
  });
  document.addEventListener('click',e=>{if(!e.target.closest('#langDDWrap'))closeLangDD();});
  // Password strength listener
  const regPwd=document.getElementById('regPassword');
  if(regPwd)regPwd.addEventListener('input',()=>checkPasswordStrength(regPwd.value));

  window.FB.fbOnAuthChange(async (uid) => {
    if(uid){
      try{
        const userData = await window.FB.fbGetUser(uid);
        if(userData){
          S.user          = userData;
          S.xp            = userData.xp            || 0;
          S.level         = userData.level          || 1;
          S.totalXpEarned = userData.totalXpEarned  || 0;
          S.streak        = userData.streak         || 0;
          S.lastUsedDate  = userData.lastUsedDate   || null;
          S.tutorialDone  = userData.tutorialDone   || false;
          S.template      = userData.template       || 'custom';
          S.templateData  = Object.assign({maxStudy:4,maxLeisure:3,breakMin:10,courses:[],workStart:'09:00',workEnd:'18:00',maxWork:8}, userData.templateData||{});
          S.theme         = userData.theme          || 'dark';
          S.lang          = userData.lang           || S.lang;
          S.notifications = userData.notifications !== undefined ? userData.notifications : true;
          S.equippedItem  = userData.equippedItem   || 'default';
          S.todos         = userData.todos          || [];
          if(userData.unlockedBadges) userData.unlockedBadges.forEach(id=>unlockedBadges.add(id));
          S.events = await window.FB.fbGetEvents(uid);
          localStorage.setItem('cf_lang', S.lang);
          localStorage.setItem('cf_equipped', S.equippedItem);
          localStorage.setItem('cf_theme', S.theme);
          launchApp();
        }
      }catch(e){
        console.error('Erreur chargement données:', e);
        document.getElementById('authScreen').style.display='flex';
      }
    } else {
      const hasLang = localStorage.getItem('cf_lang');
      if(!hasLang){ document.getElementById('langScreen').style.display='flex'; }
      else { document.getElementById('authScreen').style.display='flex'; }
    }
  });
}

function handleEsc(){
  if(S.sessionActive){
    const exitModal=document.getElementById('exitSessionModal');
    if(exitModal&&exitModal.classList.contains('show')){
      // Escape sur la modal de confirmation = rester
      exitModal.classList.remove('show');
    } else {
      tryExitSession();
    }
    return;
  }
  document.querySelectorAll('.modal.show,.modal-full.show').forEach(m=>m.classList.remove('show'));
}

/* ═══ LANGUAGE ═══ */
function selectLang(lang){
  S.lang=lang;localStorage.setItem('cf_lang',lang);
  document.documentElement.lang=lang;
  document.documentElement.dir=(lang==='ar')?'rtl':'ltr';
  document.getElementById('langScreen').style.display='none';
  document.getElementById('authScreen').style.display='flex';
  applyI18n();updateLangDD();
}
function setLang(lang){
  S.lang=lang;localStorage.setItem('cf_lang',lang);
  document.documentElement.lang=lang;
  document.documentElement.dir=(lang==='ar')?'rtl':'ltr';
  updateLangDD();closeLangDD();toast(T('lang_changed'));applyI18n();
  saveState();
}
function updateLangDD(){
  const f=document.getElementById('langDDFlag');if(f)f.innerHTML=FLAG_SVGS[S.lang]||FLAG_SVGS.fr;
  const n=document.getElementById('langDDName');if(n)n.textContent=LANG_NAMES[S.lang]||'Français';
}
function toggleLangDD(){document.getElementById('langDDMenu')?.classList.toggle('open');document.getElementById('langDDBtn')?.classList.toggle('open');}
function closeLangDD(){document.getElementById('langDDMenu')?.classList.remove('open');document.getElementById('langDDBtn')?.classList.remove('open');}

/* ═══ AUTH ═══ */
function switchAuthTab(tab){
  if(tab===curAuthTab)return;curAuthTab=tab;
  const sl=document.getElementById('authTabSlider');
  const lf=document.getElementById('loginForm');const rf=document.getElementById('registerForm');
  const tl=document.getElementById('tabLogin');const tr=document.getElementById('tabRegister');
  if(tab==='register'){
    sl.classList.add('to-right');tl.classList.remove('active');tr.classList.add('active');
    lf.style.display='none';lf.classList.remove('active');
    rf.style.display='flex';rf.classList.add('active');
  }else{
    sl.classList.remove('to-right');tr.classList.remove('active');tl.classList.add('active');
    rf.style.display='none';rf.classList.remove('active');
    lf.style.display='flex';lf.classList.add('active');
  }
}
async function handleLogin(){
  const email=document.getElementById('loginEmail').value.trim();
  const pass=document.getElementById('loginPassword').value;
  if(!email||!pass){toast('⚠️ '+T('error_field'));return;}
  const btn=document.getElementById('btnLogin');if(btn)btn.disabled=true;
  try{
    await window.FB.fbLogin(email,pass);
    // fbOnAuthChange déclenche launchApp automatiquement
  }catch(e){
    const msg=e.code==='auth/user-not-found'||e.code==='auth/invalid-credential'?T('error_account')
      :e.code==='auth/wrong-password'?T('error_pwd_wrong')
      :e.code==='auth/invalid-email'?T('error_email')
      :e.message;
    toast('❌ '+msg);
  }finally{if(btn)btn.disabled=false;}
}
async function handleRegister(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass=document.getElementById('regPassword').value;
  const passConfirm=(document.getElementById('regPasswordConfirm')||{}).value||'';
  if(!name||!email||!pass){toast('⚠️ '+T('error_field'));return;}
  if(!email.includes('@')){toast('⚠️ '+T('error_email'));return;}
  if(pass.length<6){toast('⚠️ '+T('error_pwd'));return;}
  if(passConfirm&&pass!==passConfirm){toast('⚠️ '+T('error_pwd_no_match'));return;}
  const btn=document.getElementById('btnRegister');if(btn)btn.disabled=true;
  try{
    const uid=await window.FB.fbRegister(name,email,pass);
    S.user={uid,name,email,avatar:'',totalEvents:0};
    S.template='custom';S.events=[];S.streak=0;S.xp=0;S.level=1;S.todos=[];
    document.getElementById('authScreen').style.display='none';
    document.getElementById('onboardingScreen').style.display='flex';
  }catch(e){
    const msg=e.code==='auth/email-already-in-use'?T('error_email_used')
      :e.code==='auth/invalid-email'?T('error_email')
      :e.code==='auth/weak-password'?T('error_pwd')
      :e.message;
    toast('❌ '+msg);
  }finally{if(btn)btn.disabled=false;}
}

/* ═══ ONBOARDING ═══ */
function goObStep(step){
  document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));
  const ids={1:'obStep1','2s':'obStep2','2w':'obStep2w','2c':'obStep2c'};
  const el=document.getElementById(ids[step]||'obStep1');if(el)el.classList.add('active');
}
function selectProfile(type){
  S.template=type;
  if(type==='student')goObStep('2s');
  else if(type==='worker')goObStep('2w');
  else goObStep('2c');
}
function addCourse(){
  const c=document.getElementById('coursesContainer');if(!c)return;
  const row=document.createElement('div');row.className='course-row';
  const DAYS_LONG=[T('day_monday'),T('day_tuesday'),T('day_wednesday'),T('day_thursday'),T('day_friday'),T('day_saturday')];
  row.innerHTML='<div class="cf-select-wrap"><select class="sel">'+DAYS_LONG.map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select></div><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="'+T('revise_subject')+'"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';
  c.appendChild(row);
}
async function finishOnboarding(){
  const td=S.templateData;
  if(S.template==='student'){
    const rows=document.querySelectorAll('.course-row');
    td.courses=Array.from(rows).map(r=>({day:+r.querySelector('.sel').value,start:r.querySelectorAll('.tinp')[0].value,end:r.querySelectorAll('.tinp')[1].value,subject:r.querySelector('.sinp').value})).filter(c=>c.subject);
    td.maxStudy=+(document.getElementById('obMaxStudy')?.value)||4;
    td.maxLeisure=+(document.getElementById('obMaxLeisure')?.value)||3;
    td.breakMin=+(document.getElementById('obBreakBetween')?.value)||10;
  }else if(S.template==='worker'){
    td.workStart=document.getElementById('workStart')?.value||'09:00';
    td.workEnd=document.getElementById('workEnd')?.value||'18:00';
    td.maxWork=+(document.getElementById('obMaxWork')?.value)||8;
    td.breakMin=+(document.getElementById('obBreakWork')?.value)||10;
  }else{
    td.maxStudy=+(document.getElementById('obMaxStudyC')?.value)||4;
    td.maxLeisure=+(document.getElementById('obMaxLeisureC')?.value)||3;
    td.breakMin=+(document.getElementById('obBreakCustom')?.value)||10;
  }
  S.lastUsedDate=new Date().toISOString();
  document.getElementById('onboardingScreen').style.display='none';
  if(S.user?.uid){
    await window.FB.fbSaveUser(S.user.uid,{template:S.template,templateData:S.templateData,lastUsedDate:S.lastUsedDate});
  }
  launchApp();
}

/* ═══ LAUNCH APP ═══ */
function launchApp(){
  setTimeout(()=>{
    const c=document.getElementById('mainContent');
    if(c)c.addEventListener('scroll',()=>{const m=document.getElementById('mascot');if(m){m.classList.add('spy-mode');clearTimeout(m._st);m._st=setTimeout(()=>m.classList.remove('spy-mode'),1800);}});
  },500);
  document.getElementById('authScreen').style.display='none';
  document.getElementById('onboardingScreen').style.display='none';
  document.getElementById('appScreen').style.display='flex';
  applyTheme(S.theme);updateHeader();updateAllViews();
  updateMascot();updateRankDisplays();updateXpBar();
  updateLangDD();initToggles();applyI18n();
  checkStreak();
  const today=new Date().toDateString();
  const lastLogin=localStorage.getItem('cf_last_login');
  if(lastLogin!==today){
    localStorage.setItem('cf_last_login',today);
    setTimeout(()=>addXpV2(XP_GAINS.daily_login),800);
  }
  if(!S.tutorialDone)setTimeout(()=>document.getElementById('welcomeModal').classList.add('show'),700);
  // Sidebar hover zone
  const hz=document.getElementById('sidebarHoverZone');
  if(hz){hz.addEventListener('mouseenter',()=>toggleSidebar(true));
  document.getElementById('sidebar')?.addEventListener('mouseleave',(e)=>{if(!e.relatedTarget||!e.currentTarget.contains(e.relatedTarget))toggleSidebar(false);});}
  requestNotifPermission();
  checkWeeklyReview();
  updateTodoList();
  const apiKey=localStorage.getItem('cf_apikey')||'';
  if(apiKey){const el=document.getElementById('apiKeyInput');if(el)el.value='••••'+apiKey.slice(-4);}
  updateMascot();setTimeout(syncAllKoros,200);
  launchAppV2();
}
function reloadApp(){customConfirm(T('confirm_reload_title'),T('confirm_reload_msg'),()=>location.reload());}
async function logout(){try{await window.FB.fbLogout();}catch(e){}localStorage.removeItem('cf_last_user');location.reload();}

/* ═══ SIDEBAR ═══ */
function toggleSidebar(forceOpen){
  const sb=document.getElementById('sidebar');
  const bd=document.getElementById('sidebarBackdrop');
  const hb=document.getElementById('hamburgerBtn');
  const open=forceOpen!==undefined?forceOpen:!sb.classList.contains('open');
  sb.classList.toggle('open',open);
  bd.classList.toggle('show',open);
  hb.classList.toggle('open',open);
}
function closeSidebar(){
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarBackdrop')?.classList.remove('show');
  document.getElementById('hamburgerBtn')?.classList.remove('open');
}

/* ═══ STREAK ═══ */
function checkStreak(){
  const today=new Date();today.setHours(0,0,0,0);
  if(!S.lastUsedDate){S.streak=0;S.lastUsedDate=new Date().toISOString();saveState();return;}
  const last=new Date(S.lastUsedDate);last.setHours(0,0,0,0);
  const diff=Math.floor((today-last)/86400000);
  if(diff===1)S.streak++;else if(diff>1)S.streak=0;
  S.lastUsedDate=new Date().toISOString();
  saveState(); // saveState appelle fbSaveUser
}

/* ═══ THEME ═══ */
function applyTheme(th){document.documentElement.setAttribute('data-theme',th);S.theme=th;}
function setTheme(th){
  applyTheme(th);localStorage.setItem('cf_theme',th);saveState();
  document.getElementById('themeSlider')?.classList.toggle('to-right',th==='dark');
  document.getElementById('httSlider')?.classList.toggle('to-right',th==='dark');
  document.getElementById('themeDark')?.classList.toggle('active-btn',th==='dark');
  document.getElementById('themeLight')?.classList.toggle('active-btn',th==='light');
}
function setNotif(on){
  S.notifications=on;saveState();
  document.getElementById('notifSlider')?.classList.toggle('to-right',!on);
  document.getElementById('notifYes')?.classList.toggle('active-btn',on);
  document.getElementById('notifNo')?.classList.toggle('active-btn',!on);
}
function initToggles(){setTheme(S.theme);setNotif(S.notifications);}
function requestNotifPermission(){if(S.notifications&&'Notification' in window&&Notification.permission==='default')Notification.requestPermission();}
function sendNotif(title,body){if(!S.notifications)return;if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body});}

/* ═══ HEADER ═══ */
function updateHeader(){
  /* ── Header streak + avatar ── */
  const el=document.getElementById('headerStreak');if(el)el.textContent=S.streak;
  const img=document.getElementById('headerAvatarImg');const em=document.getElementById('headerAvatarEmoji');
  if(S.user?.avatar){img.src=S.user.avatar;img.style.display='block';em.style.display='none';}
  else{img.style.display='none';em.style.display='block';}

  /* ── Sidebar enrichie ── */
  const name = S.user?.name || '—';
  const sbName = document.getElementById('sbName');
  if(sbName) sbName.textContent = name;

  // Rang
  const rank = getRank(S.level);
  const sbRank = document.getElementById('sbRank');
  if(sbRank) sbRank.textContent = rank?.name || 'Bronze';

  // Avatar lettre/image
  const sbLetter = document.getElementById('sbAvLetter');
  const sbImg    = document.getElementById('sbAvImg');
  if(S.user?.avatar && sbImg){
    sbImg.src=S.user.avatar; sbImg.style.display='block';
    if(sbLetter) sbLetter.style.display='none';
  } else if(sbImg){
    sbImg.style.display='none';
    if(sbLetter){ sbLetter.style.display='block'; sbLetter.textContent=name[0]?.toUpperCase()||'👤'; }
  }

  // XP bar sidebar
  const lvXp=curLvXp(); const nxXp=nextLvXp();
  const pct = nxXp>0 ? Math.min(100, Math.round((lvXp/nxXp)*100)) : 0;
  const sbXpFill = document.getElementById('sbXpFill');
  if(sbXpFill) sbXpFill.style.width = pct+'%';
  const sbXpLv = document.getElementById('sbXpLv');
  if(sbXpLv) sbXpLv.textContent = 'Niveau '+S.level;
  const sbXpVal = document.getElementById('sbXpVal');
  if(sbXpVal) sbXpVal.textContent = S.xp+' XP';

  // Streak sidebar
  const sbStr = document.getElementById('sbStreakCount');
  if(sbStr) sbStr.textContent = S.streak;
}

/* ═══ VIEWS avec transition ═══ */
function switchView(v){
  S.activeView=v;
  // Sur mobile on ferme la sidebar après nav
  if(window.innerWidth<=768) closeSidebar();

  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));

  // Transition : fade-out vue courante, fade-in nouvelle
  const current = document.querySelector('.view.active');
  const next = document.getElementById('view'+v[0].toUpperCase()+v.slice(1));
  if(current && current !== next){
    current.classList.remove('active');
  }
  if(next){
    next.classList.add('active');
  }

  document.getElementById('aiPanel').style.display=v==='planning'?'block':'none';
  updateCurrentView();
}
function updateCurrentView(){
  ({
    planning:  updatePlanning,
    calendar:  updateCalendar,
    insights:  ()=>{ updateInsightsIslands(); },
    templates: updateTemplates,
    badges:    updateBadges,
    profile:   updateProfile,
    settings:  ()=>{ updateLangDD(); initToggles(); }
  })[S.activeView]?.();
}
function updateAllViews(){updatePlanning();updateCalendar();updateBadges();updateProfile();updateTodoList();}

/* ═══ TUTORIAL ═══ */
function skipTutorial(){document.getElementById('welcomeModal').classList.remove('show');S.tutorialDone=true;saveState();}
function startTutorial(){document.getElementById('welcomeModal').classList.remove('show');S.tutStep=0;runTutStep();}
function runTutStep(){
  const step=TUT_STEPS[S.tutStep];if(!step){endTut();return;}
  switchView(step.view);
  document.body.classList.add('tut-locked');
  document.getElementById('tutOverlay').style.display='block';
  document.getElementById('tutPanel').style.display='flex';
  document.getElementById('spotlight').style.display='block';
  setTimeout(()=>{
    const el=document.getElementById(step.target);if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
    setTimeout(()=>{
      const r=el.getBoundingClientRect();const sp=document.getElementById('spotlight');
      sp.style.cssText='top:'+(r.top-8)+'px;left:'+(r.left-8)+'px;width:'+(r.width+16)+'px;height:'+(r.height+16)+'px;display:block;';
    },300);
  },200);
  const te=document.getElementById('tutText');const nb=document.getElementById('tutNextBtn');
  te.textContent='';nb.style.display='none';
  typeText(te,T(step.txtKey),()=>nb.style.display='block');
}
function typeText(el,txt,cb){let i=0;el.textContent='';const iv=setInterval(()=>{if(i<txt.length){el.textContent+=txt[i++];}else{clearInterval(iv);if(cb)cb();}},20);}
function tutNext(){S.tutStep++;if(S.tutStep>=TUT_STEPS.length)endTut();else runTutStep();}
function endTut(){
  ['tutOverlay','tutPanel','spotlight'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  document.body.classList.remove('tut-locked');
  S.tutorialDone=true;saveState();switchView('planning');toast('🎉 Tutoriel terminé !');
}

/* ═══ CHRONOS CHAT ═══ */
function openChronosChat(){
  animateChronosClick();document.getElementById('chronosChatModal').classList.add('show');}
function closeChronosChat(){
  setTimeout(chronosSad, 200);document.getElementById('chronosChatModal').classList.remove('show');}
function setChatMode(mode){
  chatMode=mode;
  const sl=document.getElementById('cmtSlider');const tv=document.getElementById('chatTalkView');const lv=document.getElementById('chatLockerView');
  const tb=document.getElementById('cmtTalk');const lb=document.getElementById('cmtLocker');
  if(mode==='locker'){sl.classList.add('to-right');tb.classList.remove('active');lb.classList.add('active');tv.style.display='none';lv.style.display='block';updateLockerGrid();}
  else{sl.classList.remove('to-right');lb.classList.remove('active');tb.classList.add('active');lv.style.display='none';tv.style.display='block';}
}
async function sendMsg(){
  const inp=document.getElementById('chatInput');const txt=inp.value.trim();if(!txt)return;
  inp.value='';addChatMsg(txt,'user');
  const tid=addChatMsg('...','chrono');
  const key=localStorage.getItem('cf_apikey');
  if(!key){updateChatMsg(tid,'Configure ta clé API dans les Paramètres ⚙️');return;}
  const langName=LANG_NAMES[S.lang]||'Français';
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,
        system:'Tu es Chronos, assistant IA de planning ChronoFlow. Réponds UNIQUEMENT en '+langName+'. Streak: '+S.streak+'j, Niveau: '+S.level+', Template: '+S.template+'. Max 3 phrases courtes.',
        messages:[{role:'user',content:txt}]})});
    const d=await r.json();updateChatMsg(tid,d.content?.[0]?.text||'😊');
  }catch(e){updateChatMsg(tid,'Erreur de connexion. Vérifie ta clé API.');}
}
function addChatMsg(txt,type){
  const c=document.getElementById('chatMessages');const id='m'+Date.now();
  const d=document.createElement('div');d.className='chat-msg '+(type==='chrono'?'cm-chrono':'cm-user');d.id=id;
  d.innerHTML='<div class="chat-bubble">'+txt+'</div>';c.appendChild(d);c.scrollTop=c.scrollHeight;return id;
}
function updateChatMsg(id,txt){const el=document.getElementById(id);if(el)el.querySelector('.chat-bubble').textContent=txt;document.getElementById('chatMessages').scrollTop=9999;}

/* ═══ AI TAGS ═══ */
function addTag(btn){
  const ta=document.getElementById('aiInput');const txt=btn.dataset.txt;
  btn.classList.toggle('active');
  if(btn.classList.contains('active')){const cur=ta.value.trim();animText(ta,cur?cur+'\n'+txt:txt);}
  else ta.value=ta.value.replace(txt,'').trim();
}
function animText(ta,txt){let i=0;ta.value='';const iv=setInterval(()=>{if(i<txt.length)ta.value+=txt[i++];else clearInterval(iv);},14);}

/* ═══ AI GENERATION ═══ */
async function generate(){
  const inp=document.getElementById('aiInput');const raw=inp.value.trim();if(!raw){toast('⚠️ '+T('toast_todo_write_something'));return;}
  if(needsReviseDetail(raw)){
    pendingReviseText=raw;
    document.getElementById('reviseTitle').textContent=T('revise_title');
    document.getElementById('reviseSubjectLabel').textContent=T('revise_subject');
    document.getElementById('reviseDateLabel').textContent=T('revise_date');
    document.getElementById('reviseConfirm').textContent=T('revise_gen');
    document.getElementById('reviseModal').classList.add('show');
    return;
  }
  doGenerate(raw);
}
function needsReviseDetail(txt){
  const l=txt.toLowerCase();
  return (l.includes('révis')||l.includes('etud')||l.includes('study')||l.includes('apprend'))
    && !l.includes('maths')&&!l.includes('physique')&&!l.includes('chimie')&&!l.includes('hist')
    && !l.includes('français')&&!l.includes('anglais')&&!l.includes('bio')&&!l.includes('info')
    && !l.includes('matière')&&!l.includes('subject')&&!l.includes('cours ');
}
function confirmRevise(){
  const subj=document.getElementById('reviseSubject').value.trim();
  const date=document.getElementById('reviseDate').value.trim();
  closeModal('reviseModal');
  if(!subj){toast('⚠️ '+T('error_field'));return;}
  doGenerate((pendingReviseText||'révision')+' de '+subj+(date?' '+date:''));
  pendingReviseText='';
}
async function doGenerate(text){
  document.getElementById('loading').classList.add('show');
  document.getElementById('loadingTxt').textContent=T('loading');
  const key=localStorage.getItem('cf_apikey');
  let evs;
  if(key){evs=await generateWithAI(text,key);}else{evs=parseLocal(text);}
  document.getElementById('loading').classList.remove('show');
  if(evs&&evs.length>0){
    if(S.user?.uid){
      for(const ev of evs){
        const fid=await window.FB.fbAddEvent(S.user.uid,ev);
        ev.id=fid;
        S.events.push(ev);
      }
      S.user.totalEvents=(S.user.totalEvents||0)+evs.length;
      await window.FB.fbSaveUser(S.user.uid,{totalEvents:S.user.totalEvents});
    } else {
      evs.forEach(e=>S.events.push(e));
    }
    evs.forEach(e=>addToTodo(e.title,e.id));
    saveState();
    updateAllViews();
    document.getElementById('aiInput').value='';
    document.querySelectorAll('.tag.active').forEach(t=>t.classList.remove('active'));
    toast('✨ '+evs.length+' '+T('toast_events_created'));
    setTimeout(()=>addXpV2(XP_GAINS.event_created*evs.length),200);checkBadgesV2();
  }else toast('⚠️ '+T('toast_reformulate'));
}
async function generateWithAI(text,key){
  const langName=LANG_NAMES[S.lang]||'Français';
  const breakMin=S.templateData.breakMin||10;
  const maxStudy=S.templateData.maxStudy||4;
  const today=new Date().toISOString().split('T')[0];
  const tplInfo=S.template==='student'&&S.templateData.courses?'Cours: '+S.templateData.courses.map(c=>c.subject+' J'+c.day+' '+c.start+'-'+c.end).join(', '):'Template: '+S.template;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,
        system:'Tu es un planificateur expert. Génère des événements JSON STRICTEMENT.\nRègles: Jamais de chevauchement. Minimum '+breakMin+'min entre événements. Max '+maxStudy+'h révision/jour.\nRéponds UNIQUEMENT avec un tableau JSON: [{title,type(study/work/social/personal),date(YYYY-MM-DD),startTime(HH:MM),endTime(HH:MM),priority(critical/high/medium/low),duration(minutes)}]\nAujourd\'hui: '+today+'. '+tplInfo+'. Langue des titres: '+langName,
        messages:[{role:'user',content:'Génère des événements: '+text}]})});
    const d=await r.json();
    const raw=d.content?.[0]?.text||'[]';
    const match=raw.match(/\[[\s\S]*\]/);if(!match)return parseLocal(text);
    const parsed=JSON.parse(match[0]);
    return parsed.map(e=>({...e,id:Date.now()+Math.random(),date:new Date(e.date)}));
  }catch(err){return parseLocal(text);}
}
function parseLocal(text){
  const l=text.toLowerCase();const today=new Date();
  let type='personal',title='Activité',priority='medium';
  if(l.includes('révis')||l.includes('étude')||l.includes('exam')){type='study';title='Révision';priority='high';}
  else if(l.includes('sport')||l.includes('gym')){type='personal';title='Sport';}
  else if(l.includes('ami')){type='social';title='Avec des amis';}
  else if(l.includes('travail')||l.includes('réunion')){type='work';title='Travail';}
  else if(l.includes('rdv')||l.includes('médecin')){type='personal';title='Rendez-vous';}
  if(l.includes('urgent')||l.includes('rien révisé'))priority='critical';
  const hM=l.match(/(\d+)\s*h/i);const durMin=hM?+hM[1]*60:90;
  const dates=extractDates(l,today);
  const targets=dates.length?dates:[new Date(today.setDate(today.getDate()+1))];
  const breakMin=S.templateData.breakMin||10;
  // Find last event end time for each day to prevent overlaps
  return targets.map(date=>{
    const dayEvs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString());
    let lastEndForDay=9*60;
    dayEvs.forEach(e=>{
      const [eh2,em2]=e.endTime.split(':').map(Number);
      const endMin2=eh2*60+em2;
      if(endMin2>lastEndForDay)lastEndForDay=endMin2;
    });
    const startMin=lastEndForDay+breakMin;
    const h=Math.floor(startMin/60);const m=startMin%60;
    const endMin=startMin+durMin;const eh=Math.floor(endMin/60);const em=endMin%60;
    lastEndForDay=endMin;
    return {id:Date.now()+Math.random(),title,type,date:new Date(date),
      startTime:pad(h)+':'+pad(m),endTime:pad(eh)+':'+pad(em),duration:durMin,priority};
  });
}
function pad(n){return String(n).padStart(2,'0');}
function extractDates(txt,base){
  const dates=[];
  const dm=txt.match(/dans\s*(\d+)\s*jours?/i);if(dm){const d=new Date(base);d.setDate(base.getDate()+parseInt(dm[1]));dates.push(d);}
  if(txt.includes('demain')){const d=new Date(base);d.setDate(base.getDate()+1);dates.push(d);}
  [[1,'lundi'],[2,'mardi'],[3,'mercredi'],[4,'jeudi'],[5,'vendredi'],[6,'samedi'],[0,'dimanche']].forEach(([wd,name])=>{if(txt.includes(name))dates.push(nextWeekday(wd));});
  return [...new Set(dates.map(d=>d.toDateString()))].map(ds=>new Date(ds));
}
function nextWeekday(day){const d=new Date();const diff=(day-d.getDay()+7)%7||7;d.setDate(d.getDate()+diff);return d;}

/* ═══ PLANNING ═══ */
function updatePlanning(){
  updateWeekLabel();
  const grid=document.getElementById('planningGrid');
  const today=new Date();const ws=new Date(today);
  ws.setDate(today.getDate()-today.getDay()+1+S.weekOffset*7);
  const dayNames=[T('day_s_mon'),T('day_s_tue'),T('day_s_wed'),T('day_s_thu'),T('day_s_fri'),T('day_s_sat'),T('day_s_sun')];
  const allEvs=getAllEventsForWeek(ws);
  let html='<div class="week-grid">';
  for(let i=0;i<7;i++){
    const day=new Date(ws);day.setDate(ws.getDate()+i);
    const isT=day.toDateString()===today.toDateString();
    const dayEvs=allEvs.filter(e=>new Date(e.date).toDateString()===day.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    html+='<div class="day-col'+(isT?' today':'')+'" onclick="openDayDetail(new Date('+day.getTime()+'))" style="cursor:pointer"><div class="day-col-header"><div class="day-col-name">'+dayNames[i]+'</div><div class="day-col-num">'+day.getDate()+'</div></div><div class="day-col-body">';
    if(dayEvs.length){html+=dayEvs.map(e=>'<div class="event-card '+(e.tpl?'template-event':e.priority)+'" onclick="'+(e.tpl?'':'showEventDetail(\''+e.id+'\')')+'">'+'<div class="ev-title">'+e.title+'</div><div class="ev-time">'+e.startTime+' – '+e.endTime+'</div></div>').join('');}
    else html+='<div class="hint-row">'+T('free')+'</div>';
    html+='</div></div>';
  }
  html+='</div>';grid.innerHTML=html;
  updateTodayUpcoming(today);
}
function getAllEventsForWeek(weekStart){
  const result=[...S.events];
  if(S.template==='student'&&S.templateData.courses){
    S.templateData.courses.forEach(c=>{
      for(let i=0;i<7;i++){
        const day=new Date(weekStart);day.setDate(weekStart.getDate()+i);
        const dow=day.getDay()===0?7:day.getDay();
        if(dow===c.day)result.push({id:'tpl_'+c.subject+'_'+day.toDateString(),title:'📚 '+c.subject,type:'study',date:new Date(day),startTime:c.start,endTime:c.end,priority:'medium',tpl:true});
      }
    });
  }
  return result;
}
function updateTodayUpcoming(today){
  const t0=new Date(today);t0.setHours(0,0,0,0);
  const te=S.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);return d.getTime()===t0.getTime();}).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const ue=S.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);return d>t0;}).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,10);
  document.getElementById('todayList').innerHTML=te.length?te.map(e=>'<div class="event-item" onclick="showEventDetail(\''+e.id+'\')"><div class="ei-title">'+e.title+'</div><div class="ei-sub">⏰ '+e.startTime+' – '+e.endTime+'</div></div>').join(''):'<p class="hint-row">'+T('no_events')+'</p>';
  document.getElementById('upcomingList').innerHTML=ue.length?ue.map(e=>'<div class="event-item" onclick="showEventDetail(\''+e.id+'\')"><div class="ei-title">'+e.title+'</div><div class="ei-sub">📅 '+new Date(e.date).toLocaleDateString(S.lang||'fr',{weekday:'long',day:'numeric',month:'long'})+' · '+e.startTime+'</div></div>').join(''):'<p class="hint-row">'+T('no_events')+'</p>';
}
function updateWeekLabel(){
  const wl=document.getElementById('weekLabel');if(!wl)return;
  wl.textContent=S.weekOffset===0?T('week_this'):S.weekOffset===1?T('week_next'):S.weekOffset===-1?T('week_prev'):T('week_n')+' '+(S.weekOffset>0?'+':'')+S.weekOffset;
}
function changeWeek(d){S.weekOffset+=d;updatePlanning();}

/* ═══ CALENDAR ═══ */
function updateCalendar(){
  const container=document.getElementById('monthCal');if(!container)return;
  const today=new Date();const target=new Date(today.getFullYear(),today.getMonth()+S.monthOffset,1);
  const ml=document.getElementById('monthLabel');if(ml)ml.textContent=target.toLocaleDateString(S.lang||'fr',{month:'long',year:'numeric'});
  const firstDay=new Date(target.getFullYear(),target.getMonth(),1);
  const lastDay=new Date(target.getFullYear(),target.getMonth()+1,0);
  const startOff=firstDay.getDay()===0?6:firstDay.getDay()-1;
  const WDAYS=[T('day_s_mon'),T('day_s_tue'),T('day_s_wed'),T('day_s_thu'),T('day_s_fri'),T('day_s_sat'),T('day_s_sun')];
  let html='<div class="cal-header">'+WDAYS.map(d=>'<div class="cal-wday">'+d+'</div>').join('')+'</div><div class="cal-body">';
  for(let i=0;i<startOff;i++)html+='<div class="cal-cell other"></div>';
  for(let d=1;d<=lastDay.getDate();d++){
    const date=new Date(target.getFullYear(),target.getMonth(),d);
    const isT=date.toDateString()===today.toDateString();
    const evs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).slice(0,3);
    html+='<div class="cal-cell'+(isT?' today':'')+' onclick="openDayDetail(\''+date.toISOString()+'\')">'+'<div class="cal-dn">'+d+'</div>'+(evs.length?'<div>'+evs.map(e=>'<div class="mini-ev '+(e.priority||'')+'">'+e.title+'</div>').join('')+'</div>':'')+'</div>';
  }
  html+='</div>';
  container.innerHTML=html;
  container.classList.remove('slide-right','slide-left');void container.offsetWidth;
  container.classList.add('slide-'+S.monthDir);
  setTimeout(()=>container.classList.remove('slide-right','slide-left'),400);
}
function changeMonth(d){S.monthOffset+=d;S.monthDir=d>0?'right':'left';updateCalendar();}
// openDayDetail defined below (full version)

/* ═══ INSIGHTS ═══ */
function updateInsights(){
  updateInsightsStats();
  updateInsightsChart();

  const g=document.getElementById('insightsGrid');if(!g)return;
  const now=new Date();
  const todayEvs=S.events.filter(e=>new Date(e.date).toDateString()===now.toDateString());
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay()+1);weekStart.setHours(0,0,0,0);
  const weekEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=weekStart&&d<=now;});
  const totalHours=S.events.reduce((s,e)=>s+(e.duration||60)/60,0);
  const todayHours=todayEvs.reduce((s,e)=>s+(e.duration||60)/60,0);
  const weekHours=weekEvs.reduce((s,e)=>s+(e.duration||60)/60,0);
  const studyEvs=S.events.filter(e=>e.type==='study');
  const studyHours=studyEvs.reduce((s,e)=>s+(e.duration||60)/60,0);
  const avgSession=studyEvs.length?Math.round(studyHours*60/studyEvs.length):0;

  g.innerHTML=[
    {title:'📅 '+T('isc_this_week'),val:S.events.length,sub:T('ins_events'),pct:Math.min(100,S.events.length*2)},
    {title:'⏱️ '+T('ins_hours'),val:Math.round(totalHours)+'h',sub:T('ins_this_week'),pct:Math.min(100,totalHours/100*100)},
    {title:'📚 '+T('isc_study_sessions'),val:studyEvs.length,sub:T('type_study'),pct:Math.min(100,studyEvs.length*5)},
    {title:'⚡ Avg/session',val:avgSession+'min',sub:T('ins_hours'),pct:Math.min(100,avgSession/120*100)},
    {title:'🔥 '+T('isc_streak'),val:S.streak+' '+T('ins_active_days'),sub:T('isc_streak'),pct:Math.min(100,S.streak/30*100)},
    {title:'🏆 '+T('wr_stat_level'),val:T('locker_level')+S.level,sub:getRank(S.level).name,pct:Math.min(100,curLvXp()/nextLvXp()*100)},
  ].map(c=>`<div class="insight-card"><h3>${c.title}</h3><div class="big-stat">${c.val}</div><small class="txt2">${c.sub}</small><div class="insight-bar"><div class="insight-bar-fill" style="width:${c.pct}%"></div></div></div>`).join('');
}
function updateInsightsStats(){
  const row=document.getElementById('insightsStatsRow');if(!row)return;
  const now=new Date();
  const todayEvs=S.events.filter(e=>new Date(e.date).toDateString()===now.toDateString());
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay()+1);weekStart.setHours(0,0,0,0);
  const monthStart=new Date(now.getFullYear(),now.getMonth(),1);
  const weekEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=weekStart;});
  const monthEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=monthStart;});
  const todayH=Math.round(todayEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const weekH=Math.round(weekEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const monthH=Math.round(monthEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  row.innerHTML=`
    <div class="ins-stat-card"><div class="ins-stat-label">${T('ins_today')}</div><div class="ins-stat-val">${todayH}h</div><div class="ins-stat-sub">${todayEvs.length} ${T('ins_events')}</div><div class="ins-stat-goal"><div class="ins-stat-goal-fill" style="width:${Math.min(100,todayH/6*100)}%"></div></div></div>
    <div class="ins-stat-card"><div class="ins-stat-label">${T('ins_this_week')}</div><div class="ins-stat-val">${weekH}h</div><div class="ins-stat-sub">${weekEvs.length} ${T('ins_events')}</div><div class="ins-stat-goal"><div class="ins-stat-goal-fill" style="width:${Math.min(100,weekH/42*100)}%"></div></div></div>
    <div class="ins-stat-card"><div class="ins-stat-label">${T('ins_this_month')}</div><div class="ins-stat-val">${monthH}h</div><div class="ins-stat-sub">${monthEvs.length} ${T('ins_events')}</div><div class="ins-stat-goal"><div class="ins-stat-goal-fill" style="width:${Math.min(100,monthH/180*100)}%"></div></div></div>
  `;
}
function updateInsightsChart(){
  const chart=document.getElementById('insBarChart');if(!chart)return;
  const days=[];const now=new Date();
  for(let i=6;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d);}
  const maxH=6;
  chart.innerHTML=days.map(day=>{
    const evs=S.events.filter(e=>new Date(e.date).toDateString()===day.toDateString());
    const h=evs.reduce((s,e)=>s+(e.duration||60)/60,0);
    const pct=Math.min(100,h/maxH*100);
    const names=[T('day_s_sun'),T('day_s_mon'),T('day_s_tue'),T('day_s_wed'),T('day_s_thu'),T('day_s_fri'),T('day_s_sat')];
    const label=names[day.getDay()];
    const isToday=day.toDateString()===now.toDateString();
    return `<div class="ins-bar" style="height:${Math.max(4,pct)}%;background:${isToday?'var(--primary)':'rgba(255,107,53,.4)'};border-radius:6px 6px 0 0;min-height:4px" title="${Math.round(h*10)/10}h"><span class="ins-bar-label">${label}</span></div>`;
  }).join('');
}


/* ═══ TEMPLATES ═══ */
function updateTemplates(){
  const c=document.getElementById('templatesContent');if(!c)return;
  const tabs=['student','worker','custom'];const labels=['🎓 '+T('pcStudent'),'💼 '+T('pcWorker'),'✨ '+T('pcCustom')];const idx=tabs.indexOf(S.template);
  let html='<div style="display:flex;position:relative;background:var(--bg);padding:4px;border-radius:12px;border:1px solid var(--border);margin:0 auto 1.5rem;max-width:500px"><div id="tplSlider" style="position:absolute;top:4px;left:4px;width:calc(33.33% - 2.67px);height:calc(100% - 8px);background:var(--primary);border-radius:8px;transition:transform .35s cubic-bezier(.16,1,.3,1);z-index:0;transform:translateX('+idx*100+'%)"></div>'+tabs.map((t,i)=>'<button style="flex:1;padding:.6rem 1rem;border:none;background:transparent;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;color:'+(S.template===t?'white':'var(--text2)')+';font-family:inherit;position:relative;z-index:1;transition:color .25s" onclick="switchTemplate(\''+t+'\')">'+labels[i]+'</button>').join('')+'</div>';
  if(S.template==='student'){
    const _tplDays=[T('day_monday'),T('day_tuesday'),T('day_wednesday'),T('day_thursday'),T('day_friday'),T('day_saturday')];
    html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">🎓 '+T('obStudentTitle')+'</h3><div class="tpl-limits"><div class="form-group"><label>'+T('lblMaxStudy')+'</label><input type="number" id="tplMaxStudy" value="'+(S.templateData.maxStudy||4)+'" min="1" max="16"></div><div class="form-group"><label>'+T('lblMaxLeisure')+'</label><input type="number" id="tplMaxLeisure" value="'+(S.templateData.maxLeisure||3)+'" min="0" max="16"></div><div class="form-group"><label>'+T('lblBreakBetween')+'</label><input type="number" id="tplBreak" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><div id="tplCC" style="margin-bottom:.75rem">'+((S.templateData.courses||[]).length===0?'<div class="course-row"><select class="sel">'+_tplDays.map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="'+T('revise_subject')+'"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>':(S.templateData.courses||[]).map(course=>'<div class="course-row"><select class="sel">'+_tplDays.map((d,i)=>'<option value="'+(i+1)+'" '+(course.day===i+1?'selected':'')+'>'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="'+(course.start||'08:00')+'" step="300"><input type="time" class="tinp" value="'+(course.end||'10:00')+'" step="300"><input type="text" class="sinp" value="'+(course.subject||'')+'" placeholder="'+T('revise_subject')+'"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>').join(''))+'</div><button class="btn-secondary" onclick="addTplCourse()" style="margin-bottom:.75rem">+ '+T('btnAddCourse')+'</button><button class="btn-primary" onclick="saveTplStudent()">'+T('save')+'</button></div>';
  }else if(S.template==='worker'){
    html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">💼 '+T('obWorkerTitle')+'</h3><div class="tpl-limits"><div class="form-group"><label>'+T('lblWorkStart')+'</label><input type="time" id="tplWS" value="'+(S.templateData.workStart||'09:00')+'" step="300"></div><div class="form-group"><label>'+T('lblWorkEnd')+'</label><input type="time" id="tplWE" value="'+(S.templateData.workEnd||'18:00')+'" step="300"></div><div class="form-group"><label>'+T('lblMaxWork')+'</label><input type="number" id="tplMaxWork" value="'+(S.templateData.maxWork||8)+'" min="1" max="16"></div><div class="form-group"><label>'+T('lblBreakW')+'</label><input type="number" id="tplBreakW" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><button class="btn-primary" onclick="saveTplWorker()">'+T('save')+'</button></div>';
  }else{
    html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">✨ '+T('obCustomTitle')+'</h3><div class="tpl-limits"><div class="form-group"><label>'+T('lblMaxStudyC')+'</label><input type="number" id="tplMaxStudyC" value="'+(S.templateData.maxStudy||4)+'" min="0" max="16"></div><div class="form-group"><label>'+T('lblMaxLeisureC')+'</label><input type="number" id="tplMaxLeisureC" value="'+(S.templateData.maxLeisure||3)+'" min="0" max="16"></div><div class="form-group"><label>'+T('lblBreakC')+'</label><input type="number" id="tplBreakC" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><p class="txt2" style="margin-top:.5rem">'+T('ai_assistant')+'</p><button class="btn-primary" onclick="saveTplCustom()" style="margin-top:.75rem">'+T('save')+'</button></div>';
  }
  c.innerHTML=html;
}
function switchTemplate(id){S.template=id;saveState();updateTemplates();updatePlanning();toast('✅ '+T('toast_template_changed'));}
function addTplCourse(){const c=document.getElementById('tplCC');if(!c)return;const row=document.createElement('div');row.className='tpl-course-row';const _dl=[T('day_monday'),T('day_tuesday'),T('day_wednesday'),T('day_thursday'),T('day_friday'),T('day_saturday')];row.innerHTML='<div class="cf-select-wrap"><select class="sel" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:.4rem .6rem;color:var(--text);font-family:inherit;font-size:.83rem;-webkit-appearance:none;appearance:none;cursor:pointer">'+_dl.map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select></div><input type="time" class="tinp" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:.4rem .6rem;color:var(--text);font-family:inherit;font-size:.83rem" value="08:00" step="300"><input type="time" class="tinp" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:.4rem .6rem;color:var(--text);font-family:inherit;font-size:.83rem" value="10:00" step="300"><input type="text" class="sinp" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:.4rem .6rem;color:var(--text);font-family:inherit;font-size:.83rem" placeholder="'+T('revise_subject')+'"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';c.appendChild(row);}
function saveTplStudent(){const rows=document.querySelectorAll('#tplCC .tpl-course-row');S.templateData.courses=Array.from(rows).map(r=>({day:+r.querySelector('.sel').value,start:r.querySelectorAll('.tinp')[0].value,end:r.querySelectorAll('.tinp')[1].value,subject:r.querySelector('.sinp').value})).filter(c=>c.subject);S.templateData.maxStudy=+(document.getElementById('tplMaxStudy')?.value)||4;S.templateData.maxLeisure=+(document.getElementById('tplMaxLeisure')?.value)||3;S.templateData.breakMin=+(document.getElementById('tplBreak')?.value)||10;saveState();updatePlanning();toast('✅ '+T('toast_template_saved'));}
function saveTplWorker(){S.templateData.workStart=document.getElementById('tplWS')?.value||'09:00';S.templateData.workEnd=document.getElementById('tplWE')?.value||'18:00';S.templateData.maxWork=+(document.getElementById('tplMaxWork')?.value)||8;S.templateData.breakMin=+(document.getElementById('tplBreakW')?.value)||10;saveState();toast('✅ '+T('toast_template_saved'));}
function saveTplCustom(){S.templateData.maxStudy=+(document.getElementById('tplMaxStudyC')?.value)||4;S.templateData.maxLeisure=+(document.getElementById('tplMaxLeisureC')?.value)||3;S.templateData.breakMin=+(document.getElementById('tplBreakC')?.value)||10;saveState();toast('✅ '+T('toast_template_saved'));}

/* ═══ BADGES VIEW ═══ */
function updateBadges(){
  checkBadgesV2();updateXpBar();
  const g=document.getElementById('badgeGrid');if(!g)return;
  g.innerHTML=ALL_BADGES.map(b=>{const u=b.cond();return'<div class="badge-card '+(u?'unlocked':'locked')+'"><span class="badge-emoji">'+b.emoji+'</span><div class="badge-name">'+b.name+'</div><div class="badge-desc">'+b.desc+'</div><span class="badge-xp">+'+b.xp+' XP</span>'+(u?'<span class="badge-msg">"'+b.msg+'"</span>':'')+'</div>';}).join('');
}

/* ═══ RANK MODAL ═══ */
function openRankModal(){
  const cur=getRank(S.level);
  document.getElementById('rankModalContent').innerHTML=RANKS.map(r=>{
    const reached=S.level>=r.minLv;const isCur=r.name===cur.name;
    return'<div class="rank-row'+(isCur?' current':'')+(reached?'':' locked')+'" style="border-left:4px solid '+(reached?r.color:'var(--border)')+'"><div class="rank-icon">'+r.icon+'</div><div class="rank-info"><strong>'+r.name+'</strong><small>Niv. '+r.minLv+(r.maxLv<999?'–'+r.maxLv:'+')+' </small></div><div class="rank-xp-badge" style="'+(reached?'background:'+r.color+'22;color:'+r.color:'')+'">'+( reached?'✅ Atteint':'Niv. '+r.minLv+' · '+totalXpForLv(r.minLv)+' XP total')+'</div></div>';
  }).join('');
  document.getElementById('rankModal').classList.add('show');
}
function closeRankModal(){document.getElementById('rankModal').classList.remove('show');}

/* ═══ PROFILE ═══ */
function updateProfile(){
  if(!S.user)return;
  document.getElementById('profileName').textContent=S.user.name;
  document.getElementById('profileEmail').textContent=S.user.email||'';
  document.getElementById('profileNameInput').value=S.user.name;
  document.getElementById('profileEmailInput').value=S.user.email||'';
  document.getElementById('statEvents').textContent=S.user.totalEvents||0;
  document.getElementById('statStreak').textContent=S.streak;
  document.getElementById('statHours').textContent=Math.round(S.events.reduce((s,e)=>s+(e.duration||60)/60,0));
  document.getElementById('statBadges').textContent=ALL_BADGES.filter(b=>b.cond()).length;
  if(S.user.avatar){document.getElementById('profileAvImg').src=S.user.avatar;document.getElementById('profileAvImg').style.display='block';document.getElementById('profileAvEmoji').style.display='none';}
  updateRankDisplays();
}
async function saveProfile(){
  if(!S.user)return;
  S.user.name=document.getElementById('profileNameInput').value;
  updateHeader();updateProfile();toast('✅ '+T('toast_profile_saved'));
  saveState();
  if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{name:S.user.name});
}
function handleAvatarChange(inp){
  const f=inp.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=async e=>{
    S.user.avatar=e.target.result;
    updateHeader();updateProfile();toast('✅ Photo mise à jour');
    saveState();
    if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{avatar:S.user.avatar});
  };
  rd.readAsDataURL(f);
}

/* ═══ SETTINGS ═══ */
function saveApiKey(){const k=document.getElementById('apiKeyInput')?.value?.trim();if(!k||k.startsWith('••••'))return;localStorage.setItem('cf_apikey',k);document.getElementById('apiKeyInput').value='••••'+k.slice(-4);toast('✅ '+T('toast_key_saved'));}
function requestPasswordChange(){
  document.getElementById('pwdEmail').textContent=S.user.email;
  document.getElementById('passwordModal').classList.add('show');
}
async function confirmPasswordChange(){
  const currentPwd=document.getElementById('pwdCode').value;
  const np=document.getElementById('pwdNew').value;
  if(!currentPwd||!np){toast('⚠️ '+T('error_field'));return;}
  if(np.length<6){toast('⚠️ '+T('error_pwd'));return;}
  try{
    await window.FB.fbChangePassword(currentPwd,np);
    toast('✅ '+T('toast_pwd_changed'));closeModal('passwordModal');
  }catch(e){
    const msg=e.code==='auth/wrong-password'?'Mot de passe actuel incorrect':e.message;
    toast('❌ '+msg);
  }
}
function exportData(){
  const exportable={
    user:S.user, events:S.events, template:S.template, templateData:S.templateData,
    xp:S.xp, level:S.level, streak:S.streak, theme:S.theme, lang:S.lang
  };
  const blob=new Blob([JSON.stringify(exportable,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download='chronoflow_'+new Date().toISOString().split('T')[0]+'.json';
  a.click();toast('✅ '+T('toast_exported'));
}
async function deleteAccount(){
  customConfirm(T('confirm_delete_title'),T('confirm_delete_msg'),async()=>{
    try{
      if(S.user?.uid) await window.FB.fbDeleteAccount(S.user.uid);
      localStorage.clear();location.reload();
    }catch(e){toast('❌ '+e.message);}
  });
}

/* ═══ SESSION DE RÉVISION ═══ */
function openSessionLauncher(){
  const now=new Date();
  const study=S.events.find(e=>e.type==='study'&&new Date(e.date).toDateString()===now.toDateString());
  if(study){document.getElementById('sessHours').value=Math.round((study.duration||120)/60*10)/10||2;}
  document.getElementById('sessionModal').classList.add('show');
}
function launchSession(){
  const hours=parseFloat(document.getElementById('sessHours').value)||2;
  const workMin=parseInt(document.getElementById('sessWorkMin').value)||55;
  const breakMin=parseInt(document.getElementById('sessBreakMin').value)||5;
  closeModal('sessionModal');
  S.sessionWorkSec=workMin*60; S.sessionBreakSec=breakMin*60;
  S.sessionTotalSec=Math.round(hours*3600); S.sessionElapsed=0;
  S.sessionPhase='work'; S.sessionPhaseIdx=0; S.sessionActive=true; S.sessionSkipCount=0;
  S.sessionCurrentPhaseSec=workMin*60; S.sessionPhaseElapsed=0;
  document.getElementById('sessionScreen').style.display='flex';
  document.getElementById('appScreen').style.display='none';
  document.getElementById('arcFill').classList.remove('pause-mode');
  document.getElementById('arcFill').style.strokeDashoffset='503';
  updateSessionDisplay(); startSessionTick(); addXpV2(5);
  syncAllKoros();
}
function startSessionTick(){
  if(S.sessionTimer)clearInterval(S.sessionTimer);
  S.sessionTimer=setInterval(()=>{
    S.sessionElapsed++; S.sessionPhaseElapsed++;
    if(S.sessionElapsed>=S.sessionTotalSec){endSession();return;}
    const remaining=S.sessionCurrentPhaseSec-S.sessionPhaseElapsed;
    if(remaining<=0){switchPhase();return;}
    if(S.sessionPhase==='break'&&remaining===10){
      startBeepCountdown();
      if(S.notifications)sendNotif('Chronos ⚡',T('notif_resume_in10'));
    }
    updateSessionDisplay();
  },1000);
}
function switchPhase(){
  if(S.sessionPhase==='work'){
    S.sessionPhase='break'; S.sessionCurrentPhaseSec=S.sessionBreakSec; S.sessionPhaseElapsed=0;
    document.getElementById('arcFill').classList.add('pause-mode');
    if(S.notifications)sendNotif('Chronos ⚡',T('notif_break'));
    toast('☕ '+T('break_phase'));
  }else{
    S.sessionPhase='work'; S.sessionPhaseIdx++; S.sessionCurrentPhaseSec=S.sessionWorkSec; S.sessionPhaseElapsed=0;
    document.getElementById('arcFill').classList.remove('pause-mode');
    if(S.notifications)sendNotif('Chronos ⚡',T('notif_work_resume'));
    toast('💪 '+T('work_phase'));
  }
}
function startBeepCountdown(){
  if(sessionBeepInterval)clearInterval(sessionBeepInterval);
  let count=10;
  sessionBeepInterval=setInterval(()=>{playBeep(440,0.1);if(--count<=0)clearInterval(sessionBeepInterval);},1000);
}
function playBeep(freq,dur){
  try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=freq;g.gain.setValueAtTime(.5,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);o.start(ctx.currentTime);o.stop(ctx.currentTime+dur);}catch(e){}
}
function updateSessionDisplay(){
  const remaining=Math.max(0,S.sessionCurrentPhaseSec-S.sessionPhaseElapsed);
  const h=Math.floor(remaining/3600);const m=Math.floor((remaining%3600)/60);const s=remaining%60;
  document.getElementById('sessionTimeDisplay').textContent=pad(h)+':'+pad(m)+':'+pad(s);
  const arc=document.getElementById('arcFill');
  const pct=Math.min(1,S.sessionPhaseElapsed/S.sessionCurrentPhaseSec);
  arc.style.strokeDashoffset=503*(1-pct);
  const st=document.getElementById('sessionStatusTxt');if(st)st.textContent=S.sessionPhase==='work'?T('work_phase'):T('break_phase');
  const totalPhases=Math.max(1,Math.ceil(S.sessionTotalSec/S.sessionWorkSec));
  document.getElementById('sessionPhaseLabel').textContent=T('session_phase')+' '+(S.sessionPhaseIdx+1)+'/'+totalPhases;
  document.getElementById('sessionBreakLabel').textContent=T('break_label')+' : '+Math.round(S.sessionBreakSec/60)+' min';
}
function toggleSession(){
  if(S.sessionTimer){clearInterval(S.sessionTimer);S.sessionTimer=null;document.getElementById('sessPlayPause').textContent='▶';}
  else{startSessionTick();document.getElementById('sessPlayPause').textContent='⏸';}
}
function skipPhase(){
  S.sessionSkipCount=(S.sessionSkipCount||0);
  const maxSkips=Math.ceil(S.sessionTotalSec/S.sessionWorkSec);
  if(S.sessionSkipCount>=maxSkips){toast('⚠️ Max skips reached!');return;}
  S.sessionSkipCount++;switchPhase();updateSessionDisplay();
}
function tryExitSession(){
  const m=document.getElementById('exitSessionModal');
  if(m)m.classList.add('show');
}
function stayInSession(){closeModal('exitSessionModal');}
function confirmExitSession(){closeModal('exitSessionModal');endSession();}
function endSession(){
  S.sessionActive=false;
  if(S.sessionTimer){clearInterval(S.sessionTimer);S.sessionTimer=null;}
  if(sessionBeepInterval){clearInterval(sessionBeepInterval);sessionBeepInterval=null;}
  document.getElementById('sessionScreen').style.display='none';
  document.getElementById('appScreen').style.display='flex';
  toast('✅ '+T('toast_session_done'));
  addXpV2(20);checkBadgesV2();

}

/* ═══ VOICE ═══ */
function startVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){toast('⚠️ Navigateur non supporté');return;}
  const r=new SR();r.lang=(S.lang||'fr')+'-'+(S.lang||'fr').toUpperCase();r.interimResults=true;
  document.getElementById('voiceTranscript').textContent='';
  document.getElementById('voiceStatus').textContent='Parle...';
  document.getElementById('voiceConfirm').style.display='none';
  document.getElementById('voiceModal').classList.add('show');
  document.getElementById('voiceBtn').classList.add('recording');
  r.onresult=e=>{const tx=Array.from(e.results).map(r=>r[0].transcript).join('');document.getElementById('voiceTranscript').textContent=tx;S.voiceText=tx;if(e.results[0].isFinal){document.getElementById('voiceStatus').textContent='✅ Reconnu';document.getElementById('voiceConfirm').style.display='block';}};
  r.onerror=()=>{document.getElementById('voiceStatus').textContent='❌ Erreur';document.getElementById('voiceBtn').classList.remove('recording');};
  r.onend=()=>document.getElementById('voiceBtn').classList.remove('recording');
  r.start();S.recognition=r;
}
function stopVoice(){if(S.recognition)S.recognition.stop();document.getElementById('voiceModal').classList.remove('show');document.getElementById('voiceBtn').classList.remove('recording');}
function confirmVoice(){if(S.voiceText)document.getElementById('aiInput').value=S.voiceText;stopVoice();toast('✅ Texte ajouté');}

/* ═══ DAY DETAIL ═══ */
function openDayDetail(date){
  const d = date instanceof Date ? date : new Date(date);
  const dayNames=[T('day_sunday'),T('day_monday'),T('day_tuesday'),T('day_wednesday'),T('day_thursday'),T('day_friday'),T('day_saturday')];
  const months=[T('month_jan'),T('month_feb'),T('month_mar'),T('month_apr'),T('month_may'),T('month_jun'),T('month_jul'),T('month_aug'),T('month_sep'),T('month_oct'),T('month_nov'),T('month_dec')];
  const evs=S.events.filter(e=>new Date(e.date).toDateString()===d.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const tplEvs=getAllEventsForWeek(getWeekStart(d)).filter(e=>e.tpl&&new Date(e.date).toDateString()===d.toDateString());
  const allEvs=[...tplEvs,...evs];
  const title=dayNames[d.getDay()]+' '+d.getDate()+' '+months[d.getMonth()];
  let html='<div class="mf-header"><h3>📅 '+title+'</h3><button class="btn-icon" onclick="closeDayDetail()" style="font-size:1.2rem">✕</button></div>';
  if(allEvs.length===0){html+='<div class="empty-state"><div class="empty-icon">🌟</div><h3>'+T('free')+'</h3><p class="txt2">'+T('no_events')+'</p></div>';}
  else{html+=allEvs.map(e=>`<div class="event-item" onclick="${e.tpl?'':"showEventDetail('"+e.id+"')"}"><div class="ei-title">${e.title}</div><div class="ei-sub">${e.startTime} – ${e.endTime} ${e.priority?'· '+e.priority:''}</div></div>`).join('');}
  html+='<button class="btn-add-day-event" onclick="closeDayDetail();switchView(\'planning\');setTimeout(()=>{const ta=document.getElementById(\'aiInput\');if(ta){ta.focus();}},300)">➕ '+T('btn_generate')+'</button>';
  document.getElementById('dayDetailContent').innerHTML=html;
  document.getElementById('dayDetailModal').classList.add('show');
}
function closeDayDetail(){document.getElementById('dayDetailModal').classList.remove('show');}
function getWeekStart(d){const ws=new Date(d);ws.setDate(d.getDate()-d.getDay()+1);ws.setHours(0,0,0,0);return ws;}

/* ═══ WEEKLY REVIEW ═══ */
function checkWeeklyReview(){
  const now=new Date();
  // Semaine ISO: lundi = début
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay()+1);weekStart.setHours(0,0,0,0);
  const weekKey='cf_week_'+weekStart.toISOString().split('T')[0];
  if(localStorage.getItem(weekKey))return; // déjà vu cette semaine
  localStorage.setItem(weekKey,'seen');
  setTimeout(()=>openWeeklyReview(),1500);
}
function openWeeklyReview(){
  const now=new Date();
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-7);weekStart.setHours(0,0,0,0);
  const weekEnd=new Date(now);weekEnd.setHours(23,59,59,999);
  const weekEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=weekStart&&d<=weekEnd;});
  const weekH=Math.round(weekEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const studyEvs=weekEvs.filter(e=>e.type==='study');
  const studyH=Math.round(studyEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const daysActive=new Set(weekEvs.map(e=>new Date(e.date).toDateString())).size;

  document.getElementById('wrStatsGrid').innerHTML=`
    <div class="wr-stat"><span class="wr-stat-val">${weekH}h</span><span class="wr-stat-label">${T('wr_stat_hours')}</span></div>
    <div class="wr-stat"><span class="wr-stat-val">${studyH}h</span><span class="wr-stat-label">${T('wr_stat_study')}</span></div>
    <div class="wr-stat"><span class="wr-stat-val">${weekEvs.length}</span><span class="wr-stat-label">${T('wr_stat_events')}</span></div>
    <div class="wr-stat"><span class="wr-stat-val">${daysActive}/7</span><span class="wr-stat-label">${T('wr_stat_days')}</span></div>
    <div class="wr-stat"><span class="wr-stat-val">${S.streak}</span><span class="wr-stat-label">${T('wr_stat_streak')}</span></div>
    <div class="wr-stat"><span class="wr-stat-val">${T('locker_level')}${S.level}</span><span class="wr-stat-label">${T('wr_stat_level')}</span></div>
  `;

  const feedback = weekH>=20 ? T('wr_feedback_excellent').replace('{h}',weekH)
    : weekH>=10 ? T('wr_feedback_good').replace('{h}',weekH)
    : weekH>=5 ? T('wr_feedback_ok').replace('{h}',weekH)
    : T('wr_feedback_light').replace('{h}',weekH);
  document.getElementById('wrFeedback').textContent=feedback;

  const advice = daysActive>=5 ? T('wr_advice_regular') : T('wr_advice_plan');
  document.getElementById('wrAdvice').textContent=advice;

  document.getElementById('weeklyReviewModal').classList.add('show');
}
function closeWeeklyReview(){document.getElementById('weeklyReviewModal').classList.remove('show');}


/* ═══ TODO LIST ═══ */
function addToTodo(title, eventId){
  const id = eventId || ('todo_'+Date.now()+Math.random());
  // Évite les doublons
  if(S.todos.find(t=>t.id===id)) return;
  S.todos.push({id:String(id), title, done:false, createdAt:new Date().toISOString()});
  saveState();
  updateTodoList();
}
function toggleTodo(id){
  const t=S.todos.find(t=>t.id===String(id));
  if(!t)return;
  t.done=!t.done;
  saveState();
  updateTodoList();
  if(t.done){
    toast('✅ '+t.title+' — Bien joué !');
    addXpV2(5);
  }
}
function removeTodo(id){
  S.todos=S.todos.filter(t=>t.id!==String(id));
  saveState();
  updateTodoList();
}
function addManualTodo(){
  const inp=document.getElementById('todoManualInput');
  if(!inp)return;
  const val=inp.value.trim();
  if(!val){toast('⚠️ '+T('toast_todo_write_something'));return;}
  addToTodo(val);
  inp.value='';
  inp.focus();
  toast('✅ '+T('toast_todo_added'));
}
function updateTodoList(){
  const container=document.getElementById('todoListContainer');
  if(!container)return;
  const countEl=document.getElementById('todoCount');
  if(countEl){const pending=S.todos.filter(t=>!t.done).length;countEl.textContent=pending;countEl.style.background=pending>0?'var(--primary)':'var(--low)';}
  const pending=S.todos.filter(t=>!t.done);
  const done=S.todos.filter(t=>t.done);
  const all=[...pending,...done];
  if(all.length===0){
    container.innerHTML='<div class="todo-empty"><span>🎉</span><p>'+T('todo_done_all')+'</p></div>';
    return;
  }
  container.innerHTML=all.map(t=>`
    <div class="todo-item${t.done?' todo-done':''}" id="todo_${t.id}" onclick="toggleTodo('${t.id}')">
      <div class="todo-check${t.done?' checked':''}">
        ${t.done?'<svg viewBox="0 0 12 10" fill="none"><path d="M1 5l3 4L11 1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}
      </div>
      <span class="todo-title">${t.title}</span>
      <button class="todo-del" onclick="event.stopPropagation();removeTodo('${t.id}')" title="Supprimer">✕</button>
    </div>
  `).join('');
}

/* ═══ FORGOT PASSWORD ═══ */
function openForgotPassword(){
  const m=document.getElementById('forgotPwdModal');if(!m)return;
  const msgEl=document.getElementById('forgotPwdMsg');if(msgEl)msgEl.textContent='';
  const inp=document.getElementById('forgotPwdEmail');if(inp)inp.value='';
  m.classList.add('show');
}
async function sendForgotPwd(){
  const email=(document.getElementById('forgotPwdEmail')?.value||'').trim();
  const msgEl=document.getElementById('forgotPwdMsg');
  if(!email){if(msgEl)msgEl.textContent='⚠️ '+T('error_field');return;}
  try{
    await window.FB.fbResetPassword(email);
    if(msgEl){msgEl.style.color='var(--green)';msgEl.textContent=T('forgot_pwd_sent');}
    setTimeout(()=>closeModal('forgotPwdModal'),3000);
  }catch(e){
    if(msgEl){msgEl.style.color='var(--danger,#ef4444)';msgEl.textContent=T('forgot_pwd_error');}
  }
}

/* ═══ CUSTOM CONFIRM ═══ */
function customConfirm(title, msg, onYes){
  const m=document.getElementById('customConfirmModal');if(!m)return;
  const t=document.getElementById('customConfirmTitle');if(t)t.textContent=title;
  const d=document.getElementById('customConfirmMsg');if(d)d.textContent=msg;
  const yes=document.getElementById('customConfirmYes');
  const no=document.getElementById('customConfirmNo');
  if(yes){yes.textContent=T('confirm_yes');const y2=yes.cloneNode(true);yes.parentNode.replaceChild(y2,yes);y2.onclick=()=>{m.classList.remove('show');onYes&&onYes();};}
  if(no){no.textContent=T('confirm_no');const n2=no.cloneNode(true);no.parentNode.replaceChild(n2,no);n2.onclick=()=>m.classList.remove('show');}
  m.classList.add('show');
}

/* ═══ PASSWORD STRENGTH ═══ */
function checkPasswordStrength(pwd){
  let score=0;
  if(pwd.length>=8)score++;
  if(pwd.length>=12)score++;
  if(/[A-Z]/.test(pwd))score++;
  if(/[0-9]/.test(pwd))score++;
  if(/[^A-Za-z0-9]/.test(pwd))score++;
  const wrap=document.getElementById('pwdStrengthWrap');
  const fill=document.getElementById('pwdStrengthFill');
  const label=document.getElementById('pwdStrengthLabel');
  if(!wrap||!fill||!label)return;
  if(!pwd){wrap.style.display='none';return;}
  wrap.style.display='block';
  const pct=[0,25,50,75,100][Math.min(score,4)];
  const colors=['#ef4444','#f97316','#eab308','#22c55e'];
  const keys=['pwd_weak','pwd_medium','pwd_strong','pwd_very_strong'];
  const idx=Math.max(0,Math.min(score-1,3));
  fill.style.width=pct+'%';fill.style.background=colors[idx];
  label.textContent=T(keys[idx]);
}

/* ═══ UTILS ═══ */
function toast(msg){const el=document.getElementById('toast');const me=document.getElementById('toastMsg');if(!el||!me)return;me.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500);}
function closeModal(id){document.getElementById(id)?.classList.remove('show');}

/* ═══ STORAGE ═══ */
function saveState(){
  localStorage.setItem('cf_lang', S.lang);
  localStorage.setItem('cf_theme', S.theme);
  localStorage.setItem('cf_equipped', S.equippedItem);
  if(S.user?.uid && window.FB){
    window.FB.fbSaveUser(S.user.uid,{
      xp:S.xp, level:S.level, totalXpEarned:S.totalXpEarned,
      streak:S.streak, lastUsedDate:S.lastUsedDate, tutorialDone:S.tutorialDone,
      template:S.template, templateData:S.templateData, theme:S.theme, lang:S.lang,
      notifications:S.notifications, equippedItem:S.equippedItem,
      totalEvents:S.user?.totalEvents||0, name:S.user?.name||'',
      avatar:S.user?.avatar||'', unlockedBadges:[...unlockedBadges],
      todos:S.todos
    }).catch(e=>console.error('saveState error:',e));
  }
}
function loadState(){ return false; }

window.CF={S,saveState,toast,T};

/* ═══ CUSTOM NUMBER INPUT ═══ */
function cfNum(id,step,min,max){
  const el=document.getElementById(id);if(!el)return;
  let v=parseFloat(el.value)||0;v+=step;
  v=Math.max(min,Math.min(max,Math.round(v*100)/100));
  el.value=v;
}

/* ═══ LEVEL UP NOTIFICATION ═══ */
function showLevelUpNotif(level,reward){
  const n=document.getElementById('lvlupNotif');if(!n)return;
  const t=document.getElementById('lvlupTitle');const s=document.getElementById('lvlupSub');
  if(t)t.textContent=T('lvlup_title').replace('{level}',level);
  if(s)s.textContent=reward?T('lvlup_reward').replace('{reward}',reward):T('lvlup_keep_going');
  // Sync koro inside notif
  const k=document.getElementById('lvlupKoro');
  if(k){const rank=getRank(level);k.style.background=rank.cls.includes('gold')?'radial-gradient(circle at 35% 35%,#ffe680,#FFD700)':rank.cls.includes('diamond')?'radial-gradient(circle at 35% 35%,#d4faff,#B9F2FF)':rank.cls.includes('master')?'radial-gradient(circle at 35% 35%,#c17ee8,#9B59B6)':rank.cls.includes('legend')?'radial-gradient(circle at 35% 35%,#ff8c55,#FF4500)':'radial-gradient(circle at 35% 35%,#ffe680,#ffd000)';}
  n.style.display='flex';void n.offsetWidth;n.classList.add('show');
  setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.style.display='none',400);},4000);
}

/* ═══ SYNC SESSION & WC KORO WITH MAIN MASCOT ═══ */
function syncAllKoros(){
  updateMascot();
}


/* ── Password visibility toggle ── */
function togglePw(inputId, btn){
  const inp = document.getElementById(inputId);
  if(!inp) return;
  if(inp.type === 'password'){
    inp.type = 'text';
    btn.textContent = '🙈';
  } else {
    inp.type = 'password';
    btn.textContent = '👁';
  }
}

/* ── Chronos spy mode on scroll ── */
(function(){
  let spyTimeout;
  const content = document.getElementById('mainContent');
  if(content){
    content.addEventListener('scroll', function(){
      const mascot = document.getElementById('mascot');
      if(!mascot) return;
      mascot.classList.add('spy-mode');
      clearTimeout(spyTimeout);
      spyTimeout = setTimeout(()=>mascot.classList.remove('spy-mode'), 1800);
    });
  }
  window.addEventListener('scroll', function(){
    const mascot = document.getElementById('mascot');
    if(!mascot) return;
    mascot.classList.add('spy-mode');
    clearTimeout(spyTimeout);
    spyTimeout = setTimeout(()=>mascot.classList.remove('spy-mode'), 1800);
  });
})();

/* ── Chronos click animation ── */
function animateChronosClick(){
  const mascot = document.getElementById('mascot');
  if(!mascot) return;
  mascot.classList.add('clicked');
  setTimeout(()=>mascot.classList.remove('clicked'), 600);
}

/* ── Chronos sad 5s after chat closes ── */
function chronosSad(){
  const mascot = document.getElementById('mascot');
  if(!mascot) return;
  mascot.classList.remove('clicked');
  mascot.classList.add('sad');
  setTimeout(()=>mascot.classList.remove('sad'), 5000);
}

/* ═══════════════════════════════════════════════════════════
   INSIGHTS ISLANDS — version propre, IDs unifiés
   ═══════════════════════════════════════════════════════════ */

/* ── helpers ── */
function _iEl(id){ return document.getElementById(id) }
function _delta(a,b){
  if(b===0) return {cls:'flat',ico:'—',txt:'—'};
  const p=Math.round(((a-b)/b)*100);
  if(p>0)  return {cls:'up',   ico:'↑', txt:'+'+p+'%'};
  if(p<0)  return {cls:'down', ico:'↓', txt:p+'%'};
  return {cls:'flat',ico:'—',txt:'±0%'};
}
function _weekEvents(offsetWeeks=0){
  const now=new Date(); const dow=now.getDay();
  const mon=new Date(now); mon.setDate(now.getDate()-dow+1-(offsetWeeks*7)); mon.setHours(0,0,0,0);
  const sun=new Date(mon); sun.setDate(mon.getDate()+6); sun.setHours(23,59,59,999);
  return S.events.filter(e=>{
    const d=e.date instanceof Date?e.date:new Date(e.date);
    return d>=mon && d<=sun;
  });
}

/* ═══ POINT D'ENTRÉE PRINCIPAL ═══ */
function updateInsightsIslands(){
  _buildInsStatCards();
  _buildInsChronosCard();
  _buildInsHeatmap();
  _buildInsCharts();
  _buildInsWow();
}

/* ── 4 Stat cards ── */
function _buildInsStatCards(){
  const wrap = _iEl('insStatRow'); if(!wrap) return;
  const cur  = _weekEvents(0);
  const prev = _weekEvents(1);

  const curH  = cur.reduce((s,e)=>s+(e.duration||60)/60,0);
  const prevH = prev.reduce((s,e)=>s+(e.duration||60)/60,0);
  const curStudy  = cur.filter(e=>e.type==='study').length;
  const prevStudy = prev.filter(e=>e.type==='study').length;

  const cards=[
    {icon:'⏱️', val: Math.round(curH*10)/10+'h', label:T('isc_this_week'),     d:_delta(curH,prevH),        accent:'var(--orange)'},
    {icon:'📚', val: curStudy,                    label:T('isc_study_sessions'), d:_delta(curStudy,prevStudy), accent:'var(--blue)'},
    {icon:'🔥', val: S.streak,                   label:T('isc_streak'),         d:{cls:'up',ico:'🔥',txt:T('sb_streak_label')}, accent:'var(--amber)'},
    {icon:'⚡', val: S.xp+' XP',                 label:T('isc_xp_total'),       d:{cls:'up',ico:'↑',txt:T('wr_stat_level')+' '+S.level}, accent:'var(--purple)'},
  ];

  wrap.innerHTML = cards.map(c=>`
    <div class="ins-stat-card" style="--accent:${c.accent}">
      <span class="isc-icon">${c.icon}</span>
      <div class="isc-val">${c.val}</div>
      <div class="isc-label">${c.label}</div>
      <div class="isc-delta ${c.d.cls}">${c.d.ico} ${c.d.txt}</div>
    </div>`).join('');
}

/* ── Chronos insight card ── */
async function _buildInsChronosCard(){
  const wrap = _iEl('insChronosCard'); if(!wrap) return;
  wrap.innerHTML = `
    <div class="ins-chronos-card">
      <div class="icc-av">⚡</div>
      <div class="icc-body">
        <div class="icc-name">Chronos</div>
        <div class="icc-msg typing" id="iccMsg">Analyse en cours...</div>
      </div>
    </div>`;

  const key = localStorage.getItem('cf_apikey');
  if(!key){ const m=_iEl('iccMsg'); if(m){m.classList.remove('typing');m.textContent='Configure ta clé API dans Paramètres pour voir mes insights ✨';} return; }

  const cur = _weekEvents(0);
  const h   = Math.round(cur.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const lang = S.lang||'fr';
  const context = `Semaine: ${cur.length} événements, ${h}h planifiées, streak ${S.streak}j, niveau ${S.level}, XP ${S.xp}.`;

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({
        model:'claude-haiku-4-5-20251001',
        max_tokens:80,
        system:`Tu es Chronos, assistant planning bienveillant. Réponds en ${lang}. 1 phrase courte, percutante, max 20 mots, ton encourageant.`,
        messages:[{role:'user',content:context}]
      })
    });
    const d = await r.json();
    const txt = d.content?.[0]?.text||'';
    const m = _iEl('iccMsg');
    if(m && txt){ m.classList.remove('typing'); _typeText(m, txt); }
  } catch(e){
    const m=_iEl('iccMsg');
    if(m){m.classList.remove('typing');m.textContent='Bonne semaine ! Continue comme ça 💪';}
  }
}
function _typeText(el, txt, i=0){
  if(i===0) el.textContent='';
  if(i<txt.length){ el.textContent+=txt[i]; setTimeout(()=>_typeText(el,txt,i+1),22); }
}

/* ── Heatmap 52 semaines ── */
function _buildInsHeatmap(){
  const wrap = _iEl('insHeatmap'); if(!wrap) return;
  const now = new Date();
  const end = new Date(now); end.setDate(end.getDate()+(6-end.getDay()));
  const start = new Date(end); start.setDate(end.getDate()-364);

  const dayMap={};
  S.events.forEach(ev=>{
    if(!ev.date) return;
    const k=new Date(ev.date instanceof Date?ev.date:new Date(ev.date)).toDateString();
    dayMap[k]=(dayMap[k]||0)+(ev.duration||60)/60;
  });

  let cur=new Date(start);
  while(cur.getDay()!==0) cur.setDate(cur.getDate()+1);

  const cols=[];
  while(cur<=end){
    const week=[];
    for(let d=0;d<7;d++){
      const k=cur.toDateString();
      const h=dayMap[k]||0;
      const lv=h===0?0:h<1?1:h<3?2:h<5?3:4;
      const ds=cur.toLocaleDateString(S.lang||'fr',{day:'numeric',month:'short',year:'numeric'});
      week.push(`<div class="hm-cell lv${lv}" title="${ds} — ${Math.round(h*10)/10}h"></div>`);
      cur.setDate(cur.getDate()+1);
    }
    cols.push(week.join(''));
  }

  wrap.innerHTML=`
    <div class="ins-heatmap-card">
      <div class="ins-card-header">
        <span class="ins-card-title">📅 ${T('ins_heatmap_title')}</span>
        <span class="ins-card-sub">${Object.keys(dayMap).length} ${T('ins_active_days')}</span>
      </div>
      <div class="heatmap-grid">${cols.join('')}</div>
      <div class="hm-legend">
        <span>${T('ins_heatmap_less')}</span>
        <div class="hm-legend-cell lv0" style="background:var(--s3)"></div>
        <div class="hm-legend-cell lv1" style="background:rgba(255,107,53,.22)"></div>
        <div class="hm-legend-cell lv2" style="background:rgba(255,107,53,.45)"></div>
        <div class="hm-legend-cell lv3" style="background:rgba(255,107,53,.7)"></div>
        <div class="hm-legend-cell lv4" style="background:var(--orange)"></div>
        <span>${T('ins_heatmap_more')}</span>
      </div>
    </div>`;
}

/* ── Charts row : XP graph + Donut ── */
function _buildInsCharts(){
  const wrap = _iEl('insChartsRow'); if(!wrap) return;
  wrap.innerHTML = `
    <div class="ins-chart-card" id="_xpGraphCard"></div>
    <div class="ins-chart-card" id="_donutCard"></div>`;
  _buildXpGraph();
  _buildDonutChart();
}

function _buildXpGraph(){
  const wrap=_iEl('_xpGraphCard'); if(!wrap) return;
  const now=new Date();
  const days=[];
  for(let i=29;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d);}
  const vals=days.map(d=>{
    const evs=S.events.filter(e=>{
      const dd=e.date instanceof Date?e.date:new Date(e.date);
      return dd.toDateString()===d.toDateString();
    });
    return evs.reduce((s,e)=>s+(e.duration||60)/60,0)*10;
  });
  const maxV=Math.max(...vals,1);
  const W=380,H=110,px=i=>Math.round(i*(W-20)/29)+10,py=v=>Math.round(H-8-(v/maxV)*(H-18));
  const pts=vals.map((v,i)=>`${px(i)},${py(v)}`).join(' ');
  const area=`M${px(0)},${H} ${vals.map((v,i)=>`L${px(i)},${py(v)}`).join(' ')} L${px(29)},${H} Z`;
  const totalXp=vals.reduce((s,v)=>s+v,0);

  wrap.innerHTML=`
    <div class="ins-card-header">
      <span class="ins-card-title">⚡ ${T('ins_xp_title')}</span>
      <span class="ins-card-sub" style="color:var(--orange);font-weight:800">+${Math.round(totalXp)} XP</span>
    </div>
    <svg class="xp-graph-svg" viewBox="0 0 ${W} ${H}" style="height:${H}px">
      <defs>
        <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="rgba(255,107,53,.35)"/>
          <stop offset="100%" stop-color="rgba(255,107,53,0)"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#xpGrad)"/>
      <polyline points="${pts}" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>`;
}

function _buildDonutChart(){
  const wrap=_iEl('_donutCard'); if(!wrap) return;
  const types=[
    {key:'study',   label:T('type_study'),   color:'var(--blue)'},
    {key:'work',    label:T('type_work'),    color:'var(--purple)'},
    {key:'sport',   label:T('type_sport'),   color:'var(--green)'},
    {key:'social',  label:T('type_social'),  color:'#ec4899'},
    {key:'leisure', label:T('type_leisure'), color:'var(--amber)'},
    {key:'other',   label:T('type_other'),   color:'#6b7280'},
  ];
  const counts={}; let total=0;
  S.events.forEach(e=>{const k=e.type||'other';counts[k]=(counts[k]||0)+1;total++;});
  if(total===0){wrap.innerHTML=`<div class="ins-card-header"><span class="ins-card-title">📊 ${T('ins_donut_title')}</span></div><div style="color:var(--t3);font-size:.8rem;text-align:center;padding:1.5rem">${T('ins_donut_no_events')}</div>`;return;}

  const R=48,r=30,cx=60,cy=60,τ=2*Math.PI;
  let angle=-Math.PI/2;
  const slices=types.map(t=>{
    const pct=(counts[t.key]||0)/total;
    const sweep=pct*τ;
    const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
    angle+=sweep;
    const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);
    const lg=sweep>Math.PI?1:0;
    const xi=cx+r*Math.cos(angle-sweep),yi=cy+r*Math.sin(angle-sweep);
    const xj=cx+r*Math.cos(angle),yj=cy+r*Math.sin(angle);
    const path=`M${x1},${y1} A${R},${R},0,${lg},1,${x2},${y2} L${xj},${yj} A${r},${r},0,${lg},0,${xi},${yi} Z`;
    return {path, color:t.color, pct:Math.round(pct*100)};
  }).filter(s=>s.pct>0);

  const legend=types.filter(t=>(counts[t.key]||0)>0).map(t=>`
    <div class="donut-leg-row">
      <div class="donut-leg-dot" style="background:${t.color}"></div>
      <span class="donut-leg-name">${t.label}</span>
      <span class="donut-leg-pct">${Math.round(((counts[t.key]||0)/total)*100)}%</span>
    </div>`).join('');

  wrap.innerHTML=`
    <div class="ins-card-header">
      <span class="ins-card-title">📊 ${T('ins_donut_title')}</span>
      <span class="ins-card-sub">${total} ${T('ins_events')}</span>
    </div>
    <div class="donut-wrap">
      <svg viewBox="0 0 120 120" style="width:110px;height:110px;flex-shrink:0">
        ${slices.map(s=>`<path d="${s.path}" fill="${s.color}" stroke="var(--s1)" stroke-width="1.5"/>`).join('')}
        <circle cx="${cx}" cy="${cy}" r="${r-2}" fill="var(--s1)"/>
        <text x="${cx}" y="${cy+5}" text-anchor="middle" fill="var(--t1)" font-size="11" font-weight="900">${total}</text>
      </svg>
      <div class="donut-legend">${legend}</div>
    </div>`;
}

/* ── Week-over-Week ── */
function _buildInsWow(){
  const wrap=_iEl('insWow'); if(!wrap) return;
  const cur=_weekEvents(0), prev=_weekEvents(1);
  const cH=Math.round(cur.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const pH=Math.round(prev.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const cS=cur.filter(e=>e.type==='study').length;
  const pS=prev.filter(e=>e.type==='study').length;

  const dH=_delta(cH,pH), dEv=_delta(cur.length,prev.length), dS=_delta(cS,pS);
  const metrics=[
    {label:T('ins_wow_hours'),  val:cH+'h',       delta:dH},
    {label:T('ins_wow_events'), val:cur.length,   delta:dEv},
    {label:T('ins_wow_study'),  val:cS,           delta:dS},
    {label:T('ins_wow_streak'), val:S.streak,     delta:{cls:'up',ico:'🔥',txt:T('sb_streak_label')}},
  ];

  wrap.innerHTML=`
    <div class="ins-wow-card">
      <div class="ins-card-header">
        <span class="ins-card-title">📈 ${T('ins_wow_title')}</span>
      </div>
      <div class="wow-grid">
        ${metrics.map(m=>`
          <div class="wow-metric">
            <div class="wow-metric-lbl">${m.label}</div>
            <div class="wow-metric-val">${m.val}</div>
            <div class="wow-delta ${m.delta.cls}">${m.delta.ico} ${m.delta.txt}</div>
          </div>`).join('')}
      </div>
    </div>`;
}

/* ═══════════════════════════════════════════════════════════
   CHRONOS IMMERSIF V2 — Réactions contextuelles
   ═══════════════════════════════════════════════════════════ */

/* ── Speech bubble spontanée ── */
let speechTimeout=null;
function chronosSpeak(msg, duration=4000){
  let bubble = document.getElementById('chronosSpeechBubble');
  if(!bubble){
    bubble = document.createElement('div');
    bubble.id = 'chronosSpeechBubble';
    bubble.className = 'chronos-speech';
    document.body.appendChild(bubble);
  }
  bubble.textContent = msg;
  bubble.classList.add('show');
  clearTimeout(speechTimeout);
  speechTimeout = setTimeout(()=>bubble.classList.remove('show'), duration);
}

/* ── Messages contextuels par heure ── */
function chronosTimeGreeting(){
  const h = new Date().getHours();
  if(h>=5&&h<12)  chronosSpeak(T('chronos_morning'), 5000);
  else if(h>=12&&h<14) chronosSpeak(T('chronos_lunch'), 4000);
  else if(h>=14&&h<18) chronosSpeak(T('chronos_afternoon'), 4000);
  else if(h>=18&&h<22) chronosSpeak(T('chronos_evening'), 4000);
  else chronosSpeak(T('chronos_night'), 4000);
}

/* ── Réaction badge unlock ── */
function chronosCelebrateBadge(badgeName){
  const mascot = document.getElementById('mascot'); if(!mascot) return;
  mascot.classList.add('celebrate');
  setTimeout(()=>mascot.classList.remove('celebrate'), 1200);
  chronosSpeak(T('chronos_badge').replace('{name}',badgeName), 5000);
  spawnConfetti();
}

/* ── Réaction XP gain ── */
function chronosXpReact(xpGained){
  const mascot = document.getElementById('mascot'); if(!mascot) return;
  mascot.classList.add('xp-react');
  setTimeout(()=>mascot.classList.remove('xp-react'), 700);
  if(xpGained>=50) chronosSpeak(T('chronos_xp').replace('{xp}',xpGained), 3000);
}

/* ── Réaction streak ── */
function chronosStreakReact(streak){
  const mascot = document.getElementById('mascot'); if(!mascot) return;
  if(streak>0&&streak%7===0){
    mascot.classList.add('streak-glow');
    setTimeout(()=>mascot.classList.remove('streak-glow'), 4000);
    chronosSpeak(T('chronos_streak').replace('{streak}',streak), 5000);
  }
}

/* ── Confetti ── */
function spawnConfetti(){
  const wrap = document.createElement('div');
  wrap.className = 'confetti-wrap';
  document.body.appendChild(wrap);
  const colors = ['#FF6B35','#FFD700','#6366f1','#10B981','#F59E0B','#EC4899'];
  for(let i=0;i<60;i++){
    const p = document.createElement('div');
    p.className = 'confetti-p';
    p.style.cssText = `
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-duration:${1.5+Math.random()*2}s;
      animation-delay:${Math.random()*.5}s;
      width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;
      border-radius:${Math.random()>.5?'50%':'3px'};
    `;
    wrap.appendChild(p);
  }
  setTimeout(()=>wrap.remove(), 4000);
}

/* ── checkBadgesV2 : wraps checkBadges + Chronos reaction ── */
function checkBadgesV2(){
  const before = new Set(unlockedBadges);
  checkBadges();
  ALL_BADGES.forEach(b=>{
    if(!before.has(b.id) && unlockedBadges.has(b.id)){
      setTimeout(()=>chronosCelebrateBadge(b.name), 400);
    }
  });
}

/* ── addXpV2 : wraps addXp + Chronos reaction ── */
function addXpV2(n){
  addXp(n);
  chronosXpReact(n);
}

/* ── launchAppV2 : init Chronos immersif ── */
function launchAppV2(){
  setTimeout(chronosTimeGreeting, 2200);
  const TIPS = [
    T('chronos_tip1'),T('chronos_tip2'),T('chronos_tip3'),T('chronos_tip4'),
    T('chronos_tip5').replace('{level}',S.level||1),
  ];
  setInterval(()=>{
    const tip = TIPS[Math.floor(Math.random()*TIPS.length)];
    chronosSpeak(tip, 5000);
  }, 8*60*1000);
}

/* ══════════════════════════════════════════════════════════════
   CHRONOFLOW V7 — Premium Animations & Interactions
   ══════════════════════════════════════════════════════════════ */

/* ── Branded loader ── */
function showBrandedLoader(){
  const msgs = [T('loader_1'),T('loader_2'),T('loader_3'),T('loader_4')];
  const el = document.getElementById('brandedLoader');
  if(!el) return;
  const msgEl = el.querySelector('.bl-msg');
  let i = 0;
  const iv = setInterval(()=>{ if(msgEl && i < msgs.length){ msgEl.style.opacity='0'; setTimeout(()=>{ if(msgEl){ msgEl.textContent=msgs[i++]; msgEl.style.opacity='1'; }},200); } }, 700);
  return iv;
}
function hideBrandedLoader(){
  const el = document.getElementById('brandedLoader');
  if(el){ el.classList.add('bl-fade-out'); setTimeout(()=>el.remove(),450); }
}

/* ── Eye tracking ── */
let eyeTrackingActive = false;
function initEyeTracking(){
  if(eyeTrackingActive) return;
  eyeTrackingActive = true;
  document.addEventListener('mousemove', e => {
    const mascot = document.getElementById('mascot');
    if(!mascot) return;
    const eyes = mascot.querySelectorAll('.ch-eye');
    const rect = mascot.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx*dx+dy*dy);
    const maxMove = 2.5;
    const mx = dist > 0 ? (dx/dist)*Math.min(dist/60,1)*maxMove : 0;
    const my = dist > 0 ? (dy/dist)*Math.min(dist/60,1)*maxMove : 0;
    eyes.forEach(eye => {
      eye.style.setProperty('--ex', mx+'px');
      eye.style.setProperty('--ey', my+'px');
    });
  });
}

/* ── Ripple on button click ── */
function initRipple(){
  document.addEventListener('click', e => {
    const btn = e.target.closest('button, .nav-btn, .btn-primary, .btn-secondary, .btn-auth');
    if(!btn || btn.classList.contains('no-ripple')) return;
    btn.classList.remove('ripple');
    void btn.offsetWidth;
    btn.classList.add('ripple');
    setTimeout(()=>btn.classList.remove('ripple'), 550);
  });
}

/* ── Animated number counter ── */
function animateNumber(el, from, to, duration=800){
  if(!el) return;
  const start = performance.now();
  const update = (now) => {
    const pct = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1-pct, 3);
    const val = Math.round(from + (to - from) * ease);
    el.textContent = val;
    if(pct < 1) requestAnimationFrame(update);
    else el.textContent = to;
  };
  requestAnimationFrame(update);
}

/* ── Streak flame intensity ── */
function updateStreakFlame(streak){
  const pill = document.getElementById('streakPill');
  const sbFire = document.querySelector('.sb-streak-fire');
  if(streak >= 7){
    if(pill) pill.setAttribute('data-streak','high');
    if(sbFire) sbFire.classList.add('high');
  } else {
    if(pill) pill.removeAttribute('data-streak');
    if(sbFire) sbFire.classList.remove('high');
  }
}

/* ── Sound system (optional, off by default) ── */
const SoundFX = {
  enabled: false,
  ctx: null,
  init(){
    if(this.ctx) return;
    try { this.ctx = new (window.AudioContext||window.webkitAudioContext)(); } catch(e){}
  },
  play(type){
    if(!this.enabled || !this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.connect(g); g.connect(this.ctx.destination);
    if(type==='xp'){
      o.frequency.setValueAtTime(880,this.ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(1200,this.ctx.currentTime+0.1);
      g.gain.setValueAtTime(0.08,this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.22);
      o.start(); o.stop(this.ctx.currentTime+0.22);
    } else if(type==='badge'){
      [523,659,784,1047].forEach((f,i)=>{
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.connect(g2); g2.connect(this.ctx.destination);
        o2.frequency.value = f;
        g2.gain.setValueAtTime(0.07,this.ctx.currentTime+i*0.12);
        g2.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+i*0.12+0.2);
        o2.start(this.ctx.currentTime+i*0.12);
        o2.stop(this.ctx.currentTime+i*0.12+0.2);
      });
    }
  }
};

/* ── Override addXpV2 to add sound + animated counter ── */
const _origAddXpV2 = addXpV2;
window.addXpV2 = function(n){
  _origAddXpV2(n);
  SoundFX.init(); SoundFX.play('xp');
  updateStreakFlame(S.streak);
  // Animate XP value in sidebar
  const sbXpVal = document.getElementById('sbXpVal');
  if(sbXpVal){
    const prev = parseInt(sbXpVal.textContent)||0;
    animateNumber(sbXpVal, prev, S.xp);
    setTimeout(()=>{ if(sbXpVal) sbXpVal.textContent = S.xp+' XP'; }, 850);
  }
};

/* ── Override chronosCelebrateBadge to add sound ── */
const _origCelebrate = chronosCelebrateBadge;
window.chronosCelebrateBadge = function(badgeName){
  _origCelebrate(badgeName);
  SoundFX.init(); SoundFX.play('badge');
};

/* ── Mascot entry animation on app load ── */
function mascotEntry(){
  const m = document.getElementById('mascot');
  if(!m) return;
  m.classList.add('entry');
  setTimeout(()=>m.classList.remove('entry'), 800);
}

/* ── Chronos context expressions ── */
function updateChronosExpression(ctx){
  const m = document.getElementById('mascot');
  if(!m) return;
  m.classList.remove('sad','celebrate','xp-react','streak-glow','dance');
  if(ctx === 'sad') m.classList.add('sad');
  else if(ctx === 'celebrate') m.classList.add('celebrate');
}

/* ── Session end dance ── */
function chronosSessionDance(){
  const m = document.getElementById('mascot');
  if(!m) return;
  m.classList.add('dance');
  setTimeout(()=>m.classList.remove('dance'), 2000);
  spawnConfetti();
  chronosSpeak(T('chronos_session_done'), 4000);
}

/* ── Error state builder ── */
function buildErrorState(container, msg){
  if(!container) return;
  container.innerHTML = `
    <div class="error-state">
      <div style="font-size:3rem">😕</div>
      <h3>${T('error_oops')}</h3>
      <p>${msg || T('error_generic')}</p>
      <button class="btn-primary" onclick="location.reload()">${T('error_retry')}</button>
    </div>`;
}

/* ── Override endSession to trigger dance ── */
const _origEndSession = endSession;
window.endSession = function(){
  _origEndSession();
  setTimeout(chronosSessionDance, 300);
};

/* ── Sidebar sync with streak flame ── */
const _origUpdateHeader = updateHeader;
window.updateHeader = function(){
  _origUpdateHeader();
  updateStreakFlame(S.streak);
  // Sync sidebar streak count
  const sbStreakCount = document.getElementById('sbStreakCount');
  if(sbStreakCount) sbStreakCount.textContent = S.streak || 0;
};

/* ── Enhanced launchApp: entry animation + eye tracking + ripple ── */
const _origLaunchApp = launchApp;
window.launchApp = function(){
  hideBrandedLoader();
  _origLaunchApp();
  setTimeout(mascotEntry, 400);
  setTimeout(initEyeTracking, 1200);
  initRipple();
  updateStreakFlame(S.streak);
};

/* ── Init branded loader immediately on page load ── */
document.addEventListener('DOMContentLoaded', ()=>{
  showBrandedLoader();
});
