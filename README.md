# Date Scraper Project

## 專案簡介
自動化從台灣證交所及 Yahoo 擷取台股資料，清理、分析技術指標，產生圖表與 PDF 報表。

## 環境安裝說明
1. 需 Python 3.11 以上
2. 安裝必要套件：
```bash
pip install -r requirements.txt
```

## 執行方式
```bash
python main.py
```
請依指示輸入股票代碼與日期區間。

## 模組說明

- `src/scraper.py`: 股票資料自動抓取（TWSE API, Yahoo），支援重試與 logging。
- `src/cleaner.py`: 清理欄位格式、遺漏值補齊，自動儲存至 SQLite。
- `src/analyzer.py`: 技術指標如移動平均、RSI等分析。
- `src/visualizer.py`: K 線圖、均線、成交量視覺化與 PDF 報表彙整。
- `main.py`: 串接整體流程、終端進度顯示。

## 範例輸入與輸出

### 輸入流程：
```
請輸入股票代碼: 2330
開始日期 (yyyy-mm-dd): 2023-01-01
結束日期 (yyyy-mm-dd): 2023-01-31
[1/4] 正在抓取資料...
[2/4] 清理中...
[3/4] 分析中...
[4/4] 產生報表完成
PDF報表已生成：./data/reports/2330_report_xxxx.pdf
```

### 產出資料與報表檔範例：
- `data/raw/`：原始抓取資料 CSV/JSON
- `data/cleaned/`：清理後資料或 SQLite 檔
- `data/reports/`：PNG 圖檔與 PDF 報表
- `logs/`：各階段日誌記錄檔
