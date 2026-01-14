import Link from 'next/link'
import { Instagram, Linkedin } from 'lucide-react'
import { prisma } from "@/lib/prisma"

export default async function Footer() {
    const companyInfo = await prisma.companyInfo.findFirst();

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
                                {companyInfo?.instagramUrl && (
                                    <Link
                                        href={companyInfo.instagramUrl}
                                        target="_blank"
                                        className="hover:opacity-70 transition-opacity"
                                        aria-label="Instagram"
                                    >
                                        <Instagram className="w-6 h-6 text-gray-900" />
                                    </Link>
                                )}
                                {companyInfo?.linkedinUrl && (
                                    <Link
                                        href={companyInfo.linkedinUrl}
                                        target="_blank"
                                        className="hover:opacity-70 transition-opacity"
                                        aria-label="LinkedIn"
                                    >
                                        <Linkedin className="w-6 h-6 text-gray-900" />
                                    </Link>
                                )}
                                {companyInfo?.twitterUrl && (
                                    <Link
                                        href={companyInfo.twitterUrl}
                                        target="_blank"
                                        className="hover:opacity-70 transition-opacity"
                                        aria-label="Twitter"
                                    >
                                        <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                        </svg>
                                    </Link>
                                )}
                                {companyInfo?.facebookUrl && (
                                    <Link
                                        href={companyInfo.facebookUrl}
                                        target="_blank"
                                        className="hover:opacity-70 transition-opacity"
                                        aria-label="Facebook"
                                    >
                                        <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                        </svg>
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Quick Links
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/user" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        User Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Admin Dashboard
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
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Legal & compliance
                            </h4>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/disclaimer" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Disclaimer
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacy-policy" className="text-gray-700 hover:text-blue-600 transition-colors">
                                        Privacy policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/terms-services" className="text-gray-700 hover:text-blue-600 transition-colors">
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
                                {companyInfo?.email && (
                                    <li>
                                        <a
                                            href={`mailto:${companyInfo.email}`}
                                            className="text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            {companyInfo.email}
                                        </a>
                                    </li>
                                )}
                                {companyInfo?.phone && (
                                    <li>
                                        <a
                                            href={`tel:${companyInfo.phone}`}
                                            className="text-gray-700 hover:text-blue-600 transition-colors"
                                        >
                                            {companyInfo.phone}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {companyInfo?.mapUrl && (
                <div className="relative w-full h-[200px] sm:h-[250px] md:h-[300px]">
                    <iframe
                        title="Vyska Legal Office Location"
                        src={companyInfo.mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                    />
                </div>
            )}
            
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
                                <span className="font-semibold">Head Office:</span> {companyInfo?.headOffice || companyInfo?.address || "New Delhi, Mumbai, Pune, Noida, Lucknow and Prayagraj"}
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
