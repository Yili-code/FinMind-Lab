# cache_service.py - 快取服務（內存快取 + 資料庫快取）

import time
import logging
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)

# 導入資料庫工具
try:
    from db_utils import prepare_sql
    from database import DB_TYPE
except ImportError:
    # 如果無法導入，使用默認值
    DB_TYPE = 'sqlite'
    def prepare_sql(sql: str) -> str:
        return sql

# 內存快取（簡單的字典實現）
_memory_cache: Dict[str, Dict[str, Any]] = {}

# 快取配置
CACHE_TTL = {
    'stock_info': 300,  # 5分鐘（股票基本資訊更新頻繁）
    'daily_trade': 3600,  # 1小時（日交易數據一天更新一次）
    'intraday': 60,  # 1分鐘（盤中數據更新頻繁）
    'market_index': 300,  # 5分鐘
    'financial': 86400,  # 24小時（財務報表更新不頻繁）
}

def get_cache_key(prefix: str, *args, **kwargs) -> str:
    """生成快取鍵"""
    key_parts = [prefix]
    if args:
        key_parts.extend(str(arg) for arg in args)
    if kwargs:
        sorted_kwargs = sorted(kwargs.items())
        key_parts.extend(f"{k}={v}" for k, v in sorted_kwargs)
    return ":".join(key_parts)

def get_from_memory_cache(key: str) -> Optional[Dict[str, Any]]:
    """從內存快取獲取數據"""
    if key in _memory_cache:
        cached_data = _memory_cache[key]
        # 檢查是否過期
        if time.time() < cached_data.get('expires_at', 0):
            logger.debug(f"快取命中: {key}")
            return cached_data.get('data')
        else:
            # 過期，刪除
            del _memory_cache[key]
            logger.debug(f"快取過期: {key}")
    return None

def set_to_memory_cache(key: str, data: Any, ttl: int):
    """設置內存快取"""
    _memory_cache[key] = {
        'data': data,
        'expires_at': time.time() + ttl,
        'cached_at': time.time()
    }
    logger.debug(f"設置快取: {key}, TTL: {ttl}秒")

def clear_memory_cache(pattern: str = None):
    """清除內存快取"""
    if pattern:
        keys_to_delete = [k for k in _memory_cache.keys() if pattern in k]
        for key in keys_to_delete:
            del _memory_cache[key]
        logger.info(f"清除快取: {len(keys_to_delete)} 個鍵（模式: {pattern}）")
    else:
        _memory_cache.clear()
        logger.info("清除所有快取")

def get_cache_stats() -> Dict[str, Any]:
    """獲取快取統計信息"""
    total_keys = len(_memory_cache)
    expired_keys = sum(1 for v in _memory_cache.values() if time.time() >= v.get('expires_at', 0))
    valid_keys = total_keys - expired_keys
    
    return {
        'total_keys': total_keys,
        'valid_keys': valid_keys,
        'expired_keys': expired_keys,
        'cache_size_mb': sum(len(str(v).encode('utf-8')) for v in _memory_cache.values()) / 1024 / 1024
    }

