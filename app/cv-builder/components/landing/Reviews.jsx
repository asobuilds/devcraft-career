'use client';
import { useState } from 'react';
import { Star, Send } from 'lucide-react';

const testimonials = [
  { name: 'Amaka O.', role: 'Frontend Developer', text: 'Built my CV in ten minutes and got matched to a remote role within a week.' },
  { name: 'Tunde A.', role: 'Data Analyst', text: 'The job alerts actually match my skills. No more scrolling through irrelevant listings.' },
  { name: 'Chiamaka N.', role: 'Recent Graduate', text: 'Being able to attach my certificates made my CV feel complete and professional.' },
];

export default function Reviews() {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire this up to your backend/Supabase table for feedback
    setSubmitted(true);
    setFeedback('');
  };

  return (
    <section id="reviews" className="bg-slate-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">What Users Are Saying</h2>

        <div className="grid md:grid-cols-3 gap-6 mb-14">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="flex gap-0.5 mb-3 text-amber-400">
                {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-sm font-semibold text-slate-900">{t.name}</p>
              <p className="text-xs text-slate-500">{t.role}</p>
            </div>
          ))}
        </div>

        <div className="max-w-lg mx-auto bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Leave your feedback</h3>
          {submitted ? (
            <p className="text-sm text-green-600">Thanks for your feedback!</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setRating(n)}>
                    <Star size={20} className={n <= rating ? 'text-amber-400' : 'text-slate-300'} fill={n <= rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
                placeholder="Tell us what you think..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg"
              >
                <Send size={14} /> Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}