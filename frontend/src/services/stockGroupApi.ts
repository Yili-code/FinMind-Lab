// stockGroupApi.ts - 股票群組管理 API 服務

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : 'http://127.0.0.1:8000')

// 群組資料介面
export interface StockGroup {
  id: string
  groupName: string
  description?: string
  stockCount: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateGroupRequest {
  groupName: string
  description?: string
}

export interface UpdateGroupRequest {
  groupName?: string
  description?: string
}

export interface AddStockToGroupRequest {
  stockCode: string
}

// 創建股票群組
export async function createStockGroup(data: CreateGroupRequest): Promise<StockGroup> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`創建群組失敗: ${errorText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 獲取所有股票群組
export async function getAllStockGroups(): Promise<StockGroup[]> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`獲取群組列表失敗: ${errorText}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result : []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 獲取單個股票群組
export async function getStockGroup(groupId: string): Promise<StockGroup> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups/${groupId}`
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('群組不存在')
      }
      const errorText = await response.text()
      throw new Error(`獲取群組失敗: ${errorText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 更新股票群組
export async function updateStockGroup(groupId: string, data: UpdateGroupRequest): Promise<StockGroup> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups/${groupId}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`更新群組失敗: ${errorText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 刪除股票群組
export async function deleteStockGroup(groupId: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups/${groupId}`
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`刪除群組失敗: ${errorText}`)
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 將股票加入群組
export async function addStockToGroup(groupId: string, stockCode: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups/${groupId}/stocks`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockCode }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`將股票加入群組失敗: ${errorText}`)
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 將股票從群組中移除
export async function removeStockFromGroup(groupId: string, stockCode: string): Promise<void> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups/${groupId}/stocks/${stockCode}`
    const response = await fetch(url, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`將股票從群組移除失敗: ${errorText}`)
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 獲取群組中的所有股票
export async function getGroupStocks(groupId: string): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/api/stock-groups/${groupId}/stocks`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`獲取群組股票列表失敗: ${errorText}`)
    }

    const result = await response.json()
    return result.stocks || []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 獲取股票所屬的所有群組
export async function getStockGroups(stockCode: string): Promise<StockGroup[]> {
  try {
    const url = `${API_BASE_URL}/api/stocks/${stockCode}/groups`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`獲取股票所屬群組失敗: ${errorText}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result : []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}

// 獲取所有股票及其群組對應關係
export interface StockGroupMapping {
  stockCode: string
  groupNames: string[]
}

export async function getAllStocksWithGroups(): Promise<StockGroupMapping[]> {
  try {
    const url = `${API_BASE_URL}/api/stocks/groups`
    const response = await fetch(url)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`獲取股票群組對應關係失敗: ${errorText}`)
    }

    const result = await response.json()
    return Array.isArray(result) ? result : []
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('無法連接到後端服務器，請確認後端是否正在運行 (http://127.0.0.1:8000)')
    }
    throw error
  }
}



