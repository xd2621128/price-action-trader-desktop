import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ViewType } from '../types'

export const useStockStore = defineStore('stock', () => {
  const stockList = ref<string[]>([])
  const analysisList = ref<string[]>([])
  const backtestList = ref<string[]>([])
  const hs300List = ref<string[]>([])

  function setStockList(list: string[]) {
    stockList.value = list
  }

  function setAnalysisList(list: string[]) {
    analysisList.value = list
  }

  function setBacktestList(list: string[]) {
    backtestList.value = list
  }

  function setHS300List(list: string[]) {
    hs300List.value = list
  }

  async function loadStockList(view: ViewType) {
    let filepath: string
    if (view === 'analysis') {
      filepath = 'data/stock_list.txt'
    } else if (view === 'backtest') {
      filepath = 'data/stock_backtest_list.txt'
    } else {
      filepath = 'data/stock_300_list.txt'
    }
    const content = await window.electronAPI.file.read(filepath)
    const list = content.split('\n').filter(line => line.trim() !== '')

    if (view === 'analysis') {
      analysisList.value = list
      stockList.value = list
    } else if (view === 'backtest') {
      backtestList.value = list
      stockList.value = list
    } else {
      hs300List.value = list
      stockList.value = list
    }
  }

  async function saveStockList(view: ViewType) {
    let filepath: string
    if (view === 'analysis') {
      filepath = 'data/stock_list.txt'
    } else if (view === 'backtest') {
      filepath = 'data/stock_backtest_list.txt'
    } else {
      filepath = 'data/stock_300_list.txt'
    }
    const content = stockList.value.join('\n')
    await window.electronAPI.file.write(filepath, content)

    if (view === 'analysis') {
      analysisList.value = stockList.value
    } else if (view === 'backtest') {
      backtestList.value = stockList.value
    } else {
      hs300List.value = stockList.value
    }
  }

  function addStock(code: string) {
    if (!stockList.value.includes(code)) {
      stockList.value.push(code)
    }
  }

  function removeStock(code: string) {
    const index = stockList.value.indexOf(code)
    if (index > -1) {
      stockList.value.splice(index, 1)
    }
  }

  function updateStock(oldCode: string, newCode: string) {
    const index = stockList.value.indexOf(oldCode)
    if (index > -1) {
      stockList.value[index] = newCode
    }
  }

  return {
    stockList,
    analysisList,
    backtestList,
    hs300List,
    setStockList,
    setAnalysisList,
    setBacktestList,
    setHS300List,
    loadStockList,
    saveStockList,
    addStock,
    removeStock,
    updateStock
  }
})
