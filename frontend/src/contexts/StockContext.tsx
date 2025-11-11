import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'

interface StockContextType {
  selectedStockCode: string | undefined
  setSelectedStockCode: (code: string | undefined) => void
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: ReactNode }) {
  const [selectedStockCode, setSelectedStockCodeState] = useState<string | undefined>(undefined)

  // 優化：使用 useCallback 避免不必要的重新渲染
  const setSelectedStockCode = useCallback((code: string | undefined) => {
    setSelectedStockCodeState(code)
  }, [])

  // 優化：使用 useMemo 緩存 context 值
  const value = useMemo(() => ({
    selectedStockCode,
    setSelectedStockCode
  }), [selectedStockCode, setSelectedStockCode])

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider')
  }
  return context
}

