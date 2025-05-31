
import { Mountain } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function MobileHeader({ title, showLogo = true }: MobileHeaderProps) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="px-4 h-14 flex items-center justify-between">
        {showLogo && (
          <div className="flex items-center">
            <Mountain className="h-6 w-6 text-blue-400" />
            <span className="ml-2 text-lg font-bold text-white">ClimbTracker</span>
          </div>
        )}
        {title && !showLogo && (
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        )}
        <div /> {/* Spacer for center alignment when needed */}
      </div>
    </header>
  );
}
