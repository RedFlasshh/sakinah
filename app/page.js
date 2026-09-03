"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Flame, BookOpen, Globe2, Map, RotateCcw, Volume2, VolumeX, LogOut, Mail, CloudOff, X } from "lucide-react";
import { LANGS, flagToLang, makeT } from "./i18n";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
// Neutral/functional text tones — fixed across every level for readability.
// Only bg/surface/line/gold/ring shift per level (see LEVELS below); those
// are what carry the "more royal" feeling as the journey progresses.
const NEUTRALS = { ivory: "#F4EFE2", muted: "#8BA79A", faint: "#5C776C", warn: "#D98F4E" };
const C = {
  ...NEUTRALS,
  bg: "#0B1917", surface: "#122622", surface2: "#1A332D", line: "#22423A",
  gold: "#C9A24B", goldBright: "#E8CD86", ringTrack: "#1E3A33",
};

// A function, not a module-level constant: Capacitor's bridge (window.Capacitor)
// attaches asynchronously, and this module can finish evaluating before it
// does — a constant computed once at parse time would freeze in as `false`
// and never notice the bridge arriving a moment later. Calling this fresh
// wherever it's needed avoids that race entirely.
const isNativeApp = () => typeof window !== "undefined" && !!window.Capacitor?.isNativePlatform?.();
const NATIVE_REDIRECT_URL = "mustaghfirin://login-callback";

