import ClientTestimonials from '@/components/landingpage/ClientTestimonials'
import FAQSection from '@/components/landingpage/FAQSection'
import HeroCarousel from '@/components/landingpage/ImageCarousel'
import MeetOurTeam from '@/components/landingpage/OurTeam'
import Services from '@/components/landingpage/Services'
import WhyVyskaExists from '@/components/landingpage/WhyVyska'
import React from 'react'

const Homepage = () => {
  return (
    <div> 
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
