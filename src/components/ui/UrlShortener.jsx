import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { api, isValidUrl, copyToClipboard } from '../../lib/api'
import { Link2, Copy, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'

const UrlShortener = () => {
  const { user } = useAuth()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please log in to shorten URLs')
      return
    }

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL (include http:// or https://)')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await api.shortenUrl({ original_url: url })
      setResult(response)
      setUrl('')
    } catch (err) {
      setError(err.message || 'Failed to shorten URL')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text) => {
    try {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !user}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium min-w-[120px]"
          >
            {loading ? 'Shortening...' : 'Shorten'}
          </button>
        </div>
      </form>

      {!user && (
        <div className="text-center text-gray-600 mb-6">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          Please <a href="/login" className="text-blue-600 hover:underline">log in</a> to shorten URLs
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {result && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="font-medium text-green-800">URL shortened successfully!</span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original URL
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 break-all">{result.original_url}</span>
                <a 
                  href={result.original_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Short URL
              </label>
              <div className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg">
                <span className="flex-1 font-mono text-blue-600">
                  {`${window.location.origin}/r/${result.short_code}`}
                </span>
                <button
                  onClick={() => handleCopy(`${window.location.origin}/r/${result.short_code}`)}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UrlShortener