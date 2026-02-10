# CAHIER DES CHARGES - ChronoFlow

## 📋 INFORMATIONS GÉNÉRALES

**Nom du projet :** ChronoFlow  
**Type :** Application web de planification intelligente avec IA  
**Version :** 4.0  
**Date :** Février 2026  
**Cible :** Étudiants, travailleurs, particuliers  
**Technologie :** Frontend uniquement (HTML/CSS/JavaScript)

---

## 🎯 OBJECTIFS DU PROJET

### Objectif principal
Créer un assistant de planning intelligent qui comprend le langage naturel et adapte automatiquement les plannings selon l'urgence et le contexte.

### Objectifs secondaires
1. Détecter automatiquement l'urgence des situations (ex: "j'ai rien révisé")
2. Afficher les détails complets dans le calendrier (matières, sessions numérotées)
3. Proposer un calendrier mensuel complet et fonctionnel
4. Fournir des insights et statistiques réelles
5. Gérer des templates personnalisables avec questionnaire

---

## 🔧 SPÉCIFICATIONS FONCTIONNELLES

### 1. ONBOARDING (Première utilisation)

#### Flux complet en 3 étapes

**Étape 1 : Création de profil**
- Champs :
  - Prénom (obligatoire, input text)
  - Email (optionnel, input email)
  - Photo de profil (optionnel, file upload)
- Validation : Prénom requis avant passage étape 2
- Bouton : "Suivant →"

**Étape 2 : Choix du template**
- 3 options affichées en grille :
  1. 🎓 **Étudiant** - Cours et révisions
  2. 💼 **Travailleur** - Projets et travail
  3. ✨ **Personnalisé** - Configuration libre
- Chaque option = carte cliquable
- Clic → Enregistre choix et passe étape 3 (selon template) ou termine

**Étape 3a : Configuration Étudiant (si sélectionné)**
- Formulaire emploi du temps :
  - Lignes dynamiques (bouton "+ Ajouter un cours")
  - Chaque ligne : Jour (select), Heure début (time), Heure fin (time), Matière (text)
  - Bouton supprimer par ligne (🗑️)
- Préférences révision :
  - Durée session idéale : Select (1h, 1h30, 2h, 3h)
  - Moment préféré : Select (Matin 8h-12h, Après-midi 14h-18h, Soir 18h-21h)
- Boutons : "← Retour" (vers étape 2), "Terminer 🚀"

**Étape 3b : Configuration Travailleur (si sélectionné)**
- Horaires de travail :
  - Heure début (time input, défaut 09:00)
  - Heure fin (time input, défaut 18:00)
- Jours travaillés :
  - 7 checkboxes (Lun-Dim)
  - Défaut : Lun-Ven cochés
- Pause déjeuner :
  - Heure début (time input, défaut 12:00)
  - Heure fin (time input, défaut 13:00)
- Boutons : "← Retour", "Terminer 🚀"

**Étape 3c : Personnalisé**
- Passe directement à l'application (pas de config supplémentaire)

**Actions post-onboarding :**
- Sauvegarder profil dans localStorage
- Si Étudiant : Générer 4 semaines de cours récurrents dans le calendrier
- Si Travailleur : Sauvegarder horaires (pas encore utilisé dans génération)
- Initialiser streak à 0
- Afficher toast de bienvenue
- Masquer modal onboarding
- Afficher application principale

---

### 2. INTERFACE PRINCIPALE

#### 2.1. Header Compact (60px fixe)

**Structure :**
```
[☰ Sidebar] [⚡ ChronoFlow]                [🌙 Theme] [🔥 0] [👤 Profile]
```

**Éléments :**
- **Bouton sidebar** (☰) : Toggle sidebar (visible/caché)
- **Logo** : ⚡ + "ChronoFlow" (dégradé orange→bleu)
- **Bouton thème** : 🌙 (light) / ☀️ (dark) - Toggle theme
- **Streak** : 🔥 + nombre (badge orange, texte blanc)
- **Profil** : 👤 ou photo utilisateur (rond 36px)

**Comportements :**
- Header sticky (reste en haut au scroll)
- Streak met à jour temps réel
- Clic profil → Va sur vue Profile

#### 2.2. Sidebar (260px, collapsible)

**Navigation :**
- 📋 Planning (par défaut actif)
- 📅 Calendrier
- 📊 Insights
- ⚙️ Templates
- 🏆 Badges

**Fonctionnalités supplémentaires :**
- Section "Synchronisation" (Google/Apple/Notion) - Boutons simulés
- Status IA (Simulée / Claude API)

**Comportements :**
- Sur mobile (<768px) : Overlay fixe, masqué par défaut
- Bouton ☰ toggle la sidebar
- Item actif = fond orange, texte blanc
- Transition fluide (200ms)

#### 2.3. Zone de contenu principale

**Input IA (affiché uniquement sur vue Planning) :**
- Textarea extensible (min 100px)
- Placeholder explicite : "Ex: J'ai une éval de maths dans 3 jours et j'ai rien révisé"
- Bouton "Générer mon planning ✨"
- Quick tags optionnels (😴🏃📚👥⚖️) - Non implémentés dans V4 simplifiée

---

### 3. GÉNÉRATION INTELLIGENTE (CŒUR DU SYSTÈME)

#### 3.1. Détection d'urgence - PRIORITÉ ABSOLUE

**Mots-clés détectés :**
- Urgence : "rien révisé", "pas révisé", "urgent", "dernière minute"
- Examen : "examen", "éval", "contrôle", "test"
- Matières : maths, français, anglais, physique, chimie, histoire, géo, SVT, philo

**Algorithme de génération :**

```javascript
SI (texte contient "examen" OU "éval") ET (texte contient "rien révisé" OU "urgent") ALORS
    // MODE URGENCE ACTIVÉ
    
    1. Extraire la matière détectée (défaut: "Révision")
    2. Calculer jours jusqu'à l'examen (extraire de "dans X jours" ou "demain")
    3. Déterminer intensité selon délai :
       - Si < 3 jours : 3 sessions/jour de 3h
       - Si >= 3 jours : 2 sessions/jour de 2h
    
    4. Générer les sessions :
       POUR chaque jour jusqu'à l'examen :
           POUR chaque session :
               Créer événement {
                   title: "Révision [Matière] (SESSION [numero])",
                   type: "study",
                   date: jour,
                   startTime: [9:00, 14:00, 17:00][session],
                   duration: [180 ou 120] minutes,
                   priority: "critical",
                   endTime: calculé automatiquement
               }
    
    5. Ajouter l'examen final :
        Créer événement {
            title: "📝 EXAMEN [Matière]",
            type: "study",
            date: jour_examen,
            startTime: "8:00",
            duration: 180,
            priority: "critical"
        }

SINON SI (texte contient "examen") ALORS
    // MODE NORMAL
    Générer 1-2 sessions/jour de 2h
    Priority: "high"
    Titres: "Révision [Matière]"

SINON
    // Événement classique
    Détecter type (amis, sport, travail, repos)
    Durée par défaut selon type
    Priority: "medium"
```

**Exemple concret :**

Input : `"J'ai une éval de physique dans 3 jours et j'ai rien révisé"`

Output généré :
```
JOUR 1 (demain) :
  - 9:00-12:00 : Révision Physique (SESSION 1) 🔴
  - 14:00-17:00 : Révision Physique (SESSION 2) 🔴
  - 17:00-20:00 : Révision Physique (SESSION 3) 🔴

JOUR 2 :
  - 9:00-12:00 : Révision Physique (SESSION 1) 🔴
  - 14:00-17:00 : Révision Physique (SESSION 2) 🔴
  - 17:00-20:00 : Révision Physique (SESSION 3) 🔴

JOUR 3 :
  - 9:00-12:00 : Révision Physique (SESSION 1) 🔴
  - 14:00-17:00 : Révision Physique (SESSION 2) 🔴
  - 17:00-20:00 : Révision Physique (SESSION 3) 🔴

JOUR 4 (jour de l'examen) :
  - 8:00-11:00 : 📝 EXAMEN Physique 🔴
```

