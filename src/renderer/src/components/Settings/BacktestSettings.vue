<template>
  <div class="settings-form">
    <h3>时间范围</h3>
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="label-text">开始日期</span>
            </template>
            <a-date-picker v-model:value="form.startDate" style="width: 100%" />
            <template #error v-if="dateError.start">开始日期不能大于结束日期</template>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item>
            <template #label>
              <span class="label-text">结束日期</span>
            </template>
            <a-date-picker v-model:value="form.endDate" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <h3>回测频率</h3>
    <a-form layout="vertical">
      <a-form-item>
        <template #label>
          <span class="label-text">K线周期</span>
        </template>
        <a-radio-group v-model:value="form.frequency">
          <a-radio-button value="daily">日线</a-radio-button>
          <a-radio-button value="weekly">周线</a-radio-button>
          <a-radio-button value="monthly">月线</a-radio-button>
        </a-radio-group>
      </a-form-item>
    </a-form>

    <h3>资金参数</h3>
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item>
            <template #label>
              <span class="label-text">初始资金</span>
            </template>
            <a-input-number v-model:value="form.initialCapital" :min="0" :step="10000" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item>
            <template #label>
              <span class="label-text">佣金费率 (%)</span>
            </template>
            <a-input-number v-model:value="form.commissionRate" :min="0" :max="10" :step="0.001" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item>
            <template #label>
              <span class="label-text">印花税率 (%)</span>
            </template>
            <a-input-number v-model:value="form.stampRate" :min="0" :max="10" :step="0.001" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>

    <h3>风控参数</h3>
    <a-form layout="vertical">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item>
            <template #label>
              <a-space>
                <span class="label-text">单笔风险比例 (%)</span>
                <a-popover title="说明" placement="top">
                  <template #content>
                    <p style="margin: 0; max-width: 250px;">单笔交易最大亏损占资金的比例</p>
                  </template>
                  <QuestionCircleOutlined class="label-help-icon" />
                </a-popover>
              </a-space>
            </template>
            <a-input-number v-model:value="form.singleRiskRatio" :min="0" :max="100" :step="0.1" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item>
            <template #label>
              <a-space>
                <span class="label-text">总风险敞口上限 (%)</span>
                <a-popover title="说明" placement="top">
                  <template #content>
                    <p style="margin: 0; max-width: 250px;">同时持仓的最大风险敞口</p>
                  </template>
                  <QuestionCircleOutlined class="label-help-icon" />
                </a-popover>
              </a-space>
            </template>
            <a-input-number v-model:value="form.maxRiskExposure" :min="0" :max="100" :step="1" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item>
            <template #label>
              <a-space>
                <span class="label-text">移动止损 (%)</span>
                <a-popover title="说明" placement="top">
                  <template #content>
                    <p style="margin: 0; max-width: 250px;">跟踪止损的百分比</p>
                  </template>
                  <QuestionCircleOutlined class="label-help-icon" />
                </a-popover>
              </a-space>
            </template>
            <a-input-number v-model:value="form.trailingStop" :min="0" :max="50" :step="0.1" style="width: 100%" />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const form = reactive({
  startDate: dayjs().subtract(1, 'year'),
  endDate: dayjs(),
  frequency: 'daily' as 'daily' | 'weekly' | 'monthly',
  initialCapital: 1000000,
  commissionRate: 0.03,
  stampRate: 0.1,
  singleRiskRatio: 2,
  maxRiskExposure: 10,
  trailingStop: 2
})

const dateError = computed(() => {
  if (!form.startDate || !form.endDate) return { start: false, end: false }
  return {
    start: form.startDate.isAfter(form.endDate),
    end: form.endDate.isBefore(form.startDate)
  }
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
