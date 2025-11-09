import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

interface StockContextType {
  selectedStockCode: string | undefined
  setSelectedStockCode: (code: string | undefined) => void
}

const StockContext = createContext<StockContextType | undefined>(undefined)

export function StockProvider({ children }: { children: ReactNode }) {
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)

  return (
    <StockContext.Provider value={{ selectedStockCode, setSelectedStockCode }}>
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

