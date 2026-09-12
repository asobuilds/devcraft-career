'use client';

import React, { useState } from 'react';
import { Paperclip, X, Loader2, FileText, Upload } from 'lucide-react';

export default function CertificateUploader(props) {
  const supabase = props.supabase;
  const userId = props.userId;
  const attachments = props.attachments || [];
  const onAttachmentsChange = props.onAttachmentsChange;

  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = function (event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    uploadFiles(files);
    event.target.value = '';
  };

  const uploadFiles = async function (fileList) {
    setUploading(true);
    setErrorMessage('');
    const newAttachments = attachments.slice();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('One or more files were skipped because they are over 10MB.');
        continue;
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = userId + '/' + Date.now() + '-' + safeName;

      const uploadResult = await supabase.storage.from('certificates').upload(path, file);

      if (uploadResult.error) {
        setErrorMessage('Upload failed for ' + file.name + ': ' + uploadResult.error.message);
        continue;
      }

      const publicUrlResult = supabase.storage.from('certificates').getPublicUrl(path);
      const publicUrl = publicUrlResult && publicUrlResult.data ? publicUrlResult.data.publicUrl : '';

      newAttachments.push({
        name: file.name,
        url: publicUrl,
        uploadedAt: new Date().toISOString(),
      });
    }

    onAttachmentsChange(newAttachments);
    setUploading(false);
  };

  const handleRemove = function (indexToRemove) {
    const filtered = attachments.filter(function (item, index) {
      return index !== indexToRemove;
    });
    onAttachmentsChange(filtered);
  };

  const renderAttachmentRow = function (item, index) {
    return (
      <div key={index} className="flex items-center justify-between gap-2 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-2">
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-slate-300 hover:text-indigo-300 truncate">
          <FileText size={14} className="shrink-0" />
          <span className="truncate">{item.name}</span>
        </a>
        <button onClick={function () { handleRemove(index); }} className="text-slate-600 hover:text-red-400 shrink-0">
          <X size={14} />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Certificates, Results and Supporting Documents</label>

      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-800 rounded-xl py-6 cursor-pointer hover:border-indigo-500/50 transition-colors">
        {uploading === true ? <Loader2 size={22} className="text-indigo-400 animate-spin" /> : <Upload size={22} className="text-slate-500" />}
        <span className="text-xs text-slate-400">{uploading === true ? 'Uploading...' : 'Click to upload certificates, transcripts, or other documents'}</span>
        <span className="text-[10px] text-slate-600">PDF, JPG, or PNG. Max 10MB per file.</span>
        <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileSelect} disabled={uploading === true} className="hidden" />
      </label>

      {errorMessage ? <p className="text-[11px] text-red-400">{errorMessage}</p> : null}

      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map(renderAttachmentRow)}
        </div>
      ) : null}
    </div>
  );
}