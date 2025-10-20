'use client'

import { useState } from 'react'
import Image from 'next/image'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import SectionHeading from '@/components/ui/SectionHeading'
import { menuHighlights } from '@/data/menu-highlights'

export default function SpecialDishes() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerPage = 4

  const handleNext = () => {
    if (currentIndex + itemsPerPage < menuHighlights.length) {
      setCurrentIndex(currentIndex + itemsPerPage)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - itemsPerPage)
    }
  }

  const visibleDishes = menuHighlights.slice(currentIndex, currentIndex + itemsPerPage)

  return (
    <section id="menu" className="section-padding bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-0 w-32 h-32 opacity-10">
        <Image src="/images/dishes/dish-1.jpg" alt="" fill className="object-contain" />
      </div>
      <div className="absolute bottom-20 right-0 w-40 h-40 opacity-10">
        <Image src="/images/dishes/dish-6.jpg" alt="" fill className="object-contain" />
      </div>

      <div className="max-w-7xl mx-auto container-padding relative z-10">
        <div className="flex items-center justify-between mb-12">
          <SectionHeading
            subtitle="Special Selection"
            title="Our Popular"
            highlight="Dishes"
            centered={false}
          />

          {/* Navigation Arrows */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                currentIndex === 0
                  ? 'border-gray-300 text-gray-300 cursor-not-allowed'
                  : 'border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex + itemsPerPage >= menuHighlights.length}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                currentIndex + itemsPerPage >= menuHighlights.length
                  ? 'bg-gray-300 text-white cursor-not-allowed'
                  : 'bg-primary-500 text-white hover:bg-primary-600'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleDishes.map((dish, index) => (
            <Card key={dish.id} className="group">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full shadow-md flex items-center space-x-1">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-sm font-semibold">{dish.rating}k</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary-500 transition-colors">
                  {dish.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {dish.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-500">
                    ${dish.price.toFixed(2)}
                  </span>
                  <button className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Menu Button */}
        <div className="text-center mt-12">
          <Button variant="primary" className="px-8">
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  )
}