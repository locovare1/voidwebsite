"use client";

import * as React from 'react';

export default function ContactPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = React.useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
  
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        console.error('Form submission error:', data.error);
        setStatus('error');
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper gpu-accelerated">
      <div className="void-container py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 gradient-text text-center animate-bounce-in gpu-accelerated">Contact Us</h1>
          <p className="text-gray-300 text-center mb-8 animate-slide-in-up stagger-1 gpu-accelerated">
            Have questions or want to get in touch? Fill out the form below and we&apos;ll get back to you as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="void-card space-y-6 scroll-reveal hover-lift gpu-accelerated">
            <div className="stagger-child">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] text-white transition-all duration-300 focus:scale-105 hover:border-[#FFFFFF]/50 gpu-accelerated"
                placeholder="Your name"
              />
            </div>

            <div className="stagger-child">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] text-white transition-all duration-300 focus:scale-105 hover:border-[#FFFFFF]/50 gpu-accelerated"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="stagger-child">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] text-white transition-all duration-300 focus:scale-105 hover:border-[#FFFFFF]/50 gpu-accelerated"
                placeholder="What is this regarding?"
              />
            </div>

            <div className="stagger-child">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 bg-[#2A2A2A] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFFFFF] text-white resize-none transition-all duration-300 focus:scale-105 hover:border-[#FFFFFF]/50 gpu-accelerated"
                placeholder="Your message here..."
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="void-button w-full hover-lift stagger-child gpu-accelerated"
            >
              {status === 'sending' ? (
                <span className="flex items-center justify-center">
                  <div className="loading-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full mr-2"></div>
                  Sending...
                </span>
              ) : 'Send Message'}
            </button>

            {status === 'success' && (
              <p className="text-green-500 text-center animate-bounce-in">
                Thank you for your message! We&apos;ll get back to you soon.
              </p>
            )}
            
            {status === 'error' && (
              <p className="text-red-500 text-center animate-bounce-in">
                There was an error sending your message. Please try again later.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 