'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeftCircle, X, Loader2, CheckCircle2, Wand2, Lightbulb } from 'lucide-react';

const QUESTIONS = [
  {
    key: 'portfolioTitle',
    prompt: 'What would you like to call your portfolio?',
    hint: 'e.g. "Jane Doe - Full Stack Developer" or simply your name.',
    example: 'Agene Okoh - Frontend Developer',
    type: 'text',
    placeholder: 'e.g. Agene Okoh - Developer',
  },
  {
    key: 'techStack',
    prompt: 'What are your main tools and technologies?',
    hint: 'List what you work with, separated by commas.',
    example: 'React, TypeScript, Node.js, PostgreSQL',
    type: 'text',
    placeholder: 'React, TypeScript, Node.js, PostgreSQL',
  },
  {
    key: 'bio',
    prompt: 'In a few sentences, who are you as a developer?',
    hint: 'Mention what you build, what you enjoy, and what makes you stand out. Avoid vague phrases like "passionate developer."',
    example: 'I build fast, accessible web apps with React and Node. I care most about clean UI and code that is easy for the next person to read.',
    type: 'textarea',
    placeholder: 'e.g. A frontend-focused developer who loves building clean, fast interfaces.',
    aiAssist: true,
  },
  {
    key: 'subdomain',
    prompt: 'What handle would you like for your portfolio link?',
    hint: 'Letters and numbers only, no spaces. e.g. "agene-dev".',
    example: 'agene-dev',
    type: 'text',
    placeholder: 'your-handle',
  },
  {
    key: 'projTitle',
    prompt: 'What is one project you are proud of?',
    hint: 'This can be a personal project, a freelance job, or schoolwork.',
    example: 'DevCraft Career Platform',
    type: 'text',
    placeholder: 'e.g. DevCraft Career Platform',
  },
  {
    key: 'projDescription',
    prompt: 'What does this project do, and what did you build?',
    hint: 'Use the STAR method: what problem did it solve, what did you specifically build, and what was the outcome? A number helps.',
    example: 'A job-matching platform that pulls listings from 10+ sources. I built the matching engine and CV builder, now used by 200+ fellows.',
    type: 'textarea',
    placeholder: 'Describe the project...',
    aiAssist: true,
  },
  {
    key: 'projLiveUrl',
    prompt: 'Is there a live link to see it?',
    hint: 'Optional — leave blank if it is not deployed anywhere.',
    example: 'https://devcraft-career.vercel.app',
    type: 'text',
    placeholder: 'https://yourproject.com (optional)',
  },
  {
    key: 'projRepoUrl',
    prompt: 'Is there a code repository link?',
    hint: 'Optional — a GitHub link, for example.',
    example: 'https://github.com/you/project',
    type: 'text',
    placeholder: 'https://github.com/you/project (optional)',
  },
  {
    key: 'projLanguages',
    prompt: 'What languages or tools did this project use?',
    hint: 'Separate with commas.',
    example: 'React, Supabase, Tailwind',
    type: 'text',
    placeholder: 'React, Supabase, Tailwind',
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

export default function PortfolioInterviewGuide(props) {
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
    const projectEntry = {
      id: Date.now().toString(),
      title: answers.projTitle || '',
      description: answers.projDescription || '',
      liveUrl: answers.projLiveUrl || '',
      repoUrl: answers.projRepoUrl || '',
      languages: answers.projLanguages || '',
    };

    const result = {
      portfolioTitle: answers.portfolioTitle || 'My Developer Portfolio',
      techStack: answers.techStack || '',
      bio: answers.bio || '',
      subdomain: answers.subdomain || '',
      projects: [projectEntry],
    };

    props.onComplete(result);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-lg max-h-[95vh] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-900 shrink-0">
          <div className="flex items-center gap-2 text-indigo-400 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Guided Portfolio Builder</span>
          </div>
          <button onClick={props.onClose} className="text-slate-500 hover:text-white p-1 -m-1">
            <X size={18} />
          </button>
        </div>

        <div className="h-1 bg-slate-900 shrink-0">
          <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: progressPercent + '%' }}></div>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <p className="text-[11px] sm:text-xs text-slate-500">Question {stepIndex + 1} of {QUESTIONS.length}</p>
          <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">{currentQuestion.prompt}</h3>

          {showHint === true ? (
            <p className="text-[11px] sm:text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
              💡 {currentQuestion.hint}
            </p>
          ) : null}

          {currentQuestion.example ? (
            <div>
              <button
                type="button"
                onClick={function () { setShowExample(!showExample); }}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-300 hover:text-amber-200 py-1"
              >
                <Lightbulb size={12} />
                {showExample ? 'Hide example' : 'See an example answer'}
              </button>
              {showExample === true ? (
                <p className="text-[11px] sm:text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-2 italic break-words">
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
              className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 disabled:opacity-40 py-1"
            >
              {improving === true ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
              {improving === true ? 'Improving...' : 'Improve my answer with AI'}
            </button>
          ) : null}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-900 shrink-0">
          <button
            onClick={goBack}
            disabled={stepIndex === 0}
            className="inline-flex items-center justify-center gap-1 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 py-2 sm:py-0"
          >
            <ArrowLeftCircle size={16} /> Back
          </button>

          <button
            onClick={goNext}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            {isLastStep === true ? (
              <React.Fragment><CheckCircle2 size={14} /> Finish and Build My Portfolio</React.Fragment>
            ) : (
              <React.Fragment>Next <ArrowRight size={14} /></React.Fragment>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}