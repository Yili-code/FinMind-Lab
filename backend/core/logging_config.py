# logging_config.py - 日誌配置

import logging
import sys
from typing import Optional
from core.config import LOG_LEVEL, LOG_FORMAT


def setup_logging(
    level: Optional[str] = None,
    format_string: Optional[str] = None
) -> None:
    """設置應用程式日誌配置"""
    
    log_level = level or LOG_LEVEL
    log_format = format_string or LOG_FORMAT
    
    # 設置根日誌記錄器
    logging.basicConfig(
        level=getattr(logging, log_level.upper(), logging.INFO),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    # 抑制第三方庫的冗長日誌
    logging.getLogger('yfinance').setLevel(logging.ERROR)
    logging.getLogger('urllib3').setLevel(logging.ERROR)
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('fastapi').setLevel(logging.WARNING)
    
    # 設置我們自己的服務日誌級別
    logging.getLogger('services.yfinance_service').setLevel(logging.INFO)
    logging.getLogger('__main__').setLevel(logging.INFO)


def get_logger(name: str) -> logging.Logger:
    """獲取日誌記錄器"""
    return logging.getLogger(name)
