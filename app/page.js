"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Flame, BookOpen, Globe2, Map, RotateCcw, Volume2, VolumeX, LogOut, Mail, CloudOff } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#0B1917", surface: "#122622", surface2: "#1A332D", line: "#22423A",
  gold: "#C9A24B", goldBright: "#E8CD86", ivory: "#F4EFE2",
  muted: "#8BA79A", faint: "#5C776C", ringTrack: "#1E3A33", warn: "#D98F4E",
};

const APP_NAME = "Mustaghfirin";   // “…and those who seek forgiveness before dawn.” — Quran 3:17
const DAILY_GOAL = 1000;
const JOURNEY_DAYS = 180;
const QUEUE_KEY = "sakinah-queue"; // offline pending deltas
const CACHE_KEY = "sakinah-cache"; // last known counts, for offline display

/* ------------------------------------------------------------------ */
/* 60 benefits                                                         */
/* ------------------------------------------------------------------ */
const BENEFITS = [
  { t: "Abundant Rain", b: "“Ask forgiveness of your Lord… He will send rain to you in abundance.”", s: "Quran — Nuh 71:10–11", c: "Quran" },
  { t: "Increase in Wealth", b: "Istighfar carries a divine promise of increase in wealth.", s: "Quran — Nuh 71:12", c: "Quran" },
  { t: "Increase in Children", b: "Allah promises offspring to those who seek His forgiveness.", s: "Quran — Nuh 71:12", c: "Quran" },
  { t: "Gardens", b: "Allah promises gardens — blessings in this world and Paradise in the next.", s: "Quran — Nuh 71:12", c: "Quran" },
  { t: "Rivers", b: "Flowing rivers: a symbol of continuous, renewing blessing.", s: "Quran — Nuh 71:12", c: "Quran" },
  { t: "Good Provision", b: "“Seek forgiveness of your Lord and repent to Him — He will let you enjoy a good provision.”", s: "Quran — Hud 11:3", c: "Quran" },
  { t: "Allah's Favour", b: "Allah grants His favour to every doer of good who seeks His forgiveness.", s: "Quran — Hud 11:3", c: "Quran" },
  { t: "Strength Upon Strength", b: "Istighfar brings added strength — physical, spiritual, and in resolve.", s: "Quran — Hud 11:52", c: "Quran" },
  { t: "Shield from Punishment", b: "“Allah would not punish them while they seek forgiveness.”", s: "Quran — Al-Anfal 8:33", c: "Quran" },
  { t: "Guaranteed Forgiveness", b: "He is Al-Ghaffar, the Perpetual Forgiver. No sincere istighfar is wasted.", s: "Quran — Nuh 71:10", c: "Quran" },
  { t: "Allah's Love", b: "“Indeed, Allah loves those who repent and those who purify themselves.”", s: "Quran — Al-Baqarah 2:222", c: "Quran" },
  { t: "Never Despair", b: "Allah's mercy covers all sins. The door of istighfar never closes.", s: "Quran — Az-Zumar 39:53", c: "Quran" },
  { t: "A Beautiful Life", b: "Istighfar brings ease and enjoyment in the life you've been given.", s: "Quran — Hud 11:3", c: "Quran" },
  { t: "A Way Out of Every Distress", b: "“If anyone constantly seeks pardon, Allah will appoint for him a way out of every distress.”", s: "Hadith — Abu Dawud", c: "Hadith" },
  { t: "Relief from Every Anxiety", b: "Constant istighfar brings relief from every anxiety.", s: "Hadith — Abu Dawud", c: "Hadith" },
  { t: "Rizq from Unexpected Sources", b: "Allah provides for the seeker of forgiveness from where he never imagined.", s: "Hadith — Abu Dawud", c: "Hadith" },
  { t: "A Path Out of Poverty", b: "Regular istighfar opens a path out of poverty and difficulty.", s: "Hadith — Ibn Majah", c: "Hadith" },
  { t: "Sorrow → Contentment", b: "Hardship is removed and replaced with prosperity and contentment.", s: "Hadith — Ibn Majah", c: "Hadith" },
  { t: "The Prophet's ﷺ Habit", b: "He was sinless, yet sought forgiveness 70–100 times daily. What's our excuse?", s: "Hadith — Bukhari & Muslim", c: "Hadith" },
  { t: "Your Duas Get Accepted", b: "Seek forgiveness for believing men and women daily, and be counted among those whose dua is accepted.", s: "Hadith — Ibn Majah", c: "Hadith" },
  { t: "Others Blessed Through You", b: "Through the barakah of such a person, people on earth receive sustenance.", s: "Hadith — Ibn Majah", c: "Hadith" },
  { t: "Allah Forgives All Sins", b: "“You sin by night and day, and I forgive all sins — so seek forgiveness of Me.”", s: "Hadith Qudsi — Muslim", c: "Hadith" },
  { t: "The Best of Sinners", b: "“All the sons of Adam are sinners, but the best of sinners are those who repent.”", s: "Hadith — Tirmidhi", c: "Hadith" },
  { t: "Sayyidul Istighfar = Paradise", b: "Recite the Master of Forgiveness with conviction morning or evening — a promise of Paradise.", s: "Hadith — Bukhari", c: "Hadith" },
  { t: "No Sin Too Great", b: "A specific istighfar formula brings forgiveness even for the gravest lapses.", s: "Hadith — Abu Dawud, Tirmidhi", c: "Hadith" },
  { t: "Allah's Hand Is Extended", b: "He extends His hand by day for the night's sinner, and by night for the day's sinner.", s: "Hadith — Muslim", c: "Hadith" },
  { t: "Allah Rejoices at Your Return", b: "Allah is more pleased with your repentance than a traveller who finds his lost camel in the desert.", s: "Hadith — Bukhari & Muslim", c: "Hadith" },
  { t: "Glad Tidings", b: "Blessed is the one who finds abundant istighfar in his book of deeds.", s: "Hadith — Ibn Majah", c: "Hadith" },
  { t: "Polish for the Heart", b: "Sins leave dark spots on the heart; istighfar polishes it back to shine.", s: "Hadith — Tirmidhi", c: "Hadith" },
  { t: "Shaytan's Frustration", b: "Shaytan destroys through sins; Allah counters everything through istighfar.", s: "Hadith — Ahmad", c: "Hadith" },
  { t: "The Answer to Drought", b: "A man complained of no rain. Hasan al-Basri said: “Seek Allah's forgiveness.”", s: "Hasan al-Basri — Tafsir al-Qurtubi", c: "Scholars" },
  { t: "The Answer to Poverty", b: "Another complained of poverty. The same answer: “Seek Allah's forgiveness.”", s: "Hasan al-Basri", c: "Scholars" },
  { t: "The Answer to Childlessness", b: "A third begged for a child. Again: “Seek Allah's forgiveness.”", s: "Hasan al-Basri", c: "Scholars" },
  { t: "The Answer to Barren Land", b: "A fourth complained his garden had dried. Same prescription: istighfar.", s: "Hasan al-Basri", c: "Scholars" },
  { t: "The Answer to Debt", b: "Burdened by debt? The scholars' prescription was istighfar — then effort.", s: "Hasan al-Basri", c: "Scholars" },
  { t: "One Solution, Many Problems", b: "Asked why one answer for all complaints, Hasan al-Basri simply recited Surah Nuh 71:10–12.", s: "Scholars", c: "Scholars" },
  { t: "The Baker & Imam Ahmad", b: "A baker's constant istighfar meant every dua was answered — even meeting Imam Ahmad himself.", s: "Classical anecdote", c: "Scholars" },
  { t: "Istighfar Before Dua", b: "Begin your dua with istighfar, as Prophet Sulaiman (AS) did — it opens the door of acceptance.", s: "Scholars — on Quran 38:35", c: "Scholars" },
  { t: "Sealing Your Good Deeds", b: "Istighfar after salah and good deeds patches the imperfections in our worship.", s: "Scholars", c: "Scholars" },
  { t: "The Security That Remains", b: "Two protections from punishment existed: the Prophet ﷺ among us, and istighfar. One remains.", s: "Scholars — on Quran 8:33", c: "Scholars" },
  { t: "Anxiety Melts Away", b: "When anxiety surrounds you, keep saying Astaghfirullah — it calms the heart.", s: "Reflection", c: "Reflection" },
  { t: "Lifts Heaviness", b: "In moments of sadness and frustration, istighfar soothes the soul.", s: "Reflection", c: "Reflection" },
  { t: "A Living Reminder", b: "Constant istighfar keeps you conscious that Allah sees everything — the strongest shield against sin.", s: "Reflection", c: "Reflection" },
  { t: "Builds Humility", b: "Admitting fault daily kills arrogance at its root.", s: "Reflection", c: "Reflection" },
  { t: "Releases Guilt", b: "Guilt carried silently becomes poison; istighfar converts it into closeness to Allah.", s: "Reflection", c: "Reflection" },
  { t: "Strengthens Your Bond", b: "Every Astaghfirullah is a private conversation with your Creator.", s: "Reflection", c: "Reflection" },
  { t: "Refines Character", b: "Regular istighfar builds self-accountability and better behaviour.", s: "Reflection", c: "Reflection" },
  { t: "Heals Relationships", b: "One who constantly seeks forgiveness learns to forgive others.", s: "Reflection", c: "Reflection" },
  { t: "Gateway to Productivity", b: "A heart unburdened by guilt works with focus and energy.", s: "Scholars & Reflection", c: "Reflection" },
  { t: "Door of Mercy", b: "Istighfar is described by scholars as the key that opens Allah's mercy.", s: "Scholars & Reflection", c: "Reflection" },
  { t: "Door of Knowledge", b: "A purified heart absorbs beneficial knowledge faster.", s: "Scholars & Reflection", c: "Reflection" },
  { t: "Daily Self-Improvement", b: "Istighfar is Islam's built-in daily retrospective: reflect, correct, restart.", s: "Reflection", c: "Reflection" },
  { t: "Sakinah — Inner Peace", b: "Tranquility settles on the tongue that stays moist with istighfar.", s: "Reflection", c: "Reflection" },
  { t: "Unblocks What Sins Blocked", b: "Sins block rizq and opportunities; istighfar removes the blockage.", s: "Scholars", c: "Reflection" },
  { t: "The Best Minute", b: "You can say Astaghfirullah 100 times in one minute. No worship gives higher return on time.", s: "Reflection", c: "Reflection" },
  { t: "A Tongue Moist with Dhikr", b: "Istighfar keeps you constantly in Allah's remembrance — among the most beloved deeds.", s: "Reflection", c: "Reflection" },
  { t: "Gateway to Paradise", b: "Forgiveness of sins is the road; istighfar is the vehicle.", s: "Reflection", c: "Reflection" },
  { t: "Purifies the Soul", b: "Istighfar erases sins and washes the soul clean, again and again.", s: "Reflection", c: "Reflection" },
  { t: "Antidote to Despair", b: "Hopelessness is Shaytan's weapon; istighfar is the believer's answer.", s: "Reflection", c: "Reflection" },
  { t: "Multiply Your Reward", b: "Remind others to make istighfar, and you share in the reward of everyone who acts on it.", s: "Reflection", c: "Reflection" },
];

