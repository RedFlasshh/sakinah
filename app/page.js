"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Flame, BookOpen, Globe2, Map, RotateCcw, Volume2, VolumeX, LogOut, Mail } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const C = {
  bg: "#0B1917", surface: "#122622", surface2: "#1A332D", line: "#22423A",
  gold: "#C9A24B", goldBright: "#E8CD86", ivory: "#F4EFE2",
  muted: "#8BA79A", faint: "#5C776C", ringTrack: "#1E3A33",
};

const DAILY_GOAL = 1000;
const JOURNEY_DAYS = 180;

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
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const dayOfYear = () => {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
};
const computeStreak = (days) => {
  let streak = 0;
  const d = new Date();
  if ((days[todayKey()] || 0) < DAILY_GOAL) d.setDate(d.getDate() - 1);
  while (true) {
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if ((days[k] || 0) >= DAILY_GOAL) { streak++; d.setDate(d.getDate() - 1); }
    else break;
  }
  return streak;
};

const inputStyle = { width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", color: C.ivory, fontSize: 15 };
const goldBtn = { background: C.gold, color: "#1B1508", fontWeight: 700, border: "none", borderRadius: 10, padding: "12px 18px", fontSize: 15, cursor: "pointer", width: "100%" };

/* Shell lives at module level — defining it inside the component
   caused a full remount on every keystroke (keyboard kept closing). */
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
/* Main                                                                */
/* ================================================================== */
export default function Sakinah() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [profile, setProfile] = useState(undefined);
  const [days, setDays] = useState({});
  const [tab, setTab] = useState("count");
  const [board, setBoard] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [dailyIdx, setDailyIdx] = useState(0);
  const [browseIdx, setBrowseIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [obName, setObName] = useState("");
  const [obFlag, setObFlag] = useState("🇮🇳");
  const [obVis, setObVis] = useState("name");
  const [ummahTotal, setUmmahTotal] = useState(null);

  const saveTimer = useRef(null);
  const stateRef = useRef({});
  const audioRef = useRef(null);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;

  useEffect(() => {
    setDailyIdx(dayOfYear() % BENEFITS.length);
    setBrowseIdx(Math.floor(Math.random() * BENEFITS.length));
  }, []);

  /* ------- auth session ------- */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  /* ------- load profile + daily counts once logged in ------- */
  useEffect(() => {
    if (!session?.user) { setProfile(undefined); setDays({}); return; }
    (async () => {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
      setProfile(prof ?? null);
      const { data: rows } = await supabase.from("daily_counts").select("day,count").eq("user_id", session.user.id);
      const map = {};
      (rows || []).forEach((r) => { map[r.day] = r.count; });
      setDays(map);
    })();
  }, [session]);

  const today = todayKey();
  const todayCount = days[today] || 0;
  const streak = computeStreak(days);
  const completedDays = Object.values(days).filter((v) => v >= DAILY_GOAL).length;
  const totalAll = Object.values(days).reduce((a, b) => a + b, 0);
  const pct = Math.min(todayCount / DAILY_GOAL, 1);

  /* ------- debounced save to Supabase ------- */
  stateRef.current = { days, profile, userId: session?.user?.id };
  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const { days, profile, userId } = stateRef.current;
      if (!userId) return;
      const t = todayKey();
      try {
        await supabase.from("daily_counts").upsert({ user_id: userId, day: t, count: days[t] || 0 });
        if (profile) {
          await supabase.from("profiles").update({
            streak: computeStreak(days),
            total_count: Object.values(days).reduce((a, b) => a + b, 0),
            today_count: days[t] || 0,
            today_date: t,
            updated_at: new Date().toISOString(),
          }).eq("id", userId);
        }
      } catch (e) { console.error("save failed", e); }
    }, 1200);
  }, []);

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

  /* ------- counting ------- */
  const addCount = (n, e) => {
    const prevC = todayCount;
    const nextC = prevC + n;
    if (prevC < DAILY_GOAL && nextC >= DAILY_GOAL) playComplete();
    else if (Math.floor(nextC / 100) > Math.floor(prevC / 100)) playMilestone();
    else playDrop();
    setDays((prev) => ({ ...prev, [today]: (prev[today] || 0) + n }));
    scheduleSave();
    if (e && n === 1) {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r.slice(-6), { id }]);
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 900);
    }
  };
  const undoOne = () => {
    setDays((prev) => ({ ...prev, [today]: Math.max((prev[today] || 0) - 1, 0) }));
    scheduleSave();
  };

  /* ------- leaderboard ------- */
  const loadBoard = useCallback(async () => {
    setBoardLoading(true);
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id,name,country_flag,streak,total_count,today_count,today_date,updated_at")
        .order("streak", { ascending: false })
        .order("total_count", { ascending: false })
        .limit(100);
      // Active only: members who used the app in the last 48 hours
      const cutoff = Date.now() - 48 * 3600 * 1000;
      const active = (data || []).filter(
        (p) => p.updated_at && new Date(p.updated_at).getTime() > cutoff
      );
      setBoard(active);
      const { data: total } = await supabase.rpc("ummah_total");
      if (total !== null && total !== undefined) setUmmahTotal(Number(total));
    } catch (e) { setBoard([]); }
    setBoardLoading(false);
  }, []);
  useEffect(() => { if (tab === "board" && session) loadBoard(); }, [tab, session, loadBoard]);

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
  const signOut = async () => { await supabase.auth.signOut(); setProfile(undefined); setDays({}); };

  const createProfile = async () => {
    if (!session?.user) return;
    const alias = "Servant #" + session.user.id.replace(/-/g, "").slice(0, 4).toUpperCase();
    const finalName = obVis === "anon" ? alias : obName.trim();
    if (!finalName) return;
    setAuthBusy(true);
    const row = {
      id: session.user.id,
      name: finalName.slice(0, 24),
      country_flag: obFlag,
      visibility: obVis,
      today_date: todayKey(),
    };
    const { data, error } = await supabase.from("profiles").upsert(row).select().single();
    setAuthBusy(false);
    if (!error) setProfile(data);
    else {
      console.error("profile save error:", error);
      alert("Could not save your profile: " + (error.message || JSON.stringify(error)));
    }
  };

  /* ================================================================ */
  /* Screens                                                          */
  /* ================================================================ */

  /* ------- loading ------- */
  if (session === undefined) {
    return (
      <Shell>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Opening…</div>
      </Shell>
    );
  }

  /* ------- login screen ------- */
  if (!session) {
    return (
      <Shell>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "60px 22px", position: "relative" }} className="fadeUp">
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div className="amiri" style={{ fontSize: 40, color: C.goldBright, lineHeight: 1.6 }}>أَسْتَغْفِرُ الله</div>
            <div className="display" style={{ fontSize: 34, fontWeight: 600, marginTop: 8 }}>Sakinah</div>
            <div style={{ fontSize: 12, color: C.faint, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>The Istighfar Companion</div>
            <div style={{ fontSize: 14, color: C.muted, marginTop: 18, lineHeight: 1.6 }}>
              1,000 istighfar a day. Your streak, synced on every device, alongside believers around the world.
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
            <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 14, padding: 18, textAlign: "center", fontSize: 14, color: C.ivory, lineHeight: 1.6 }}>
              ✉️ Check your inbox — we sent a sign-in link to <b>{email}</b>. Open it on this device.
            </div>
          )}
        </div>
      </Shell>
    );
  }

  /* ------- onboarding (logged in, no profile yet) ------- */
  if (profile === null) {
    const visOptions = [
      { id: "name", title: "Show my name", desc: "Appear on the Ummah board with your name and flag." },
      { id: "anon", title: "Join anonymously", desc: "Appear as “Servant #XXXX” — your identity stays hidden." },
      { id: "private", title: "Keep me private", desc: "No leaderboard at all. Only your own personal tracking." },
    ];
    return (
      <Shell>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "50px 22px", position: "relative" }} className="fadeUp">
          <div className="display" style={{ fontSize: 26, fontWeight: 600, marginBottom: 6 }}>As-salamu alaykum 👋</div>
          <div style={{ fontSize: 13.5, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>
            Choose how you'd like to be part of the journey. You stay in full control of what others see.
          </div>

          <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>Privacy</label>
          <div style={{ margin: "8px 0 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {visOptions.map((v) => {
              const active = obVis === v.id;
              return (
                <button key={v.id} onClick={() => setObVis(v.id)}
                  style={{
                    textAlign: "left", background: active ? C.surface2 : C.surface,
                    border: `1px solid ${active ? C.gold : C.line}`, borderRadius: 12,
                    padding: "12px 14px", cursor: "pointer", color: C.ivory,
                  }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: active ? C.goldBright : C.ivory }}>{active ? "● " : "○ "}{v.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>{v.desc}</div>
                </button>
              );
            })}
          </div>

          {obVis !== "anon" && (
            <>
              <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>Your name</label>
              <input value={obName} onChange={(e) => setObName(e.target.value)} placeholder="e.g. Yusuf" maxLength={24}
                style={{ ...inputStyle, margin: "6px 0 16px" }} />
            </>
          )}
          {obVis === "anon" && (
            <div style={{ fontSize: 12.5, color: C.muted, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 14px", margin: "0 0 16px", lineHeight: 1.5 }}>
              You'll appear as an anonymous servant of Allah — no name needed.
            </div>
          )}

          <label style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.faint }}>Your country</label>
          <select value={obFlag} onChange={(e) => setObFlag(e.target.value)} style={{ ...inputStyle, margin: "6px 0 22px" }}>
            {COUNTRIES.map(([flag, cname]) => (<option key={cname} value={flag}>{flag}  {cname}</option>))}
          </select>
          <button onClick={createProfile} disabled={authBusy || (obVis !== "anon" && !obName.trim())}
            style={{ ...goldBtn, opacity: authBusy || (obVis !== "anon" && !obName.trim()) ? 0.6 : 1 }}>
            Begin the journey →
          </button>
        </div>
      </Shell>
    );
  }

  if (profile === undefined) {
    return (
      <Shell>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: C.muted }}>Loading your journey…</div>
      </Shell>
    );
  }

  /* ------- main app ------- */
  const daily = BENEFITS[dailyIdx];
  const benefit = BENEFITS[browseIdx];

  return (
    <Shell>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: "20px 18px 96px", position: "relative" }}>
        {/* Header */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="display" style={{ fontSize: 26, fontWeight: 600, letterSpacing: 0.5 }}>Sakinah</div>
            <div style={{ fontSize: 11, color: C.faint, letterSpacing: 2.5, textTransform: "uppercase" }}>
              {profile.country_flag} {profile.name}
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

        {/* COUNT */}
        {tab === "count" && (
          <div className="fadeUp">
            <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
              <button onClick={(e) => addCount(1, e)} aria-label="Count one istighfar"
                style={{
                  position: "relative", width: 290, height: 290, borderRadius: "50%",
                  background: `radial-gradient(circle at 50% 42%, ${C.surface2}, ${C.surface} 70%)`,
                  border: "none", cursor: "pointer",
                  animation: pct >= 1 ? "pulseGlow 2.4s ease-in-out infinite" : "none",
                  transition: "transform .08s ease",
                }}
                onPointerDown={(e) => (e.currentTarget.style.transform = "scale(.97)")}
                onPointerUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                onPointerLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
            <div style={{ textAlign: "center", fontSize: 12, color: C.faint, marginTop: 10 }}>Tap the circle with every recitation</div>

            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              {[33, 100].map((n) => (
                <button key={n} onClick={() => addCount(n)}
                  style={{ background: C.surface, color: C.ivory, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  +{n}
                </button>
              ))}
              <button onClick={undoOne} aria-label="Undo one"
                style={{ background: "transparent", color: C.muted, border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                <RotateCcw size={14} /> Undo
              </button>
            </div>

            <div style={{ marginTop: 26, background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: CAT_COLOR[daily.c], marginBottom: 6 }}>Today's reminder · {daily.c}</div>
              <div className="display" style={{ fontSize: 19, fontWeight: 600, marginBottom: 6 }}>{daily.t}</div>
              <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.55 }}>{daily.b}</div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8, fontStyle: "italic" }}>{daily.s}</div>
            </div>
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

        {/* LEADERBOARD */}
        {tab === "board" && (
          <div className="fadeUp">
            <div className="display" style={{ fontSize: 21, fontWeight: 600, marginBottom: 4 }}>The Ummah Board</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14 }}>Believers active in the last 48 hours, keeping the streak alive together.</div>

            {ummahTotal !== null && (
              <div style={{ background: C.surface2, border: `1px solid ${C.gold}44`, borderRadius: 16, padding: 18, marginBottom: 14, textAlign: "center" }}>
                <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", color: C.gold, marginBottom: 6 }}>🤲 Together as one Ummah</div>
                <div className="display" style={{ fontSize: 32, fontWeight: 600, color: C.goldBright }}>{ummahTotal.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>istighfar made through this app — every member counted, seen and unseen</div>
              </div>
            )}

            {boardLoading && <div style={{ color: C.faint, fontSize: 14, padding: 20, textAlign: "center" }}>Loading the ummah…</div>}
            {!boardLoading && board && board.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13.5, background: C.surface, borderRadius: 14, padding: 20, textAlign: "center", lineHeight: 1.6 }}>
                No active members in the last 48 hours — be the one who revives the board. 🔥
              </div>
            )}
            {!boardLoading && board && board.map((p, i) => {
              const isMe = p.id === session.user.id;
              const todayValid = p.today_date === today;
              return (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", marginBottom: 8,
                  background: isMe ? C.surface2 : C.surface, borderRadius: 14,
                  border: `1px solid ${isMe ? C.gold + "66" : C.line}`,
                }}>
                  <div className="display" style={{ width: 30, fontSize: 17, fontWeight: 600, color: i < 3 ? C.goldBright : C.faint, textAlign: "center" }}>{i + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.country_flag && <span style={{ marginRight: 6 }}>{p.country_flag}</span>}
                      {p.name}{isMe && <span style={{ color: C.gold, fontSize: 11, marginLeft: 6 }}>you</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.faint }}>{(p.total_count || 0).toLocaleString()} lifetime · {todayValid ? p.today_count : 0} today</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Flame size={14} color={p.streak > 0 ? C.gold : C.faint} fill={p.streak > 0 ? C.gold : "none"} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: p.streak > 0 ? C.goldBright : C.muted }}>{p.streak}</span>
                  </div>
                </div>
              );
            })}
            {!boardLoading && (
              <button onClick={loadBoard} style={{ width: "100%", marginTop: 6, background: "transparent", color: C.muted, border: `1px dashed ${C.line}`, borderRadius: 12, padding: 11, cursor: "pointer", fontSize: 13 }}>
                Refresh board
              </button>
            )}
          </div>
        )}

        {/* JOURNEY */}
        {tab === "journey" && (
          <div className="fadeUp">
            <div className="display" style={{ fontSize: 21, fontWeight: 600, marginBottom: 4 }}>The 6-Month Journey</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18, lineHeight: 1.55 }}>
              1,000 istighfar a day, for 180 days. A commitment of the heart — and Allah's promises are true.
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span className="display" style={{ fontSize: 34, fontWeight: 600, color: C.goldBright }}>{completedDays}</span>
                <span style={{ fontSize: 13, color: C.muted }}>of {JOURNEY_DAYS} days completed</span>
              </div>
              <div style={{ height: 10, background: C.ringTrack, borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min((completedDays / JOURNEY_DAYS) * 100, 100)}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldBright})`, borderRadius: 999, transition: "width .5s ease" }} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Current streak", value: `${streak} days` },
                { label: "Lifetime istighfar", value: totalAll.toLocaleString() },
                { label: "Today", value: `${todayCount} / ${DAILY_GOAL}` },
                { label: "Journey remaining", value: `${Math.max(JOURNEY_DAYS - completedDays, 0)} days` },
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
