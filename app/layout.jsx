export const metadata = {
  title: "NBC News — Prototype",
  description: "Personalized news briefing experience",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
