<template>
  <div class="settings-form">
    <a-spin :spinning="loading">
      <h3>执行配置</h3>
      <a-form layout="vertical">
        <a-form-item>
          <template #label>
            <a-space>
              启用循环执行
              <a-popover title="说明" placement="top">
                <template #content>
                  <p style="margin: 0; max-width: 250px;">开启后将持续运行，定时执行分析或回测</p>
                </template>
                <QuestionCircleOutlined class="label-help-icon" />
              </a-popover>
            </a-space>
          </template>
          <a-switch v-model:checked="form.ENABLE_LOOP" />
        </a-form-item>

        <a-form-item>
          <template #label>
            <a-space>
              执行间隔 (秒)
              <a-popover title="说明" placement="top">
                <template #content>
                  <p style="margin: 0; max-width: 250px;">每次执行之间的等待时间(秒)</p>
                </template>
                <QuestionCircleOutlined class="label-help-icon" />
              </a-popover>
            </a-space>
          </template>
          <a-input-number
            v-model:value="form.INTERVAL_SECONDS"
            :min="10"
            :max="86400"
            :disabled="!form.ENABLE_LOOP"
            style="width: 100%"
          />
        </a-form-item>
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
  ENABLE_LOOP: false,
  INTERVAL_SECONDS: 3600
})

// 加载配置
async function loadConfig() {
  loading.value = true
  try {
    const config = await settingsStore.loadConfig()
    if (config) {
      if (config.ENABLE_LOOP !== undefined) {
        form.ENABLE_LOOP = config.ENABLE_LOOP as boolean
      }
      if (config.INTERVAL_SECONDS !== undefined) {
        form.INTERVAL_SECONDS = config.INTERVAL_SECONDS as number
      }
    }
  } finally {
    loading.value = false
  }
}

// 监听变化并更新 store
watch(form, () => {
  settingsStore.updateConfig('ENABLE_LOOP', form.ENABLE_LOOP)
  settingsStore.updateConfig('INTERVAL_SECONDS', form.INTERVAL_SECONDS)
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
</style>

<style>
.label-help-icon {
  color: #999;
  cursor: pointer;
  font-size: 12px;
}

.label-help-icon:hover {
  color: #ef4444;
}

html.dark .label-help-icon {
  color: #666;
}

html.dark .label-help-icon:hover {
  color: #ef4444;
}

html.dark .settings-form .ant-input-number-disabled input[disabled] {
  color: #888 !important;
  -webkit-text-fill-color: #888 !important;
}

html.dark .settings-form .ant-input-number-disabled .ant-input-number-input {
  color: #888 !important;
  -webkit-text-fill-color: #888 !important;
}
</style>
