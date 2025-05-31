
import { Mountain, Home, Map, Users, TrendingUp, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'routes',
    label: 'Routes',
    icon: Map,
    path: '/routes'
  },
  {
    id: 'social',
    label: 'Social',
    icon: Users,
    path: '/social'
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: TrendingUp,
    path: '/progress'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile'
  }
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 safe-area-pb z-50">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 transition-colors duration-200",
                isActive 
                  ? "text-blue-400" 
                  : "text-gray-400 hover:text-gray-200 active:text-blue-400"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors duration-200",
                isActive && "text-blue-400"
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
