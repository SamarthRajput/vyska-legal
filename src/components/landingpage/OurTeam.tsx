'use client'
import Image from 'next/image'

export default function MeetOurTeam() {
    const teamMembers = [
        {
            id: 1,
            name: "Vibhu Garg",
            title: "Advocate",
            description: "Designated Partner, with over 10 years of expertise",
            image: "/vibhu.png",
            bgColor: "bg-blue-50",
            height: "580px", // Adjusted for better desktop proportion
            imageSize: "w-60 h-60"
        },
        {
            id: 2,
            name: "Anjana Tiwari",
            title: "Advocate",
            description: "Designated Partner, with over 8 years of expertise",
            image: "/ajana.png",
            bgColor: "bg-blue-50",
            height: "480px", // Adjusted for better desktop proportion
            imageSize: "w-52 h-52"
        }
    ]

    return (
        <section className="relative bg-[#1a1a1a] pt-20 text-white overflow-x-hidden overflow-y-hidden">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-20">
                    <div className="lg:w-[35%] space-y-8 flex-shrink-0 text-center lg:text-left">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
                            MEET OUR<br />TEAM
                        </h2>
                        <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto lg:mx-0 leading-relaxed">
                            The people behind your protection, your progress, and your peace of mind.
                        </p>
                        <div className="hidden lg:flex items-center justify-start relative pt-10">
                            <div className="w-140 h-[5px] bg-white"></div>
                            <svg
                                className="w-8 h-8"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                            </svg>
                            <div className="absolute -top-[33px] right-0 w-24 h-24">
                                    <Image
                                        src="/handshake.png"
                                        alt="Handshake"
                                        fill
                                        className="object-contain"
                                    />
                            </div>
                        </div>
                    </div>

                    <div className="lg:w-[65%] w-full flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-12">
                        {teamMembers.map((member) => (
                            <div
                                key={member.id}
                                className={`flex-shrink-0 ${member.bgColor} rounded-t-full rounded-b-[3rem] transition-all duration-300 hover:scale-105 cursor-pointer shadow-2xl`}
                                style={{
                                    width: '280px', // Standard width for consistency
                                    height: member.height
                                }}
                            >
                                <div className="flex flex-col items-center pt-8 px-5">
                                    <div className={`${member.imageSize} relative rounded-full overflow-hidden mb-6 border-4 border-white shadow-xl`}>
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <div className="text-center space-y-2 px-3">
                                        <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                                            {member.name},
                                        </h3>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {member.title}
                                        </p>
                                        <p className="text-sm text-gray-700 pt-2 leading-relaxed">
                                            {member.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
