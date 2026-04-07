import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { spawn, ChildProcess } from 'child_process'
import * as fs from 'fs'
import log from 'electron-log'
import Store from 'electron-store'
import chokidar from 'chokidar'

// 配置日志
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

// 全局异常处理
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error)
  app.exit(1)
})

// 持久化存储
const store = new Store({
  defaults: {
    theme: 'system',
    fontSize: 'medium',
    logPanelWidth: 280,
    windowBounds: { width: 1200, height: 800 }
  }
})

let mainWindow: BrowserWindow | null = null
let pythonProcess: ChildProcess | null = null
let logWatcher: chokidar.FSWatcher | null = null

const PYTHON_PATH = 'D:/project/python/price_action_trader'

function createWindow() {
  const bounds = store.get('windowBounds') as { width: number; height: number }

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 900,
    minHeight: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    show: false,
    backgroundColor: '#ffffff'
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
    log.info('Main window ready')
  })

  mainWindow.on('resize', () => {
    if (mainWindow) {
      const [width, height] = mainWindow.getSize()
      store.set('windowBounds', { width, height })
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 开发模式下加载 localhost
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }
}

// Python 进程管理
function runPythonScript(script: string, args: string[] = []) {
  if (pythonProcess) {
    pythonProcess.kill()
    log.info('Previous Python process killed')
  }

  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3'
  const env = { ...process.env, PYTHONIOENCODING: 'utf-8' }
  pythonProcess = spawn(pythonCmd, [script, ...args], {
    cwd: PYTHON_PATH,
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: true,
    env
  })

  pythonProcess.stdout?.on('data', (data: Buffer) => {
    const text = data.toString('utf-8')
    mainWindow?.webContents.send('python:output', { type: 'stdout', data: text })
    log.info(`[Python stdout] ${text.trim()}`)
  })

  pythonProcess.stderr?.on('data', (data: Buffer) => {
    const text = data.toString('utf-8')
    mainWindow?.webContents.send('python:output', { type: 'stderr', data: text })
    log.error(`[Python stderr] ${text.trim()}`)
  })

  pythonProcess.on('exit', (code) => {
    mainWindow?.webContents.send('python:exit', { code })
    log.info(`Python process exited with code ${code}`)
    pythonProcess = null
  })

  pythonProcess.on('error', (err) => {
    log.error('Python process error:', err)
    mainWindow?.webContents.send('python:exit', { code: -1, error: err.message })
  })

  return true
}

// 解析 config.py 为 JSON 对象
function parseConfigPython(content: string): Record<string, unknown> {
  const config: Record<string, unknown> = {}

  const lines = content.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    // 跳过注释和空行
    if (!line || line.startsWith('#')) {
      i++
      continue
    }

    // 检查是否是字典开始
    const dictMatch = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*\{/)
    if (dictMatch) {
      const dictName = dictMatch[1]
      const dictLines = [line]
      let braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length

      // 读取字典的所有行
      while (braceCount > 0 && i + 1 < lines.length) {
        i++
        dictLines.push(lines[i])
        braceCount += (lines[i].match(/\{/g) || []).length
        braceCount -= (lines[i].match(/\}/g) || []).length
      }

      const dictContent = dictLines.join('\n')
      // 解析字典内容
      config[dictName] = parseDictContent(dictContent)
      i++
      continue
    }

    // 匹配简单变量
    const match = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.+)$/)
    if (match) {
      const [, varName, value] = match
      config[varName] = parseValue(value.trim())
    }

    i++
  }

  return config
}

// 解析字典内容
function parseDictContent(dictStr: string): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  // 去掉首尾大括号
  const content = dictStr.replace(/^\w+\s*=\s*\{/, '').replace(/\}$/, '')

  // 匹配 'key': value 或 "key": value
  const keyValueRegex = /['"](\w+)['"]\s*:\s*(.+?)(?:,\s*$|$)/gm
  let match

  while ((match = keyValueRegex.exec(content)) !== null) {
    const [, key, value] = match
    result[key] = parseValue(value.trim())
  }

  return result
}

