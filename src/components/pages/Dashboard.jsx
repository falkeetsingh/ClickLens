// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { api, copyToClipboard } from '../../lib/api'
import { 
  Link2, 
  Copy, 
  Trash2, 
  ExternalLink, 
  Eye, 
  Calendar,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Globe,
  Smartphone,
  Monitor,
  MapPin,
  TrendingUp,
  Clock,
  BarChart3,
  Users,
  MousePointerClick
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const [urls, setUrls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())

  const fetchUrls = async () => {
    try {
      setLoading(true)
      const response = await api.getUserUrls()
      setUrls(response.urls || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to fetch URLs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchUrls()
    }
  }, [user])

  const handleCopy = async (shortUrl, urlId) => {
    try {
      await copyToClipboard(shortUrl)
      setCopiedId(urlId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDelete = async (urlId) => {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return
    }

    try {
      setDeletingId(urlId)
      await api.deleteUrl(urlId)
      setUrls(urls.filter(url => url.id !== urlId))
    } catch (err) {
      setError(err.message || 'Failed to delete URL')
    } finally {
      setDeletingId(null)
    }
  }

  const toggleRowExpansion = (urlId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(urlId)) {
      newExpanded.delete(urlId)
    } else {
      newExpanded.add(urlId)
    }
    setExpandedRows(newExpanded)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Safe analytics access with fallbacks
  const getAnalytics = (url) => {
    return url.analytics || {}
  }

  const getTotalClicks = (url) => {
    const analytics = getAnalytics(url)
    return analytics.total_clicks || 0
  }

  const getClicksToday = () => {
    const today = new Date().toDateString()
    return urls.reduce((sum, url) => {
      const analytics = getAnalytics(url)
      const dailyClicks = analytics.daily_clicks || []
      const todayClicks = dailyClicks.find(click => 
        new Date(click.date).toDateString() === today
      )?.clicks || 0
      return sum + todayClicks
    }, 0)
  }

  const getTopBrowser = () => {
    const browsers = {}
    urls.forEach(url => {
      const analytics = getAnalytics(url)
      Object.entries(analytics.browsers || {}).forEach(([browser, count]) => {
        browsers[browser] = (browsers[browser] || 0) + count
      })
    })
    const topBrowser = Object.entries(browsers).sort((a, b) => b[1] - a[1])[0]
    return topBrowser ? topBrowser[0] : 'N/A'
  }

  const getTopCountry = () => {
    const countries = {}
    urls.forEach(url => {
      const analytics = getAnalytics(url)
      Object.entries(analytics.countries || {}).forEach(([country, count]) => {
        countries[country] = (countries[country] || 0) + count
      })
    })
    const topCountry = Object.entries(countries).sort((a, b) => b[1] - a[1])[0]
    return topCountry ? topCountry[0] : 'N/A'
  }

  const getTotalClicksAll = () => {
    return urls.reduce((sum, url) => sum + getTotalClicks(url), 0)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please log in to access your dashboard
          </h2>
          <a href="/login" className="text-blue-600 hover:underline">
            Go to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive analytics for your shortened URLs
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Link2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total URLs</p>
                <p className="text-2xl font-bold text-gray-900">{urls.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <MousePointerClick className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTotalClicksAll()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Clicks</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getClicksToday()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {urls.filter(url => {
                    const urlDate = new Date(url.created_at)
                    const now = new Date()
                    return urlDate.getMonth() === now.getMonth() && 
                           urlDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Globe className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Top Browser</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getTopBrowser()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Top Country</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{getTopCountry()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Avg. Clicks</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {urls.length > 0 ? 
                Math.round((getTotalClicksAll() / urls.length) * 100) / 100 
                : 0}
            </p>
          </div>
        </div>

        {/* URLs Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Your URLs</h2>
            <button
              onClick={fetchUrls}
              disabled={loading}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {error && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="px-6 py-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Loading your URLs...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Link2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No URLs yet</h3>
              <p className="text-gray-500 mb-4">
                Start by shortening your first URL on the home page
              </p>
              <a 
                href="/" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Shorten URL
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Traffic Sources
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {urls.map((url) => {
                    const analytics = getAnalytics(url)
                    return (
                      <React.Fragment key={url.id}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-sm font-mono text-blue-600">
                                    {url.short_url}
                                  </span>
                                  <button
                                    onClick={() => handleCopy(url.short_url, url.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    {copiedId === url.id ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                  {url.original_url}
                                </div>
                                <button
                                  onClick={() => toggleRowExpansion(url.id)}
                                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                >
                                  {expandedRows.has(url.id) ? 'Hide Details' : 'Show Analytics'}
                                </button>
                              </div>
                              <a
                                href={url.original_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-gray-400 hover:text-gray-600"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Eye className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-sm font-medium text-gray-900">
                                  {getTotalClicks(url)} clicks
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-500">
                                  {analytics.last_click_time ? 
                                    `Last: ${formatDateTime(analytics.last_click_time)}` : 
                                    'No clicks yet'
                                  }
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-600">
                                  {Object.keys(analytics.browsers || {}).length} browsers
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-600">
                                  {Object.keys(analytics.countries || {}).length} countries
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {formatDate(url.created_at)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDelete(url.id)}
                              disabled={deletingId === url.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              {deletingId === url.id ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(url.id) && (
                          <tr>
                            <td colSpan="5" className="px-6 py-4 bg-gray-50">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Browser Analytics */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <Globe className="w-4 h-4 mr-2" />
                                    Browser Analytics
                                  </h4>
                                  {Object.entries(analytics.browsers || {}).length > 0 ? (
                                    <div className="space-y-2">
                                      {Object.entries(analytics.browsers)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([browser, count]) => (
                                          <div key={browser} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{browser}</span>
                                            <span className="text-sm font-medium text-gray-900">{count}</span>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">No data available</p>
                                  )}
                                </div>

                                {/* Country Analytics */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    Country Analytics
                                  </h4>
                                  {Object.entries(analytics.countries || {}).length > 0 ? (
                                    <div className="space-y-2">
                                      {Object.entries(analytics.countries)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 5)
                                        .map(([country, count]) => (
                                          <div key={country} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{country}</span>
                                            <span className="text-sm font-medium text-gray-900">{count}</span>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">No data available</p>
                                  )}
                                </div>

                                {/* Device Analytics */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <Monitor className="w-4 h-4 mr-2" />
                                    Device Analytics
                                  </h4>
                                  {Object.entries(analytics.devices || {}).length > 0 ? (
                                    <div className="space-y-2">
                                      {Object.entries(analytics.devices)
                                        .sort((a, b) => b[1] - a[1])
                                        .map(([device, count]) => (
                                          <div key={device} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                              {device.toLowerCase().includes('mobile') ? 
                                                <Smartphone className="w-3 h-3 mr-1 text-gray-400" /> :
                                                <Monitor className="w-3 h-3 mr-1 text-gray-400" />
                                              }
                                              <span className="text-sm text-gray-600">{device}</span>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">{count}</span>
                                          </div>
                                        ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">No data available</p>
                                  )}
                                </div>
                              </div>

                              {/* Daily Clicks Chart */}
                              {analytics.daily_clicks && analytics.daily_clicks.length > 0 && (
                                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    Daily Clicks (Last 7 Days)
                                  </h4>
                                  <div className="flex items-end space-x-2 h-20">
                                    {analytics.daily_clicks.slice(-7).map((day, index) => {
                                      const maxClicks = Math.max(...analytics.daily_clicks.slice(-7).map(d => d.clicks))
                                      const height = maxClicks > 0 ? (day.clicks / maxClicks) * 60 : 0
                                      return (
                                        <div key={index} className="flex flex-col items-center">
                                          <div 
                                            className="bg-blue-500 rounded-t w-8 flex items-end justify-center"
                                            style={{ height: `${height + 10}px` }}
                                          >
                                            <span className="text-xs text-white font-medium mb-1">
                                              {day.clicks}
                                            </span>
                                          </div>
                                          <span className="text-xs text-gray-500 mt-1">
                                            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                          </span>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard