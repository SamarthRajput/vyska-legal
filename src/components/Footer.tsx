import Link from 'next/link'
import { Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t-4 border-blue-600">
            <div className="h-1 bg-blue-600"></div>

            <div className="bg-gray-50 py-12 md:py-16 lg:py-20 px-6 sm:px-8 md:px-12 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
                        <div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-3">
                                Vyska Legal
                            </h3>
                            <p className="text-gray-700 text-base mb-6">
                                Guiding you through life's legal turns
                            </p>
                            <div className="flex items-center gap-4">
                                <Link 
                                    href="https://instagram.com" 
                                    target="_blank"
                                    className="hover:opacity-70 transition-opacity"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-6 h-6 text-gray-900" />
                                </Link>
                                <Link 
                                    href="https://linkedin.com" 
                                    target="_blank"
                                    className="hover:opacity-70 transition-opacity"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="w-6 h-6 text-gray-900" />
                                </Link>
                                <Link 
                                    href="https://twitter.com" 
                                    target="_blank"
                                    className="hover:opacity-70 transition-opacity"
                                    aria-label="Twitter"
                                >
                                    <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Quick Links
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/services" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Services
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        About us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/blogs" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Blogs
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/faq" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        FAQ
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Legal & compliance
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/privacy" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Privacy policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Terms & services
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Get in touch
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <a 
                                        href="mailto:service@vyskalegal.com" 
                                        className="text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        service@vyskalegal.com
                                    </a>
                                </li>
                                <li>
                                    <a 
                                        href="tel:+918382XXXXXX" 
                                        className="text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                        91+ 8382XXXXXX
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px]">
                <iframe
                    title="Vyska Legal Office Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.2219901290355!2d-74.00369368400567!3d40.71312937933019!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e2f4d69%3A0x6d4b5e9a7fcbe08d!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2sin!4v1697543210000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                />
            </div>

            <div className="bg-gray-100 py-6 px-6 sm:px-8 md:px-12 lg:px-16">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h5 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Visit us today !
                            </h5>
                        </div>
                        <div className="flex flex-col gap-2 text-sm md:text-base text-gray-700">
                            <div>
                                <span className="font-semibold">Offices at:</span> New Delhi, Mumbai, Pune, Noida, Lucknow and Prayagraj
                            </div>
                            <div>
                                <span className="font-semibold">Working hours:</span> 12:00 PM - 08:00 PM
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="h-2 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
        </footer>
    )
}