def cached(cache_type: str = 'stock_info', use_db: bool = True):
    """
    快取裝飾器
    
    參數:
        cache_type: 快取類型（決定 TTL）
        use_db: 是否使用資料庫作為二級快取
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 生成快取鍵
            cache_key = get_cache_key(func.__name__, *args, **kwargs)
            ttl = CACHE_TTL.get(cache_type, 300)
            
            # 1. 嘗試從內存快取獲取
            cached_data = get_from_memory_cache(cache_key)
            if cached_data is not None:
                return cached_data
            
            # 2. 如果啟用資料庫快取，嘗試從資料庫獲取
            if use_db and DB_AVAILABLE:
                try:
                    db_data = get_from_db_cache(cache_key, cache_type)
                    if db_data is not None:
                        # 將資料庫數據放入內存快取
                        set_to_memory_cache(cache_key, db_data, ttl)
                        logger.info(f"從資料庫快取獲取: {cache_key}")
                        return db_data
                except Exception as e:
                    logger.warning(f"從資料庫快取獲取失敗: {str(e)}")
            
            # 3. 執行函數獲取數據
            try:
                result = func(*args, **kwargs)
                
                # 4. 保存到快取
                if result is not None:
                    set_to_memory_cache(cache_key, result, ttl)
                    
                    # 如果啟用資料庫快取，保存到資料庫
                    if use_db and DB_AVAILABLE:
                        try:
                            save_to_db_cache(cache_key, result, cache_type, ttl)
                        except Exception as e:
                            logger.warning(f"保存到資料庫快取失敗: {str(e)}")
                
                return result
            except Exception as e:
                logger.error(f"執行函數 {func.__name__} 時發生錯誤: {str(e)}")
                raise
        
        return wrapper
    return decorator

# 資料庫快取相關函數
DB_AVAILABLE = False
try:
    from database import get_db_connection
    DB_AVAILABLE = True
except ImportError:
    pass

def get_from_db_cache(cache_key: str, cache_type: str) -> Optional[Any]:
    """從資料庫快取獲取數據"""
    if not DB_AVAILABLE:
        return None
    
    try:
        from database import DB_TYPE
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 根據資料庫類型選擇合適的時間函數
        if DB_TYPE == 'postgresql':
            time_func = "CURRENT_TIMESTAMP"
        else:
            time_func = "datetime('now')"
        
        cursor.execute(prepare_sql(f"""
            SELECT data, expires_at FROM cache_store 
            WHERE cache_key = ? AND cache_type = ? AND expires_at > {time_func}
        """), (cache_key, cache_type))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            import json
            return json.loads(row['data'])
        return None
    except Exception as e:
        logger.warning(f"從資料庫快取獲取失敗: {str(e)}")
        return None

def save_to_db_cache(cache_key: str, data: Any, cache_type: str, ttl: int):
    """保存數據到資料庫快取"""
    if not DB_AVAILABLE:
        return
    
    try:
        import json
        import sqlite3
        from datetime import datetime, timedelta
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 創建快取表（如果不存在）
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cache_store (
                cache_key TEXT PRIMARY KEY,
                cache_type TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        """)
        
        # 創建索引
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_cache_type ON cache_store(cache_type)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_store(expires_at)
        """)
        
        expires_at = (datetime.now() + timedelta(seconds=ttl)).isoformat()
        data_json = json.dumps(data, ensure_ascii=False)
        
        # 根據資料庫類型選擇合適的插入語句
        if DB_TYPE == 'postgresql':
            # PostgreSQL 使用 ON CONFLICT
            cursor.execute(prepare_sql("""
                INSERT INTO cache_store (cache_key, cache_type, data, expires_at)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (cache_key) DO UPDATE SET
                    cache_type = EXCLUDED.cache_type,
                    data = EXCLUDED.data,
                    expires_at = EXCLUDED.expires_at
            """), (cache_key, cache_type, data_json, expires_at))
        else:
            # SQLite 使用 INSERT OR REPLACE
            cursor.execute(prepare_sql("""
            INSERT OR REPLACE INTO cache_store (cache_key, cache_type, data, expires_at)
            VALUES (?, ?, ?, ?)
            """), (cache_key, cache_type, data_json, expires_at))
        
        conn.commit()
        conn.close()
        logger.debug(f"保存到資料庫快取: {cache_key}")
    except Exception as e:
        logger.warning(f"保存到資料庫快取失敗: {str(e)}")

def init_cache_table():
    """初始化快取表"""
    if not DB_AVAILABLE:
        return
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cache_store (
                cache_key TEXT PRIMARY KEY,
                cache_type TEXT NOT NULL,
                data TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_cache_type ON cache_store(cache_type)
        """)
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_store(expires_at)
        """)
        
        # 清理過期快取
        from database import DB_TYPE
        if DB_TYPE == 'postgresql':
            time_func = "CURRENT_TIMESTAMP"
        else:
            time_func = "datetime('now')"
        
        cursor.execute(f"DELETE FROM cache_store WHERE expires_at < {time_func}")
        
        conn.commit()
        conn.close()
        logger.info("快取表初始化成功")
    except Exception as e:
        logger.error(f"快取表初始化失敗: {str(e)}")

# 初始化快取表
if DB_AVAILABLE:
    try:
        init_cache_table()
    except Exception as e:
        logger.warning(f"初始化快取表失敗: {str(e)}")

