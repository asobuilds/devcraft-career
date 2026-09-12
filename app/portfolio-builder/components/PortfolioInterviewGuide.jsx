'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeftCircle, X, Loader2, CheckCircle2, Wand2 } from 'lucide-react';

const QUESTIONS = [
  { key: 'techStack', prompt: 'What technologies or tools do you work with?', hint: 'List them separated by commas. e.g. React, Node.js, PostgreSQL.', type: 'text', placeholder: 'React, Node.js, PostgreSQL' },
  { key: 'bio', prompt: 'How would you describe yourself as a developer?', hint: 'Mention your focus area, experience level, and what kind of work excites you.', type: 'textarea', placeholder: 'e.g. A backend-focused developer who enjoys building fast, reliable APIs.', aiAssist: true },
  { key: 'projectTitle', prompt: 'Tell me about a project you want to show off. What is it called?', hint: 'This can be a personal project, a school project, or paid work.', type: 'text', placeholder: 'e.g. DevCraft Career Platform' },
  { key: 'projectDescription', prompt: 'What does this project do, and what did you use to build it?', hint: 'Mention the problem it solves and the tools or languages used. Numbers help, e.g. "used by 50+ testers."', type: 'textarea', placeholder: 'Describe the project...', aiAssist: true },
  { key: 'liveUrl', prompt: 'Do you have a live link to this project?', hint: 'Optional — leave blank if it is not deployed anywhere yet.', type: 'text', placeholder: 'https://your-project.vercel.app (optional)' },
  { key: 'repoUrl', prompt: 'Do you have a GitHub link for this project?', hint: 'Optional — leave blank if the code is not public.', type: 'text', placeholder: 'https://github.com/you/project (optional)' },
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
    }
  };

  const goBack = function () {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setShowHint(true);
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
    const project = {
      id: Date.now().toString(),
      title: answers.projectTitle || '',
      description: answers.projectDescription || '',
      liveUrl: answers.liveUrl || '',
      repoUrl: answers.repoUrl || '',
      languages: '',
    };

    const result = {
      techStack: answers.techStack || '',
      bio: answers.bio || '',
      projects: [project],
    };

    props.onComplete(result);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-900">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Guided Portfolio Builder</span>
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