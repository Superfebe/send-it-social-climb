
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface StatsSelectorProps {
  totalClimbs: number;
  totalSessions: number;
  avgClimbsPerSession: number;
  sendRate: number;
  flashRate: number;
  onsightRate: number;
}

export function StatsSelector({ 
  totalClimbs, 
  totalSessions, 
  avgClimbsPerSession, 
  sendRate, 
  flashRate, 
  onsightRate 
}: StatsSelectorProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <Tabs defaultValue="volume" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="volume">Volume</TabsTrigger>
            <TabsTrigger value="rates">Success Rates</TabsTrigger>
            <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          </TabsList>
          
          <TabsContent value="volume" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalClimbs}</div>
                <div className="text-xs text-gray-500">Total Climbs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{totalSessions}</div>
                <div className="text-xs text-gray-500">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{avgClimbsPerSession.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Avg per Session</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="rates" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sendRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Send Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{flashRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Flash Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{onsightRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Onsight Rate</div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="efficiency" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{avgClimbsPerSession.toFixed(1)}</div>
                <div className="text-xs text-gray-500">Climbs per Session</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  {sendRate > 80 ? 'Excellent' : sendRate > 60 ? 'Good' : 'Improving'}
                </Badge>
                <div className="text-xs text-gray-500 mt-1">Performance</div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
