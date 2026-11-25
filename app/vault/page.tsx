'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AIAssistant from '@/app/components/AIAssistant';
import UserHeader from '@/app/components/UserHeader';
import { Folder, FileText, Image, Loader2, X, ArrowLeft, CheckCircle2, Calendar, GraduationCap, TrendingUp, Users, Sparkles, Heart, MessageCircle, Send, Eye, EyeOff, Download, Printer } from 'lucide-react';

interface Document {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  publicUrl?: string;
  extracted_text?: string;
  created_at: string;
}

function getFileIconAndBadge(fileType: string) {
  const lower = fileType.toLowerCase();
  if (lower.includes('pdf')) return { Component: FileText, badge: 'PDF' };
  if (lower.includes('image') || lower.includes('png') || lower.includes('jpg') || lower.includes('jpeg') || lower.includes('gif') || lower.includes('webp')) return { Component: Image, badge: 'Image' };
  if (lower.includes('nysc') || lower.includes('certificate')) return { Component: GraduationCap, badge: 'Certificate' };
  if (lower.includes('id') || lower.includes('passport')) return { Component: Users, badge: 'ID' };
  if (lower.includes('transcript')) return { Component: Loader2, badge: 'Transcript' };
  return { Component: FileText, badge: 'Document' };
}

function isImageDocument(doc: Document) {
  return /image\/|\.(png|jpe?g|gif|webp|avif|bmp|heic|heif)$/i.test(
    `${doc.file_type} ${doc.file_name}`
  );
}

function withPublicUrls(docs: Document[]): Document[] {
  return docs.map((doc) => {
    const publicUrl = supabase.storage
      .from('vault')
      .getPublicUrl(doc.storage_path).data.publicUrl;
    return { ...doc, publicUrl };
  });
}

