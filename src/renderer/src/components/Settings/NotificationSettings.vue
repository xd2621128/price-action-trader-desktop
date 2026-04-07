<template>
  <div class="settings-form">
    <a-spin :spinning="loading">
      <h3>提醒功能</h3>
      <a-form layout="vertical">
        <a-form-item>
          <template #label>
            <span class="label-text">启用桌面通知</span>
          </template>
          <a-switch v-model:checked="form.ENABLE_NOTIFICATION" />
        </a-form-item>

        <a-form-item>
          <template #label>
            <span class="label-text">启用弹窗提醒</span>
          </template>
          <a-switch v-model:checked="form.ENABLE_POPUP" />
        </a-form-item>

        <a-form-item>
          <template #label>
            <a-space>
              <span class="label-text">启用系统通知中心</span>
              <a-popover title="说明" placement="top">
                <template #content>
                  <p style="margin: 0; max-width: 250px;">使用系统原生通知方式</p>
                </template>
                <QuestionCircleOutlined class="label-help-icon" />
              </a-popover>
            </a-space>
          </template>
          <a-switch v-model:checked="form.ENABLE_SYSTEM_NOTIFY" />
        </a-form-item>

        <a-form-item>
          <template #label>
            <span class="label-text">启用邮件通知</span>
          </template>
          <a-switch v-model:checked="form.ENABLE_EMAIL" />
        </a-form-item>

        <a-divider v-if="form.ENABLE_EMAIL" />

        <template v-if="form.ENABLE_EMAIL">
          <h4>邮件配置</h4>
          <a-form layout="vertical">
            <a-row :gutter="16">
              <a-col :span="12">
                <a-form-item>
                  <template #label>
                    <span class="label-text">SMTP 服务器</span>
                  </template>
                  <a-input v-model:value="form.EMAIL_CONFIG.smtp_server" placeholder="smtp.qq.com" />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item>
                  <template #label>
                    <span class="label-text">SMTP 端口</span>
                  </template>
                  <a-input-number v-model:value="form.EMAIL_CONFIG.smtp_port" :min="1" :max="65535" style="width: 100%" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item>
              <template #label>
                <span class="label-text">发件人邮箱</span>
              </template>
              <a-input v-model:value="form.EMAIL_CONFIG.sender" type="email" />
            </a-form-item>

            <a-form-item>
              <template #label>
                <span class="label-text">收件人邮箱</span>
              </template>
              <a-input v-model:value="form.EMAIL_CONFIG.receiver" type="email" />
            </a-form-item>

            <a-form-item>
              <template #label>
                <span class="label-text">邮箱密码/授权码</span>
              </template>
              <a-input-password v-model:value="form.EMAIL_CONFIG.password" />
            </a-form-item>
          </a-form>
        </template>
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
  ENABLE_NOTIFICATION: false,
  ENABLE_POPUP: true,
  ENABLE_EMAIL: false,
  ENABLE_SYSTEM_NOTIFY: true,
  EMAIL_CONFIG: {
    smtp_server: 'smtp.qq.com',
    smtp_port: 587,
    sender: 'your_email@qq.com',
    receiver: 'your_email@qq.com',
    password: 'your_smtp_password'
  } as Record<string, unknown>
})

// 加载配置
async function loadConfig() {
  loading.value = true
  try {
    const config = await settingsStore.loadConfig()
    if (config) {
      if (config.ENABLE_NOTIFICATION !== undefined) {
        form.ENABLE_NOTIFICATION = config.ENABLE_NOTIFICATION as boolean
      }
      if (config.ENABLE_POPUP !== undefined) {
        form.ENABLE_POPUP = config.ENABLE_POPUP as boolean
      }
      if (config.ENABLE_EMAIL !== undefined) {
        form.ENABLE_EMAIL = config.ENABLE_EMAIL as boolean
      }
      if (config.ENABLE_SYSTEM_NOTIFY !== undefined) {
        form.ENABLE_SYSTEM_NOTIFY = config.ENABLE_SYSTEM_NOTIFY as boolean
      }
      if (config.EMAIL_CONFIG) {
        form.EMAIL_CONFIG = { ...form.EMAIL_CONFIG, ...(config.EMAIL_CONFIG as Record<string, unknown>) }
      }
    }
  } finally {
    loading.value = false
  }
}

// 监听变化并更新 store
watch(form, () => {
  settingsStore.updateConfig('ENABLE_NOTIFICATION', form.ENABLE_NOTIFICATION)
  settingsStore.updateConfig('ENABLE_POPUP', form.ENABLE_POPUP)
  settingsStore.updateConfig('ENABLE_EMAIL', form.ENABLE_EMAIL)
  settingsStore.updateConfig('ENABLE_SYSTEM_NOTIFY', form.ENABLE_SYSTEM_NOTIFY)
  settingsStore.updateConfig('EMAIL_CONFIG', form.EMAIL_CONFIG)
}, { deep: true })

onMounted(loadConfig)
</script>

<style scoped>
.settings-form h3,
.settings-form h4 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.dark .settings-form h3,
.dark .settings-form h4 {
  border-bottom-color: #303030;
  color: #e8e8e8;
}
</style>

<style>
.label-text {
  color: #333;
}

html.dark .label-text {
  color: #ffffff;
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
  color: #666;
}

html.dark .label-help-icon:hover {
  color: #ef4444;
}
</style>
