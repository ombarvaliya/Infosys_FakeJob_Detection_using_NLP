import { Upload, File, X } from 'lucide-react'
import { useState } from 'react'
import { isValidFileType } from '../../utils/helpers'
import Notification from './Notification'

export const FileUploader = ({ onFileSelect, accept = '.pdf,.jpg,.jpeg,.png', maxSize = 5 }) => {
  const [file, setFile] = useState(null)
  const [error, setError] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  const validateFile = (f) => {
    if (!isValidFileType(f)) {
      setError('Invalid file type. Please upload PDF or image files.')
      return false
    }
    if (f.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit.`)
      return false
    }
    return true
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      const f = files[0]
      if (validateFile(f)) {
        setFile(f)
        setError(null)
        onFileSelect?.(f)
      }
    }
  }

  const handleInputChange = (e) => {
    const f = e.target.files?.[0]
    if (f && validateFile(f)) {
      setFile(f)
      setError(null)
      onFileSelect?.(f)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setError(null)
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            id="file-input"
          />
          <label htmlFor="file-input" className="cursor-pointer">
            <Upload className="w-8 h-8 mx-auto mb-2 text-primary-500" />
            <p className="font-medium text-slate-900">Drag and drop your file here</p>
            <p className="text-sm text-slate-500">or click to select</p>
            <p className="text-xs text-slate-400 mt-2">PDF, JPG, or PNG (max {maxSize}MB)</p>
          </label>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-primary-500" />
            <div className="text-left">
              <p className="font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}
      {error && <Notification message={error} type="error" onClose={() => setError(null)} className="mt-2" />}
    </div>
  )
}

export default FileUploader
