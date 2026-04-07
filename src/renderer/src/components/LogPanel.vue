<template>
  <div class="log-panel">
    <div class="log-header">
      <span class="log-title">日志</span>
      <a-space>
        <a-button size="small" type="text" @click="handleClear" title="清空日志">
          <ClearOutlined />
        </a-button>
      </a-space>
    </div>
    <div ref="logContainer" class="log-content">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="log-line"
        :class="{ error: log.startsWith('[ERROR]') }"
      >
        {{ log }}
      </div>
      <div v-if="logs.length === 0" class="log-empty">
        暂无日志
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ClearOutlined } from '@ant-design/icons-vue'

defineProps<{
  logs: string[]
}>()

const emit = defineEmits<{
  clear: []
}>()

const logContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  })
}

function handleClear() {
  emit('clear')
}

// 监听 logs 变化自动滚动
watch(() => logContainer.value, () => {
  scrollToBottom()
})

defineExpose({
  scrollToBottom
})
</script>

<style scoped>
.log-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fafafa;
  border-left: 1px solid #e8e8e8;
  min-width: 200px;
}

.dark .log-panel {
  background: #141414;
  border-left-color: #303030;
}

.log-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px;
  padding: 0 12px;
  flex-shrink: 0;
}

.log-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: #e8e8e8;
}

.dark .log-header::after {
  background: #303030;
}

.log-title {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.dark .log-title {
  color: #e8e8e8;
}

.dark .log-header :deep(.ant-btn-text) {
  color: #8c8c8c;
}

.dark .log-header :deep(.ant-btn-text:hover) {
  color: #ef4444;
}

.dark .log-header :deep(.anticon) {
  color: #8c8c8c;
}

.dark .log-header :deep(.ant-btn-text:hover .anticon) {
  color: #ef4444;
}

.log-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-line {
  color: #333;
}

.dark .log-line {
  color: #ccc;
}

.log-line.error {
  color: #ff4d4f;
}

.log-empty {
  color: #999;
  text-align: center;
  padding: 20px;
}
</style>
