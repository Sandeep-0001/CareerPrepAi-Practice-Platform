import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Code, 
  Users, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Play
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Interview Simulation',
    description: 'Experience realistic interviews with AI that adapts to your responses and provides intelligent follow-up questions.',
    color: 'from-blue-500 to-purple-600'
  },
  {
    icon: Code,
    title: 'Real-time Code Evaluation',
    description: 'Get instant feedback on your coding solutions with detailed analysis of correctness, efficiency, and best practices.',
    color: 'from-green-500 to-teal-600'
  },
  {
    icon: Users,
    title: 'Behavioral Interview Training',
    description: 'Master behavioral questions with STAR method guidance and personalized feedback on your communication skills.',
    color: 'from-orange-500 to-red-600'
  },
  {
    icon: Zap,
    title: 'Intelligent Preparation Guide',
    description: 'Receive customized study plans and preparation strategies tailored to your target company and role.',
    color: 'from-purple-500 to-pink-600'
  }
];

const benefits = [
  'Admin-curated coding questions',
  'Real-time feedback with test cases',
  'Progress tracking and analytics',
  'Monaco code editor integration',
  'Multiple languages support',
  'Starter code templates'
];

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="/image.png"
                alt="CareerPrep Ai"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold gradient-text">CareerPrep Ai</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-secondary-600 hover:text-secondary-900">Features</a>
              <a href="#testimonials" className="text-secondary-600 hover:text-secondary-900">Testimonials</a>
              <a href="#pricing" className="text-secondary-600 hover:text-secondary-900">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-secondary-600 hover:text-secondary-900 font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-6xl font-bold text-secondary-900 mb-6"
            >
              Master Your Next{' '}
              <span className="gradient-text">Interview</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto"
            >
              Prepare smarter with AI-powered interview simulation, real-time feedback, 
              and personalized guidance tailored to your dream company.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            >
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3 flex items-center space-x-2"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button className="btn btn-ghost text-lg px-8 py-3 flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-8 max-w-md mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-secondary-600">Practice Questions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-secondary-600">Companies Covered</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">95%</div>
                <div className="text-sm text-secondary-600">Success Rate</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive interview preparation 
              with features designed to boost your confidence and performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card card-hover p-8"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-6">
                Why Choose CareerPrep Ai?
              </h2>
              <p className="text-lg text-secondary-600 mb-8">
                Join thousands of successful candidates who have landed their dream jobs 
                with our comprehensive interview preparation platform.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0" />
                    <span className="text-secondary-700">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-large p-8 border border-secondary-200">
                <div className="space-y-4">
                  <div className="h-4 bg-secondary-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-secondary-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-32 bg-secondary-100 rounded-lg flex items-center justify-center">
                    <Code className="w-12 h-12 text-secondary-400" />
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-primary-100 rounded w-20"></div>
                    <div className="h-8 bg-success-100 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of successful candidates and start your journey today.
            </p>
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-primary-50 text-lg px-8 py-3 inline-flex items-center space-x-2"
            >
              <span>Get Started for Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <img
                src="/image.png"
                alt="CareerPrep Ai"
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-xl font-bold">CareerPrep Ai</span>
            </div>
            <p className="text-secondary-400 mb-6">
              AI-Powered Interview Preparation Platform
            </p>
            <div className="flex justify-center space-x-6 text-sm text-secondary-400">
              <button type="button" className="hover:text-white">Privacy Policy</button>
              <button type="button" className="hover:text-white">Terms of Service</button>
              <button type="button" className="hover:text-white">Contact</button>
            </div>
            <div className="mt-6 pt-6 border-t border-secondary-800 text-sm text-secondary-500">
              © 2024 CareerPrep Ai. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
