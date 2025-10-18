'use client'

import ClientTestimonials from '@/components/landingpage/ClientTestimonials'
import FAQSection from '@/components/landingpage/FAQSection'
import HeroCarousel from '@/components/landingpage/ImageCarousel'
import MeetOurTeam from '@/components/landingpage/OurTeam'
import Services from '@/components/landingpage/Services'
import WhyVyskaExists from '@/components/landingpage/WhyVyska'
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Homepage = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const servicesRef = useRef<HTMLDivElement>(null)
  const whyVyskaRef = useRef<HTMLDivElement>(null)
  const teamRef = useRef<HTMLDivElement>(null)
  const testimonialsRef = useRef<HTMLDivElement>(null)
  const faqRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const sections = [
      servicesRef.current,
      whyVyskaRef.current,
      teamRef.current,
      testimonialsRef.current,
      faqRef.current
    ]

    sections.forEach((section) => {
      if (section) {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 50
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'top 65%',
              toggleActions: 'play none none none'
            }
          }
        )
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div className='overflow-x-hidden scroll-smooth'>
      <div ref={heroRef}>
        <HeroCarousel />
      </div>
      <div ref={servicesRef}>
        <Services />
      </div>
      <div ref={whyVyskaRef}>
        <WhyVyskaExists />
      </div>
      <div ref={teamRef}>
        <MeetOurTeam />
      </div>
      <div ref={testimonialsRef}>
        <ClientTestimonials />
      </div>
      <div ref={faqRef}>
        <FAQSection />
      </div>
    </div>
  )
}

export default Homepage