export default function Vault() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanningFile, setScanningFile] = useState<File | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [aiDoc, setAiDoc] = useState<Document | null>(null);
  const [userName, setUserName] = useState('Candidate');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user profile and documents
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user} } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setUserName(
        (user.user_metadata?.full_name as string) || user.email || 'Candidate'
      );

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch documents:', error);
        setError('Failed to load documents. Please try again.');
      } else {
        setDocuments(withPublicUrls(data as Document[]));
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url, cover_url, full_name')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Vault profile:', profile);

      if (profile) {
        setAvatarUrl(profile.avatar_url ?? null);
        setCoverUrl(profile.cover_url ?? null);
        setUserName(profile.full_name || userName);
      }

      setLoading(false);
    };

    fetchData();
  }, [router]);

  // Handle file selection from scanner
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningFile(file);
    setShowScanner(false);
    uploadDocument(file);
  };

  // Upload document to vault bucket and insert into DB
  const uploadDocument = async (file: File) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be signed in to upload documents.');
      }

      const storagePath = `vault/${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('vault')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error('Upload failed: ' + uploadError.message);
      }

      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          file_name: file.name,
          file_type: file.type || 'document',
          storage_path: storagePath,
          extracted_text: null,
        });

      if (dbError) {
        throw new Error('Database insert failed: ' + dbError.message);
      }

      const { data } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setDocuments(withPublicUrls(data as Document[]));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document.');
    } finally {
      setLoading(false);
      setScanningFile(null);
    }
  };

  // Toggle scanner modal
  const toggleScanner = () => setShowScanner((prev) => !prev);

  // Open AI Assistant with document context
  const openAiWithDocument = (doc: Document) => {
    setAiDoc(doc);
    setIsAiOpen(true);
  };

  const printDocument = (doc: Document) => {
    if (!doc.publicUrl) return;
    const printWindow = window.open(doc.publicUrl, '_blank');
    if (!printWindow) return;
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md">
          <div className="flex items-center gap-4 mb-6">
            <Loader2 size={32} className="text-indigo-500" />
            <div>
              <h2 className="text-xl font-bold text-white">Career Vault</h2>
              <p className="text-slate-400">Loading your documents...</p>
            </div>
          </div>
          <p className="text-slate-500 mt-4">Your documents will appear here once uploaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Back button */}
      <div className="border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Profile Header */}
        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-md">
          <UserHeader
            avatarUrl={avatarUrl}
            coverUrl={coverUrl}
            name={userName}
            showAvatarInTemplate={false}
          />
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 pt-4 border-t border-slate-800/50">
            {userId && (
              <button
                onClick={toggleScanner}
                className="absolute bottom-1 right-1 bg-indigo-600 text-white text-xs font-medium rounded-full px-2 py-1 hover:bg-indigo-500 transition-colors"
              >
                <Image size={12} className="mr-1" /> Scan
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-white">My Vault</h2>
              <p className="text-slate-400 mt-1">
                {documents.length} documents{documents.length !== 1 ? 's' : ''} stored
              </p>
            </div>
          </div>
        </div>

        {/* Profile Pictures Section */}
        {(avatarUrl || coverUrl) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Profile Images</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coverUrl && (
                <div className="group bg-slate-950/80 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-md cursor-pointer hover:border-orange-500 transition" onClick={() => setSelectedDoc({ id: 'cover', user_id: userId ?? '', file_name: 'Cover Picture', file_type: 'image/jpeg', storage_path: '', publicUrl: coverUrl, created_at: new Date().toISOString() } as Document)}>
                  <div className="relative h-32 w-full">
                    <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Cover Picture</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">Image</span>
                  </div>
                </div>
              )}
              {avatarUrl && (
                <div className="group bg-slate-950/80 border border-slate-800/50 rounded-xl overflow-hidden backdrop-blur-md cursor-pointer hover:border-orange-500 transition" onClick={() => setSelectedDoc({ id: 'avatar', user_id: userId ?? '', file_name: 'Profile Picture', file_type: 'image/jpeg', storage_path: '', publicUrl: avatarUrl, created_at: new Date().toISOString() } as Document)}>
                  <div className="relative h-32 w-full flex items-center justify-center bg-slate-900/50">
                    <img src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-orange-500" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-300">Profile Picture</span>
                    <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400">Image</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Grid */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/5 text-sm text-red-300">
            {error}
          </div>
        )}

        {documents.length === 0 && (
          <div className="bg-slate-950/80 border border-slate-800/50 rounded-2xl p-6 text-center backdrop-blur-md">
            <FileText size={48} className="text-slate-500 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white">No documents yet</h3>
            <p className="text-slate-400 mt-2">Upload your first document using the scanner.</p>
            <button
              onClick={toggleScanner}
              className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-full transition-colors"
            >
              <Image size={16} className="mr-2" /> Scan Document
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => {
            const { Component: IconComponent, badge } = getFileIconAndBadge(doc.file_type);

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className="group bg-slate-950/80 border border-slate-800/50 rounded-xl p-4 backdrop-blur-md cursor-pointer hover:border-orange-500 transition"
              >
                <div className="mb-3">
                  {isImageDocument(doc) && doc.publicUrl ? (
                    <img
                      src={doc.publicUrl}
                      alt={doc.file_name}
                      className="h-6 w-6 rounded-md object-cover border border-slate-700/50"
                    />
                  ) : (
                    IconComponent && <IconComponent className="h-6 w-6 text-indigo-400 mb-2" />
                  )}
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider badge badge-primary">
                    {badge}
                  </span>
                </div>

                <h3 className="font-semibold text-white truncate line-clamp-2">
                  {doc.file_name}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Uploaded {new Date(doc.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}</p>

                <div className="mt-2 pt-2 border-t border-slate-800/20 flex flex-wrap gap-2">
                  {doc.publicUrl && (
                    <a
                      href={doc.publicUrl}
                      download={doc.file_name}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <Download size={12} /> Download
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      printDocument(doc);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
                  >
                    <Printer size={12} /> Print
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAiWithDocument(doc);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/30 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:bg-indigo-600/20 transition-colors"
                    aria-label="Ask AI to use this document"
                  >
                    <Sparkles size={12} /> Ask AI
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Document Preview Modal */}
        {selectedDoc && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Document preview"
            className="fixed inset-0 z-[110] bg-black/90 p-4 flex flex-col"
            onClick={() => setSelectedDoc(null)}
          >
            <div
              className="flex items-center justify-between gap-4 mb-3"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-semibold text-white truncate">
                {selectedDoc.file_name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
              >
                <X size={14} /> Close
              </button>
            </div>
            <div
              className="flex-1 min-h-0 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedDoc.publicUrl && isImageDocument(selectedDoc) ? (
                <img
                  src={selectedDoc.publicUrl}
                  alt={selectedDoc.file_name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : selectedDoc.publicUrl ? (
                <iframe
                  src={selectedDoc.publicUrl}
                  title={selectedDoc.file_name}
                  className="h-full w-full rounded-lg bg-white"
                />
              ) : (
                <p className="text-sm text-slate-400">Preview unavailable.</p>
              )}
            </div>
          </div>
        )}

        {/* Scanner Modal */}
        {showScanner && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Scan Document"
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
            onClick={() => setShowScanner(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Scan Container"
              className="bg-slate-900 rounded-2xl p-5 shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">Scan Document</h3>
                <button onClick={toggleScanner} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-2">
                Allow camera access to scan a document?
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded-xl transition-colors"
              >
                <Image size={16} className="mr-2" /> Use Camera
              </button>
              {scanningFile && (
                <div className="mt-3 p-2 bg-slate-950/50 rounded-sm">
                  <p className="text-slate-400 text-sm">File: {scanningFile.name}</p>
                  <button
                    onClick={() => uploadDocument(scanningFile)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-1 rounded-xl transition-colors"
                  >
                    Upload to Vault
                  </button>
                  <button
                    onClick={toggleScanner}
                    className="w-full bg-slate-700 hover:text-white text-white font-medium py-2 rounded-xl transition-colors mt-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AIAssistant
        title="Career Vault Copilot"
        triggerLabel="Ask about my documents"
        prompt={
          aiDoc
            ? `Use my document ${aiDoc.file_name} to help with my CV.`
            : 'Ask about documents in my Career Vault.'
        }
        context={{
          page: 'vault',
          resumeText: aiDoc?.extracted_text ?? '',
        }}
        userName={userName}
        userSkills={[]}
        forceOpen={isAiOpen}
        onOpenChange={setIsAiOpen}
      />
    </div>
  );
}