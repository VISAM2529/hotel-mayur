import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function About() {
  return (
    <section id="about" className="section-padding bg-white">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Section */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/restaurant-interior.jpg"
                  alt="Restaurant Interior"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="relative h-72 rounded-2xl overflow-hidden shadow-lg mt-8">
                <Image
                  src="/images/restaurant-exterior.jpg"
                  alt="Restaurant Exterior"
                  fill
                  className="object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            {/* Experience Badge */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary-500 text-white rounded-2xl shadow-xl p-6 text-center">
              <p className="text-4xl font-bold font-display">10+</p>
              <p className="text-sm font-medium">Years Experience</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 lg:pl-8">
            <div>
              <p className="text-primary-500 font-medium text-sm uppercase tracking-wider mb-2">
                About Hotel Mayur
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Where Tradition Meets <span className="text-primary-500">Innovation</span>
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Hotel Mayur has been serving authentic and delicious food for over a decade. We blend traditional recipes with modern cooking techniques to create unforgettable dining experiences.
              </p>
              <p className="text-gray-600 leading-relaxed">
                From our humble beginnings to becoming a favorite dining destination, we've always focused on quality ingredients, exceptional service, and creating a warm atmosphere where families and friends can gather.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Fresh Ingredients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Expert Chefs</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Quick Service</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Hygienic Kitchen</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button variant="primary">
                Learn More
              </Button>
              <Button variant="outline">
                View Gallery
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}