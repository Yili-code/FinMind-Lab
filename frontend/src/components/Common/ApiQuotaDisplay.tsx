// ApiQuotaDisplay.tsx - yfinance API 限額可視化組件

import { useState, useEffect } from 'react'
import './ApiQuotaDisplay.css'

interface QuotaStats {
  total_requests: number
  successful_requests: number
  failed_requests: number
  success_rate: number
  avg_response_time: number
  recent_requests: number
  hourly_requests: number
  daily_requests: number
  rate_limits: {
    requests_per_minute: number
    requests_per_hour: number
    requests_per_day: number
  }
  usage_percentage: {
    minute: number
    hour: number
    day: number
  }
  remaining_quota: {
    minute: number
    hour: number
    day: number
  }
  uptime_seconds: number
}

function ApiQuotaDisplay() {
  const [stats, setStats] = useState<QuotaStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
      const url = API_BASE_URL 
        ? `${API_BASE_URL}/api/stats/quota`
        : '/api/stats/quota'
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('無法獲取 API 限額統計')
      }
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : '獲取統計失敗')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000) // 每30秒更新一次
    return () => clearInterval(interval)
  }, [])

  if (loading && !stats) {
    return (
      <div className="api-quota-display">
        <div className="quota-loading">載入中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="api-quota-display">
        <div className="quota-error">{error}</div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}小時 ${minutes}分鐘`
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return '#ef4444' // 紅色
    if (percentage >= 70) return '#f59e0b' // 橙色
    if (percentage >= 50) return '#eab308' // 黃色
    return '#10b981' // 綠色
  }

  return (
    <div className="api-quota-display">
      <div className="quota-header">
        <h3>yfinance API 使用狀況</h3>
        <button onClick={fetchStats} className="refresh-btn" title="重新整理">
          重新整理
        </button>
      </div>

      <div className="quota-stats-grid">
        <div className="quota-stat-card">
          <div className="stat-label">總請求數</div>
          <div className="stat-value">{stats.total_requests}</div>
          <div className="stat-detail">
            成功: {stats.successful_requests} | 失敗: {stats.failed_requests}
          </div>
        </div>

        <div className="quota-stat-card">
          <div className="stat-label">成功率</div>
          <div className="stat-value" style={{ color: stats.success_rate >= 95 ? '#10b981' : '#f59e0b' }}>
            {stats.success_rate.toFixed(1)}%
          </div>
        </div>

        <div className="quota-stat-card">
          <div className="stat-label">平均響應時間</div>
          <div className="stat-value">{stats.avg_response_time.toFixed(2)}秒</div>
        </div>

        <div className="quota-stat-card">
          <div className="stat-label">運行時間</div>
          <div className="stat-value">{formatUptime(stats.uptime_seconds)}</div>
        </div>
      </div>

      <div className="quota-limits">
        <h4>限額使用情況</h4>
        
        <div className="limit-item">
          <div className="limit-header">
            <span>每分鐘</span>
            <span>{stats.recent_requests} / {stats.rate_limits.requests_per_minute}</span>
          </div>
          <div className="limit-bar">
            <div 
              className="limit-bar-fill"
              style={{
                width: `${Math.min(stats.usage_percentage.minute, 100)}%`,
                backgroundColor: getUsageColor(stats.usage_percentage.minute)
              }}
            />
          </div>
          <div className="limit-footer">
            <span>使用率: {stats.usage_percentage.minute.toFixed(1)}%</span>
            <span>剩餘: {stats.remaining_quota.minute}</span>
          </div>
        </div>

        <div className="limit-item">
          <div className="limit-header">
            <span>每小時</span>
            <span>{stats.hourly_requests} / {stats.rate_limits.requests_per_hour}</span>
          </div>
          <div className="limit-bar">
            <div 
              className="limit-bar-fill"
              style={{
                width: `${Math.min(stats.usage_percentage.hour, 100)}%`,
                backgroundColor: getUsageColor(stats.usage_percentage.hour)
              }}
            />
          </div>
          <div className="limit-footer">
            <span>使用率: {stats.usage_percentage.hour.toFixed(1)}%</span>
            <span>剩餘: {stats.remaining_quota.hour}</span>
          </div>
        </div>

        <div className="limit-item">
          <div className="limit-header">
            <span>每天</span>
            <span>{stats.daily_requests} / {stats.rate_limits.requests_per_day}</span>
          </div>
          <div className="limit-bar">
            <div 
              className="limit-bar-fill"
              style={{
                width: `${Math.min(stats.usage_percentage.day, 100)}%`,
                backgroundColor: getUsageColor(stats.usage_percentage.day)
              }}
            />
          </div>
          <div className="limit-footer">
            <span>使用率: {stats.usage_percentage.day.toFixed(1)}%</span>
            <span>剩餘: {stats.remaining_quota.day}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiQuotaDisplay



