<template>
  <div class="left-sidebar">
    <div class="nav-items">
      <a-tooltip placement="right" :title="currentView === 'analysis' ? '技术分析 (当前)' : '点击切换到技术分析'">
        <div
          class="nav-item"
          :class="{ active: currentView === 'analysis' }"
          @click="handleClick('analysis')"
        >
          <SlidersOutlined />
        </div>
      </a-tooltip>

      <a-tooltip placement="right" :title="currentView === 'backtest' ? '回测 (当前)' : '点击切换到回测'">
        <div
          class="nav-item"
          :class="{ active: currentView === 'backtest' }"
          @click="handleClick('backtest')"
        >
          <FundOutlined />
        </div>
      </a-tooltip>

      <a-tooltip placement="right" :title="currentView === 'hs300' ? '沪深300分析 (当前)' : '点击切换到沪深300分析'">
        <div
          class="nav-item"
          :class="{ active: currentView === 'hs300' }"
          @click="handleClick('hs300')"
        >
          <BankOutlined />
        </div>
      </a-tooltip>
    </div>

    <div class="nav-bottom">
      <a-tooltip placement="right" :title="currentView === 'settings' ? '设置 (当前)' : '点击切换到设置'">
        <div
          class="nav-item"
          :class="{ active: currentView === 'settings' }"
          @click="handleClick('settings')"
        >
          <SettingOutlined />
        </div>
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SlidersOutlined, FundOutlined, SettingOutlined, BankOutlined } from '@ant-design/icons-vue'
import type { ViewType } from '../types'

defineProps<{
  currentView: ViewType
}>()

const emit = defineEmits<{
  changeView: [view: ViewType]
}>()

function handleClick(view: ViewType) {
  emit('changeView', view)
}
</script>

<style scoped>
.left-sidebar {
  width: 60px;
  height: 100%;
  background: #f5f5f5;
  border-right: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 12px 0;
}

.dark .left-sidebar {
  background: #1f1f1f;
  border-right-color: #303030;
}

.nav-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.nav-item {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
  font-size: 20px;
}

.nav-item :deep(.anticon) {
  color: inherit;
}

.dark .nav-item {
  color: #8c8c8c;
}

.nav-item:hover {
  background: #e8e8e8;
  color: #ef4444;
}

.dark .nav-item:hover {
  background: #2d2d2d;
  color: #ef4444;
}

.nav-item.active {
  background: #ef4444;
  color: #fff;
}

.nav-item.active :deep(.anticon) {
  color: #fff;
}

.nav-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 隐藏设置按钮 */
/* .nav-bottom .nav-item { */
  /* display: none; */
/* } */
</style>
