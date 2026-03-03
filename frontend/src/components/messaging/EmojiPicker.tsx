import { useState, useRef, useEffect, memo } from 'react';

const EMOJI_CATEGORIES = [
  {
    name: 'smileys',
    icon: '😀',
    emojis: [
      '😀',
      '😃',
      '😄',
      '😁',
      '😆',
      '😅',
      '🤣',
      '😂',
      '🙂',
      '😊',
      '😇',
      '🥰',
      '😍',
      '🤩',
      '😘',
      '😗',
      '😚',
      '😙',
      '🥲',
      '😋',
      '😛',
      '😜',
      '🤪',
      '😝',
      '🤑',
      '🤗',
      '🤭',
      '🤫',
      '🤔',
      '🫡',
      '🤐',
      '🤨',
      '😐',
      '😑',
      '😶',
      '🫥',
      '😏',
      '😒',
      '🙄',
      '😬',
      '😮‍💨',
      '🤥',
      '😌',
      '😔',
      '😪',
      '🤤',
      '😴',
      '😷',
      '🤒',
      '🤕',
      '🤢',
      '🤮',
      '🥵',
      '🥶',
      '🥴',
      '😵',
      '🤯',
      '🤠',
      '🥳',
      '🥸',
      '😎',
      '🤓',
      '🧐',
      '😕',
      '🫤',
      '😟',
      '🙁',
      '😮',
      '😯',
      '😲',
      '😳',
      '🥺',
      '🥹',
      '😦',
      '😧',
      '😨',
      '😰',
      '😥',
      '😢',
      '😭',
      '😱',
      '😖',
      '😣',
      '😞',
      '😓',
      '😩',
      '😫',
      '🥱',
      '😤',
      '😡',
      '😠',
      '🤬',
      '😈',
      '👿',
      '💀',
      '☠️',
      '💩',
      '🤡',
      '👹',
      '👺',
    ],
  },
  {
    name: 'gestures',
    icon: '👋',
    emojis: [
      '👋',
      '🤚',
      '🖐️',
      '✋',
      '🖖',
      '🫱',
      '🫲',
      '🫳',
      '🫴',
      '🫷',
      '🫸',
      '👌',
      '🤌',
      '🤏',
      '✌️',
      '🤞',
      '🫰',
      '🤟',
      '🤘',
      '🤙',
      '👈',
      '👉',
      '👆',
      '🖕',
      '👇',
      '☝️',
      '🫵',
      '👍',
      '👎',
      '✊',
      '👊',
      '🤛',
      '🤜',
      '👏',
      '🙌',
      '🫶',
      '👐',
      '🤲',
      '🤝',
      '🙏',
      '💪',
      '🦾',
      '🖤',
      '❤️',
      '🧡',
      '💛',
      '💚',
      '💙',
      '💜',
      '🤎',
      '🖤',
      '🤍',
      '💯',
      '💢',
      '💥',
      '💫',
      '💦',
      '💨',
      '🕳️',
      '💣',
    ],
  },
  {
    name: 'objects',
    icon: '🎉',
    emojis: [
      '🎉',
      '🎊',
      '🎈',
      '🎁',
      '🏆',
      '🥇',
      '🥈',
      '🥉',
      '⚽',
      '🏀',
      '🔥',
      '⭐',
      '🌟',
      '✨',
      '⚡',
      '💡',
      '💰',
      '💎',
      '🔔',
      '🎵',
      '🎶',
      '🎤',
      '🎧',
      '🎮',
      '🎯',
      '🎲',
      '🧩',
      '🎭',
      '🎨',
      '📸',
      '📱',
      '💻',
      '⌨️',
      '🖥️',
      '📧',
      '📝',
      '📚',
      '📖',
      '🔑',
      '🔒',
      '⏰',
      '📅',
      '✅',
      '❌',
      '⭕',
      '❗',
      '❓',
      '💬',
      '💭',
      '🗯️',
      '☕',
      '🍕',
      '🍔',
      '🍟',
      '🌮',
      '🍣',
      '🍰',
      '🍩',
      '🍫',
      '🍺',
    ],
  },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

function EmojiPickerInner({ onSelect, onClose }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-72 z-50"
    >
      {/* Category tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 px-2 pt-2">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={`flex-1 py-1.5 text-lg rounded-t-lg transition-colors ${
              activeCategory === i
                ? 'bg-blue-50 dark:bg-blue-900/30'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {cat.icon}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="h-48 overflow-y-auto p-2">
        <div className="grid grid-cols-8 gap-0.5">
          {(EMOJI_CATEGORIES[activeCategory]?.emojis ?? []).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-lg rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export const EmojiPicker = memo(EmojiPickerInner);
