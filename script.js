// ChronoFlow V6 — Premium Rewrite
// Chronos vivant · Dashboard · Sons · Mouse tracking · Onboarding enrichi

/* ═══ STATE ═══ */
const S = {
  user:null, events:[], weekOffset:0, monthOffset:0, monthDir:'right',
  activeView:'dashboard', theme:'dark', streak:0, lastUsedDate:null,
  template:'custom', templateData:{maxStudy:4,maxLeisure:3,breakMin:10,courses:[],workStart:'09:00',workEnd:'18:00',maxWork:8},
  lang:'fr', notifications:true,
  currentEventId:null,
  xp:0, level:1, totalXpEarned:0, tutorialDone:false, tutStep:0,
  voiceText:'', recognition:null,
  sessionActive:false, sessionTimer:null, sessionPhase:'work', sessionPhaseIdx:0,
  sessionCurrentPhaseSec:0, sessionPhaseElapsed:0,
  sessionWorkSec:0, sessionBreakSec:0, sessionTotalSec:0, sessionElapsed:0,
  equippedItem:'default',
  todos:[], soundEnabled:true,
  obStep:1, obProfile:null
};
let pendingReviseText='', sessionBeepInterval=null, curAuthTab='login', chatMode='talk';

/* ═══ I18N ═══ */
const LANGS={fr:{nav_dashboard:'Tableau de bord',nav_planning:'Planning',nav_calendar:'Calendrier',nav_insights:'Insights',nav_templates:'Templates',nav_badges:'Badges',nav_settings:'Paramètres',btn_generate:'Générer',start_session:'Lancer une session',today:"📍 Aujourd'hui",upcoming:'📅 À venir',profile:'Profil',events:'Événements',streak:'Streak',hours:'Heures',badges:'Badges',info:'Informations',firstname:'Prénom',save:'Sauvegarder',language:'Langue',notifications:'Notifications',theme:'Thème',api_key:'Clé API Anthropic',api_hint:'Clé stockée localement.',privacy:'Confidentialité',change_pwd:'Changer le mot de passe',data:'Données',export:'Exporter mes données',delete_account:'Supprimer mon compte',talk:'💬 Parler',locker:'🎒 Casier',ai_assistant:'Assistant IA',yes:'Oui',no:'Non',close:'Fermer',cancel:'Annuler',start:'Démarrer',all_ranks:'🏆 Tous les Rangs',change_priority:'Priorité :',session_duration:'Durée totale (h)',work_block:'Bloc travail (min)',break_block:'Pause (min)',exit_session_title:'Quitter la session ?',exit_session_desc:'Ta progression sera perdue.',no_stay:'Rester',yes_quit:'Quitter',login_tab:'Se connecter',register_tab:"S'inscrire",wcTitle:'Bonjour ! Je suis Chronos !',wcDesc:'Ton assistant IA. Veux-tu un tutoriel ?',wcSkip:'Non merci',wcStart:'Oui ✨',week_this:'Cette semaine',week_next:'Semaine prochaine',week_prev:'Semaine dernière',free:'Libre',no_events:'Aucun événement',loading:'Chronos analyse ta demande...',work_phase:'Travail 💪',break_phase:'Pause ☕',session_phase:'Session',break_label:'Pause',revise_title:'📚 Que veux-tu réviser ?',revise_subject:'Matière',revise_date:'Pour quand ?',revise_gen:'Générer 🚀',error_field:'Remplis tous les champs',error_email:'Email invalide',error_pwd:'Mot de passe : 6 caractères minimum',error_email_used:'Email déjà utilisé',error_account:'Compte introuvable',error_pwd_wrong:'Mot de passe incorrect',lang_changed:'✅ Langue changée',tut1:"Bienvenue ! 👋 Voici la zone IA. Décris ton planning et je génère tout automatiquement !",tut2:"Ton planning hebdomadaire s'affiche ici. Les cours de ton template y apparaissent aussi !",tut3:"Le calendrier mensuel. Clique sur une date pour voir tous les événements 📅",tut4:"Les Insights te montrent tes stats et ta progression 📊",tut5:"Ici tu gagnes des XP et tu montes de niveau ! 🎖️",tut6:"Je suis Chronos ! Clique sur moi pour me parler ou changer mon costume dans le Casier 🌟",tut7:"Chaque semaine, je t'afficherai un bilan complet de ce que tu as accompli 📊",obChooseProfile:'Choisis ton profil',obStudentTitle:'🎓 Configuration Étudiant',obWorkerTitle:'💼 Configuration Travailleur',obCustomTitle:'✨ Configuration Personnalisée',pcStudent:'Étudiant',pcWorker:'Travailleur',pcCustom:'Personnalisé',pcStudentDesc:'Cours, révisions, examens',pcWorkerDesc:'Projets, réunions, deadlines',pcCustomDesc:'Je configure moi-même',btnAddCourse:'Ajouter un cours',btnBack:'Retour',btnFinish:'Terminer',lblMaxStudy:'Max révision/jour (h)',lblMaxLeisure:'Max loisirs/jour (h)',lblBreakBetween:'Pause entre événements (min)',lblWorkStart:'Début journée',lblWorkEnd:'Fin journée',lblMaxWork:'Max travail/jour (h)',lblBreakW:'Pause entre tâches (min)',lblMaxStudyC:'Max révision/jour (h)',lblMaxLeisureC:'Max loisirs/jour (h)',lblBreakC:'Pause (min)',lblEmail:'Email',lblPassword:'Mot de passe',lblName:'Prénom',lblEmailR:'Email',lblPasswordR:'Mot de passe',btnLogin:'Se connecter →',btnRegister:'Créer mon compte →',dash_hello:'Bonjour',dash_subtitle:"Voici ton résumé d'aujourd'hui",dash_generate_cta:'✨ Générer mon planning maintenant'},en:{nav_dashboard:'Dashboard',nav_planning:'Planning',nav_calendar:'Calendar',nav_insights:'Insights',nav_templates:'Templates',nav_badges:'Badges',nav_settings:'Settings',btn_generate:'Generate',start_session:'Start a study session',today:'📍 Today',upcoming:'📅 Upcoming',profile:'Profile',events:'Events',streak:'Streak',hours:'Hours',badges:'Badges',info:'Information',firstname:'First name',save:'Save',language:'Language',notifications:'Notifications',theme:'Theme',api_key:'Anthropic API Key',api_hint:'Key stored locally.',privacy:'Privacy',change_pwd:'Change password',data:'Data',export:'Export my data',delete_account:'Delete account',talk:'💬 Chat',locker:'🎒 Locker',ai_assistant:'AI Assistant',yes:'Yes',no:'No',close:'Close',cancel:'Cancel',start:'Start',all_ranks:'🏆 All Ranks',change_priority:'Priority:',session_duration:'Total duration (h)',work_block:'Work block (min)',break_block:'Break (min)',exit_session_title:'Exit session?',exit_session_desc:'Your progress will be lost.',no_stay:'Stay',yes_quit:'Exit',login_tab:'Log in',register_tab:'Sign up',wcTitle:'Hello! I am Chronos!',wcDesc:'Your AI assistant. Want a tutorial?',wcSkip:'No thanks',wcStart:'Yes ✨',week_this:'This week',week_next:'Next week',week_prev:'Last week',free:'Free',no_events:'No events',loading:'Chronos is analyzing...',work_phase:'Work 💪',break_phase:'Break ☕',session_phase:'Session',break_label:'Break',revise_title:'📚 What to study?',revise_subject:'Subject',revise_date:'By when?',revise_gen:'Generate 🚀',error_field:'Fill in all fields',error_email:'Invalid email',error_pwd:'Password: at least 6 characters',error_email_used:'Email already used',error_account:'Account not found',error_pwd_wrong:'Incorrect password',lang_changed:'✅ Language changed',tut1:"Welcome! 👋 Describe your schedule and I'll generate it automatically!",tut2:'Your weekly schedule appears here.',tut3:'Monthly calendar. Click a date to see events 📅',tut4:'Insights show your stats and progress 📊',tut5:'Here you earn XP and level up! 🎖️',tut6:"I'm Chronos! Click me to chat or change my costume 🌟",tut7:"Every week I'll show you a full review 📊",obChooseProfile:'Choose your profile',obStudentTitle:'🎓 Student Setup',obWorkerTitle:'💼 Worker Setup',obCustomTitle:'✨ Custom Setup',pcStudent:'Student',pcWorker:'Worker',pcCustom:'Custom',pcStudentDesc:'Classes, studying, exams',pcWorkerDesc:'Projects, meetings, deadlines',pcCustomDesc:'I set it up myself',btnAddCourse:'Add a class',btnBack:'Back',btnFinish:'Finish',lblMaxStudy:'Max study/day (h)',lblMaxLeisure:'Max leisure/day (h)',lblBreakBetween:'Break between events (min)',lblWorkStart:'Day start',lblWorkEnd:'Day end',lblMaxWork:'Max work/day (h)',lblBreakW:'Break between tasks (min)',lblMaxStudyC:'Max study/day (h)',lblMaxLeisureC:'Max leisure/day (h)',lblBreakC:'Break (min)',lblEmail:'Email',lblPassword:'Password',lblName:'First name',lblEmailR:'Email',lblPasswordR:'Password',btnLogin:'Log in →',btnRegister:'Create account →',dash_hello:'Hello',dash_subtitle:"Here's your day overview",dash_generate_cta:'✨ Generate my schedule now'},de:{nav_dashboard:'Dashboard',nav_planning:'Planung',nav_calendar:'Kalender',nav_insights:'Einblicke',nav_templates:'Vorlagen',nav_badges:'Abzeichen',nav_settings:'Einstellungen',btn_generate:'Generieren',start_session:'Lernsitzung starten',today:'📍 Heute',upcoming:'📅 Bevorstehend',profile:'Profil',events:'Ereignisse',streak:'Serie',hours:'Stunden',badges:'Abzeichen',info:'Informationen',firstname:'Vorname',save:'Speichern',language:'Sprache',notifications:'Benachrichtigungen',theme:'Thema',api_key:'Anthropic API-Schlüssel',api_hint:'Schlüssel lokal gespeichert.',privacy:'Datenschutz',change_pwd:'Passwort ändern',data:'Daten',export:'Daten exportieren',delete_account:'Konto löschen',talk:'💬 Sprechen',locker:'🎒 Spind',ai_assistant:'KI-Assistent',yes:'Ja',no:'Nein',close:'Schließen',cancel:'Abbrechen',start:'Starten',all_ranks:'🏆 Alle Ränge',change_priority:'Priorität:',session_duration:'Gesamtdauer (h)',work_block:'Arbeitsblock (Min)',break_block:'Pause (Min)',exit_session_title:'Sitzung beenden?',exit_session_desc:'Dein Fortschritt geht verloren.',no_stay:'Bleiben',yes_quit:'Verlassen',login_tab:'Anmelden',register_tab:'Registrieren',wcTitle:'Hallo! Ich bin Chronos!',wcDesc:'Dein KI-Assistent. Tutorial?',wcSkip:'Nein danke',wcStart:'Ja ✨',week_this:'Diese Woche',week_next:'Nächste Woche',week_prev:'Letzte Woche',free:'Frei',no_events:'Keine Ereignisse',loading:'Chronos analysiert...',work_phase:'Arbeit 💪',break_phase:'Pause ☕',session_phase:'Sitzung',break_label:'Pause',revise_title:'📚 Was möchtest du lernen?',revise_subject:'Fach',revise_date:'Bis wann?',revise_gen:'Generieren 🚀',error_field:'Alle Felder ausfüllen',error_email:'Ungültige E-Mail',error_pwd:'Passwort: mind. 6 Zeichen',error_email_used:'E-Mail bereits verwendet',error_account:'Konto nicht gefunden',error_pwd_wrong:'Falsches Passwort',lang_changed:'✅ Sprache geändert',tut1:"Willkommen! Beschreibe deinen Zeitplan!",tut2:'Dein Wochenplan.',tut3:'Monatskalender 📅',tut4:'Statistiken 📊',tut5:'XP und Level 🎖️',tut6:"Ich bin Chronos! 🌟",tut7:"Wöchentlicher Rückblick 📊",obChooseProfile:'Profil wählen',obStudentTitle:'🎓 Schüler',obWorkerTitle:'💼 Arbeiter',obCustomTitle:'✨ Benutzerdefiniert',pcStudent:'Schüler',pcWorker:'Arbeiter',pcCustom:'Benutzerdefiniert',pcStudentDesc:'Kurse, Lernen, Prüfungen',pcWorkerDesc:'Projekte, Meetings, Deadlines',pcCustomDesc:'Selbst konfigurieren',btnAddCourse:'Kurs hinzufügen',btnBack:'Zurück',btnFinish:'Fertig',lblMaxStudy:'Max Lernen/Tag (h)',lblMaxLeisure:'Max Freizeit/Tag (h)',lblBreakBetween:'Pause (Min)',lblWorkStart:'Arbeitsbeginn',lblWorkEnd:'Arbeitsende',lblMaxWork:'Max Arbeit/Tag (h)',lblBreakW:'Pause (Min)',lblMaxStudyC:'Max Lernen/Tag (h)',lblMaxLeisureC:'Max Freizeit/Tag (h)',lblBreakC:'Pause (Min)',lblEmail:'E-Mail',lblPassword:'Passwort',lblName:'Vorname',lblEmailR:'E-Mail',lblPasswordR:'Passwort',btnLogin:'Anmelden →',btnRegister:'Konto erstellen →',dash_hello:'Hallo',dash_subtitle:'Dein Tagesüberblick',dash_generate_cta:'✨ Meinen Plan generieren'},es:{nav_dashboard:'Panel',nav_planning:'Planificación',nav_calendar:'Calendario',nav_insights:'Estadísticas',nav_templates:'Plantillas',nav_badges:'Logros',nav_settings:'Ajustes',btn_generate:'Generar',start_session:'Iniciar sesión de estudio',today:'📍 Hoy',upcoming:'📅 Próximos',profile:'Perfil',events:'Eventos',streak:'Racha',hours:'Horas',badges:'Logros',info:'Información',firstname:'Nombre',save:'Guardar',language:'Idioma',notifications:'Notificaciones',theme:'Tema',api_key:'Clave API',api_hint:'Clave almacenada localmente.',privacy:'Privacidad',change_pwd:'Cambiar contraseña',data:'Datos',export:'Exportar',delete_account:'Eliminar cuenta',talk:'💬 Hablar',locker:'🎒 Casillero',ai_assistant:'Asistente IA',yes:'Sí',no:'No',close:'Cerrar',cancel:'Cancelar',start:'Iniciar',all_ranks:'🏆 Todos los Rangos',change_priority:'Prioridad:',session_duration:'Duración (h)',work_block:'Bloque trabajo (min)',break_block:'Descanso (min)',exit_session_title:'¿Salir?',exit_session_desc:'Tu progreso se perderá.',no_stay:'Quedarme',yes_quit:'Salir',login_tab:'Iniciar sesión',register_tab:'Registrarse',wcTitle:'¡Hola! Soy Chronos!',wcDesc:'Tu asistente IA. ¿Tutorial?',wcSkip:'No gracias',wcStart:'¡Sí ✨',week_this:'Esta semana',week_next:'Próxima semana',week_prev:'Semana pasada',free:'Libre',no_events:'Sin eventos',loading:'Chronos está analizando...',work_phase:'Trabajo 💪',break_phase:'Descanso ☕',session_phase:'Sesión',break_label:'Descanso',revise_title:'📚 ¿Qué estudiar?',revise_subject:'Materia',revise_date:'¿Para cuándo?',revise_gen:'Generar 🚀',error_field:'Completa todos los campos',error_email:'Email inválido',error_pwd:'Contraseña: mín. 6 caracteres',error_email_used:'Email ya usado',error_account:'Cuenta no encontrada',error_pwd_wrong:'Contraseña incorrecta',lang_changed:'✅ Idioma cambiado',tut1:"¡Bienvenido! Zona IA.",tut2:'Horario semanal.',tut3:'Calendario mensual 📅',tut4:'Estadísticas 📊',tut5:'XP y niveles 🎖️',tut6:"¡Soy Chronos! 🌟",tut7:"Revisión semanal 📊",obChooseProfile:'Elige tu perfil',obStudentTitle:'🎓 Estudiante',obWorkerTitle:'💼 Trabajador',obCustomTitle:'✨ Personalizado',pcStudent:'Estudiante',pcWorker:'Trabajador',pcCustom:'Personalizado',pcStudentDesc:'Clases, estudio, exámenes',pcWorkerDesc:'Proyectos, reuniones, plazos',pcCustomDesc:'Lo configuro yo',btnAddCourse:'Añadir clase',btnBack:'Volver',btnFinish:'Terminar',lblMaxStudy:'Máx. estudio/día (h)',lblMaxLeisure:'Máx. ocio/día (h)',lblBreakBetween:'Pausa (min)',lblWorkStart:'Inicio jornada',lblWorkEnd:'Fin jornada',lblMaxWork:'Máx. trabajo/día (h)',lblBreakW:'Pausa (min)',lblMaxStudyC:'Máx. estudio/día (h)',lblMaxLeisureC:'Máx. ocio/día (h)',lblBreakC:'Pausa (min)',lblEmail:'Email',lblPassword:'Contraseña',lblName:'Nombre',lblEmailR:'Email',lblPasswordR:'Contraseña',btnLogin:'Iniciar sesión →',btnRegister:'Crear cuenta →',dash_hello:'Hola',dash_subtitle:'Tu resumen del día',dash_generate_cta:'✨ Generar mi horario'},it:{nav_dashboard:'Dashboard',nav_planning:'Pianificazione',nav_calendar:'Calendario',nav_insights:'Statistiche',nav_templates:'Modelli',nav_badges:'Badge',nav_settings:'Impostazioni',btn_generate:'Genera',start_session:'Inizia sessione',today:'📍 Oggi',upcoming:'📅 In arrivo',profile:'Profilo',events:'Eventi',streak:'Serie',hours:'Ore',badges:'Badge',info:'Informazioni',firstname:'Nome',save:'Salva',language:'Lingua',notifications:'Notifiche',theme:'Tema',api_key:'Chiave API',api_hint:'Chiave salvata localmente.',privacy:'Privacy',change_pwd:'Cambia password',data:'Dati',export:'Esporta dati',delete_account:'Elimina account',talk:'💬 Parla',locker:'🎒 Armadietto',ai_assistant:'Assistente IA',yes:'Sì',no:'No',close:'Chiudi',cancel:'Annulla',start:'Avvia',all_ranks:'🏆 Tutti i Rank',change_priority:'Priorità:',session_duration:'Durata (h)',work_block:'Blocco lavoro (min)',break_block:'Pausa (min)',exit_session_title:'Uscire?',exit_session_desc:'I progressi andranno persi.',no_stay:'Rimani',yes_quit:'Esci',login_tab:'Accedi',register_tab:'Registrati',wcTitle:'Ciao! Sono Chronos!',wcDesc:'Il tuo assistente IA. Tutorial?',wcSkip:'No grazie',wcStart:'Sì ✨',week_this:'Questa settimana',week_next:'Settimana prossima',week_prev:'Settimana scorsa',free:'Libero',no_events:'Nessun evento',loading:'Chronos sta analizzando...',work_phase:'Lavoro 💪',break_phase:'Pausa ☕',session_phase:'Sessione',break_label:'Pausa',revise_title:'📚 Cosa studiare?',revise_subject:'Materia',revise_date:'Per quando?',revise_gen:'Genera 🚀',error_field:'Compila tutti i campi',error_email:'Email non valida',error_pwd:'Password: min. 6 caratteri',error_email_used:'Email già usata',error_account:'Account non trovato',error_pwd_wrong:'Password errata',lang_changed:'✅ Lingua cambiata',tut1:"Benvenuto! Zona IA.",tut2:'Piano settimanale.',tut3:'Calendario mensile 📅',tut4:'Statistiche 📊',tut5:'XP e livelli 🎖️',tut6:"Sono Chronos! 🌟",tut7:"Revisione settimanale 📊",obChooseProfile:'Scegli il profilo',obStudentTitle:'🎓 Studente',obWorkerTitle:'💼 Lavoratore',obCustomTitle:'✨ Personalizzato',pcStudent:'Studente',pcWorker:'Lavoratore',pcCustom:'Personalizzato',pcStudentDesc:'Lezioni, studio, esami',pcWorkerDesc:'Progetti, riunioni, scadenze',pcCustomDesc:'Lo configuro io',btnAddCourse:'Aggiungi corso',btnBack:'Indietro',btnFinish:'Termina',lblMaxStudy:'Max studio/giorno (h)',lblMaxLeisure:'Max svago/giorno (h)',lblBreakBetween:'Pausa (min)',lblWorkStart:'Inizio giornata',lblWorkEnd:'Fine giornata',lblMaxWork:'Max lavoro/giorno (h)',lblBreakW:'Pausa (min)',lblMaxStudyC:'Max studio/giorno (h)',lblMaxLeisureC:'Max svago/giorno (h)',lblBreakC:'Pausa (min)',lblEmail:'Email',lblPassword:'Password',lblName:'Nome',lblEmailR:'Email',lblPasswordR:'Password',btnLogin:'Accedi →',btnRegister:'Crea account →',dash_hello:'Ciao',dash_subtitle:'Il tuo riepilogo di oggi',dash_generate_cta:'✨ Genera il mio piano'},pt:{nav_dashboard:'Painel',nav_planning:'Planejamento',nav_calendar:'Calendário',nav_insights:'Insights',nav_templates:'Modelos',nav_badges:'Conquistas',nav_settings:'Configurações',btn_generate:'Gerar',start_session:'Iniciar sessão',today:'📍 Hoje',upcoming:'📅 Em breve',profile:'Perfil',events:'Eventos',streak:'Sequência',hours:'Horas',badges:'Conquistas',info:'Informações',firstname:'Nome',save:'Salvar',language:'Idioma',notifications:'Notificações',theme:'Tema',api_key:'Chave API',api_hint:'Chave salva localmente.',privacy:'Privacidade',change_pwd:'Alterar senha',data:'Dados',export:'Exportar dados',delete_account:'Excluir conta',talk:'💬 Falar',locker:'🎒 Armário',ai_assistant:'Assistente IA',yes:'Sim',no:'Não',close:'Fechar',cancel:'Cancelar',start:'Iniciar',all_ranks:'🏆 Todos os Ranks',change_priority:'Prioridade:',session_duration:'Duração (h)',work_block:'Bloco trabalho (min)',break_block:'Pausa (min)',exit_session_title:'Sair da sessão?',exit_session_desc:'O progresso será perdido.',no_stay:'Ficar',yes_quit:'Sair',login_tab:'Entrar',register_tab:'Cadastrar',wcTitle:'Olá! Eu sou Chronos!',wcDesc:'Seu assistente IA. Tutorial?',wcSkip:'Não obrigado',wcStart:'Sim ✨',week_this:'Esta semana',week_next:'Próxima semana',week_prev:'Semana passada',free:'Livre',no_events:'Sem eventos',loading:'Chronos está analisando...',work_phase:'Trabalho 💪',break_phase:'Pausa ☕',session_phase:'Sessão',break_label:'Pausa',revise_title:'📚 O que estudar?',revise_subject:'Matéria',revise_date:'Para quando?',revise_gen:'Gerar 🚀',error_field:'Preencha todos os campos',error_email:'Email inválido',error_pwd:'Senha: mín. 6 caracteres',error_email_used:'Email já usado',error_account:'Conta não encontrada',error_pwd_wrong:'Senha incorreta',lang_changed:'✅ Idioma alterado',tut1:"Bem-vindo! Zona IA.",tut2:'Planejamento semanal.',tut3:'Calendário mensal 📅',tut4:'Insights 📊',tut5:'XP e nível 🎖️',tut6:"Sou Chronos! 🌟",tut7:"Revisão semanal 📊",obChooseProfile:'Escolha seu perfil',obStudentTitle:'🎓 Estudante',obWorkerTitle:'💼 Trabalhador',obCustomTitle:'✨ Personalizado',pcStudent:'Estudante',pcWorker:'Trabalhador',pcCustom:'Personalizado',pcStudentDesc:'Aulas, revisão, exames',pcWorkerDesc:'Projetos, reuniões, prazos',pcCustomDesc:'Eu mesmo configuro',btnAddCourse:'Adicionar aula',btnBack:'Voltar',btnFinish:'Terminar',lblMaxStudy:'Máx. estudo/dia (h)',lblMaxLeisure:'Máx. lazer/dia (h)',lblBreakBetween:'Pausa (min)',lblWorkStart:'Início do dia',lblWorkEnd:'Fim do dia',lblMaxWork:'Máx. trabalho/dia (h)',lblBreakW:'Pausa (min)',lblMaxStudyC:'Máx. estudo/dia (h)',lblMaxLeisureC:'Máx. lazer/dia (h)',lblBreakC:'Pausa (min)',lblEmail:'Email',lblPassword:'Senha',lblName:'Nome',lblEmailR:'Email',lblPasswordR:'Senha',btnLogin:'Entrar →',btnRegister:'Criar conta →',dash_hello:'Olá',dash_subtitle:'Seu resumo do dia',dash_generate_cta:'✨ Gerar meu planejamento'},ar:{nav_dashboard:'لوحة',nav_planning:'التخطيط',nav_calendar:'التقويم',nav_insights:'الإحصاءات',nav_templates:'القوالب',nav_badges:'الشارات',nav_settings:'الإعدادات',btn_generate:'توليد',start_session:'بدء جلسة مراجعة',today:'📍 اليوم',upcoming:'📅 القادمة',profile:'الملف',events:'أحداث',streak:'سلسلة',hours:'ساعات',badges:'شارات',info:'معلومات',firstname:'الاسم',save:'حفظ',language:'اللغة',notifications:'إشعارات',theme:'موضوع',api_key:'مفتاح API',api_hint:'المفتاح محفوظ محليًا.',privacy:'خصوصية',change_pwd:'تغيير كلمة المرور',data:'بيانات',export:'تصدير',delete_account:'حذف الحساب',talk:'💬 تحدث',locker:'🎒 خزانة',ai_assistant:'مساعد ذكي',yes:'نعم',no:'لا',close:'إغلاق',cancel:'إلغاء',start:'ابدأ',all_ranks:'🏆 الرتب',change_priority:'أولوية:',session_duration:'المدة (ساعة)',work_block:'كتلة عمل (دقيقة)',break_block:'راحة (دقيقة)',exit_session_title:'الخروج؟',exit_session_desc:'سيُفقد تقدمك.',no_stay:'بقاء',yes_quit:'خروج',login_tab:'دخول',register_tab:'تسجيل',wcTitle:'مرحبًا! أنا كرونوس!',wcDesc:'مساعدك الذكي.',wcSkip:'لا شكرًا',wcStart:'نعم ✨',week_this:'هذا الأسبوع',week_next:'الأسبوع القادم',week_prev:'الأسبوع الماضي',free:'حر',no_events:'لا أحداث',loading:'كرونوس يحلل...',work_phase:'عمل 💪',break_phase:'راحة ☕',session_phase:'جلسة',break_label:'استراحة',revise_title:'📚 ماذا تريد أن تراجع؟',revise_subject:'المادة',revise_date:'لمتى؟',revise_gen:'توليد 🚀',error_field:'أكمل جميع الحقول',error_email:'بريد غير صالح',error_pwd:'كلمة المرور: 6 أحرف',error_email_used:'البريد مستخدم',error_account:'الحساب غير موجود',error_pwd_wrong:'كلمة مرور خاطئة',lang_changed:'✅ تم تغيير اللغة',tut1:"مرحبًا! منطقة الذكاء الاصطناعي.",tut2:'الجدول الأسبوعي.',tut3:'التقويم الشهري 📅',tut4:'الإحصاءات 📊',tut5:'XP والمستويات 🎖️',tut6:"أنا كرونوس! 🌟",tut7:"المراجعة الأسبوعية 📊",obChooseProfile:'اختر ملفك',obStudentTitle:'🎓 إعداد الطالب',obWorkerTitle:'💼 إعداد العامل',obCustomTitle:'✨ مخصص',pcStudent:'طالب',pcWorker:'عامل',pcCustom:'مخصص',pcStudentDesc:'دروس، مراجعة، امتحانات',pcWorkerDesc:'مشاريع، اجتماعات، مواعيد',pcCustomDesc:'أنا أهيؤه بنفسي',btnAddCourse:'إضافة درس',btnBack:'رجوع',btnFinish:'إنهاء',lblMaxStudy:'أقصى مراجعة/يوم (ساعة)',lblMaxLeisure:'أقصى ترفيه/يوم (ساعة)',lblBreakBetween:'استراحة (دقيقة)',lblWorkStart:'بداية اليوم',lblWorkEnd:'نهاية اليوم',lblMaxWork:'أقصى عمل/يوم (ساعة)',lblBreakW:'استراحة (دقيقة)',lblMaxStudyC:'أقصى مراجعة/يوم (ساعة)',lblMaxLeisureC:'أقصى ترفيه/يوم (ساعة)',lblBreakC:'استراحة (دقيقة)',lblEmail:'البريد الإلكتروني',lblPassword:'كلمة المرور',lblName:'الاسم',lblEmailR:'البريد الإلكتروني',lblPasswordR:'كلمة المرور',btnLogin:'تسجيل الدخول →',btnRegister:'إنشاء حساب →',dash_hello:'مرحبًا',dash_subtitle:'ملخص يومك',dash_generate_cta:'✨ إنشاء جدولي الآن'}};
function T(k){return(LANGS[S.lang]||LANGS.fr)[k]||k;}
function applyI18n(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=T(el.dataset.i18n);});
  const ids={authTagline:'wcDesc',loadingTxt:'loading',wcTitle:'wcTitle',wcDesc:'wcDesc',wcSkip:'wcSkip',wcStart:'wcStart',tabLogin:'login_tab',tabRegister:'register_tab',lblEmail:'lblEmail',lblPassword:'lblPassword',lblName:'lblName',lblEmailR:'lblEmailR',lblPasswordR:'lblPasswordR',btnLogin:'btnLogin',btnRegister:'btnRegister',lblMaxStudy:'lblMaxStudy',lblMaxLeisure:'lblMaxLeisure',lblBreakBetween:'lblBreakBetween',lblWorkStart:'lblWorkStart',lblWorkEnd:'lblWorkEnd',lblMaxWork:'lblMaxWork',lblBreakW:'lblBreakW',lblMaxStudyC:'lblMaxStudyC',lblMaxLeisureC:'lblMaxLeisureC',lblBreakC:'lblBreakC',btnAddCourse:'btnAddCourse',btnBack:'btnBack',btnFinish:'btnFinish',obChooseProfile:'obChooseProfile',obStudentTitle:'obStudentTitle',obWorkerTitle:'obWorkerTitle',obCustomTitle:'obCustomTitle',pcStudent:'pcStudent',pcWorker:'pcWorker',pcCustom:'pcCustom',pcStudentDesc:'pcStudentDesc',pcWorkerDesc:'pcWorkerDesc',pcCustomDesc:'pcCustomDesc',reviseTitle:'revise_title',reviseSubjectLabel:'revise_subject',reviseDateLabel:'revise_date',reviseConfirm:'revise_gen',chronoInitMsg:'wcDesc'};
  for(const[id,key]of Object.entries(ids)){const el=document.getElementById(id);if(el)el.textContent=T(key);}
  ['dashboard','planning','calendar','insights','templates','badges','settings'].forEach(v=>{const el=document.querySelector('[data-view="'+v+'"] .nav-label');if(el)el.textContent=T('nav_'+v);});
}


