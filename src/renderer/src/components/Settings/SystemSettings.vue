<template>
  <div class="settings-form">
    <h3>系统设置</h3>
    <a-form layout="vertical">
      <a-form-item>
        <template #label>
          <span class="label-text">字体大小</span>
        </template>
        <a-radio-group v-model:value="form.fontSize">
          <a-radio-button value="small">小</a-radio-button>
          <a-radio-button value="medium">中</a-radio-button>
          <a-radio-button value="large">大</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="label-text">界面主题</span>
        </template>
        <a-radio-group v-model:value="form.theme">
          <a-radio-button value="system">跟随系统</a-radio-button>
          <a-radio-button value="light">浅色模式</a-radio-button>
          <a-radio-button value="dark">深色模式</a-radio-button>
        </a-radio-group>
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="label-text">语言</span>
        </template>
        <a-select v-model:value="form.language">
          <a-select-option value="zh-CN">简体中文</a-select-option>
          <a-select-option value="en-US">English</a-select-option>
        </a-select>
      </a-form-item>

      <a-divider />

      <a-form-item>
        <template #label>
          <span class="label-text">启动时最小化到托盘</span>
        </template>
        <a-switch v-model:checked="form.minimizeToTray" />
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="label-text">关闭时最小化到托盘</span>
        </template>
        <a-switch v-model:checked="form.closeToTray" />
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="label-text">开机自动启动</span>
        </template>
        <a-switch v-model:checked="form.autoStart" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  fontSize: 'medium' as 'small' | 'medium' | 'large',
  theme: 'system' as 'light' | 'dark' | 'system',
  language: 'zh-CN',
  minimizeToTray: false,
  closeToTray: false,
  autoStart: false
})
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
.label-text {
  color: #333;
}

html.dark .label-text {
  color: #ffffff;
}
</style>
