'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQ {
    id: string;
    question: string;
    answer: string;
}

export default function FAQSection({ faqs = [] }: { faqs?: FAQ[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    if (!faqs || faqs.length === 0) return null;


    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section className="bg-[#EAEAEA] py-16 md:py-20 lg:py-24 px-6 sm:px-8 md:px-12 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12 md:mb-16">
                    Before You Book—Here's What You Should Know
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.id}
                            className="bg-gradient-to-r from-[#224099] to-[rgba(194,209,252,0.2)] rounded-2xl p-[1px] transition-all duration-300"
                        >
                            <div className='bg-[#F0F4FF] rounded-[calc(1rem-1px)] overflow-hidden'>
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    aria-expanded={openIndex === index}
                                >
                                    <span className="text-lg md:text-xl text-gray-900 pr-4 font-lato">
                                        {faq.question}
                                    </span>
                                    {openIndex === index ? (
                                        <ChevronUp className="w-6 h-6 text-gray-700 flex-shrink-0" strokeWidth={2} />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-gray-700 flex-shrink-0" strokeWidth={2} />
                                    )}
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                                    <div className="px-6 pb-6 pt-2 font-lato">
                                        <p className="text-base md:text-lg text-[#1E1E1E] leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