/* ═══ XP / RANKS ═══ */
const XP_GAINS={daily_login:15,event_created:10,week_planned:50,badge_1day:20,badge_3day:30,badge_7day:50,badge_14day:75,badge_30day:120,badge_60day:200,badge_90day:350,badge_first:25};
const RANKS=[{name:'Bronze',minLv:1,maxLv:8,cls:'rank-bronze',icon:'🥉',color:'#CD7F32'},{name:'Silver',minLv:9,maxLv:18,cls:'rank-silver',icon:'🥈',color:'#A8A9AD'},{name:'Gold',minLv:19,maxLv:30,cls:'rank-gold',icon:'🥇',color:'#FFD700'},{name:'Diamond',minLv:31,maxLv:45,cls:'rank-diamond',icon:'💎',color:'#B9F2FF'},{name:'Master',minLv:46,maxLv:65,cls:'rank-master',icon:'🔮',color:'#9B59B6'},{name:'Legend',minLv:66,maxLv:999,cls:'rank-legend',icon:'👑',color:'#FF4500'}];
function xpForLv(l){if(l<=3)return 80*l;if(l<=10)return Math.round(150*Math.pow(1.3,l-3));if(l<=30)return Math.round(400*Math.pow(1.2,l-10));return Math.round(1200*Math.pow(1.15,l-30));}
function totalXpForLv(l){let t=0;for(let i=1;i<l;i++)t+=xpForLv(i);return t;}
function curLvXp(){return S.xp-totalXpForLv(S.level);}
function nextLvXp(){return xpForLv(S.level);}
function getRank(l){return RANKS.find(r=>l>=r.minLv&&l<=r.maxLv)||RANKS[0];}
function addXp(amt){
  const prev=S.level;S.xp+=amt;S.totalXpEarned+=amt;
  while(S.xp>=totalXpForLv(S.level+1))S.level++;
  if(S.level>prev){const reward=LEVEL_REWARDS[S.level]||null;showLevelUpNotif(S.level,reward);updateMascot();syncAllKoros();setTimeout(updateRankDisplays,300);if(S.notifications)sendNotif('⬆️ ChronoFlow','Niveau '+S.level+' !'+(reward?' Tu débloqueras '+reward:''));saveState();}
  showXpPop('+'+amt+' XP');saveState();updateXpBar();
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

/* ═══ LOCKER ═══ */
const CHRONOS_ITEMS=[{id:'default',icon:'👔',name:'Costume de base',lvl:1,type:'suit',bg:''},{id:'dark',icon:'🌑',name:'Costume Sombre',lvl:2,type:'suit',bg:'linear-gradient(160deg,#080808,#111)'},{id:'gold_tie',icon:'✨',name:'Cravate Dorée',lvl:3,type:'tie'},{id:'star',icon:'🌟',name:'Costume Étoilé',lvl:5,type:'suit',bg:'linear-gradient(160deg,#1a1040,#2d1b6e)'},{id:'glasses',icon:'👓',name:'Lunettes',lvl:8,type:'acc'},{id:'diamond',icon:'💎',name:'Costume Diamant',lvl:10,type:'suit',bg:'linear-gradient(160deg,#0a2a3a,#0d3d5a)'},{id:'cape',icon:'🦸',name:'Cape Légende',lvl:15,type:'acc'},{id:'wings',icon:'🪶',name:'Ailes',lvl:20,type:'acc'},{id:'batman',icon:'🦇',name:'Costume Batman',lvl:25,type:'suit',bg:'linear-gradient(160deg,#0a0a0a,#1a1a1a)'},{id:'crown',icon:'👑',name:'Couronne',lvl:30,type:'acc'},{id:'ironman',icon:'🤖',name:'Armure Iron Man',lvl:35,type:'suit',bg:'linear-gradient(160deg,#8B0000,#FFD700)'},{id:'wizard',icon:'🧙',name:'Chapeau Mage',lvl:40,type:'acc'},{id:'halo',icon:'😇',name:'Auréole',lvl:50,type:'acc'}];
const LEVEL_REWARDS={2:'costume Sombre 🌑',3:'Cravate Dorée ✨',5:'costume Étoilé 🌟',8:'Lunettes 👓',10:'costume Diamant 💎',15:'Cape 🦸',20:'Ailes 🪶',25:'costume Batman 🦇',30:'Couronne 👑',35:'Armure Iron Man 🤖',40:'Chapeau Mage 🧙',50:'Auréole 😇'};
function updateMascot(){
  const rank=getRank(S.level);const rankKey=rank.cls.replace('rank-','');
  document.querySelectorAll('.chronos-figure').forEach(el=>{el.className=el.className.replace(/ch-rank-\S+/g,'').trim();el.classList.add('ch-rank-'+rankKey);});
  const item=CHRONOS_ITEMS.find(i=>i.id===S.equippedItem)||CHRONOS_ITEMS[0];
  document.querySelectorAll('.ch-gown').forEach(el=>{el.style.background=item.type==='suit'&&item.bg?item.bg:'';});
  document.querySelectorAll('.ch-tie').forEach(el=>{el.style.background=S.equippedItem==='gold_tie'?'linear-gradient(180deg,#FFD700,#c4a800)':'';});
  const av=document.querySelector('.profile-av');if(av){av.style.borderColor=rank.color;av.style.boxShadow='0 0 0 3px '+rank.color+'33';}
}
function updateLockerGrid(){
  const g=document.getElementById('lockerGrid');if(!g)return;
  g.innerHTML=CHRONOS_ITEMS.map(item=>{const un=S.level>=item.lvl,eq=S.equippedItem===item.id;return'<div class="locker-item'+(eq?' equipped':'')+(un?'':' locked')+'" onclick="'+(un?'equipItem(\''+item.id+'\')':'')+'"><div class="locker-icon">'+item.icon+'</div><div class="locker-name">'+item.name+'</div><div class="locker-price">Niv. '+item.lvl+'</div>'+(eq?'<div style="font-size:.62rem;color:var(--orange);font-weight:700;margin-top:.18rem">✓ Équipé</div>':(un?'':'🔒'))+'</div>';}).join('');
}
function equipItem(id){S.equippedItem=id;localStorage.setItem('cf_equipped',id);updateLockerGrid();updateMascot();toast('✅ Équipement changé !');saveState();}

/* ═══ BADGES ═══ */
const ALL_BADGES=[{id:'first',emoji:'⚡',name:'Premier pas',desc:'1er événement',xp:XP_GAINS.badge_first,msg:"Bienvenue !",cond:()=>(S.user?.totalEvents||0)>=1},{id:'3d',emoji:'🔥',name:'3 Jours',desc:'Streak de 3 jours',xp:XP_GAINS.badge_3day,msg:"Bonne habitude !",cond:()=>S.streak>=3},{id:'7d',emoji:'✨',name:'Semaine',desc:'Streak de 7 jours',xp:XP_GAINS.badge_7day,msg:"Une semaine !",cond:()=>S.streak>=7},{id:'14d',emoji:'💪',name:'Quinzaine',desc:'Streak de 14 jours',xp:XP_GAINS.badge_14day,msg:"Deux semaines !",cond:()=>S.streak>=14},{id:'30d',emoji:'🌟',name:'Un mois',desc:'Streak de 30 jours',xp:XP_GAINS.badge_30day,msg:"Un mois !",cond:()=>S.streak>=30},{id:'60d',emoji:'💎',name:'Deux mois',desc:'Streak de 60 jours',xp:XP_GAINS.badge_60day,msg:"Tu es une machine !",cond:()=>S.streak>=60},{id:'90d',emoji:'👑',name:'Légende',desc:'Streak de 90 jours',xp:XP_GAINS.badge_90day,msg:"LÉGENDE !",cond:()=>S.streak>=90},{id:'ev10',emoji:'📋',name:'Planificateur',desc:'10 événements',xp:30,msg:"Pro !",cond:()=>(S.user?.totalEvents||0)>=10},{id:'ev50',emoji:'🗓️',name:'Organisateur',desc:'50 événements',xp:80,msg:"Top !",cond:()=>(S.user?.totalEvents||0)>=50}];
const unlockedBadges=new Set();
function checkBadges(){ALL_BADGES.forEach(b=>{if(!unlockedBadges.has(b.id)&&b.cond()){unlockedBadges.add(b.id);saveState();toast('🏅 Badge : '+b.name+'!');if(b.xp>0)setTimeout(()=>addXpV2(b.xp),500);}});}
function updateBadgeHint(){const el=document.getElementById('chronoBadgeText');if(!el)return;const next=Object.keys(LEVEL_REWARDS).map(Number).sort((a,b)=>a-b).find(l=>l>S.level);if(!next){el.innerHTML='Tu as tout débloqué ! 👑';return;}el.innerHTML='Niveau <strong>'+next+'</strong> → tu débloqueras <strong>'+LEVEL_REWARDS[next]+'</strong> pour Chronos !';}

/* ═══ TUTORIAL ═══ */
const TUT_STEPS=[{view:'planning',target:'aiPanel',txtKey:'tut1'},{view:'planning',target:'planningGrid',txtKey:'tut2'},{view:'calendar',target:'monthCal',txtKey:'tut3'},{view:'insights',target:'insightsGrid',txtKey:'tut4'},{view:'badges',target:'xpSection',txtKey:'tut5'},{view:'planning',target:'mascot',txtKey:'tut6'},{view:'insights',target:'weeklyReviewBtnInsights',txtKey:'tut7'}];

/* ═══ FLAGS ═══ */
const FLAG_SVGS={fr:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#002395"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#ED2939"/></svg>',en:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#012169"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#fff" stroke-width="7"/><path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" stroke-width="4"/><path d="M30,0 V40 M0,20 H60" stroke="#fff" stroke-width="11"/><path d="M30,0 V40 M0,20 H60" stroke="#C8102E" stroke-width="6"/></svg>',de:'<svg viewBox="0 0 60 40"><rect width="60" height="13.3" fill="#000"/><rect y="13.3" width="60" height="13.3" fill="#DD0000"/><rect y="26.6" width="60" height="13.4" fill="#FFCE00"/></svg>',es:'<svg viewBox="0 0 60 40"><rect width="60" height="8" fill="#c60b1e"/><rect y="8" width="60" height="24" fill="#ffc400"/><rect y="32" width="60" height="8" fill="#c60b1e"/></svg>',it:'<svg viewBox="0 0 60 40"><rect width="20" height="40" fill="#009246"/><rect x="20" width="20" height="40" fill="#fff"/><rect x="40" width="20" height="40" fill="#CE2B37"/></svg>',pt:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#E21C1C"/><rect width="24" height="40" fill="#006600"/><circle cx="24" cy="20" r="8" fill="#FFFF00" stroke="#006600" stroke-width="1.5"/></svg>',ar:'<svg viewBox="0 0 60 40"><rect width="60" height="40" fill="#006C35"/><rect width="20" height="40" fill="#fff"/></svg>'};
const LANG_NAMES={fr:'Français',en:'English',de:'Deutsch',es:'Español',it:'Italiano',pt:'Português',ar:'العربية'};

/* ═══ PARTICLES ═══ */
function makeParticles(id){const c=document.getElementById(id);if(!c)return;for(let i=0;i<18;i++){const p=document.createElement('div');p.className='particle';p.style.cssText='left:'+Math.random()*100+'%;bottom:-10px;--dx:'+(Math.random()*200-100)+'px;animation-duration:'+(6+Math.random()*8)+'s;animation-delay:'+(Math.random()*8)+'s;width:'+(3+Math.random()*4)+'px;height:'+(3+Math.random()*4)+'px';c.appendChild(p);}}

/* ═══ SONS ═══ */
let _audioCtx=null;
function getAudioCtx(){if(!_audioCtx)_audioCtx=new(window.AudioContext||window.webkitAudioContext)();return _audioCtx;}
function playSound(type){
  if(!S.soundEnabled)return;
  try{
    const ctx=getAudioCtx();
    if(type==='xp'){const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.type='sine';o.frequency.setValueAtTime(880,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(1200,ctx.currentTime+0.08);g.gain.setValueAtTime(0.18,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.25);o.start(ctx.currentTime);o.stop(ctx.currentTime+0.25);}
    else if(type==='badge'){[0,0.07,0.14].forEach((delay,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);const freqs=[660,880,1100];o.type='sine';o.frequency.setValueAtTime(freqs[i],ctx.currentTime+delay);g.gain.setValueAtTime(0.14,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+0.35);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+0.35);});}
    else if(type==='levelup'){[0,0.1,0.2,0.35].forEach((delay,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);const freqs=[440,550,660,880];o.type='triangle';o.frequency.setValueAtTime(freqs[i],ctx.currentTime+delay);g.gain.setValueAtTime(0.16,ctx.currentTime+delay);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+delay+0.4);o.start(ctx.currentTime+delay);o.stop(ctx.currentTime+delay+0.4);});}
  }catch(e){}
}
function playBeep(freq,dur){try{const ctx=getAudioCtx();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=freq;g.gain.setValueAtTime(.5,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);o.start(ctx.currentTime);o.stop(ctx.currentTime+dur);}catch(e){}}
function setSoundEnabled(on){S.soundEnabled=on;saveState();document.getElementById('soundSlider')?.classList.toggle('to-right',!on);document.getElementById('soundYes')?.classList.toggle('active-btn',on);document.getElementById('soundNo')?.classList.toggle('active-btn',!on);}

