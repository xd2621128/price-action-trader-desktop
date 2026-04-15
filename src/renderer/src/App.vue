<template>
  <a-config-provider :theme="themeConfig">
    <div class="app-container">
      <LeftSidebar
        :current-view="currentView"
        @change-view="handleChangeView"
      />
      <div class="main-content">
        <SettingsView v-if="currentView === 'settings'" />
        <template v-else>
          <div class="center-panel" :style="{ width: centerPanelWidth + 'px' }">
            <HS300Analysis
              v-if="currentView === 'hs300'"
              :stock-list="stockList"
              :is-running="isRunning"
              @update:width="handleCenterWidthUpdate"
              @run="handleHS300Run"
              @stop="handleStop"
            />
            <StockListEditor
              v-else
              :mode="currentView"
              :stock-list="stockList"
              :is-running="isRunning"
              @update:stock-list="handleStockListUpdate"
              @update:width="handleCenterWidthUpdate"
              @run="handleRun"
              @stop="handleStop"
            />
          </div>
          <LogPanel
            ref="logPanelRef"
            :logs="logs"
            @clear="handleLogClear"
          />
        </template>
      </div>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import LeftSidebar from './components/LeftSidebar.vue'
import StockListEditor from './components/StockListEditor.vue'
import LogPanel from './components/LogPanel.vue'
import SettingsView from './components/Settings/SettingsView.vue'
import HS300Analysis from './components/HS300Analysis.vue'
import { useAppStore } from './stores/app'
import { useStockStore } from './stores/stock'

const appStore = useAppStore()
const stockStore = useStockStore()

const logPanelRef = ref<InstanceType<typeof LogPanel> | null>(null)
const centerPanelWidth = ref(400)
const logs = ref<string[]>([])
const isRunning = ref(false)

const currentView = computed(() => appStore.currentView)
const stockList = computed(() => {
  if (currentView.value === 'analysis') return stockStore.analysisList
  if (currentView.value === 'backtest') return stockStore.backtestList
  return stockStore.hs300List
})

// 视图切换时加载对应的股票列表
watch(currentView, async (newView) => {
  if (newView !== 'settings') {
    await stockStore.loadStockList(newView)
  }
})

// 主题配置
const themeConfig = computed(() => ({
  token: {
    colorPrimary: '#ef4444',
    fontSize: appStore.fontSize === 'small' ? 12 : appStore.fontSize === 'large' ? 16 : 14
  }
}))

// 视图切换
function handleChangeView(view: 'analysis' | 'backtest' | 'settings' | 'hs300') {
  appStore.setCurrentView(view)
}

// 股票列表更新
async function handleStockListUpdate(list: string[]) {
  if (appStore.currentView === 'analysis') {
    stockStore.setAnalysisList(list)
  } else {
    stockStore.setBacktestList(list)
  }
  const filepath = appStore.currentView === 'analysis' ? 'data/stock_list.txt' : 'data/stock_backtest_list.txt'
  await window.electronAPI.file.write(filepath, list.join('\n'))
}

// 运行分析/回测
async function handleRun(mode: 'breakout' | 'retrace') {
  if (isRunning.value) {
    message.warning('任务正在运行中，请稍候')
    return
  }

  logs.value = []
  isRunning.value = true

  const logPath = appStore.currentView === 'analysis' ? 'logs/stock_analysis.log' : 'logs/backtest.log'

  // 过滤 Python 日志前缀 (如: 2026-04-02 19:23:56,804 - INFO - )
  function filterLog(line: string): string {
    return line.replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} - \w+ - /, '')
  }

  // 过滤警告和提示信息
  function isNoise(line: string): boolean {
    const noisePatterns = [
      'DeprecationWarning',
      'FutureWarning',
      'Pyarrow will become',
      'to allow more performant',
      'Arrow string type',
      'better interoperability',
      'was not found to be installed',
      'If this would cause problems for you',
      'please provide us feedback',
      'import pandas as pd',
      'pandas 3.0',
      '.py:',
      '/pandas/',
      'github.com/pandas-dev/pandas'
    ]
    return noisePatterns.some(pattern => line.includes(pattern))
  }

  // 监听日志输出
  const unsubOutput = window.electronAPI.python.onOutput((output) => {
    const lines = output.data.split('\n').filter((l: string) => l.trim())
    lines.forEach((line: string) => {
      // stderr 中包含 ERROR/Traceback 的才是真正的错误
      if (output.type === 'stderr' && !line.includes('Traceback') && !line.includes('Error:') && !line.includes('Exception:')) {
        if (isNoise(line)) return
        logs.value.push(filterLog(line))
      } else if (output.type === 'stdout') {
        logs.value.push(filterLog(line))
      } else {
        // stderr with real errors
        logs.value.push('[ERROR] ' + filterLog(line))
      }
    })
    logPanelRef.value?.scrollToBottom()
  })

  // 监听日志文件
  const unsubLog = window.electronAPI.python.onLog((log) => {
    const lines = log.split('\n').filter((l: string) => l.trim())
    lines.forEach((line: string) => {
      if (isNoise(line)) return
      logs.value.push(filterLog(line))
    })
    logPanelRef.value?.scrollToBottom()
  })

  // 监听进程退出
  const unsubExit = window.electronAPI.python.onExit((data) => {
    isRunning.value = false
    unsubOutput()
    unsubLog()
    unsubExit()

    // code 为 null 表示被用户停止，不显示错误
    if (data.code === 0) {
      message.success(appStore.currentView === 'analysis' ? '分析完成' : '回测完成')
    } else if (data.code !== null) {
      message.error(`任务异常退出: ${data.error || `code ${data.code}`}`)
    }

    // 显示系统通知
    if (appStore.currentView === 'analysis') {
      window.electronAPI.notification.show('技术分析完成', '请查看分析结果')
    } else {
      window.electronAPI.notification.show('回测完成', '请查看回测结果')
    }
  })

  try {
    if (appStore.currentView === 'analysis') {
      await window.electronAPI.python.runAnalysis()
    } else {
      await window.electronAPI.python.runBacktest(mode)
    }
    await window.electronAPI.file.watchLog(logPath)
  } catch (err) {
    isRunning.value = false
    unsubOutput()
    unsubLog()
    unsubExit()
    message.error(`启动失败: ${(err as Error).message}`)
  }
}

// 停止运行
async function handleStop() {
  await window.electronAPI.python.stop()
  await window.electronAPI.file.unwatchLog()
  isRunning.value = false
  message.info('任务已停止')
}

// 沪深300分析运行
async function handleHS300Run() {
  if (isRunning.value) {
    message.warning('任务正在运行中，请稍候')
    return
  }

  logs.value = []
  isRunning.value = true

  const logPath = 'logs/stock_300_analysis.log'

  // 过滤 Python 日志前缀
  function filterLog(line: string): string {
    return line.replace(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3} - \w+ - /, '')
  }

  // 过滤警告和提示信息
  function isNoise(line: string): boolean {
    const noisePatterns = [
      'DeprecationWarning',
      'FutureWarning',
      'Pyarrow will become',
      'to allow more performant',
      'Arrow string type',
      'better interoperability',
      'was not found to be installed',
      'If this would cause problems for you',
      'please provide us feedback',
      'import pandas as pd',
      'pandas 3.0',
      '.py:',
      '/pandas/',
      'github.com/pandas-dev/pandas'
    ]
    return noisePatterns.some(pattern => line.includes(pattern))
  }

  // 监听日志输出
  const unsubOutput = window.electronAPI.python.onOutput((output) => {
    const lines = output.data.split('\n').filter((l: string) => l.trim())
    lines.forEach((line: string) => {
      if (output.type === 'stderr' && !line.includes('Traceback') && !line.includes('Error:') && !line.includes('Exception:')) {
        if (isNoise(line)) return
        logs.value.push(filterLog(line))
      } else if (output.type === 'stdout') {
        logs.value.push(filterLog(line))
      } else {
        logs.value.push('[ERROR] ' + filterLog(line))
      }
    })
    logPanelRef.value?.scrollToBottom()
  })

  // 监听日志文件
  const unsubLog = window.electronAPI.python.onLog((log) => {
    const lines = log.split('\n').filter((l: string) => l.trim())
    lines.forEach((line: string) => {
      if (isNoise(line)) return
      logs.value.push(filterLog(line))
    })
    logPanelRef.value?.scrollToBottom()
  })

  // 监听进程退出
  const unsubExit = window.electronAPI.python.onExit((data) => {
    isRunning.value = false
    unsubOutput()
    unsubLog()
    unsubExit()

    if (data.code === 0) {
      message.success('沪深300分析完成')
    } else if (data.code !== null) {
      message.error(`任务异常退出: ${data.error || `code ${data.code}`}`)
    }

    window.electronAPI.notification.show('沪深300分析完成', '请查看分析结果')
  })

  try {
    await window.electronAPI.python.runHS300Analysis()
    await window.electronAPI.file.watchLog(logPath)
  } catch (err) {
    isRunning.value = false
    unsubOutput()
    unsubLog()
    unsubExit()
    message.error(`启动失败: ${(err as Error).message}`)
  }
}

// 中间面板宽度更新
function handleCenterWidthUpdate(width: number) {
  centerPanelWidth.value = width
}

// 清空日志
function handleLogClear() {
  logs.value = []
}

// 初始化
onMounted(async () => {
  const theme = await window.electronAPI.settings.get<string>('theme')
  if (theme) appStore.setTheme(theme as 'light' | 'dark' | 'system')

  const fontSize = await window.electronAPI.settings.get<string>('fontSize')
  if (fontSize) appStore.setFontSize(fontSize as 'small' | 'medium' | 'large')

  // 加载股票列表
  await stockStore.loadStockList(appStore.currentView)
})

onUnmounted(async () => {
  await window.electronAPI.file.unwatchLog()
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: #fff;
}

.dark .main-content {
  background: #141414;
}

.center-panel {
  flex: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
}

.dark .center-panel {
  background: #141414;
}
</style>
