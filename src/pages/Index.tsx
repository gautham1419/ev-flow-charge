
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Zap, Battery, MapPin, Clock, Users, Shield, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-electric-500" />,
      title: "Smart Charging",
      description: "AI-powered optimization for faster, efficient charging"
    },
    {
      icon: <Battery className="h-8 w-8 text-charge-500" />,
      title: "Battery Swapping",
      description: "Quick battery swaps for instant power replenishment"
    },
    {
      icon: <MapPin className="h-8 w-8 text-electric-500" />,
      title: "Location Intelligence",
      description: "Find the perfect charging station based on your route"
    },
    {
      icon: <Clock className="h-8 w-8 text-charge-500" />,
      title: "Time Optimization",
      description: "Book slots in advance to minimize waiting time"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Active Stations" },
    { value: "50,000+", label: "Happy Drivers" },
    { value: "99.9%", label: "Uptime" },
    { value: "24/7", label: "Support" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-50 to-charge-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5"></div>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-electric-600 to-charge-600 bg-clip-text text-transparent mb-6">
                ChargeSmart
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-slide-up">
                The future of EV charging is here. Smart, fast, and always available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
                <Button 
                  size="lg" 
                  className="bg-electric-500 hover:bg-electric-600 text-white px-8 py-4 text-lg group transition-all duration-300"
                  onClick={() => navigate('/stations')}
                >
                  Find Charging Station
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-electric-500 text-electric-600 hover:bg-electric-50 px-8 py-4 text-lg"
                  onClick={() => navigate('/admin')}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Operator Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white/70 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-electric-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm md:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose ChargeSmart?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the next generation of EV charging with our intelligent platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift border-0 shadow-lg bg-white/80 backdrop-blur-sm animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 gradient-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto text-white">
            <Shield className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Power Your Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of drivers who trust ChargeSmart for their EV charging needs
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-electric-600 hover:bg-gray-100 px-8 py-4 text-lg group"
              onClick={() => navigate('/stations')}
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
