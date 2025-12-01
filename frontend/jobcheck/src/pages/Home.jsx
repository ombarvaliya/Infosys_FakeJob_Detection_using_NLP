import { HeroSection, HowItWorks } from '../components/sections'

export const Home = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />

      {/* Additional CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Stay Safe?</h2>
          <p className="text-lg opacity-90 mb-8">
            Start analyzing job posts today and protect yourself from fraudulent opportunities.
          </p>
          <a
            href="/analyze"
            className="inline-block px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Analyze Your First Job Post
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home
