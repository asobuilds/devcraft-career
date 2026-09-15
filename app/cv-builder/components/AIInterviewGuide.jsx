'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeftCircle, X, Loader2, CheckCircle2, Wand2, Lightbulb } from 'lucide-react';

const QUESTIONS = [
  {
    key: 'fullName',
    prompt: "What's your full name?",
    hint: 'Use your name exactly as you want an employer to see it.',
    example: 'Agene Okoh',
    type: 'text',
    placeholder: 'e.g. Agene Okoh',
  },
  {
    key: 'email',
    prompt: "What's your email address?",
    hint: 'Use one you check often — this is how employers will reach you.',
    example: 'agene.okoh@email.com',
    type: 'text',
    placeholder: 'you@example.com',
  },
  {
    key: 'phone',
    prompt: "What's your phone number?",
    hint: 'Include your country code, e.g. +234...',
    example: '+234 803 123 4567',
    type: 'text',
    placeholder: '+234 800 000 0000',
  },
  {
    key: 'website',
    prompt: 'Do you have a portfolio or website link?',
    hint: 'Optional — leave this blank if you do not have one yet.',
    example: 'https://agene.dev',
    type: 'text',
    placeholder: 'https://yourname.dev (optional)',
  },
  {
    key: 'skills',
    prompt: 'What are your top skills or tools?',
    hint: 'List the things you are good at, separated by commas. Mix technical and soft skills if relevant.',
    example: 'React, TypeScript, SQL, Team Communication, Problem Solving',
    type: 'text',
    placeholder: 'React, TypeScript, SQL, Communication',
  },
  {
    key: 'summary',
    prompt: 'In a sentence or two, how would you describe yourself professionally?',
    hint: 'Think: your role, how many years of experience, and what you are good at. Avoid generic phrases like "hard worker."',
    example: 'A frontend developer with 3 years of experience building fast, accessible web apps used by over 10,000 monthly users.',
    type: 'textarea',
    placeholder: 'e.g. A frontend developer with 3 years of experience building fast, accessible web apps.',
    aiAssist: true,
  },
  {
    key: 'expCompany',
    prompt: 'Where did you most recently work, or what project did you build?',
    hint: 'This can be a company, an organization, or a personal project.',
    example: 'DevCraft Labs',
    type: 'text',
    placeholder: 'e.g. DevCraft Labs',
  },
  {
    key: 'expRole',
    prompt: 'What was your role or title there?',
    hint: 'e.g. Frontend Developer, Volunteer, Team Lead.',
    example: 'Frontend Developer',
    type: 'text',
    placeholder: 'e.g. Frontend Developer',
  },
  {
    key: 'expDates',
    prompt: 'When did you work there?',
    hint: 'e.g. Jan 2024 - Present, or Summer 2023.',
    example: 'Jan 2024 - Present',
    type: 'text',
    placeholder: 'e.g. Jan 2024 - Present',
  },
  {
    key: 'expBullets',
    prompt: 'What did you do or achieve there?',
    hint: 'Use the STAR method: what was the Situation or Task, what Action did you take, and what was the Result? Try to include a number.',
    example: 'Rebuilt the checkout flow using React, cutting page load time from 4s to under 1s and reducing cart abandonment by 18%.',
    type: 'textarea',
    placeholder: 'Describe what you did in a few sentences...',
    aiAssist: true,
  },
];

function callAIAssist(fieldType, text) {
  return fetch('/api/ai-assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fieldType: fieldType, text: text }),
  })
    .then(function (res) { return res.json(); })
    .then(function (data) { return data.improvedText || text; })
    .catch(function () { return text; });
}

export default function AIInterviewGuide(props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [improving, setImproving] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [showExample, setShowExample] = useState(false);

  const currentQuestion = QUESTIONS[stepIndex];
  const currentValue = answers[currentQuestion.key] || '';
  const isLastStep = stepIndex === QUESTIONS.length - 1;
  const progressPercent = Math.round(((stepIndex + 1) / QUESTIONS.length) * 100);

  const updateAnswer = function (value) {
    const next = Object.assign({}, answers);
    next[currentQuestion.key] = value;
    setAnswers(next);
  };

  const goNext = function () {
    if (isLastStep) {
      finishInterview();
    } else {
      setStepIndex(stepIndex + 1);
      setShowHint(true);
      setShowExample(false);
    }
  };

  const goBack = function () {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setShowHint(true);
      setShowExample(false);
    }
  };

  const handleImprove = function () {
    if (!currentValue.trim()) return;
    setImproving(true);
    callAIAssist(currentQuestion.key, currentValue).then(function (improved) {
      updateAnswer(improved);
      setImproving(false);
    });
  };

  const finishInterview = function () {
    const experienceEntry = {
      id: Date.now().toString(),
      company: answers.expCompany || '',
      role: answers.expRole || '',
      dates: answers.expDates || '',
      bullets: answers.expBullets || '',
    };

    const result = {
      fullName: answers.fullName || '',
      email: answers.email || '',
      phone: answers.phone || '',
      website: answers.website || '',
      skills: answers.skills || '',
      summary: answers.summary || '',
      experience: [experienceEntry],
    };

    props.onComplete(result);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Guided CV Builder</span>
          </div>
          <button onClick={props.onClose} className="text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="h-1 bg-slate-900">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: progressPercent + '%' }}></div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">Question {stepIndex + 1} of {QUESTIONS.length}</p>
          <h3 className="text-lg font-semibold text-white leading-snug">{currentQuestion.prompt}</h3>

          {showHint === true ? (
            <p className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
              💡 {currentQuestion.hint}
            </p>
          ) : null}

          {currentQuestion.example ? (
            <div>
              <button
                type="button"
                onClick={function () { setShowExample(!showExample); }}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200"
              >
                <Lightbulb size={12} />
                {showExample ? 'Hide example' : 'See an example answer'}
              </button>
              {showExample === true ? (
                <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-2 italic">
                  "{currentQuestion.example}"
                </p>
              ) : null}
            </div>
          ) : null}

          {currentQuestion.type === 'textarea' ? (
            <textarea
              value={currentValue}
              onChange={function (e) { updateAnswer(e.target.value); }}
              placeholder={currentQuestion.placeholder}
              rows={4}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          ) : (
            <input
              type="text"
              value={currentValue}
              onChange={function (e) { updateAnswer(e.target.value); }}
              placeholder={currentQuestion.placeholder}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          {currentQuestion.aiAssist === true ? (
            <button
              onClick={handleImprove}
              disabled={improving === true || currentValue.trim() === ''}
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
            >
              {improving === true ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {improving === true ? 'Improving...' : 'Improve my answer with AI'}
            </button>
          ) : null}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-900">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30"
          >
            <ArrowLeftCircle size={16} /> Back
          </button>

          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {isLastStep === true ? (
              <React.Fragment><CheckCircle2 size={14} /> Finish and Build My CV</React.Fragment>
            ) : (
              <React.Fragment>Next <ArrowRight size={14} /></React.Fragment>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}