const CAT_COLOR = { Quran: "#C9A24B", Hadith: "#3FAE7C", Scholars: "#7FB3D5", Reflection: "#B08FC9" };

/* Niyat reminders — the app humbling its own gamification */
const NIYAT = [
  "This count is for Allah, not for the board. Check your intention.",
  "“Actions are judged by intentions.” — Bukhari & Muslim",
  "The best deed may be the one no one ever sees.",
  "No number here is recorded with Allah — only what was sincere.",
];

const COUNTRIES = [
  ["🇮🇳", "India"], ["🇵🇰", "Pakistan"], ["🇧🇩", "Bangladesh"], ["🇸🇦", "Saudi Arabia"], ["🇦🇪", "UAE"],
  ["🇮🇩", "Indonesia"], ["🇲🇾", "Malaysia"], ["🇹🇷", "Türkiye"], ["🇪🇬", "Egypt"], ["🇳🇬", "Nigeria"],
  ["🇺🇸", "USA"], ["🇬🇧", "UK"], ["🇨🇦", "Canada"], ["🇦🇺", "Australia"], ["🇿🇦", "South Africa"],
  ["🇶🇦", "Qatar"], ["🇰🇼", "Kuwait"], ["🇧🇭", "Bahrain"], ["🇴🇲", "Oman"], ["🇯🇴", "Jordan"],
  ["🇲🇦", "Morocco"], ["🇩🇿", "Algeria"], ["🇹🇳", "Tunisia"], ["🇵🇸", "Palestine"], ["🇱🇧", "Lebanon"],
  ["🇮🇷", "Iran"], ["🇮🇶", "Iraq"], ["🇸🇾", "Syria"], ["🇾🇪", "Yemen"], ["🇦🇫", "Afghanistan"],
  ["🇱🇰", "Sri Lanka"], ["🇳🇵", "Nepal"], ["🇲🇻", "Maldives"], ["🇸🇬", "Singapore"], ["🇧🇳", "Brunei"],
  ["🇰🇿", "Kazakhstan"], ["🇺🇿", "Uzbekistan"], ["🇸🇴", "Somalia"], ["🇸🇩", "Sudan"], ["🇰🇪", "Kenya"],
  ["🇹🇿", "Tanzania"], ["🇬🇭", "Ghana"], ["🇸🇳", "Senegal"], ["🇧🇦", "Bosnia & Herzegovina"], ["🇦🇱", "Albania"],
  ["🇽🇰", "Kosovo"], ["🇫🇷", "France"], ["🇩🇪", "Germany"], ["🇳🇱", "Netherlands"], ["🇮🇹", "Italy"],
  ["🇪🇸", "Spain"], ["🇸🇪", "Sweden"], ["🇳🇴", "Norway"], ["🇷🇺", "Russia"], ["🇨🇳", "China"],
  ["🇯🇵", "Japan"], ["🇰🇷", "South Korea"], ["🇧🇷", "Brazil"], ["🇲🇽", "Mexico"], ["🌍", "Other"],
];

