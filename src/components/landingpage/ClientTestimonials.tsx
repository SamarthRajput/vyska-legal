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
        className={`relative rounded-3xl mt-10 flex flex-col ${isMobile ? 'w-[85vw] sm:w-[60vw] flex-shrink-0 snap-center' : 'h-full'}`}
        style={{ backgroundColor: '#F0F4FF',
            overflow: 'visible'
         }}
    >
        <div className="absolute right-3 sm:right-6 -top-10 z-10">
            <div className="w-[92px] h-[91px] relative">
                <div className="absolute inset-0 rounded-full" style={{ backgroundColor: '#E4EBFF' }}></div>
                <div className="absolute inset-[6px] rounded-full overflow-hidden" style={{ backgroundColor: '#DDE3F7' }}>
                    <Image
                        src={testimonial.imageUrl || '/default-profile.avif'}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
        <div
            className="relative h-[49px] flex items-center rounded-t-3xl"
            style={{
                backgroundColor: '#224099',
                width: '80.5%'
            }}
        >
            <div className="flex flex-col gap-1 pl-[34px]">
                <h3 className="text-base font-normal text-[#F3F3F3] leading-[19px]">
                    {testimonial.name} -
                </h3>
                <p className="text-[10px] font-normal text-[#F3F3F3] leading-[12px]">
                    {testimonial.caseType}
                </p>
            </div>
        </div>

        <div className="px-[34px] py-8 flex items-center">
            <p className="text-xl font-medium text-[#1E1E1E] leading-[30px]" style={{ fontFamily: 'Lato' }}>
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
