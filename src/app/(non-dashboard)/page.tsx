'use client'

import ClientTestimonials from '@/components/landingpage/ClientTestimonials'
import FAQSection from '@/components/landingpage/FAQSection'
import HeroCarousel from '@/components/landingpage/ImageCarousel'
import MeetOurTeam from '@/components/landingpage/OurTeam'
import Services from '@/components/landingpage/Services'
import WhyVyskaExists from '@/components/landingpage/WhyVyska'
import React, { useLayoutEffect, useRef } from 'react'
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
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 1.5,
          ease: 'power2.out'
        }
      )
    }

    if (servicesRef.current) {
      gsap.fromTo(
        servicesRef.current,
        { opacity: 0, x: -100 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 75%',
            end: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    if (whyVyskaRef.current) {
      gsap.fromTo(
        whyVyskaRef.current,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.2,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: whyVyskaRef.current,
            start: 'top 75%',
            end: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    if (teamRef.current) {
      gsap.fromTo(
        teamRef.current,
        { opacity: 0, x: 100 },
        {
          opacity: 1,
          x: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: teamRef.current,
            start: 'top 75%',
            end: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    if (testimonialsRef.current) {
      gsap.fromTo(
        testimonialsRef.current,
        { opacity: 0, y: 100, rotationX: -15 },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 1.3,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: testimonialsRef.current,
            start: 'top 75%',
            end: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    if (faqRef.current) {
      gsap.fromTo(
        faqRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: faqRef.current,
            start: 'top 75%',
            end: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div>
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
