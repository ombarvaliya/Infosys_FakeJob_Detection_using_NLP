import { ArrowRight, Shield, Zap, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../common/Button'

export const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white pt-16">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20 -top-40 -left-40 animate-pulse" />
        <div className="absolute w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20 -bottom-40 -right-40 animate-pulse" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full mb-6 animate-fade-in">
          <Zap size={16} />
          <span className="text-sm font-medium">Powered by Advanced NLP</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 animate-slide-up leading-tight">
          Detect Fake Job Posts with{' '}
          <span className="text-gradient">AI Intelligence</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-8 animate-slide-up">
          JobCheck uses cutting-edge Natural Language Processing to identify fraudulent job
          postings and protect job seekers from scams.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
          <Link to="/analyze">
            <Button size="lg" className="gap-2">
              Analyze Job Post
              <ArrowRight size={20} />
            </Button>
          </Link>
          <Link to="/about">
            <Button size="lg" variant="secondary">
              Learn More
            </Button>
          </Link>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 animate-slide-up">
          {[
            {
              icon: Shield,
              title: 'Accurate Detection',
              description: '95%+ accuracy in identifying fake job posts',
            },
            {
              icon: Zap,
              title: 'Instant Analysis',
              description: 'Get results in seconds with real-time processing',
            },
            {
              icon: Brain,
              title: 'AI-Powered',
              description: 'Machine learning models trained on thousands of posts',
            },
          ].map((feature, index) => (
            <div key={index} className="p-6 rounded-lg bg-white border border-slate-100 shadow-soft hover:shadow-soft-lg transition-shadow">
              <feature.icon className="w-12 h-12 text-primary-500 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroSection
