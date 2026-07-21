interface StatsBarProps {
  wordCount: number;
  charCount: number;
  authorSheets: number;
  pages: number;
}

export function StatsBar({ wordCount, charCount, authorSheets, pages }: StatsBarProps) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
      <span><span className="font-medium text-gray-700">{wordCount.toLocaleString()}</span> слов</span>
      <span><span className="font-medium text-gray-700">{charCount.toLocaleString()}</span> зн</span>
      <span><span className="font-medium text-gray-700">{pages}</span> стр.</span>
      <span><span className="font-medium text-gray-700">{authorSheets}</span> а.л.</span>
    </div>
  );
}
