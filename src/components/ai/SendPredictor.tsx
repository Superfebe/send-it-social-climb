
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PredictionResult {
  probability: number;
  confidence: 'Low' | 'Medium' | 'High';
  summary: string;
  factors: string[];
}

export function SendPredictor() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    grade: '',
    discipline: '',
    attempts: '1',
    location: 'gym',
    style: ''
  });
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  const calculatePrediction = async () => {
    setCalculating(true);
    
    // Simulate AI calculation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock prediction logic based on form inputs
    let baseProbability = 75;
    
    // Adjust based on grade difficulty
    if (formData.grade.includes('V7') || formData.grade.includes('5.12')) {
      baseProbability -= 20;
    } else if (formData.grade.includes('V3') || formData.grade.includes('5.9')) {
      baseProbability += 10;
    }
    
    // Adjust based on attempts
    const attemptCount = parseInt(formData.attempts);
    if (attemptCount > 3) baseProbability -= 15;
    if (attemptCount === 1) baseProbability += 5;
    
    // Adjust based on location
    if (formData.location === 'outdoor') baseProbability -= 10;
    
    // Ensure probability is within bounds
    const finalProbability = Math.max(10, Math.min(95, baseProbability + Math.floor(Math.random() * 20) - 10));
    
    const result: PredictionResult = {
      probability: finalProbability,
      confidence: finalProbability > 70 ? 'High' : finalProbability > 50 ? 'Medium' : 'Low',
      summary: `Based on your climbing history, you have a ${finalProbability}% chance of sending this ${formData.grade} ${formData.discipline} in ${formData.attempts} attempt${attemptCount > 1 ? 's' : ''}.`,
      factors: [
        `Grade matches your recent progression`,
        `${formData.location === 'gym' ? 'Indoor' : 'Outdoor'} setting considered`,
        `Attempt count: ${formData.attempts}`,
        'Personal send rate analyzed'
      ]
    };
    
    setPrediction(result);
    setCalculating(false);
  };

  const resetPrediction = () => {
    setPrediction(null);
    setFormData({
      grade: '',
      discipline: '',
      attempts: '1',
      location: 'gym',
      style: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="h-5 w-5 mr-2" />
          Send Predictor
        </CardTitle>
        <CardDescription>
          Estimate your probability of sending a climb based on your stats
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!prediction ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  placeholder="e.g. V4, 5.10a"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="discipline">Discipline</Label>
                <Select value={formData.discipline} onValueChange={(value) => setFormData({...formData, discipline: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boulder">Bouldering</SelectItem>
                    <SelectItem value="sport">Sport</SelectItem>
                    <SelectItem value="trad">Trad</SelectItem>
                    <SelectItem value="top_rope">Top Rope</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="attempts">Max Attempts</Label>
                <Select value={formData.attempts} onValueChange={(value) => setFormData({...formData, attempts: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 attempt</SelectItem>
                    <SelectItem value="2">2 attempts</SelectItem>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10+ attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select value={formData.location} onValueChange={(value) => setFormData({...formData, location: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gym">Gym</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="style">Style (optional)</Label>
              <Input
                id="style"
                placeholder="e.g. overhang, slab, technical"
                value={formData.style}
                onChange={(e) => setFormData({...formData, style: e.target.value})}
              />
            </div>
            
            <Button 
              onClick={calculatePrediction} 
              disabled={!formData.grade || !formData.discipline || calculating}
              className="w-full"
            >
              {calculating ? 'Calculating...' : 'Predict Send Probability'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {prediction.probability}%
              </div>
              <Badge variant={prediction.confidence === 'High' ? 'default' : prediction.confidence === 'Medium' ? 'secondary' : 'outline'}>
                {prediction.confidence} Confidence
              </Badge>
            </div>
            
            <div className="space-y-3">
              <p className="text-gray-700">{prediction.summary}</p>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Factors Considered
                </h4>
                <ul className="space-y-1">
                  {prediction.factors.map((factor, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <Button variant="outline" onClick={resetPrediction} className="w-full">
              Calculate Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
