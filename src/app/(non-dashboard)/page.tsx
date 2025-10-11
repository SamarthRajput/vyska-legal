import Link from 'next/link'
import React from 'react'

const Homepage = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-6 text-gray-800">
          Welcome to Vyaska Legal
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Providing expert legal guidance and insights. Explore our services,
          read insightful blogs, schedule appointments, and connect with our
          professional team.
        </p>

        <div className="flex space-x-4">
          <Link
            href="/research"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Explore Researchs
          </Link>
          <Link
            href="/blogs"
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Read Our Blog
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Homepage
