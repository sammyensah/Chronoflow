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
  equippedItem:'default'
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
    lang_changed:'✅ Langue changée',
    tut1:"Bienvenue ! 👋 Voici la zone IA. Décris ton planning et je génère tout automatiquement !",
    tut2:"Ton planning hebdomadaire s'affiche ici. Les cours de ton template y apparaissent aussi !",
    tut3:"Le calendrier mensuel. Clique sur une date pour voir tous les événements 📅",
    tut4:"Les Insights te montrent tes stats et ta progression 📊",
    tut5:"Ici tu gagnes des XP et tu montes de niveau ! 🎖️",
    tut6:"Je suis Chronos ! Clique sur moi pour me parler ou changer mon costume dans le Casier 🌟",
    obChooseProfile:'Choisis ton profil',obStudentTitle:'🎓 Configuration Étudiant',obWorkerTitle:'💼 Configuration Travailleur',obCustomTitle:'✨ Configuration Personnalisée',
    pcStudent:'Étudiant',pcWorker:'Travailleur',pcCustom:'Personnalisé',pcStudentDesc:'Cours, révisions, examens',pcWorkerDesc:'Projets, réunions, deadlines',pcCustomDesc:'Je configure moi-même',
    btnAddCourse:'Ajouter un cours',btnBack:'Retour',btnFinish:'Terminer',
    lblMaxStudy:'Max révision/jour (h)',lblMaxLeisure:'Max loisirs/jour (h)',lblBreakBetween:'Pause entre événements (min)',
    lblWorkStart:'Début journée',lblWorkEnd:'Fin journée',lblMaxWork:'Max travail/jour (h)',lblBreakW:'Pause entre tâches (min)',
    lblMaxStudyC:'Max révision/jour (h)',lblMaxLeisureC:'Max loisirs/jour (h)',lblBreakC:'Pause (min)',
    lblEmail:'Email',lblPassword:'Mot de passe',lblName:'Prénom',lblEmailR:'Email',lblPasswordR:'Mot de passe',
    btnLogin:'Se connecter →',btnRegister:'Créer mon compte →',
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
    tut6:"I'm Chronos! Click me to chat or change my costume in the Locker 🌟",
    obChooseProfile:'Choose your profile',obStudentTitle:'🎓 Student Setup',obWorkerTitle:'💼 Worker Setup',obCustomTitle:'✨ Custom Setup',
    pcStudent:'Student',pcWorker:'Worker',pcCustom:'Custom',pcStudentDesc:'Classes, studying, exams',pcWorkerDesc:'Projects, meetings, deadlines',pcCustomDesc:'I set it up myself',
    btnAddCourse:'Add a class',btnBack:'Back',btnFinish:'Finish',
    lblMaxStudy:'Max study/day (h)',lblMaxLeisure:'Max leisure/day (h)',lblBreakBetween:'Break between events (min)',
    lblWorkStart:'Day start',lblWorkEnd:'Day end',lblMaxWork:'Max work/day (h)',lblBreakW:'Break between tasks (min)',
    lblMaxStudyC:'Max study/day (h)',lblMaxLeisureC:'Max leisure/day (h)',lblBreakC:'Break (min)',
    lblEmail:'Email',lblPassword:'Password',lblName:'First name',lblEmailR:'Email',lblPasswordR:'Password',
    btnLogin:'Log in →',btnRegister:'Create account →',
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
    btnLogin:'Anmelden →',btnRegister:'Konto erstellen →',
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
    btnLogin:'Iniciar sesión →',btnRegister:'Crear cuenta →',
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
    btnLogin:'Accedi →',btnRegister:'Crea account →',
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
    btnLogin:'Entrar →',btnRegister:'Criar conta →',
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
    btnLogin:'تسجيل الدخول →',btnRegister:'إنشاء حساب →',
  }
};

function T(key){ return (LANGS[S.lang]||LANGS.fr)[key]||key; }

function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=T(el.dataset.i18n); });
  const ids={
    authTagline:'wcDesc', loadingTxt:'loading',
    wcTitle:'wcTitle', wcDesc:'wcDesc', wcSkip:'wcSkip', wcStart:'wcStart',
    tabLogin:'login_tab', tabRegister:'register_tab',
    lblEmail:'lblEmail',lblPassword:'lblPassword',lblName:'lblName',lblEmailR:'lblEmailR',lblPasswordR:'lblPasswordR',
    btnLogin:'btnLogin',btnRegister:'btnRegister',
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
  if(S.level>prev){const reward=LEVEL_REWARDS[S.level]||null;showLevelUpNotif(S.level,reward);updateMascot();syncAllKoros();setTimeout(updateRankDisplays,300);if(S.notifications)sendNotif('⬆️ ChronoFlow','Niveau '+S.level+' !'+(reward?' Tu débloqueras '+reward:''));if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{level:S.level,xp:S.xp,totalXpEarned:S.totalXpEarned});}
  showXpPop('+'+amt+' XP'); saveState(); updateXpBar();
}
function showXpPop(txt){const el=document.getElementById('xpPopup');if(!el)return;el.textContent=txt;el.classList.remove('show');void el.offsetWidth;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2000);}

function updateXpBar(){
  const rank=getRank(S.level);
  const cur=curLvXp(),need=nextLvXp(),pct=Math.min(100,Math.round((cur/need)*100));
  const ll=document.getElementById('xpLevelLabel');if(ll)ll.textContent='Niveau '+S.level;
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
  const koro=document.getElementById('mascotKoro');if(koro)koro.className='koro-wrap koro-rank-'+rank.cls.replace('rank-','');
  const item=CHRONOS_ITEMS.find(i=>i.id===S.equippedItem)||CHRONOS_ITEMS[0];
  const suit=document.getElementById('koroSuit');if(suit)suit.style.background=item.type==='suit'&&item.bg?item.bg:'';
  const tie=document.getElementById('koroTie');if(tie)tie.style.background=S.equippedItem==='gold_tie'?'linear-gradient(180deg,#FFD700,#c4a800)':rank.color;
  const acc=document.getElementById('koroAcc');if(acc){if(item.type==='acc'){acc.textContent=item.icon;acc.style.opacity='1';}else acc.style.opacity='0';}
}
function updateLockerGrid(){
  const g=document.getElementById('lockerGrid');if(!g)return;
  g.innerHTML=CHRONOS_ITEMS.map(item=>{
    const un=S.level>=item.lvl,eq=S.equippedItem===item.id;
    return '<div class="locker-item'+(eq?' equipped':'')+(un?'':' locked')+'" onclick="'+(un?'equipItem(\''+item.id+'\')':'')+'">'
      +'<div class="li-icon">'+item.icon+'</div><div class="li-name">'+item.name+'</div><div class="li-lvl">Niv. '+item.lvl+'</div>'
      +(eq?'<div class="li-badge">Équipé</div>':(un?'':'🔒'))+'</div>';
  }).join('');
}
function equipItem(id){S.equippedItem=id;localStorage.setItem('cf_equipped',id);updateLockerGrid();updateMascot();toast('✅ Équipement changé !');if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{equippedItem:id});}

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
  ALL_BADGES.forEach(b=>{if(!unlockedBadges.has(b.id)&&b.cond()){unlockedBadges.add(b.id);if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{unlockedBadges:[...unlockedBadges]}).catch(()=>{});toast('🏅 Badge : '+b.name+'!');if(b.xp>0)setTimeout(()=>addXp(b.xp),500);}});
}
function updateBadgeHint(){
  const el=document.getElementById('chronoBadgeText');if(!el)return;
  const next=Object.keys(LEVEL_REWARDS).map(Number).sort((a,b)=>a-b).find(l=>l>S.level);
  if(!next){el.innerHTML='Tu as tout débloqué ! 👑';return;}
  el.innerHTML='Niveau <strong>'+next+'</strong> → tu débloqueras <strong>'+LEVEL_REWARDS[next]+'</strong> pour Chronos !';
}

/* ═══ TUTORIAL ═══ */
const TUT_STEPS=[
  {view:'planning',target:'aiPanel',      txtKey:'tut1'},
  {view:'planning',target:'planningGrid', txtKey:'tut2'},
  {view:'calendar',target:'monthCal',     txtKey:'tut3'},
  {view:'insights',target:'insightsGrid', txtKey:'tut4'},
  {view:'badges',  target:'xpSection',    txtKey:'tut5'},
  {view:'planning',target:'mascot',       txtKey:'tut6'},
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
  // Charge la langue depuis localStorage (pas sensible, juste UI)
  S.lang = localStorage.getItem('cf_lang') || 'fr';
  S.equippedItem = localStorage.getItem('cf_equipped') || 'default';
  applyTheme(localStorage.getItem('cf_theme') || 'dark');
  makeParticles('particlesLang');makeParticles('particles');makeParticles('particles2');
  applyI18n();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')handleEsc();});
  document.addEventListener('click',e=>{if(!e.target.closest('#langDDWrap'))closeLangDD();});

  // Firebase écoute si un utilisateur est déjà connecté
  window.FB.fbOnAuthChange(async (uid) => {
    if (uid) {
      // Utilisateur connecté — charge ses données depuis Firestore
      try {
        const userData = await window.FB.fbGetUser(uid);
        if (userData) {
          S.user         = userData;
          S.xp           = userData.xp           || 0;
          S.level        = userData.level         || 1;
          S.totalXpEarned= userData.totalXpEarned || 0;
          S.streak       = userData.streak        || 0;
          S.lastUsedDate = userData.lastUsedDate  || null;
          S.tutorialDone = userData.tutorialDone  || false;
          S.template     = userData.template      || 'custom';
          S.templateData = Object.assign({maxStudy:4,maxLeisure:3,breakMin:10,courses:[],workStart:'09:00',workEnd:'18:00',maxWork:8}, userData.templateData || {});
          S.theme        = userData.theme         || 'dark';
          S.lang         = userData.lang          || S.lang;
          S.notifications= userData.notifications !== undefined ? userData.notifications : true;
          S.equippedItem = userData.equippedItem  || 'default';
          // Charger les badges débloqués
          if(userData.unlockedBadges) userData.unlockedBadges.forEach(id=>unlockedBadges.add(id));
          // Charge les événements depuis la sous-collection
          S.events = await window.FB.fbGetEvents(uid);
          localStorage.setItem('cf_lang', S.lang);
          localStorage.setItem('cf_equipped', S.equippedItem);
          localStorage.setItem('cf_theme', S.theme);
          launchApp();
        }
      } catch(e) {
        console.error('Erreur chargement données:', e);
        document.getElementById('authScreen').style.display='flex';
      }
    } else {
      // Pas connecté — affiche l'écran de langue ou d'auth
      const hasLang = localStorage.getItem('cf_lang');
      if (!hasLang) {
        document.getElementById('langScreen').style.display='flex';
      } else {
        document.getElementById('authScreen').style.display='flex';
      }
    }
  });
}
// DOM est déjà prêt quand script.js est chargé dynamiquement
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',initApp);}else{initApp();}

function handleEsc(){
  if(S.sessionActive){tryExitSession();return;}
  document.querySelectorAll('.modal.show,.modal-full.show').forEach(m=>m.classList.remove('show'));
}

/* ═══ LANGUAGE ═══ */
function selectLang(lang){
  S.lang=lang;localStorage.setItem('cf_lang',lang);
  document.getElementById('langScreen').style.display='none';
  document.getElementById('authScreen').style.display='flex';
  applyI18n();updateLangDD();
}
function setLang(lang){
  S.lang=lang;localStorage.setItem('cf_lang',lang);
  updateLangDD();closeLangDD();toast(T('lang_changed'));applyI18n();
  if(S.user?.uid) window.FB.fbSaveUser(S.user.uid, {lang});
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
    await window.FB.fbLogin(email, pass);
    // fbOnAuthChange va se déclencher automatiquement et appeler launchApp()
  }catch(e){
    const msg = e.code==='auth/user-not-found'||e.code==='auth/invalid-credential' ? T('error_account')
              : e.code==='auth/wrong-password' ? T('error_pwd_wrong')
              : e.code==='auth/invalid-email' ? T('error_email')
              : e.message;
    toast('❌ '+msg);
  }finally{if(btn)btn.disabled=false;}
}
async function handleRegister(){
  const name=document.getElementById('regName').value.trim();
  const email=document.getElementById('regEmail').value.trim();
  const pass=document.getElementById('regPassword').value;
  if(!name||!email||!pass){toast('⚠️ '+T('error_field'));return;}
  if(!email.includes('@')){toast('⚠️ '+T('error_email'));return;}
  if(pass.length<6){toast('⚠️ '+T('error_pwd'));return;}
  const btn=document.getElementById('btnRegister');if(btn)btn.disabled=true;
  try{
    const uid = await window.FB.fbRegister(name, email, pass);
    // Initialise l'état local
    S.user={uid, name, email, avatar:'', totalEvents:0};
    S.template='custom';S.events=[];S.streak=0;S.xp=0;S.level=1;
    document.getElementById('authScreen').style.display='none';
    document.getElementById('onboardingScreen').style.display='flex';
  }catch(e){
    const msg = e.code==='auth/email-already-in-use' ? T('error_email_used')
              : e.code==='auth/invalid-email' ? T('error_email')
              : e.code==='auth/weak-password' ? T('error_pwd')
              : e.message;
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
  row.innerHTML='<div class="cf-select-wrap"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select></div><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';
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
    await window.FB.fbSaveUser(S.user.uid, {
      template:S.template, templateData:S.templateData, lastUsedDate:S.lastUsedDate
    });
  }
  launchApp();
}

/* ═══ LAUNCH APP ═══ */
function launchApp(){
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
    setTimeout(()=>addXp(XP_GAINS.daily_login),800);
  }
  if(!S.tutorialDone)setTimeout(()=>document.getElementById('welcomeModal').classList.add('show'),700);
  // Sidebar hover zone
  const hz=document.getElementById('sidebarHoverZone');
  if(hz){hz.addEventListener('mouseenter',()=>toggleSidebar(true));
  document.getElementById('sidebar')?.addEventListener('mouseleave',(e)=>{if(!e.relatedTarget||!e.currentTarget.contains(e.relatedTarget))toggleSidebar(false);});}
  requestNotifPermission();
  const apiKey=localStorage.getItem('cf_apikey')||'';
  if(apiKey){const el=document.getElementById('apiKeyInput');if(el)el.value='••••'+apiKey.slice(-4);}
  updateMascot();setTimeout(syncAllKoros,200);
}
function reloadApp(){if(confirm('Revenir à l\'accueil ?'))location.reload();}

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
  const el=document.getElementById('headerStreak');if(el)el.textContent=S.streak;
  const img=document.getElementById('headerAvatarImg');const em=document.getElementById('headerAvatarEmoji');
  if(S.user?.avatar){img.src=S.user.avatar;img.style.display='block';em.style.display='none';}
  else{img.style.display='none';em.style.display='block';}
}

/* ═══ VIEWS ═══ */
function switchView(v){
  S.activeView=v;closeSidebar();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  document.querySelectorAll('.view').forEach(el=>el.classList.remove('active'));
  const vEl=document.getElementById('view'+v[0].toUpperCase()+v.slice(1));if(vEl)vEl.classList.add('active');
  document.getElementById('aiPanel').style.display=v==='planning'?'block':'none';
  updateCurrentView();
}
function updateCurrentView(){
  ({planning:updatePlanning,calendar:updateCalendar,insights:updateInsights,templates:updateTemplates,badges:updateBadges,profile:updateProfile,settings:()=>{updateLangDD();initToggles();}})[S.activeView]?.();
}
function updateAllViews(){updatePlanning();updateCalendar();updateInsights();updateBadges();updateProfile();}

/* ═══ TUTORIAL ═══ */
function skipTutorial(){document.getElementById('welcomeModal').classList.remove('show');S.tutorialDone=true;saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{tutorialDone:true});}
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
  S.tutorialDone=true;saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{tutorialDone:true});switchView('planning');toast('🎉 Tutoriel terminé !');
}

/* ═══ CHRONOS CHAT ═══ */
function openChronosChat(){document.getElementById('chronosChatModal').classList.add('show');}
function closeChronosChat(){document.getElementById('chronosChatModal').classList.remove('show');}
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
  const inp=document.getElementById('aiInput');const raw=inp.value.trim();if(!raw){toast('⚠️ Écris quelque chose !');return;}
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
    // Sauvegarde chaque événement dans Firestore et récupère son id Firestore
    if(S.user?.uid){
      for(const ev of evs){
        const firestoreId = await window.FB.fbAddEvent(S.user.uid, ev);
        ev.id = firestoreId; // remplace l'id temporaire par l'id Firestore
        S.events.push(ev);
      }
      S.user.totalEvents=(S.user.totalEvents||0)+evs.length;
      await window.FB.fbSaveUser(S.user.uid,{totalEvents:S.user.totalEvents});
    } else {
      evs.forEach(e=>S.events.push(e));
    }
    updateAllViews();
    document.getElementById('aiInput').value='';
    document.querySelectorAll('.tag.active').forEach(t=>t.classList.remove('active'));
    toast('✨ '+evs.length+' événement(s) créé(s) !');
    setTimeout(()=>addXp(XP_GAINS.event_created*evs.length),200);checkBadges();
  }else toast('⚠️ Reformule ta demande');
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
  const dayNames=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const allEvs=getAllEventsForWeek(ws);
  let html='<div class="week-grid">';
  for(let i=0;i<7;i++){
    const day=new Date(ws);day.setDate(ws.getDate()+i);
    const isT=day.toDateString()===today.toDateString();
    const dayEvs=allEvs.filter(e=>new Date(e.date).toDateString()===day.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    html+='<div class="day-col'+(isT?' today':'')+'"><div class="day-col-header"><div class="day-col-name">'+dayNames[i]+'</div><div class="day-col-num">'+day.getDate()+'</div></div><div class="day-col-body">';
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
  document.getElementById('upcomingList').innerHTML=ue.length?ue.map(e=>'<div class="event-item" onclick="showEventDetail(\''+e.id+'\')"><div class="ei-title">'+e.title+'</div><div class="ei-sub">📅 '+new Date(e.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+' · '+e.startTime+'</div></div>').join(''):'<p class="hint-row">'+T('no_events')+'</p>';
}
function updateWeekLabel(){
  const wl=document.getElementById('weekLabel');if(!wl)return;
  wl.textContent=S.weekOffset===0?T('week_this'):S.weekOffset===1?T('week_next'):S.weekOffset===-1?T('week_prev'):'Sem. '+(S.weekOffset>0?'+':'')+S.weekOffset;
}
function changeWeek(d){S.weekOffset+=d;updatePlanning();}

/* ═══ CALENDAR ═══ */
function updateCalendar(){
  const container=document.getElementById('monthCal');if(!container)return;
  const today=new Date();const target=new Date(today.getFullYear(),today.getMonth()+S.monthOffset,1);
  const ml=document.getElementById('monthLabel');if(ml)ml.textContent=target.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const firstDay=new Date(target.getFullYear(),target.getMonth(),1);
  const lastDay=new Date(target.getFullYear(),target.getMonth()+1,0);
  const startOff=firstDay.getDay()===0?6:firstDay.getDay()-1;
  let html='<div class="cal-header">'+['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=>'<div class="cal-wday">'+d+'</div>').join('')+'</div><div class="cal-body">';
  for(let i=0;i<startOff;i++)html+='<div class="cal-cell other"></div>';
  for(let d=1;d<=lastDay.getDate();d++){
    const date=new Date(target.getFullYear(),target.getMonth(),d);
    const isT=date.toDateString()===today.toDateString();
    const evs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).slice(0,3);
    html+='<div class="cal-cell'+(isT?' today':'')+' onclick="showDayDetail(\''+date.toISOString()+'\')">'+'<div class="cal-dn">'+d+'</div>'+(evs.length?'<div>'+evs.map(e=>'<div class="mini-ev '+(e.priority||'')+'">'+e.title+'</div>').join('')+'</div>':'')+'</div>';
  }
  html+='</div>';
  container.innerHTML=html;
  container.classList.remove('slide-right','slide-left');void container.offsetWidth;
  container.classList.add('slide-'+S.monthDir);
  setTimeout(()=>container.classList.remove('slide-right','slide-left'),400);
}
function changeMonth(d){S.monthOffset+=d;S.monthDir=d>0?'right':'left';updateCalendar();}
function showDayDetail(dateStr){
  const date=new Date(dateStr);
  const evs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const pl={critical:'🔴',high:'🟠',medium:'🟡',low:'🟢'};
  document.getElementById('dayDetailContent').innerHTML='<h2 style="margin-bottom:1rem">'+date.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})+'</h2>'+(evs.length?'<div style="display:flex;flex-direction:column;gap:.75rem">'+evs.map(e=>'<div class="event-item" onclick="showEventDetail(\''+e.id+'\')"><div class="ei-title">'+(pl[e.priority]||'')+' '+e.title+'</div><div class="ei-sub">⏰ '+e.startTime+' – '+e.endTime+'</div></div>').join('')+'</div>':'<p class="hint-row">'+T('no_events')+'</p>');
  document.getElementById('dayDetailModal').classList.add('show');
}
function closeDayDetail(){document.getElementById('dayDetailModal').classList.remove('show');}

/* ═══ INSIGHTS ═══ */
function updateInsights(){
  const container=document.getElementById('insightsGrid');if(!container)return;
  const total=S.events.length;const totalH=S.events.reduce((s,e)=>s+(e.duration||60)/60,0);
  const today=new Date();const wks=new Date(today);wks.setDate(today.getDate()-today.getDay()+1);wks.setHours(0,0,0,0);
  const wke=new Date(wks);wke.setDate(wks.getDate()+7);
  const wkEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=wks&&d<wke;});
  const crit=S.events.filter(e=>e.priority==='critical');
  const rank=getRank(S.level);
  container.innerHTML=[
    {title:'📊 Vue d\'ensemble',stat:total,sub:Math.round(totalH)+'h total',bar:Math.min(100,totalH*3),click:'overview'},
    {title:'📅 Cette semaine',stat:wkEvs.length,sub:Math.round(wkEvs.reduce((s,e)=>s+(e.duration||60)/60,0))+'h',bar:Math.min(100,wkEvs.length*10),click:'week'},
    {title:'🚨 Critiques',stat:crit.length,sub:'événements urgents',bar:0,click:'critical'},
    {title:'🔥 Streak',stat:S.streak,sub:'jours consécutifs',bar:Math.min(100,S.streak),click:'streak'},
    {title:'⚡ Mon niveau',stat:S.level,sub:rank.icon+' '+rank.name,bar:Math.min(100,Math.round((curLvXp()/nextLvXp())*100)),click:'xp'},
  ].map(c=>'<div class="insight-card" onclick="showInsightDetail(\''+c.click+'\')"><h3>'+c.title+'</h3><div class="big-stat">'+c.stat+'</div><p class="txt2" style="margin-top:.25rem">'+c.sub+'</p><div class="insight-bar"><div class="insight-bar-fill" style="width:'+c.bar+'%"></div></div></div>').join('');
}
function showInsightDetail(type){
  const el=document.getElementById('insightDetailContent');
  const total=S.events.length;const totalH=S.events.reduce((s,e)=>s+(e.duration||60)/60,0);
  let html='';
  if(type==='overview'){html='<h2>📊 Vue d\'ensemble</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin:1.25rem 0">'+[['Événements',total,''],['Heures',Math.round(totalH),'h'],['Niveau',S.level,'']].map(([l,v,u])=>'<div style="text-align:center;padding:1.25rem;background:var(--bg);border-radius:12px"><div style="font-size:2.5rem;font-weight:700;color:var(--primary)">'+v+u+'</div><div class="txt2">'+l+'</div></div>').join('')+'</div>';}
  else if(type==='week'){const wks=new Date();wks.setDate(wks.getDate()-wks.getDay()+1);wks.setHours(0,0,0,0);const wke=new Date(wks);wke.setDate(wks.getDate()+7);const wkE=S.events.filter(e=>{const d=new Date(e.date);return d>=wks&&d<wke;});html='<h2>📅 Cette semaine</h2><div style="text-align:center;padding:2rem;background:var(--bg);border-radius:12px;margin:1rem 0"><div style="font-size:3rem;font-weight:700;color:var(--primary)">'+wkE.length+'</div><div class="txt2">événements · '+Math.round(wkE.reduce((s,e)=>s+(e.duration||60)/60,0))+'h</div></div><p style="color:var(--primary);font-weight:600">🎯 Planifie une semaine → +'+XP_GAINS.week_planned+' XP</p>';}
  else if(type==='critical'){const crit=S.events.filter(e=>e.priority==='critical');html='<h2>🚨 Événements critiques</h2>'+(crit.length?'<div style="display:flex;flex-direction:column;gap:.6rem;margin-top:1rem">'+crit.map(e=>'<div class="event-item"><div class="ei-title">'+e.title+'</div><div class="ei-sub">'+new Date(e.date).toLocaleDateString('fr-FR')+' · '+e.startTime+'</div></div>').join('')+'</div>':'<p class="hint-row" style="padding:2rem">Aucun critique. Bravo ! 🎉</p>');}
  else if(type==='streak'){html='<h2>🔥 Streak</h2><div style="text-align:center;padding:2rem;background:var(--bg);border-radius:16px;margin:1rem 0"><div style="font-size:5rem;font-weight:700;color:var(--primary)">'+S.streak+'</div><div class="txt2">jours consécutifs</div></div>'+[[3,'🔥',XP_GAINS.badge_3day],[7,'✨',XP_GAINS.badge_7day],[14,'💪',XP_GAINS.badge_14day],[30,'🌟',XP_GAINS.badge_30day],[90,'👑',XP_GAINS.badge_90day]].map(([d,em,xp])=>'<div style="display:flex;justify-content:space-between;padding:.5rem;border-radius:8px;background:'+(S.streak>=d?'rgba(255,107,53,.08)':'var(--bg)')+';border:1px solid '+(S.streak>=d?'var(--primary)':'var(--border)')+';margin-bottom:.4rem"><span>'+em+' '+d+' jours</span><span style="color:var(--primary);font-weight:700">'+(S.streak>=d?'✅ ':'')+'+'+xp+' XP</span></div>').join('');}
  else if(type==='xp'){const rank=getRank(S.level);html='<h2>⚡ Progression</h2><div style="text-align:center;padding:1.5rem;background:var(--bg);border-radius:12px;margin:1rem 0"><div style="font-size:2.5rem;font-weight:700;color:var(--primary)">Niveau '+S.level+'</div><div>'+rank.icon+' '+rank.name+'</div><div class="txt2">'+curLvXp()+' / '+nextLvXp()+' XP</div></div>'+'<div style="display:grid;gap:.5rem">'+Object.entries(XP_GAINS).map(([k,v])=>'<div style="display:flex;justify-content:space-between;padding:.5rem;border-bottom:1px solid var(--border)"><span>'+k.replace(/_/g,' ')+'</span><span style="color:var(--primary);font-weight:700">+'+v+' XP</span></div>').join('')+'</div>';}
  el.innerHTML=html;document.getElementById('insightDetailModal').classList.add('show');
}
function closeInsightDetail(){document.getElementById('insightDetailModal').classList.remove('show');}

