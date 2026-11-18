'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { useRouter } from 'next/navigation';
import { DefaultChatTransport, getToolName, isToolUIPart } from 'ai';
import { Bot, Loader2, Send, Sparkles, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

const TOOL_SUCCESS_MESSAGES: Record<string, string> = {
  updateCoverLetter: '✅ Cover letter updated in the database.',
  updateResumeBullets: '✅ Resume bullets updated in the database.',
};

const MARKDOWN_STYLES =
  '[&_a]:text-indigo-300 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-slate-600 [&_blockquote]:pl-3 [&_blockquote]:text-slate-300 [&_code]:rounded [&_code]:bg-slate-950/60 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[11px] [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-bold [&_h1]:text-white [&_h2]:mb-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-white [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-white [&_li]:my-1 [&_li]:pl-1 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-white [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1';

export interface AIAssistantProps {
  context: Record<string, unknown>;
  triggerLabel: string;
  prompt: string;
  title?: string;
  userName: string;
  userSkills: string[];
  onOpenChange?: (open: boolean) => void;
  forceOpen?: boolean;
}

export default function AIAssistant({
  context,
  triggerLabel,
  prompt,
  title = 'AI Assistant',
  userName,
  userSkills,
  onOpenChange,
  forceOpen,
}: AIAssistantProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const [input, setInput] = useState('');
  const [notice, setNotice] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const processedToolCalls = useRef<Set<string>>(new Set());

  const open = forceOpen ?? internalOpen;

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: '/api/assistant',
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            messages,
            context:
              (body as { context?: Record<string, unknown> } | undefined)?.context ?? {},
          },
        }),
      })
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isBusy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    const updatedToolNames = new Set<string>();

    for (const message of messages) {
      for (const part of message.parts) {
        if (!isToolUIPart(part) || part.state !== 'output-available') continue;
        if (processedToolCalls.current.has(part.toolCallId)) continue;

        processedToolCalls.current.add(part.toolCallId);
        updatedToolNames.add(getToolName(part));
      }
    }

    if (updatedToolNames.size > 0) {
      router.refresh();
      window.dispatchEvent(
        new CustomEvent('ai-data-updated', {
          detail: { toolNames: Array.from(updatedToolNames) },
        })
      );
    }
  }, [messages, router]);

  const send = async (text: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      setNotice('You must be logged in to use the AI Assistant.');
      setTimeout(() => setNotice(''), 4000);
      return;
    }

    setNotice('');
    await sendMessage(
      { text },
      {
        headers: { Authorization: `Bearer ${token}` },
        body: {
          context: {
            ...context,
            userName,
            userSkills,
          },
        },
      }
    );
  };

  const handleOpen = () => {
    if (!forceOpen) {
      setInternalOpen(true);
      onOpenChange?.(true);
    }
    if (messages.length === 0) {
      void send(prompt);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isBusy) return;
    await send(text);
    setInput('');
  };

  return (
    <>
      {!open && !forceOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[60] inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-3 rounded-full shadow-2xl transition-all"
        >
          <Sparkles size={16} />
          {triggerLabel}
        </button>
      )}

      <div
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-[60] w-full sm:w-[420px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Bot size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{title}</h2>
              <p className="text-[10px] text-slate-500">Context-aware assistant</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!forceOpen) {
                setInternalOpen(false);
                onOpenChange?.(false);
              }
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close assistant"
          >
            <X size={16} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && !isBusy && (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-2">
              <Sparkles size={22} className="opacity-50" />
              <p className="text-sm font-medium text-slate-400">Ask me anything about this page.</p>
              <p className="text-xs text-slate-600 max-w-[260px]">
                I can already see the job description, resume, or applications in view.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white whitespace-pre-wrap'
                    : `bg-slate-800/80 text-slate-100 border border-slate-700/60 ${MARKDOWN_STYLES}`
                }`}
              >
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return <ReactMarkdown key={index}>{part.text}</ReactMarkdown>;
                  }
                  if (isToolUIPart(part)) {
                    if (part.state === 'output-available') {
                      const toolName = getToolName(part);
                      return (
                        <div
                          key={index}
                          className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-2 text-xs text-emerald-300"
                        >
                          <CheckCircle2 size={12} />
                          <span>
                            {TOOL_SUCCESS_MESSAGES[toolName] ?? '✅ Data updated in the database.'}
                          </span>
                        </div>
                      );
                    }

                    if (part.state === 'output-error') {
                      return (
                        <div
                          key={index}
                          className="mt-2 flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-xs text-red-300"
                        >
                          <span>⚠️ Could not update your data. Please try again.</span>
                        </div>
                      );
                    }
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          {isBusy && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 size={14} className="animate-spin text-indigo-400" />
              Thinking...
            </div>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
              {error.message || 'Something went wrong. Please try again.'}
            </p>
          )}
        </div>

        {notice && (
          <p
            role="alert"
            className="mx-4 mb-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300"
          >
            {notice}
          </p>
        )}

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            rows={2}
            placeholder="Ask a follow-up..."
            className="flex-1 resize-none bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
