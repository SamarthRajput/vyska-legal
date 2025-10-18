'use client'

import ClientTestimonials from '@/components/landingpage/ClientTestimonials'
import FAQSection from '@/components/landingpage/FAQSection'
import HeroCarousel from '@/components/landingpage/ImageCarousel'
import MeetOurTeam from '@/components/landingpage/OurTeam'
import Services from '@/components/landingpage/Services'
import WhyVyskaExists from '@/components/landingpage/WhyVyska'

const Homepage = () => {
  return (
    <div className='overflow-x-hidden
      scroll-smooth
    '>
      <HeroCarousel />
      <Services />
      <WhyVyskaExists />
      <MeetOurTeam />
      <ClientTestimonials />
      <FAQSection />
    </div>
  )
}

export default Homepage
