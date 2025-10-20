import Image from 'next/image'
import SectionHeading from '@/components/ui/SectionHeading'

export default function Gallery() {
  const galleryImages = [
    { id: 1, src: '/images/gallery/gallery-1.jpg', alt: 'Delicious food presentation', span: 'col-span-2 row-span-2' },
    { id: 2, src: '/images/gallery/gallery-2.jpg', alt: 'Restaurant ambiance', span: 'col-span-1 row-span-1' },
    { id: 3, src: '/images/gallery/gallery-3.jpg', alt: 'Special dish', span: 'col-span-1 row-span-1' },
    { id: 4, src: '/images/gallery/gallery-4.jpg', alt: 'Chef cooking', span: 'col-span-1 row-span-2' },
    { id: 5, src: '/images/gallery/gallery-5.jpg', alt: 'Dining experience', span: 'col-span-1 row-span-1' },
    { id: 6, src: '/images/gallery/gallery-6.jpg', alt: 'Food plating', span: 'col-span-2 row-span-1' },
  ]

  return (
    <section className="section-padding bg-cream">
      <div className="max-w-7xl mx-auto container-padding">
        <SectionHeading
          subtitle="Our Memories"
          title="Photo"
          highlight="Gallery"
          description="Take a glimpse of our restaurant, food, and the wonderful moments we've shared with our customers"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`${image.span} relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <p className="text-white font-medium">{image.alt}</p>
              </div>
              {/* Zoom Icon */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}