/* ═══ RIPPLE ═══ */
function addRipple(e){const btn=e.currentTarget;const rect=btn.getBoundingClientRect();const size=Math.max(rect.width,rect.height);const x=e.clientX-rect.left-size/2;const y=e.clientY-rect.top-size/2;const ripple=document.createElement('span');ripple.className='ripple';ripple.style.cssText='width:'+size+'px;height:'+size+'px;left:'+x+'px;top:'+y+'px;';btn.appendChild(ripple);setTimeout(()=>ripple.remove(),600);}
function initRipples(){document.querySelectorAll('.btn-primary,.btn-auth,.btn-generate,.dash-generate-btn,.btn-tut-next').forEach(btn=>{if(!btn.classList.contains('ripple-container'))btn.classList.add('ripple-container');btn.removeEventListener('click',addRipple);btn.addEventListener('click',addRipple);});}

/* ═══ COUNTER-UP ═══ */
function animateCounter(el,from,to,duration=600,suffix=''){if(!el)return;const start=performance.now();function tick(now){const p=Math.min((now-start)/duration,1);const eased=1-Math.pow(1-p,3);const val=Math.round(from+(to-from)*eased);el.textContent=val+suffix;if(p<1)requestAnimationFrame(tick);else el.textContent=to+suffix;}requestAnimationFrame(tick);}

/* ═══ INIT ═══ */
function initApp(){
  S.lang=localStorage.getItem('cf_lang')||'fr';
  S.equippedItem=localStorage.getItem('cf_equipped')||'default';
  S.soundEnabled=localStorage.getItem('cf_sound')!=='false';
  applyTheme(localStorage.getItem('cf_theme')||'dark');
  makeParticles('particlesLang');makeParticles('particles');makeParticles('particles2');
  applyI18n();
  document.addEventListener('keydown',e=>{if(e.key==='Escape')handleEsc();});
  document.addEventListener('click',e=>{if(!e.target.closest('#langDDWrap'))closeLangDD();});
  const phrases=['Initialisation de Chronos...','Chargement du planning...','Synchronisation Firebase...','Presque prêt...'];
  let pi=0;const phraseEl=document.getElementById('lsPhrase');
  const phraseIv=setInterval(()=>{if(phraseEl&&pi<phrases.length)phraseEl.textContent=phrases[pi++];else clearInterval(phraseIv);},500);
  window.FB.fbOnAuthChange(async(uid)=>{
    clearInterval(phraseIv);
    if(uid){
      try{
        const userData=await window.FB.fbGetUser(uid);
        if(userData){
          S.user=userData;S.xp=userData.xp||0;S.level=userData.level||1;S.totalXpEarned=userData.totalXpEarned||0;S.streak=userData.streak||0;S.lastUsedDate=userData.lastUsedDate||null;S.tutorialDone=userData.tutorialDone||false;S.template=userData.template||'custom';S.templateData=Object.assign({maxStudy:4,maxLeisure:3,breakMin:10,courses:[],workStart:'09:00',workEnd:'18:00',maxWork:8},userData.templateData||{});S.theme=userData.theme||'dark';S.lang=userData.lang||S.lang;S.notifications=userData.notifications!==undefined?userData.notifications:true;S.equippedItem=userData.equippedItem||'default';S.todos=userData.todos||[];S.soundEnabled=userData.soundEnabled!==undefined?userData.soundEnabled:true;
          if(userData.unlockedBadges)userData.unlockedBadges.forEach(id=>unlockedBadges.add(id));
          S.events=await window.FB.fbGetEvents(uid);
          localStorage.setItem('cf_lang',S.lang);localStorage.setItem('cf_equipped',S.equippedItem);localStorage.setItem('cf_theme',S.theme);localStorage.setItem('cf_sound',S.soundEnabled);
          launchWithTransition();
        }
      }catch(e){console.error(e);document.getElementById('loadingScreen').style.display='none';document.getElementById('authScreen').style.display='flex';}
    }else{
      document.getElementById('loadingScreen').style.display='none';
      const hasLang=localStorage.getItem('cf_lang');
      if(!hasLang)document.getElementById('langScreen').style.display='flex';
      else document.getElementById('authScreen').style.display='flex';
    }
  });
}

function launchWithTransition(){
  const overlay=document.createElement('div');overlay.className='app-transition-overlay';
  overlay.innerHTML='<div style="text-align:center"><div style="font-size:2.5rem;margin-bottom:.5rem;animation:chronosEntrance .5s cubic-bezier(.16,1,.3,1) both">⚡</div><div style="font-family:var(--font-d);font-size:1.1rem;font-weight:900;color:var(--t1)">ChronoFlow</div></div>';
  document.body.appendChild(overlay);
  setTimeout(()=>{overlay.classList.add('fade-out');document.getElementById('loadingScreen').style.display='none';launchApp();setTimeout(()=>overlay.remove(),900);},700);
}

function handleEsc(){
  if(S.sessionActive){const exitModal=document.getElementById('exitSessionModal');if(exitModal&&exitModal.classList.contains('show'))exitModal.classList.remove('show');else tryExitSession();return;}
  document.querySelectorAll('.modal.show,.modal-full.show').forEach(m=>m.classList.remove('show'));
}

/* ═══ LANG ═══ */
function selectLang(lang){S.lang=lang;localStorage.setItem('cf_lang',lang);document.getElementById('langScreen').style.display='none';document.getElementById('authScreen').style.display='flex';applyI18n();updateLangDD();}
function setLang(lang){S.lang=lang;localStorage.setItem('cf_lang',lang);updateLangDD();closeLangDD();toast(T('lang_changed'));applyI18n();saveState();}
function updateLangDD(){const f=document.getElementById('langDDFlag');if(f)f.innerHTML=FLAG_SVGS[S.lang]||FLAG_SVGS.fr;const n=document.getElementById('langDDName');if(n)n.textContent=LANG_NAMES[S.lang]||'Français';}
function toggleLangDD(){document.getElementById('langDDMenu')?.classList.toggle('open');document.getElementById('langDDBtn')?.classList.toggle('open');}
function closeLangDD(){document.getElementById('langDDMenu')?.classList.remove('open');document.getElementById('langDDBtn')?.classList.remove('open');}

