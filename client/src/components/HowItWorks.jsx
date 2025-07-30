import { Search, CreditCard, MonitorPlay, BarChart2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: "Find Your Course",
      description: "Browse our catalog or get personalized recommendations based on your interests and skill level.",
      color: "text-blue-600"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Enroll & Pay Securely",
      description: "Complete your enrollment with our safe payment system. Start learning immediately after payment.",
      color: "text-green-600"
    },
    {
      icon: <MonitorPlay className="h-8 w-8" />,
      title: "Start Learning",
      description: "Access video lessons, downloadable resources, and interactive content at your own pace.",
      color: "text-purple-600"
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: "Track Progress",
      description: "Monitor your advancement through courses with visual dashboards and completion metrics.",
      color: "text-orange-600"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Get Recommendations",
      description: "Receive personalized course suggestions based on your learning patterns and completed content.",
      color: "text-pink-600"
    }
  ];

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            Start Learning in Minutes
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto">
            Our simple process gets you from signup to skills in just a few steps
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Progress line */}
          <div className="hidden md:block absolute left-1/2 top-0 h-full w-1 bg-gray-200 dark:bg-gray-700 -translate-x-1/2"></div>
          
          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Step number */}
                <div className="flex-shrink-0 relative z-10">
                  <div className={`flex items-center justify-center h-16 w-16 rounded-full ${step.color.replace('text', 'bg')} bg-opacity-10 dark:bg-opacity-20`}>
                    <span className={`text-2xl font-bold ${step.color}`}>{index + 1}</span>
                  </div>
                </div>

                {/* Step content */}
                <div className="flex-1">
                  <Card className="hover:shadow-lg transition-shadow h-full">
                    <CardHeader className="flex flex-row items-center gap-4">
                      <div className={`p-3 rounded-lg ${step.color.replace('text', 'bg')} bg-opacity-10 dark:bg-opacity-20`}>
                        {step.icon}
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button size="lg" className="mx-auto">
            Browse Available Courses
          </Button>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            No commitment - Start learning today
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;