"use client";
import React from "react";

const Disclaimer = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-white via-blue-50 to-white min-h-screen">
      <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-8 text-center">
        Disclaimer
      </h1>

      <div className="bg-white rounded-xl shadow p-8 border border-gray-100 space-y-6 text-gray-700 leading-relaxed">
        <p>
          The information contained on this website is provided for general
          informational purposes only. It is not intended to be, and should not
          be construed as, legal advice or a solicitation for legal services.
        </p>

        <p>
          Vyska Legal LLP operates in strict compliance with the Advocates Act,
          1961 and the Bar Council of India Rules, including Rule 36 of Chapter
          II, Part VI, which prohibits direct or indirect advertising or
          solicitation by advocates.
        </p>

        <p>
          Accessing, browsing, or using this website does not create a
          lawyer–client relationship between the user and Vyska Legal LLP. Any
          reliance on the information provided on this website is strictly at
          the user’s own discretion.
        </p>

        <p>
          Users are advised not to act upon any information provided on this
          website without seeking appropriate professional legal advice
          tailored to their specific circumstances.
        </p>

        <p>
          By proceeding beyond this page or submitting any information through
          the website, the user acknowledges that they are doing so voluntarily
          and without any form of solicitation or inducement.
        </p>
      </div>
    </main>
  );
};

export default Disclaimer;
