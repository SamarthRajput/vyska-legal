import { prisma } from "@/lib/prisma";
import ClientTestimonials from '@/components/landingpage/ClientTestimonials'
import FAQSection from '@/components/landingpage/FAQSection'
import HeroCarousel from '@/components/landingpage/ImageCarousel'
import MeetOurTeam from '@/components/landingpage/OurTeam'
import Services from '@/components/landingpage/Services'
import WhyVyskaExists from '@/components/landingpage/WhyVyska'

export const revalidate = 0;

const Homepage = async () => {
  const heroSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const testimonials = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const faqs = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' }
  });

  const companyInfo = await prisma.companyInfo.findFirst();

  return (
    <div className='overflow-x-hidden scroll-smooth'>
      <HeroCarousel slides={heroSlides} />
      <Services />
      <WhyVyskaExists companyStats={companyInfo} />
      <MeetOurTeam />
      <ClientTestimonials testimonials={testimonials} />
      <FAQSection faqs={faqs} />
    </div>
  )
}

export default Homepage

