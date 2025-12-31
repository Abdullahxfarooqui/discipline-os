// Landing Page - Welcome to Discipline OS
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, Target, TrendingUp, Users, Shield, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-discipline-darker">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-discipline-darker/80 backdrop-blur-lg border-b border-discipline-light/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Discipline OS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-discipline-muted hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Enforce Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
                Discipline
              </span>
            </h1>
            <p className="text-xl text-discipline-muted mb-8 max-w-2xl mx-auto">
              A production-ready system that holds you accountable through structured tracking, 
              measurable performance, and unavoidable consequences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-xl font-semibold text-lg transition-all hover:scale-105"
              >
                Start Your Journey
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-discipline-card hover:bg-discipline-light text-white rounded-xl font-semibold text-lg transition-all border border-discipline-light/20"
              >
                I Have an Account
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-discipline-dark/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Everything You Need to Stay Disciplined
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: '8 Life Categories',
                description: 'Track Deen, Health, Sleep, Nutrition, Productivity, Mental, Digital Detox & Growth',
                color: 'from-orange-500 to-red-500',
              },
              {
                icon: TrendingUp,
                title: 'Daily Scoring',
                description: '65% threshold to stay safe. Below means penalties. Above 90% earns rewards.',
                color: 'from-green-500 to-emerald-500',
              },
              {
                icon: Shield,
                title: 'Penalty System',
                description: 'Fail your day? Face real consequences. Extra prayers, charity, or cold showers.',
                color: 'from-red-500 to-pink-500',
              },
              {
                icon: Zap,
                title: 'Streak Rewards',
                description: 'Build momentum with streaks. Unlock rewards at 7, 14, 30, and 90 days.',
                color: 'from-yellow-500 to-orange-500',
              },
              {
                icon: Users,
                title: 'Couples Mode',
                description: 'Partner accountability. See each other\'s progress. Grow together.',
                color: 'from-purple-500 to-pink-500',
              },
              {
                icon: Flame,
                title: 'No Excuses',
                description: 'Smart leniency for valid reasons. But the system knows when you\'re slacking.',
                color: 'from-blue-500 to-cyan-500',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-discipline-card rounded-2xl border border-discipline-light/10 hover:border-discipline-light/30 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-discipline-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-discipline-muted mb-8">
            Join now and start building the discipline you've always wanted.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-white rounded-xl font-semibold text-lg transition-all hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-discipline-light/10">
        <div className="max-w-6xl mx-auto text-center text-discipline-muted">
          <p>© 2025 Discipline OS. Built for those who refuse to be average.</p>
        </div>
      </footer>
    </div>
  );
}