/* ═══ EVENT DETAIL ═══ */
function showEventDetail(id){
  const ev=S.events.find(e=>String(e.id)===String(id));if(!ev)return;
  S.currentEventId=id;
  document.getElementById('eventDetailTitle').textContent=ev.title;
  const pl={critical:'🔴 Critique',high:'🟠 Haute',medium:'🟡 Moyenne',low:'🟢 Basse'};
  document.getElementById('eventDetailBody').innerHTML='<p><strong>Date :</strong> '+new Date(ev.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+'</p><p><strong>Horaire :</strong> '+ev.startTime+' – '+ev.endTime+'</p><p><strong>Priorité :</strong> '+pl[ev.priority]+'</p>';
  document.getElementById('eventDetailModal').classList.add('show');
}
function closeEventDetail(){document.getElementById('eventDetailModal').classList.remove('show');S.currentEventId=null;}
async function changePriority(p){
  const ev=S.events.find(e=>String(e.id)===String(S.currentEventId));
  if(ev){
    ev.priority=p;
    updateAllViews();toast('✅ Priorité changée');closeEventDetail();
    if(S.user?.uid && ev.id && !String(ev.id).startsWith('tpl_')){
      await window.FB.fbUpdateEvent(S.user.uid, ev.id, {priority:p});
    }
  }
}

/* ═══ TEMPLATES ═══ */
function updateTemplates(){
  const c=document.getElementById('templatesContent');if(!c)return;
  const tabs=['student','worker','custom'];const labels=['🎓 Étudiant','💼 Travailleur','✨ Personnalisé'];const idx=tabs.indexOf(S.template);
  let html='<div style="display:flex;position:relative;background:var(--bg);padding:4px;border-radius:12px;border:1px solid var(--border);margin:0 auto 1.5rem;max-width:500px"><div id="tplSlider" style="position:absolute;top:4px;left:4px;width:calc(33.33% - 2.67px);height:calc(100% - 8px);background:var(--primary);border-radius:8px;transition:transform .35s cubic-bezier(.16,1,.3,1);z-index:0;transform:translateX('+idx*100+'%)"></div>'+tabs.map((t,i)=>'<button style="flex:1;padding:.6rem 1rem;border:none;background:transparent;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;color:'+(S.template===t?'white':'var(--text2)')+';font-family:inherit;position:relative;z-index:1;transition:color .25s" onclick="switchTemplate(\''+t+'\')">'+labels[i]+'</button>').join('')+'</div>';
  if(S.template==='student'){
    html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">🎓 Configuration Étudiant</h3><div class="tpl-limits"><div class="form-group"><label>Max révision/jour (h)</label><input type="number" id="tplMaxStudy" value="'+(S.templateData.maxStudy||4)+'" min="1" max="16"></div><div class="form-group"><label>Max loisirs/jour (h)</label><input type="number" id="tplMaxLeisure" value="'+(S.templateData.maxLeisure||3)+'" min="0" max="16"></div><div class="form-group"><label>Pause entre événements (min)</label><input type="number" id="tplBreak" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><div id="tplCC" style="margin-bottom:.75rem">'+((S.templateData.courses||[]).length===0?'<div class="course-row"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>':(S.templateData.courses||[]).map(course=>'<div class="course-row"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'" '+(course.day===i+1?'selected':'')+'>'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="'+(course.start||'08:00')+'" step="300"><input type="time" class="tinp" value="'+(course.end||'10:00')+'" step="300"><input type="text" class="sinp" value="'+(course.subject||'')+'" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>').join(''))+'</div><button class="btn-secondary" onclick="addTplCourse()" style="margin-bottom:.75rem">+ Ajouter un cours</button><button class="btn-primary" onclick="saveTplStudent()">Enregistrer</button></div>';
  }else if(S.template==='worker'){
    html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">💼 Configuration Travailleur</h3><div class="tpl-limits"><div class="form-group"><label>Début</label><input type="time" id="tplWS" value="'+(S.templateData.workStart||'09:00')+'" step="300"></div><div class="form-group"><label>Fin</label><input type="time" id="tplWE" value="'+(S.templateData.workEnd||'18:00')+'" step="300"></div><div class="form-group"><label>Max travail/j (h)</label><input type="number" id="tplMaxWork" value="'+(S.templateData.maxWork||8)+'" min="1" max="16"></div><div class="form-group"><label>Pause (min)</label><input type="number" id="tplBreakW" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><button class="btn-primary" onclick="saveTplWorker()">Enregistrer</button></div>';
  }else{
    html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">✨ Mode Personnalisé</h3><div class="tpl-limits"><div class="form-group"><label>Max révision/j (h)</label><input type="number" id="tplMaxStudyC" value="'+(S.templateData.maxStudy||4)+'" min="0" max="16"></div><div class="form-group"><label>Max loisirs/j (h)</label><input type="number" id="tplMaxLeisureC" value="'+(S.templateData.maxLeisure||3)+'" min="0" max="16"></div><div class="form-group"><label>Pause (min)</label><input type="number" id="tplBreakC" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><p class="txt2" style="margin-top:.5rem">Utilise l\'IA pour planifier librement.</p><button class="btn-primary" onclick="saveTplCustom()" style="margin-top:.75rem">Enregistrer</button></div>';
  }
  c.innerHTML=html;
}
function switchTemplate(id){S.template=id;saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{template:id});updateTemplates();updatePlanning();toast('✅ Template changé');}
function addTplCourse(){const c=document.getElementById('tplCC');if(!c)return;const row=document.createElement('div');row.className='course-row';row.innerHTML='<div class="cf-select-wrap"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select></div><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';c.appendChild(row);}
function saveTplStudent(){const rows=document.querySelectorAll('#tplCC .course-row');S.templateData.courses=Array.from(rows).map(r=>({day:+r.querySelector('.sel').value,start:r.querySelectorAll('.tinp')[0].value,end:r.querySelectorAll('.tinp')[1].value,subject:r.querySelector('.sinp').value})).filter(c=>c.subject);S.templateData.maxStudy=+(document.getElementById('tplMaxStudy')?.value)||4;S.templateData.maxLeisure=+(document.getElementById('tplMaxLeisure')?.value)||3;S.templateData.breakMin=+(document.getElementById('tplBreak')?.value)||10;saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{templateData:S.templateData});updatePlanning();toast('✅ Template sauvegardé !');}
function saveTplWorker(){S.templateData.workStart=document.getElementById('tplWS')?.value||'09:00';S.templateData.workEnd=document.getElementById('tplWE')?.value||'18:00';S.templateData.maxWork=+(document.getElementById('tplMaxWork')?.value)||8;S.templateData.breakMin=+(document.getElementById('tplBreakW')?.value)||10;saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{templateData:S.templateData});toast('✅ Template sauvegardé !');}
function saveTplCustom(){S.templateData.maxStudy=+(document.getElementById('tplMaxStudyC')?.value)||4;S.templateData.maxLeisure=+(document.getElementById('tplMaxLeisureC')?.value)||3;S.templateData.breakMin=+(document.getElementById('tplBreakC')?.value)||10;saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{templateData:S.templateData});toast('✅ Sauvegardé !');}

