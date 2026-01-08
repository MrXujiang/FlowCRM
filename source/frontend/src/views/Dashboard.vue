<template>
  <div class="dashboard-page">
    <div class="dashboard-header">
      <h1>数据大屏</h1>
      <div class="refresh-info">
        <span>最后更新：{{ lastUpdateTime }}</span>
        <t-button theme="primary" size="small" @click="refreshData" :loading="loading">
          <template #icon><t-icon name="refresh" /></template>
          刷新数据
        </t-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card" v-for="(stat, index) in statsCards" :key="index" :style="{ animationDelay: `${index * 0.1}s` }">
        <div class="stat-icon" :style="{ background: stat.color }">
          <t-icon :name="stat.icon" size="32px" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 第一行 -->
      <div class="chart-row">
        <div class="chart-card chart-large">
          <div class="chart-header">
            <h3>最近7天数据趋势</h3>
          </div>
          <div ref="trendChartRef" class="chart-content"></div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>线索阶段分布</h3>
          </div>
          <div ref="leadStageChartRef" class="chart-content"></div>
        </div>
      </div>

      <!-- 第二行 -->
      <div class="chart-row">
        <div class="chart-card">
          <div class="chart-header">
            <h3>任务优先级分布</h3>
          </div>
          <div ref="taskPriorityChartRef" class="chart-content"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>任务状态</h3>
          </div>
          <div ref="taskStatusChartRef" class="chart-content"></div>
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3>跟进方式分布</h3>
          </div>
          <div ref="activityTypeChartRef" class="chart-content"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { statisticsApi, type StatisticsData } from '@/api/statistics'
import { MessagePlugin } from 'tdesign-vue-next'

const loading = ref(false)
const lastUpdateTime = ref('')
const statsData = ref<StatisticsData | null>(null)

const trendChartRef = ref<HTMLElement>()
const leadStageChartRef = ref<HTMLElement>()
const taskPriorityChartRef = ref<HTMLElement>()
const taskStatusChartRef = ref<HTMLElement>()
const activityTypeChartRef = ref<HTMLElement>()

let trendChart: echarts.ECharts | null = null
let leadStageChart: echarts.ECharts | null = null
let taskPriorityChart: echarts.ECharts | null = null
let taskStatusChart: echarts.ECharts | null = null
let activityTypeChart: echarts.ECharts | null = null

