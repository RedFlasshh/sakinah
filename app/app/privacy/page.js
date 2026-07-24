export const metadata = {
  title: "Privacy Policy — Sakinah",
  description: "How Sakinah handles your data.",
};

const box = {
  maxWidth: 720,
  margin: "0 auto",
  padding: "48px 22px 80px",
  color: "#F4EFE2",
  lineHeight: 1.65,
};
const h2 = { fontSize: 19, fontWeight: 600, margin: "30px 0 8px", color: "#E8CD86" };
const p = { fontSize: 15, color: "#C9D6CF", margin: "0 0 10px" };

export default function Privacy() {
  return (
    <div style={{ background: "#0B1917", minHeight: "100vh" }}>
      <div style={box}>
        <h1 className="display" style={{ fontSize: 32, fontWeight: 600 }}>Privacy Policy</h1>
        <p style={{ ...p, marginTop: 6, fontSize: 13, color: "#5C776C" }}>Last updated: 24 July 2026</p>

        <p style={{ ...p, marginTop: 18 }}>
          Sakinah is a personal worship companion for counting istighfar. This policy explains, in plain
          language, exactly what we store and what we do not.
        </p>

        <h2 style={h2}>What we collect</h2>
        <p style={p}>
          <b>Your email address</b>, provided when you sign in with Google or with an email sign-in link.
          It is used only to identify your account so your progress follows you across devices.
        </p>
        <p style={p}>
          <b>A display name and country flag</b> that you choose yourself. You may choose to remain
          anonymous, in which case no name of yours is stored at all.
        </p>
        <p style={p}>
          <b>Your istighfar counts</b> — a number per day, your streak, and your lifetime total.
        </p>

        <h2 style={h2}>What we do not collect</h2>
        <p style={p}>
          No location data, no contacts, no photos, no microphone or camera access, no advertising
          identifiers, and no device tracking. We do not use analytics or advertising services, and we
          do not build a profile of you for any commercial purpose.
        </p>

        <h2 style={h2}>What other people can see</h2>
        <p style={p}>
          This is entirely your choice, and you can change it at any time in the app:
        </p>
        <p style={p}>
          <b>Anonymous</b> (the default) — other members see only a random alias, your flag, and a
          general indication of consistency. Nothing that identifies you.
        </p>
        <p style={p}>
          <b>Named</b> — the display name you chose is shown instead of the alias.
        </p>
        <p style={p}>
          <b>Private</b> — you do not appear to other members at all. This is enforced by database
          security rules, not merely hidden in the interface. Your counts still contribute to the
          anonymous community total, which reveals nothing about any individual.
        </p>
        <p style={p}>
          Your email address is never shown to other members in any mode.
        </p>

        <h2 style={h2}>Where your data lives</h2>
        <p style={p}>
          Data is stored with Supabase, which provides our database and authentication, and the app is
          served by Vercel. Access is protected by row-level security rules so that only you can read or
          modify your own daily records.
        </p>

        <h2 style={h2}>Deleting your account</h2>
        <p style={p}>
          You can delete your account and all associated data at any time from inside the app: open the
          <b> Journey</b> tab, scroll to <b>Settings</b>, and choose <b>Delete my account</b>. This
          permanently removes your profile, your daily records, and your sign-in credentials. It cannot
          be undone, and no backup copy is retained.
        </p>
        <p style={p}>
          If you cannot access the app, email a deletion request from your registered email address to
          the contact address below and it will be carried out manually.
        </p>

        <h2 style={h2}>Children</h2>
        <p style={p}>
          Sakinah is a general-audience worship tool and is not directed at children under 13.
        </p>

        <h2 style={h2}>Changes</h2>
        <p style={p}>
          If this policy changes, the date at the top will be updated and the current version will
          always be available at this address.
        </p>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          Questions or deletion requests: <b>[ygm786@gmail.com]</b>
        </p>

        <p style={{ ...p, marginTop: 34, fontSize: 13, color: "#5C776C" }}>
          <a href="/" style={{ color: "#C9A24B" }}>← Back to Sakinah</a>
        </p>
      </div>
    </div>
  );
}
