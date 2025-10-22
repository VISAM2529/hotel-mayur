import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/context/CartContext'
import { OrdersProvider } from '@/context/OrdersContext'
import { CaptainProvider } from '@/context/CaptainContext'
import { AdminProvider } from '@/context/AdminContext'
import { KitchenProvider } from '@/context/KitchenContext'
import { Toaster } from 'react-hot-toast'

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
      <body>
        <CartProvider>
          <OrdersProvider>
            <CaptainProvider>
              <AdminProvider>
                <KitchenProvider>
                {children}
                <Toaster 
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#fff',
                      color: '#1F1F1F',
                      padding: '16px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                </KitchenProvider>
              </AdminProvider>
            </CaptainProvider>
          </OrdersProvider>
        </CartProvider>
      </body>
    </html>
  )
}