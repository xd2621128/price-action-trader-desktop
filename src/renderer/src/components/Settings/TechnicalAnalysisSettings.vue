<template>
  <div class="settings-form">
    <a-spin :spinning="loading">
      <h3>K线形态参数</h3>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">Pinbar Body Ratio (躯体比率)</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">躯体与整根K线的比例，越小表示信号越强</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.pinbar_body_ratio" :min="0" :max="1" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">Pinbar Shadow Ratio (影线比率)</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">下影线与整根K线的比例</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.pinbar_shadow_ratio" :min="0" :max="1" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">Swing Window (摆动窗口)</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">用于识别高低点的窗口期</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.swing_window" :min="1" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">Consolidation Lookback (盘整回溯)</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">识别盘整区间的回溯周期</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.consolidation_lookback" :min="1" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <h3>均线系统</h3>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item>
              <template #label>
                <span class="label-text">均线类型</span>
              </template>
              <a-select v-model:value="form.ma_type">
                <a-select-option value="SMA">简单移动平均 (SMA)</a-select-option>
                <a-select-option value="EMA">指数移动平均 (EMA)</a-select-option>
                <a-select-option value="WMA">加权移动平均 (WMA)</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <template #label>
                <span class="label-text">短期均线周期</span>
              </template>
              <a-input-number v-model:value="form.ma_short_period" :min="1" :max="100" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <template #label>
                <span class="label-text">长期均线周期</span>
              </template>
              <a-input-number v-model:value="form.ma_long_period" :min="1" :max="200" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <h3>止损配置</h3>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">止损百分比 (%)</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">买入后止损价格距离买入价的百分比</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.stop_loss_pct" :min="0" :max="50" :step="0.5" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

      <h3>资金管理</h3>
      <a-form layout="vertical">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">风险收益比</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">止盈与止损的距离比例</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.risk_reward_ratio" :min="0.5" :max="10" :step="0.1" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="8">
            <a-form-item>
              <template #label>
                <a-space>
                  <span class="label-text">最小成交量</span>
                  <a-popover title="说明" placement="top">
                    <template #content>
                      <p style="margin: 0; max-width: 250px;">触发买入的最小成交量</p>
                    </template>
                    <QuestionCircleOutlined class="label-help-icon" />
                  </a-popover>
                </a-space>
              </template>
              <a-input-number v-model:value="form.min_volume" :min="0" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(false)

const form = reactive({
  pinbar_body_ratio: 0.33,
  pinbar_shadow_ratio: 2.0,
  swing_window: 2,
  consolidation_lookback: 30,
  ma_type: 'EMA',
  ma_short_period: 10,
  ma_long_period: 20,
  stop_loss_pct: 0.01,
  risk_reward_ratio: 3.0,
  min_volume: 100000
})

// 加载配置
async function loadConfig() {
  loading.value = true
  try {
    const config = await settingsStore.loadConfig()
    if (config && config.PA_PARAMS) {
      const pa = config.PA_PARAMS as Record<string, unknown>
      Object.keys(form).forEach(key => {
        if (pa[key] !== undefined) {
          (form as Record<string, unknown>)[key] = pa[key]
        }
      })
    }
  } finally {
    loading.value = false
  }
}

// 监听变化并更新 store
watch(form, () => {
  if (settingsStore.config && settingsStore.config.PA_PARAMS) {
    Object.keys(form).forEach(key => {
      settingsStore.updatePAParam(key as keyof typeof form, form[key as keyof typeof form])
    })
  }
}, { deep: true })

onMounted(loadConfig)
</script>

<style scoped>
.settings-form h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.dark .settings-form h3 {
  border-bottom-color: #303030;
  color: #e8e8e8;
}

.label-text {
  color: #333;
}
</style>

<style>
/* 全局样式 - 用于覆盖 antd 默认样式 */
.label-text {
  color: #333;
}

html.dark .label-text {
  color: #ffffff !important;
}

.settings-form .ant-form-item-label > label {
  color: #333;
}

html.dark .settings-form .ant-form-item-label > label {
  color: #ffffff !important;
}

html.dark .settings-form .ant-form-item-label .ant-space {
  color: #ffffff !important;
}

html.dark .settings-form .ant-space .label-text {
  color: #ffffff !important;
  font-size: 13px;
}

html.dark .settings-form .label-text {
  color: #ffffff !important;
}

.label-help-icon {
  color: #999;
  cursor: pointer;
  font-size: 12px;
}

.label-help-icon:hover {
  color: #ef4444;
}

html.dark .label-help-icon {
  color: #aaa;
}

html.dark .label-help-icon:hover {
  color: #ef4444;
}
</style>
