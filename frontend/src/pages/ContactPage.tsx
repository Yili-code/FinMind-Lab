import { useState } from 'react'
import type { FormEvent } from 'react'
import './ContactPage.css'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    setStatusMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setStatus('success')
        setStatusMessage('感謝您的聯絡！我們會盡快回覆您。')
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        })
      } else {
        throw new Error('提交失敗')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage('提交失敗，請稍後再試或直接發送郵件至 yili.code@gmail.com')
    }
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1 className="contact-title">聯絡我們</h1>
        <p className="contact-intro">
          有任何問題、建議或合作需求嗎？歡迎透過以下表單與我們聯繫，我們會盡快回覆您。
        </p>

        <div className="contact-content">
          <div className="contact-info">
            <h2>聯絡資訊</h2>
            <div className="info-item">
              <strong>電子郵件：</strong>
              <a href="mailto:yili.code@gmail.com">yili.code@gmail.com</a>
            </div>
            <div className="info-item">
              <strong>服務時間：</strong>
              <span>看心情</span>
            </div>
            <div className="info-item">
              <strong>回覆時間：</strong>
              <span>不一定會回覆</span>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">姓名 *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="請輸入您的姓名"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">電子郵件 *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your.email@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">主旨 *</label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">請選擇主旨</option>
                <option value="general">一般詢問</option>
                <option value="technical">技術支援</option>
                <option value="business">商業合作</option>
                <option value="feedback">意見回饋</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">訊息內容 *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="請詳細描述您的問題或需求..."
              />
            </div>

            {statusMessage && (
              <div className={`form-status ${status}`}>
                {statusMessage}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={status === 'sending'}
            >
              {status === 'sending' ? '提交中...' : '送出訊息'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