#### 3.2. Extraction de dates

**Patterns détectés :**
- "dans X jours" → Date = aujourd'hui + X jours
- "demain" → Date = aujourd'hui + 1
- "après-demain" → Date = aujourd'hui + 2
- "samedi" / "ce weekend" → Prochain samedi
- "15 mars" → 15 mars année en cours (ou suivante si passé)

#### 3.3. Extraction de durée

**Patterns :**
- "X heures" ou "Xh" → X * 60 minutes
- "X minutes" ou "X min" → X minutes
- Défaut si non spécifié :
  - Études : 120 min
  - Travail : 180 min
  - Social : 150 min
  - Personnel : 60 min

#### 3.4. Calcul automatique heure de fin

```javascript
function calculateEndTime(startTime, durationMinutes) {
    [heures, minutes] = startTime.split(':')
    totalMinutes = (heures * 60 + minutes) + durationMinutes
    heuresFin = Math.floor(totalMinutes / 60)
    minutesFin = totalMinutes % 60
    return heuresFin.padStart(2, '0') + ':' + minutesFin.padStart(2, '0')
}
```

Exemple :
- Start: "14:00", Duration: 120 min
- End: "16:00"

---

### 4. VUE PLANNING (Vue par défaut)

#### 4.1. Grille hebdomadaire

**Structure :**
- 7 colonnes (Lun-Dim)
- Header par colonne : Jour (petit, uppercase) + Date (grand, bold)
- Colonne aujourd'hui = bordure orange 2px
- Chaque colonne = liste verticale d'événements

**Événement dans la grille :**
```html
<div class="event-card [priority]">
    <div class="event-title">[Titre complet]</div>
    <div class="event-time">[HH:MM] - [HH:MM]</div>
</div>
```

**Code couleur priorités (bordure gauche 3px) :**
- 🔴 Critique : #EF4444
- 🟠 Haute : #F59E0B
- 🟡 Moyenne : #EAB308
- 🟢 Basse : #10B981

**Navigation :**
- Boutons ← → pour changer de semaine
- Label central : "Cette semaine", "Semaine prochaine", "Semaine -2", etc.

#### 4.2. Sections "Aujourd'hui" et "À venir"

**Aujourd'hui :**
- Filtre : date === aujourd'hui
- Tri : par heure de début
- Affichage :
  - Titre (bold)
  - Heure début - Heure fin

**À venir :**
- Filtre : date > aujourd'hui
- Tri : par date croissante
- Limite : 10 premiers événements
- Affichage :
  - Titre
  - 📅 Date complète (Lundi 10 février) • ⏰ HH:MM - HH:MM

**Empty state :**
- Si aucun événement : "Rien aujourd'hui" / "Rien à venir" (centré, gris)

---

### 5. VUE CALENDRIER MENSUEL

#### 5.1. Structure

