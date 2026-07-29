/* ------------------------------------------------------------------ */
/* Translations. English is the source of truth.                       */
/* Urdu is a first draft — have a native speaker verify before wide    */
/* release. Benefits/ayaat content stays English until a scholar       */
/* reviews a translation; only the interface is localised here.        */
/* ------------------------------------------------------------------ */

export const LANGS = {
  en: { label: "English", native: "English", dir: "ltr" },
  ur: { label: "Urdu", native: "اردو", dir: "rtl" },
};

/* Suggest a language from the chosen country flag at onboarding.
   User can always override in Settings. */
export const flagToLang = (flag) => {
  const urdu = ["🇵🇰", "🇮🇳"]; // Pakistan, India → offer Urdu
  if (urdu.includes(flag)) return "ur";
  return "en";
};

const T = {
  /* header / nav */
  nav_count: { en: "Count", ur: "شمار" },
  nav_benefits: { en: "Benefits", ur: "فضائل" },
  nav_ummah: { en: "Ummah", ur: "امت" },
  nav_journey: { en: "Journey", ur: "سفر" },
  you: { en: "You", ur: "آپ" },

  /* login */
  tagline: { en: "The Istighfar Companion", ur: "استغفار کا ساتھی" },
  login_sub: {
    en: "1,000 istighfar a day — kept quietly, or anonymously alongside believers around the world.",
    ur: "روزانہ 1,000 استغفار — خاموشی سے، یا گمنام طور پر دنیا بھر کے مومنین کے ساتھ۔",
  },
  continue_google: { en: "Continue with Google", ur: "گوگل سے جاری رکھیں" },
  or: { en: "or", ur: "یا" },
  email_link_btn: { en: "Email me a sign-in link", ur: "مجھے سائن اِن لنک ای میل کریں" },
  no_password: { en: "No password needed — we email you a secure link.", ur: "پاس ورڈ کی ضرورت نہیں — ہم آپ کو محفوظ لنک ای میل کرتے ہیں۔" },
  email_sent: { en: "Check your inbox — we sent a sign-in link to", ur: "اپنا اِن باکس دیکھیں — ہم نے سائن اِن لنک بھیجا ہے" },
  open_this_device: { en: "Open it on this device.", ur: "اسے اسی ڈیوائس پر کھولیں۔" },
  privacy_policy: { en: "Privacy Policy", ur: "پرائیویسی پالیسی" },

  /* onboarding */
  salam: { en: "As-salamu alaykum 👋", ur: "السلام علیکم 👋" },
  onboard_sub: {
    en: "Choose how you'd like to be present. Concealing your worship is the default here — it is the safer path for the heart.",
    ur: "منتخب کریں کہ آپ کیسے شامل ہونا چاہتے ہیں۔ اپنی عبادت کو چھپانا یہاں پہلے سے طے ہے — یہ دل کے لیے محفوظ راستہ ہے۔",
  },
  privacy_label: { en: "Privacy", ur: "پرائیویسی" },
  vis_anon_title: { en: "Join anonymously", ur: "گمنام طور پر شامل ہوں" },
  vis_anon_desc: { en: "You appear only as “Servant #XXXX” with your flag. Nothing identifies you. (Recommended)", ur: "آپ صرف ”بندہ #XXXX“ کے طور پر اپنے جھنڈے کے ساتھ نظر آتے ہیں۔ کوئی چیز آپ کی شناخت نہیں کرتی۔ (تجویز کردہ)" },
  vis_hidden_title: { en: "Hidden deed", ur: "پوشیدہ عمل" },
  vis_hidden_desc: { en: "You appear to no one at all. “The best charity is that which the left hand does not know of.”", ur: "آپ کسی کو بھی نظر نہیں آتے۔ ”بہترین صدقہ وہ ہے جس کا بائیں ہاتھ کو بھی علم نہ ہو۔“" },
  vis_name_title: { en: "Show my name", ur: "میرا نام دکھائیں" },
  vis_name_desc: { en: "Your chosen name is visible to other members.", ur: "آپ کا منتخب کردہ نام دوسرے اراکین کو نظر آتا ہے۔" },
  your_name: { en: "Your name", ur: "آپ کا نام" },
  no_name_needed: { en: "No name needed — your record stays between you and Allah.", ur: "نام کی ضرورت نہیں — آپ کا ریکارڈ آپ اور اللہ کے درمیان رہتا ہے۔" },
  your_country: { en: "Your country", ur: "آپ کا ملک" },
  begin_journey: { en: "Begin the journey →", ur: "سفر شروع کریں →" },

  /* count */
  of_today: { en: "of {goal} today", ur: "آج {goal} میں سے" },
  goal_complete: { en: "✦ Goal complete — keep going ✦", ur: "✦ ہدف مکمل — جاری رکھیں ✦" },
  tap_hint: { en: "Tap the circle with every recitation", ur: "ہر بار پڑھتے وقت دائرے کو دبائیں" },
  waiting_progress: { en: "Waiting for your saved progress…", ur: "آپ کی محفوظ پیش رفت کا انتظار…" },
  undo: { en: "Undo", ur: "واپس" },
  todays_reminder: { en: "Today's reminder", ur: "آج کی یاد دہانی" },
  remind_help_title: { en: "Would a daily reminder help?", ur: "کیا روزانہ یاد دہانی مددگار ہوگی؟" },
  remind_help_desc: { en: "One quiet message a day, at a time you choose. You can turn it off whenever you like.", ur: "دن میں ایک خاموش پیغام، آپ کے منتخب کردہ وقت پر۔ آپ جب چاہیں اسے بند کر سکتے ہیں۔" },
  set_a_time: { en: "Set a time", ur: "وقت مقرر کریں" },
  not_now: { en: "Not now", ur: "ابھی نہیں" },

  /* sync */
  sync_fail_title: { en: "Couldn't reach your saved progress", ur: "آپ کی محفوظ پیش رفت تک نہیں پہنچ سکے" },
  sync_fail_desc: { en: "Counting is paused so nothing already recorded gets overwritten.", ur: "شمار روک دیا گیا ہے تاکہ پہلے سے محفوظ کوئی چیز ضائع نہ ہو۔" },
  try_again: { en: "Try again", ur: "دوبارہ کوشش کریں" },
  waiting_sync: { en: "{n} waiting to sync — safe on this device", ur: "{n} ہم آہنگی کے منتظر — اس ڈیوائس پر محفوظ" },

  /* benefits */
  benefit_of: { en: "Benefit {i} of {total}", ur: "فضیلت {i} از {total}" },
  previous: { en: "← Previous", ur: "→ پچھلا" },
  shuffle: { en: "🎲 Shuffle", ur: "🎲 بدلیں" },
  next: { en: "Next →", ur: "← اگلا" },
  benefits_note: {
    en: "Quran & Hadith entries are direct textual promises with references. Scholars & Reflection entries are scholarly wisdom and spiritual insight — presented as such, never as scripture.",
    ur: "قرآن و حدیث کے اندراجات حوالہ جات کے ساتھ براہِ راست وعدے ہیں۔ علماء و غور و فکر کے اندراجات علمی حکمت اور روحانی بصیرت ہیں — انہیں اسی طور پر پیش کیا گیا ہے، کبھی نص کے طور پر نہیں۔",
  },

  /* ummah */
  ummah_title: { en: "The Ummah, Right Now", ur: "امت، اسی وقت" },
  ummah_sub: { en: "Not a ranking — just company. No positions, no totals, no comparison.", ur: "کوئی درجہ بندی نہیں — بس ساتھ۔ کوئی مقام نہیں، کوئی کل تعداد نہیں، کوئی موازنہ نہیں۔" },
  ummah_with_you: { en: "believers making istighfar with you today", ur: "مومنین آج آپ کے ساتھ استغفار کر رہے ہیں" },
  ummah_together: { en: "🤲 Together as one Ummah", ur: "🤲 ایک امت کے طور پر" },
  ummah_total_note: { en: "istighfar through this app — every member counted, seen and unseen", ur: "اس ایپ کے ذریعے استغفار — ہر رکن شمار میں، ظاہر اور پوشیدہ" },
  ummah_empty: { en: "No one visible right now — but those who conceal their worship are never counted as absent. 🌙", ur: "ابھی کوئی نظر نہیں آ رہا — لیکن جو اپنی عبادت چھپاتے ہیں وہ کبھی غیر حاضر شمار نہیں ہوتے۔ 🌙" },
  loading: { en: "Loading…", ur: "لوڈ ہو رہا ہے…" },
  refresh: { en: "Refresh", ur: "تازہ کریں" },

  /* journey */
  journey_title: { en: "Your Journey", ur: "آپ کا سفر" },
  journey_sub: { en: "Measured in days completed, not in unbroken chains. Illness and travel take nothing away from you.", ur: "مکمل دنوں میں ماپا جاتا ہے، نہ کہ بلا تعطل سلسلوں میں۔ بیماری اور سفر آپ سے کچھ نہیں چھینتے۔" },
  level_word: { en: "Level", ur: "درجہ" },
  days_to: { en: "{n} days to {name} ({en})", ur: "{name} ({en}) تک {n} دن" },
  all_promises: { en: "✦ Every promise of Surah Nuh, walked through ✦", ur: "✦ سورۃ نوح کا ہر وعدہ، طے کیا گیا ✦" },
  of_milestone: { en: "of {n} — {label}", ur: "{n} میں سے — {label}" },
  days_completed_word: { en: "days completed", ur: "مکمل دن" },
  milestones: { en: "Milestones", ur: "سنگِ میل" },
  stat_streak: { en: "Current streak", ur: "موجودہ تسلسل" },
  stat_consistency: { en: "Consistency", ur: "پابندی" },
  stat_lifetime: { en: "Lifetime istighfar", ur: "کل استغفار" },
  stat_days: { en: "Days completed", ur: "مکمل دن" },
  days_unit: { en: "days", ur: "دن" },

  /* settings */
  settings: { en: "Settings", ur: "ترتیبات" },
  daily_reminder: { en: "Daily reminder", ur: "روزانہ یاد دہانی" },
  reminder_on_at: { en: "On — one reminder at", ur: "آن — ایک یاد دہانی" },
  reminder_on_tail: { en: ", only if the day is still incomplete.", ur: "، صرف اگر دن ابھی نامکمل ہو۔" },
  change_time: { en: "Change the time", ur: "وقت تبدیل کریں" },
  turn_off: { en: "Turn reminders off", ur: "یاد دہانیاں بند کریں" },
  please_wait: { en: "Please wait…", ur: "براہ کرم انتظار کریں…" },
  reminder_off_desc: { en: "Off. If you turn it on, you'll get one quiet message a day at the time you choose — and nothing at all on days you've already finished.", ur: "بند۔ اگر آپ اسے آن کریں تو آپ کو دن میں ایک خاموش پیغام آپ کے منتخب وقت پر ملے گا — اور جن دنوں آپ مکمل کر چکے ہیں ان میں کچھ نہیں۔" },
  remind_me_at: { en: "Remind me at", ur: "مجھے یاد دلائیں" },
  turn_on_reminder: { en: "Turn on the reminder", ur: "یاد دہانی آن کریں" },
  setting_up: { en: "Setting up…", ur: "ترتیب دیا جا رہا ہے…" },
  reminder_home_note: { en: "Works best when the app is added to your home screen.", ur: "بہترین کام کرتا ہے جب ایپ آپ کی ہوم اسکرین پر شامل ہو۔" },
  who_sees: { en: "Who can see you", ur: "آپ کو کون دیکھ سکتا ہے" },
  set_anon: { en: "Anonymous — alias and flag only", ur: "گمنام — صرف عرفی نام اور جھنڈا" },
  set_hidden: { en: "Hidden deed — visible to no one", ur: "پوشیدہ عمل — کسی کو نظر نہیں" },
  set_name: { en: "Show my name", ur: "میرا نام دکھائیں" },
  shown_as: { en: "Currently shown as:", ur: "اس وقت اس طرح دکھایا جا رہا ہے:" },
  hidden_from_all: { en: "— hidden from everyone", ur: "— سب سے پوشیدہ" },
  home_tz: { en: "Home timezone", ur: "گھر کا ٹائم زون" },
  tz_note: { en: "Your day starts and ends in this zone, so travelling never breaks your streak.", ur: "آپ کا دن اسی زون میں شروع اور ختم ہوتا ہے، اس لیے سفر آپ کا تسلسل کبھی نہیں توڑتا۔" },
  set_to_device: { en: "Set to this device", ur: "اس ڈیوائس پر مقرر کریں" },
  why_thousand_link: { en: "Why a thousand? →", ur: "ایک ہزار کیوں؟ →" },
  why_thousand_sub: { en: "Read the reasoning again, any time.", ur: "وجہ دوبارہ پڑھیں، کسی بھی وقت۔" },
  tracker_title: { en: "This is only a tracker", ur: "یہ صرف ایک ٹریکر ہے" },
  tracker_body: { en: "Counting on your fingers is the Sunnah — the Prophet ﷺ counted on his right hand, and the fingers will testify on the Day of Judgement. A tasbeeh, a counter, or your fingers are all better than a screen. This app only keeps the tally when that helps.", ur: "انگلیوں پر گننا سنت ہے — نبی ﷺ اپنے دائیں ہاتھ پر گنتے تھے، اور قیامت کے دن انگلیاں گواہی دیں گی۔ تسبیح، کوئی گنتی کا آلہ، یا آپ کی انگلیاں — یہ سب اسکرین سے بہتر ہیں۔ یہ ایپ صرف اس وقت شمار رکھتی ہے جب اس سے مدد ملے۔" },
  language: { en: "Language", ur: "زبان" },
  danger_zone: { en: "Danger zone", ur: "خطرے کا علاقہ" },
  delete_account: { en: "Delete my account", ur: "میرا اکاؤنٹ حذف کریں" },
  delete_warn: { en: "This permanently removes your profile, every daily record, and your sign-in. It cannot be undone.", ur: "یہ آپ کا پروفائل، ہر روزانہ ریکارڈ، اور آپ کا سائن اِن مستقل طور پر ہٹا دیتا ہے۔ اسے واپس نہیں کیا جا سکتا۔" },
  delete_yes: { en: "Yes, delete everything", ur: "ہاں، سب کچھ حذف کریں" },
  cancel: { en: "Cancel", ur: "منسوخ کریں" },

  /* consistency bands */
  band_steadfast: { en: "Steadfast", ur: "ثابت قدم" },
  band_consistent: { en: "Consistent", ur: "پابند" },
  band_building: { en: "Building", ur: "تعمیر" },
  band_underway: { en: "Under way", ur: "جاری" },
  band_returning: { en: "Returning", ur: "لوٹنے والا" },
  saving: { en: "Saving…", ur: "محفوظ ہو رہا ہے…" },

  /* misc */
  opening: { en: "Opening…", ur: "کھل رہا ہے…" },
  loading_journey: { en: "Loading your journey…", ur: "آپ کا سفر لوڈ ہو رہا ہے…" },
  continue: { en: "Continue", ur: "جاری رکھیں" },
  begin: { en: "Begin", ur: "شروع کریں" },
  back: { en: "← Back", ur: "→ واپس" },
  skip: { en: "Skip", ur: "چھوڑیں" },
};

/* t("key", { goal: 1000 }) → string in the active language, English fallback */
export const makeT = (lang) => (key, vars) => {
  const entry = T[key];
  let str = entry ? (entry[lang] ?? entry.en) : key;
  if (vars) for (const k in vars) str = str.replace(`{${k}}`, vars[k]);
  return str;
};
