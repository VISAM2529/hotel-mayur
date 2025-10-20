import Image from 'next/image'
import Card from '@/components/ui/Card'
import SectionHeading from '@/components/ui/SectionHeading'
import { features } from '@/data/features'

export default function Features() {
  return (
    <section className="section-padding bg-gradient-to-b from-white to-cream">
      <div className="max-w-7xl mx-auto container-padding">
        <SectionHeading
          subtitle="Why Choose Us"
          title="Experience the"
          highlight="Best Services"
          description="We offer multiple ways to enjoy our delicious food with modern technology and traditional hospitality"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.id}
              className="text-center p-8 group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center group-hover:bg-primary-500 transition-colors duration-300">
                <div className="relative w-10 h-10">
                  <Image
                    src={feature.icon}
                    alt={feature.title}
                    fill
                    className="object-contain   transition-all"
                  />
                </div>
              </div>
              <h3 className="font-display text-xl font-bold mb-3 group-hover:text-primary-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}