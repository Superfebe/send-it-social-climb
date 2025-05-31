
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Mountain, Menu, ArrowLeft } from 'lucide-react';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Progress() {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  const NavItems = () => (
    <>
      <Button variant="ghost" onClick={() => window.location.href = '/dashboard'}>
        Dashboard
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/routes'}>
        Routes
      </Button>
      <Button variant="ghost" onClick={() => window.location.href = '/social'}>
        Social
      </Button>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <span className="text-sm text-gray-700 truncate">Welcome, {user?.email}</span>
        <Button variant="outline" onClick={signOut} size={isMobile ? "sm" : "default"}>
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mountain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">ClimbTracker</span>
            </div>
            
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-64">
                  <div className="flex flex-col space-y-4 mt-8">
                    <NavItems />
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex items-center space-x-4">
                <NavItems />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <ProgressDashboard />
      </div>
    </div>
  );
}
