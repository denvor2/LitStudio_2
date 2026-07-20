interface StatsBarProps {
  charCount: number;
  wordCount: number;
  targetChars: number | null;
}

export function StatsBar({ charCount, wordCount, targetChars }: StatsBarProps) {
  const progress = targetChars ? Math.min(100, Math.round((charCount / targetChars) * 100)) : null;

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
      <span>
        <span className="font-medium text-gray-700">{wordCount.toLocaleString()}</span> слов
      </span>
      <span>
        <span className="font-medium text-gray-700">{charCount.toLocaleString()}</span> зн
      </span>
      {targetChars && (
        <>
          <span>
            <span className="font-medium text-gray-700">
              {charCount.toLocaleString()}
            </span>
            {' / '}
            <span>{targetChars.toLocaleString()}</span> зн
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className={`font-medium ${progress! >= 100 ? 'text-green-600' : 'text-gray-700'}`}>
              {progress}%
            </span>
          </div>
        </>
      )}
    </div>
  );
}
