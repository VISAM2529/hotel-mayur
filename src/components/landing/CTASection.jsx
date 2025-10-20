import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary-500 via-primary-600 to-orange-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 border-4 border-white rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-white rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto container-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white space-y-6">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Ready to Experience the Best Food?
            </h2>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed">
              Join thousands of satisfied customers who have made Hotel Mayur their favorite dining destination. Order now and taste the difference!
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="secondary" className="text-lg px-8 py-4">
                Order Online Now
              </Button>
              <button className="px-8 py-4 rounded-lg font-medium text-lg text-white border-2 border-white hover:bg-white hover:text-primary-500 transition-all duration-300">
                Reserve a Table
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Fast Delivery</h4>
                  <p className="text-sm text-white/80">Within 30 minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Quality Guaranteed</h4>
                  <p className="text-sm text-white/80">100% fresh ingredients</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative w-full h-96 lg:h-[500px]">
              <Image
                src="/images/hero-dish.png"
                alt="Delicious food"
                fill
                className="object-contain drop-shadow-2xl animate-float"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute top-10 right-10 bg-white rounded-2xl shadow-2xl p-4 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Placed</p>
                  <p className="font-bold text-dark">Successfully!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}