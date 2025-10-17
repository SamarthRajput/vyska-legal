'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ClientTestimonials() {
    const [currentPage, setCurrentPage] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const testimonials = [
        {
            id: 1,
            name: "Neha & Rakesh",
            caseType: "Adoption Case",
            image: "/neha.png",
            testimonial: "They handled our adoption case with so much care. on every hearing—they were there. We're finally a family, and we couldn't have done it without them."
        },
        {
            id: 2,
            name: "Arjun sharma",
            caseType: "Business Law Case",
            image: "/neha.png",
            testimonial: "We needed quick legal advice on a vendor contract. The team was sharp, responsive, and helped us avoid a costly mistake. Definitely our go-to now."
        },
        {
            id: 3,
            name: "Shivam taneja",
            caseType: "Property Case",
            image: "/neha.png",
            testimonial: "I needed a will and property agreement done quickly. They were clear, professional, and didn't drown me in legal jargon. Just did what I needed."
        },
        {
            id: 4,
            name: "Test Client",
            caseType: "Criminal Case",
            image: "/neha.png",
            testimonial: "Amazing service and support throughout my case."
        }
    ]

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const testimonialsPerPage = isMobile ? 1 : 3
    const totalPages = Math.ceil(testimonials.length / testimonialsPerPage)

    const goToNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages)
    }

    const goToPrevious = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)
    }

    useEffect(() => {
        timerRef.current = setInterval(() => {
            goToNext()
        }, 5000)

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [currentPage, isMobile])

    const handleManualChange = (direction: 'next' | 'prev') => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        direction === 'next' ? goToNext() : goToPrevious()
    }

    const currentTestimonials = testimonials.slice(
        currentPage * testimonialsPerPage,
        (currentPage + 1) * testimonialsPerPage
    )

    return (
        <section className="relative bg-gray-50 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-10 md:mb-12 lg:mb-16 leading-tight px-2">
                    Every Case. Every Voice. Every Victory — <br className="hidden sm:block" />
                    Hear What Our Clients Say About Us
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {currentTestimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className="relative rounded-2xl sm:rounded-3xl overflow-visible flex flex-col"
                            style={{ backgroundColor: '#F0F4FF' }}
                        >
                                <div className="absolute right-2 sm:right-2 md:right-2 z-10">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 relative rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-xl sm:shadow-2xl">
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            <div 
                                className="relative px-4 sm:px-5 md:px-6 py-4 sm:py-5 rounded-t-2xl sm:rounded-t-3xl"
                                style={{ 
                                    backgroundColor: '#224099',
                                    clipPath: 'polygon(0 0, 85% 0, 95% 100%, 0 100%)'
                                }}
                            >
                                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">
                                    {testimonial.name} -
                                </h3>
                                <p className="text-xs sm:text-sm text-white/90">
                                    {testimonial.caseType}
                                </p>
                            </div>


                            <div className="p-4 sm:p-5 md:p-6 lg:p-8 pt-16 sm:pt-18 md:pt-20 lg:pt-24 flex-1">
                                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-900 leading-relaxed">
                                    {testimonial.testimonial}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end items-center gap-4 sm:gap-6">
                    <button
                        onClick={() => handleManualChange('prev')}
                        className="hover:opacity-70 transition-opacity"
                        aria-label="Previous testimonials"
                    >
                        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-900" strokeWidth={2.5} />
                    </button>
                    <button
                        onClick={() => handleManualChange('next')}
                        className="hover:opacity-70 transition-opacity"
                        aria-label="Next testimonials"
                    >
                        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-gray-900" strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </section>
    )
}
