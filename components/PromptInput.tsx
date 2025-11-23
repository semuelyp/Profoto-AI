import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  disabled: boolean;
  onSubmit: () => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, disabled, onSubmit }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
          Tambahan Detail (Opsional)
        </label>
        <span className="text-xs text-gray-400">Biarkan kosong untuk hasil otomatis</span>
      </div>
      <div className="relative">
        <textarea
          id="prompt"
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border resize-none"
          rows={3}
          placeholder="Contoh: Tambahkan hiasan bunga mawar di samping produk..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-400">
          Tekan Enter untuk generate
        </div>
      </div>
    </div>
  );
};