/* ═══ BADGES VIEW ═══ */
function updateBadges(){
  checkBadges();updateXpBar();
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
  updateHeader();updateProfile();toast('✅ Profil sauvegardé');
  if(S.user?.uid) await window.FB.fbSaveUser(S.user.uid,{name:S.user.name});
}
function handleAvatarChange(inp){
  const f=inp.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=async e=>{
    S.user.avatar=e.target.result;
    updateHeader();updateProfile();toast('✅ Photo mise à jour');
    if(S.user?.uid) await window.FB.fbSaveUser(S.user.uid,{avatar:S.user.avatar});
  };
  rd.readAsDataURL(f);
}

/* ═══ SETTINGS ═══ */
function saveApiKey(){const k=document.getElementById('apiKeyInput')?.value?.trim();if(!k||k.startsWith('••••'))return;localStorage.setItem('cf_apikey',k);document.getElementById('apiKeyInput').value='••••'+k.slice(-4);toast('✅ Clé API enregistrée');}
function requestPasswordChange(){
  document.getElementById('pwdEmail').textContent=S.user.email;
  document.getElementById('passwordModal').classList.add('show');
}
async function confirmPasswordChange(){
  const currentPwd=document.getElementById('pwdCode').value; // champ "Code" réutilisé pour mot de passe actuel
  const np=document.getElementById('pwdNew').value;
  if(!currentPwd||!np){toast('⚠️ '+T('error_field'));return;}
  if(np.length<6){toast('⚠️ '+T('error_pwd'));return;}
  try{
    await window.FB.fbChangePassword(currentPwd,np);
    toast('✅ Mot de passe changé');closeModal('passwordModal');
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
  a.click();toast('✅ Exporté');
}
async function deleteAccount(){
  if(!confirm('Supprimer définitivement ton compte et toutes tes données ?'))return;
  try{
    if(S.user?.uid) await window.FB.fbDeleteAccount(S.user.uid);
    localStorage.clear();location.reload();
  }catch(e){
    toast('❌ '+e.message+' — Reconnecte-toi et réessaie.');
  }
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
  document.getElementById('arcFill').style.strokeDashoffset='440';
  document.getElementById('sessPlayPause').textContent='⏸ Pause';
  updateSessionDisplay(); startSessionTick(); addXp(5);
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
      if(S.notifications)sendNotif('Chronos ⚡','Reprends dans 10 secondes !');
    }
    updateSessionDisplay();
  },1000);
}
function switchPhase(){
  if(S.sessionPhase==='work'){
    S.sessionPhase='break'; S.sessionCurrentPhaseSec=S.sessionBreakSec; S.sessionPhaseElapsed=0;
    document.getElementById('arcFill').classList.add('pause-mode');
    if(S.notifications)sendNotif('Chronos ⚡','Pause ! Repose-toi '+Math.round(S.sessionBreakSec/60)+' minutes. 😊');
    toast('☕ Pause ! Repose-toi bien.');
  }else{
    S.sessionPhase='work'; S.sessionPhaseIdx++; S.sessionCurrentPhaseSec=S.sessionWorkSec; S.sessionPhaseElapsed=0;
    document.getElementById('arcFill').classList.remove('pause-mode');
    if(S.notifications)sendNotif('Chronos ⚡','Reprends le travail ! 💪');
    toast('💪 C\'est reparti !');
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
  arc.style.strokeDashoffset=440*(1-pct);
  const st=document.getElementById('sessionStatusTxt');if(st)st.textContent=S.sessionPhase==='work'?T('work_phase'):T('break_phase');
  const totalPhases=Math.max(1,Math.ceil(S.sessionTotalSec/S.sessionWorkSec));
  document.getElementById('sessionPhaseLabel').textContent=T('session_phase')+' '+(S.sessionPhaseIdx+1)+'/'+totalPhases;
  document.getElementById('sessionBreakLabel').textContent=T('break_label')+' : '+Math.round(S.sessionBreakSec/60)+' min';
}
function toggleSession(){
  if(S.sessionTimer){clearInterval(S.sessionTimer);S.sessionTimer=null;document.getElementById('sessPlayPause').textContent='▶ Reprendre';}
  else{startSessionTick();document.getElementById('sessPlayPause').textContent='⏸ Pause';}
}
function skipPhase(){
  S.sessionSkipCount=(S.sessionSkipCount||0);
  const maxSkips=Math.ceil(S.sessionTotalSec/S.sessionWorkSec);
  if(S.sessionSkipCount>=maxSkips){toast('⚠️ Limite de skips atteinte !');return;}
  S.sessionSkipCount++;switchPhase();updateSessionDisplay();
}
function tryExitSession(){
  const m=document.getElementById('exitSessionModal');
  if(m)m.classList.add('show');
}
function confirmExitSession(){closeModal('exitSessionModal');endSession();}
function endSession(){
  S.sessionActive=false;
  if(S.sessionTimer){clearInterval(S.sessionTimer);S.sessionTimer=null;}
  if(sessionBeepInterval){clearInterval(sessionBeepInterval);sessionBeepInterval=null;}
  document.getElementById('sessionScreen').style.display='none';
  document.getElementById('appScreen').style.display='flex';
  toast('✅ Session terminée ! Bien joué !');
  addXp(20);checkBadges();
  if(window.FB) window.FB.fbLog('session_completed',{duration:S.sessionTotalSec,phases:S.sessionPhaseIdx});
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

/* ═══ UTILS ═══ */
function toast(msg){const el=document.getElementById('toast');const me=document.getElementById('toastMsg');if(!el||!me)return;me.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500);}
function closeModal(id){document.getElementById(id)?.classList.remove('show');}

/* ═══ STORAGE ═══ */
// saveState : sauvegarde les données de l'utilisateur dans Firestore (si connecté)
// Les données non-sensibles de l'UI (lang, theme) restent aussi dans localStorage
function saveState(){
  // Sauvegarde UI locale
  localStorage.setItem('cf_lang', S.lang);
  localStorage.setItem('cf_theme', S.theme);
  localStorage.setItem('cf_equipped', S.equippedItem);
  // Sauvegarde Firestore (asynchrone, non-bloquant)
  if(S.user?.uid && window.FB){
    window.FB.fbSaveUser(S.user.uid, {
      xp:           S.xp,
      level:        S.level,
      totalXpEarned:S.totalXpEarned,
      streak:       S.streak,
      lastUsedDate: S.lastUsedDate,
      tutorialDone: S.tutorialDone,
      template:     S.template,
      templateData: S.templateData,
      theme:        S.theme,
      lang:         S.lang,
      notifications:S.notifications,
      equippedItem: S.equippedItem,
      totalEvents:  S.user.totalEvents || 0,
      name:         S.user.name || '',
      email:        S.user.email || '',
      avatar:       S.user.avatar || ''
    }).catch(e=>console.error('saveState Firestore error:',e));
  }
}
// loadState n'est plus utilisé — le chargement se fait via fbOnAuthChange dans DOMContentLoaded
function loadState(){ /* remplacé par fbOnAuthChange */ }

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
  if(t)t.textContent='⬆️ Niveau '+level+' !';
  if(s)s.textContent=reward?'Tu débloque '+reward+' pour Chronos !':'Continue comme ça ! 💪';
  // Sync koro inside notif
  const k=document.getElementById('lvlupKoro');
  if(k){const rank=getRank(level);k.style.background=rank.cls.includes('gold')?'radial-gradient(circle at 35% 35%,#ffe680,#FFD700)':rank.cls.includes('diamond')?'radial-gradient(circle at 35% 35%,#d4faff,#B9F2FF)':rank.cls.includes('master')?'radial-gradient(circle at 35% 35%,#c17ee8,#9B59B6)':rank.cls.includes('legend')?'radial-gradient(circle at 35% 35%,#ff8c55,#FF4500)':'radial-gradient(circle at 35% 35%,#ffe680,#ffd000)';}
  n.style.display='flex';void n.offsetWidth;n.classList.add('show');
  setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.style.display='none',400);},4000);
}

/* ═══ SYNC SESSION & WC KORO WITH MAIN MASCOT ═══ */
function syncAllKoros(){
  const rank=getRank(S.level);
  const item=CHRONOS_ITEMS.find(i=>i.id===S.equippedItem)||CHRONOS_ITEMS[0];
  // Update all koro heads and suits
  ['wcKoroHead','sessionKoroHead'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    const wrap=el.closest('.koro-wrap');if(wrap){wrap.className='koro-wrap koro-rank-'+rank.cls.replace('rank-','');}
  });
  ['wcKoroSuit','sessionKoroSuit'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    if(item.type==='suit'&&item.bg)el.style.background=item.bg;
  });
  ['wcKoroTie','sessionKoroTie'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    el.style.background=S.equippedItem==='gold_tie'?'linear-gradient(180deg,#FFD700,#c4a800)':rank.color;
  });
  ['wcKoroAcc','sessionKoroAcc'].forEach(id=>{
    const el=document.getElementById(id);if(!el)return;
    if(item.type==='acc'){el.textContent=item.icon;el.style.opacity='1';}else el.style.opacity='0';
  });
}