/* ═══ AUTH ═══ */
function switchAuthTab(tab){
  if(tab===curAuthTab)return;curAuthTab=tab;
  const sl=document.getElementById('authTabSlider');const lf=document.getElementById('loginForm');const rf=document.getElementById('registerForm');const tl=document.getElementById('tabLogin');const tr=document.getElementById('tabRegister');
  if(tab==='register'){sl.classList.add('to-right');tl.classList.remove('active');tr.classList.add('active');lf.style.display='none';lf.classList.remove('active');rf.style.display='flex';rf.classList.add('active');}
  else{sl.classList.remove('to-right');tr.classList.remove('active');tl.classList.add('active');rf.style.display='none';rf.classList.remove('active');lf.style.display='flex';lf.classList.add('active');}
}
async function handleLogin(){
  const email=document.getElementById('loginEmail').value.trim();const pass=document.getElementById('loginPassword').value;
  if(!email||!pass){toast('⚠️ '+T('error_field'));return;}
  const btn=document.getElementById('btnLogin');if(btn)btn.disabled=true;
  try{await window.FB.fbLogin(email,pass);}
  catch(e){const msg=e.code==='auth/user-not-found'||e.code==='auth/invalid-credential'?T('error_account'):e.code==='auth/wrong-password'?T('error_pwd_wrong'):e.code==='auth/invalid-email'?T('error_email'):e.message;toast('❌ '+msg);}
  finally{if(btn)btn.disabled=false;}
}
async function handleRegister(){
  const name=document.getElementById('regName').value.trim();const email=document.getElementById('regEmail').value.trim();const pass=document.getElementById('regPassword').value;
  if(!name||!email||!pass){toast('⚠️ '+T('error_field'));return;}
  if(!email.includes('@')){toast('⚠️ '+T('error_email'));return;}
  if(pass.length<6){toast('⚠️ '+T('error_pwd'));return;}
  const btn=document.getElementById('btnRegister');if(btn)btn.disabled=true;
  try{const uid=await window.FB.fbRegister(name,email,pass);S.user={uid,name,email,avatar:'',totalEvents:0};S.template='custom';S.events=[];S.streak=0;S.xp=0;S.level=1;S.todos=[];document.getElementById('authScreen').style.display='none';startOnboarding();}
  catch(e){const msg=e.code==='auth/email-already-in-use'?T('error_email_used'):e.code==='auth/invalid-email'?T('error_email'):e.code==='auth/weak-password'?T('error_pwd'):e.message;toast('❌ '+msg);}
  finally{if(btn)btn.disabled=false;}
}

/* ═══ ONBOARDING V2 ═══ */
const OB_MSGS={fr:["Bienvenue ! Je suis Chronos, ton assistant IA. Dis-moi qui tu es !","Super choix ! Configure ton profil selon tes besoins.","Parfait ! Tu es prêt à commencer. Let's go ! 🚀"],en:["Welcome! I'm Chronos, your AI assistant. Tell me who you are!","Great choice! Set up your profile.","Perfect! You're ready to go! 🚀"]};
function getObMsg(step){return(OB_MSGS[S.lang]||OB_MSGS.fr)[step-1]||OB_MSGS.fr[step-1];}
function startOnboarding(){
  S.obStep=1;S.obProfile=null;
  const scr=document.getElementById('onboardingScreen');if(!scr)return;
  scr.style.display='flex';updateObProgress();updateObChronosMsg();showObStep(1);
}
function updateObProgress(){
  const fill=document.getElementById('obProgressFill');if(fill)fill.style.width=Math.round((S.obStep/3)*100)+'%';
  document.querySelectorAll('.ob-step-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===S.obStep-1);dot.classList.toggle('done',i<S.obStep-1);});
}
function updateObChronosMsg(){const el=document.getElementById('obChronosMsg');if(el)el.textContent=getObMsg(S.obStep);}
function showObStep(step){
  document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));
  const ids={1:'obStep1','2s':'obStep2','2w':'obStep2w','2c':'obStep2c'};
  const el=document.getElementById(ids[step]||'obStep1');if(el)el.classList.add('active');
}
function obNextToConfig(){
  if(!S.obProfile){toast('⚠️ Choisis un profil !');return;}
  S.obStep=2;updateObProgress();updateObChronosMsg();
  if(S.obProfile==='student')showObStep('2s');else if(S.obProfile==='worker')showObStep('2w');else showObStep('2c');
}
function obSelectProfile(type,el){
  S.obProfile=type;S.template=type;
  document.querySelectorAll('.profile-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
}
function obBack(){S.obStep=1;updateObProgress();updateObChronosMsg();showObStep(1);}
function addCourse(){
  const c=document.getElementById('coursesContainer');if(!c)return;
  const row=document.createElement('div');row.className='course-row';
  row.innerHTML='<select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';
  c.appendChild(row);
}
async function finishOnboarding(){
  const td=S.templateData;
  if(S.template==='student'){const rows=document.querySelectorAll('.course-row');td.courses=Array.from(rows).map(r=>({day:+r.querySelector('.sel').value,start:r.querySelectorAll('.tinp')[0].value,end:r.querySelectorAll('.tinp')[1].value,subject:r.querySelector('.sinp').value})).filter(c=>c.subject);td.maxStudy=+(document.getElementById('obMaxStudy')?.value)||4;td.maxLeisure=+(document.getElementById('obMaxLeisure')?.value)||3;td.breakMin=+(document.getElementById('obBreakBetween')?.value)||10;}
  else if(S.template==='worker'){td.workStart=document.getElementById('workStart')?.value||'09:00';td.workEnd=document.getElementById('workEnd')?.value||'18:00';td.maxWork=+(document.getElementById('obMaxWork')?.value)||8;td.breakMin=+(document.getElementById('obBreakWork')?.value)||10;}
  else{td.maxStudy=+(document.getElementById('obMaxStudyC')?.value)||4;td.maxLeisure=+(document.getElementById('obMaxLeisureC')?.value)||3;td.breakMin=+(document.getElementById('obBreakCustom')?.value)||10;}
  S.lastUsedDate=new Date().toISOString();
  S.obStep=3;updateObProgress();updateObChronosMsg();
  document.querySelectorAll('.ob-step').forEach(s=>s.classList.remove('active'));
  const cel=document.getElementById('obStepCelebrate');if(cel)cel.classList.add('active');
  spawnConfetti();if(S.soundEnabled)playSound('levelup');
  setTimeout(async()=>{
    document.getElementById('onboardingScreen').style.display='none';
    if(S.user?.uid)await window.FB.fbSaveUser(S.user.uid,{template:S.template,templateData:S.templateData,lastUsedDate:S.lastUsedDate});
    launchWithTransition();
  },2200);
}


/* ═══ LAUNCH APP ═══ */
function launchApp(){
  setTimeout(()=>{const c=document.getElementById('mainContent');if(c)c.addEventListener('scroll',()=>{const m=document.getElementById('mascot');if(m){m.classList.add('spy-mode');clearTimeout(m._st);m._st=setTimeout(()=>m.classList.remove('spy-mode'),1800);}});},500);
  document.getElementById('authScreen').style.display='none';
  document.getElementById('onboardingScreen').style.display='none';
  document.getElementById('appScreen').style.display='flex';
  applyTheme(S.theme);updateHeader();updateAllViews();updateMascot();updateRankDisplays();updateXpBar();updateLangDD();initToggles();applyI18n();checkStreak();
  const today=new Date().toDateString();const lastLogin=localStorage.getItem('cf_last_login');
  if(lastLogin!==today){localStorage.setItem('cf_last_login',today);setTimeout(()=>addXpV2(XP_GAINS.daily_login),800);}
  if(!S.tutorialDone)setTimeout(()=>document.getElementById('welcomeModal').classList.add('show'),700);
  requestNotifPermission();checkWeeklyReview();updateTodoList();
  const apiKey=localStorage.getItem('cf_apikey')||'';if(apiKey){const el=document.getElementById('apiKeyInput');if(el)el.value='••••'+apiKey.slice(-4);}
  updateMascot();setTimeout(syncAllKoros,200);initRipples();
  setTimeout(()=>{const m=document.getElementById('mascot');if(m&&!m._entranceDone){m._entranceDone=true;m.classList.add('entrance');setTimeout(()=>m.classList.remove('entrance'),800);}},400);
  launchAppV2();
  const hz=document.getElementById('sidebarHoverZone');
  if(hz){hz.addEventListener('mouseenter',()=>toggleSidebar(true));document.getElementById('sidebar')?.addEventListener('mouseleave',(e)=>{if(!e.relatedTarget||!e.currentTarget.contains(e.relatedTarget))toggleSidebar(false);});}
}
function reloadApp(){if(confirm('Revenir à l\'accueil ?'))location.reload();}
async function logout(){try{await window.FB.fbLogout();}catch(e){}localStorage.removeItem('cf_last_user');location.reload();}

/* ═══ SIDEBAR ═══ */
function toggleSidebar(forceOpen){const sb=document.getElementById('sidebar');const bd=document.getElementById('sidebarBackdrop');const hb=document.getElementById('hamburgerBtn');const open=forceOpen!==undefined?forceOpen:!sb.classList.contains('open');sb.classList.toggle('open',open);bd.classList.toggle('show',open);hb.classList.toggle('open',open);}
function closeSidebar(){document.getElementById('sidebar')?.classList.remove('open');document.getElementById('sidebarBackdrop')?.classList.remove('show');document.getElementById('hamburgerBtn')?.classList.remove('open');}

/* ═══ STREAK ═══ */
function checkStreak(){
  const today=new Date();today.setHours(0,0,0,0);
  if(!S.lastUsedDate){S.streak=0;S.lastUsedDate=new Date().toISOString();saveState();return;}
  const last=new Date(S.lastUsedDate);last.setHours(0,0,0,0);
  const diff=Math.floor((today-last)/86400000);
  if(diff===1)S.streak++;else if(diff>1)S.streak=0;
  S.lastUsedDate=new Date().toISOString();saveState();
  updateStreakFlame();
  if(S.streak>0&&S.streak%7===0)setTimeout(()=>chronosStreakReact(S.streak),1200);
}
function updateStreakFlame(){
  document.querySelectorAll('.streak-flame').forEach(f=>{
    f.classList.remove('flame-sm','flame-md','flame-lg','flame-epic');
    if(S.streak>=30)f.classList.add('flame-epic');
    else if(S.streak>=14)f.classList.add('flame-lg');
    else if(S.streak>=7)f.classList.add('flame-md');
    else f.classList.add('flame-sm');
  });
}

/* ═══ THEME / TOGGLES ═══ */
function applyTheme(th){document.documentElement.setAttribute('data-theme',th);S.theme=th;}
function setTheme(th){applyTheme(th);localStorage.setItem('cf_theme',th);saveState();document.getElementById('themeSlider')?.classList.toggle('to-right',th==='dark');document.getElementById('httSlider')?.classList.toggle('to-right',th==='dark');document.getElementById('themeDark')?.classList.toggle('active-btn',th==='dark');document.getElementById('themeLight')?.classList.toggle('active-btn',th==='light');}
function setNotif(on){S.notifications=on;saveState();document.getElementById('notifSlider')?.classList.toggle('to-right',!on);document.getElementById('notifYes')?.classList.toggle('active-btn',on);document.getElementById('notifNo')?.classList.toggle('active-btn',!on);}
function initToggles(){setTheme(S.theme);setNotif(S.notifications);setSoundEnabled(S.soundEnabled);}
function requestNotifPermission(){if(S.notifications&&'Notification' in window&&Notification.permission==='default')Notification.requestPermission();}
function sendNotif(title,body){if(!S.notifications)return;if('Notification' in window&&Notification.permission==='granted')new Notification(title,{body});}

/* ═══ HEADER ═══ */
function updateHeader(){
  const el=document.getElementById('headerStreak');if(el)el.textContent=S.streak;
  const img=document.getElementById('headerAvatarImg');const em=document.getElementById('headerAvatarEmoji');
  if(S.user?.avatar){img.src=S.user.avatar;img.style.display='block';em.style.display='none';}else{img.style.display='none';em.style.display='block';}
  const name=S.user?.name||'—';
  const sbName=document.getElementById('sbName');if(sbName)sbName.textContent=name;
  const rank=getRank(S.level);
  const sbRank=document.getElementById('sbRank');if(sbRank)sbRank.textContent=rank?.name||'Bronze';
  const sbLetter=document.getElementById('sbAvLetter');const sbImg=document.getElementById('sbAvImg');
  if(S.user?.avatar&&sbImg){sbImg.src=S.user.avatar;sbImg.style.display='block';if(sbLetter)sbLetter.style.display='none';}
  else if(sbImg){sbImg.style.display='none';if(sbLetter){sbLetter.style.display='block';sbLetter.textContent=name[0]?.toUpperCase()||'👤';}}
  const lvXp=curLvXp();const nxXp=nextLvXp();const pct=nxXp>0?Math.min(100,Math.round((lvXp/nxXp)*100)):0;
  const sbXpFill=document.getElementById('sbXpFill');if(sbXpFill)sbXpFill.style.width=pct+'%';
  const sbXpLv=document.getElementById('sbXpLv');if(sbXpLv)sbXpLv.textContent='Niveau '+S.level;
  const sbXpVal=document.getElementById('sbXpVal');if(sbXpVal)sbXpVal.textContent=S.xp+' XP';
  const sbStr=document.getElementById('sbStreakCount');if(sbStr)sbStr.textContent=S.streak;
  updateStreakFlame();
}

/* ═══ VIEWS ═══ */
function switchView(v){
  S.activeView=v;
  if(window.innerWidth<=768)closeSidebar();
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));
  const current=document.querySelector('.view.active');const next=document.getElementById('view'+v[0].toUpperCase()+v.slice(1));
  if(current&&current!==next)current.classList.remove('active');
  if(next)next.classList.add('active');
  const aiPanel=document.getElementById('aiPanel');if(aiPanel)aiPanel.style.display=v==='planning'?'block':'none';
  updateCurrentView();
  const mascot=document.getElementById('mascot');if(mascot){mascot.classList.remove('sad','focused','clicked');if(v==='insights')mascot.classList.add('focused');}
}
function updateCurrentView(){({dashboard:updateDashboard,planning:updatePlanning,calendar:updateCalendar,insights:()=>{updateInsightsIslands();},templates:updateTemplates,badges:updateBadges,profile:updateProfile,settings:()=>{updateLangDD();initToggles();}})[S.activeView]?.();}
function updateAllViews(){updateDashboard();updatePlanning();updateCalendar();updateBadges();updateProfile();updateTodoList();}

/* ═══ DASHBOARD ═══ */
function updateDashboard(){
  const container=document.getElementById('viewDashboard');if(!container)return;
  const now=new Date();const h=now.getHours();const name=S.user?.name||'';
  let greeting='Bonjour';
  if(S.lang==='fr'){if(h>=5&&h<12)greeting='☀️ Bonjour';else if(h>=12&&h<18)greeting='🌤️ Bon après-midi';else if(h>=18&&h<22)greeting='🌙 Bonsoir';else greeting='⭐ Bonne nuit';}
  else if(S.lang==='en'){if(h>=5&&h<12)greeting='☀️ Good morning';else if(h>=12&&h<18)greeting='🌤️ Good afternoon';else if(h>=18&&h<22)greeting='🌙 Good evening';else greeting='⭐ Good night';}
  else greeting=T('dash_hello');
  const todayEvs=S.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);const t=new Date(now);t.setHours(0,0,0,0);return d.getTime()===t.getTime();}).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const upcomingEvs=S.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);const t=new Date(now);t.setHours(0,0,0,0);return d>t;}).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
  const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay()+1);weekStart.setHours(0,0,0,0);
  const weekEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=weekStart;});
  const weekH=Math.round(weekEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const totalBadges=ALL_BADGES.filter(b=>b.cond()).length;
  const typeColors={study:'var(--blue)',work:'var(--purple)',sport:'var(--green)',social:'#ec4899',leisure:'var(--amber)',health:'#14b8a6',other:'#6b7280',personal:'#14b8a6'};
  const msgs_fr=[`${greeting}, <strong>${name}</strong> !${todayEvs.length>0?' Tu as '+todayEvs.length+' événement'+(todayEvs.length>1?'s':'')+' aujourd\'hui.':' Ta journée est libre !'}`,`${greeting}, <strong>${name}</strong> ! Streak : ${S.streak} jour${S.streak>1?'s':''} — continue ! 🔥`,`${greeting}, <strong>${name}</strong> ! Niveau ${S.level}. ${weekH}h planifiées cette semaine. 💪`];
  const msgs_en=[`${greeting}, <strong>${name}</strong>!${todayEvs.length>0?' You have '+todayEvs.length+' event'+(todayEvs.length>1?'s':'')+' today.':' Your day is free!'}`,`${greeting}, <strong>${name}</strong>! Streak: ${S.streak} day${S.streak>1?'s':''} — keep going! 🔥`,`${greeting}, <strong>${name}</strong>! Level ${S.level}. ${weekH}h planned this week. 💪`];
  const msgs=(S.lang==='en'?msgs_en:msgs_fr);
  const msg=msgs[Math.floor(Date.now()/30000)%msgs.length];
  container.innerHTML=`
    <div class="dash-chronos-card" style="animation:fadeUp .3s cubic-bezier(.16,1,.3,1) both">
      <div class="dcc-icon">⚡</div>
      <div class="dcc-text">
        <div class="dcc-name">Chronos</div>
        <div class="dcc-msg">${msg}</div>
      </div>
    </div>
    <button class="dash-generate-btn ripple-container" onclick="switchView('planning')">
      <span>✨</span><span>${S.lang==='en'?'Generate my schedule now':'Générer mon planning maintenant'}</span>
    </button>
    <div class="dash-quick-stats">
      <div class="dqs-card" style="--dqs-color:var(--orange)">
        <div class="dqs-icon">🔥</div>
        <div class="dqs-val" id="dqsStreak">${S.streak}</div>
        <div class="dqs-label">Streak</div>
      </div>
      <div class="dqs-card" style="--dqs-color:var(--blue)">
        <div class="dqs-icon">📅</div>
        <div class="dqs-val" id="dqsEvents">${todayEvs.length}</div>
        <div class="dqs-label">${S.lang==='en'?"Today's events":"Événements"}</div>
      </div>
      <div class="dqs-card" style="--dqs-color:var(--purple)">
        <div class="dqs-icon">⚡</div>
        <div class="dqs-val" id="dqsXp">${S.xp}</div>
        <div class="dqs-label">XP</div>
      </div>
      <div class="dqs-card" style="--dqs-color:#FFD700">
        <div class="dqs-icon">🏅</div>
        <div class="dqs-val" id="dqsBadges">${totalBadges}</div>
        <div class="dqs-label">Badges</div>
      </div>
    </div>
    <div class="dash-events-section">
      <div class="dash-section-title">${S.lang==='en'?"Today's events":"Événements d'aujourd'hui"}</div>
      ${todayEvs.length===0
        ?'<div class="dash-empty-state"><div class="es-icon" style="font-size:2rem;animation:esFloat 3s ease-in-out infinite">🌟</div><div class="es-title">'+(S.lang==='en'?'Free day!':'Journée libre !')+'</div><div class="es-subtitle">'+(S.lang==='en'?'No events planned. Generate your schedule!':'Aucun événement prévu. Génère ton planning !')+'</div></div>'
        :todayEvs.map(e=>`<div class="dash-event-row" onclick="showEventDetail('${e.id}')" style="border-left-color:${typeColors[e.type]||'var(--orange)'}"><div class="der-time">${e.startTime} – ${e.endTime}</div><div class="der-title">${e.title}</div><div class="der-type" style="color:${typeColors[e.type]||'var(--orange)'}">${e.type||'personal'}</div></div>`).join('')
      }
    </div>
    ${upcomingEvs.length>0?`<div class="dash-events-section" style="margin-top:1rem"><div class="dash-section-title">📅 ${S.lang==='en'?'Upcoming':'À venir'}</div>${upcomingEvs.map(e=>`<div class="dash-event-row" onclick="showEventDetail('${e.id}')" style="border-left-color:${typeColors[e.type]||'var(--orange)'}"><div class="der-time">${new Date(e.date).toLocaleDateString(S.lang==='fr'?'fr-FR':'en-US',{weekday:'short',day:'numeric',month:'short'})}</div><div class="der-title">${e.title}</div><div class="der-type" style="color:${typeColors[e.type]||'var(--orange)'}">${e.startTime}</div></div>`).join('')}</div>`:''}
  `;
  // Animer les compteurs
  setTimeout(()=>{
    animateCounter(document.getElementById('dqsStreak'),0,S.streak,500);
    animateCounter(document.getElementById('dqsEvents'),0,todayEvs.length,400);
    animateCounter(document.getElementById('dqsXp'),0,S.xp,600);
    animateCounter(document.getElementById('dqsBadges'),0,totalBadges,450);
    initRipples();
  },50);
}

