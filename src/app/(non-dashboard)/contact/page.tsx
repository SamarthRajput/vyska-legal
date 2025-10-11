"use client";
import { isValidEmail } from '@/lib/getExcerpt';
import React from 'react'
import { toast } from 'sonner';

const ContactUsPage = () => {
  const [formData, setFormData] = React.useState<{
    name: string;
    email: string;
    message: string;
    phone: string | null;
    subject: string;
  }>({
    name: '',
    email: '',
    message: '',
    phone: null,
    subject: '',
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      if (!formData.name || !formData.email || !formData.message || !formData.subject) {
        toast.error('Please fill in all required fields.');
        setError('Please fill in all required fields.');
        setSubmitting(false);
        return;
      }
      if (formData.name.length > 100) {
        toast.error('Name is too long (max 100 characters).');
        setError('Name is too long (max 100 characters).');
        setSubmitting(false);
        return;
      }
      if (formData.subject.length > 150) {
        toast.error('Subject is too long (max 150 characters).');
        setError('Subject is too long (max 150 characters).');
        setSubmitting(false);
        return;
      }
      if (formData.message.length > 2000) {
        toast.error('Message is too long (max 2000 characters).');
        setError('Message is too long (max 2000 characters).');
        setSubmitting(false);
        return;
      }
      if (formData.phone && formData.phone.length > 20) {
        toast.error('Phone number is too long (max 20 characters).');
        setError('Phone number is too long (max 20 characters).');
        setSubmitting(false);
        return;
      }
      if (!isValidEmail(formData.email)) {
        toast.error('Please enter a valid email address.');
        setError('Please enter a valid email address.');
        setSubmitting(false);
        return;
      }
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Your message has been sent successfully.');
        setSuccess('Your message has been sent successfully.');
        setFormData({ name: '', email: '', message: '', phone: null, subject: '' });
      } else {
        toast.error(data.error || 'Failed to submit the form. Please try again.');
        setError(data.error || 'Failed to submit the form. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again later.');
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center px-2 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
        {/* Left: Branding & Info */}
        <div className="md:w-1/2 bg-gradient-to-br from-blue-700 to-blue-500 text-white flex flex-col justify-between p-8 md:p-10">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src="/logo.png" alt="Vyaska Legal Logo" className="h-12 w-12 rounded-full bg-white p-1 shadow" />
              <span className="text-2xl font-extrabold tracking-wide">Vyaska Legal</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
            <p className="text-blue-100 mb-8">
              Have a question, need legal advice, or want to work with us? Fill out the form and our team will get back to you promptly.
            </p>
            <div className="space-y-4 text-blue-100 text-sm">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 2v6a2 2 0 002 2h6"></path><path d="M2 7v13a2 2 0 002 2h16a2 2 0 002-2V7"></path></svg>
                <span>info@vyaskalegal.com</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path><path d="M16 3v4a1 1 0 001 1h4"></path></svg>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2h5"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>123, Law Street, Bengaluru, India</span>
              </div>
            </div>
          </div>
          <div className="mt-10 text-xs text-blue-200">
            &copy; {new Date().getFullYear()} Vyaska Legal. All rights reserved.
          </div>
        </div>
        {/* Right: Contact Form */}
        <div className="md:w-1/2 flex items-center justify-center p-6 md:p-10">
          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Send us a message</h3>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  aria-required="true"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  aria-required="false"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  placeholder="Your message"
                  value={formData.message}
                  onChange={handleChange}
                  aria-required="true"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition duration-200 ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
            {error && <p className="mt-2 text-center text-red-600">{error}</p>}
            {success && <p className="mt-2 text-center text-green-600">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
