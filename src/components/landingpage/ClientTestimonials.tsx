'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Testimonial {
    id: string;
    name: string;
    caseType: string;
    message: string;
    imageUrl?: string | null;
}

const TestimonialCard = ({ testimonial, isMobile = false }: { testimonial: Testimonial, isMobile?: boolean }) => (
    <div
        className={`relative rounded-2xl sm:rounded-3xl overflow-visible flex flex-col ${isMobile ? 'w-[85vw] sm:w-[60vw] flex-shrink-0 snap-center shadow-lg' : 'h-full shadow-lg'}`}
        style={{ backgroundColor: '#F0F4FF' }}
    >
        <div className="absolute right-2 sm:right-2 md:right-2 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 relative rounded-full overflow-hidden border-3 sm:border-4 border-white shadow-xl sm:shadow-2xl">
                <Image
                    src={testimonial.imageUrl || '/default-profile.png'}
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
                {testimonial.message}
            </p>
        </div>
    </div>
)

export default function ClientTestimonials({ testimonials = [] }: { testimonials?: Testimonial[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(true)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    if (!testimonials || testimonials.length === 0) {
        return null;
    }

    const extendedTestimonials = [...testimonials, ...testimonials.slice(0, 3)]
    const totalItems = testimonials.length

    const nextTestimonial = () => {
        setCurrentIndex((prev) => prev + 1)

        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = container.firstElementChild?.clientWidth || 0;
            const gap = 16;
            const scrollAmount = itemWidth + gap;

            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }

    const prevTestimonial = () => {
        setCurrentIndex((prev) => {
            if (prev === 0) {
                return prev - 1;
            }
            return prev - 1;
        })
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const itemWidth = container.firstElementChild?.clientWidth || 0;
            const gap = 16;
            const scrollAmount = itemWidth + gap;

            if (container.scrollLeft <= 10) {
                container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        }
    }

    const handleManualChange = (direction: 'next' | 'prev') => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = setInterval(nextTestimonial, 5000)
        }
        direction === 'next' ? nextTestimonial() : prevTestimonial()
    }

    useEffect(() => {
        if (currentIndex === totalItems) {
            transitionTimeoutRef.current = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentIndex(0);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsTransitioning(true);
                    })
                });
            }, 500);
        }

        if (currentIndex === -1) {
            setIsTransitioning(false);
            setCurrentIndex(totalItems - 1);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setIsTransitioning(true);
                })
            });
        }
    }, [currentIndex, totalItems])


    useEffect(() => {
        timerRef.current = setInterval(() => {
            nextTestimonial()
        }, 5000)

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current)
        }
    }, [totalItems])

    return (
        <section className="relative bg-gray-50 py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 md:px-8 lg:px-12 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-900 mb-8 sm:mb-10 md:mb-12 lg:mb-16 leading-tight px-2">
                    Every Case. Every Voice. Every Victory — <br className="hidden sm:block" />
                    Hear What Our Clients Say About Us
                </h2>

                <div className="hidden lg:block overflow-hidden mb-8">
                    <div
                        className="flex"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / 3)}%)`,
                            transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                            width: `${(extendedTestimonials.length / 3) * 100}%`
                        }}
                    >
                        {extendedTestimonials.map((testimonial, idx) => (
                            <div
                                key={`${testimonial.id}-${idx}`}
                                className="px-3"
                                style={{ flex: `0 0 ${100 / extendedTestimonials.length}%` }}
                            >
                                <TestimonialCard testimonial={testimonial} />
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    ref={scrollContainerRef}
                    className="lg:hidden flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory scrollbar-hide px-4 -mx-4"
                >
                    {testimonials.map((testimonial) => (
                        <TestimonialCard key={testimonial.id} testimonial={testimonial} isMobile={true} />
                    ))}
                </div>

                <div className="flex justify-end items-center gap-4 sm:gap-6 mt-4 lg:mt-0">
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

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    )
}
