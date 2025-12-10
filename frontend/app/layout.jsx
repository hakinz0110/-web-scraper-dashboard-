import './globals.css'

export const metadata = {
  title: 'Price Tracker Dashboard',
  description: 'Track product prices across websites',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
