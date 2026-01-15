import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Code, Users, Zap } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Questions',
    description: 'Get personalized interview questions tailored to your target company and role.'
  },
  {
    icon: Code,
    title: 'Real-time Code Evaluation',
    description: 'Practice coding with instant feedback on correctness, efficiency, and style.'
  },
  {
    icon: Users,
    title: 'Behavioral Training',
    description: 'Master behavioral interviews with STAR method guidance and AI feedback.'
  },
  {
    icon: Zap,
    title: 'Smart Progress Tracking',
    description: 'Track your improvement with detailed analytics and personalized insights.'
  }
];

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="flex min-h-screen">
        {/* Left side - Features showcase */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-md"
          >
            {/* Logo and title */}
            <div className="mb-12">
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="/image.png"
                  alt="CareerPrep Ai"
                  className="w-12 h-12 rounded-xl object-cover shadow-lg"
                />
                <div>
                  <h1 className="text-2xl font-bold gradient-text">CareerPrep Ai</h1>
                  <p className="text-sm text-secondary-600">AI-Powered Interview Prep</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                Master Your Next Interview
              </h2>
              <p className="text-lg text-secondary-600">
                Prepare smarter with AI-driven questions, real-time feedback, and personalized guidance.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-secondary-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-secondary-600">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-4"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">10K+</div>
                <div className="text-xs text-secondary-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">500+</div>
                <div className="text-xs text-secondary-600">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">95%</div>
                <div className="text-xs text-secondary-600">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Right side - Auth form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto w-full max-w-sm lg:w-96"
          >
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 text-center">
              <div className="inline-flex items-center space-x-2">
                <img
                  src="/image.png"
                  alt="CareerPrep Ai"
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-xl font-bold gradient-text">CareerPrep Ai</span>
              </div>
            </div>

            {/* Auth form container */}
            <div className="bg-white rounded-2xl shadow-large p-8 border border-secondary-100">
              {children}
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 text-center"
            >
              <p className="text-xs text-secondary-500">
                By continuing, you agree to our{' '}
                <button type="button" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </button>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
