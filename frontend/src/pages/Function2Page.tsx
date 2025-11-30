import { useState, useEffect } from 'react'
import StockBasicForm from '../components/Function2/StockBasicForm'
import StockBasicTable from '../components/Function2/StockBasicTable'
import { storageService } from '../services/storageService'
import type { StockBasic } from '../types/stock'
import {
  getAllStockGroups,
  createStockGroup,
  updateStockGroup,
  deleteStockGroup,
  getStockGroups as getStockGroupsApi,
  addStockToGroup,
  removeStockFromGroup,
  getAllStocksWithGroups,
  type StockGroup,
  type StockGroupMapping
} from '../services/stockGroupApi'
import './Function2Page.css'

function Function2Page() {
  const [stocks, setStocks] = useState<StockBasic[]>([])
  const [editingStock, setEditingStock] = useState<StockBasic | undefined>(undefined)
  const [showForm, setShowForm] = useState(false)
  const [selectedStockCode, setSelectedStockCode] = useState<string | undefined>(undefined)
  const [groups, setGroups] = useState<StockGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(undefined)
  const [stockGroupMappings, setStockGroupMappings] = useState<StockGroupMapping[]>([])
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState<StockGroup | undefined>(undefined)
  const [groupFormData, setGroupFormData] = useState({ groupName: '', description: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStocks()
    loadGroups()
    loadStockGroupMappings()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const allGroups = await getAllStockGroups()
      setGroups(allGroups)
    } catch (error) {
      console.error('載入群組失敗:', error)
      // 如果後端未運行，使用空陣列
      setGroups([])
    } finally {
      setLoading(false)
    }
  }

  const loadStockGroupMappings = async () => {
    try {
      const mappings = await getAllStocksWithGroups()
      setStockGroupMappings(mappings)
    } catch (error) {
      console.error('載入股票群組對應關係失敗:', error)
      setStockGroupMappings([])
    }
  }

  const getStockGroupNames = (stockCode: string): string[] => {
    const mapping = stockGroupMappings.find(m => m.stockCode === stockCode)
    return mapping?.groupNames || []
  }

  const loadStocks = () => {
    const allStocks = storageService.getAll()
    setStocks(allStocks)
  }

  const handleSubmit = (stockData: Omit<StockBasic, 'id' | 'createdAt'>) => {
    if (editingStock) {
      // 更新
      const updated = storageService.update(editingStock.stockCode, stockData)
      if (updated) {
        loadStocks()
        setEditingStock(undefined)
        setShowForm(false)
      }
    } else {
      // 新增
      const existing = storageService.getByStockCode(stockData.stockCode)
      if (existing) {
        alert(`股票代號 ${stockData.stockCode} 已存在！`)
        return
      }
      storageService.add(stockData)
      loadStocks()
      setShowForm(false)
    }
  }

  const handleEdit = (stock: StockBasic) => {
    setEditingStock(stock)
    setShowForm(true)
  }

  const handleDelete = (stockCode: string) => {
    storageService.delete(stockCode)
    loadStocks()
    if (selectedStockCode === stockCode) {
      setSelectedStockCode(undefined)
    }
  }

  const handleRowClick = (stockCode: string) => {
    setSelectedStockCode(selectedStockCode === stockCode ? undefined : stockCode)
  }

  const handleCancel = () => {
    setEditingStock(undefined)
    setShowForm(false)
  }

  // 群組相關處理函數
  const handleCreateGroup = async () => {
    if (!groupFormData.groupName.trim()) {
      alert('請輸入群組名稱')
      return
    }
    try {
      setLoading(true)
      await createStockGroup(groupFormData)
      await loadGroups()
      await loadStockGroupMappings()
      setGroupFormData({ groupName: '', description: '' })
      setShowGroupForm(false)
      alert('群組創建成功')
    } catch (error: any) {
      alert(`創建群組失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateGroup = async () => {
    if (!editingGroup || !groupFormData.groupName.trim()) {
      alert('請輸入群組名稱')
      return
    }
    try {
      setLoading(true)
      await updateStockGroup(editingGroup.id, groupFormData)
      await loadGroups()
      await loadStockGroupMappings()
      setEditingGroup(undefined)
      setGroupFormData({ groupName: '', description: '' })
      setShowGroupForm(false)
      alert('群組更新成功')
    } catch (error: any) {
      alert(`更新群組失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('確定要刪除這個群組嗎？群組中的股票將被移除。')) {
      return
    }
    try {
      setLoading(true)
      await deleteStockGroup(groupId)
      await loadGroups()
      await loadStockGroupMappings()
      if (selectedGroupId === groupId) {
        setSelectedGroupId(undefined)
      }
      alert('群組刪除成功')
    } catch (error: any) {
      alert(`刪除群組失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEditGroup = (group: StockGroup) => {
    setEditingGroup(group)
    setGroupFormData({ groupName: group.groupName, description: group.description || '' })
    setShowGroupForm(true)
  }

  const handleAddStockToGroup = async (stockCode: string, groupId: string) => {
    try {
      setLoading(true)
      await addStockToGroup(groupId, stockCode)
      await loadGroups()
      await loadStockGroupMappings()
      alert('股票已加入群組')
    } catch (error: any) {
      alert(`加入群組失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveStockFromGroup = async (stockCode: string, groupId: string) => {
    try {
      setLoading(true)
      await removeStockFromGroup(groupId, stockCode)
      await loadGroups()
      await loadStockGroupMappings()
      alert('股票已從群組移除')
    } catch (error: any) {
      alert(`移除失敗: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // 根據選中的群組篩選股票
  const filteredStocks = selectedGroupId
    ? stocks.filter(stock => {
        const stockGroups = getStockGroupNames(stock.stockCode)
        const selectedGroup = groups.find(g => g.id === selectedGroupId)
        return selectedGroup && stockGroups.includes(selectedGroup.groupName)
      })
    : stocks

  return (
    <div className="function2-page">
      <div className="function2-container">
        <div className="function2-header">
          <h1>Stock Management</h1>
          <p className="function2-description">
            股票基本檔管理與財務報表查詢 - 管理股票基本資訊
          </p>
        </div>

        <div className="function2-controls">
          {!showForm && !showGroupForm && (
            <>
              <button className="add-btn" onClick={() => setShowForm(true)}>
                + 新增股票基本檔
              </button>
              <button className="add-btn" onClick={() => {
                setShowGroupForm(true)
                setEditingGroup(undefined)
                setGroupFormData({ groupName: '', description: '' })
              }}>
                + 新增群組
              </button>
            </>
          )}
          {selectedStockCode && (
            <div className="filter-control">
              <span className="filter-label">已選中股票:</span>
              <span className="filter-value">{selectedStockCode}</span>
              <button className="clear-filter-btn" onClick={() => setSelectedStockCode(undefined)}>
                清除選中
              </button>
            </div>
          )}
          {selectedGroupId && (
            <div className="filter-control">
              <span className="filter-label">已選中群組:</span>
              <span className="filter-value">{groups.find(g => g.id === selectedGroupId)?.groupName || ''}</span>
              <button className="clear-filter-btn" onClick={() => setSelectedGroupId(undefined)}>
                清除篩選
              </button>
            </div>
          )}
        </div>

        {/* 群組列表 */}
        {!showForm && !showGroupForm && groups.length > 0 && (
          <div className="groups-section">
            <h3>股票群組</h3>
            <div className="groups-list">
              {groups.map(group => (
                <div
                  key={group.id}
                  className={`group-item ${selectedGroupId === group.id ? 'active' : ''}`}
                  onClick={() => setSelectedGroupId(selectedGroupId === group.id ? undefined : group.id)}
                >
                  <div className="group-info">
                    <span className="group-name">{group.groupName}</span>
                    <span className="group-count">({group.stockCount} 支股票)</span>
                    {group.description && <span className="group-description">{group.description}</span>}
                  </div>
                  <div className="group-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="group-action-btn"
                      onClick={() => handleEditGroup(group)}
                      title="編輯群組"
                    >
                      編輯
                    </button>
                    <button
                      className="group-action-btn delete"
                      onClick={() => handleDeleteGroup(group.id)}
                      title="刪除群組"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 群組表單 */}
        {showGroupForm && (
          <div className="group-form-section">
            <h3>{editingGroup ? '編輯群組' : '新增群組'}</h3>
            <div className="group-form">
              <div className="form-group">
                <label>群組名稱 *</label>
                <input
                  type="text"
                  value={groupFormData.groupName}
                  onChange={(e) => setGroupFormData({ ...groupFormData, groupName: e.target.value })}
                  placeholder="輸入群組名稱"
                />
              </div>
              <div className="form-group">
                <label>群組描述</label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="輸入群組描述（選填）"
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button
                  className="submit-btn"
                  onClick={editingGroup ? handleUpdateGroup : handleCreateGroup}
                  disabled={loading}
                >
                  {loading ? '處理中...' : (editingGroup ? '更新' : '創建')}
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setShowGroupForm(false)
                    setEditingGroup(undefined)
                    setGroupFormData({ groupName: '', description: '' })
                  }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {showForm && (
          <StockBasicForm
            onSubmit={handleSubmit}
            initialData={editingStock}
            onCancel={handleCancel}
          />
        )}

        <div className="function2-content">
          <StockBasicTable
            data={filteredStocks}
            selectedStockCode={selectedStockCode}
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
            stockGroups={stockGroupMappings}
            allGroups={groups}
            onAddToGroup={handleAddStockToGroup}
            onRemoveFromGroup={handleRemoveStockFromGroup}
          />
        </div>

        <div className="function2-info">
          <div className="info-card">
            <h4>資料儲存</h4>
            <p>目前使用 localStorage 模擬 SQLite 資料庫</p>
            <p className="info-note">未來將整合實際的 SQLite 資料庫</p>
          </div>
          <div className="info-card">
            <h4>股票篩選</h4>
            <p>點擊表格中的股票可以篩選顯示該股票的資料</p>
            <p className="info-note">點擊「清除選中」按鈕可取消篩選</p>
          </div>
          <div className="info-card">
            <h4>財務報表</h4>
            <p>財務報表功能（T4, T5, T6）正在開發中</p>
            <p className="info-note">將提供資產負債表、損益表、現金流量表等報表</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Function2Page
