import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import SpecialDishes from '@/components/landing/SpecialDishes'
import About from '@/components/landing/About'
import HowItWorks from '@/components/landing/HowItWorks'
import Gallery from '@/components/landing/Gallery'
import Testimonials from '@/components/landing/Testimonials'
import CTASection from '@/components/landing/CTASection'
import ContactSection from '@/components/landing/ContactSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <SpecialDishes />
      <About />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <CTASection />
      <ContactSection />
      <Footer />
    </main>
  )
}