**Grille complète du mois :**
- En-tête : Jours de la semaine (Lun-Dim, uppercase, centré)
- Grille 7×6 (jusqu'à 42 cases pour couvrir tous les cas)
- Aspect-ratio 1:1 par case (carrés)

**Case de jour :**
```html
<div class="calendar-day-cell [today|other-month]">
    <div class="day-number">[1-31]</div>
    <div class="mini-events">
        <div class="mini-event [priority]">[Titre]</div>
        <div class="mini-event [priority]">[Titre]</div>
        <div class="mini-event [priority]">[Titre]</div>
    </div>
</div>
```

**Affichage événements par jour :**
- Maximum 3 événements affichés
- Format mini : padding 2px 4px, font-size 0.65rem, ellipsis si trop long
- **Titres COMPLETS affichés** : "Révision Maths" pas juste "Révision"
- Code couleur fond selon priorité (alpha 0.2)

**Aujourd'hui :**
- Fond orange (--primary)
- Texte blanc
- Font-weight 700

**Jours autres mois :**
- Opacity 0.3
- Affichés pour combler grille mais grisés

**Navigation :**
- Boutons ← → pour changer de mois
- Label : "Février 2026" (mois + année)

#### 5.2. Interaction

- Hover : bordure orange + scale 1.02
- Clic : (Pas implémenté en V4, prévu V5)

---

### 6. VUE INSIGHTS

**Objectif :** Afficher statistiques RÉELLES basées sur les événements

**Cartes à afficher :**

**1. Vue d'ensemble**
- Total événements planifiés (nombre)
- Total heures (somme durées / 60)

**2. Répartition par type**
- Nombre événements Études + heures
- Nombre événements Travail + heures
- Nombre événements Social + heures
- Nombre événements Personnel + heures

**3. Productivité** (optionnel V4, priorité V5)
- Analyse du moment préféré (matin/après-midi/soir)
- Basé sur répartition horaire des événements

**Format carte :**
```html
<div class="insight-card">
    <h3>[Icône] Titre</h3>
    <p style="font-size:2rem;font-weight:700;color:var(--primary)">
        [Valeur]
    </p>
    <p>[Description]</p>
</div>
```

**Calculs dynamiques :**
```javascript
totalEvents = state.events.length
totalHours = state.events.reduce((sum, e) => sum + e.duration / 60, 0)
studyEvents = state.events.filter(e => e.type === 'study')
studyHours = studyEvents.reduce((sum, e) => sum + e.duration / 60, 0)
// etc.
```

---

### 7. VUE TEMPLATES

**Affichage :**
- Template actif : 🎓 Étudiant / 💼 Travailleur / ✨ Personnalisé
- Si Étudiant et emploi du temps renseigné :
  - Titre "Emploi du temps :"
  - Liste des cours :
    ```
    [Jour] [HH:MM] - [HH:MM] : [Matière]
    ```
  - Exemple : "Lun 8:00 - 10:00 : Maths"

**Carte unique :**
```html
<div class="insight-card">
    <h3>🎯 Template actif</h3>
    <p style="font-size:1.2rem">[Nom template]</p>
    <!-- Si schedule existe -->
    <h4>Emploi du temps :</h4>
    <div>
        [Liste cours]
    </div>
</div>
```

---

### 8. VUE BADGES

**Affichage streak :**
- Flamme animée 🔥 (font-size 4rem)
- Texte : "[X] jours de suite"
- Message encouragement

**Grille de badges :**
- Grid auto-fill, min 150px
- Badges prédéfinis :
  1. ⚡ Débutant - 1er événement
  2. 🔥 3 jours - Streak 3j
  3. ✨ Semaine - Streak 7j
  4. 💎 Champion - Streak 30j
  5. 🎯 Organisé - 50 événements

**Badge locked :**
- Opacity 0.4
- Grayscale(1)

**Badge unlocked :**
- Normal
- Peut avoir animation (optionnel)

---

### 9. VUE PROFIL

**Carte profil :**
- Avatar (rond 100px, dégradé si pas de photo)
- Nom utilisateur
- Email (si renseigné)

**Statistiques (grid 2 colonnes) :**
- Événements créés : state.user.totalEvents
- Jours de suite : state.streak

**Pas d'input IA sur cette page** (important !)

---

## 🎨 SPÉCIFICATIONS TECHNIQUES

### 10. SYSTÈME DE THÈMES

**Variables CSS :**
```css
/* Light mode (default) */
:root {
    --primary: #FF6B35;
    --bg-main: #F8F9FA;
    --bg-card: #FFFFFF;
    --text-primary: #1A1A1A;
    --text-secondary: #6C757D;
    --border: #DEE2E6;
    --critical: #EF4444;
    --high: #F59E0B;
    --medium: #EAB308;
    --low: #10B981;
}

/* Dark mode */
[data-theme="dark"] {
    --bg-main: #0F1419;
    --bg-card: #253446;
    --text-primary: #E7E9EA;
    --text-secondary: #9CA3AF;
    --border: #374151;
}
```

**Toggle :**
- Bouton header modifie attribut `data-theme` sur `<html>`
- Sauvegarde dans localStorage
- Icône change : 🌙 (light) / ☀️ (dark)

### 11. STREAK QUOTIDIEN

**Logique :**
```javascript
Chaque chargement de l'app :
1. Récupérer lastUsedDate du localStorage
2. Comparer avec aujourd'hui :
   - Si même jour : Rien
   - Si jour consécutif (diff = 1) : streak++
   - Si sauté des jours : streak = 0
3. Mettre à jour lastUsedDate = aujourd'hui
4. Sauvegarder
```

**Affichage :**
- Header : Badge compact avec 🔥 + nombre
- Vue Badges : Flamme large + texte + progression

### 12. STOCKAGE LOCAL (localStorage)

**Clé :** `chronoflow_v4`

**Structure JSON :**
```json
{
    "user": {
        "name": string,
        "email": string,
        "avatar": string (base64 optionnel),
        "totalEvents": number,
        "lastUsedDate": ISO date string,
        "templateType": "student"|"worker"|"none",
        "schedule": [{
            "day": 1-7,
            "startTime": "HH:MM",
            "endTime": "HH:MM",
            "subject": string
        }]
    },
    "events": [{
        "id": number,
        "title": string,
        "type": "study"|"work"|"social"|"personal",
        "date": ISO date string,
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "duration": number (minutes),
        "priority": "critical"|"high"|"medium"|"low"
    }],
    "theme": "light"|"dark",
    "streak": number
}
```

**Fonctions :**
- `saveState()` : Appelée après chaque modification
- `loadState()` : Appelée au chargement app
- Parsing dates : Convertir ISO string → Date object

### 13. STRUCTURE DE DONNÉES

**État global (state object) :**
```javascript
const state = {
    user: {
        name: '',
        email: '',
        avatar: '',
        totalEvents: 0,
        lastUsedDate: null,
        templateType: 'none',
        schedule: []
    },
    events: [],
    currentWeekOffset: 0,
    currentMonthOffset: 0,
    activeView: 'planning',
    theme: 'light',
    streak: 0
};
```

**Événement (event object) :**
```javascript
{
    id: Date.now() + Math.random(), // Unique
    title: string,                   // Ex: "Révision Maths (SESSION 1)"
    type: 'study'|'work'|'social'|'personal',
    date: Date object,               // JavaScript Date
    startTime: 'HH:MM',             // Ex: "14:00"
    endTime: 'HH:MM',               // Ex: "16:00"
    duration: number,                // Minutes (ex: 120)
    priority: 'critical'|'high'|'medium'|'low'
}
```

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

**Desktop (> 1024px) :**
- Sidebar 260px fixe
- Grille semaine 7 colonnes
- Calendrier mensuel 7 colonnes
- Sections "Aujourd'hui/À venir" 2 colonnes

**Tablet (768px - 1024px) :**
- Sidebar 260px, peut collapse
- Grille semaine 4 colonnes
- Calendrier mensuel 7 colonnes
- Sections 2 colonnes

**Mobile (< 768px) :**
- Sidebar overlay fixe (masquée par défaut)
- Grille semaine 3 colonnes
- Calendrier mensuel 7 colonnes (petites cases)
- Sections 1 colonne
- Template choice 1 colonne

---

## ⚡ PERFORMANCES & OPTIMISATIONS

### Bonnes pratiques

1. **Pas de frameworks lourds** : Vanilla JS uniquement
2. **Événements délégués** : Utiliser `onclick` global quand possible
3. **Lazy updates** : updatePlanningView() seulement si vue active
4. **LocalStorage limité** : Ne stocker que l'essentiel (< 5 MB)
5. **Debounce inputs** : Si ajout recherche temps réel (V5)

### Animations

- Transitions CSS (200ms) pour hover/focus
- Loading overlay pendant génération IA (2s simulé)
- Toast notifications (3s affichage puis fade out)

---

## 🔒 SÉCURITÉ & LIMITATIONS

### Données utilisateur

- **Stockage local uniquement** (pas de backend)
- **Pas de compte utilisateur** (pas d'auth)
- **Données non chiffrées** dans localStorage
- **Pas de synchronisation cloud** (sauf simulation visuelle)

### Limitations connues V4

1. Pas de vraie API Claude (IA simulée)
2. Pas d'édition/suppression d'événements
3. Pas d'export calendrier (iCal/PDF)
4. Pas de notifications push
5. Pas de vraie sync Google/Apple/Notion
6. Emploi du temps étudiant pas encore utilisé pour éviter conflits

---

## 🚀 DÉPLOIEMENT

### Fichiers à livrer

1. `index.html` (structure)
2. `style.css` (styles)
3. `script.js` (logique)
4. `README.md` (documentation utilisateur)

### Hébergement recommandé

**GitHub Pages (gratuit) :**
1. Créer repo public
2. Upload fichiers
3. Settings → Pages → Branch: main
4. URL: `https://username.github.io/repo-name`

**Alternatives :**
- Netlify Drop (drag & drop)
- Vercel
- Surge.sh

---

## 📊 MÉTRIQUES DE SUCCÈS

### KPIs Techniques

- Temps de chargement : < 1s
- Taille totale : < 100 KB
- Compatibilité : Chrome, Firefox, Safari, Edge (dernières versions)
- Mobile-friendly : 100% responsive

### KPIs Fonctionnels

- Taux complétion onboarding : > 90%
- Génération IA réussie : > 95%
- Utilisation quotidienne (streak) : Mesurable dans analytics futurs

---

## 🔮 ROADMAP V5 (Évolutions futures)

### Priorité Haute

1. **Édition/suppression événements** : Clic sur événement → modal édition
2. **Utilisation emploi du temps** : Éviter créneaux cours lors génération
3. **Vraie API Claude** : Intégration anthropic.com
4. **Export calendrier** : Bouton export iCal/PDF
5. **Conflits automatiques** : Détection chevauchements

### Priorité Moyenne

6. Notifications navigateur
7. Mode hors ligne (Service Worker)
8. Partage de planning (lien public)
9. Templates modifiables après création
10. Récurrence événements

### Priorité Basse

11. Backend + base données (sync multi-device)
12. Application mobile native
13. Intégrations tierces (Todoist, Trello)
14. IA vocale (commandes vocales)
15. Collaboration temps réel

---

## 📞 SUPPORT DÉVELOPPEUR

### Questions fréquentes

**Q: Pourquoi pas de framework ?**
R: Simplicité, légèreté, déploiement facile sans build.

**Q: Comment tester l'IA ?**
R: Essayer différentes formulations urgentes vs normales, vérifier titres détaillés.

**Q: Que faire si localStorage plein ?**
R: Limite 5 MB, suffisant pour ~1000 événements. Prévoir nettoyage vieux événements.

**Q: Mobile d'abord ou desktop ?**
R: Desktop first, puis responsive. Mobile = overlay sidebar.

---

## ✅ CHECKLIST DE LIVRAISON

Avant livraison client, vérifier :

- [ ] Onboarding complet fonctionnel (3 étapes)
- [ ] Détection urgence opérationnelle ("rien révisé" fonctionne)
- [ ] Titres détaillés dans calendrier ("Révision Maths" pas "Révision")
- [ ] Calendrier mensuel rempli toute la page
- [ ] Insights affichent vraies stats (pas de placeholder)
- [ ] Templates montrent emploi du temps si renseigné
- [ ] Streak augmente jour par jour
- [ ] Mode sombre fonctionne
- [ ] Sidebar collapse/expand OK
- [ ] LocalStorage sauvegarde/charge bien
- [ ] Responsive mobile testé
- [ ] Toast notifications apparaissent
- [ ] Pas de console errors
- [ ] README.md à jour

---

**Document rédigé par :** Claude AI (Anthropic)  
**Pour :** Développeur ChronoFlow  
**Version cahier des charges :** 1.0  
**Date :** 10 février 2026
