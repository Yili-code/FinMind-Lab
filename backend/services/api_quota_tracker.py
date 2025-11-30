# api_quota_tracker.py - yfinance API 限額追蹤和可視化

import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from collections import deque
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class APIRequest:
    """API 請求記錄"""
    timestamp: float
    endpoint: str
    stock_code: str
    success: bool
    response_time: float

class APIQuotaTracker:
    """yfinance API 限額追蹤器"""
    
    # yfinance 的實際限制（根據經驗值）
    RATE_LIMITS = {
        'requests_per_minute': 20,  # 每分鐘最多 20 個請求
        'requests_per_hour': 200,   # 每小時最多 200 個請求
        'requests_per_day': 2000,   # 每天最多 2000 個請求
    }
    
    def __init__(self):
        self.requests: deque = deque(maxlen=10000)  # 保留最近 10000 個請求
        self.start_time = time.time()
    
    def record_request(self, endpoint: str, stock_code: str, success: bool, response_time: float = 0):
        """記錄 API 請求"""
        request = APIRequest(
            timestamp=time.time(),
            endpoint=endpoint,
            stock_code=stock_code,
            success=success,
            response_time=response_time
        )
        self.requests.append(request)
        logger.debug(f"記錄 API 請求: {endpoint} - {stock_code} - {'成功' if success else '失敗'}")
    
    def get_stats(self) -> Dict[str, Any]:
        """獲取統計信息"""
        now = time.time()
        one_minute_ago = now - 60
        one_hour_ago = now - 3600
        one_day_ago = now - 86400
        
        all_requests = list(self.requests)
        recent_requests = [r for r in all_requests if r.timestamp >= one_minute_ago]
        hourly_requests = [r for r in all_requests if r.timestamp >= one_hour_ago]
        daily_requests = [r for r in all_requests if r.timestamp >= one_day_ago]
        
        successful_requests = [r for r in all_requests if r.success]
        failed_requests = [r for r in all_requests if not r.success]
        
        avg_response_time = (
            sum(r.response_time for r in successful_requests) / len(successful_requests)
            if successful_requests else 0
        )
        
        return {
            'total_requests': len(all_requests),
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'success_rate': len(successful_requests) / len(all_requests) * 100 if all_requests else 0,
            'avg_response_time': round(avg_response_time, 3),
            'recent_requests': len(recent_requests),
            'hourly_requests': len(hourly_requests),
            'daily_requests': len(daily_requests),
            'rate_limits': self.RATE_LIMITS,
            'usage_percentage': {
                'minute': len(recent_requests) / self.RATE_LIMITS['requests_per_minute'] * 100,
                'hour': len(hourly_requests) / self.RATE_LIMITS['requests_per_hour'] * 100,
                'day': len(daily_requests) / self.RATE_LIMITS['requests_per_day'] * 100,
            },
            'remaining_quota': {
                'minute': max(0, self.RATE_LIMITS['requests_per_minute'] - len(recent_requests)),
                'hour': max(0, self.RATE_LIMITS['requests_per_hour'] - len(hourly_requests)),
                'day': max(0, self.RATE_LIMITS['requests_per_day'] - len(daily_requests)),
            },
            'uptime_seconds': now - self.start_time,
        }
    
    def get_recent_requests(self, limit: int = 50) -> List[Dict]:
        """獲取最近的請求記錄"""
        recent = list(self.requests)[-limit:]
        return [asdict(r) for r in recent]
    
    def check_rate_limit(self) -> Dict[str, bool]:
        """檢查是否超過限額"""
        stats = self.get_stats()
        return {
            'minute_ok': stats['recent_requests'] < self.RATE_LIMITS['requests_per_minute'],
            'hour_ok': stats['hourly_requests'] < self.RATE_LIMITS['requests_per_hour'],
            'day_ok': stats['daily_requests'] < self.RATE_LIMITS['requests_per_day'],
        }

# 全局追蹤器實例
quota_tracker = APIQuotaTracker()


