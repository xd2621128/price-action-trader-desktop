<template>
  <div class="settings-view">
    <div class="settings-header">
      <h2>设置</h2>
    </div>

    <div class="settings-content">
      <a-tabs v-model:activeKey="activeTab" tab-position="left" class="settings-tabs">
        <a-tab-pane key="technical" tab="技术分析设置" />
        <a-tab-pane key="backtest" tab="回测设置" />
        <a-tab-pane key="proxy" tab="代理设置" />
        <a-tab-pane key="execution" tab="执行配置" />
        <a-tab-pane key="notification" tab="提醒功能" />
        <a-tab-pane key="system" tab="系统设置" />
        <a-tab-pane key="about" tab="关于/帮助" />
      </a-tabs>

      <div class="settings-panel">
        <TechnicalAnalysisSettings v-if="activeTab === 'technical'" />
        <BacktestSettings v-else-if="activeTab === 'backtest'" />
        <ProxySettings v-else-if="activeTab === 'proxy'" />
        <ExecutionSettings v-else-if="activeTab === 'execution'" />
        <NotificationSettings v-else-if="activeTab === 'notification'" />
        <SystemSettings v-else-if="activeTab === 'system'" />
        <AboutSettings v-else-if="activeTab === 'about'" />
      </div>
    </div>

    <div class="settings-footer">
      <a-space>
        <a-button type="primary" @click="handleApply">应用</a-button>
        <a-button @click="handleReset">重置</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import TechnicalAnalysisSettings from './TechnicalAnalysisSettings.vue'
import BacktestSettings from './BacktestSettings.vue'
import ProxySettings from './ProxySettings.vue'
import ExecutionSettings from './ExecutionSettings.vue'
import NotificationSettings from './NotificationSettings.vue'
import SystemSettings from './SystemSettings.vue'
import AboutSettings from './AboutSettings.vue'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()
const activeTab = ref('technical')

async function handleApply() {
  try {
    const success = await settingsStore.saveConfig()
    if (success) {
      message.success('设置已保存到 config.py')
    } else {
      message.error('保存设置失败')
    }
  } catch (err) {
    message.error('保存设置失败: ' + (err as Error).message)
  }
}

async function handleReset() {
  try {
    await settingsStore.loadConfig()
    message.success('已重新加载配置')
  } catch (err) {
    message.error('重新加载配置失败: ' + (err as Error).message)
  }
}
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.settings-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e8e8e8;
}

.settings-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.dark .settings-header {
  border-bottom-color: #303030;
}

.settings-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.settings-tabs {
  height: 100%;
}

.settings-tabs :deep(.ant-tabs-nav) {
  width: 140px;
}

.settings-tabs :deep(.ant-tabs-content) {
  display: none;
}

.settings-panel {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #fff;
}

.dark .settings-panel {
  background: #1a1a1a;
}

.settings-footer {
  padding: 12px 24px;
  border-top: 1px solid #e8e8e8;
  display: flex;
  justify-content: flex-end;
}

.dark .settings-footer {
  border-top-color: #303030;
}
</style>

<style>
html.dark .settings-tabs .ant-tabs-tab {
  color: #d0d0d0 !important;
}

html.dark .settings-tabs .ant-tabs-tab:hover {
  color: #ef4444 !important;
}

html.dark .settings-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
  color: #ef4444 !important;
}

html.dark .settings-tabs .ant-tabs-ink-bar {
  background: #ef4444;
}
</style>