/* ═══ TUTORIAL ═══ */
function skipTutorial(){document.getElementById('welcomeModal').classList.remove('show');S.tutorialDone=true;saveState();}
function startTutorial(){document.getElementById('welcomeModal').classList.remove('show');S.tutStep=0;runTutStep();}
function runTutStep(){
  const step=TUT_STEPS[S.tutStep];if(!step){endTut();return;}
  switchView(step.view);document.body.classList.add('tut-locked');
  document.getElementById('tutOverlay').style.display='block';document.getElementById('tutPanel').style.display='flex';document.getElementById('spotlight').style.display='block';
  setTimeout(()=>{const el=document.getElementById(step.target);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});setTimeout(()=>{const r=el.getBoundingClientRect();const sp=document.getElementById('spotlight');sp.style.cssText='top:'+(r.top-8)+'px;left:'+(r.left-8)+'px;width:'+(r.width+16)+'px;height:'+(r.height+16)+'px;display:block;';},300);},200);
  const te=document.getElementById('tutText');const nb=document.getElementById('tutNextBtn');te.textContent='';nb.style.display='none';typeText(te,T(step.txtKey),()=>nb.style.display='block');
}
function typeText(el,txt,cb){let i=0;el.textContent='';const iv=setInterval(()=>{if(i<txt.length){el.textContent+=txt[i++];}else{clearInterval(iv);if(cb)cb();}},20);}
function tutNext(){S.tutStep++;if(S.tutStep>=TUT_STEPS.length)endTut();else runTutStep();}
function endTut(){['tutOverlay','tutPanel','spotlight'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});document.body.classList.remove('tut-locked');S.tutorialDone=true;saveState();switchView('planning');toast('🎉 Tutoriel terminé !');}

/* ═══ CHRONOS CHAT ═══ */
function openChronosChat(){animateChronosClick();document.getElementById('chronosChatModal').classList.add('show');}
function closeChronosChat(){setTimeout(chronosSad,200);document.getElementById('chronosChatModal').classList.remove('show');}
function setChatMode(mode){
  chatMode=mode;const sl=document.getElementById('cmtSlider');const tv=document.getElementById('chatTalkView');const lv=document.getElementById('chatLockerView');const tb=document.getElementById('cmtTalk');const lb=document.getElementById('cmtLocker');
  if(mode==='locker'){sl.classList.add('to-right');tb.classList.remove('active');lb.classList.add('active');tv.style.display='none';lv.style.display='block';updateLockerGrid();}
  else{sl.classList.remove('to-right');lb.classList.remove('active');tb.classList.add('active');lv.style.display='none';tv.style.display='block';}
}
async function sendMsg(){
  const inp=document.getElementById('chatInput');const txt=inp.value.trim();if(!txt)return;inp.value='';addChatMsg(txt,'user');const tid=addChatMsg('...','chrono');
  const key=localStorage.getItem('cf_apikey');if(!key){updateChatMsg(tid,'Configure ta clé API dans les Paramètres ⚙️');return;}
  const langName=LANG_NAMES[S.lang]||'Français';
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,system:'Tu es Chronos, assistant IA de planning ChronoFlow. Réponds UNIQUEMENT en '+langName+'. Streak: '+S.streak+'j, Niveau: '+S.level+', Template: '+S.template+'. Max 3 phrases courtes.',messages:[{role:'user',content:txt}]})});
    const d=await r.json();updateChatMsg(tid,d.content?.[0]?.text||'😊');
  }catch(e){updateChatMsg(tid,'Erreur de connexion. Vérifie ta clé API.');}
}
function addChatMsg(txt,type){const c=document.getElementById('chatMessages');const id='m'+Date.now();const d=document.createElement('div');d.className='chat-msg '+(type==='chrono'?'cm-chrono':'cm-user');d.id=id;d.innerHTML='<div class="chat-bubble">'+txt+'</div>';c.appendChild(d);c.scrollTop=c.scrollHeight;return id;}
function updateChatMsg(id,txt){const el=document.getElementById(id);if(el)el.querySelector('.chat-bubble').textContent=txt;document.getElementById('chatMessages').scrollTop=9999;}

/* ═══ AI TAGS ═══ */
function addTag(btn){const ta=document.getElementById('aiInput');const txt=btn.dataset.txt;btn.classList.toggle('active');if(btn.classList.contains('active')){const cur=ta.value.trim();animText(ta,cur?cur+'\n'+txt:txt);}else ta.value=ta.value.replace(txt,'').trim();}
function animText(ta,txt){let i=0;ta.value='';const iv=setInterval(()=>{if(i<txt.length)ta.value+=txt[i++];else clearInterval(iv);},14);}

/* ═══ AI GENERATION ═══ */
async function generate(){
  const inp=document.getElementById('aiInput');const raw=inp.value.trim();if(!raw){toast('⚠️ Écris quelque chose !');return;}
  if(needsReviseDetail(raw)){pendingReviseText=raw;document.getElementById('reviseTitle').textContent=T('revise_title');document.getElementById('reviseSubjectLabel').textContent=T('revise_subject');document.getElementById('reviseDateLabel').textContent=T('revise_date');document.getElementById('reviseConfirm').textContent=T('revise_gen');document.getElementById('reviseModal').classList.add('show');return;}
  doGenerate(raw);
}
function needsReviseDetail(txt){const l=txt.toLowerCase();return(l.includes('révis')||l.includes('etud')||l.includes('study')||l.includes('apprend'))&&!l.includes('maths')&&!l.includes('physique')&&!l.includes('chimie')&&!l.includes('hist')&&!l.includes('français')&&!l.includes('anglais')&&!l.includes('bio')&&!l.includes('info')&&!l.includes('matière')&&!l.includes('subject')&&!l.includes('cours ');}
function confirmRevise(){const subj=document.getElementById('reviseSubject').value.trim();const date=document.getElementById('reviseDate').value.trim();closeModal('reviseModal');if(!subj){toast('⚠️ '+T('error_field'));return;}doGenerate((pendingReviseText||'révision')+' de '+subj+(date?' '+date:''));pendingReviseText='';}
async function doGenerate(text){
  document.getElementById('loading').classList.add('show');document.getElementById('loadingTxt').textContent=T('loading');
  // Chronos en mode travail
  const mascot=document.getElementById('mascot');if(mascot){mascot.classList.add('focused');}
  const key=localStorage.getItem('cf_apikey');
  let evs;if(key){evs=await generateWithAI(text,key);}else{evs=parseLocal(text);}
  document.getElementById('loading').classList.remove('show');
  if(mascot)mascot.classList.remove('focused');
  if(evs&&evs.length>0){
    if(S.user?.uid){for(const ev of evs){const fid=await window.FB.fbAddEvent(S.user.uid,ev);ev.id=fid;S.events.push(ev);}S.user.totalEvents=(S.user.totalEvents||0)+evs.length;await window.FB.fbSaveUser(S.user.uid,{totalEvents:S.user.totalEvents});}else{evs.forEach(e=>S.events.push(e));}
    evs.forEach(e=>addToTodo(e.title,e.id));saveState();updateAllViews();document.getElementById('aiInput').value='';document.querySelectorAll('.tag.active').forEach(t=>t.classList.remove('active'));
    toast('✨ '+evs.length+' événement'+(evs.length>1?'s':'')+' créé'+(evs.length>1?'s':'')+' !');
    setTimeout(()=>addXpV2(XP_GAINS.event_created*evs.length),200);checkBadgesV2();
  }else toast('⚠️ Reformule ta demande');
}
async function generateWithAI(text,key){
  const langName=LANG_NAMES[S.lang]||'Français';const breakMin=S.templateData.breakMin||10;const maxStudy=S.templateData.maxStudy||4;const today=new Date().toISOString().split('T')[0];
  const tplInfo=S.template==='student'&&S.templateData.courses?'Cours: '+S.templateData.courses.map(c=>c.subject+' J'+c.day+' '+c.start+'-'+c.end).join(', '):'Template: '+S.template;
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1500,system:'Tu es un planificateur expert. Génère des événements JSON STRICTEMENT.\nRègles: Jamais de chevauchement. Minimum '+breakMin+'min entre événements. Max '+maxStudy+'h révision/jour.\nRéponds UNIQUEMENT avec un tableau JSON: [{title,type(study/work/social/personal),date(YYYY-MM-DD),startTime(HH:MM),endTime(HH:MM),priority(critical/high/medium/low),duration(minutes)}]\nAujourd\'hui: '+today+'. '+tplInfo+'. Langue des titres: '+langName,messages:[{role:'user',content:'Génère des événements: '+text}]})});
    const d=await r.json();const raw=d.content?.[0]?.text||'[]';const match=raw.match(/\[[\s\S]*\]/);if(!match)return parseLocal(text);
    const parsed=JSON.parse(match[0]);return parsed.map(e=>({...e,id:Date.now()+Math.random(),date:new Date(e.date)}));
  }catch(err){return parseLocal(text);}
}
function parseLocal(text){
  const l=text.toLowerCase();const today=new Date();let type='personal',title='Activité',priority='medium';
  if(l.includes('révis')||l.includes('étude')||l.includes('exam')){type='study';title='Révision';priority='high';}
  else if(l.includes('sport')||l.includes('gym')){type='personal';title='Sport';}
  else if(l.includes('ami')){type='social';title='Avec des amis';}
  else if(l.includes('travail')||l.includes('réunion')){type='work';title='Travail';}
  else if(l.includes('rdv')||l.includes('médecin')){type='personal';title='Rendez-vous';}
  if(l.includes('urgent')||l.includes('rien révisé'))priority='critical';
  const hM=l.match(/(\d+)\s*h/i);const durMin=hM?+hM[1]*60:90;
  const dates=extractDates(l,today);const targets=dates.length?dates:[new Date(today.setDate(today.getDate()+1))];
  const breakMin=S.templateData.breakMin||10;
  return targets.map(date=>{
    const dayEvs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString());
    let lastEnd=9*60;dayEvs.forEach(e=>{const[eh,em]=e.endTime.split(':').map(Number);const endMin=eh*60+em;if(endMin>lastEnd)lastEnd=endMin;});
    const startMin=lastEnd+breakMin;const h=Math.floor(startMin/60);const m=startMin%60;const endMin=startMin+durMin;const eh=Math.floor(endMin/60);const em=endMin%60;
    return{id:Date.now()+Math.random(),title,type,date:new Date(date),startTime:pad(h)+':'+pad(m),endTime:pad(eh)+':'+pad(em),duration:durMin,priority};
  });
}
function pad(n){return String(n).padStart(2,'0');}
function extractDates(txt,base){
  const dates=[];
  const dm=txt.match(/dans\s*(\d+)\s*jours?/i);if(dm){const d=new Date(base);d.setDate(base.getDate()+parseInt(dm[1]));dates.push(d);}
  if(txt.includes('demain')){const d=new Date(base);d.setDate(base.getDate()+1);dates.push(d);}
  [[1,'lundi'],[2,'mardi'],[3,'mercredi'],[4,'jeudi'],[5,'vendredi'],[6,'samedi'],[0,'dimanche']].forEach(([wd,name])=>{if(txt.includes(name))dates.push(nextWeekday(wd));});
  return[...new Set(dates.map(d=>d.toDateString()))].map(ds=>new Date(ds));
}
function nextWeekday(day){const d=new Date();const diff=(day-d.getDay()+7)%7||7;d.setDate(d.getDate()+diff);return d;}

/* ═══ PLANNING ═══ */
function updatePlanning(){
  updateWeekLabel();
  const grid=document.getElementById('planningGrid');
  const today=new Date();const ws=new Date(today);ws.setDate(today.getDate()-today.getDay()+1+S.weekOffset*7);
  const dayNames=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const allEvs=getAllEventsForWeek(ws);
  let html='<div class="week-grid">';
  for(let i=0;i<7;i++){
    const day=new Date(ws);day.setDate(ws.getDate()+i);const isT=day.toDateString()===today.toDateString();
    const dayEvs=allEvs.filter(e=>new Date(e.date).toDateString()===day.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
    html+='<div class="day-col'+(isT?' today':'')+'" onclick="openDayDetail(new Date('+day.getTime()+'))" style="cursor:pointer"><div class="day-col-header"><div class="day-col-name">'+dayNames[i]+'</div><div class="day-col-num">'+day.getDate()+'</div></div><div class="day-col-body">';
    if(dayEvs.length){html+=dayEvs.map((e,idx)=>'<div class="event-card ev-'+e.type+' '+(e.tpl?'template-event':e.priority||'')+'" style="animation-delay:'+(idx*0.03)+'s" onclick="'+(e.tpl?'':'showEventDetail(\''+e.id+'\')')+'"><div class="ev-title">'+e.title+'</div><div class="ev-time">'+e.startTime+' – '+e.endTime+'</div></div>').join('');}
    else html+='<div class="ev-empty"><div class="es-icon" style="font-size:1.5rem;animation:esFloat 3s ease-in-out infinite">🌙</div><div style="font-size:.72rem;color:var(--t3);margin-top:.25rem">'+T('free')+'</div></div>';
    html+='</div></div>';
  }
  html+='</div>';grid.innerHTML=html;
  updateTodayUpcoming(today);
}
function getAllEventsForWeek(weekStart){
  const result=[...S.events];
  if(S.template==='student'&&S.templateData.courses){
    S.templateData.courses.forEach(c=>{for(let i=0;i<7;i++){const day=new Date(weekStart);day.setDate(weekStart.getDate()+i);const dow=day.getDay()===0?7:day.getDay();if(dow===c.day)result.push({id:'tpl_'+c.subject+'_'+day.toDateString(),title:'📚 '+c.subject,type:'study',date:new Date(day),startTime:c.start,endTime:c.end,priority:'medium',tpl:true});}});
  }
  return result;
}
function updateTodayUpcoming(today){
  const t0=new Date(today);t0.setHours(0,0,0,0);
  const te=S.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);return d.getTime()===t0.getTime();}).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const ue=S.events.filter(e=>{const d=new Date(e.date);d.setHours(0,0,0,0);return d>t0;}).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,10);
  document.getElementById('todayList').innerHTML=te.length?te.map(e=>'<div class="event-item ev-'+e.type+'" onclick="showEventDetail(\''+e.id+'\')"><div class="ei-title">'+e.title+'</div><div class="ei-sub">⏰ '+e.startTime+' – '+e.endTime+'</div></div>').join(''):'<div class="ev-empty" style="padding:1rem"><div class="es-icon" style="font-size:1.75rem;animation:esFloat 3s ease-in-out infinite">🌟</div><p class="hint-row" style="margin-top:.5rem">'+T('no_events')+'</p></div>';
  document.getElementById('upcomingList').innerHTML=ue.length?ue.map(e=>'<div class="event-item ev-'+e.type+'" onclick="showEventDetail(\''+e.id+'\')"><div class="ei-title">'+e.title+'</div><div class="ei-sub">📅 '+new Date(e.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})+' · '+e.startTime+'</div></div>').join(''):'<p class="hint-row">'+T('no_events')+'</p>';
}
function updateWeekLabel(){const wl=document.getElementById('weekLabel');if(!wl)return;wl.textContent=S.weekOffset===0?T('week_this'):S.weekOffset===1?T('week_next'):S.weekOffset===-1?T('week_prev'):'Sem. '+(S.weekOffset>0?'+':'')+S.weekOffset;}
function changeWeek(d){S.weekOffset+=d;updatePlanning();}

