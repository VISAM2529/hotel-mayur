import Image from 'next/image'
import Button from '@/components/ui/Button'
import { HOTEL_INFO } from '@/utils/constants'

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Restaurant Background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream/95 via-orange-50/90 to-amber-50/95"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 opacity-20 z-10">
        <Image src="/images/dishes/dish-1.jpg" alt="" fill className="object-contain animate-float" />
      </div>
      <div className="absolute bottom-40 right-10 w-24 h-24 opacity-20 z-10">
        <Image src="/images/dishes/dish-2.jpg" alt="" fill className="object-contain animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto container-padding pt-32 pb-16 lg:pt-40 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-block">
              <span className="bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-medium">
                Welcome to
              </span>
            </div>

            <div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4">
                Hotel Mayur<br />
                <span className="text-dark">and Enjoy </span>
                <span className="relative inline-block">
                  <span className="text-primary-500">The Food</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 2 150 2 198 10" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-lg">
                Experience authentic flavors crafted with love. From traditional dishes to modern fusion, we serve happiness on every plate.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="primary" className="text-lg px-8 py-4">
                Reserve a Table
              </Button>
              <Button variant="secondary" className="text-lg px-8 py-4">
                Online Order
              </Button>
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
                <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Opens:</p>
                <p className="font-semibold text-dark">{HOTEL_INFO.hours.open}-{HOTEL_INFO.hours.close}</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative">
              {/* Main Dish Image with Circular Border */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Dashed Circle Border */}
                <svg className="absolute inset-0 w-full h-full animate-spin-slow" style={{ animationDuration: '20s' }}>
                  <circle
                    cx="50%"
                    cy="50%"
                    r="48%"
                    fill="none"
                    stroke="#FCD34D"
                    strokeWidth="3"
                    strokeDasharray="20 15"
                  />
                </svg>

                {/* Dish Image */}
                <div className="absolute inset-8 rounded-full overflow-hidden shadow-2xl">
                  <Image
                    src="/images/hero-dish.png"
                    alt="Delicious Food"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Floating Badge - Best Food */}
                <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-lg p-4 animate-float">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🍔</span>
                    <div>
                      <p className="text-xs text-gray-500">Best Food</p>
                      <div className="flex text-yellow-400 text-sm">
                        ★★★★★
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Badge - Salman Salad */}
                <div className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-lg p-4 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <Image
                        src="/images/dishes/dish-5.jpg"
                        alt="Salmon Salad"
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-dark">Salmon Salad</p>
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-400 text-xs">
                          ★★★★★
                        </div>
                      </div>
                      <p className="text-primary-500 font-bold">$12</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Vegetables */}
              <div className="absolute -top-8 left-12 w-16 h-16 animate-float" style={{ animationDelay: '0.5s' }}>
                <Image src="/images/dishes/dish-3.jpg" alt="" fill className="object-contain opacity-80" />
              </div>
              <div className="absolute -bottom-4 right-16 w-20 h-20 animate-float" style={{ animationDelay: '1.5s' }}>
                <Image src="/images/dishes/dish-4.jpg" alt="" fill className="object-contain opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  )
}