
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain, TrendingUp, Users, Star } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Mountain className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ClimbTracker</span>
            </div>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Track Your
            <span className="text-blue-600"> Climbing Journey</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Log your climbs, track your progress, and discover new routes. Join a community of climbers pushing their limits.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Tracking
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mountain className="h-6 w-6 text-blue-600 mr-2" />
                  Log Your Climbs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Record every ascent with detailed information including route grade, style, attempts, and personal notes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
                  Track Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Visualize your improvement over time with detailed statistics and progress charts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-6 w-6 text-yellow-600 mr-2" />
                  Discover Routes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Find new climbing routes, add them to your wishlist, and plan your next adventure.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Ready to elevate your climbing?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Join thousands of climbers already tracking their progress
          </p>
          <div className="mt-8">
            <Link to="/auth">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
