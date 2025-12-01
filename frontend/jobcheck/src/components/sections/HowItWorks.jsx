import { Card, CardContent } from '../common/Card'
import { CheckCircle } from 'lucide-react'

export const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Paste or Upload',
      description: 'Share a job post description or upload a file containing the job posting',
    },
    {
      number: 2,
      title: 'AI Analysis',
      description: 'Our NLP models analyze the text for suspicious patterns and red flags',
    },
    {
      number: 3,
      title: 'Get Results',
      description: 'Receive instant results with confidence scores and suspicious word highlights',
    },
    {
      number: 4,
      title: 'Stay Safe',
      description: 'Make informed decisions and protect yourself from job posting scams',
    },
  ]

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            How JobCheck Works
          </h2>
          <p className="text-lg text-slate-600">
            Simple 4-step process to detect fake job postings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="h-full">
                <CardContent className="pt-8">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 font-bold text-lg">
                      {step.number}
                    </div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-primary-400">
                  <CheckCircle size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
