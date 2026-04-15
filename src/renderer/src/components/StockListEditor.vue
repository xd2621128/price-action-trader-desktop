<template>
  <div class="stock-list-editor">
    <div class="editor-header">
      <span class="header-title">{{ mode === 'analysis' ? '技术分析' : '回测' }} - 股票列表</span>
      <a-button type="text" @click="openEditModal" title="编辑股票列表">
        <EditOutlined />
      </a-button>
    </div>

    <div class="editor-content">
      <a-textarea
        v-model:value="stockText"
        :rows="10"
        :style="{ width: textareaWidth + 'px' }"
        :placeholder="stockList.length === 0 ? '暂无股票，请点击编辑按钮添加' : ''"
        readonly
      />
    </div>

    <div class="editor-actions">
      <div class="action-buttons">
        <!-- 技术分析模式 -->
        <template v-if="mode === 'analysis'">
          <a-button v-if="!isRunning" danger @click="handleRun({ key: 'breakout' })">
            <template #icon><PlayCircleOutlined /></template>
            开始分析
          </a-button>
          <a-button v-else @click="handleStop">
            <template #icon><StopOutlined /></template>
            停止
          </a-button>
        </template>

        <!-- 回测模式 -->
        <template v-else>
          <template v-if="!isRunning">
            <a-dropdown>
              <template #overlay>
                <a-menu @click="handleRun">
                  <a-menu-item key="breakout">突破买入</a-menu-item>
                  <a-menu-item key="retrace">回调买入</a-menu-item>
                </a-menu>
              </template>
              <a-button danger>
                <PlayCircleOutlined />
                回测
                <DownOutlined />
              </a-button>
            </a-dropdown>
          </template>
          <a-button v-else @click="handleStop">
            <template #icon><StopOutlined /></template>
            停止
          </a-button>
        </template>
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑股票列表"
      width="500px"
      :ok-button-props="{ danger: true }"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSaveEdit"
      @cancel="handleCancelEdit"
    >
      <div class="edit-modal-content">
        <p class="edit-tip">每行一个股票代码，格式: 600519, 000858</p>
        <a-textarea
          v-model:value="editStockText"
          :rows="12"
          placeholder="输入股票代码，每行一个"
        />
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { EditOutlined, PlayCircleOutlined, StopOutlined, DownOutlined } from '@ant-design/icons-vue'

const props = defineProps<{
  mode: 'analysis' | 'backtest'
  stockList: string[]
  isRunning: boolean
}>()

const emit = defineEmits<{
  'update:stockList': [list: string[]]
  'update:width': [width: number]
  run: [mode: 'breakout' | 'retrace']
  stop: []
}>()

const stockText = ref('')
const textareaWidth = ref(280)
const editModalVisible = ref(false)
const editStockText = ref('')

// 计算 textarea 宽度：根据最长股票代码 + padding
function calculateWidth(list: string[]) {
  const longest = list.reduce((max, code) => code.length > max ? code.length : max, 0)
  // 每个字符约 8.4px (Consolas 14px)
  const width = Math.max(120, longest * 8.4 + 24)
  textareaWidth.value = Math.min(width, 300) // 最大 300px
  // 面板宽度 = textarea宽度 + header左右padding(24) + 按钮区域(约80)
  emit('update:width', textareaWidth.value + 104)
}

watch(() => props.stockList, (newList) => {
  stockText.value = newList.join('\n')
  calculateWidth(newList)
}, { immediate: true })

function openEditModal() {
  editStockText.value = props.stockList.join('\n')
  editModalVisible.value = true
}

function handleSaveEdit() {
  const list = editStockText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')

  // 验证格式 (6位数字)
  const invalidCode = list.find(code => !/^\d{6}$/.test(code))
  if (invalidCode) {
    return // Ant Design Modal 会自动处理 validation
  }

  emit('update:stockList', list)
  editModalVisible.value = false
}

function handleCancelEdit() {
  editModalVisible.value = false
}

function handleRun(e: { key: string }) {
  const mode = e.key as 'breakout' | 'retrace'
  if (props.stockList.length === 0) {
    return
  }
  emit('run', mode)
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

.dark .editor-header :deep(.ant-btn-text) {
  color: #8c8c8c;
}

.dark .editor-header :deep(.ant-btn-text:hover) {
  color: #ef4444;
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

.edit-modal-content {
  padding: 8px 0;
}

.edit-tip {
  margin-bottom: 8px;
  color: #999;
  font-size: 12px;
}

.dark .edit-modal-content .edit-tip {
  color: #666;
}

.dark .edit-modal-content :deep(.ant-input) {
  background: #2d2d2d;
  color: #e8e8e8;
  border-color: #404040;
}
</style>
