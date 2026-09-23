import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Check, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import { Post } from '../types';
import { fallbackImage } from '../services/api';

interface Props {
  post: Post | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
}

export const ReviewModal: React.FC<Props> = ({ post, onClose, onApprove, onRegenerate }) => {
  const [zoom, setZoom] = useState(1);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom whenever post changes
  useEffect(() => {
    setZoom(1);
    setPosX(0);
    setPosY(0);
  }, [post?.id]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4, prev + 0.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(1, prev - 0.5);
      if (next === 1) {
        setPosX(0);
        setPosY(0);
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPosX(0);
    setPosY(0);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - posX, y: e.clientY - posY };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosX(e.clientX - dragStart.current.x);
    setPosY(e.clientY - dragStart.current.y);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile / Android
  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoom <= 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    dragStart.current = { x: e.touches[0].clientX - posX, y: e.touches[0].clientY - posY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosX(e.touches[0].clientX - dragStart.current.x);
    setPosY(e.touches[0].clientY - dragStart.current.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      handleResetZoom();
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoom((prev) => Math.min(4, prev + 0.5));
    } else {
      setZoom((prev) => {
        const next = Math.max(1, prev - 0.5);
        if (next === 1) {
          setPosX(0);
          setPosY(0);
        }
        return next;
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 md:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c1324] border border-[#24304a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2740] bg-[#0d1426]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#121b31] border border-[#24304a] flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white truncate max-w-xs md:max-w-md">
                {post.title || 'Review post'}
              </h3>
              <p className="text-[11px] text-[#9aa7c2]">
                Inspect image resolution, copy, and approval status
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

        {/* Content Layout */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
          {/* Left Column: Image Viewer */}
          <div className="flex flex-col">
            <div
              ref={containerRef}
              onWheel={handleWheel}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onDoubleClick={handleDoubleClick}
              className={`w-full h-[280px] sm:h-[350px] md:h-[430px] bg-[#070b18] border border-[#24304a] rounded-xl overflow-hidden flex items-center justify-center relative select-none ${
                zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
              }`}
            >
              <img
                src={post.img}
                alt={post.title}
                draggable={false}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackImage;
                }}
                style={{
                  transform: `translate(${posX}px, ${posY}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg pointer-events-none"
              />

              {zoom > 1 && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-cyan-300 font-mono border border-cyan-500/20">
                  Drag to pan
                </div>
              )}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-center gap-2 mt-3 bg-[#080d1b] border border-[#1c2740] rounded-xl p-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                className="px-2.5 py-1.5 rounded-lg bg-[#121b31] border border-[#24304a] hover:border-cyan-400/40 text-xs font-semibold text-white disabled:opacity-40 transition flex items-center gap-1"
              >
                <ZoomOut className="w-3.5 h-3.5" /> Out
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2.5 py-1.5 rounded-lg bg-[#121b31] border border-[#24304a] hover:border-cyan-400/40 text-xs font-semibold text-white transition flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 4}
                className="px-2.5 py-1.5 rounded-lg bg-[#121b31] border border-[#24304a] hover:border-cyan-400/40 text-xs font-semibold text-white disabled:opacity-40 transition flex items-center gap-1"
              >
                <ZoomIn className="w-3.5 h-3.5" /> In
              </button>
              <span className="text-xs text-[#9aa7c2] font-mono px-2 min-w-[50px] text-center">
                {Math.round(zoom * 100)}%
              </span>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="space-y-4 md:max-h-[480px] md:overflow-y-auto pr-1">
            <div>
              <span className="text-[11px] font-bold text-[#67e8f9] uppercase tracking-wider block mb-1">
                Topic
              </span>
              <h4 className="text-lg font-bold text-white leading-snug">
                {post.title}
              </h4>
              {post.date && (
                <span className="text-xs text-[#74829e] mt-1 block">
                  Created {post.date}
                </span>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#67e8f9] uppercase tracking-wider block mb-1">
                Instagram Caption
              </span>
              <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#1c2740] text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
                {post.caption}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#67e8f9] uppercase tracking-wider block mb-1">
                Hashtags
              </span>
              <div className="p-3 rounded-xl bg-[#080d1b] border border-[#1c2740] text-xs text-cyan-400/90 leading-relaxed font-mono whitespace-pre-wrap">
                {post.hashtags || 'No hashtags provided.'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-[#1c2740] bg-[#0d1426] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
              post.status === 'Published'
                ? 'badge-published'
                : post.status === 'Approved'
                ? 'badge-approved'
                : 'badge-pending'
            }`}>
              {post.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {post.status === 'Pending' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRegenerate(post.id);
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#121b31] border border-[#24304a] text-white hover:border-[#49618c] transition flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onApprove(post.id);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-green-700 hover:bg-green-600 shadow-md shadow-green-700/20 transition flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve & Publish
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#121b31] border border-[#24304a] text-white hover:border-[#49618c] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