const APP_NAME = "Al-Mustaghfirin";   // "…and those who seek forgiveness before dawn." — Quran 3:17
const DAILY_GOAL = 1000;
const JOURNEY_DAYS = 180;
const QUEUE_KEY = "sakinah-queue"; // offline pending deltas
const CACHE_KEY = "sakinah-cache"; // last known counts, for offline display
const LANG_KEY = "app-lang";
const GUEST_KEY = "guest-mode";      // "1" when using the app without an account
const GUEST_DAYS = "guest-days";     // guest counts live here (device-only)
const CONTACT_EMAIL = "ygm786@gmail.com"; // corrections & privacy contact — keep in sync with privacy page
const LEVEL_SEEN_KEY = "sakinah-level-seen"; // highest level id already celebrated, so the level-up modal fires once per level, on the device that earns it

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
  { t: "More Than Erasure", b: "Istighfar isn't a delete key for sin — it repairs the bond that sin fractured, between you and your Lord.", s: "Reflection", c: "Reflection" },
  { t: "The Veil Lifted", b: "“Rather, the stain has covered their hearts of that which they were earning.” Istighfar wipes away that stain — restoring what sin had veiled.", s: "Quran — Al-Mutaffifin 83:14", c: "Quran" },
  { t: "Two Ropes, One Pull", b: "Every sin frays two lines at once — your tie to Allah and your tie to those around you. Istighfar mends both together.", s: "Reflection", c: "Reflection" },
  { t: "From Estrangement to Belonging", b: "Sin leaves a quiet distance, even from your own family and friends. Returning to Allah has a way of restoring ease with people too.", s: "Scholars & Reflection", c: "Reflection" },
  { t: "One Word, Every Ripple", b: "Rain, wealth, children, gardens, rivers — in Surah Nuh a single word ripples outward until it touches everything around you.", s: "Reflection — on Quran Nuh 71:10–12", c: "Reflection" },
  { t: "A Comma, Not a Full Stop", b: "Sin tempts you to believe the story is over. Istighfar turns the full stop into a comma — the sentence with Allah continues.", s: "Reflection", c: "Reflection" },
  { t: "The Vertical and the Horizontal", b: "One line connects you to Allah, another to His creation. Neglect either and both weaken — istighfar strengthens each at once.", s: "Scholars & Reflection", c: "Reflection" },
  { t: "Realigning With Your Fitrah", b: "Every soul is created inclined toward its Lord; sin pulls it off course. Istighfar is the return to that original alignment.", s: "Reflection", c: "Reflection" },
  { t: "Yunus in the Belly of the Whale", b: "“There is no god but You, glory be to You — I have indeed been of the wrongdoers.” The Prophet ﷺ said no Muslim ever calls on Allah with this dua for anything except He answers it.", s: "Hadith — Tirmidhi, on Quran 21:87", c: "Hadith" },
  { t: "The King Who Began With Forgiveness", b: "Before asking for a kingdom unmatched by anyone after him, Sulaiman (AS) first said: “My Lord, forgive me.” Even the ask was preceded by istighfar.", s: "Quran — Sad 38:35", c: "Quran" },
  { t: "Humanity's First Dua", b: "After the very first sin on earth, the words taught to Adam and Hawwa to say back to Allah were words of istighfar — the first human dua was itself a request for forgiveness.", s: "Quran — Al-A'raf 7:23", c: "Quran" },
  { t: "Clearing the Line First", b: "Scholars often describe sin as static on the line between servant and Lord — istighfar clears the line before the request is even spoken.", s: "Scholars & Reflection", c: "Reflection" },
  { t: "The Order Matters", b: "Confess, then ask. From Adam to Yunus to Sulaiman, istighfar wasn't a footnote to dua — it was the opening line.", s: "Reflection", c: "Reflection" },
  { t: "Sealing Every Gathering", b: "The Prophet ﷺ taught closing even good gatherings with a set istighfar — “Kaffaratul-Majlis” — sealing whatever slipped in along the way.", s: "Hadith — Abu Dawud, Tirmidhi", c: "Hadith" },
  { t: "Counted, Not Estimated", b: "His companions reported counting him seek forgiveness a hundred times in a single sitting — not a rough guess, an actual count.", s: "Hadith — Abu Dawud, Tirmidhi, Ibn Majah", c: "Hadith" },
  { t: "An Opening and a Closing Seal", b: "Istighfar bookended his day — among the remembrances at waking, and again before sleep.", s: "Reflection", c: "Reflection" },
  { t: "More Than a Formula", b: "It wasn't recited on autopilot. Those around him describe a man visibly present in it — a habit lived, not just repeated.", s: "Reflection", c: "Reflection" },
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
// Shifts a "YYYY-MM-DD" key by a whole number of calendar days, in UTC-
// midnight arithmetic — deliberately NOT "add offsetDays*24h to the current
// instant and reformat in tz". That approach breaks across DST transitions
// (a civil day can be 23h or 25h of real elapsed time in a DST-observing
// zone), which could skip or repeat a day in a streak walk or chart range.
// Calendar-component arithmetic in UTC has no DST to break, by construction.
const shiftDayKeyFrom = (dayKey, offsetDays) => {
  const [y, m, d] = dayKey.split("-").map(Number);
  const shifted = new Date(Date.UTC(y, m - 1, d) + offsetDays * 86400000);
  const yyyy = shifted.getUTCFullYear();
  const mm = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(shifted.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const shiftDayKey = (tz, offsetDays) => shiftDayKeyFrom(dayKeyInTz(tz), offsetDays);

const computeStreak = (days, tz) => {
  let streak = 0;
  let i = 0;
  if ((days[dayKeyInTz(tz)] || 0) < DAILY_GOAL) i = -1;
  while (true) {
    const k = shiftDayKey(tz, i);
    if ((days[k] || 0) >= DAILY_GOAL) { streak++; i--; }
    else break;
  }
  return streak;
};

/* Consistency band — labels are translated at render time via bandKey */
const bandFor = (streak) => {
  if (streak >= 100) return { key: "band_steadfast", color: C.goldBright };
  if (streak >= 40) return { key: "band_consistent", color: C.gold };
  if (streak >= 7) return { key: "band_building", color: "#3FAE7C" };
  if (streak >= 1) return { key: "band_underway", color: C.muted };
  return { key: "band_returning", color: C.faint };
};

/* Each level carries a full palette. The app's whole visual theme (bg,
   surfaces, borders, gold accents) is read from the current level's theme —
   see `const C = level.theme` inside the component — so the interface
   itself deepens as the journey progresses, not just one badge. Neutral
   text tones (ivory/muted/faint/warn) stay fixed across levels for
   readability; bg/surface/line/gold/ring are what carry the "more royal"
   feeling, moving teal → emerald → gold → sapphire → royal violet+gold. */
const LEVELS = [
  { id: 1, name: "Qatrah", en: "A Drop", days: 0, ar: "قَطْرَة",
    note: "Every rain begins with one drop. You have begun.",
    theme: { ...NEUTRALS, bg: "#0B1917", surface: "#122622", surface2: "#1A332D", line: "#22423A", ringTrack: "#1E3A33", gold: "#C9A24B", goldBright: "#E8CD86", ring: "#7FB3D5" } },
  { id: 2, name: "Wabl", en: "Downpour", days: 7, ar: "وَابِل",
    note: "“Like a garden on a hill: heavy rain (wabil) falls on it, and it yields double its harvest.” — Surah Al-Baqarah 2:265",
    theme: { ...NEUTRALS, bg: "#081920", surface: "#0E252E", surface2: "#14323E", line: "#1C4756", ringTrack: "#1A3F4C", gold: "#C9A24B", goldBright: "#E8CD86", ring: "#3EC6D9" } },
  { id: 3, name: "Chilla", en: "The Forty", days: 40, ar: "چِلَّہ",
    note: "Forty days of returning, without missing a single one. A discipline the righteous before us kept too.",
    theme: { ...NEUTRALS, bg: "#0A1B14", surface: "#10261C", surface2: "#163628", line: "#1F4A34", ringTrack: "#1D4230", gold: "#CBA84F", goldBright: "#EAD08A", ring: "#3FAE7C" } },
  { id: 4, name: "Nahr", en: "Stream", days: 100, ar: "نَهْر",
    note: "What fell as drops now runs as a stream — constant, not occasional.",
    theme: { ...NEUTRALS, bg: "#171B0A", surface: "#232810", surface2: "#333A16", line: "#4A5320", ringTrack: "#3E4820", gold: "#CFAC55", goldBright: "#ECD48F", ring: "#A9C23F" } },
  { id: 5, name: "Hadiqa", en: "Garden", days: 180, ar: "حَديقَة",
    note: "“And He will make for you gardens.” — Surah Nuh 71:12",
    theme: { ...NEUTRALS, bg: "#1A1509", surface: "#26200D", surface2: "#382E12", line: "#4E4118", ringTrack: "#463A16", gold: "#D4AD52", goldBright: "#F0D591", ring: "#C9A24B" } },
  { id: 6, name: "Anhar", en: "Rivers", days: 365, ar: "أَنْهَار",
    note: "“And He will make for you rivers.” A full year of returning, day after day.",
    theme: { ...NEUTRALS, bg: "#0D1220", surface: "#161C30", surface2: "#212B45", line: "#303E5E", ringTrack: "#2B3852", gold: "#D8B45A", goldBright: "#F2D998", ring: "#5B7FD4" } },
  { id: 7, name: "Baraka", en: "Blessing", days: 540, ar: "بَرَكَة",
    note: "Eighteen months in. What began as a habit has become a source of blessing in ways you can no longer separate from the practice itself.",
    theme: { ...NEUTRALS, bg: "#1F0E14", surface: "#2B141C", surface2: "#3E1C28", line: "#5A2838", ringTrack: "#4C2230", gold: "#DEBB63", goldBright: "#F5DE9F", ring: "#D46B8F" } },
  { id: 8, name: "Noor", en: "Light", days: 1080, ar: "نُور",
    note: "Three years of a tongue kept moist with istighfar. The Prophet ﷺ said dhikr is light — you are carrying it now.",
    theme: { ...NEUTRALS, bg: "#1F1608", surface: "#2B1F0C", surface2: "#3E2C12", line: "#5A4118", ringTrack: "#4C3714", gold: "#E4C56D", goldBright: "#FBEFC0", ring: "#F2DE8F" } },
  { id: 9, name: "Sakinah", en: "Tranquility", days: 1800, ar: "سَكِينَة",
    note: "Five years constant. “It is He who sent down tranquility (sakinah) into the hearts of the believers.” — Surah Al-Fath 48:4",
    theme: { ...NEUTRALS, bg: "#1C1030", surface: "#2A1846", surface2: "#3D2260", line: "#573182", ringTrack: "#4A2A70", gold: "#EACB74", goldBright: "#FBEBB0", ring: "#C9A2F0" } },
];
const levelFor = (completedDays) => {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (completedDays >= l.days) cur = l;
  const next = LEVELS.find((l) => l.days > completedDays) || null;
  return { cur, next };
};

// Derived straight from LEVELS (skipping Qatrah/day 0, the starting point,
// not a milestone) so the checklist can never drift out of sync with the
// level names/colors again — one source of truth instead of two lists that
// have to be kept in step by hand.
const MILESTONES = LEVELS.filter((l) => l.days > 0).map((l) => ({ days: l.days, label: `${l.name} — ${l.en}`, level: l }));

const INTRO = [
  {
    k: "Welcome",
    h: "Whoever you are, you are welcome here",
    body: "This is a quiet place to seek forgiveness from Allah — the practice Muslims call istighfar.\n\nYou do not need to be anything in particular to open this door. If you wish to turn to your Lord and ask His forgiveness, you belong here. Its mercy is offered to anyone who seeks it.",
    ar: null,
  },
  {
    k: "Why a thousand?",
    h: "Let's be honest first",
    body: "No hadith fixes the number at a thousand. The Prophet ﷺ, who carried no sin, sought forgiveness seventy to a hundred times a day.\n\nA thousand is not a ruling handed down to you. It is a commitment you choose — and that is exactly why it works.",
    ar: null,
  },
  {
    k: "One honest thing",
    h: "This is only a tracker",
    body: "Counting on your fingers is the Sunnah — the Prophet ﷺ counted dhikr on his right hand, and taught that the fingers will be asked, and will speak, on the Day of Judgement.\n\nYour fingers, a tasbeeh, or a simple counter are all better than a screen. This app only keeps the tally for you when it helps you stay constant. Never let the phone come between you and the dhikr.",
    src: "Abu Dawud, Tirmidhi",
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

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
};

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

/* ------------------------------------------------------------------ */
/* Encouragement messages — pre-written and safe. No fabricated hadith. */
/* Warmth and motivation only; any Quran/hadith here is verbatim and    */
/* attributed. Shown as a gentle card, one at a time.                   */
/* ------------------------------------------------------------------ */
const ENCOURAGE = {
  overachiever: [
    "Far beyond the day's goal, MashaAllah. May every word be written for you.",
    "You didn't stop at enough. That is a heart that has found something.",
    "The tongue that stays moist with dhikr — you are living it today.",
  ],
  streak: [
    "Days in a row now, quietly kept. Constancy is the whole secret.",
    "Little by little, without breaking. This is how hearts change.",
    "The promise was tied to those who keep constant — and you are keeping constant.",
  ],
  low: [
    "Even a little today is not nothing. Begin again, gently.",
    "No need to catch up all at once. One Astaghfirullah, then another.",
    "The door does not close because the day was small. Return to it.",
  ],
  returned: [
    "Welcome back. No guilt here — only that you came back, which is everything.",
    "Allah is more pleased with a servant's return than you can imagine. You returned.",
    "However long it's been, the door was never shut. Begin again today.",
  ],
};

/* Decide if a message is warranted, and which one. Returns {key, text} or null. */
const pickEncouragement = (days, tz, todayCount, streak) => {
  const pool = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // returned after a gap: 3+ days since any activity before today
  const activeDays = Object.keys(days).filter((d) => (days[d] || 0) > 0).sort();
  if (activeDays.length >= 2) {
    const prev = activeDays[activeDays.length - 2];
    const gapMs = new Date(dayKeyInTz(tz)) - new Date(prev);
    const gapDays = Math.round(gapMs / 86400000);
    if (todayCount > 0 && gapDays >= 3) return { key: "returned", text: pool(ENCOURAGE.returned) };
  }
  if (todayCount >= 2000) return { key: "overachiever", text: pool(ENCOURAGE.overachiever) };
  if (streak >= 7) return { key: "streak", text: pool(ENCOURAGE.streak) };
  return null; // low handled separately (organic, on the count screen)
};

/* Heatmap cell colour — intensity by fraction of the daily goal reached */
const heatColor = (val) => {
  if (val <= 0) return "#16302A";                 // empty
  const f = Math.min(val / DAILY_GOAL, 1);
  if (val >= DAILY_GOAL) return "#E8CD86";         // goal reached — brightest gold
  if (f >= 0.66) return "#C9A24B";
  if (f >= 0.33) return "#8A7636";
  return "#4A4327";                                // a little
};

/* Shell at module level — dir controls LTR/RTL for the whole app.
   theme defaults to the level-1 (Qatrah) palette so anything rendered
   before a level is known (e.g. a very first paint) still looks right;
   the component always passes its current level's theme explicitly. */
const Shell = ({ children, dir = "ltr", theme = C }) => (
  <div dir={dir} style={{ background: theme.bg, minHeight: "100vh", color: theme.ivory, position: "relative", overflow: "hidden", transition: "background 0.6s ease" }}>
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }}>
      <defs>
        <pattern id="star8" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M36 6 L43 29 L66 36 L43 43 L36 66 L29 43 L6 36 L29 29 Z" fill="none" stroke={theme.gold} strokeWidth="1" />
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
  const [dataReady, setDataReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [pending, setPending] = useState(0);
  const [tab, setTab] = useState("count");
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const moveStack = useRef({}); // { [dayKey]: [amounts...] } — for undoing whole moves
  const [dailyIdx, setDailyIdx] = useState(0);
  const [browseIdx, setBrowseIdx] = useState(0);
  const [niyatIdx, setNiyatIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [obName, setObName] = useState("");
  const [editName, setEditName] = useState(""); // settings: type a display name
  const [obFlag, setObFlag] = useState("🇮🇳");
  const [obVis, setObVis] = useState("anon");
  const [ummahTotal, setUmmahTotal] = useState(null);
  const [ummahActive, setUmmahActive] = useState(null);
  const [savingNote, setSavingNote] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [remindDismissed, setRemindDismissed] = useState(false);
  const [introStep, setIntroStep] = useState(null);
  const [lang, setLang] = useState("en");
  const [guest, setGuest] = useState(false); // using app without an account
  const [encourage, setEncourage] = useState(null); // {key, text} popup on open
  const [levelUp, setLevelUp] = useState(null); // level object, shown once when newly reached
  const [chartRange, setChartRange] = useState("week"); // week | month | quarter | year

  const flushTimer = useRef(null);
  const isFlushing = useRef(false);
  const audioRef = useRef(null);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;

  const tBase = makeT(lang);
  // Guest-mode strings kept inline (so i18n.js needn't change this round).
  const GUEST_T = {
    guest: { en: "Guest", ur: "مہمان" },
    continue_guest: { en: "Continue as guest", ur: "بطور مہمان جاری رکھیں" },
    continue_guest_sub: { en: "Start counting now — no account needed. You can sign in later to save.", ur: "ابھی شروع کریں — کسی اکاؤنٹ کی ضرورت نہیں۔ بعد میں محفوظ کرنے کے لیے سائن اِن کر سکتے ہیں۔" },
    guest_save_title: { en: "Save your progress", ur: "اپنی پیش رفت محفوظ کریں" },
    guest_save_desc: { en: "You're counting as a guest — your progress is saved on this device only. Sign in to back it up and reach it from any device. Your current count will carry over.", ur: "آپ بطور مہمان شمار کر رہے ہیں — آپ کی پیش رفت صرف اسی ڈیوائس پر محفوظ ہے۔ بیک اپ اور کسی بھی ڈیوائس سے رسائی کے لیے سائن اِن کریں۔ آپ کا موجودہ شمار منتقل ہو جائے گا۔" },
    guest_save_btn: { en: "Sign in to save", ur: "محفوظ کرنے کے لیے سائن اِن کریں" },
    guest_ummah_title: { en: "Join the ummah", ur: "امت میں شامل ہوں" },
    guest_ummah_desc: { en: "The ummah presence is for signed-in believers. Sign in to be counted among those making istighfar right now.", ur: "امت کی موجودگی سائن اِن شدہ مومنین کے لیے ہے۔ ابھی استغفار کرنے والوں میں شمار ہونے کے لیے سائن اِن کریں۔" },
  };
  const t = (key, vars) => {
    if (GUEST_T[key]) {
      let str = GUEST_T[key][lang] || GUEST_T[key].en;
      if (vars) for (const k in vars) str = str.replace(`{${k}}`, vars[k]);
      return str;
    }
    return tBase(key, vars);
  };
  const dir = LANGS[lang]?.dir || "ltr";

  const tz = profile?.timezone || deviceTz();
  const today = dayKeyInTz(tz);
  const todayCount = days[today] || 0;
  const streak = computeStreak(days, tz);
  const completedDays = Object.values(days).filter((v) => v >= DAILY_GOAL).length;
  const totalAll = Object.values(days).reduce((a, b) => a + b, 0);
  const pct = Math.min(todayCount / DAILY_GOAL, 1);

  // The current level's palette becomes THE app theme for this render — every
  // existing `C.xxx` reference below (there are ~300) picks this up via normal
  // JS shadowing, no per-callsite edits needed. Same for inputStyle/goldBtn,
  // which depend on C and so must be redefined locally alongside it.
  const { cur: level, next: nextLevel } = levelFor(completedDays);
  const C = level.theme;
  const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", color: C.ivory, fontSize: 15 };
  const goldBtn = { background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 15, cursor: "pointer", width: "100%" };

  useEffect(() => {
    const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    setDailyIdx(doy % BENEFITS.length);
    setBrowseIdx(Math.floor(Math.random() * BENEFITS.length));
    setNiyatIdx(Math.floor(Math.random() * NIYAT.length));
    try {
      if (!localStorage.getItem("intro-seen")) setIntroStep(0);
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang && LANGS[savedLang]) setLang(savedLang);
      if (localStorage.getItem(GUEST_KEY) === "1") setGuest(true);
    } catch (e) {}
  }, []);

  // Guest counting helpers — everything stays on the device
  const readGuestDays = () => {
    try { return JSON.parse(localStorage.getItem(GUEST_DAYS) || "{}"); } catch { return {}; }
  };
  const enterGuest = () => {
    try { localStorage.setItem(GUEST_KEY, "1"); } catch {}
    setGuest(true);
    setDays(readGuestDays());
    setDataReady(true);
    setLoadFailed(false);
  };
  const leaveGuestToLogin = () => {
    // keep guest data in place; it will migrate after a successful login
    try { localStorage.removeItem(GUEST_KEY); } catch {}
    setGuest(false);
  };

  const changeLang = (l) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
  };

  /* ------- auth session ------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Native app: Google sign-in opens in an in-app browser tab (Chrome Custom
  // Tabs via @capacitor/browser) since Google blocks its OAuth screen inside
  // embedded WebViews. This listens for the custom-scheme redirect back into
  // the app once that flow completes, and exchanges the PKCE code for a
  // session in the app's own WebView storage — without it, sign-in would
  // complete in the browser tab but never actually log the app in.
  useEffect(() => {
    if (!isNativeApp() || !window.Capacitor?.Plugins?.App) return;
    const handle = window.Capacitor.Plugins.App.addListener("appUrlOpen", async ({ url }) => {
      if (!url || !url.includes("login-callback")) return;
      try {
        const code = new URL(url).searchParams.get("code");
        if (code) await supabase.auth.exchangeCodeForSession(code);
      } catch (e) {
        console.error("Native sign-in exchange failed:", e);
      } finally {
        window.Capacitor.Plugins.Browser?.close();
      }
    });
    return () => { handle?.then?.((h) => h.remove()); };
  }, []);

  /* ------- load profile + counts ------- */
  const loadAll = useCallback(async () => {
    if (!session?.user) return;
    setLoadFailed(false);
    try {
      const { data: prof, error: pErr } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      if (pErr) throw pErr;
      setProfile(prof ?? null);
      if (!prof) { setDataReady(false); return; }
      try { localStorage.setItem("sakinah-profile", JSON.stringify(prof)); } catch {}

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
      // gentle encouragement popup — once per app open, only if warranted
      try {
        const shownToday = sessionStorage.getItem("enc-shown");
        if (!shownToday) {
          const tzNow = prof.timezone || deviceTz();
          const tc = map[dayKeyInTz(tzNow)] || 0;
          const st = computeStreak(map, tzNow);
          const msg = pickEncouragement(map, tzNow, tc, st);
          if (msg) { setEncourage(msg); sessionStorage.setItem("enc-shown", "1"); }
        }
      } catch (e) {}
    } catch (e) {
      console.error("load failed", e);
      // Offline / unreachable: fall back to cached profile + counts so the app
      // stays usable. Only lock counting if we truly have nothing cached.
      let cachedProfile = null;
      let cachedCounts = {};
      try { cachedProfile = JSON.parse(localStorage.getItem("sakinah-profile") || "null"); } catch {}
      try { cachedCounts = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch {}

      // apply any queued offline taps on top of the cached counts
      try {
        const q = readQueue();
        Object.entries(q).forEach(([d, delta]) => { cachedCounts[d] = Math.max((cachedCounts[d] || 0) + delta, 0); });
        setPending(Object.values(q).reduce((a, b) => a + Math.abs(b), 0));
      } catch {}

      setDays(cachedCounts);

      if (cachedProfile) {
        // We know who the user is and have their data — let them keep counting offline.
        setProfile((prev) => prev ?? cachedProfile);
        setDataReady(true);
        setLoadFailed(false);
      } else {
        // Nothing cached (brand-new user with no connection) — keep it locked.
        setDataReady(false);
        setLoadFailed(true);
      }
    }
  }, [session]);

  useEffect(() => {
    if (!session?.user) { setProfile(undefined); setDays({}); setDataReady(false); return; }
    loadAll();
  }, [session, loadAll]);

  // Level-up announcement: the whole app's theme changes silently on its own
  // (see `const C = level.theme` above) unless we tell the user why. Fires
  // once per level actually reached — never for level 1 (Qatrah), which is
  // everyone's starting point, not something to "congratulate". Waits for
  // dataReady so a fresh load (which starts from `days: {}`, i.e. level 1)
  // can't misfire before the real counts arrive. Existing users who update
  // into this feature already past level 1 will correctly see it once on
  // their next open, introducing the system rather than leaving them to
  // wonder why the app suddenly looks different.
  useEffect(() => {
    if (!dataReady || level.id <= 1) return;
    try {
      const seen = parseInt(localStorage.getItem(LEVEL_SEEN_KEY) || "0", 10);
      if (level.id > seen) {
        setLevelUp(level);
        localStorage.setItem(LEVEL_SEEN_KEY, String(level.id));
      }
    } catch (e) {}
  }, [dataReady, level.id]);

  /* ------- flush queued deltas atomically ------- */
  const flushQueue = useCallback(async () => {
    if (!session?.user) return;
    // scheduleFlush's timer, the "online" event, and "visibilitychange" can
    // all fire within the same tick (e.g. locking the phone right as
    // connectivity returns) — without this guard, two overlapping calls can
    // both read the same pending delta before either deletes it, and both
    // submit it via add_istighfar, permanently double-counting.
    if (isFlushing.current) return;
    isFlushing.current = true;
    try {
      const q = readQueue();
      const entries = Object.entries(q).filter(([, d]) => d !== 0);
      if (entries.length === 0) { setPending(0); return; }
      setSavingNote(t("saving") === "saving" ? "Saving…" : t("saving"));
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
          return;
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
    } finally {
      isFlushing.current = false;
    }
  }, [session, days, tz, today, t]);

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
      const ctx = getCtx(); const t2 = ctx.currentTime;
      const o = ctx.createOscillator(); const g = ctx.createGain(); const f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.frequency.value = 1400;
      const base = 640 + Math.random() * 180;
      o.type = "sine";
      o.frequency.setValueAtTime(base, t2);
      o.frequency.exponentialRampToValueAtTime(base * 0.42, t2 + 0.16);
      g.gain.setValueAtTime(0.0001, t2);
      g.gain.exponentialRampToValueAtTime(0.22, t2 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.24);
      o.connect(f); f.connect(g); g.connect(ctx.destination);
      o.start(t2); o.stop(t2 + 0.28);
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
      const ctx = getCtx(); const t2 = ctx.currentTime;
      bell(ctx, 880.0, t2, 0.15, 1.0);
      bell(ctx, 1174.66, t2 + 0.18, 0.13, 1.3);
    } catch (e) {}
  };
  const playComplete = () => {
    if (!soundOnRef.current) return;
    try {
      const ctx = getCtx(); const t2 = ctx.currentTime;
      const pad = ctx.createOscillator(); const pg = ctx.createGain();
      pad.type = "triangle"; pad.frequency.value = 220;
      pg.gain.setValueAtTime(0.0001, t2);
      pg.gain.exponentialRampToValueAtTime(0.07, t2 + 0.4);
      pg.gain.exponentialRampToValueAtTime(0.0001, t2 + 3.2);
      pad.connect(pg); pg.connect(ctx.destination);
      pad.start(t2); pad.stop(t2 + 3.4);
      [[440.0, 0], [554.37, 0.35], [659.25, 0.7], [880.0, 1.1]].forEach(([f, d]) => bell(ctx, f, t2 + d, 0.16, 2.2));
    } catch (e) {}
  };

  /* ------- counting ------- */
  const addCount = (n, e) => {
    if (!dataReady) return;
    const prevC = todayCount;
    const nextC = Math.max(prevC + n, 0);
    if (prevC < DAILY_GOAL && nextC >= DAILY_GOAL) playComplete();
    else if (Math.floor(nextC / 100) > Math.floor(prevC / 100)) playMilestone();
    else playDrop();

    // remember positive moves so Undo can reverse the whole move (+1, +33, +100…)
    if (n > 0) {
      const stack = moveStack.current[today] || [];
      stack.push(n);
      moveStack.current[today] = stack;
    }

    setDays((prev) => {
      const updated = { ...prev, [today]: Math.max((prev[today] || 0) + n, 0) };
      try {
        if (guest) localStorage.setItem(GUEST_DAYS, JSON.stringify(updated));
        else localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (!guest) {
      queueDelta(today, n);
      setPending((p) => p + Math.abs(n));
      scheduleFlush();
    }

    if (e && n === 1) {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r.slice(-6), { id }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 900);
    }
  };

  // Undo the whole last move (e.g. a +100 tap removes 100). Falls back to -1
  // if we have no recorded move (e.g. after a reload) but there's still a count.
  const undoOne = () => {
    if (todayCount <= 0) return;
    const stack = moveStack.current[today] || [];
    const lastMove = stack.length ? stack.pop() : 1;
    moveStack.current[today] = stack;
    const amount = Math.min(lastMove, todayCount); // never go below zero
    addCount(-amount);
  };

  /* ------- presence board ------- */
  const loadBoard = useCallback(async () => {
    setBoardLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id,name,country_flag,streak,today_count,total_count,last_active")
        .neq("visibility", "private") // defense in depth — RLS already enforces this, but Settings
        .order("today_count", { ascending: false })       // promises "hidden from all" for private, so
        .order("streak", { ascending: false })             // don't rely solely on the policy staying correct
        .limit(50);
      const cutoff = Date.now() - 24 * 3600 * 1000;
      setBoard(
        (data || []).filter(
          (p) => p.today_count > 0 && p.last_active && new Date(p.last_active).getTime() > cutoff
        )
      );
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
    if (isNativeApp()) {
      // Google refuses to show its sign-in screen inside an embedded WebView,
      // so this opens it in a Chrome Custom Tab instead; the appUrlOpen
      // listener above picks up the redirect back into the app.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: NATIVE_REDIRECT_URL, skipBrowserRedirect: true },
      });
      if (error || !data?.url) {
        console.error("Google sign-in failed:", error);
        setAuthBusy(false);
        alert("Could not sign in with Google. Please check your connection and try again.");
        return;
      }
      await window.Capacitor?.Plugins?.Browser?.open({ url: data.url });
      setAuthBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : undefined },
    });
    // On success the page navigates away, so this line never runs. It only
    // runs on failure (misconfigured provider, offline, blocked redirect) —
    // without it the button stayed disabled/spinning until a manual reload.
    if (error) {
      console.error("Google sign-in failed:", error);
      setAuthBusy(false);
      alert("Could not sign in with Google. Please check your connection and try again.");
    }
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

  const exitApp = () => window.Capacitor?.Plugins?.App?.exitApp();

  // 8 hex chars (~4.3B possibilities) rather than 4 (~65K) — at 4, a
  // leaderboard of a few hundred anonymous users had a real chance of two
  // people showing the identical "Servant #XXXX" label (birthday bound).
  const aliasFor = (uid) => "Servant #" + uid.replace(/-/g, "").slice(0, 8).toUpperCase();

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
    if (!error) {
      setProfile(data);
      // Migrate any guest counting into this new account. If a day's RPC call
      // fails partway through (network blip), don't just log-and-abandon it —
      // fall it through to the same offline queue the authenticated flow
      // already retries on reconnect, so nothing gets silently stranded.
      try {
        const g = JSON.parse(localStorage.getItem(GUEST_DAYS) || "{}");
        const entries = Object.entries(g).filter(([, v]) => v > 0);
        if (entries.length) {
          let anyFailed = false;
          for (const [day, count] of entries) {
            try {
              const { error } = await supabase.rpc("add_istighfar", { p_day: day, p_delta: count });
              if (error) throw error;
            } catch (e) {
              console.error("guest migration failed for", day, e);
              queueDelta(day, count);
              anyFailed = true;
            }
          }
          localStorage.removeItem(GUEST_DAYS);
          if (anyFailed) {
            scheduleFlush();
            alert("Some of your earlier progress couldn't be saved right now — it's stored safely and will sync automatically once you're back online.");
          }
        }
      } catch (e) { console.error("guest migration failed", e); }
      setDataReady(true);
      loadAll(); // reload so migrated counts show immediately
    }
    else {
      console.error("profile save error:", error);
      alert("Could not save your profile. Please check your connection and try again.");
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
    else { console.error("visibility update failed:", error); alert("Could not update. Please check your connection and try again."); }
  };

  // Save a real display name (from Settings) and switch to name-visible mode
  const saveName = async () => {
    if (!session?.user || !editName.trim()) return;
    const { data, error } = await supabase.from("profiles")
      .update({ name: editName.trim().slice(0, 24), visibility: "name" })
      .eq("id", session.user.id).select().single();
    if (!error) { setProfile(data); setEditName(""); }
    else { console.error("name save failed:", error); alert("Could not save the name. Please check your connection and try again."); }
  };

  const resetTimezone = async () => {
    if (!session?.user) return;
    const { data, error } = await supabase.from("profiles")
      .update({ timezone: deviceTz() }).eq("id", session.user.id).select().single();
    if (!error) { setProfile(data); alert("Home timezone set to " + deviceTz()); }
    else { console.error("timezone update failed:", error); alert("Could not update your timezone. Please check your connection and try again."); }
  };

  /* ------- soft reminders ------- */
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
      alert("Could not set the reminder. Please check your connection and try again.");
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
    const { data, error } = await supabase.from("profiles")
      .update({ reminder_enabled: false, push_subscription: null })
      .eq("id", session.user.id).select().single();
    if (data) setProfile(data);
    else { console.error("disable reminders failed:", error); alert("Could not turn off reminders. Please check your connection and try again."); }
    setPushBusy(false);
  };

  const updateReminderTime = async (time) => {
    if (!session?.user) return;
    const { data, error } = await supabase.from("profiles")
      .update({ reminder_time: time }).eq("id", session.user.id).select().single();
    if (data) setProfile(data);
    else console.error("reminder time update failed:", error);
  };

  const deleteAccount = async () => {
    try {
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
      try { localStorage.removeItem(QUEUE_KEY); localStorage.removeItem(CACHE_KEY); localStorage.removeItem("sakinah-profile"); } catch {}
      await supabase.auth.signOut();
      setProfile(undefined); setDays({}); setSession(null);
    } catch (e) {
      console.error("delete account failed:", e);
      alert("Could not delete the account. Please check your connection and try again.");
    }
  };

  /* ================================================================ */
  /* Screens                                                          */
  /* ================================================================ */

  /* ------- the intro ------- */
  if (introStep !== null) {
    const s = INTRO[introStep];
    const last = introStep === INTRO.length - 1;
    const finish = () => {
      try { localStorage.setItem("intro-seen", "1"); } catch (e) {}
      setIntroStep(null);
    };
    return (
      <Shell dir={dir} theme={C}>
        <div style={{ maxWidth: 460, margin: "0 auto", padding: "calc(36px + env(safe-area-inset-top)) 22px 40px", position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
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
              {last ? t("begin") : t("continue")}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
              <button onClick={() => introStep > 0 && setIntroStep(introStep - 1)}
                style={{ background: "none", border: "none", color: introStep > 0 ? C.muted : "transparent", fontSize: 13, cursor: "pointer", padding: 4 }}>
                {t("back")}
              </button>
              {!last && (
                <button onClick={finish} style={{ background: "none", border: "none", color: C.faint, fontSize: 13, cursor: "pointer", padding: 4 }}>
                  {t("skip")}
                </button>
              )}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (session === undefined && !guest) {
    return <Shell dir={dir} theme={C}><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>{t("opening")}</div></Shell>;
  }

  /* ------- login ------- */
  if (!session && !guest) {
    return (
      <Shell dir={dir} theme={C}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "calc(60px + env(safe-area-inset-top)) 22px", position: "relative" }} className="fadeUp">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="amiri" style={{ fontSize: 40, color: C.goldBright, lineHeight: 1.6 }}>أَسْتَغْفِرُ الله</div>
            <div className="display" style={{ fontSize: 34, fontWeight: 600, marginTop: 8 }}>{APP_NAME}</div>
            <div style={{ fontSize: 12, color: C.faint, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>{t("tagline")}</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 18, lineHeight: 1.6 }}>
              {t("login_sub")}
            </div>
          </div>

          <button onClick={signInGoogle} disabled={authBusy}
            style={{ ...goldBtn, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: authBusy ? 0.7 : 1 }}>
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#1B1508" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.3 0 6.3 1.2 8.6 3.2l6-6C34.9 4.5 29.7 2.5 24 2.5 12.1 2.5 2.5 12.1 2.5 24S12.1 45.5 24 45.5c11 0 21-8 21-21.5 0-1.4-.2-2.7-.5-4z"/></svg>
            {t("continue_google")}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0", color: C.faint, fontSize: 12 }}>
            <div style={{ flex: 1, height: 1, background: C.line }} /> {t("or")} <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>

          {!emailSent ? (
            <>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com"
                onKeyDown={(e) => e.key === "Enter" && signInEmail()} style={{ ...inputStyle, marginBottom: 10 }} />
              <button onClick={signInEmail} disabled={authBusy}
                style={{ ...goldBtn, background: C.surface2, color: C.ivory, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Mail size={16} /> {t("email_link_btn")}
              </button>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 10, textAlign: "center" }}>{t("no_password")}</div>
            </>
          ) : (
            <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 14, padding: 18, textAlign: "center", fontSize: 14, lineHeight: 1.6 }}>
              ✉️ {t("email_sent")} <b>{email}</b>. {t("open_this_device")}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 22 }}>
            <button onClick={enterGuest}
              style={{ background: "transparent", border: "none", color: C.gold, fontSize: 13.5, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              {t("continue_guest")}
            </button>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 5, lineHeight: 1.5 }}>{t("continue_guest_sub")}</div>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <a href="/privacy" style={{ fontSize: 12, color: C.faint }}>{t("privacy_policy")}</a>
          </div>

          {/* language quick-switch on login */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
            {Object.entries(LANGS).map(([code, meta]) => (
              <button key={code} onClick={() => changeLang(code)}
                style={{ background: lang === code ? C.surface2 : "transparent", border: `1px solid ${lang === code ? C.gold : C.line}`, color: lang === code ? C.goldBright : C.muted, borderRadius: 8, padding: "5px 12px", fontSize: 12.5, cursor: "pointer" }}>
                {meta.native}
              </button>
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  /* ------- onboarding ------- */
  if (profile === null && !guest) {
    const visOptions = [
      { id: "anon", title: t("vis_anon_title"), desc: t("vis_anon_desc") },
      { id: "private", title: t("vis_hidden_title"), desc: t("vis_hidden_desc") },
      { id: "name", title: t("vis_name_title"), desc: t("vis_name_desc") },
    ];
    return (
      <Shell dir={dir} theme={C}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "calc(44px + env(safe-area-inset-top)) 22px", position: "relative" }} className="fadeUp">
          <div className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>{t("salam")}</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
            {t("onboard_sub")}
          </div>

          <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>{t("privacy_label")}</label>
          <div style={{ margin: "8px 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {visOptions.map((v) => {
              const active = obVis === v.id;
              return (
                <button key={v.id} onClick={() => setObVis(v.id)}
                  style={{ textAlign: dir === "rtl" ? "right" : "left", background: active ? C.surface2 : C.surface, border: `1px solid ${active ? C.gold : C.line}`, borderRadius: 12, padding: "12px 14px", cursor: "pointer", color: C.ivory }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: active ? C.goldBright : C.ivory }}>{active ? "● " : "○ "}{v.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>{v.desc}</div>
                </button>
              );
            })}
          </div>

          {obVis === "name" ? (
            <>
              <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>{t("your_name")}</label>
              <input value={obName} onChange={(e) => setObName(e.target.value)} placeholder="e.g. Yusuf" maxLength={24}
                style={{ ...inputStyle, margin: "6px 0 16px" }} />
            </>
          ) : (
            <div style={{ fontSize: 12.5, color: C.muted, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", margin: "0 0 16px", lineHeight: 1.5 }}>
              {t("no_name_needed")}
            </div>
          )}

          <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>{t("your_country")}</label>
          <select value={obFlag} onChange={(e) => { setObFlag(e.target.value); const suggested = flagToLang(e.target.value); changeLang(suggested); }} style={{ ...inputStyle, margin: "6px 0 22px" }}>
            {COUNTRIES.map(([flag, cname]) => (<option key={cname} value={flag}>{flag}  {cname}</option>))}
          </select>

          <button onClick={createProfile} disabled={authBusy || (obVis === "name" && !obName.trim())}
            style={{ ...goldBtn, opacity: authBusy || (obVis === "name" && !obName.trim()) ? 0.6 : 1 }}>
            {t("begin_journey")}
          </button>
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <a href="/privacy" style={{ fontSize: 12, color: C.faint }}>{t("privacy_policy")}</a>
          </div>
        </div>
      </Shell>
    );
  }

  if (profile === undefined && !guest) {
    return <Shell dir={dir} theme={C}><div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>{t("loading_journey")}</div></Shell>;
  }

  // Guests use a lightweight local profile (never written to the server).
  const effectiveProfile = guest
    ? { name: t("guest"), country_flag: "🌙", visibility: "private", timezone: deviceTz(), reminder_enabled: false }
    : profile;

  const daily = BENEFITS[dailyIdx];
  const benefit = BENEFITS[browseIdx];
  const myBand = bandFor(streak);
  const nextMilestone = MILESTONES.find((m) => m.days > completedDays) || null;
  const showRemindPrompt =
    !effectiveProfile.reminder_enabled && !remindDismissed && completedDays >= 3 && !guest;

  return (
    <Shell dir={dir} theme={C}>
      {encourage && (
        <div onClick={() => setEncourage(null)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(6,14,12,0.72)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 380, width: "100%", background: C.surface2, border: `1px solid ${C.gold}55`, borderRadius: 20, padding: 26, textAlign: "center" }} className="fadeUp">
            <div className="amiri" style={{ fontSize: 30, color: C.goldBright, lineHeight: 1.5, marginBottom: 14 }}>أَسْتَغْفِرُ الله</div>
            <div style={{ fontSize: 16, color: C.ivory, lineHeight: 1.7 }}>{encourage.text}</div>
            <button onClick={() => setEncourage(null)}
              style={{ ...goldBtn, marginTop: 22, width: "auto", padding: "10px 28px" }}>
              {t("ameen")}
            </button>
          </div>
        </div>
      )}
      {levelUp && (
        <div onClick={() => setLevelUp(null)}
          style={{ position: "fixed", inset: 0, zIndex: 51, background: "rgba(6,14,12,0.78)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 26 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 380, width: "100%", background: C.surface2, border: `1px solid ${levelUp.theme.ring}66`, borderRadius: 20, padding: 26, textAlign: "center" }} className="fadeUp">
            <div style={{ fontSize: 10.5, letterSpacing: 3, textTransform: "uppercase", color: levelUp.theme.ring, marginBottom: 10 }}>{t("level_up_title")}</div>
            <div className="amiri" style={{ fontSize: 34, color: levelUp.theme.ring, lineHeight: 1.5 }}>{levelUp.ar}</div>
            <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 4 }}>{levelUp.name}</div>
            <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.faint, marginTop: 2 }}>
              {t("level_word")} {levelUp.id} · {levelUp.en}
            </div>
            <div style={{ fontSize: 13.5, color: C.muted, marginTop: 14, lineHeight: 1.6, fontStyle: "italic" }}>{levelUp.note}</div>
            <div style={{ fontSize: 12.5, color: C.ivory, marginTop: 16, lineHeight: 1.6 }}>{t("level_up_theme_note")}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              {[levelUp.theme.ring, levelUp.theme.gold, levelUp.theme.goldBright].map((c, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: c }} />
              ))}
            </div>
            <button onClick={() => setLevelUp(null)}
              style={{ ...goldBtn, background: levelUp.theme.ring, marginTop: 22, width: "auto", padding: "10px 28px" }}>
              {t("continue")}
            </button>
          </div>
        </div>
      )}
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "calc(20px + env(safe-area-inset-top)) 18px calc(96px + env(safe-area-inset-bottom))", position: "relative" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="display" style={{ fontSize: 26, fontWeight: 600, letterSpacing: 0.5 }}>{APP_NAME}</div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: 2.5, textTransform: "uppercase" }}>
              {effectiveProfile.country_flag} {effectiveProfile.visibility === "name" ? effectiveProfile.name : t("you")}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setSoundOn(!soundOn)} aria-label="sound"
              style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: 8, cursor: "pointer", display: "flex", color: soundOn ? C.gold : C.faint }}>
              {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 12px" }}>
              <Flame size={15} color={streak > 0 ? C.gold : C.faint} fill={streak > 0 ? C.gold : "none"} />
              <span style={{ fontSize: 14, fontWeight: 600, color: streak > 0 ? C.goldBright : C.muted }}>{streak}</span>
            </div>
            <button onClick={guest ? leaveGuestToLogin : signOut} aria-label="Sign out"
              style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: 8, cursor: "pointer", display: "flex", color: C.faint }}>
              <LogOut size={15} />
            </button>
            {isNativeApp() && (
              <button onClick={exitApp} aria-label={t("exit_app")} title={t("exit_app")}
                style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 999, padding: 8, cursor: "pointer", display: "flex", color: C.faint }}>
                <X size={15} />
              </button>
            )}
          </div>
        </header>

        {/* sync banners */}
        {loadFailed && (
          <div style={{ background: "#3A2415", border: `1px solid ${C.warn}66`, borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <CloudOff size={16} color={C.warn} style={{ marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{t("sync_fail_title")}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 1.45 }}>
                {t("sync_fail_desc")}
              </div>
              <button onClick={loadAll} style={{ marginTop: 8, background: C.warn, color: "#1B1508", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                {t("try_again")}
              </button>
            </div>
          </div>
        )}
        {!loadFailed && pending > 0 && (
          <div style={{ fontSize: 11.5, color: C.faint, textAlign: "center", marginBottom: 8 }}>
            {savingNote || t("waiting_sync", { n: pending })}
          </div>
        )}

        {/* COUNT */}
        {tab === "count" && (
          <div className="fadeUp">
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button onClick={(e) => addCount(1, e)} disabled={!dataReady} aria-label="count"
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
                  <div style={{ fontSize: 12, color: C.muted, letterSpacing: 1.5 }}>{t("of_today", { goal: DAILY_GOAL })}</div>
                  {pct >= 1 && <div style={{ fontSize: 12, color: C.goldBright, marginTop: 4 }}>{t("goal_complete")}</div>}
                </div>
                {ripples.map((r) => (
                  <div key={r.id} style={{ position: "absolute", left: "50%", top: "38%", color: C.goldBright, fontSize: 18, fontWeight: 600, pointerEvents: "none", animation: "rise .9s ease-out forwards" }}>+1</div>
                ))}
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: 12, color: C.faint, marginTop: 10 }}>
              {dataReady ? t("tap_hint") : t("waiting_progress")}
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              {[33, 100].map((n) => (
                <button key={n} onClick={() => addCount(n)} disabled={!dataReady}
                  style={{ background: C.surface, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: dataReady ? 1 : 0.5 }}>
                  +{n}
                </button>
              ))}
              <button onClick={undoOne} disabled={!dataReady} aria-label="Undo"
                style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, opacity: dataReady ? 1 : 0.5 }}>
                <RotateCcw size={14} /> {t("undo")}
              </button>
            </div>

            <div style={{ marginTop: 22, textAlign: "center", fontSize: 12.5, color: C.faint, fontStyle: "italic", lineHeight: 1.5, padding: "0 10px" }}>
              {NIYAT[niyatIdx]}
            </div>

            {/* organic encouragement: afternoon onward, day still barely begun */}
            {dataReady && todayCount > 0 && todayCount < 200 && new Date().getHours() >= 15 && (
              <div style={{ marginTop: 12, textAlign: "center", fontSize: 12.5, color: C.gold, lineHeight: 1.5, padding: "0 16px" }}>
                {ENCOURAGE.low[completedDays % ENCOURAGE.low.length]}
              </div>
            )}

            <div style={{ marginTop: 22, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: CAT_COLOR[daily.c], marginBottom: 6 }}>{t("todays_reminder")} · {daily.c}</div>
              <div className="display" style={{ fontSize: 19, fontWeight: 600, marginBottom: 6 }}>{daily.t}</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{daily.b}</div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8, fontStyle: "italic" }}>{daily.s}</div>
            </div>

            {showRemindPrompt && (
              <div style={{ marginTop: 14, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, marginBottom: 4 }}>{t("remind_help_title")}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                  {t("remind_help_desc")}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setTab("journey")}
                    style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                    {t("set_a_time")}
                  </button>
                  <button onClick={() => setRemindDismissed(true)}
                    style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                    {t("not_now")}
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
              <div style={{ fontSize: 10, letterSpacing: 3, textTransform: "uppercase", color: CAT_COLOR[benefit.c], marginBottom: 8 }}>{t("benefit_of", { i: browseIdx + 1, total: BENEFITS.length })} · {benefit.c}</div>
              <div className="display" style={{ fontSize: 24, fontWeight: 600, marginBottom: 10 }}>{benefit.t}</div>
              <div style={{ fontSize: 15, lineHeight: 1.65, opacity: 0.9 }}>{benefit.b}</div>
              <div style={{ fontSize: 12, color: C.faint, marginTop: 12, fontStyle: "italic" }}>{benefit.s}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
                <button onClick={() => setBrowseIdx((browseIdx - 1 + BENEFITS.length) % BENEFITS.length)}
                  style={{ background: C.surface, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>{t("previous")}</button>
                <button onClick={() => {
                    let r = Math.floor(Math.random() * BENEFITS.length);
                    if (r === browseIdx) r = (r + 1) % BENEFITS.length;
                    setBrowseIdx(r);
                  }}
                  style={{ background: C.surface2, color: C.goldBright, border: `1px solid ${C.gold}55`, borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>{t("shuffle")}</button>
                <button onClick={() => setBrowseIdx((browseIdx + 1) % BENEFITS.length)}
                  style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontSize: 13 }}>{t("next")}</button>
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.6, padding: "0 6px" }}>
              {t("benefits_note")}
            </div>
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Correction — Mustaghfirin benefit #" + (browseIdx + 1))}&body=${encodeURIComponent('Benefit #' + (browseIdx + 1) + ': "' + benefit.t + '"\nSource shown: ' + benefit.s + '\n\nWhat needs correcting:\n')}`}
                style={{ fontSize: 12.5, color: C.gold, textDecoration: "none" }}
              >
                {t("report_correction")}
              </a>
            </div>
          </div>
        )}

        {/* UMMAH */}
        {tab === "board" && (
          <div className="fadeUp">
            <div className="display" style={{ fontSize: 21, fontWeight: 600, marginBottom: 4 }}>{t("ummah_title")}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.5 }}>
              {t("ummah_sub")}
            </div>

            {guest ? (
              <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 22, textAlign: "center" }}>
                <div style={{ fontSize: 30, marginBottom: 8 }}>🤲</div>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: C.goldBright, marginBottom: 6 }}>{t("guest_ummah_title")}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginBottom: 14 }}>{t("guest_ummah_desc")}</div>
                <button onClick={leaveGuestToLogin}
                  style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13.5, cursor: "pointer" }}>
                  {t("guest_save_btn")}
                </button>
              </div>
            ) : (<>
              {ummahActive !== null && (
              <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 20, marginBottom: 12, textAlign: "center" }}>
                <div className="display" style={{ fontSize: 34, fontWeight: 600, color: C.goldBright }}>{ummahActive.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{t("ummah_with_you")}</div>
              </div>
              )}
            {ummahTotal !== null && (
              <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, marginBottom: 16, textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold, marginBottom: 4 }}>{t("ummah_together")}</div>
                <div className="display" style={{ fontSize: 22, fontWeight: 600 }}>{ummahTotal.toLocaleString()}</div>
                <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>{t("ummah_total_note")}</div>
              </div>
            )}

            {boardLoading && <div style={{ color: C.faint, fontSize: 14, padding: 20, textAlign: "center" }}>{t("loading")}</div>}
            {!boardLoading && board && board.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13.5, background: C.surface, borderRadius: 14, padding: 20, textAlign: "center", lineHeight: 1.6 }}>
                {t("ummah_empty")}
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
                      {p.name}{isMe && <span style={{ color: C.gold, fontSize: 11, marginLeft: 6 }}>{t("you").toLowerCase()}</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: band.color }}>{t(band.key)}</div>
                  </div>
                  <Flame size={15} color={p.streak > 0 ? C.gold : C.faint} fill={p.streak > 0 ? C.gold : "none"} />
                </div>
              );
            })}
            {!boardLoading && (
              <button onClick={loadBoard} style={{ width: "100%", marginTop: 6, background: "transparent", color: C.muted, border: `1px dashed ${C.line}`, borderRadius: 12, padding: 11, cursor: "pointer", fontSize: 13 }}>
                {t("refresh")}
              </button>
            )}
            </>)}
          </div>
        )}

        {/* JOURNEY + SETTINGS */}
        {tab === "journey" && (
          <div className="fadeUp">
            <div className="display" style={{ fontSize: 21, fontWeight: 600, marginBottom: 4 }}>{t("journey_title")}</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18, lineHeight: 1.55 }}>
              {t("journey_sub")}
            </div>

            <div style={{ background: C.surface2, border: `1px solid ${level.theme.ring}55`, borderRadius: 18, padding: 20, marginBottom: 12, textAlign: "center" }}>
              <div className="amiri" style={{ fontSize: 26, color: level.theme.ring, lineHeight: 1.6 }}>{level.ar}</div>
              <div className="display" style={{ fontSize: 26, fontWeight: 600, marginTop: 2 }}>{level.name}</div>
              <div style={{ fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.faint, marginTop: 2 }}>
                {t("level_word")} {level.id} · {level.en}
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, lineHeight: 1.55, fontStyle: "italic" }}>{level.note}</div>

              {nextLevel && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 8, background: C.ringTrack, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min(((completedDays - level.days) / (nextLevel.days - level.days)) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${level.theme.ring}, ${nextLevel.theme.ring})`,
                      borderRadius: 999, transition: "width .5s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: C.faint, marginTop: 6 }}>
                    {t("days_to", { n: nextLevel.days - completedDays, name: nextLevel.name, en: nextLevel.en })}
                  </div>
                </div>
              )}
              {!nextLevel && (
                <div style={{ fontSize: 12, color: C.goldBright, marginTop: 14 }}>{t("all_promises")}</div>
              )}
            </div>

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span className="display" style={{ fontSize: 34, fontWeight: 600, color: C.goldBright }}>{completedDays}</span>
                <span style={{ fontSize: 13, color: C.muted }}>
                  {nextMilestone ? t("of_milestone", { n: nextMilestone.days, label: nextMilestone.label }) : t("days_completed_word")}
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

            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 10 }}>{t("milestones")}</div>
              {MILESTONES.map((m) => {
                const done = completedDays >= m.days;
                return (
                  <div key={m.days} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <span style={{ fontSize: 14, color: done ? C.goldBright : C.faint, width: 18 }}>{done ? "✦" : "○"}</span>
                    <span style={{ width: 9, height: 9, borderRadius: 99, background: done ? m.level.theme.ring : C.faint, flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: done ? C.ivory : C.faint, flex: 1 }}>{m.label}</span>
                    <span style={{ fontSize: 11.5, color: C.faint }}>{m.days}d</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: t("stat_streak"), value: `${streak} ${t("days_unit")}` },
                { label: t("stat_consistency"), value: t(myBand.key) },
                { label: t("stat_lifetime"), value: totalAll.toLocaleString() },
                { label: t("stat_days"), value: `${completedDays}` },
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

            {/* PROGRESS CHART with range toggle */}
            <div style={{ marginTop: 12, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
              {/* toggle row */}
              <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[
                  { id: "week", label: t("range_week") },
                  { id: "month", label: t("range_month") },
                  { id: "quarter", label: t("range_quarter") },
                  { id: "year", label: t("range_year") },
                ].map((r) => {
                  const active = chartRange === r.id;
                  return (
                    <button key={r.id} onClick={() => setChartRange(r.id)}
                      style={{ flex: 1, background: active ? C.surface2 : "transparent", border: `1px solid ${active ? C.gold : C.line}`, color: active ? C.goldBright : C.muted, borderRadius: 9, padding: "7px 4px", fontSize: 11.5, fontWeight: active ? 700 : 400, cursor: "pointer" }}>
                      {r.label}
                    </button>
                  );
                })}
              </div>

              {/* WEEK — bar chart with real numbers */}
              {chartRange === "week" && (() => {
                const vals = Array.from({ length: 7 }).map((_, idx) => days[shiftDayKey(tz, idx - 6)] || 0);
                const peak = Math.max(DAILY_GOAL, ...vals);
                const goalY = (DAILY_GOAL / peak) * 92;
                return (
                  <div style={{ position: "relative", height: 118 }}>
                    {peak > DAILY_GOAL && (
                      <div style={{ position: "absolute", left: 0, right: 0, bottom: 22 + goalY, height: 1, background: `${C.gold}55`, zIndex: 1 }}>
                        <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: C.gold }}>1,000</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 6, height: "100%" }}>
                      {Array.from({ length: 7 }).map((_, idx) => {
                        const offset = idx - 6;
                        const key = shiftDayKey(tz, offset);
                        const val = days[key] || 0;
                        const h = val > 0 ? Math.max((val / peak) * 92, 4) : 2;
                        const done = val >= DAILY_GOAL;
                        const label = new Date(key).toLocaleDateString(lang === "ur" ? "ur" : "en", { weekday: "narrow" });
                        return (
                          <div key={key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4, height: "100%" }}>
                            <span style={{ fontSize: 9.5, color: val > 0 ? (done ? C.goldBright : C.muted) : "transparent", fontVariantNumeric: "tabular-nums" }}>
                              {val > 0 ? val.toLocaleString() : "0"}
                            </span>
                            <div style={{ width: "100%", maxWidth: 30, height: h, borderRadius: 6, background: done ? `linear-gradient(180deg, ${C.goldBright}, ${C.gold})` : (val > 0 ? C.faint : C.ringTrack), transition: "height .4s ease" }} />
                            <span style={{ fontSize: 10, color: offset === 0 ? C.goldBright : C.faint }}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* MONTH — 30-day heatmap */}
              {chartRange === "month" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 5 }}>
                  {Array.from({ length: 30 }).map((_, idx) => {
                    const offset = idx - 29;
                    const key = shiftDayKey(tz, offset);
                    const val = days[key] || 0;
                    const dayNum = new Date(key).getDate();
                    return (
                      <div key={key} title={`${key}: ${val}`}
                        style={{ aspectRatio: "1", borderRadius: 5, background: heatColor(val), border: offset === 0 ? `1px solid ${C.goldBright}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8.5, color: val >= DAILY_GOAL ? "#1B1508" : C.faint }}>
                        {dayNum}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* QUARTER — ~13 week columns, each a stack of 7 day cells */}
              {chartRange === "quarter" && (
                <div style={{ display: "flex", gap: 4, justifyContent: "space-between" }}>
                  {Array.from({ length: 13 }).map((_, w) => {
                    const weekStart = -(12 - w) * 7;
                    return (
                      <div key={w} style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
                        {Array.from({ length: 7 }).map((__, d) => {
                          const offset = weekStart + d;
                          if (offset > 0) return <div key={d} style={{ aspectRatio: "1" }} />;
                          const key = shiftDayKey(tz, offset);
                          const val = days[key] || 0;
                          return <div key={d} title={`${key}: ${val}`} style={{ aspectRatio: "1", borderRadius: 3, background: heatColor(val) }} />;
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* YEAR — Jan→Dec of the current year: days the goal was reached each month */}
              {chartRange === "year" && (() => {
                const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const now = new Date();
                const year = now.getFullYear();
                const curMonth = now.getMonth();
                const months = MONTHS.map((label, mo) => {
                  const daysInMonth = new Date(year, mo + 1, 0).getDate();
                  let done = 0;
                  for (let day = 1; day <= daysInMonth; day++) {
                    const key = `${year}-${String(mo + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    if ((days[key] || 0) >= DAILY_GOAL) done++;
                  }
                  return { label, done, isNow: mo === curMonth };
                });
                const peak = Math.max(...months.map((x) => x.done), 1);
                return (
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 3, height: 118 }}>
                    {months.map((mn, i) => {
                      const h = mn.done > 0 ? Math.max((mn.done / peak) * 80, 4) : 2;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 4, height: "100%" }}>
                          <span style={{ fontSize: 8.5, color: mn.done > 0 ? C.goldBright : "transparent" }}>{mn.done}</span>
                          <div style={{ width: "100%", maxWidth: 18, height: h, borderRadius: 4, background: mn.done > 0 ? `linear-gradient(180deg, ${C.goldBright}, ${C.gold})` : C.ringTrack, border: mn.isNow ? `1px solid ${C.goldBright}` : "none" }} />
                          <span style={{ fontSize: 7.5, color: mn.isNow ? C.goldBright : C.faint, whiteSpace: "nowrap" }}>{mn.label}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <div style={{ fontSize: 11, color: C.faint, textAlign: "center", marginTop: 14 }}>
                {chartRange === "week" ? t("chart_note")
                  : chartRange === "year" ? t("chart_note_year")
                  : t("chart_note_heat")}
              </div>
            </div>

            {/* SAYYIDUL ISTIGHFAR */}
            <div style={{ marginTop: 12, background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.gold, marginBottom: 4, textAlign: "center" }}>{t("sayyid_title")}</div>
              <div style={{ fontSize: 11.5, color: C.faint, textAlign: "center", marginBottom: 14 }}>{t("sayyid_sub")}</div>
              <div className="amiri" style={{ fontSize: 20, color: C.goldBright, textAlign: "center", lineHeight: 2.4, direction: "rtl" }}>
                اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ
              </div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginTop: 14, fontStyle: "italic" }}>
                "O Allah, You are my Lord, there is none worthy of worship but You. You created me and I am Your servant. I abide by Your covenant and promise as best I can. I seek refuge in You from the evil I have done. I acknowledge Your favour upon me, and I acknowledge my sin. So forgive me, for none forgives sins but You."
              </div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 10 }}>
                {t("sayyid_source")}
              </div>
            </div>

            {/* ---------- SETTINGS ---------- */}
            <div className="display" style={{ fontSize: 19, fontWeight: 600, margin: "30px 0 10px" }}>{t("settings")}</div>

            {/* GUEST: invite to save progress */}
            {guest && (
              <div style={{ background: C.surface2, border: `1px solid ${C.gold}55`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.goldBright, marginBottom: 4 }}>{t("guest_save_title")}</div>
                <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginBottom: 12 }}>{t("guest_save_desc")}</div>
                <button onClick={leaveGuestToLogin}
                  style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, cursor: "pointer" }}>
                  {t("guest_save_btn")}
                </button>
              </div>
            )}

            {/* LANGUAGE */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 10 }}>{t("language")}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(LANGS).map(([code, meta]) => {
                  const active = lang === code;
                  return (
                    <button key={code} onClick={() => changeLang(code)}
                      style={{ background: active ? C.surface2 : "transparent", border: `1px solid ${active ? C.gold : C.line}`, color: active ? C.goldBright : C.ivory, borderRadius: 10, padding: "9px 16px", fontSize: 14, cursor: "pointer" }}>
                      {meta.native}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* login-only settings (reminder, privacy visibility, timezone, delete) */}
            {!guest && <>
            {/* DAILY REMINDER */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 8 }}>{t("daily_reminder")}</div>

              {profile.reminder_enabled ? (
                <>
                  <div style={{ fontSize: 13.5, marginBottom: 10, lineHeight: 1.5 }}>
                    {t("reminder_on_at")} <b style={{ color: C.goldBright }}>{profile.reminder_time}</b>{t("reminder_on_tail")}
                  </div>
                  <label style={{ fontSize: 11.5, color: C.faint }}>{t("change_time")}</label>
                  <input type="time" value={profile.reminder_time || "21:00"}
                    onChange={(e) => updateReminderTime(e.target.value)}
                    style={{ ...inputStyle, margin: "6px 0 10px" }} />
                  <button onClick={disableReminders} disabled={pushBusy}
                    style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>
                    {pushBusy ? t("please_wait") : t("turn_off")}
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5, marginBottom: 10 }}>
                    {t("reminder_off_desc")}
                  </div>
                  <label style={{ fontSize: 11.5, color: C.faint }}>{t("remind_me_at")}</label>
                  <input type="time" defaultValue={profile.reminder_time || "21:00"} id="remind-time"
                    onChange={(e) => updateReminderTime(e.target.value)}
                    style={{ ...inputStyle, margin: "6px 0 10px" }} />
                  <button onClick={() => enableReminders(profile.reminder_time || "21:00")} disabled={pushBusy}
                    style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13.5, cursor: "pointer" }}>
                    {pushBusy ? t("setting_up") : t("turn_on_reminder")}
                  </button>
                  <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.45 }}>
                    {t("reminder_home_note")}
                  </div>
                </>
              )}
            </div>

            {/* WHO SEES */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 10 }}>{t("who_sees")}</div>
              {[
                { id: "anon", label: t("set_anon") },
                { id: "private", label: t("set_hidden") },
                { id: "name", label: t("set_name") },
              ].map((v) => {
                const active = profile.visibility === v.id;
                return (
                  <button key={v.id} onClick={() => updateVisibility(v.id)}
                    style={{ display: "block", width: "100%", textAlign: dir === "rtl" ? "right" : "left", background: active ? C.surface2 : "transparent", border: `1px solid ${active ? C.gold : C.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, color: active ? C.goldBright : C.ivory, fontSize: 13.5, cursor: "pointer" }}>
                    {active ? "● " : "○ "}{v.label}
                  </button>
                );
              })}
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 6, lineHeight: 1.5 }}>
                {t("shown_as")} {profile.country_flag} {profile.visibility === "private" ? t("hidden_from_all") : profile.name}
              </div>

              {/* name input — appears when "Show my name" is chosen */}
              {profile.visibility === "name" && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
                  <label style={{ fontSize: 11.5, color: C.faint }}>{t("your_name")}</label>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={String(profile.name).startsWith("Servant #") ? "e.g. Yusuf" : profile.name}
                      maxLength={24}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button onClick={saveName} disabled={!editName.trim()}
                      style={{ background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "0 18px", fontSize: 13.5, cursor: editName.trim() ? "pointer" : "not-allowed", opacity: editName.trim() ? 1 : 0.5, whiteSpace: "nowrap" }}>
                      {lang === "ur" ? "محفوظ کریں" : "Save"}
                    </button>
                  </div>
                  {String(profile.name).startsWith("Servant #") && (
                    <div style={{ fontSize: 11, color: C.warn, marginTop: 6, lineHeight: 1.4 }}>
                      {lang === "ur" ? "آپ نے ابھی تک اپنا نام نہیں لکھا — یہاں لکھیں تاکہ آپ کا نام نظر آئے۔" : "You haven't entered a name yet — type one here so your name shows instead of an alias."}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TIMEZONE */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint, marginBottom: 6 }}>{t("home_tz")}</div>
              <div style={{ fontSize: 13.5, marginBottom: 8 }}>{profile.timezone || "Asia/Kolkata"}</div>
              <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.5, marginBottom: 10 }}>
                {t("tz_note")}
              </div>
              <button onClick={resetTimezone}
                style={{ background: C.surface2, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 14px", fontSize: 13, cursor: "pointer" }}>
                {t("set_to_device")} ({deviceTz()})
              </button>
            </div>
            </>}

            {/* WHY A THOUSAND */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <button onClick={() => setIntroStep(0)}
                style={{ background: "none", border: "none", color: C.gold, fontSize: 13.5, cursor: "pointer", padding: 0 }}>
                {t("why_thousand_link")}
              </button>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>{t("why_thousand_sub")}</div>
            </div>

            {/* TRACKER NOTE */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 6, color: C.goldBright }}>{t("tracker_title")}</div>
              <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6 }}>
                {t("tracker_body")}
              </div>
            </div>

            {/* PRIVACY */}
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <a href="/privacy" style={{ fontSize: 13.5, color: C.gold }}>{t("privacy_policy")} →</a>
            </div>

            {/* DANGER */}
            {!guest && (
            <div style={{ background: C.surface, border: "1px solid #4A2020", borderRadius: 14, padding: 16, marginBottom: 30 }}>
              <div style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "#C87070", marginBottom: 8 }}>{t("danger_zone")}</div>
              {!confirmDelete ? (
                <button onClick={() => setConfirmDelete(true)}
                  style={{ background: "transparent", color: "#C87070", border: "1px solid #6A2A2A", borderRadius: 10, padding: "10px 14px", fontSize: 13, cursor: "pointer" }}>
                  {t("delete_account")}
                </button>
              ) : (
                <>
                  <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.55, marginBottom: 10 }}>
                    {t("delete_warn")}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={deleteAccount}
                      style={{ background: "#8A2A2A", color: "#FFF", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      {t("delete_yes")}
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
                      {t("cancel")}
                    </button>
                  </div>
                </>
              )}
            </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, background: `${C.surface}F2`, backdropFilter: "blur(12px)",
        borderTop: `1px solid ${C.line}`, display: "flex", justifyContent: "space-around", padding: "10px 8px calc(16px + env(safe-area-inset-bottom))", zIndex: 10,
      }}>
        {[
          { id: "count", icon: Flame, label: t("nav_count") },
          { id: "benefits", icon: BookOpen, label: t("nav_benefits") },
          { id: "board", icon: Globe2, label: t("nav_ummah") },
          { id: "journey", icon: Map, label: t("nav_journey") },
        ].map((tb) => {
          const active = tab === tb.id;
          const Icon = tb.icon;
          return (
            <button key={tb.id} onClick={() => setTab(tb.id)} aria-label={tb.label}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? C.goldBright : C.faint, padding: "2px 14px" }}>
              <Icon size={20} />
              <span style={{ fontSize: 10.5, letterSpacing: 0.5, fontWeight: active ? 700 : 400 }}>{tb.label}</span>
            </button>
          );
        })}
      </nav>
    </Shell>
  );
}
