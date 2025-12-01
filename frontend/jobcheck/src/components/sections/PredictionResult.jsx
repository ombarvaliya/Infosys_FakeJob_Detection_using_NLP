import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader } from '../common/Card'
import Badge from '../common/Badge'

export const PredictionResult = ({ result, loading = false }) => {
  if (!result) return null

  const { label, probability, suspiciousWords = [] } = result
  const isReal = label === 'real'
  const percentage = (probability * 100).toFixed(1)

  const chartData = [
    { name: 'Confidence', value: percentage },
    { name: 'Uncertainty', value: 100 - percentage },
  ]

  const colors = isReal ? ['#22c55e', '#dcfce7'] : ['#ef4444', '#fee2e2']

  return (
    <Card className="animate-slide-up">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Analysis Result</h3>
          <Badge variant={isReal ? 'success' : 'danger'}>
            {isReal ? 'Legitimate Job' : 'Suspicious Post'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Confidence Gauge */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-slate-600 mb-4 font-medium">Confidence Score</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center mt-4">
              <p className="text-3xl font-bold text-slate-900">{percentage}%</p>
              <p className="text-sm text-slate-600">{isReal ? 'Real' : 'Fake'} Confidence</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-slate-600 font-medium mb-2">Verdict</p>
              <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${isReal ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                {isReal ? '✓ This appears to be a legitimate job posting' : '⚠ This post shows signs of being fraudulent'}
              </div>
            </div>

            {suspiciousWords && suspiciousWords.length > 0 && (
              <div>
                <p className="text-sm text-slate-600 font-medium mb-3">Red Flags Detected</p>
                <div className="flex flex-wrap gap-2">
                  {suspiciousWords.map((word, index) => (
                    <Badge key={index} variant="danger" className="text-xs">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <p className="text-sm text-slate-600">
                <span className="font-medium text-slate-900">Recommendation:</span>{' '}
                {isReal
                  ? 'This job posting appears legitimate. However, always verify company details and communicate directly with the hiring manager.'
                  : 'Exercise caution with this posting. We recommend verifying the company directly and avoiding any upfront payments.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PredictionResult