/* ------------------------------------------------------------------ */
/* Date helpers — TIMEZONE SAFE                                        */
/* The day is computed in the user's HOME timezone (stored at signup), */
/* so travelling across timezones can never break or double a day.     */
/* ------------------------------------------------------------------ */
const deviceTz = () => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"; }
  catch { return "Asia/Kolkata"; }
};
const dayKeyInTz = (tz, date = new Date()) => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en-CA").format(date);
  }
};
const shiftDayKey = (tz, offsetDays) =>
  dayKeyInTz(tz, new Date(Date.now() + offsetDays * 86400000));

const computeStreak = (days, tz) => {
  let streak = 0;
  let i = 0;
  if ((days[dayKeyInTz(tz)] || 0) < DAILY_GOAL) i = -1; // today is still open
  while (true) {
    const k = shiftDayKey(tz, i);
    if ((days[k] || 0) >= DAILY_GOAL) { streak++; i--; }
    else break;
  }
  return streak;
};

/* Consistency band — shown publicly instead of exact numbers */
const bandFor = (streak) => {
  if (streak >= 100) return { label: "Steadfast", color: C.goldBright };
  if (streak >= 40) return { label: "Consistent", color: C.gold };
  if (streak >= 7) return { label: "Building", color: "#3FAE7C" };
  if (streak >= 1) return { label: "Under way", color: C.muted };
  return { label: "Returning", color: C.faint };
};

/* ------------------------------------------------------------------ */
/* Levels — the promises of Surah Nuh, in order.                       */
/* Based on TOTAL completed days, not an unbroken streak: illness and  */
/* travel should never erase years of work.                            */
/* ------------------------------------------------------------------ */
const LEVELS = [
  { id: 1, name: "Qatrah", en: "A Drop", days: 0, ar: "قَطْرَة", ring: "#7FB3D5",
    note: "Every rain begins with one drop. You have begun." },
  { id: 2, name: "Baarish", en: "Rain", days: 180, ar: "مَطَر", ring: "#5FA8C9",
    note: "“He will send rain to you in abundance.” — Surah Nuh 71:11" },
  { id: 3, name: "Nahr", en: "Stream", days: 540, ar: "نَهْر", ring: "#3FAE7C",
    note: "What fell as drops now runs as a stream." },
  { id: 4, name: "Hadiqa", en: "Garden", days: 1080, ar: "حَدِيقَة", ring: "#C9A24B",
    note: "“And He will make for you gardens.” — Surah Nuh 71:12" },
  { id: 5, name: "Anhar", en: "Rivers", days: 1800, ar: "أَنْهَار", ring: "#E8CD86",
    note: "“And He will make for you rivers.” — the last of the promises." },
];
const levelFor = (completedDays) => {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (completedDays >= l.days) cur = l;
  const next = LEVELS.find((l) => l.days > completedDays) || null;
  return { cur, next };
};

/* Quiet personal milestones — shown only to you, never announced */
const MILESTONES = [
  { days: 7, label: "One week" },
  { days: 40, label: "Chilla — forty days" },
  { days: 100, label: "One hundred days" },
  { days: 180, label: "The six-month journey" },
  { days: 365, label: "One full year" },
  { days: 540, label: "Eighteen months" },
  { days: 1080, label: "Three years" },
  { days: 1800, label: "Five years" },
];

/* ------------------------------------------------------------------ */
/* The intro — why a thousand.                                         */
/* Honest on purpose: the number is a chosen commitment, not a ruling.  */
/* ------------------------------------------------------------------ */
const INTRO = [
  {
    k: "Why a thousand?",
    h: "Let's be honest first",
    body: "No hadith fixes the number at a thousand. The Prophet ﷺ, who carried no sin, sought forgiveness seventy to a hundred times a day.\n\nA thousand is not a ruling handed down to you. It is a commitment you choose — and that is exactly why it works.",
    ar: null,
  },
  {
    k: "The promise",
    h: "It was never about the count",
    body: "“Whoever keeps constant in seeking forgiveness, Allah will make for him a way out of every distress, relief from every anxiety, and provide for him from where he never imagined.”\n\nRead it again: whoever keeps constant. The promise is tied to constancy — not to a quantity.",
    src: "Abu Dawud",
    ar: null,
  },
  {
    k: "So why a thousand?",
    h: "Because it cannot be done carelessly",
    body: "A hundred can be finished in one distracted minute and forgotten by noon.\n\nA thousand cannot. It has to be broken across the whole day — while waiting, walking, travelling, between tasks. It quietly forces istighfar into the corners of your life until the tongue keeps moving on its own.\n\nThat is the point. Not the number — what the number does to your day.",
    ar: null,
  },
  {
    k: "The cost",
    h: "Ten minutes. That's all.",
    body: "You can say Astaghfirullah a hundred times in about a minute. A thousand is roughly ten minutes, spread across sixteen waking hours.\n\nNo worship gives a higher return for so little time.",
    ar: null,
  },
  {
    k: "What is promised",
    h: "Rain, wealth, children, gardens, rivers",
    body: "These are not our claims. They are what Allah Himself attached to istighfar in Surah Nuh — and many people describe real change in their lives after months of holding to it.\n\nWe cannot measure that, and we won't pretend to. What we can say is this: the promises are His, and the constancy is yours.",
    ar: "فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا",
    src: "Surah Nuh 71:10",
  },
];

/* Push helpers */
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

/* Offline queue (localStorage works in a real deployed app) */
const readQueue = () => {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || "{}"); } catch { return {}; }
};
const writeQueue = (q) => {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch {}
};
const queueDelta = (day, delta) => {
  const q = readQueue();
  q[day] = (q[day] || 0) + delta;
  writeQueue(q);
};

const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", color: C.ivory, fontSize: 15 };
const goldBtn = { background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 15, cursor: "pointer", width: "100%" };

/* Shell at module level — keeps inputs from losing focus on each keystroke */
const Shell = ({ children }) => (
  <div style={{ background: C.bg, minHeight: "100vh", color: C.ivory, position: "relative", overflow: "hidden" }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }}>
      <defs>
        <pattern id="star8" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M36 6 L43 29 L66 36 L43 43 L36 66 L29 43 L6 36 L29 29 Z" fill="none" stroke={C.gold} strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#star8)" />
    </svg>
    {children}
  </div>
);

