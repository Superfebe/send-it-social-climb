
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Mountain, TrendingUp } from 'lucide-react';
import { SessionDetails } from './SessionDetails';

interface Session {
  id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  climb_type: string;
  notes: string | null;
  areas?: {
    name: string;
  };
}

interface SessionCardProps {
  session: Session;
}

export function SessionCard({ session }: SessionCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Ongoing';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (showDetails) {
    return <SessionDetails session={session} onBack={() => setShowDetails(false)} />;
  }

  return (
    <Card className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setShowDetails(true)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Mountain className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-lg">
                {session.areas?.name || 'Unknown Area'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(session.start_time)}</span>
              <span>•</span>
              <span>{formatTime(session.start_time)}</span>
              {session.end_time && (
                <>
                  <span>- {formatTime(session.end_time)}</span>
                </>
              )}
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {session.climb_type}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(session.duration_minutes)}</span>
          </div>
        </div>

        {session.notes && (
          <p className="text-sm text-gray-600 italic mb-3">"{session.notes}"</p>
        )}

        <Button variant="outline" size="sm" className="w-full">
          <TrendingUp className="h-3 w-3 mr-1" />
          View Session Details
        </Button>
      </CardContent>
    </Card>
  );
}
