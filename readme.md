# ChronoFlow - Assistant Planning IA

## 🚀 INSTRUCTIONS POUR REPLIT

### Étape 1 : Créer ton compte Replit
1. Va sur **https://replit.com**
2. Clique sur "Sign up" (ou "S'inscrire")
3. Crée un compte gratuit avec ton email

### Étape 2 : Créer un nouveau projet
1. Une fois connecté, clique sur "+ Create Repl"
2. Choisis "HTML, CSS, JS" comme template
3. Donne un nom à ton projet : **ChronoFlow**
4. Clique sur "Create Repl"

### Étape 3 : Copier les fichiers
Tu vas voir 3 fichiers par défaut. Voici comment les remplacer :

#### Fichier `index.html`
1. Clique sur `index.html` dans la barre latérale gauche
2. **SUPPRIME TOUT** le contenu existant
3. Copie-colle TOUT le contenu du fichier `index.html` que je t'ai créé

#### Fichier `style.css`
1. Clique sur `style.css` dans la barre latérale gauche
2. **SUPPRIME TOUT** le contenu existant
3. Copie-colle TOUT le contenu du fichier `style.css` que je t'ai créé

#### Fichier `script.js`
1. Clique sur `script.js` dans la barre latérale gauche
2. **SUPPRIME TOUT** le contenu existant
3. Copie-colle TOUT le contenu du fichier `script.js` que je t'ai créé

### Étape 4 : Lancer l'application
1. Clique sur le gros bouton vert **"Run"** en haut
2. Attends quelques secondes
3. Ton site s'affiche dans la fenêtre de droite ! ✨

### Étape 5 : Partager ton application
1. En haut à droite, tu verras une URL (genre `https://chronoflow-tonnom.replit.app`)
2. Copie cette URL
3. Tu peux la partager avec qui tu veux !

---

## 📱 FONCTIONNALITÉS DE L'APPLICATION

### ✅ Ce qui fonctionne maintenant :

#### 1. **Compréhension IA du langage naturel**
Tu peux écrire naturellement :
- "J'ai un examen le 15 mars"
- "Réviser 2h par jour cette semaine"
- "Voir mes amis samedi"
- "Sport 3 fois cette semaine"

L'IA comprend :
- Les dates (relatives et absolues)
- Les durées
- Les types d'activités
- Les priorités

#### 2. **Calendrier visuel interactif**
- Vue hebdomadaire
- Navigation entre les semaines (← →)
- Code couleur par type d'événement :
  - 🔵 Travail
  - 🔴 Études/Révisions
  - 🟢 Social/Amis
  - 🟠 Personnel/Sport

#### 3. **Templates de vie**
3 templates prêts à l'emploi :
- **🎓 Étudiant en examen** : Optimisé pour les révisions
- **💼 Freelance équilibré** : Deep work + vie perso
- **👨‍👩‍👧 Parent actif** : Famille + travail + temps perso

Active un template = il génère automatiquement 3 jours de planning !

#### 4. **Analyse prédictive**
L'IA te donne :
- Ton moment de productivité optimal (matin/après-midi/soir)
- Score d'équilibre vie/travail (%)
- Prédiction de ta charge de travail future
- Analyse de ta vie sociale

#### 5. **Gamification**
- **Streaks** : Jours consécutifs d'utilisation 🔥
- **Badges** : 8 badges à débloquer
- **Heatmap** : Visualisation de ton activité sur 30 jours
- Motivation sans pression !

#### 6. **Synchronisation calendriers** (Boutons fonctionnels)
- Google Calendar
- Apple Calendar
- Notion Calendar

*Note : Les boutons fonctionnent mais la vraie synchronisation nécessite des API keys (version future)*

---

## 🎨 PERSONNALISATION

### Modifier les couleurs
Ouvre `style.css` et change les variables en haut :
```css
:root {
    --primary: #FF6B35; /* Couleur principale */
    --secondary: #004E89; /* Couleur secondaire */
}
```

### Ajouter des templates
Dans `script.js`, cherche la section `templates` et ajoute le tien :
```javascript
montemplate: {
    name: '🎯 Mon Template',
    events: [
        { title: 'Mon activité', type: 'personal', duration: 60, time: '10:00' }
    ]
}
```

---

## 🔮 PROCHAINES ÉTAPES (Version 2.0)

Pour transformer ça en vraie application avec IA réelle :

1. **Intégration IA réelle**
   - API Claude d'Anthropic ou GPT d'OpenAI
   - Compréhension avancée du contexte
   - Suggestions intelligentes

2. **Vraie synchronisation calendriers**
   - OAuth2 avec Google
   - CalDAV avec Apple
   - API Notion

3. **Base de données**
   - Sauvegarde permanente des événements
   - Historique et statistiques

4. **Notifications**
   - Push notifications
   - Rappels par email/SMS

5. **Application mobile**
   - Version iOS et Android
   - Notifications natives

---

## 💡 CONSEILS D'UTILISATION

### Pour les étudiants
1. Active le template "Étudiant en examen"
2. Ajoute tes examens : "Examen de maths le 20 mars"
3. L'app génère automatiquement les sessions de révision

### Pour les freelances
1. Active le template "Freelance équilibré"
2. Définis tes créneaux de deep work
3. L'app protège tes frontières travail/perso

### Pour les parents
1. Active le template "Parent actif"
2. Bloque tes temps famille
3. L'app optimise le reste

---

## 🐛 BUGS CONNUS / LIMITATIONS

- Les événements ne sont pas sauvegardés (ils disparaissent au refresh)
- L'IA est simulée (parsing basique de texte)
- Pas de vraie synchro calendrier
- Pas de notifications

**Ces limitations sont normales pour un MVP !**

---

## 📞 SUPPORT

Des questions ? Des bugs ? 
- Copie l'URL de ton Replit
- Partage-la avec moi
- Je t'aide à debugger !

---

## 🎉 BON À SAVOIR

- **100% gratuit** sur Replit (avec quelques limitations de performance)
- Fonctionne sur mobile, tablette, desktop
- Aucune installation requise
- Partage facilement avec tes amis

---

**Développé avec ❤️ par Claude AI**
**Version : 1.0.0 - MVP**
**Date : Février 2026**
