import React, { useState } from 'react';
import { Sparkles, Upload, X, AlertCircle } from 'lucide-react';
import { createPostApi } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  clientId: string;
  onSuccess: () => void;
  onToast: (msg: string) => void;
}

export const CreatePostModal: React.FC<Props> = ({
  isOpen,
  onClose,
  token,
  clientId,
  onSuccess,
  onToast
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    if (selected.length + files.length > 5) {
      onToast('You can upload a maximum of 5 images.');
      return;
    }

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    for (const file of selected) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        onToast('Please select only PNG, JPG or WEBP images.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        onToast(`"${file.name}" exceeds 10 MB limit.`);
        continue;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    }

    setFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...validPreviews]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onToast('Please enter a title.');
      return;
    }
    if (!description.trim()) {
      onToast('Please enter features / description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPostApi(token, clientId, title.trim(), description.trim(), files);
      onToast(res.message || 'Post generated successfully ✓');
      // Cleanup
      previews.forEach((p) => URL.revokeObjectURL(p));
      setTitle('');
      setDescription('');
      setFiles([]);
      setPreviews([]);
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error('Create post failed:', err);
      onToast(err.message || 'Could not generate post. Check API settings.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#0c1324] border border-[#24304a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1c2740] bg-[#0d1426]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create a New Post</h3>
              <p className="text-xs text-[#9aa7c2]">
                Gemini AI will craft the image, copy, and hashtags
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#9aa7c2] hover:text-white text-2xl leading-none w-8 h-8 rounded-lg hover:bg-[#1a253d] transition flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
              Title / Subject *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Margherita Pizza / Haircut / Gym Membership"
              maxLength={150}
              required
              className="w-full bg-[#080d1b] border border-[#24304a] text-white rounded-xl p-3 focus:border-cyan-400 outline-none transition text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
              Features / Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the product or service, key features, benefits, ingredients, price, or any promotional details..."
              maxLength={2000}
              required
              rows={4}
              className="w-full bg-[#080d1b] border border-[#24304a] text-white rounded-xl p-3 focus:border-cyan-400 outline-none transition text-xs resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
              Product / Reference Images <span className="text-[#9aa7c2] font-normal">(Optional, up to 5)</span>
            </label>
            <div className="border border-dashed border-[#3a4b6e] bg-[#080d1b] rounded-xl p-4 text-center">
              <input
                id="file-upload"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[#121b31] border border-[#24304a] hover:border-cyan-400/50 rounded-lg text-xs font-semibold text-white transition"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" /> Choose Images
              </label>
              <p className="text-[11px] text-[#9aa7c2] mt-2">
                PNG, JPG or WEBP • Up to 5 images • Max 10 MB each
              </p>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-3 pt-3 border-t border-[#1c2740]">
                  {previews.map((preview, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden border border-[#24304a] aspect-square">
                      <img
                        src={preview}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/70 hover:bg-red-600 rounded-full text-white flex items-center justify-center transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1c2740]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl font-semibold text-[#9aa7c2] hover:text-white bg-[#121b31] border border-[#24304a] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  ✨ Generate post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
