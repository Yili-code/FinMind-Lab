import './TableToolbar.css'

interface TableToolbarProps {
  totalCount: number
  filteredCount: number
  selectedStockCode?: string
  onClearFilter?: () => void
  searchPlaceholder?: string
  onSearch?: (value: string) => void
}

function TableToolbar({ 
  totalCount, 
  filteredCount, 
  selectedStockCode, 
  onClearFilter,
  searchPlaceholder = "搜尋...",
  onSearch
}: TableToolbarProps) {
  return (
    <div className="table-toolbar">
      <div className="toolbar-left">
        <span className="toolbar-info">
          顯示 <strong>{filteredCount}</strong> / <strong>{totalCount}</strong> 筆資料
        </span>
        {selectedStockCode && (
          <span className="filter-badge">
            已篩選: {selectedStockCode}
            {onClearFilter && (
              <button 
                className="clear-badge-btn" 
                onClick={onClearFilter}
                title="清除篩選"
              >
                ×
              </button>
            )}
          </span>
        )}
      </div>
      {onSearch && (
        <div className="toolbar-right">
          <input
            type="text"
            className="table-search"
            placeholder={searchPlaceholder}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}

export default TableToolbar

