export type ViewType = 'analysis' | 'backtest' | 'settings'
export type ThemeMode = 'light' | 'dark' | 'system'
export type FontSize = 'small' | 'medium' | 'large'
export type BacktestMode = 'breakout' | 'retrace'

export interface StockItem {
  code: string
  name?: string
}

export interface LogEntry {
  timestamp: string
  type: 'info' | 'warning' | 'error'
  message: string
}

export interface BacktestConfig {
  startDate: string
  endDate: string
  frequency: 'daily' | 'weekly' | 'monthly'
  initialCapital: number
  commissionRate: number
  stampRate: number
  singleRiskRatio: number
  maxRiskExposure: number
  trailingStop: number
}

export interface NotificationConfig {
  enableNotification: boolean
  enablePopup: boolean
  enableEmail: boolean
  enableSystemNotify: boolean
  emailConfig: {
    smtpServer: string
    smtpPort: number
    sender: string
    receiver: string
  }
}

export interface FilePathConfig {
  baseDir: string
  dataDir: string
  logsDir: string
  stockFilePath: string
  stockBacktestFilePath: string
}