const statsCards = ref([
  { icon: 'user', label: '客户总数', value: 0, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { icon: 'chart-line', label: '线索总数', value: 0, color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { icon: 'time', label: '跟进记录', value: 0, color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { icon: 'bulletpoint', label: '任务总数', value: 0, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
])

const stageLabels: Record<string, string> = {
  uncontacted: '未跟进',
  contacted: '跟进中',
  qualified: '已合格',
  converted: '已成交',
  invalid: '无效'
}

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高'
}

const statusLabels: Record<string, string> = {
  todo: '待办',
  completed: '已完成'
}

const typeLabels: Record<string, string> = {
  call: '电话',
  email: '邮件',
  meeting: '会议',
  other: '其他'
}

const loadData = async () => {
  loading.value = true
  try {
    statsData.value = await statisticsApi.getOverview()
    
    // 更新统计卡片
    statsCards.value[0].value = statsData.value.totalCustomers
    statsCards.value[1].value = statsData.value.totalLeads
    statsCards.value[2].value = statsData.value.totalActivities
    statsCards.value[3].value = statsData.value.totalTasks
    
    // 更新时间
    lastUpdateTime.value = new Date().toLocaleString('zh-CN')
    
    // 初始化图表
    initCharts()
  } catch (error) {
    MessagePlugin.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadData()
}

const initCharts = () => {
  if (!statsData.value) return

  // 趋势图
  if (trendChartRef.value) {
    if (trendChart) trendChart.dispose()
    trendChart = echarts.init(trendChartRef.value)
    trendChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      legend: {
        data: ['客户', '线索'],
        top: 10
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: statsData.value.recentTrend.map(t => t.date),
        axisLine: { lineStyle: { color: '#999' } }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [
        {
          name: '客户',
          type: 'line',
          smooth: true,
          data: statsData.value.recentTrend.map(t => t.customers),
          itemStyle: { color: '#667eea' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
            ])
          }
        },
        {
          name: '线索',
          type: 'line',
          smooth: true,
          data: statsData.value.recentTrend.map(t => t.leads),
          itemStyle: { color: '#f5576c' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(245, 87, 108, 0.3)' },
              { offset: 1, color: 'rgba(245, 87, 108, 0.05)' }
            ])
          }
        }
      ]
    })
  }

  // 线索阶段饼图
  if (leadStageChartRef.value) {
    if (leadStageChart) leadStageChart.dispose()
    leadStageChart = echarts.init(leadStageChartRef.value)
    leadStageChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          data: statsData.value.leadsByStage.map(item => ({
            name: stageLabels[item.stage] || item.stage,
            value: item.count
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}\n{d}%'
          }
        }
      ],
      color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
    })
  }

  // 任务优先级柱状图
  if (taskPriorityChartRef.value) {
    if (taskPriorityChart) taskPriorityChart.dispose()
    taskPriorityChart = echarts.init(taskPriorityChartRef.value)
    taskPriorityChart.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: statsData.value.tasksByPriority.map(item => priorityLabels[item.priority] || item.priority),
        axisLine: { lineStyle: { color: '#999' } }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#999' } },
        splitLine: { lineStyle: { color: '#f0f0f0' } }
      },
      series: [
        {
          type: 'bar',
          data: statsData.value.tasksByPriority.map(item => ({
            value: item.count,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#4facfe' },
                { offset: 1, color: '#00f2fe' }
              ])
            }
          })),
          barWidth: '60%'
        }
      ]
    })
  }

  // 任务状态环形图
  if (taskStatusChartRef.value) {
    if (taskStatusChart) taskStatusChart.dispose()
    taskStatusChart = echarts.init(taskStatusChartRef.value)
    taskStatusChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)'
      },
      legend: {
        bottom: 10,
        left: 'center'
      },
      series: [
        {
          type: 'pie',
          radius: ['50%', '70%'],
          center: ['50%', '45%'],
          data: statsData.value.tasksByStatus.map(item => ({
            name: statusLabels[item.status] || item.status,
            value: item.count
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      color: ['#fac858', '#91cc75']
    })
  }

  // 跟进方式雷达图
  if (activityTypeChartRef.value) {
    if (activityTypeChart) activityTypeChart.dispose()
    activityTypeChart = echarts.init(activityTypeChartRef.value)
    
    const maxValue = Math.max(...statsData.value.activitiesByType.map(item => item.count), 1)
    
    activityTypeChart.setOption({
      tooltip: {
        trigger: 'item'
      },
      radar: {
        indicator: statsData.value.activitiesByType.map(item => ({
          name: typeLabels[item.type] || item.type,
          max: maxValue
        })),
        radius: '60%',
        center: ['50%', '50%']
      },
      series: [
        {
          type: 'radar',
          data: [
            {
              value: statsData.value.activitiesByType.map(item => item.count),
              name: '跟进方式',
              areaStyle: {
                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                  { offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
                  { offset: 1, color: 'rgba(56, 249, 215, 0.1)' }
                ])
              },
              lineStyle: {
                color: '#43e97b'
              }
            }
          ]
        }
      ]
    })
  }
}

// 响应式调整
const handleResize = () => {
  trendChart?.resize()
  leadStageChart?.resize()
  taskPriorityChart?.resize()
  taskStatusChart?.resize()
  activityTypeChart?.resize()
}

onMounted(() => {
  loadData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  leadStageChart?.dispose()
  taskPriorityChart?.dispose()
  taskStatusChart?.dispose()
  activityTypeChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  background: #f5f5f5;
  min-height: calc(100vh - 64px);
  padding: 24px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.refresh-info {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #666;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

/* 图表容器 */
.charts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.chart-large {
  grid-column: span 2;
}

.chart-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-header {
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.chart-content {
  height: 300px;
}

/* 响应式 */
@media (max-width: 1200px) {
  .chart-large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>