// 解析单个值
function parseValue(value: string): unknown {
  // 去掉行内注释 (如 # 均线类型)
  if (!value.startsWith('[')) {
    value = value.replace(/\s*#.*$/, '').trim()
  }

  // 去掉末尾逗号
  value = value.replace(/,\s*$/, '').trim()

  // 字符串
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    return value.slice(1, -1)
  }

  // 布尔值
  if (value === 'True') return true
  if (value === 'False') return false

  // 数字
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return parseFloat(value)
  }

  // 列表
  if (value.startsWith('[') && value.endsWith(']')) {
    const listContent = value.slice(1, -1).trim()
    if (!listContent) return []
    return listContent.split(',').map(v => parseValue(v.trim()))
  }

  // 原始值
  return value
}

// 生成 config.py 格式的字符串
function generateConfigPython(config: Record<string, unknown>): string {
  const lines: string[] = [
    '# Price Action Trader 配置文件',
    '# ⚠️ 此文件由 Price Action Trader Desktop 自动生成',
    '# 请勿手动修改，除非您清楚每项配置的用途',
    '',
  ]

  // 写入 PA_PARAMS
  if (config.PA_PARAMS && typeof config.PA_PARAMS === 'object') {
    lines.push('PA_PARAMS = {')
    const paParams = config.PA_PARAMS as Record<string, unknown>
    const entries = Object.entries(paParams)
    entries.forEach(([key, value], index) => {
      const comma = index < entries.length - 1 ? ',' : ''
      lines.push(`    '${key}': ${formatValue(value)}${comma}`)
    })
    lines.push('}')
    lines.push('')
  }

  // 写入 EMAIL_CONFIG
  if (config.EMAIL_CONFIG && typeof config.EMAIL_CONFIG === 'object') {
    lines.push('EMAIL_CONFIG = {')
    const emailConfig = config.EMAIL_CONFIG as Record<string, unknown>
    const entries = Object.entries(emailConfig)
    entries.forEach(([key, value], index) => {
      const comma = index < entries.length - 1 ? ',' : ''
      lines.push(`    '${key}': ${formatValue(value)}${comma}`)
    })
    lines.push('}')
    lines.push('')
  }

  // 写入其他简单配置
  const simpleKeys = [
    'proxy', 'ENABLE_LOOP', 'INTERVAL_SECONDS',
    'ENABLE_NOTIFICATION', 'ENABLE_POPUP', 'ENABLE_EMAIL', 'ENABLE_SYSTEM_NOTIFY',
    'BASE_DIR', 'DATA_DIR', 'LOGS_DIR', 'STOCK_FILE_PATH', 'STOCK_BACKTEST_FILE_PATH',
    'DEFAULT_STOCK_LIST', 'LOG_FILE'
  ]

  simpleKeys.forEach(key => {
    if (config[key] !== undefined) {
      lines.push(`${key} = ${formatValue(config[key])}`)
    }
  })

  return lines.join('\n')
}

// 格式化值为 Python 语法
function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return `'${value}'`
  }
  if (typeof value === 'boolean') {
    return value ? 'True' : 'False'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => formatValue(v)).join(', ')}]`
  }
  return String(value)
}

// 精准替换字典中的值，保留行内注释
// 格式: "    'key': value,  # comment" 或 "    'key': value"
function replaceDictValue(
  line: string,
  key: string,
  newValue: unknown
): string {
  // 构建精确匹配此 key 的正则: 缩进 + 'key': + 空白 + 值 + 可选逗号 + 可选注释 + 行尾
  // 使用 [^']+ 来匹配值（不包括单引号），这样可以正确处理 'value' 这样的字符串值
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 匹配: 缩进 + 'key': 空白 + (值直到逗号或注释或行尾) + 逗号(可选) + 空白 + 注释(可选) + 行尾
  const regex = new RegExp(`^(\\s*)'${escapedKey}':\\s+(.+?)(,\\s*)?(#.*)?$`)

  const match = line.match(regex)
  if (!match) {
    // 行格式不匹配，直接返回原行
    return line
  }

  const [full, indent, rawValue, comma, comment] = match
  const formattedValue = formatValue(newValue)

  // 使用正则捕获的 comma 组来判断是否有逗号（逗号可能后面跟着空格，在 comma 捕获组里）
  // comma 可能是 ', ' (逗号+空格) 或 undefined
  const commaStr = comma !== undefined ? comma : ''

  return `${indent}'${key}': ${formattedValue}${commaStr}${comment || ''}`
}

