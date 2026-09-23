import React, { useState, useEffect } from 'react';
import { Tag, Calendar, Check, Save } from 'lucide-react';
import { OfferInfo } from '../types';
import { saveOfferApi } from '../services/api';

interface Props {
  offer: OfferInfo | undefined;
  token: string;
  clientId: string;
  onOfferSaved: (savedOffer: OfferInfo) => void;
  onToast: (msg: string) => void;
}

export const OfferPage: React.FC<Props> = ({
  offer,
  token,
  clientId,
  onOfferSaved,
  onToast
}) => {
  const [offerText, setOfferText] = useState('');
  const [endDate, setEndDate] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (offer) {
      const text = offer.offer_text || offer.text || '';
      const date = offer.end_date || offer.date || '';
      setOfferText(text !== 'No active offer' ? text : '');
      setEndDate(date ? String(date).slice(0, 10) : '');
    }
  }, [offer]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerText.trim()) {
      onToast('Please enter an offer text.');
      return;
    }
    if (!endDate) {
      onToast('Please select a valid-until date.');
      return;
    }

    setSaving(true);
    try {
      const res = await saveOfferApi(token, clientId, offerText.trim(), endDate);
      onToast(res.message || 'Offer saved successfully ✓');
      onOfferSaved({
        offer_text: offerText.trim(),
        end_date: endDate
      });
    } catch (err: any) {
      console.error('Save offer error:', err);
      onToast(err.message || 'Could not save offer. Check API settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="bg-gradient-to-br from-[#0d1426] to-[#0b1120] border border-[#24304a] rounded-2xl p-5 md:p-7 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#1c2740]">
          <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Manage Current Offer</h3>
            <p className="text-xs text-[#9aa7c2]">
              Set active discounts, promo codes, and campaign end dates
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-2">
              Offer Text
            </label>
            <input
              type="text"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="e.g. 20% OFF Family Pizza / Free Appetizer this Weekend"
              required
              className="w-full bg-[#080d1b] border border-[#24304a] text-white rounded-xl p-3 focus:border-cyan-400 outline-none transition text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#cbd5e1] mb-2">
              Valid Until
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-[#080d1b] border border-[#24304a] text-white rounded-xl p-3 focus:border-cyan-400 outline-none transition text-xs"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080d1b] border border-[#1c2740] text-[11px] text-[#9aa7c2] leading-relaxed">
            💡 When saved, AutoNex will automatically incorporate this promotional offer into future AI-generated Instagram posts, captions, and graphics.
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save offer
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