/* ================================================================== */
export default function Mustaghfirin() {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(undefined);
  const [days, setDays] = useState({});
  const [dataReady, setDataReady] = useState(false); // counting locked until true
  const [loadFailed, setLoadFailed] = useState(false);
  const [pending, setPending] = useState(0);
  const [tab, setTab] = useState("count");
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [dailyIdx, setDailyIdx] = useState(0);
  const [browseIdx, setBrowseIdx] = useState(0);
  const [niyatIdx, setNiyatIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [obName, setObName] = useState("");
  const [obFlag, setObFlag] = useState("🇮🇳");
  const [obVis, setObVis] = useState("anon"); // concealment is the default
  const [ummahTotal, setUmmahTotal] = useState(null);
  const [ummahActive, setUmmahActive] = useState(null);
  const [savingNote, setSavingNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [remindDismissed, setRemindDismissed] = useState(false);
  const [introStep, setIntroStep] = useState(null); // null = not showing

  const flushTimer = useRef(null);
  const audioRef = useRef(null);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;

  const tz = profile?.timezone || deviceTz();
  const today = dayKeyInTz(tz);
  const todayCount = days[today] || 0;
  const streak = computeStreak(days, tz);
  const completedDays = Object.values(days).filter((v) => v >= DAILY_GOAL).length;
  const totalAll = Object.values(days).reduce((a, b) => a + b, 0);
  const pct = Math.min(todayCount / DAILY_GOAL, 1);

  useEffect(() => {
    const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyIdx(doy % BENEFITS.length);
    setBrowseIdx(Math.floor(Math.random() * BENEFITS.length));
    setNiyatIdx(Math.floor(Math.random() * NIYAT.length));
    try {
      if (!localStorage.getItem("intro-seen")) setIntroStep(0);
    } catch (e) {}
  }, []);

  /* ------- auth session ------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ------- load profile + counts (cache fallback, never blind-write) ------- */
  const loadAll = useCallback(async () => {
    if (!session?.user) return;
    setLoadFailed(false);
    try {
      const { data: prof, error: pErr } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (pErr) throw pErr;
      setProfile(prof ?? null);
      if (!prof) { setDataReady(false); return; }

      const { data: rows, error: rErr } = await supabase
        .from("daily_counts").select("day,count").eq("user_id", session.user.id);
      if (rErr) throw rErr;

      const map = {};
      (rows || []).forEach((r) => { map[r.day] = r.count; });
      const q = readQueue();
      Object.entries(q).forEach(([d, delta]) => { map[d] = Math.max((map[d] || 0) + delta, 0); });
      setPending(Object.values(q).reduce((a, b) => a + Math.abs(b), 0));
      setDays(map);
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(map)); } catch {}
      setDataReady(true);
    } catch (e) {
      console.error("load failed", e);
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
        setDays(cached);
      } catch {}
      setDataReady(false);
      setLoadFailed(true);
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user) { setProfile(undefined); setDays({}); setDataReady(false); return; }
    loadAll();
  }, [session, loadAll]);

  /* ------- flush queued deltas atomically ------- */
  const flushQueue = useCallback(async () => {
    if (!session?.user) return;
    const q = readQueue();
    const entries = Object.entries(q).filter(([, d]) => d !== 0);
    if (entries.length === 0) { setPending(0); return; }
    setSavingNote("Saving…");
    for (const [day, delta] of entries) {
      try {
        const { error } = await supabase.rpc("add_istighfar", { p_day: day, p_delta: delta });
        if (error) throw error;
        const cur = readQueue();
        delete cur[day];
        writeQueue(cur);
      } catch (e) {
        console.error("flush failed for", day, e);
        setSavingNote("");
        setPending(Object.values(readQueue()).reduce((a, b) => a + Math.abs(b), 0));
        return; // stays queued, retried later
      }
    }
    setPending(0);
    setSavingNote("");
    try {
      await supabase.from("profiles").update({
        streak: computeStreak(days, tz),
        total_count: Object.values(days).reduce((a, b) => a + b, 0),
        today_count: days[today] || 0,
        today_date: today,
        last_active: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq("id", session.user.id);
    } catch (e) { console.error("aggregate update failed", e); }
  }, [session, days, tz, today]);

  const scheduleFlush = useCallback(() => {
    if (flushTimer.current) clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(() => { flushQueue(); }, 1500);
  }, [flushQueue]);

  useEffect(() => {
    const onOnline = () => flushQueue();
    const onHide = () => { if (document.visibilityState === "hidden") flushQueue(); };
    window.addEventListener("online", onOnline);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("online", onOnline);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [flushQueue]);

  /* ------- sound engine ------- */
  const getCtx = () => {
    if (!audioRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioRef.current = new AC();
    }
    if (audioRef.current.state === "suspended") audioRef.current.resume();
    return audioRef.current;
  };
  const playDrop = () => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getCtx(); const t = ctx.currentTime;
      const o = ctx.createOscillator(); const g = ctx.createGain(); const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 1400;
      const base = 640 + Math.random() * 180;
      o.type = "sine";
      o.frequency.setValueAtTime(base, t);
      o.frequency.exponentialRampToValueAtTime(base * 0.42, t + 0.16);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + 0.28);
    } catch (e) {}
  };
  const bell = (ctx, freq, when, vol = 0.16, dur = 1.1) => {
    [1, 2].forEach((mult, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = freq * mult;
      const v = i === 0 ? vol : vol * 0.28;
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(v, when + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g); g.connect(ctx.destination);
      o.start(when); o.stop(when + dur + 0.05);
    });
  };
  const playMilestone = () => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getCtx(); const t = ctx.currentTime;
      bell(ctx, 880.0, t, 0.15, 1.0);
      bell(ctx, 1174.66, t + 0.18, 0.13, 1.3);
    } catch (e) {}
  };
  const playComplete = () => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getCtx(); const t = ctx.currentTime;
      const pad = ctx.createOscillator(); const pg = ctx.createGain();
      pad.type = "triangle"; pad.frequency.value = 220;
      pg.gain.setValueAtTime(0.0001, t);
      pg.gain.exponentialRampToValueAtTime(0.07, t + 0.4);
      pg.gain.exponentialRampToValueAtTime(0.0001, t + 3.2);
      pad.connect(pg); pg.connect(ctx.destination);
      pad.start(t); pad.stop(t + 3.4);
      [[440.0, 0], [554.37, 0.35], [659.25, 0.7], [880.0, 1.1]].forEach(([f, d]) => bell(ctx, f, t + d, 0.16, 2.2));
    } catch (e) {}
  };

  /* ------- counting (queue-first, atomic sync) ------- */
  const addCount = (n, e) => {
    if (!dataReady) return; // never write on top of unloaded data
    const prevC = todayCount;
    const nextC = Math.max(prevC + n, 0);
    if (prevC < DAILY_GOAL && nextC >= DAILY_GOAL) playComplete();
    else if (Math.floor(nextC / 100) > Math.floor(prevC / 100)) playMilestone();
    else playDrop();

    setDays((prev) => {
      const updated = { ...prev, [today]: Math.max((prev[today] || 0) + n, 0) };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
    queueDelta(today, n);
    setPending((p) => p + Math.abs(n));
    scheduleFlush();

    if (e && n === 1) {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r.slice(-6), { id }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 900);
    }
  };
  const undoOne = () => { if (todayCount > 0) addCount(-1); };

  /* ------- presence board ------- */
  const loadBoard = useCallback(async () => {
    setBoardLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id,name,country_flag,streak,last_active")
        .order("last_active", { ascending: false, nullsFirst: false })
        .limit(60);
      const cutoff = Date.now() - 24 * 3600 * 1000;
      setBoard((data || []).filter((p) => p.last_active && new Date(p.last_active).getTime() > cutoff));
      const { data: total } = await supabase.rpc("ummah_total");
      if (total !== null && total !== undefined) setUmmahTotal(Number(total));
      const { data: act } = await supabase.rpc("ummah_active_count");
      if (act !== null && act !== undefined) setUmmahActive(Number(act));
    } catch (e) { setBoard([]); }
    setBoardLoading(false);
  }, []);
  useEffect(() => { if (tab === "board" && session && profile) loadBoard(); }, [tab, session, profile, loadBoard]);

  /* ------- auth actions ------- */
  const signInGoogle = async () => {
    setAuthBusy(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
  };
  const signInEmail = async () => {
    if (!email.trim()) return;
    setAuthBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    setAuthBusy(false);
    if (!error) setEmailSent(true);
    else alert("Could not send the link. Check the email address and try again.");
  };
  const signOut = async () => {
    await flushQueue();
    await supabase.auth.signOut();
    setProfile(undefined); setDays({}); setDataReady(false);
  };

  const aliasFor = (uid) => "Servant #" + uid.replace(/-/g, "").slice(0, 4).toUpperCase();

  const createProfile = async () => {
    if (!session?.user) return;
    const finalName = obVis === "name" ? obName.trim() : aliasFor(session.user.id);
    if (!finalName) return;
    setAuthBusy(true);
    const row = {
      id: session.user.id,
      name: finalName.slice(0, 24),
      country_flag: obFlag,
      visibility: obVis,
      timezone: deviceTz(),
      today_date: dayKeyInTz(deviceTz()),
      last_active: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("profiles").upsert(row).select().single();
    setAuthBusy(false);
    if (!error) { setProfile(data); setDataReady(true); }
    else {
      console.error("profile save error:", error);
      alert("Could not save your profile: " + (error.message || JSON.stringify(error)));
    }
  };

  const updateVisibility = async (vis) => {
    if (!session?.user || !profile) return;
    const patch = { visibility: vis };
    if (vis !== "name" && !String(profile.name).startsWith("Servant #")) {
      patch.name = aliasFor(session.user.id);
    }
    const { data, error } = await supabase.from("profiles").update(patch).eq("id", session.user.id).select().single();
    if (!error) setProfile(data);
    else alert("Could not update: " + error.message);
  };

  const resetTimezone = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase.from("profiles")
      .update({ timezone: deviceTz() }).eq("id", session.user.id).select().single();
    if (!error) { setProfile(data); alert("Home timezone set to " + deviceTz()); }
  };

  /* ------- soft reminders (opt-in, user picks the time) ------- */
  const enableReminders = async (time) => {
    if (!session?.user) return;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) { alert("Reminders aren't configured yet."); return; }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Reminders need the app to be installed on your home screen. Open the browser menu and choose “Add to Home screen”, then try again.");
      return;
    }
    setPushBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setPushBusy(false);
        alert("No problem — you can turn reminders on any time from Settings.");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        });
      }
      const { data, error } = await supabase.from("profiles").update({
        reminder_enabled: true,
        reminder_time: time || profile?.reminder_time || "21:00",
        push_subscription: sub.toJSON(),
        timezone: profile?.timezone || deviceTz(),
      }).eq("id", session.user.id).select().single();
      if (error) throw error;
      setProfile(data);
    } catch (e) {
      console.error("reminder setup failed", e);
      alert("Could not set the reminder: " + (e.message || e));
    }
    setPushBusy(false);
  };

  const disableReminders = async () => {
    if (!session?.user) return;
    setPushBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    } catch (e) {}
    const { data } = await supabase.from("profiles")
      .update({ reminder_enabled: false, push_subscription: null })
      .eq("id", session.user.id).select().single();
    if (data) setProfile(data);
    setPushBusy(false);
  };

  const updateReminderTime = async (time) => {
    if (!session?.user) return;
    const { data } = await supabase.from("profiles")
      .update({ reminder_time: time }).eq("id", session.user.id).select().single();
    if (data) setProfile(data);
  };

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
      try { localStorage.removeItem(QUEUE_KEY); localStorage.removeItem(CACHE_KEY); } catch {}
      await supabase.auth.signOut();
      setProfile(undefined); setDays({}); setSession(null);
    } catch (e) {
      alert("Could not delete the account: " + (e.message || e));
    }
  };

  /* ================================================================ */
  /* Screens                                                          */
  /* ================================================================ */

  /* ------- the intro: why a thousand ------- */
  if (introStep !== null) {
    const s = INTRO[introStep];
    const last = introStep === INTRO.length - 1;
    const finish = () => {
      try { localStorage.setItem("intro-seen", "1"); } catch (e) {}
      setIntroStep(null);
    };
    return (
      <Shell>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "36px 22px 40px", position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* progress pips */}
          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {INTRO.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= introStep ? C.gold : C.line }} />
            ))}
          </div>

          <div className="fadeUp" key={introStep} style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", color: C.gold, marginBottom: 12 }}>{s.k}</div>
            <div className="display" style={{ fontSize: 30, fontWeight: 600, lineHeight: 1.25, marginBottom: 18 }}>{s.h}</div>
            {s.ar && (
              <div className="amiri" style={{ fontSize: 25, color: C.goldBright, lineHeight: 2, marginBottom: 14, textAlign: "center" }}>{s.ar}</div>
            )}
            <div style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.75, whiteSpace: "pre-line" }}>{s.body}</div>
            {s.src && (
              <div style={{ fontSize: 12, color: C.faint, marginTop: 14, fontStyle: "italic" }}>— {s.src}</div>
            )}
          </div>

          <div style={{ marginTop: 28 }}>
            <button onClick={() => (last ? finish() : setIntroStep(introStep + 1))} style={goldBtn}>
              {last ? "Begin" : "Continue"}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => introStep > 0 && setIntroStep(introStep - 1)}
                style={{ background: "none", border: "none", color: introStep > 0 ? C.muted : "transparent", fontSize: 13, cursor: "pointer", padding: 4 }}>
                ← Back
              </button>
              {!last && (
                <button onClick={finish} style={{ background: "none", border: "none", color: C.faint, fontSize: 13, cursor: "pointer", padding: 4 }}>
                  Skip
                </button>
              )}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (session === undefined) {
    return <Shell><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Opening…</div></Shell>;
  }

  /* ------- login ------- */
  if (!session) {
    return (
      <Shell>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 22px", position: "relative" }} className="fadeUp">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="amiri" style={{ fontSize: 40, color: C.goldBright, lineHeight: 1.6 }}>أَسْتَغْفِرُ الله</div>
            <div className="display" style={{ fontSize: 34, fontWeight: 600, marginTop: 8 }}>{APP_NAME}</div>
            <div style={{ fontSize: 12, color: C.faint, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>The Istighfar Companion</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 18, lineHeight: 1.6 }}>
              1,000 istighfar a day — kept quietly, or anonymously alongside believers around the world.
            </div>
          </div>

          <button onClick={signInGoogle} disabled={authBusy}
            style={{ ...goldBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: authBusy ? 0.7 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#1B1508" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.9 4.5 29.7 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5c11 0 21-8 21-21.5 0-1.4-.2-2.7-.5-4z"/></svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", color: C.faint, fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: C.line }} /> or <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          {!emailSent ? (
            <>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                onKeyDown={(e) => e.key === "Enter" && signInEmail()} style={{ ...inputStyle, marginBottom: 10 }} />
              <button onClick={signInEmail} disabled={authBusy}
                style={{ ...goldBtn, background: C.surface2, color: C.ivory, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Mail size={16} /> Email me a sign-in link
              </button>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 10, textAlign: "center" }}>No password needed — we email you a secure link.</div>
            </>
          ) : (
            <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 14, padding: 18, textAlign: "center", fontSize: 14, lineHeight: 1.6 }}>
              ✉️ Check your inbox — we sent a sign-in link to <b>{email}</b>. Open it on this device.
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 26 }}>
            <a href="/privacy" style={{ fontSize: 12, color: C.faint }}>Privacy Policy</a>
          </div>
        </div>
      </Shell>
    );
  }

  /* ------- onboarding ------- */
  if (profile === null) {
    const visOptions = [
      { id: "anon", title: "Join anonymously", desc: "You appear only as “Servant #XXXX” with your flag. Nothing identifies you. (Recommended)" },
      { id: "private", title: "Hidden deed", desc: "You appear to no one at all. “The best charity is that which the left hand does not know of.”" },
      { id: "name", title: "Show my name", desc: "Your chosen name is visible to other members." },
    ];
    return (
      <Shell>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "44px 22px", position: "relative" }} className="fadeUp">
          <div className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>As-salamu alaykum 👋</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
            Choose how you'd like to be present. Concealing your worship is the default here — it is the safer path for the heart.
          </div>

          <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>Privacy</label>
          <div style={{ margin: "8px 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {visOptions.map((v) => {
              const active = obVis === v.id;
              return (
                <button key={v.id} onClick={() => setObVis(v.id)}
                  style={{ textAlign: "left", background: active ? C.surface2 : C.surface, border: `1px solid ${active ? C.gold : C.line}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", color: C.ivory }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: active ? C.goldBright : C.ivory }}>{active ? "● " : "○ "}{v.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>{v.desc}</div>
                </button>
              );
            })}
          </div>

          {obVis === "name" ? (
            <>
              <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>Your name</label>
              <input value={obName} onChange={(e) => setObName(e.target.value)} placeholder="e.g. Yusuf" maxLength={24}
                style={{ ...inputStyle, margin: "6px 0 16px" }} />
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: C.muted, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", margin: "0 0 16px", lineHeight: 1.5 }}>
              No name needed — your record stays between you and Allah.
            </div>
          )}

          <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>Your country</label>
          <select value={obFlag} onChange={(e) => setObFlag(e.target.value)} style={{ ...inputStyle, margin: "6px 0 22px" }}>
            {COUNTRIES.map(([flag, cname]) => (<option key={cname} value={flag}>{flag}  {cname}</option>))}
          </select>

          <button onClick={createProfile} disabled={authBusy || (obVis === "name" && !obName.trim())}
            style={{ ...goldBtn, opacity: authBusy || (obVis === "name" && !obName.trim()) ? 0.6 : 1 }}>
            Begin the journey →
          </button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <a href="/privacy" style={{ fontSize: 12, color: C.faint }}>Privacy Policy</a>
          </div>
        </div>
      </Shell>
    );
  }

  if (profile === undefined) {
    return <Shell><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading your journey…</div></Shell>;
  }

  const daily = BENEFITS[dailyIdx];
  const benefit = BENEFITS[browseIdx];
  const myBand = bandFor(streak);
  const { cur: level, next: nextLevel } = levelFor(completedDays);
  const nextMilestone = MILESTONES.find((m) => m.days > completedDays) || null;
  const showRemindPrompt =
    !profile.reminder_enabled && !remindDismissed && completedDays >= 3;

  return (
    <Shell>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "20px 18px 96px", position: "relative" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="display" style={{ fontSize: 26, fontWeight: 600, letterSpacing: 0.5 }}>{APP_NAME}</div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: 2.5, textTransform: "uppercase" }}>
              {profile.country_flag} {profile.visibility === "name" ? profile.name : "You"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSoundOn(!soundOn)} aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
              style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: 8, cursor: "pointer", display: "flex", color: soundOn ? C.gold : C.faint }}>
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 12px" }}>
              <Flame size={15} color={streak > 0 ? C.gold : C.faint} fill={streak > 0 ? C.gold : "none"} />
              <span style={{ fontSize: 14, fontWeight: 600, color: streak > 0 ? C.goldBright : C.muted }}>{streak}</span>
            </div>
            <button onClick={signOut} aria-label="Sign out"
              style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: 8, cursor: "pointer", display: "flex", color: C.faint }}>
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* sync banners */}
        {loadFailed && (
          <div style={{ background: "#3A2415", border: `1px solid ${C.warn}66`, borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <CloudOff size={16} color={C.warn} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Couldn't reach your saved progress</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.45 }}>
                Counting is paused so nothing already recorded gets overwritten.
              </div>
              <button onClick={loadAll} style={{ marginTop: 8, background: C.warn, color: "#1B1508", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                Try again
              </button>
            </div>
          </div>
        )}
        {!loadFailed && pending > 0 && (
          <div style={{ fontSize: 11.5, color: C.faint, textAlign: "center", marginBottom: 8 }}>
            {savingNote || `${pending} waiting to sync — safe on this device`}
          </div>
        )}

        {/* COUNT */}
        {tab === "count" && (
          <div className="fadeUp">
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button onClick={(e) => addCount(1, e)} disabled={!dataReady} aria-label="Count one istighfar"
                style={{
                  position: "relative", width: 290, height: 290, borderRadius: "50%",
                  background: `radial-gradient(circle at 50% 42%, ${C.surface2}, ${C.surface} 70%)`,
                  border: "none", cursor: dataReady ? "pointer" : "not-allowed", opacity: dataReady ? 1 : 0.5,
                  animation: pct >= 1 ? "pulseGlow 2.4s ease-in-out infinite" : "none",
                  transition: "transform .08s ease",
                }}
                onPointerDown={(e) => { if (dataReady) e.currentTarget.style.transform = "scale(.97)"; }}
                onPointerUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                onPointerLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <svg width="290" height="290" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="145" cy="145" r="136" fill="none" stroke={C.ringTrack} strokeWidth="7" />
                  <circle cx="145" cy="145" r="136" fill="none"
                    stroke={pct >= 1 ? C.goldBright : C.gold} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 136}
                    strokeDashoffset={2 * Math.PI * 136 * (1 - pct)}
                    style={{ transition: "stroke-dashoffset .35s ease" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                  <div className="amiri" style={{ fontSize: 30, color: C.goldBright, lineHeight: 1.4 }}>أَسْتَغْفِرُ الله</div>
                  <div style={{ fontSize: 54, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{todayCount}</div>
                  <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1.5 }}>of {DAILY_GOAL} today</div>
                  {pct >= 1 && <div style={{ fontSize: 12, color: C.goldBright, marginTop: 4 }}>✦ Goal complete — keep going ✦</div>}
                </div>
                {ripples.map((r) => (
                  <div key={r.id} style={{ position: "absolute", left: "50%", top: "38%", color: C.goldBright, fontSize: 18, fontWeight: 600, pointerEvents: "none", animation: "rise .9s ease-out forwards" }}>+1</div>
                ))}
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: C.faint, marginTop: 10 }}>
              {dataReady ? "Tap the circle with every recitation" : "Waiting for your saved progress…"}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              {[33, 100].map((n) => (
                <button key={n} onClick={() => addCount(n)} disabled={!dataReady}
                  style={{ background: C.surface, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: dataReady ? 1 : 0.5 }}>
                  +{n}
                </button>
              ))}
              <button onClick={undoOne} disabled={!dataReady} aria-label="Undo one"
                style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: dataReady ? 1 : 0.5 }}>
                <RotateCcw size={14} /> Undo
              </button>
            </div>

            <div style={{ marginTop: 22, textAlign: "center", fontSize: 12.5, color: C.faint, fontStyle: "italic", lineHeight: 1.5, padding: "0 10px" }}>
              {NIYAT[niyatIdx]}
            </div>

            <div style={{ marginTop: 22, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: CAT_COLOR[daily.c], marginBottom: 6 }}>Today's reminder · {daily.c}</div>
              <div className="display" style={{ fontSize: 19, fontWeight: 600, marginBottom: 6 }}>{daily.t}</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{daily.b}</div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8, fontStyle: "italic" }}>{daily.s}</div>
            </div>

            {/* soft, delayed invitation — never on day one */}
            {showRemindPrompt && (
              <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>Would a daily reminder help?</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                  One quiet message a day, at a time you choose. You can turn it off whenever you like.
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setTab("journey")}
                    style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                    Set a time
                  </button>
                  <button onClick={() => setRemindDismissed(true)}
                    style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                    Not now
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* BENEFITS */}
        {tab === "benefits" && (
          <div className="fadeUp">
            <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 18, padding: 22, marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: CAT_COLOR[benefit.c], marginBottom: 8 }}>Benefit {browseIdx + 1} of {BENEFITS.length} · {benefit.c}</div>
              <div className="display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 10 }}>{benefit.t}</div>
              <div style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.9 }}>{benefit.b}</div>
              <div style={{ fontSize: 12, color: C.faint, marginTop: 12, fontStyle: "italic" }}>{benefit.s}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button onClick={() => setBrowseIdx((browseIdx - 1 + BENEFITS.length) % BENEFITS.length)}
                  style={{ background: C.surface, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>← Previous</button>
                <button onClick={() => {
                    let r = Math.floor(Math.random() * BENEFITS.length);
                    if (r === browseIdx) r = (r + 1) % BENEFITS.length;
                    setBrowseIdx(r);
                  }}
                  style={{ background: C.surface2, color: C.goldBright, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>🎲 Shuffle</button>
                <button onClick={() => setBrowseIdx((browseIdx + 1) % BENEFITS.length)}
                  style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>Next →</button>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.6, padding: "0 6px" }}>
              Quran & Hadith entries are direct textual promises with references. Scholars & Reflection entries are scholarly wisdom and spiritual insight — presented as such, never as scripture.
            </div>
          </div>
        )}

        {/* UMMAH — presence, not ranking */}
        {tab === "board" && (
          <div className="fadeUp">
            <div className="display" style={{ fontSize: 21, fontWeight: 600, marginBottom: 4 }}>The Ummah, Right Now</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
              Not a ranking — just company. No positions, no totals, no comparison.
            </div>

            {ummahActive !== null && (
              <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 20, marginBottom: 12, textAlign: "center" }}>
                <div className="display" style={{ fontSize: 34, fontWeight: 600, color: C.goldBright }}>{ummahActive.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>believers making istighfar with you today</div>
              </div>
            )}
            {ummahTotal !== null && (
              <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>🤲 Together as one Ummah</div>
                <div className="display" style={{ fontSize: 22, fontWeight: 600 }}>{ummahTotal.toLocaleString()}</div>
                <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>istighfar through this app — every member counted, seen and unseen</div>
              </div>
            )}

            {boardLoading && <div style={{ color: C.faint, fontSize: 14, padding: 20, textAlign: "center" }}>Loading…</div>}
            {!boardLoading && board && board.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13.5, background: C.surface, borderRadius: 14, padding: 20, textAlign: "center", lineHeight: 1.6 }}>
                No one visible right now — but those who conceal their worship are never counted as absent. 🌙
              </div>
            )}
            {!boardLoading && board && board.map((p) => {
              const isMe = p.id === session.user.id;
              const band = bandFor(p.streak || 0);
              return (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8,
                  background: isMe ? C.surface2 : C.surface, borderRadius: 14,
                  border: `1px solid ${isMe ? C.gold + "66" : C.line}`,
                }}>
                  <div style={{ fontSize: 20 }}>{p.country_flag || "🌍"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.name}{isMe && <span style={{ color: C.gold, fontSize: 11, marginLeft: 6 }}>you</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: band.color }}>{band.label}</div>
                  </div>
                  <Flame size={15} color={p.streak > 0 ? C.gold : C.faint} fill={p.streak > 0 ? C.gold : "none"} />
                </div>
              );
            })}
            {!boardLoading && (
              <button onClick={loadBoard} style={{ width: "100%", marginTop: 6, background: "transparent", color: C.muted, border: `1px dashed ${C.line}`, borderRadius: 12, padding: 11, cursor: "pointer", fontSize: 13 }}>
                Refresh
              </button>
            )}
          </div>
        )}

        {/* JOURNEY + SETTINGS */}
        {tab === "journey" && (
          <div className="fadeUp">
            <div className="display" style={{ fontSize: 21, fontWeight: 600, marginBottom: 4 }}>Your Journey</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18, lineHeight: 1.55 }}>
              Measured in days completed, not in unbroken chains. Illness and travel take nothing away from you.
            </div>

            {/* LEVEL */}
            <div style={{ background: C.surface2, border: `1px solid ${level.ring}55`, borderRadius: 18, padding: 20, marginBottom: 12, textAlign: "center" }}>
              <div className="amiri" style={{ fontSize: 26, color: level.ring, lineHeight: 1.6 }}>{level.ar}</div>
              <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{level.name}</div>
              <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.faint, marginTop: 2 }}>
                Level {level.id} · {level.en}
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, lineHeight: 1.55, fontStyle: "italic" }}>{level.note}</div>

              {nextLevel && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 8, background: C.ringTrack, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(((completedDays - level.days) / (nextLevel.days - level.days)) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${level.ring}, ${nextLevel.ring})`,
                      borderRadius: 999, transition: "width .5s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.faint, marginTop: 6 }}>
                    {nextLevel.days - completedDays} days to {nextLevel.name} ({nextLevel.en})
                  </div>
                </div>
              )}
              {!nextLevel && (
                <div style={{ fontSize: 12, color: C.goldBright, marginTop: 14 }}>✦ Every promise of Surah Nuh, walked through ✦</div>
              )}
            </div>

            {/* DAYS COMPLETED */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span className="display" style={{ fontSize: 34, fontWeight: 600, color: C.goldBright }}>{completedDays}</span>
                <span style={{ fontSize: 13, color: C.muted }}>
                  {nextMilestone ? `of ${nextMilestone.days} — ${nextMilestone.label}` : "days completed"}
                </span>
              </div>
              <div style={{ height: 10, background: C.ringTrack, borderRadius: 999, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${nextMilestone ? Math.min((completedDays / nextMilestone.days) * 100, 100) : 100}%`,
                  background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, borderRadius: 999, transition: "width .5s ease",
                }} />
              </div>
            </div>

            {/* MILESTONES — quiet, personal, never announced */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 10 }}>Milestones</div>
              {MILESTONES.map((m) => {
                const done = completedDays >= m.days;
                return (
                  <div key={m.days} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <span style={{ fontSize: 14, color: done ? C.goldBright : C.faint, width: 18 }}>{done ? "✦" : "○"}</span>
                    <span style={{ fontSize: 13.5, color: done ? C.ivory : C.faint, flex: 1 }}>{m.label}</span>
                    <span style={{ fontSize: 11.5, color: C.faint }}>{m.days}d</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Current streak", value: `${streak} days` },
                { label: "Consistency", value: myBand.label },
                { label: "Lifetime istighfar", value: totalAll.toLocaleString() },
                { label: "Days completed", value: `${completedDays}` },
              ].map((s) => (
                <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
                  <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 4 }}>{s.label}</div>
                  <div className="display" style={{ fontSize: 20, fontWeight: 600 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, background: C.surface2, borderRadius: 16, padding: 18, border: `1px solid ${C.line}` }}>
              <div className="amiri" style={{ fontSize: 21, color: C.goldBright, textAlign: "center", lineHeight: 2 }}>
                فَقُلْتُ اسْتَغْفِرُوا رَبَّكُمْ إِنَّهُ كَانَ غَفَّارًا
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, textAlign: "center", marginTop: 6, fontStyle: "italic" }}>
                "Ask forgiveness of your Lord — indeed, He is ever a Perpetual Forgiver." — Surah Nuh 71:10
              </div>
            </div>

            {/* ---------- SETTINGS ---------- */}
            <div className="display" style={{ fontSize: 19, fontWeight: 600, margin: "30px 0 10px" }}>Settings</div>

            {/* DAILY REMINDER — off by default, one a day, easy to stop */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 8 }}>Daily reminder</div>

              {profile.reminder_enabled ? (
                <>
                  <div style={{ fontSize: 13.5, marginBottom: 10, lineHeight: 1.5 }}>
                    On — one reminder at <b style={{ color: C.goldBright }}>{profile.reminder_time}</b>, only if the day is still incomplete.
                  </div>
                  <label style={{ fontSize: 11.5, color: C.faint }}>Change the time</label>
                  <input type="time" value={profile.reminder_time || "21:00"}
                    onChange={(e) => updateReminderTime(e.target.value)}
                    style={{ ...inputStyle, margin: "6px 0 10px" }} />
                  <button onClick={disableReminders} disabled={pushBusy}
                    style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                    {pushBusy ? "Please wait…" : "Turn reminders off"}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>
                    Off. If you turn it on, you'll get one quiet message a day at the time you choose — and nothing at all on days you've already finished.
                  </div>
                  <label style={{ fontSize: 11.5, color: C.faint }}>Remind me at</label>
                  <input type="time" defaultValue={profile.reminder_time || "21:00"} id="remind-time"
                    onChange={(e) => updateReminderTime(e.target.value)}
                    style={{ ...inputStyle, margin: "6px 0 10px" }} />
                  <button onClick={() => enableReminders(profile.reminder_time || "21:00")} disabled={pushBusy}
                    style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13.5, cursor: "pointer" }}>
                    {pushBusy ? "Setting up…" : "Turn on the reminder"}
                  </button>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.45 }}>
                    Works best when the app is added to your home screen.
                  </div>
                </>
              )}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 10 }}>Who can see you</div>
              {[
                { id: "anon", label: "Anonymous — alias and flag only" },
                { id: "private", label: "Hidden deed — visible to no one" },
                { id: "name", label: "Show my name" },
              ].map((v) => {
                const active = profile.visibility === v.id;
                return (
                  <button key={v.id} onClick={() => updateVisibility(v.id)}
                    style={{ display: "block", width: "100%", textAlign: "left", background: active ? C.surface2 : "transparent", border: `1px solid ${active ? C.gold : C.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, color: active ? C.goldBright : C.ivory, fontSize: 13.5, cursor: "pointer" }}>
                    {active ? "● " : "○ "}{v.label}
                  </button>
                );
              })}
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 6, lineHeight: 1.5 }}>
                Currently shown as: {profile.country_flag} {profile.visibility === "private" ? "— hidden from everyone" : profile.name}
              </div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 6 }}>Home timezone</div>
              <div style={{ fontSize: 13.5, marginBottom: 8 }}>{profile.timezone || "Asia/Kolkata"}</div>
              <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.5, marginBottom: 10 }}>
                Your day starts and ends in this zone, so travelling never breaks your streak.
              </div>
              <button onClick={resetTimezone}
                style={{ background: C.surface2, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, cursor: "pointer" }}>
                Set to this device ({deviceTz()})
              </button>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <button onClick={() => setIntroStep(0)}
                style={{ background: "none", border: "none", color: C.gold, fontSize: 13.5, cursor: "pointer", padding: 0 }}>
                Why a thousand? →
              </button>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>Read the reasoning again, any time.</div>
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <a href="/privacy" style={{ fontSize: 13.5, color: C.gold }}>Privacy Policy →</a>
            </div>

            <div style={{ background: C.surface, border: "1px solid #4A2020", borderRadius: 14, padding: 16, marginBottom: 30 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#C87070", marginBottom: 8 }}>Danger zone</div>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  style={{ background: "transparent", color: "#C87070", border: "1px solid #6A2A2A", borderRadius: 10, padding: "10px 14px", fontSize: 13, cursor: "pointer" }}>
                  Delete my account
                </button>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>
                    This permanently removes your profile, every daily record, and your sign-in. It cannot be undone.
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={deleteAccount}
                      style={{ background: "#8A2A2A", color: "#FFF", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Yes, delete everything
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.surface}F2`, backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "10px 8px 16px", zIndex: 10,
      }}>
        {[
          { id: "count", icon: Flame, label: "Count" },
          { id: "benefits", icon: BookOpen, label: "Benefits" },
          { id: "board", icon: Globe2, label: "Ummah" },
          { id: "journey", icon: Map, label: "Journey" },
        ].map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} aria-label={t.label}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? C.goldBright : C.faint, padding: "2px 14px" }}>
              <Icon size={20} />
              <span style={{ fontSize: 10.5, letterSpacing: 0.5, fontWeight: active ? 700 : 400 }}>{t.label}</span>
            </button>
          );
        })}
      </nav>
    </Shell>
  );
}
