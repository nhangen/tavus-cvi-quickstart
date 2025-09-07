import './globals.css'

export const metadata = {
  title: 'Tavus CVI Quickstart',
  description: 'Experience AI conversations with Tavus Conversational Video Interface',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
