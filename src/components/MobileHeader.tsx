
import { Mountain } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
}

export function MobileHeader({ title, showLogo = true }: MobileHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 h-14 flex items-center justify-between">
        {showLogo && (
          <div className="flex items-center">
            <Mountain className="h-6 w-6 text-blue-600" />
            <span className="ml-2 text-lg font-bold text-gray-900">ClimbTracker</span>
          </div>
        )}
        {title && !showLogo && (
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        )}
        <div /> {/* Spacer for center alignment when needed */}
      </div>
    </header>
  );
}
