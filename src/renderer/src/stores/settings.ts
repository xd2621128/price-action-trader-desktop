import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface PAParams {
  pinbar_body_ratio: number
  pinbar_shadow_ratio: number
  swing_window: number
  consolidation_lookback: number
  consolidation_min_bars: number
  ma_type: string
  ma_short_period: number
  ma_long_period: number
  hotspot_threshold_pct: number
  hotspot_min_weight: number
  stop_loss_pct: number
  trend_climax_threshold_pct: number
  sr_lookback: number
  risk_reward_ratio: number
  min_volume: number
  volume_ma_window: number
  min_volume_ratio: number
  price_limit_pct: number
  min_data_days: number
  backtest_warmup_days: number
  show_retrace_entry: boolean
  retrace_wait_bars: number
  ma_min_days: number
}

export interface EmailConfig {
  sender: string
  password: string
  receiver: string
  smtp_server: string
  smtp_port: number
}

export interface AppConfig {
  proxy: string
  ENABLE_LOOP: boolean
  INTERVAL_SECONDS: number
  ENABLE_NOTIFICATION: boolean
  ENABLE_POPUP: boolean
  ENABLE_EMAIL: boolean
  ENABLE_SYSTEM_NOTIFY: boolean
  EMAIL_CONFIG: EmailConfig
  BASE_DIR: string
  DATA_DIR: string
  LOGS_DIR: string
  STOCK_FILE_PATH: string
  STOCK_BACKTEST_FILE_PATH: string
  DEFAULT_STOCK_LIST: string[]
  LOG_FILE: string
  PA_PARAMS: PAParams
}

export const useSettingsStore = defineStore('settings', () => {
  const config = ref<AppConfig | null>(null)
  const isLoaded = ref(false)
  const isDirty = ref(false)

  async function loadConfig() {
    try {
      const result = await window.electronAPI.config.read()
      if (result) {
        config.value = result as unknown as AppConfig
        isLoaded.value = true
        isDirty.value = false
      }
      return result
    } catch (err) {
      console.error('Failed to load config:', err)
      return null
    }
  }

  async function saveConfig(newConfig?: Partial<AppConfig>) {
    try {
      const configToSave = newConfig || config.value
      if (!configToSave) return false

      // 深度转换为普通对象，避免 Vue 响应式代理导致的克隆失败
      const plainConfig = JSON.parse(JSON.stringify(configToSave))
      const result = await window.electronAPI.config.write(plainConfig)
      if (result) {
        isDirty.value = false
      }
      return result
    } catch (err) {
      console.error('Failed to save config:', err)
      return false
    }
  }

  function updateConfig(key: string, value: unknown) {
    if (config.value) {
      (config.value as Record<string, unknown>)[key] = value
      isDirty.value = true
    }
  }

  function updatePAParam(key: keyof PAParams, value: unknown) {
    if (config.value && config.value.PA_PARAMS) {
      (config.value.PA_PARAMS as Record<string, unknown>)[key] = value
      isDirty.value = true
    }
  }

  function updateEmailConfig(key: keyof EmailConfig, value: unknown) {
    if (config.value && config.value.EMAIL_CONFIG) {
      (config.value.EMAIL_CONFIG as Record<string, unknown>)[key] = value
      isDirty.value = true
    }
  }

  return {
    config,
    isLoaded,
    isDirty,
    loadConfig,
    saveConfig,
    updateConfig,
    updatePAParam,
    updateEmailConfig
  }
})