// 精准替换简单变量
function replaceSimpleVar(
  line: string,
  varName: string,
  newValue: unknown
): string {
  const formattedValue = formatValue(newValue)
  // 匹配整行: 可选缩进 + 变量名 + = + 任意值
  const regex = new RegExp(`^(\\s*)${varName}\\s*=\\s*.+$`, 'm')
  return line.replace(regex, `$1${varName} = ${formattedValue}`)
}

// 保留注释的增量更新 config.py
function updateConfigPython(
  originalContent: string,
  config: Record<string, unknown>
): string {
  const lines = originalContent.split('\n')
  let insidePAParams = false
  let insideEmailConfig = false
  let braceCount = 0

  // 简单变量列表（不包括路径表达式变量，它们是 Python 代码而非普通字符串值）
  const simpleKeys = [
    'proxy', 'ENABLE_LOOP', 'INTERVAL_SECONDS',
    'ENABLE_NOTIFICATION', 'ENABLE_POPUP', 'ENABLE_EMAIL', 'ENABLE_SYSTEM_NOTIFY'
  ]

  const newLines = lines.map(line => {
    const trimmed = line.trim()

    // 检测 PA_PARAMS 字典开始/结束
    if (trimmed === 'PA_PARAMS = {') {
      insidePAParams = true
      braceCount = 1
      return line
    }
    if (insidePAParams) {
      braceCount += (line.match(/\{/g) || []).length
      braceCount -= (line.match(/\}/g) || []).length
      if (braceCount <= 0) {
        insidePAParams = false
      }

      // 处理 PA_PARAMS 内的键值对
      // 匹配格式: 'key': value, # comment 或 'key': value
      const dictMatch = trimmed.match(/^'([^']+)':\s+.+?(,\s*)?(#.*)?$/)
      if (dictMatch) {
        const key = dictMatch[1]
        if (config.PA_PARAMS && typeof config.PA_PARAMS === 'object') {
          const paParams = config.PA_PARAMS as Record<string, unknown>
          if (key in paParams) {
            return replaceDictValue(line, key, paParams[key])
          }
        }
      }
      return line
    }

    // 检测 EMAIL_CONFIG 字典开始/结束
    if (trimmed === 'EMAIL_CONFIG = {') {
      insideEmailConfig = true
      braceCount = 1
      return line
    }
    if (insideEmailConfig) {
      braceCount += (line.match(/\{/g) || []).length
      braceCount -= (line.match(/\}/g) || []).length
      if (braceCount <= 0) {
        insideEmailConfig = false
      }

      // 处理 EMAIL_CONFIG 内的键值对
      const dictMatch = trimmed.match(/^'([^']+)':\s+.+?(,\s*)?(#.*)?$/)
      if (dictMatch) {
        const key = dictMatch[1]
        if (config.EMAIL_CONFIG && typeof config.EMAIL_CONFIG === 'object') {
          const emailConfig = config.EMAIL_CONFIG as Record<string, unknown>
          if (key in emailConfig) {
            return replaceDictValue(line, key, emailConfig[key])
          }
        }
      }
      return line
    }

    // 处理简单变量
    for (const key of simpleKeys) {
      const regex = new RegExp(`^(\\s*)${key}\\s*=\\s*.+$`)
      if (regex.test(trimmed)) {
        if (config[key] !== undefined) {
          return replaceSimpleVar(line, key, config[key])
        }
      }
    }

    return line
  })

  return newLines.join('\n')
}

// 监听日志文件
function watchLogFile(filepath: string) {
  if (logWatcher) {
    logWatcher.close()
  }

  if (!fs.existsSync(filepath)) {
    log.warn(`Log file not found: ${filepath}`)
    return
  }

  let lastSize = fs.statSync(filepath).size

  logWatcher = chokidar.watch(filepath, { persistent: true })
  logWatcher.on('change', () => {
    try {
      const stats = fs.statSync(filepath)
      if (stats.size > lastSize) {
        // 使用 readFileSync 避免流式读取导致的多字节字符截断问题
        const content = fs.readFileSync(filepath, { encoding: 'utf-8', start: lastSize, end: stats.size })
        mainWindow?.webContents.send('python:log', content)
        lastSize = stats.size
      }
    } catch (err) {
      log.error('Error reading log file:', err)
    }
  })
}

// IPC 处理器
function setupIpcHandlers() {
  // 运行技术分析
  ipcMain.handle('python:run-analysis', () => {
    log.info('Starting technical analysis')
    return runPythonScript('main.py')
  })

  // 运行回测（支持两种模式）
  ipcMain.handle('python:run-backtest', (_, mode: 'breakout' | 'retrace' = 'breakout') => {
    log.info(`Starting backtest mode: ${mode}`)
    const script = mode === 'retrace' ? 'backtest_retrace.py' : 'backtest_main.py'
    return runPythonScript(script)
  })

  // 停止 Python 进程
  ipcMain.handle('python:stop', () => {
    if (pythonProcess) {
      pythonProcess.kill()
      pythonProcess = null
      log.info('Python process stopped by user')
      return true
    }
    return false
  })

  // 读取文件
  ipcMain.handle('file:read', (_, filepath: string) => {
    try {
      const fullPath = join(PYTHON_PATH, filepath)
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf-8')
      }
      return ''
    } catch (err) {
      log.error(`Error reading file ${filepath}:`, err)
      return ''
    }
  })

  // 写入文件
  ipcMain.handle('file:write', (_, filepath: string, content: string) => {
    try {
      const fullPath = join(PYTHON_PATH, filepath)
      fs.writeFileSync(fullPath, content, 'utf-8')
      log.info(`File written: ${filepath}`)
      return true
    } catch (err) {
      log.error(`Error writing file ${filepath}:`, err)
      return false
    }
  })

  // 读取日志文件
  ipcMain.handle('file:read-log', (_, logPath: string) => {
    try {
      const fullPath = join(PYTHON_PATH, logPath)
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath, 'utf-8')
      }
      return ''
    } catch (err) {
      log.error(`Error reading log ${logPath}:`, err)
      return ''
    }
  })

  // 监听日志文件
  ipcMain.handle('file:watch-log', (_, logPath: string) => {
    const fullPath = join(PYTHON_PATH, logPath)
    watchLogFile(fullPath)
  })

  // 停止监听日志
  ipcMain.handle('file:unwatch-log', () => {
    if (logWatcher) {
      logWatcher.close()
      logWatcher = null
    }
  })

  // 显示系统通知
  ipcMain.handle('notification:show', (_, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  // 窗口闪烁
  ipcMain.handle('window:flash', () => {
    mainWindow?.flashFrame(true)
  })

  // 获取应用设置
  ipcMain.handle('settings:get', (_, key: string) => {
    return store.get(key)
  })

  // 设置应用设置
  ipcMain.handle('settings:set', (_, key: string, value: unknown) => {
    store.set(key, value)
    return true
  })

  // 获取所有设置
  ipcMain.handle('settings:getAll', () => {
    return store.store
  })

  // 读取 config.py
  ipcMain.handle('config:read', () => {
    try {
      const configPath = join(PYTHON_PATH, 'config.py')
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8')
        return parseConfigPython(content)
      }
      return null
    } catch (err) {
      log.error('Error reading config.py:', err)
      return null
    }
  })

  // 写入 config.py（保留注释的增量更新）
  ipcMain.handle('config:write', (_, config: Record<string, unknown>) => {
    try {
      const configPath = join(PYTHON_PATH, 'config.py')
      let content: string
      if (fs.existsSync(configPath)) {
        const originalContent = fs.readFileSync(configPath, 'utf-8')
        content = updateConfigPython(originalContent, config)
      } else {
        // 文件不存在时，fallback 到全量生成
        log.warn('config.py not found, generating new file')
        content = generateConfigPython(config)
      }
      fs.writeFileSync(configPath, content, 'utf-8')
      log.info('config.py written successfully')
      return true
    } catch (err) {
      log.error('Error writing config.py:', err)
      return false
    }
  })
}

// App 事件
app.whenReady().then(() => {
  log.info('App ready')
  setupIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // 清理 Python 进程
  if (pythonProcess) {
    pythonProcess.kill()
  }
  // 清理日志监听
  if (logWatcher) {
    logWatcher.close()
  }

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  log.info('App quitting')
})
