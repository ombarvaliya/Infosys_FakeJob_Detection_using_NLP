import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/common/Tabs'
import { Card, CardContent, Button, FileUploader } from '../components/common'
import { FileText, Type } from 'lucide-react'

export const Analyze = () => {
  const [activeTab, setActiveTab] = useState('text')
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)

  const handleTextSubmit = (e) => {
    e.preventDefault()
    // UI only - no actual analysis
    alert('Form submitted')
    setText('')
  }

  const handleFileSubmit = (e) => {
    e.preventDefault()
    // UI only - no actual analysis
    alert('File submitted')
    setFile(null)
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
                        />
                        <p className="text-xs text-slate-500 mt-2">{text.length} characters</p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                      >
                        Analyze Job Post
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
                        className="w-full"
                      >
                        Analyze File
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analyze
