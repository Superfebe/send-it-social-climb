
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BottomNavigation } from './BottomNavigation';
import { MobileHeader } from './MobileHeader';

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export function MobileLayout({ children, title, showHeader = true }: MobileLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {showHeader && <MobileHeader title={title} />}
      
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="max-w-lg mx-auto">
          {children}
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