/* ═══ CALENDAR ═══ */
function updateCalendar(){
  const container=document.getElementById('monthCal');if(!container)return;
  const today=new Date();const target=new Date(today.getFullYear(),today.getMonth()+S.monthOffset,1);
  const ml=document.getElementById('monthLabel');if(ml)ml.textContent=target.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  const firstDay=new Date(target.getFullYear(),target.getMonth(),1);const lastDay=new Date(target.getFullYear(),target.getMonth()+1,0);
  const startOff=firstDay.getDay()===0?6:firstDay.getDay()-1;
  let html='<div class="cal-header">'+['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d=>'<div class="cal-wday">'+d+'</div>').join('')+'</div><div class="cal-body">';
  for(let i=0;i<startOff;i++)html+='<div class="cal-cell other"></div>';
  for(let d=1;d<=lastDay.getDate();d++){
    const date=new Date(target.getFullYear(),target.getMonth(),d);const isT=date.toDateString()===today.toDateString();
    const evs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).slice(0,4);
    html+='<div class="cal-cell'+(isT?' today':'')+'" onclick="openDayDetail(\''+date.toISOString()+'\')">'+'<div class="cal-dn">'+d+'</div>'+(evs.length?'<div class="cal-dots">'+evs.map(e=>'<div class="cal-dot cal-dot-'+(e.type||'study')+'"></div>').join('')+'</div>':'')+'</div>';
  }
  html+='</div>';container.innerHTML=html;
  container.classList.remove('slide-right','slide-left');void container.offsetWidth;container.classList.add('slide-'+S.monthDir);
  setTimeout(()=>container.classList.remove('slide-right','slide-left'),400);
}
function changeMonth(d){S.monthOffset+=d;S.monthDir=d>0?'right':'left';updateCalendar();}
function openDayDetail(dateStr){
  const date=dateStr instanceof Date?dateStr:new Date(dateStr);
  const evs=S.events.filter(e=>new Date(e.date).toDateString()===date.toDateString()).sort((a,b)=>a.startTime.localeCompare(b.startTime));
  const tplEvs=getAllEventsForWeek(getWeekStart(date)).filter(e=>e.tpl&&new Date(e.date).toDateString()===date.toDateString());
  const allEvs=[...tplEvs,...evs];const pl={critical:'🔴',high:'🟠',medium:'🟡',low:'🟢'};
  const dayNames=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];const months=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const title=dayNames[date.getDay()]+' '+date.getDate()+' '+months[date.getMonth()];
  let html='<div class="mf-header"><h3>📅 '+title+'</h3><button class="btn-icon" onclick="closeDayDetail()" style="font-size:1.2rem">✕</button></div>';
  if(allEvs.length===0){html+='<div class="empty-state"><div class="es-icon" style="font-size:2rem;animation:esFloat 3s ease-in-out infinite">🌟</div><h3>Journée libre !</h3><p class="txt2">Aucun événement prévu.</p></div>';}
  else{html+=allEvs.map(e=>'<div class="event-item ev-'+(e.type||'study')+'" onclick="'+(e.tpl?'':'showEventDetail(\''+e.id+'\')')+'"><div class="ei-title">'+(pl[e.priority]||'')+' '+e.title+'</div><div class="ei-sub">'+e.startTime+' – '+e.endTime+'</div></div>').join('');}
  html+='<button class="btn-primary" style="margin-top:1rem;width:100%" onclick="closeDayDetail();switchView(\'planning\');setTimeout(()=>{const ta=document.getElementById(\'aiInput\');if(ta){ta.focus();ta.value=\'Ajouter un événement le '+title+'\';}},300)">➕ Ajouter un événement</button>';
  document.getElementById('dayDetailContent').innerHTML=html;document.getElementById('dayDetailModal').classList.add('show');
}
function closeDayDetail(){document.getElementById('dayDetailModal').classList.remove('show');}
function getWeekStart(d){const ws=new Date(d);ws.setDate(d.getDate()-d.getDay()+1);ws.setHours(0,0,0,0);return ws;}


/* ═══ EVENT DETAIL / CRUD ═══ */
function showEventDetail(id){
  const ev=S.events.find(e=>String(e.id)===String(id));if(!ev)return;S.currentEventId=id;
  document.getElementById('evDetailTitle').textContent=ev.title;document.getElementById('evDetailDate').textContent=new Date(ev.date).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});document.getElementById('evDetailTime').textContent=ev.startTime+' – '+ev.endTime;document.getElementById('evDetailType').textContent=ev.type||'personal';document.getElementById('evDetailPriority').textContent=ev.priority||'medium';document.getElementById('evDetailDuration').textContent=(ev.duration||60)+' min';
  document.getElementById('eventDetailModal').classList.add('show');
}
function openEditEvent(){
  const ev=S.events.find(e=>String(e.id)===String(S.currentEventId));if(!ev)return;
  document.getElementById('editEvTitle').value=ev.title;document.getElementById('editEvDate').value=new Date(ev.date).toISOString().split('T')[0];document.getElementById('editEvStart').value=ev.startTime;document.getElementById('editEvEnd').value=ev.endTime;document.getElementById('editEvType').value=ev.type||'personal';document.getElementById('editEvPriority').value=ev.priority||'medium';
  document.getElementById('eventDetailModal').classList.remove('show');document.getElementById('editEventModal').classList.add('show');
}
async function saveEditEvent(){
  const ev=S.events.find(e=>String(e.id)===String(S.currentEventId));if(!ev)return;
  ev.title=document.getElementById('editEvTitle').value;ev.date=new Date(document.getElementById('editEvDate').value);ev.startTime=document.getElementById('editEvStart').value;ev.endTime=document.getElementById('editEvEnd').value;ev.type=document.getElementById('editEvType').value;ev.priority=document.getElementById('editEvPriority').value;
  if(S.user?.uid)await window.FB.fbUpdateEvent(S.user.uid,ev.id,ev);
  saveState();updateAllViews();closeModal('editEventModal');toast('✅ Événement modifié !');
}
async function deleteEvent(){
  if(!confirm('Supprimer cet événement ?'))return;
  const idx=S.events.findIndex(e=>String(e.id)===String(S.currentEventId));
  if(idx>-1){const ev=S.events.splice(idx,1)[0];if(S.user?.uid)await window.FB.fbDeleteEvent(S.user.uid,ev.id);}
  S.todos=S.todos.filter(t=>String(t.id)!==String(S.currentEventId));
  saveState();updateAllViews();closeModal('eventDetailModal');closeModal('editEventModal');toast('🗑️ Événement supprimé');
}

