<template>
  <div class="settings-form">
    <h3>关于/帮助</h3>
    <a-form layout="vertical">
      <a-form-item>
        <template #label>
          <span class="label-text">应用版本</span>
        </template>
        <a-input :value="appVersion" readonly />
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="label-text">项目说明</span>
        </template>
        <a-button type="link" @click="showReadme = true">查看 README</a-button>
      </a-form-item>

      <a-form-item>
        <template #label>
          <span class="label-text">免责声明</span>
        </template>
        <a-alert
          type="warning"
          show-icon
          message="重要提示"
          description="本应用仅供技术分析和回测参考，不构成任何投资建议。股票交易存在风险，盈亏自负。使用本应用进行交易决策需自行承担风险。"
        />
      </a-form-item>
    </a-form>

    <!-- README 弹框 -->
    <a-modal
      v-model:open="showReadme"
      title="README"
      width="800px"
      :footer="null"
    >
      <div class="readme-content">
        <h1>Price Action Trader</h1>
        <p>基于价格行为交易的自动化分析工具</p>

        <h2>功能特点</h2>
        <ul>
          <li>Pinbar 形态识别</li>
          <li>均线系统分析</li>
          <li>支撑阻力位识别</li>
          <li>历史回测功能</li>
          <li>实时系统通知</li>
        </ul>

        <h2>使用方法</h2>
        <ol>
          <li>在技术分析或回测页面添加股票代码</li>
          <li>配置分析或回测参数</li>
          <li>点击开始分析/回测按钮</li>
          <li>查看日志输出和分析结果</li>
        </ol>

        <h2>注意事项</h2>
        <ul>
          <li>本工具仅供学习和研究使用</li>
          <li>实盘交易前请充分测试和验证</li>
          <li>遵守相关法律法规和交易规则</li>
        </ul>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const appVersion = '1.0.0'
const showReadme = ref(false)
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

.readme-content {
  max-height: 60vh;
  overflow-y: auto;
}

.readme-content h1 {
  font-size: 24px;
  margin-bottom: 8px;
}

.readme-content h2 {
  font-size: 18px;
  margin-top: 24px;
  margin-bottom: 12px;
}

.readme-content p {
  color: #666;
}

.readme-content ul,
.readme-content ol {
  padding-left: 24px;
}

.readme-content li {
  margin-bottom: 8px;
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
