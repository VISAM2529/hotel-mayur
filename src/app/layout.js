import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
})

export const metadata = {
  title: 'Hotel Mayur - Best Food Experience in Town',
  description: 'Experience authentic flavors with Hotel Mayur. Dine-in, takeaway, and home delivery available. Order via QR code or online.',
  keywords: 'Hotel Mayur, restaurant, food delivery, dine-in, Indian cuisine, QR ordering',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}