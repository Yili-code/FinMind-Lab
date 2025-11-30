# db_utils.py - 資料庫工具函數

from database import DB_TYPE

def prepare_sql(sql: str) -> str:
    """準備 SQL 語句，將 ? 替換為正確的參數佔位符
    
    PostgreSQL 使用 %s，SQLite 使用 ?
    """
    if DB_TYPE == 'postgresql':
        # PostgreSQL 使用 %s
        # 需要小心處理，避免替換已經存在的 %s（如 %%s）
        # 簡單方法：直接替換 ? 為 %s
        return sql.replace('?', '%s')
    else:
        # SQLite 使用 ?
        return sql



