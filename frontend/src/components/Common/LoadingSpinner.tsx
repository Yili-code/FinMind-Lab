import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  message?: string
  size?: 'small' | 'medium' | 'large'
}

function LoadingSpinner({ message = '載入中...', size = 'medium' }: LoadingSpinnerProps) {
  return (
    <div className={`loading-spinner-container ${size}`}>
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {message && <div className="loading-message">{message}</div>}
    </div>
  )
}

export default LoadingSpinner

