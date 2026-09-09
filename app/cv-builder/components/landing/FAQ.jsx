'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'What does DevCraft Career actually do?',
    a: 'It helps you build a professional CV in minutes, then automatically looks for jobs that match your skills and experience, and notifies you when it finds one worth applying to.',
  },
  {
    q: 'How does the job matching work?',
    a: 'Once your CV or portfolio is ready, the system compares your skills, experience, and certificates against open roles it finds online — private, government, or freelance — and pings you with a direct link when you qualify.',
  },
  {
    q: 'Do I need a picture on my CV?',
    a: 'No. We offer templates both with and without a photo, so you can pick what suits the roles you are applying for.',
  },
  {
    q: 'Can I attach certificates and results?',
    a: 'Yes. The CV builder lets you upload supporting documents — certificates, transcripts, and other files — alongside your CV.',
  },
  {
    q: 'Is it free to use?',
    a: 'Yes, DevCraft Career is built to be accessible to everyone regardless of background.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
      <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">Frequently Asked Questions</h2>
      <p className="text-slate-600 text-center mb-10">Everything you need to know, explained simply.</p>
      <div className="space-y-3">
        {faqs.map((item, i) => (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-slate-900 hover:bg-slate-50"
            >
              {item.q}
              <ChevronDown
                size={18}
                className={`text-slate-500 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-slate-600 text-sm leading-relaxed">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}