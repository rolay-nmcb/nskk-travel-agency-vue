<template>
  <div class="statistics-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h1 class="page-title">营业数据统计</h1>
      <div class="time-filter">
        <el-button 
          :class="{ active: activeTime === 'today' }" 
          @click="activeTime = 'today'"
          size="small"
        >
          今日
        </el-button>
        <el-button 
          :class="{ active: activeTime === 'yesterday' }" 
          @click="activeTime = 'yesterday'"
          size="small"
        >
          昨日
        </el-button>
        <el-button 
          :class="{ active: activeTime === 'week' }" 
          @click="activeTime = 'week'"
          size="small"
        >
          近一周
        </el-button>
        <el-button 
          :class="{ active: activeTime === 'month' }" 
          @click="activeTime = 'month'"
          size="small"
        >
          近一个月
        </el-button>
      </div>
    </div>

    <!-- 核心数据卡片 -->
    <div class="stats-cards">
      <el-card class="stat-card">
        <div class="card-icon order-icon">
          <i class="el-icon-s-order"></i>
        </div>
        <div class="card-content">
          <div class="card-title">完成订单数</div>
          <div class="card-value">{{ currentStats.orderCount }}</div>
          <div class="card-change" :class="currentStats.orderTrend > 0 ? 'up' : 'down'">
            <i :class="currentStats.orderTrend > 0 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
            {{ currentStats.orderTrend > 0 ? '+' : '' }}{{ currentStats.orderTrend*100 }}%
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="card-icon revenue-icon">
          <i class="el-icon-money"></i>
        </div>
        <div class="card-content">
          <div class="card-title">总营业额 (元)</div>
          <div class="card-value">{{ currentStats.revenue.toLocaleString() }}</div>
          <div class="card-change" :class="currentStats.revenueTrend > 0 ? 'up' : 'down'">
            <i :class="currentStats.revenueTrend > 0 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
            {{ currentStats.revenueTrend > 0 ? '+' : '' }}{{ currentStats.revenueTrend*100 }}%
          </div>
        </div>
      </el-card>
      
      <el-card class="stat-card">
        <div class="card-icon average-icon">
          <i class="el-icon-shopping-cart"></i>
        </div>
        <div class="card-content">
          <div class="card-title">平均订单金额 (元)</div>
          <div class="card-value">{{ currentStats.averageOrder.toLocaleString() }}</div>
          <div class="card-change" :class="currentStats.averageTrend > 0 ? 'up' : 'down'">
            <i :class="currentStats.averageTrend > 0 ? 'el-icon-caret-top' : 'el-icon-caret-bottom'"></i>
            {{ currentStats.averageTrend > 0 ? '+' : '' }}{{ currentStats.averageTrend*100 }}%
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 近七日销售额折线图 -->
      <el-card class="chart-card">
        <div slot="header" class="chart-header">
          <span>近七日销售额趋势</span>
          <el-tooltip content="展示最近7天的销售额变化情况">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </div>
        <div class="chart-wrapper">
          <div ref="salesTrendChart" class="chart"></div>
        </div>
      </el-card>

      <!-- 近12个月销售额折线图 -->
      <el-card class="chart-card">
        <div slot="header" class="chart-header">
          <span>近12个月销售额趋势</span>
          <el-tooltip content="展示最近12个月的销售额变化情况">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </div>
        <div class="chart-wrapper">
          <div ref="monthlySalesChart" class="chart"></div>
        </div>
      </el-card>

      <!-- 最畅销产品TOP5 -->
      <el-card class="chart-card">
        <div slot="header" class="chart-header">
          <span>最畅销产品TOP5</span>
          <el-tooltip content="展示订单量最高的5款产品">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </div>
        <div class="chart-wrapper">
          <div ref="topProductsChart" class="chart"></div>
        </div>
      </el-card>

      <!-- 评分低于2.5的产品 -->
      <el-card class="chart-card">
        <div slot="header" class="chart-header">
          <span>评分低于2.5的产品</span>
          <el-tooltip content="展示评分较低的产品及其订单量">
            <i class="el-icon-info"></i>
          </el-tooltip>
        </div>
        <div class="chart-wrapper">
          <div ref="lowRatingChart" class="chart"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup name="statistics">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getCurrentInstance } from 'vue';
import {getSalesDatas,getSevenDaysSalesDatas,getTwelveMonthSalesDatas,getSalesTop5Products,getLowScoreProducts} from '@/api/manage/statistics';
import * as echarts from 'echarts';

const { proxy } = getCurrentInstance();
const route = useRoute();

// 时间筛选状态
const activeTime = ref('today');

// 统计数据
const statsData = ref();

function getStatsData() {
  getSalesDatas().then(res => {
    statsData.value = res.data;
  });
}

// 近七日销售额数据
const sevenDaysSales = ref()

// 修改getSevenDaysSales方法，添加回调或使用async/await
async function getSevenDaysSales() {
  const res = await getSevenDaysSalesDatas()
  sevenDaysSales.value = res.data;
  // 数据加载完成后再初始化图表
  initSalesTrendChart();
}

// 近12个月销售额数据
const monthlySales = ref()

async function getMonthlySales() {
  const res = await getTwelveMonthSalesDatas()
  monthlySales.value = res.data;
  // 数据加载完成后再初始化图表
  initMonthlySalesChart();
}


// 最畅销产品TOP5
const topProducts = ref();

//获取最畅销产品TOP5
async function getTopProducts() {
  const res = await getSalesTop5Products()
  topProducts.value = res.data;
  // 数据加载完成后再初始化图表
  initTopProductsChart();
}