/* ═══ INSIGHTS ═══ */
function _iEl(id){return document.getElementById(id);}
function _delta(a,b){if(b===0)return{cls:'flat',ico:'—',txt:'—'};const p=Math.round(((a-b)/b)*100);if(p>0)return{cls:'up',ico:'↑',txt:'+'+p+'%'};if(p<0)return{cls:'down',ico:'↓',txt:p+'%'};return{cls:'flat',ico:'—',txt:'±0%'};}
function _weekEvents(offsetWeeks=0){const now=new Date();const dow=now.getDay();const mon=new Date(now);mon.setDate(now.getDate()-dow+1-(offsetWeeks*7));mon.setHours(0,0,0,0);const sun=new Date(mon);sun.setDate(mon.getDate()+6);sun.setHours(23,59,59,999);return S.events.filter(e=>{const d=e.date instanceof Date?e.date:new Date(e.date);return d>=mon&&d<=sun;});}
function updateInsightsIslands(){_buildInsStatCards();_buildInsChronosCard();_buildInsHeatmap();_buildInsCharts();_buildInsWow();}
function _buildInsStatCards(){
  const wrap=_iEl('insStatRow');if(!wrap)return;
  const cur=_weekEvents(0);const prev=_weekEvents(1);
  const curH=cur.reduce((s,e)=>s+(e.duration||60)/60,0);const prevH=prev.reduce((s,e)=>s+(e.duration||60)/60,0);
  const curStudy=cur.filter(e=>e.type==='study').length;const prevStudy=prev.filter(e=>e.type==='study').length;
  const cards=[{icon:'⏱️',val:Math.round(curH*10)/10+'h',label:'Cette semaine',d:_delta(curH,prevH),accent:'var(--orange)'},{icon:'📚',val:curStudy,label:'Sessions étude',d:_delta(curStudy,prevStudy),accent:'var(--blue)'},{icon:'🔥',val:S.streak+'j',label:'Streak actuel',d:{cls:'up',ico:'🔥',txt:'continu'},accent:'var(--amber)'},{icon:'⚡',val:S.xp+' XP',label:'XP total',d:{cls:'up',ico:'↑',txt:'Niveau '+S.level},accent:'var(--purple)'}];
  wrap.innerHTML=cards.map(c=>`<div class="ins-stat-card" style="--accent:${c.accent}"><span class="isc-icon">${c.icon}</span><div class="isc-val">${c.val}</div><div class="isc-label">${c.label}</div><div class="isc-delta ${c.d.cls}">${c.d.ico} ${c.d.txt}</div></div>`).join('');
}
async function _buildInsChronosCard(){
  const wrap=_iEl('insChronosCard');if(!wrap)return;
  wrap.innerHTML=`<div class="ins-chronos-card"><div class="icc-av">⚡</div><div class="icc-body"><div class="icc-name">Chronos</div><div class="icc-msg typing" id="iccMsg">Analyse en cours...</div></div></div>`;
  const key=localStorage.getItem('cf_apikey');if(!key){const m=_iEl('iccMsg');if(m){m.classList.remove('typing');m.textContent='Configure ta clé API dans Paramètres pour voir mes insights ✨';}return;}
  const cur=_weekEvents(0);const h=Math.round(cur.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  try{const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:80,system:'Tu es Chronos, assistant planning bienveillant. Réponds en '+(S.lang||'fr')+'. 1 phrase courte, max 20 mots, ton encourageant.',messages:[{role:'user',content:'Semaine: '+cur.length+' événements, '+h+'h planifiées, streak '+S.streak+'j, niveau '+S.level+'.'}]})});const d=await r.json();const txt=d.content?.[0]?.text||'';const m=_iEl('iccMsg');if(m&&txt){m.classList.remove('typing');_typeText(m,txt);}}catch(e){const m=_iEl('iccMsg');if(m){m.classList.remove('typing');m.textContent='Bonne semaine ! Continue comme ça 💪';}}
}
function _typeText(el,txt,i=0){if(i===0)el.textContent='';if(i<txt.length){el.textContent+=txt[i];setTimeout(()=>_typeText(el,txt,i+1),22);}}
function _buildInsHeatmap(){
  const wrap=_iEl('insHeatmap');if(!wrap)return;
  const now=new Date();const end=new Date(now);end.setDate(end.getDate()+(6-end.getDay()));const start=new Date(end);start.setDate(end.getDate()-364);
  const dayMap={};S.events.forEach(ev=>{if(!ev.date)return;const k=new Date(ev.date instanceof Date?ev.date:new Date(ev.date)).toDateString();dayMap[k]=(dayMap[k]||0)+(ev.duration||60)/60;});
  let cur=new Date(start);while(cur.getDay()!==0)cur.setDate(cur.getDate()+1);
  const cols=[];while(cur<=end){const week=[];for(let d=0;d<7;d++){const k=cur.toDateString();const h=dayMap[k]||0;const lv=h===0?0:h<1?1:h<3?2:h<5?3:4;const ds=cur.toLocaleDateString('fr',{day:'numeric',month:'short',year:'numeric'});week.push('<div class="hm-cell lv'+lv+'" title="'+ds+' — '+Math.round(h*10)/10+'h"></div>');cur.setDate(cur.getDate()+1);}cols.push(week.join(''));}
  wrap.innerHTML=`<div class="ins-heatmap-card"><div class="ins-card-header"><span class="ins-card-title">📅 Activité sur 52 semaines</span><span class="ins-card-sub">${Object.keys(dayMap).length} jours actifs</span></div><div class="heatmap-grid">${cols.join('')}</div><div class="hm-legend"><span>Moins</span><div class="hm-legend-cell lv0"></div><div class="hm-legend-cell lv1"></div><div class="hm-legend-cell lv2"></div><div class="hm-legend-cell lv3"></div><div class="hm-legend-cell lv4"></div><span>Plus</span></div></div>`;
}
function _buildInsCharts(){const wrap=_iEl('insChartsRow');if(!wrap)return;wrap.innerHTML='<div class="ins-chart-card" id="_xpGraphCard"></div><div class="ins-chart-card" id="_donutCard"></div>';_buildXpGraph();_buildDonutChart();}
function _buildXpGraph(){
  const wrap=_iEl('_xpGraphCard');if(!wrap)return;
  const now=new Date();const days=[];for(let i=29;i>=0;i--){const d=new Date(now);d.setDate(now.getDate()-i);days.push(d);}
  const vals=days.map(d=>{const evs=S.events.filter(e=>{const dd=e.date instanceof Date?e.date:new Date(e.date);return dd.toDateString()===d.toDateString();});return evs.reduce((s,e)=>s+(e.duration||60)/60,0)*10;});
  const maxV=Math.max(...vals,1);const W=380,H=110;const px=i=>Math.round(i*(W-20)/29)+10;const py=v=>Math.round(H-8-(v/maxV)*(H-18));
  const pts=vals.map((v,i)=>px(i)+','+py(v)).join(' ');const area='M'+px(0)+','+H+' '+vals.map((v,i)=>'L'+px(i)+','+py(v)).join(' ')+' L'+px(29)+','+H+' Z';
  const totalXp=vals.reduce((s,v)=>s+v,0);
  wrap.innerHTML=`<div class="ins-card-header"><span class="ins-card-title">⚡ XP sur 30 jours</span><span class="ins-card-sub" style="color:var(--orange);font-weight:800">+${Math.round(totalXp)} XP</span></div><svg class="xp-graph-svg" viewBox="0 0 ${W} ${H}" style="height:${H}px"><defs><linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="rgba(255,107,53,.35)"/><stop offset="100%" stop-color="rgba(255,107,53,0)"/></linearGradient></defs><path d="${area}" fill="url(#xpGrad)"/><polyline points="${pts}" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function _buildDonutChart(){
  const wrap=_iEl('_donutCard');if(!wrap)return;
  const types=[{key:'study',label:'Révision',color:'var(--blue)'},{key:'work',label:'Travail',color:'var(--purple)'},{key:'sport',label:'Sport',color:'var(--green)'},{key:'social',label:'Social',color:'#ec4899'},{key:'leisure',label:'Loisirs',color:'var(--amber)'},{key:'other',label:'Autre',color:'#6b7280'}];
  const counts={};let total=0;S.events.forEach(e=>{const k=e.type||'other';counts[k]=(counts[k]||0)+1;total++;});
  if(total===0){wrap.innerHTML='<div class="ins-card-header"><span class="ins-card-title">📊 Répartition</span></div><div style="color:var(--t3);font-size:.8rem;text-align:center;padding:1.5rem">Aucun événement</div>';return;}
  const R=48,r=30,cx=60,cy=60,τ=2*Math.PI;let angle=-Math.PI/2;
  const slices=types.map(t=>{const pct=(counts[t.key]||0)/total;const sweep=pct*τ;const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);angle+=sweep;const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);const lg=sweep>Math.PI?1:0;const xi=cx+r*Math.cos(angle-sweep),yi=cy+r*Math.sin(angle-sweep);const xj=cx+r*Math.cos(angle),yj=cy+r*Math.sin(angle);const path='M'+x1+','+y1+' A'+R+','+R+',0,'+lg+',1,'+x2+','+y2+' L'+xj+','+yj+' A'+r+','+r+',0,'+lg+',0,'+xi+','+yi+' Z';return{path,color:t.color,pct:Math.round(pct*100)};}).filter(s=>s.pct>0);
  const legend=types.filter(t=>(counts[t.key]||0)>0).map(t=>'<div class="donut-leg-row"><div class="donut-leg-dot" style="background:'+t.color+'"></div><span class="donut-leg-name">'+t.label+'</span><span class="donut-leg-pct">'+Math.round(((counts[t.key]||0)/total)*100)+'%</span></div>').join('');
  wrap.innerHTML='<div class="ins-card-header"><span class="ins-card-title">📊 Répartition</span><span class="ins-card-sub">'+total+' événements</span></div><div class="donut-wrap"><svg viewBox="0 0 120 120" style="width:110px;height:110px;flex-shrink:0">'+slices.map(s=>'<path d="'+s.path+'" fill="'+s.color+'" stroke="var(--s1)" stroke-width="1.5"/>').join('')+'<circle cx="'+cx+'" cy="'+cy+'" r="'+(r-2)+'" fill="var(--s1)"/><text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" fill="var(--t1)" font-size="11" font-weight="900">'+total+'</text></svg><div class="donut-legend">'+legend+'</div></div>';
}
function _buildInsWow(){
  const wrap=_iEl('insWow');if(!wrap)return;
  const cur=_weekEvents(0),prev=_weekEvents(1);
  const cH=Math.round(cur.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;const pH=Math.round(prev.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;
  const cS=cur.filter(e=>e.type==='study').length;const pS=prev.filter(e=>e.type==='study').length;
  const dH=_delta(cH,pH),dEv=_delta(cur.length,prev.length),dS=_delta(cS,pS);
  const metrics=[{label:'Heures planifiées',val:cH+'h',delta:dH},{label:'Événements',val:cur.length,delta:dEv},{label:'Sessions étude',val:cS,delta:dS},{label:'Streak',val:S.streak+'j',delta:{cls:'up',ico:'🔥',txt:'continu'}}];
  wrap.innerHTML='<div class="ins-wow-card"><div class="ins-card-header"><span class="ins-card-title">📈 Cette semaine vs semaine passée</span></div><div class="wow-grid">'+metrics.map(m=>'<div class="wow-metric"><div class="wow-metric-lbl">'+m.label+'</div><div class="wow-metric-val">'+m.val+'</div><div class="wow-delta '+m.delta.cls+'">'+m.delta.ico+' '+m.delta.txt+'</div></div>').join('')+'</div></div>';
}
function updateInsights(){updateInsightsIslands();}

/* ═══ TEMPLATES ═══ */
function updateTemplates(){
  const c=document.getElementById('templatesContent');if(!c)return;
  const tabs=['student','worker','custom'];const labels=['🎓 Étudiant','💼 Travailleur','✨ Personnalisé'];const idx=tabs.indexOf(S.template);
  let html='<div style="display:flex;position:relative;background:var(--s2);padding:4px;border-radius:12px;border:1px solid var(--b1);margin:0 auto 1.5rem;max-width:500px"><div id="tplSlider" style="position:absolute;top:4px;left:4px;width:calc(33.33% - 2.67px);height:calc(100% - 8px);background:var(--primary);border-radius:8px;transition:transform .35s cubic-bezier(.16,1,.3,1);z-index:0;transform:translateX('+idx*100+'%)"></div>'+tabs.map((t,i)=>'<button style="flex:1;padding:.6rem 1rem;border:none;background:transparent;border-radius:8px;font-weight:600;font-size:.85rem;cursor:pointer;color:'+(S.template===t?'white':'var(--t2)')+';font-family:inherit;position:relative;z-index:1;transition:color .25s" onclick="switchTemplate(\''+t+'\')">'+labels[i]+'</button>').join('')+'</div>';
  if(S.template==='student'){html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">🎓 Configuration Étudiant</h3><div class="tpl-limits"><div class="form-group"><label>Max révision/jour (h)</label><input type="number" id="tplMaxStudy" value="'+(S.templateData.maxStudy||4)+'" min="1" max="16"></div><div class="form-group"><label>Max loisirs/jour (h)</label><input type="number" id="tplMaxLeisure" value="'+(S.templateData.maxLeisure||3)+'" min="0" max="16"></div><div class="form-group"><label>Pause entre événements (min)</label><input type="number" id="tplBreak" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><div id="tplCC" style="margin-bottom:.75rem">'+((S.templateData.courses||[]).length===0?'<div class="course-row"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>':(S.templateData.courses||[]).map(course=>'<div class="course-row"><select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'" '+(course.day===i+1?'selected':'')+'>'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="'+(course.start||'08:00')+'" step="300"><input type="time" class="tinp" value="'+(course.end||'10:00')+'" step="300"><input type="text" class="sinp" value="'+(course.subject||'')+'" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button></div>').join(''))+'</div><button class="btn-secondary" onclick="addTplCourse()" style="margin-bottom:.75rem">+ Ajouter un cours</button><button class="btn-primary" onclick="saveTplStudent()">Enregistrer</button></div>';}
  else if(S.template==='worker'){html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">💼 Configuration Travailleur</h3><div class="tpl-limits"><div class="form-group"><label>Début</label><input type="time" id="tplWS" value="'+(S.templateData.workStart||'09:00')+'" step="300"></div><div class="form-group"><label>Fin</label><input type="time" id="tplWE" value="'+(S.templateData.workEnd||'18:00')+'" step="300"></div><div class="form-group"><label>Max travail/j (h)</label><input type="number" id="tplMaxWork" value="'+(S.templateData.maxWork||8)+'" min="1" max="16"></div><div class="form-group"><label>Pause (min)</label><input type="number" id="tplBreakW" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><button class="btn-primary" onclick="saveTplWorker()">Enregistrer</button></div>';}
  else{html+='<div class="template-form-card"><h3 style="margin-bottom:1rem">✨ Mode Personnalisé</h3><div class="tpl-limits"><div class="form-group"><label>Max révision/j (h)</label><input type="number" id="tplMaxStudyC" value="'+(S.templateData.maxStudy||4)+'" min="0" max="16"></div><div class="form-group"><label>Max loisirs/j (h)</label><input type="number" id="tplMaxLeisureC" value="'+(S.templateData.maxLeisure||3)+'" min="0" max="16"></div><div class="form-group"><label>Pause (min)</label><input type="number" id="tplBreakC" value="'+(S.templateData.breakMin||10)+'" min="5" max="60" step="5"></div></div><p class="txt2" style="margin-top:.5rem">Utilise l\'IA pour planifier librement.</p><button class="btn-primary" onclick="saveTplCustom()" style="margin-top:.75rem">Enregistrer</button></div>';}
  c.innerHTML=html;
}
function switchTemplate(id){S.template=id;saveState();updateTemplates();updatePlanning();toast('✅ Template changé');}
function addTplCourse(){const c=document.getElementById('tplCC');if(!c)return;const row=document.createElement('div');row.className='course-row';row.innerHTML='<select class="sel">'+['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'].map((d,i)=>'<option value="'+(i+1)+'">'+d+'</option>').join('')+'</select><input type="time" class="tinp" value="08:00" step="300"><input type="time" class="tinp" value="10:00" step="300"><input type="text" class="sinp" placeholder="Matière"><button class="btn-remove" onclick="this.parentElement.remove()">✕</button>';c.appendChild(row);}
function saveTplStudent(){const rows=document.querySelectorAll('#tplCC .course-row');S.templateData.courses=Array.from(rows).map(r=>({day:+r.querySelector('.sel').value,start:r.querySelectorAll('.tinp')[0].value,end:r.querySelectorAll('.tinp')[1].value,subject:r.querySelector('.sinp').value})).filter(c=>c.subject);S.templateData.maxStudy=+(document.getElementById('tplMaxStudy')?.value)||4;S.templateData.maxLeisure=+(document.getElementById('tplMaxLeisure')?.value)||3;S.templateData.breakMin=+(document.getElementById('tplBreak')?.value)||10;saveState();updatePlanning();toast('✅ Template sauvegardé !');}
function saveTplWorker(){S.templateData.workStart=document.getElementById('tplWS')?.value||'09:00';S.templateData.workEnd=document.getElementById('tplWE')?.value||'18:00';S.templateData.maxWork=+(document.getElementById('tplMaxWork')?.value)||8;S.templateData.breakMin=+(document.getElementById('tplBreakW')?.value)||10;saveState();toast('✅ Template sauvegardé !');}
function saveTplCustom(){S.templateData.maxStudy=+(document.getElementById('tplMaxStudyC')?.value)||4;S.templateData.maxLeisure=+(document.getElementById('tplMaxLeisureC')?.value)||3;S.templateData.breakMin=+(document.getElementById('tplBreakC')?.value)||10;saveState();toast('✅ Sauvegardé !');}

/* ═══ BADGES VIEW ═══ */
function updateBadges(){
  checkBadgesV2();updateXpBar();
  const g=document.getElementById('badgeGrid');if(!g)return;
  g.innerHTML=ALL_BADGES.map(b=>{const u=b.cond();return'<div class="badge-card '+(u?'unlocked':'locked')+'" '+(u?'':'data-tooltip="'+b.desc+'"')+'><span class="badge-emoji">'+b.emoji+'</span><div class="badge-name">'+b.name+'</div><div class="badge-desc">'+b.desc+'</div><span class="badge-xp">+'+b.xp+' XP</span>'+(u?'<span class="badge-msg">"'+b.msg+'"</span>':'<div class="badge-lock">🔒</div>')+'</div>';}).join('');
}

/* ═══ RANK MODAL ═══ */
function openRankModal(){
  const cur=getRank(S.level);
  document.getElementById('rankModalContent').innerHTML=RANKS.map(r=>{const reached=S.level>=r.minLv;const isCur=r.name===cur.name;return'<div class="rank-row'+(isCur?' current':'')+(reached?'':' locked')+'" style="border-left:4px solid '+(reached?r.color:'var(--b1)')+'"><div class="rank-icon">'+r.icon+'</div><div class="rank-info"><strong>'+r.name+'</strong><small>Niv. '+r.minLv+(r.maxLv<999?'–'+r.maxLv:'+')+' </small></div><div class="rank-xp-badge" style="'+(reached?'background:'+r.color+'22;color:'+r.color:'')+'">'+(reached?'✅ Atteint':'Niv. '+r.minLv+' · '+totalXpForLv(r.minLv)+' XP total')+'</div></div>';}).join('');
  document.getElementById('rankModal').classList.add('show');
}
function closeRankModal(){document.getElementById('rankModal').classList.remove('show');}

/* ═══ PROFILE ═══ */
function updateProfile(){
  if(!S.user)return;
  document.getElementById('profileName').textContent=S.user.name;document.getElementById('profileEmail').textContent=S.user.email||'';document.getElementById('profileNameInput').value=S.user.name;document.getElementById('profileEmailInput').value=S.user.email||'';
  const ev=document.getElementById('statEvents');const se=document.getElementById('statStreak');const sh=document.getElementById('statHours');const sb=document.getElementById('statBadges');
  if(ev)animateCounter(ev,0,S.user.totalEvents||0,600);if(se)animateCounter(se,0,S.streak,400);if(sh)animateCounter(sh,0,Math.round(S.events.reduce((s,e)=>s+(e.duration||60)/60,0)),500);if(sb)animateCounter(sb,0,ALL_BADGES.filter(b=>b.cond()).length,450);
  if(S.user.avatar){document.getElementById('profileAvImg').src=S.user.avatar;document.getElementById('profileAvImg').style.display='block';document.getElementById('profileAvEmoji').style.display='none';}
  updateRankDisplays();
}
async function saveProfile(){
  if(!S.user)return;S.user.name=document.getElementById('profileNameInput').value;updateHeader();updateProfile();toast('✅ Profil sauvegardé');saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{name:S.user.name});
}
function handleAvatarChange(inp){
  const f=inp.files[0];if(!f)return;const rd=new FileReader();
  rd.onload=async e=>{S.user.avatar=e.target.result;updateHeader();updateProfile();toast('✅ Photo mise à jour');saveState();if(S.user?.uid)window.FB.fbSaveUser(S.user.uid,{avatar:S.user.avatar});};
  rd.readAsDataURL(f);
}

/* ═══ SETTINGS ═══ */
function saveApiKey(){const k=document.getElementById('apiKeyInput')?.value?.trim();if(!k||k.startsWith('••••'))return;localStorage.setItem('cf_apikey',k);document.getElementById('apiKeyInput').value='••••'+k.slice(-4);toast('✅ Clé API enregistrée');}
function requestPasswordChange(){document.getElementById('pwdEmail').textContent=S.user.email;document.getElementById('passwordModal').classList.add('show');}
async function confirmPasswordChange(){
  const currentPwd=document.getElementById('pwdCode').value;const np=document.getElementById('pwdNew').value;
  if(!currentPwd||!np){toast('⚠️ '+T('error_field'));return;}if(np.length<6){toast('⚠️ '+T('error_pwd'));return;}
  try{await window.FB.fbChangePassword(currentPwd,np);toast('✅ Mot de passe changé');closeModal('passwordModal');}catch(e){const msg=e.code==='auth/wrong-password'?'Mot de passe actuel incorrect':e.message;toast('❌ '+msg);}
}
function exportData(){const exportable={user:S.user,events:S.events,template:S.template,templateData:S.templateData,xp:S.xp,level:S.level,streak:S.streak,theme:S.theme,lang:S.lang};const blob=new Blob([JSON.stringify(exportable,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='chronoflow_'+new Date().toISOString().split('T')[0]+'.json';a.click();toast('✅ Exporté');}
async function deleteAccount(){if(!confirm('Supprimer définitivement ton compte et toutes tes données ?'))return;try{if(S.user?.uid)await window.FB.fbDeleteAccount(S.user.uid);localStorage.clear();location.reload();}catch(e){toast('❌ '+e.message+' — Reconnecte-toi et réessaie.');}}


/* ═══ SESSION DE RÉVISION ═══ */
function openSessionLauncher(){const now=new Date();const study=S.events.find(e=>e.type==='study'&&new Date(e.date).toDateString()===now.toDateString());if(study){document.getElementById('sessHours').value=Math.round((study.duration||120)/60*10)/10||2;}document.getElementById('sessionModal').classList.add('show');}
function launchSession(){
  const hours=parseFloat(document.getElementById('sessHours').value)||2;const workMin=parseInt(document.getElementById('sessWorkMin').value)||55;const breakMin=parseInt(document.getElementById('sessBreakMin').value)||5;
  closeModal('sessionModal');S.sessionWorkSec=workMin*60;S.sessionBreakSec=breakMin*60;S.sessionTotalSec=Math.round(hours*3600);S.sessionElapsed=0;S.sessionPhase='work';S.sessionPhaseIdx=0;S.sessionActive=true;S.sessionSkipCount=0;S.sessionCurrentPhaseSec=workMin*60;S.sessionPhaseElapsed=0;
  document.getElementById('sessionScreen').style.display='flex';document.getElementById('appScreen').style.display='none';document.getElementById('arcFill').classList.remove('pause-mode');document.getElementById('arcFill').style.strokeDashoffset='503';
  updateSessionDisplay();startSessionTick();addXpV2(5);syncAllKoros();
  // Chronos focus en session
  const sm=document.querySelector('.session-mascot');if(sm){sm.classList.add('focused');}
}
function startSessionTick(){
  if(S.sessionTimer)clearInterval(S.sessionTimer);
  S.sessionTimer=setInterval(()=>{
    S.sessionElapsed++;S.sessionPhaseElapsed++;
    if(S.sessionElapsed>=S.sessionTotalSec){endSession();return;}
    const remaining=S.sessionCurrentPhaseSec-S.sessionPhaseElapsed;
    if(remaining<=0){switchPhase();return;}
    if(S.sessionPhase==='break'&&remaining===10){startBeepCountdown();if(S.notifications)sendNotif('Chronos ⚡','Reprends dans 10 secondes !');}
    updateSessionDisplay();
  },1000);
}
function switchPhase(){
  if(S.sessionPhase==='work'){S.sessionPhase='break';S.sessionCurrentPhaseSec=S.sessionBreakSec;S.sessionPhaseElapsed=0;document.getElementById('arcFill').classList.add('pause-mode');if(S.notifications)sendNotif('Chronos ⚡','Pause ! Repose-toi '+Math.round(S.sessionBreakSec/60)+' minutes. 😊');toast('☕ Pause ! Repose-toi bien.');if(S.soundEnabled)playBeep(660,0.2);}
  else{S.sessionPhase='work';S.sessionPhaseIdx++;S.sessionCurrentPhaseSec=S.sessionWorkSec;S.sessionPhaseElapsed=0;document.getElementById('arcFill').classList.remove('pause-mode');if(S.notifications)sendNotif('Chronos ⚡','Reprends le travail ! 💪');toast('💪 C\'est reparti !');if(S.soundEnabled)playBeep(880,0.2);}
}
function startBeepCountdown(){if(sessionBeepInterval)clearInterval(sessionBeepInterval);let count=10;sessionBeepInterval=setInterval(()=>{if(S.soundEnabled)playBeep(440,0.1);if(--count<=0)clearInterval(sessionBeepInterval);},1000);}
function updateSessionDisplay(){
  const remaining=Math.max(0,S.sessionCurrentPhaseSec-S.sessionPhaseElapsed);const h=Math.floor(remaining/3600);const m=Math.floor((remaining%3600)/60);const s2=remaining%60;
  document.getElementById('sessionTimeDisplay').textContent=pad(h)+':'+pad(m)+':'+pad(s2);
  const arc=document.getElementById('arcFill');const pct=Math.min(1,S.sessionPhaseElapsed/S.sessionCurrentPhaseSec);arc.style.strokeDashoffset=440*(1-pct);
  const st=document.getElementById('sessionStatusTxt');if(st)st.textContent=S.sessionPhase==='work'?T('work_phase'):T('break_phase');
  const totalPhases=Math.max(1,Math.ceil(S.sessionTotalSec/S.sessionWorkSec));
  document.getElementById('sessionPhaseLabel').textContent=T('session_phase')+' '+(S.sessionPhaseIdx+1)+'/'+totalPhases;
  document.getElementById('sessionBreakLabel').textContent=T('break_label')+' : '+Math.round(S.sessionBreakSec/60)+' min';
}
function toggleSession(){if(S.sessionTimer){clearInterval(S.sessionTimer);S.sessionTimer=null;document.getElementById('sessPlayPause').textContent='▶ Reprendre';}else{startSessionTick();document.getElementById('sessPlayPause').textContent='⏸ Pause';}}
function skipPhase(){S.sessionSkipCount=(S.sessionSkipCount||0);const maxSkips=Math.ceil(S.sessionTotalSec/S.sessionWorkSec);if(S.sessionSkipCount>=maxSkips){toast('⚠️ Limite de skips atteinte !');return;}S.sessionSkipCount++;switchPhase();updateSessionDisplay();}
function tryExitSession(){const m=document.getElementById('exitSessionModal');if(m)m.classList.add('show');}
function stayInSession(){closeModal('exitSessionModal');}
function confirmExitSession(){closeModal('exitSessionModal');endSession();}
function endSession(){
  S.sessionActive=false;if(S.sessionTimer){clearInterval(S.sessionTimer);S.sessionTimer=null;}if(sessionBeepInterval){clearInterval(sessionBeepInterval);sessionBeepInterval=null;}
  document.getElementById('sessionScreen').style.display='none';document.getElementById('appScreen').style.display='flex';
  toast('✅ Session terminée ! Bien joué !');if(S.soundEnabled)playSound('levelup');
  addXpV2(20);checkBadgesV2();
}

/* ═══ VOICE ═══ */
function startVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast('⚠️ Navigateur non supporté');return;}
  const r=new SR();r.lang=(S.lang||'fr')+'-'+(S.lang||'fr').toUpperCase();r.interimResults=true;
  document.getElementById('voiceTranscript').textContent='';document.getElementById('voiceStatus').textContent='Parle...';document.getElementById('voiceConfirm').style.display='none';
  document.getElementById('voiceModal').classList.add('show');document.getElementById('voiceBtn').classList.add('recording');
  r.onresult=e=>{const tx=Array.from(e.results).map(r=>r[0].transcript).join('');document.getElementById('voiceTranscript').textContent=tx;S.voiceText=tx;if(e.results[0].isFinal){document.getElementById('voiceStatus').textContent='✅ Reconnu';document.getElementById('voiceConfirm').style.display='block';}};
  r.onerror=()=>{document.getElementById('voiceStatus').textContent='❌ Erreur';document.getElementById('voiceBtn').classList.remove('recording');};
  r.onend=()=>document.getElementById('voiceBtn').classList.remove('recording');
  r.start();S.recognition=r;
}
function stopVoice(){if(S.recognition)S.recognition.stop();document.getElementById('voiceModal').classList.remove('show');document.getElementById('voiceBtn').classList.remove('recording');}
function confirmVoice(){if(S.voiceText)document.getElementById('aiInput').value=S.voiceText;stopVoice();toast('✅ Texte ajouté');}

/* ═══ WEEKLY REVIEW ═══ */
function checkWeeklyReview(){
  const now=new Date();const weekStart=new Date(now);weekStart.setDate(now.getDate()-now.getDay()+1);weekStart.setHours(0,0,0,0);
  const weekKey='cf_week_'+weekStart.toISOString().split('T')[0];if(localStorage.getItem(weekKey))return;localStorage.setItem(weekKey,'seen');setTimeout(()=>openWeeklyReview(),1500);
}
function openWeeklyReview(){
  const now=new Date();const weekStart=new Date(now);weekStart.setDate(now.getDate()-7);weekStart.setHours(0,0,0,0);
  const weekEvs=S.events.filter(e=>{const d=new Date(e.date);return d>=weekStart&&d<=now;});
  const weekH=Math.round(weekEvs.reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;const studyH=Math.round(weekEvs.filter(e=>e.type==='study').reduce((s,e)=>s+(e.duration||60)/60,0)*10)/10;const daysActive=new Set(weekEvs.map(e=>new Date(e.date).toDateString())).size;
  document.getElementById('wrStatsGrid').innerHTML=`<div class="wr-stat"><span class="wr-stat-val">${weekH}h</span><span class="wr-stat-label">Heures planifiées</span></div><div class="wr-stat"><span class="wr-stat-val">${studyH}h</span><span class="wr-stat-label">Révision</span></div><div class="wr-stat"><span class="wr-stat-val">${weekEvs.length}</span><span class="wr-stat-label">Événements</span></div><div class="wr-stat"><span class="wr-stat-val">${daysActive}/7</span><span class="wr-stat-label">Jours actifs</span></div><div class="wr-stat"><span class="wr-stat-val">${S.streak}</span><span class="wr-stat-label">Streak 🔥</span></div><div class="wr-stat"><span class="wr-stat-val">Niv.${S.level}</span><span class="wr-stat-label">Niveau</span></div>`;
  const feedback=weekH>=20?'🔥 Excellente semaine ! Tu as planifié '+weekH+'h — tu es dans le top !':weekH>=10?'👍 Bonne semaine avec '+weekH+'h planifiées. Continue sur cette lancée !':weekH>=5?'📈 Semaine modérée avec '+weekH+'h. La semaine prochaine, essaie de viser 10h+ !':'💡 Semaine légère ('+weekH+'h). Commence doucement — même 30min/jour font une grande différence !';
  document.getElementById('wrFeedback').textContent=feedback;
  const advice=daysActive>=5?"💡 Pour la semaine prochaine : maintiens cette régularité ! Planifie tes sessions à l'avance pour ne pas perdre ton élan.":"💡 Pour la semaine prochaine : essaie de planifier au moins 5 jours actifs. Utilise la génération IA pour créer ton planning en un clic !";
  document.getElementById('wrAdvice').textContent=advice;
  document.getElementById('weeklyReviewModal').classList.add('show');
}
function closeWeeklyReview(){document.getElementById('weeklyReviewModal').classList.remove('show');}

/* ═══ TODO LIST ═══ */
function addToTodo(title,eventId){const id=eventId||('todo_'+Date.now()+Math.random());if(S.todos.find(t=>t.id===String(id)))return;S.todos.push({id:String(id),title,done:false,createdAt:new Date().toISOString()});saveState();updateTodoList();}
function toggleTodo(id){const t=S.todos.find(t=>t.id===String(id));if(!t)return;t.done=!t.done;saveState();updateTodoList();if(t.done){toast('✅ '+t.title+' — Bien joué !');addXpV2(5);}}
function removeTodo(id){S.todos=S.todos.filter(t=>t.id!==String(id));saveState();updateTodoList();}
function addManualTodo(){const inp=document.getElementById('todoManualInput');if(!inp)return;const val=inp.value.trim();if(!val){toast('⚠️ Écris quelque chose !');return;}addToTodo(val);inp.value='';inp.focus();toast('✅ Ajouté à la to-do list !');}
function updateTodoList(){
  const container=document.getElementById('todoListContainer');if(!container)return;
  const countEl=document.getElementById('todoCount');if(countEl){const pending=S.todos.filter(t=>!t.done).length;countEl.textContent=pending;countEl.style.background=pending>0?'var(--primary)':'var(--green)';}
  const pending=S.todos.filter(t=>!t.done);const done=S.todos.filter(t=>t.done);const all=[...pending,...done];
  if(all.length===0){container.innerHTML='<div class="todo-empty"><span>🎉</span><p>Tout est fait !</p></div>';return;}
  container.innerHTML=all.map(t=>`<div class="todo-item${t.done?' todo-done':''}" id="todo_${t.id}" onclick="toggleTodo('${t.id}')"><div class="todo-check${t.done?' checked':'"'}}">${t.done?'<svg viewBox="0 0 12 10" fill="none"><path d="M1 5l3 4L11 1" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':''}</div><span class="todo-title">${t.title}</span><button class="todo-del" onclick="event.stopPropagation();removeTodo('${t.id}')" title="Supprimer">✕</button></div>`).join('');
}

