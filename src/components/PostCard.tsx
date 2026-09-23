import React from 'react';
import { Check, RefreshCw, Eye, Calendar } from 'lucide-react';
import { Post } from '../types';
import { fallbackImage } from '../services/api';

interface Props {
  post: Post;
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
  onView: (id: string) => void;
}

export const PostCard: React.FC<Props> = ({ post, onApprove, onRegenerate, onView }) => {
  const isPending = post.status.toLowerCase() === 'pending';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4.5 p-3.5 sm:p-4 border-b border-[#1c2740] last:border-b-0 hover:bg-[#0c1426]/50 transition-colors rounded-xl">
      {/* Thumbnail */}
      <div
        onClick={() => onView(post.id)}
        className="w-full sm:w-28 sm:h-24 h-44 rounded-xl overflow-hidden bg-[#111827] shrink-0 border border-[#24304a] cursor-pointer group relative"
      >
        <img
          src={post.img}
          alt={post.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = fallbackImage;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Eye className="w-5 h-5 text-white drop-shadow" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <h4
          onClick={() => onView(post.id)}
          className="text-sm font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer truncate"
        >
          {post.title}
        </h4>
        <p className="text-xs text-[#9aa7c2] line-clamp-2 leading-relaxed">
          {post.caption}
        </p>
        {post.hashtags && (
          <p className="text-[11px] text-cyan-400/80 truncate font-mono">
            {post.hashtags}
          </p>
        )}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
              post.status === 'Published'
                ? 'badge-published'
                : post.status === 'Approved'
                ? 'badge-approved'
                : 'badge-pending'
            }`}
          >
            {post.status}
          </span>
          {post.date && (
            <span className="text-[10px] text-[#74829e] flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.date}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0">
        {isPending ? (
          <>
            <button
              type="button"
              onClick={() => onApprove(post.id)}
              className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-green-700 hover:bg-green-600 transition flex items-center gap-1 shadow-sm"
              title="Approve & Publish to Instagram"
            >
              <Check className="w-3.5 h-3.5" /> Approve
            </button>
            <button
              type="button"
              onClick={() => onRegenerate(post.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#121b31] border border-[#24304a] hover:border-cyan-400/50 transition flex items-center gap-1"
              title="Generate fresh image & caption"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Regen
            </button>
            <button
              type="button"
              onClick={() => onView(post.id)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#121b31] border border-[#24304a] hover:border-cyan-400/50 transition"
            >
              View
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onView(post.id)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#121b31] border border-[#24304a] hover:border-cyan-400/50 transition flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
        )}
      </div>
    </div>
  );
};
