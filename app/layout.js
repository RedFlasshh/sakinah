import "./globals.css";

export const metadata = {
  title: "Sakinah — The Istighfar Companion",
  description: "1,000 istighfar a day. Build your streak with believers around the world.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