/* ═══ CHRONOS IMMERSIF ═══ */
let speechTimeout=null;
function chronosSpeak(msg,duration=4000){
  let bubble=document.getElementById('chronosSpeechBubble');
  if(!bubble){bubble=document.createElement('div');bubble.id='chronosSpeechBubble';bubble.className='chronos-speech';document.body.appendChild(bubble);}
  bubble.textContent=msg;bubble.classList.add('show');clearTimeout(speechTimeout);speechTimeout=setTimeout(()=>bubble.classList.remove('show'),duration);
}
function chronosTimeGreeting(){
  const h=new Date().getHours();
  const msgs={fr:{morning:'☀️ Bonne matinée ! Prêt à planifier ?',lunch:'🍽️ Pause déjeuner bien méritée !',afternoon:"⚡ L'après-midi, c'est pour les productifs !",evening:'🌙 Soirée de révision ? Je suis là !',night:'🌟 Tu travailles tard ! Courage !'},en:{morning:'☀️ Good morning! Ready to plan?',lunch:'🍽️ Well-deserved lunch break!',afternoon:'⚡ Afternoon is for the productive ones!',evening:'🌙 Evening study session? I\'m here!',night:'🌟 Working late! Courage!'}};
  const m=msgs[S.lang]||msgs.fr;
  if(h>=5&&h<12)chronosSpeak(m.morning,5000);else if(h>=12&&h<14)chronosSpeak(m.lunch,4000);else if(h>=14&&h<18)chronosSpeak(m.afternoon,4000);else if(h>=18&&h<22)chronosSpeak(m.evening,4000);else chronosSpeak(m.night,4000);
}
function chronosCelebrateBadge(badgeName){
  const mascot=document.getElementById('mascot');if(!mascot)return;
  mascot.classList.add('celebrate');setTimeout(()=>mascot.classList.remove('celebrate'),1200);
  chronosSpeak('🏅 Badge débloqué : '+badgeName+' ! Bravo !',5000);spawnConfetti();if(S.soundEnabled)playSound('badge');
}
function chronosXpReact(xpGained){
  const mascot=document.getElementById('mascot');if(!mascot)return;
  mascot.classList.add('xp-react');setTimeout(()=>mascot.classList.remove('xp-react'),700);
  if(xpGained>=50)chronosSpeak('⚡ +'+xpGained+' XP ! Excellent !',3000);
  if(S.soundEnabled&&xpGained>0)playSound('xp');
}
function chronosStreakReact(streak){
  const mascot=document.getElementById('mascot');if(!mascot)return;
  if(streak>0&&streak%7===0){mascot.classList.add('streak-glow');setTimeout(()=>mascot.classList.remove('streak-glow'),4000);chronosSpeak('🔥 '+streak+' jours de streak ! Légendaire !',5000);spawnConfetti();}
}

/* ═══ CONFETTI ═══ */
function spawnConfetti(){
  const wrap=document.createElement('div');wrap.className='confetti-wrap';document.body.appendChild(wrap);
  const colors=['#FF6B35','#FFD700','#6366f1','#10B981','#F59E0B','#EC4899'];
  for(let i=0;i<60;i++){const p=document.createElement('div');p.className='confetti-p';p.style.cssText='left:'+Math.random()*100+'%;background:'+colors[Math.floor(Math.random()*colors.length)]+';animation-duration:'+(1.5+Math.random()*2)+'s;animation-delay:'+Math.random()*.5+'s;width:'+(6+Math.random()*8)+'px;height:'+(6+Math.random()*8)+'px;border-radius:'+(Math.random()>.5?'50%':'3px')+';';wrap.appendChild(p);}
  setTimeout(()=>wrap.remove(),4000);
}

/* ═══ MOUSE TRACKING ═══ */
function initMouseTracking(){
  document.addEventListener('mousemove',e=>{
    document.querySelectorAll('.ch-eye').forEach(eye=>{
      const rect=eye.getBoundingClientRect();const cx=rect.left+rect.width/2;const cy=rect.top+rect.height/2;
      const dx=e.clientX-cx;const dy=e.clientY-cy;const dist=Math.sqrt(dx*dx+dy*dy);
      const maxMove=3;const x=dist>0?(dx/dist)*Math.min(dist*.15,maxMove):0;const y=dist>0?(dy/dist)*Math.min(dist*.15,maxMove):0;
      const pupil=eye.querySelector('.ch-pupil');if(pupil){pupil.style.transform='translate('+x+'px, '+y+'px)';}
    });
  });
}

/* ═══ CHRONOS V2 ═══ */
function checkBadgesV2(){const before=new Set(unlockedBadges);checkBadges();ALL_BADGES.forEach(b=>{if(!before.has(b.id)&&unlockedBadges.has(b.id))setTimeout(()=>chronosCelebrateBadge(b.name),400);});}
function addXpV2(n){addXp(n);chronosXpReact(n);}
function launchAppV2(){
  setTimeout(chronosTimeGreeting,2200);
  setTimeout(initMouseTracking,500);
  const TIPS=['💡 Conseil : planifie tes révisions en blocs de 25min !','🎯 Objectif de la semaine : battre ton streak !','📚 Tu as des événements non révisés cette semaine ?','⚡ Une session de 20min maintenant vaut 1h demain !','🌟 Niveau '+(S.level||1)+' — tu es presque au prochain !'];
  setInterval(()=>{const tip=TIPS[Math.floor(Math.random()*TIPS.length)];chronosSpeak(tip,5000);},8*60*1000);
}

/* ═══ ANIMATIONS CHRONOS ═══ */
function animateChronosClick(){const mascot=document.getElementById('mascot');if(!mascot)return;mascot.classList.add('clicked');setTimeout(()=>mascot.classList.remove('clicked'),600);}
function chronosSad(){const mascot=document.getElementById('mascot');if(!mascot)return;mascot.classList.remove('clicked');mascot.classList.add('sad');setTimeout(()=>mascot.classList.remove('sad'),5000);}

/* ═══ LEVEL UP NOTIF ═══ */
function showLevelUpNotif(level,reward){
  const n=document.getElementById('lvlupNotif');if(!n)return;
  const t=document.getElementById('lvlupTitle');const s2=document.getElementById('lvlupSub');
  if(t)t.textContent='⬆️ Niveau '+level+' !';if(s2)s2.textContent=reward?'Tu débloqueras '+reward+' pour Chronos !':'Continue comme ça ! 💪';
  const k=document.getElementById('lvlupKoro');if(k){const rank=getRank(level);k.style.background=rank.cls.includes('gold')?'radial-gradient(circle at 35% 35%,#ffe680,#FFD700)':rank.cls.includes('diamond')?'radial-gradient(circle at 35% 35%,#d4faff,#B9F2FF)':rank.cls.includes('master')?'radial-gradient(circle at 35% 35%,#c17ee8,#9B59B6)':rank.cls.includes('legend')?'radial-gradient(circle at 35% 35%,#ff8c55,#FF4500)':'radial-gradient(circle at 35% 35%,#ffe680,#ffd000)';}
  n.style.display='flex';void n.offsetWidth;n.classList.add('show');
  if(S.soundEnabled)playSound('levelup');spawnConfetti();
  setTimeout(()=>{n.classList.remove('show');setTimeout(()=>n.style.display='none',400);},4000);
}

/* ═══ SYNC KOROS ═══ */
function syncAllKoros(){updateMascot();}

/* ═══ SPY MODE SCROLL ═══ */
(function(){let spyTimeout;const content=document.getElementById('mainContent');if(content){content.addEventListener('scroll',function(){const mascot=document.getElementById('mascot');if(!mascot)return;mascot.classList.add('spy-mode');clearTimeout(spyTimeout);spyTimeout=setTimeout(()=>mascot.classList.remove('spy-mode'),1800);});}window.addEventListener('scroll',function(){const mascot=document.getElementById('mascot');if(!mascot)return;mascot.classList.add('spy-mode');clearTimeout(spyTimeout);spyTimeout=setTimeout(()=>mascot.classList.remove('spy-mode'),1800);});})();

/* ═══ UTILS ═══ */
function toast(msg){const el=document.getElementById('toast');const me=document.getElementById('toastMsg');if(!el||!me)return;me.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500);}
function closeModal(id){document.getElementById(id)?.classList.remove('show');}
function togglePw(inputId,btn){const inp=document.getElementById(inputId);if(!inp)return;if(inp.type==='password'){inp.type='text';btn.textContent='🙈';}else{inp.type='password';btn.textContent='👁';}}
function cfNum(id,step,min,max){const el=document.getElementById(id);if(!el)return;let v=parseFloat(el.value)||0;v+=step;v=Math.max(min,Math.min(max,Math.round(v*100)/100));el.value=v;}

/* ═══ STORAGE ═══ */
function saveState(){
  localStorage.setItem('cf_lang',S.lang);localStorage.setItem('cf_theme',S.theme);localStorage.setItem('cf_equipped',S.equippedItem);localStorage.setItem('cf_sound',S.soundEnabled);
  if(S.user?.uid&&window.FB){window.FB.fbSaveUser(S.user.uid,{xp:S.xp,level:S.level,totalXpEarned:S.totalXpEarned,streak:S.streak,lastUsedDate:S.lastUsedDate,tutorialDone:S.tutorialDone,template:S.template,templateData:S.templateData,theme:S.theme,lang:S.lang,notifications:S.notifications,equippedItem:S.equippedItem,soundEnabled:S.soundEnabled,totalEvents:S.user?.totalEvents||0,name:S.user?.name||'',avatar:S.user?.avatar||'',unlockedBadges:[...unlockedBadges],todos:S.todos}).catch(e=>console.error('saveState error:',e));}
}
function loadState(){return false;}

window.CF={S,saveState,toast,T};

