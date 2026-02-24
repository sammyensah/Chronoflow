// ChronoFlow V5 — Firebase Integration
// Ce fichier gère toute la communication avec Firebase (Auth + Firestore + Analytics)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics, logEvent } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  addDoc,
  writeBatch,
  serverTimestamp,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ══════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════
const firebaseConfig = {
  apiKey: "AIzaSyB0O0CQg2iO_x2DqkZvGnf289aJTkubK30",
  authDomain: "chronoflow-ca394.firebaseapp.com",
  projectId: "chronoflow-ca394",
  storageBucket: "chronoflow-ca394.firebasestorage.app",
  messagingSenderId: "543854921501",
  appId: "1:543854921501:web:8af97489859f069abe83f4",
  measurementId: "G-N27PWJDKNM"
};

const app    = initializeApp(firebaseConfig);
const auth   = getAuth(app);
const db     = getFirestore(app);
const analytics = getAnalytics(app);

// ══════════════════════════════════════════
// AUTH — INSCRIPTION
// ══════════════════════════════════════════
export async function fbRegister(name, email, password) {
  // Crée le compte dans Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid  = cred.user.uid;

  // Crée le document utilisateur dans Firestore (collection "users")
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    avatar:       "",
    createdAt:    serverTimestamp(),
    totalEvents:  0,
    xp:           0,
    level:        1,
    totalXpEarned:0,
    streak:       0,
    lastUsedDate: null,
    tutorialDone: false,
    template:     "custom",
    templateData: {
      maxStudy:   4,
      maxLeisure: 3,
      breakMin:   10,
      courses:    [],
      workStart:  "09:00",
      workEnd:    "18:00",
      maxWork:    8
    },
    theme:         "dark",
    lang:          localStorage.getItem("cf_lang") || "fr",
    notifications: true,
    equippedItem:  "default"
  });

  logEvent(analytics, "sign_up", { method: "email" });
  return uid;
}

// ══════════════════════════════════════════
// AUTH — CONNEXION
// ══════════════════════════════════════════
export async function fbLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  logEvent(analytics, "login", { method: "email" });
  return cred.user.uid;
}

// ══════════════════════════════════════════
// AUTH — DÉCONNEXION
// ══════════════════════════════════════════
export async function fbLogout() {
  await signOut(auth);
}

// ══════════════════════════════════════════
// AUTH — ÉCOUTER LES CHANGEMENTS DE SESSION
// Appelé au chargement de la page.
// callback(uid) si connecté, callback(null) si déconnecté
// ══════════════════════════════════════════
export function fbOnAuthChange(callback) {
  onAuthStateChanged(auth, user => {
    callback(user ? user.uid : null);
  });
}

// ══════════════════════════════════════════
// AUTH — CHANGER LE MOT DE PASSE
// Nécessite de ré-authentifier l'utilisateur d'abord
// ══════════════════════════════════════════
export async function fbChangePassword(currentPassword, newPassword) {
  const user       = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// ══════════════════════════════════════════
// UTILISATEUR — LIRE
// Retourne les données du profil depuis Firestore
// ══════════════════════════════════════════
export async function fbGetUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

// ══════════════════════════════════════════
// UTILISATEUR — SAUVEGARDER
// Sauvegarde les données du profil (pas les événements)
// ══════════════════════════════════════════
export async function fbSaveUser(uid, data) {
  // On exclut les champs qu'on ne veut pas écraser accidentellement
  const { events, uid: _uid, ...safeData } = data;
  await setDoc(doc(db, "users", uid), safeData, { merge: true });
}

// ══════════════════════════════════════════
// UTILISATEUR — SUPPRIMER LE COMPTE
// ══════════════════════════════════════════
export async function fbDeleteAccount(uid) {
  // Supprime tous les événements
  const eventsSnap = await getDocs(collection(db, "users", uid, "events"));
  const batch = writeBatch(db);
  eventsSnap.forEach(d => batch.delete(d.ref));
  await batch.commit();

  // Supprime le document utilisateur
  await deleteDoc(doc(db, "users", uid));

  // Supprime le compte Auth
  await auth.currentUser.delete();
}

// ══════════════════════════════════════════
// ÉVÉNEMENTS — LIRE TOUS
// Retourne le tableau d'événements de l'utilisateur
// ══════════════════════════════════════════
export async function fbGetEvents(uid) {
  const snap = await getDocs(collection(db, "users", uid, "events"));
  return snap.docs.map(d => ({
    id:   d.id,
    ...d.data(),
    date: d.data().date?.toDate ? d.data().date.toDate() : new Date(d.data().date)
  }));
}

// ══════════════════════════════════════════
// ÉVÉNEMENTS — SAUVEGARDER TOUS (remplacement complet)
// Utilisé après une génération IA ou un import
// ══════════════════════════════════════════
export async function fbSaveAllEvents(uid, events) {
  // Supprime d'abord tous les événements existants
  const existing = await getDocs(collection(db, "users", uid, "events"));
  const batch    = writeBatch(db);
  existing.forEach(d => batch.delete(d.ref));
  await batch.commit();

  // Réinsère tous les événements
  const batch2 = writeBatch(db);
  events.forEach(ev => {
    const ref = doc(collection(db, "users", uid, "events"));
    const { id, ...evData } = ev;
    batch2.set(ref, {
      ...evData,
      date: ev.date instanceof Date ? ev.date : new Date(ev.date)
    });
  });
  await batch2.commit();
}

// ══════════════════════════════════════════
// ÉVÉNEMENTS — AJOUTER UN SEUL
// Utilisé pour ajouter un événement unitaire
// ══════════════════════════════════════════
export async function fbAddEvent(uid, event) {
  const { id, ...evData } = event;
  const ref = await addDoc(collection(db, "users", uid, "events"), {
    ...evData,
    date: event.date instanceof Date ? event.date : new Date(event.date)
  });
  logEvent(analytics, "event_created", { type: event.type || "unknown" });
  return ref.id; // retourne le nouvel id Firestore
}

// ══════════════════════════════════════════
// ÉVÉNEMENTS — MODIFIER UN SEUL (ex: changer priorité)
// ══════════════════════════════════════════
export async function fbUpdateEvent(uid, eventId, changes) {
  await updateDoc(doc(db, "users", uid, "events", eventId), changes);
}

// ══════════════════════════════════════════
// ANALYTICS — LOGGER UN ÉVÉNEMENT CUSTOM
// Exemples : gain_xp, badge_unlocked, session_completed
// ══════════════════════════════════════════
export function fbLog(eventName, params = {}) {
  logEvent(analytics, eventName, params);
}

// ══════════════════════════════════════════
// EXPOSE SUR WINDOW pour script.js (pas de bundler)
// ══════════════════════════════════════════
window.FB = {
  fbRegister,
  fbLogin,
  fbLogout,
  fbOnAuthChange,
  fbChangePassword,
  fbGetUser,
  fbSaveUser,
  fbDeleteAccount,
  fbGetEvents,
  fbSaveAllEvents,
  fbAddEvent,
  fbUpdateEvent,
  fbLog,
  auth,
  db
};
