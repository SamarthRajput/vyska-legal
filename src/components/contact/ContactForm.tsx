"use client";
import { isValidEmail } from '@/lib/getExcerpt';
import React from 'react';
import { toast } from 'sonner';

export default function ContactForm() {
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
    );
};
