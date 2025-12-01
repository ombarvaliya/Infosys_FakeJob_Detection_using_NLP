import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/common/Tabs'
import { Card, CardContent, CardHeader, Button, FileUploader, Loader, Notification } from '../components/common'
import { PredictionResult } from '../components/sections'
import { predictJobPost, predictFromFile } from '../services/predictionService'
import { useAnalytics } from '../context/AnalyticsContext'
import { useNotification } from '../hooks/useCustomHooks'
import { FileText, Type } from 'lucide-react'

export const Analyze = () => {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const { notification, show, hide } = useNotification()
  const { addPrediction } = useAnalytics()

  const handleTextSubmit = async (e) => {
    e.preventDefault()

    if (!text.trim()) {
      show('Please enter a job post description', 'error')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await predictJobPost(text)

      if (response.success) {
        const prediction = {
          title: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
          text,
          ...response.data,
        }
        addPrediction(prediction)
        setResult(response.data)
        show('Analysis complete!', 'success')
      } else {
        show(response.error, 'error')
      }
    } catch (error) {
      show('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleFileSubmit = async (e) => {
    e.preventDefault()

    if (!file) {
      show('Please select a file', 'error')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await predictFromFile(file)

      if (response.success) {
        const prediction = {
          title: file.name,
          ...response.data,
        }
        addPrediction(prediction)
        setResult(response.data)
        show('File analysis complete!', 'success')
      } else {
        show(response.error, 'error')
      }
    } catch (error) {
      show('An error occurred. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Analyze Job Posts</h1>
          <p className="text-lg text-slate-600">
            Paste your job post or upload a file to detect if it's legitimate or fraudulent.
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hide}
            className="mb-6"
          />
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6">
          {/* Analysis Form */}
          <div>
            <Card>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full border-b border-slate-200 px-6 pt-6 flex gap-4">
                    <TabsTrigger value="text" className="flex items-center gap-2">
                      <Type size={18} />
                      Text Input
                    </TabsTrigger>
                    <TabsTrigger value="file" className="flex items-center gap-2">
                      <FileText size={18} />
                      File Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="p-6">
                    <form onSubmit={handleTextSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 mb-2">
                          Job Post Description
                        </label>
                        <textarea
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          placeholder="Paste your job posting here..."
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                          rows={8}
                          disabled={loading}
                        />
                        <p className="text-xs text-slate-500 mt-2">{text.length} characters</p>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading || !text.trim()}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader size="sm" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze Job Post'
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="file" className="p-6">
                    <form onSubmit={handleFileSubmit} className="space-y-4">
                      <FileUploader
                        onFileSelect={(f) => setFile(f)}
                        accept=".pdf,.jpg,.jpeg,.png"
                        maxSize={5}
                      />

                      <Button
                        type="submit"
                        disabled={loading || !file}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader size="sm" />
                            Analyzing...
                          </>
                        ) : (
                          'Analyze File'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Result Section */}
        {result && (
          <div className="mt-12">
            <PredictionResult result={result} loading={loading} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Analyze
