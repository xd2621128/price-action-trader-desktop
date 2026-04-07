<template>
  <div class="settings-form">
    <a-spin :spinning="loading">
      <h3>代理设置</h3>
      <a-form layout="vertical">
        <a-form-item>
          <template #label>
            <a-space>
              代理地址
              <a-popover title="说明" placement="top">
                <template #content>
                  <p style="margin: 0; max-width: 250px;">Python 项目使用的代理服务器地址</p>
                </template>
                <QuestionCircleOutlined class="label-help-icon" />
              </a-popover>
            </a-space>
          </template>
          <a-input
            v-model:value="form.proxy"
            placeholder="如 http://127.0.0.1:7897"
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
  proxy: 'http://127.0.0.1:7897'
})

// 加载配置
async function loadConfig() {
  loading.value = true
  try {
    const config = await settingsStore.loadConfig()
    if (config && config.proxy) {
      form.proxy = config.proxy as string
    }
  } finally {
    loading.value = false
  }
}

// 监听变化并更新 store
watch(form, () => {
  settingsStore.updateConfig('proxy', form.proxy)
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
</style>