// 评分低于2.5的产品
const lowRatingProducts = ref();

//获取评分低于2.5的产品
async function getLowRatingProducts() {
  const res = await getLowScoreProducts()
  lowRatingProducts.value = res.data;
  // 数据加载完成后再初始化图表
  initLowRatingChart();
}


// 当前显示的统计数据
const currentStats = computed(() => {
  // 增加兜底，避免statsData未初始化时报错
  if (!statsData.value) {
    return {
      orderCount: 0,
      revenue: 0,
      averageOrder: 0,
      orderTrend: 0,
      revenueTrend: 0,
      averageTrend: 0
    };
  }
  
  if(activeTime.value === 'today') return statsData.value.today;
  if(activeTime.value === 'yesterday') return statsData.value.yesterday;
  if(activeTime.value === 'week') return statsData.value.week;
  if(activeTime.value === 'month') return statsData.value.month;
});

// 图表实例
const salesTrendChart = ref(null);
const monthlySalesChart = ref(null);
const topProductsChart = ref(null);
const lowRatingChart = ref(null);

// 初始化折线图 - 近七日销售额
const initSalesTrendChart = () => {
  const chart = echarts.init(salesTrendChart.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}元'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sevenDaysSales.value?.dates || []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 元'
      }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: sevenDaysSales.value?.sales || [],
        smooth: true,
        lineStyle: {
          width: 3
        },
        itemStyle: {
          radius: 6
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(64, 158, 255, 0.3)'
            }, {
              offset: 1, color: 'rgba(64, 158, 255, 0)'
            }]
          }
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  // 响应窗口大小变化
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 初始化折线图 - 近12个月销售额
const initMonthlySalesChart = () => {
  const chart = echarts.init(monthlySalesChart.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}元'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: monthlySales.value?.dates || []
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 元'
      }
    },
    series: [
      {
        name: '月销售额',
        type: 'line',
        data: monthlySales.value?.sales || [],
        smooth: true,
        lineStyle: {
          width: 3,
          color: '#67C23A'
        },
        itemStyle: {
          color: '#67C23A',
          radius: 6
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: 'rgba(103, 194, 58, 0.3)'
            }, {
              offset: 1, color: 'rgba(103, 194, 58, 0)'
            }]
          }
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 初始化柱状图 - 最畅销产品TOP5
const initTopProductsChart = () => {
  const chart = echarts.init(topProductsChart.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 单'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} 单'
      }
    },
    yAxis: {
      type: 'category',
      data: topProducts.value?.names || [],
      inverse: true
    },
    series: [
      {
        name: '订单量',
        type: 'bar',
        data: topProducts.value?.sales || [],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409EFF' },
            { offset: 1, color: '#69b1ff' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c} 单'
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 初始化柱状图 - 低评分产品
const initLowRatingChart = () => {
  const chart = echarts.init(lowRatingChart.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: lowRatingProducts.value?.names || []
    },
    yAxis: [
      {
        type: 'value',
        name: '订单量',
        position: 'left',
        axisLabel: {
          formatter: '{value} 单'
        }
      },
      {
        type: 'value',
        name: '评分',
        position: 'right',
        min: 0,
        max: 5,
        interval: 1,
        axisLabel: {
          formatter: '{value} 分'
        }
      }
    ],
    series: [
      {
        name: '订单量',
        type: 'bar',
        data: lowRatingProducts.value?.sales || [],
        itemStyle: {
          color: '#F56C6C'
        }
      },
      {
        name: '评分',
        type: 'line',
        yAxisIndex: 1,
        data: lowRatingProducts.value?.ratings || [],
        lineStyle: {
          color: '#E6A23C'
        },
        itemStyle: {
          color: '#E6A23C',
          radius: 6
        },
        label: {
          show: true,
          formatter: '{c} 分'
        }
      }
    ]
  };
  
  chart.setOption(option);
  
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

// 页面加载时初始化图表
onMounted(() => {
  getStatsData();
  getSevenDaysSales();
  getMonthlySales();
  getTopProducts();
  getLowRatingProducts();
  
  // 监听时间筛选变化，更新数据展示
  activeTime.value = 'today';
});
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.time-filter {
  display: flex;
  gap: 8px;
}

.time-filter .el-button {
  padding: 6px 16px;
  border-radius: 20px;
  transition: all 0.2s ease;
}

.time-filter .active {
  background-color: #409EFF;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 数据卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  height: 100%;
  padding: 16px;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.order-icon {
  background: linear-gradient(135deg, #409EFF, #69b1ff);
}

.revenue-icon {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.average-icon {
  background: linear-gradient(135deg, #E6A23C, #f3d19e);
}

.card-content {
  flex-grow: 1;
}

.card-title {
  color: #666;
  font-size: 14px;
  margin-bottom: 6px;
}

.card-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  line-height: 1.2;
}

.card-change {
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-change.up {
  color: #67C23A;
}

.card-change.down {
  color: #F56C6C;
}

/* 图表区域样式 */
.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 一行显示两个图表 */
  gap: 20px;
}

.chart-card {
  height: 100%;
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 500;
  color: #333;
}

.chart-header i {
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.chart-header i:hover {
  color: #409EFF;
}

.chart-wrapper {
  width: 100%;
  height: 320px;
  padding: 10px 0;
}

.chart {
  width: 100%;
  height: 100%;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr 1fr;
  }
  
  .chart-wrapper {
    height: 280px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-wrapper {
    height: 240px;
  }
  
  .time-filter {
    flex-wrap: wrap;
  }
  
  .card-value {
    font-size: 22px;
  }
}
</style>