'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function HeroCarouselOld() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const slides = [
        {
            id: 1,
            type: 'fullBackground',
            title: "Legal clarity begins with",
            highlight: "conversations",
            description: "We're here to listen, guide, and act—making legal decisions easier and more confident for you",
            buttonText: "Get help now",
            buttonLink: "/contact",
            image: "/grouppic.png",
            whatsappLink: "https://wa.me/1234567890",
            bgColor: "from-gray-800 to-black"
        },
        {
            id: 2,
            type: 'diagonal',
            title: "When Everything's at Stake, We're",
            highlight: "With You",
            description: "Our team of legal experts stands united to protect your rights, with strategy, compassion & conviction.",
            buttonText: "Explore now",
            buttonLink: "/about",
            image: "/officepic.jpg",
            whatsappLink: "https://wa.me/1234567890",
            bgColor: "from-blue-700 to-blue-900"
        },
        {
            id: 3,
            type: 'diagonal',
            title: "Serving people with",
            highlight: "Integrity",
            description: "Visit our office or connect online, our doors are open for everyone.",
            buttonText: "Visit us today",
            buttonLink: "/contact",
            image: "/doorpic.png",
            whatsappLink: "https://wa.me/1234567890",
            bgColor: "from-gray-700 to-gray-900"
        }
    ]

    const goToSlide = (index: number) => {
        setCurrentSlide(index)
    }

    const goToNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
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
    }, [currentSlide])

    const handleManualChange = (index: number) => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
        goToSlide(index)
    }

    return (
        <div className="relative w-full">
            <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {slide.type === 'fullBackground' ? (
                            <div className={`h-full relative bg-gradient-to-br ${slide.bgColor}`}>
                                <div className="h-full flex items-center px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-12">
                                    <div className="text-white space-y-3 sm:space-y-4 md:space-y-6 max-w-lg lg:max-w-xl z-20">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                                            {slide.title}
                                            <br />
                                            <span className="text-white">{slide.highlight}</span>
                                        </h1>
                                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed">
                                            {slide.description}
                                        </p>
                                        <Link href={slide.buttonLink}>
                                            <button className="bg-white text-gray-900 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg text-sm md:text-base">
                                                {slide.buttonText}
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="absolute right-0 bottom-0 w-[55%] sm:w-[50%] md:w-[45%] lg:w-[40%] h-[55%] sm:h-[60%] md:h-[70%] lg:h-[75%]">
                                    <Image
                                        src={slide.image}
                                        alt={slide.title}
                                        fill
                                        className="object-contain object-bottom"
                                        priority={index === 0}
                                        sizes="(max-width: 640px) 55vw, (max-width: 768px) 50vw, (max-width: 1024px) 45vw, 40vw"
                                    />

                                    {/* WhatsApp icon on image */}
                                    <a
                                        href={slide.whatsappLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 z-30 
                                                 bg-green-500 hover:bg-green-600 active:bg-green-700
                                                 p-3 md:p-3.5 lg:p-4 
                                                 rounded-full shadow-lg hover:shadow-xl 
                                                 transition-all duration-200 
                                                 hover:scale-110 active:scale-95
                                                 touch-manipulation"
                                        aria-label="Contact on WhatsApp"
                                    >
                                        <svg
                                            className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className={`h-full flex flex-col lg:flex-row bg-gradient-to-br ${slide.bgColor}`}>
                                <div className="w-full lg:w-1/2 flex items-center px-4 sm:px-6 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12">
                                    <div className="text-white space-y-3 sm:space-y-4 md:space-y-6 max-w-lg lg:max-w-xl">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                                            {slide.title}
                                            <br />
                                            <span className="text-white">{slide.highlight}</span>
                                        </h1>
                                        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed">
                                            {slide.description}
                                        </p>
                                        <Link href={slide.buttonLink}>
                                            <button className="bg-white text-gray-900 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition-colors shadow-lg text-sm md:text-base">
                                                {slide.buttonText}
                                            </button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="w-full lg:w-1/2 relative h-48 sm:h-56 md:h-64 lg:h-full overflow-hidden">
                                    <div className="w-full h-full lg:[clip-path:polygon(10%_0,100%_0,100%_100%,0_100%)]">
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            className="object-cover"
                                            priority={index === 0}
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                        />

                                        {/* WhatsApp icon on image */}
                                        <a
                                            href={slide.whatsappLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 md:bottom-6 md:right-6 z-30 
                                                     bg-green-500 hover:bg-green-600 active:bg-green-700
                                                     p-3 md:p-3.5 lg:p-4 
                                                     rounded-full shadow-lg hover:shadow-xl 
                                                     transition-all duration-200 
                                                     hover:scale-110 active:scale-95
                                                     touch-manipulation"
                                            aria-label="Contact on WhatsApp"
                                        >
                                            <svg
                                                className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-white"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-center items-center py-3 sm:py-4 md:py-5 lg:py-6 bg-white">
                <div className="flex space-x-2 md:space-x-3">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => handleManualChange(index)}
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full transition-all duration-300 ${currentSlide === index
                                    ? 'bg-blue-600 scale-110'
                                    : 'bg-gray-400 hover:bg-gray-500'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                            aria-current={currentSlide === index}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
