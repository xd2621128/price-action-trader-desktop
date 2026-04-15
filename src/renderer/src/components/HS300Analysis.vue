<template>
  <div class="stock-list-editor">
    <div class="editor-header">
      <span class="header-title">沪深300分析</span>
    </div>

    <div class="editor-content">
      <a-textarea
        v-model:value="stockText"
        :rows="10"
        :style="{ width: textareaWidth + 'px' }"
        :placeholder="stockList.length === 0 ? '暂无股票，请检查 stock_300_list.txt 文件' : ''"
        readonly
      />
    </div>

    <div class="editor-actions">
      <div class="action-buttons">
        <a-button v-if="!isRunning" danger @click="handleRun">
          <template #icon><PlayCircleOutlined /></template>
          开始分析
        </a-button>
        <a-button v-else @click="handleStop">
          <template #icon><StopOutlined /></template>
          停止
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  stockList: string[]
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:width': [width: number]
  run: []
  stop: []
}>()

const stockText = ref('')
const textareaWidth = ref(280)

// 计算 textarea 宽度：根据最长股票代码 + padding
function calculateWidth(list: string[]) {
  const longest = list.reduce((max, code) => code.length > max ? code.length : max, 0)
  const width = Math.max(120, longest * 8.4 + 24)
  textareaWidth.value = Math.min(width, 300)
  emit('update:width', textareaWidth.value + 104)
}

watch(() => props.stockList, (newList) => {
  stockText.value = newList.join('\n')
  calculateWidth(newList)
}, { immediate: true })

function handleRun() {
  if (props.stockList.length === 0) {
    return
  }
  emit('run')
}

function handleStop() {
  emit('stop')
}
</script>

<style scoped>
.stock-list-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-header {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 0 0 12px;
  flex-shrink: 0;
  box-sizing: border-box;
}

.editor-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8e8e8;
}

.dark .editor-header::after {
  background: #303030;
}

.editor-header .header-title {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.dark .editor-header .header-title {
  color: #e8e8e8;
}

.editor-content {
  flex: 1;
  overflow: hidden;
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-content :deep(.ant-input) {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  width: 100%;
  min-width: 200px;
  height: 100%;
  resize: none;
  display: flex;
  flex: 1;
}

.editor-content :deep(.ant-input textarea) {
  white-space: nowrap;
  overflow-x: auto;
  resize: none;
  flex: 1;
}

.dark .editor-content :deep(.ant-input) {
  background: #2d2d2d;
  color: #e8e8e8;
  border-color: #404040;
}

.editor-actions {
  padding: 12px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.dark .editor-actions {
  border-top-color: #303030;
  background: #141414;
}

.editor-actions :deep(.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  width: 100%;
}

.action-buttons :deep(.ant-btn),
.action-buttons :deep(.ant-dropdown-button) {
  flex: 1;
}

.action-buttons :deep(.ant-dropdown-button) {
  display: inline-flex;
}

.action-buttons :deep(.ant-dropdown-button .ant-btn) {
  flex: 1;
}

.action-buttons :deep(.ant-dropdown .anticon) {
  margin-right: 4px;
}

.action-buttons :deep(.ant-dropdown .anticon:last-child) {
  margin-right: 0;
  margin-left: 4px;
  font-size: 10px;
}
</style>
