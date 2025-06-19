<template>
  <div
    class="dashboard-container"
    style="height: calc(100vh - 60px); overflow: hidden"
  >
    <el-row :gutter="15" style="margin-top: 15px">
      <el-col :span="12">
        <el-card>
          <div slot="header">库存分布(按仓库)</div>
          <div id="storageChart" style="height: 200px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header">库存分布(按分类)</div>
          <div id="typeChart" style="height: 200px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="15" style="margin-top: 15px">
      <el-col :span="8">
        <el-card>
          <div slot="header">库存概况</div>
          <div class="stat-card">
            <div class="stat-item" style="flex: 1; min-width: 100px">
              <div class="stat-label">商品总数</div>
              <div class="stat-value">{{ statData.totalGoods }}</div>
            </div>
            <div class="stat-item" style="flex: 1; min-width: 100px">
              <div class="stat-label">库存总量</div>
              <div class="stat-value">{{ statData.totalStock }}</div>
            </div>
            <div class="stat-item" style="flex: 1; min-width: 100px">
              <div class="stat-label">库存预警</div>
              <div class="stat-value warning">{{ statData.lowStockCount }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <div slot="header">库存趋势</div>
          <div id="trendChart" style="height: 200px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from "echarts";

export default {
  props: {
    storageData: {
      type: Array,
      default: () => [],
    },
    goodstypeData: {
      type: Array,
      default: () => [],
    },
    httpUrl: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // 原有数据...
      statData: {
        storageStats: [],
        typeStats: [],
        lowStockCount: 0,
        totalGoods: 0,
        totalStock: 0,
      },
      storageChart: null,
      typeChart: null,
      trendChart: null,
      localStorageData: [],
      localGoodstypeData: [],
    };
  },
  computed: {
    computedStorageData() {
      return this.storageData.length > 0
        ? this.storageData
        : this.localStorageData;
    },
    computedGoodstypeData() {
      return this.goodstypeData.length > 0
        ? this.goodstypeData
        : this.localGoodstypeData;
    },
  },
  methods: {
    // 加载本地数据的方法
    loadLocalStorage() {
      if (this.storageData.length === 0) {
        this.$axios
          .get(this.httpUrl + "/storage/list")
          .then((res) => res.data)
          .then((res) => {
            if (res.code == 200) {
              this.localStorageData = res.data;
              this.loadStatistics();
            }
          });
      }
    },
    loadLocalGoodsType() {
      if (this.goodstypeData.length === 0) {
        this.$axios
          .get(this.httpUrl + "/goodstype/list")
          .then((res) => res.data)
          .then((res) => {
            if (res.code == 200) {
              this.localGoodstypeData = res.data;
              this.loadStatistics();
            }
          });
      }
    },

    // 加载统计数据
    loadStatistics() {
      this.$axios.get(this.$httpUrl + "/goods/statistics").then((res) => {
        if (res.data.code === 200) {
          this.statData = res.data.data;
          this.initCharts();
        }
      });
    },

    // 初始化图表
    initCharts() {
      // 仓库分布饼图
      this.storageChart = echarts.init(document.getElementById("storageChart"));
      this.storageChart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        legend: {
          orient: "vertical",
          right: 10,
          top: "center",
          data: this.statData.storageStats.map((item) => {
            return (
              this.storageData.find((s) => s.id == item.storage)?.name ||
              "未知仓库"
            );
          }),
        },
        series: [
          {
            name: "库存数量",
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "18",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: this.statData.storageStats.map((item) => {
              return {
                value: item.total,
                name:
                  this.storageData.find((s) => s.id == item.storage)?.name ||
                  "未知仓库",
              };
            }),
          },
        ],
      });

      // 分类分布柱状图
      this.typeChart = echarts.init(document.getElementById("typeChart"));
      this.typeChart.setOption({
        grid: {
          top: 30,
          bottom: 20,
          left: 50,
          right: 20,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
          data: this.statData.typeStats.map((item) => {
            return (
              this.goodstypeData.find((t) => t.id == item.goodstype)?.name ||
              "未知分类"
            );
          }),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "库存数量",
            type: "bar",
            data: this.statData.typeStats.map((item) => item.total),
            barWidth: "50%",
            itemStyle: {
              color: function (params) {
                const colorList = [
                  "#c23531",
                  "#2f4554",
                  "#61a0a8",
                  "#d48265",
                  "#91c7ae",
                ];
                return colorList[params.dataIndex % colorList.length];
              },
            },
          },
        ],
      });

      // 库存趋势图(从后端获取历史数据)
      this.trendChart = echarts.init(document.getElementById("trendChart"));
      this.trendChart.setOption({
        grid: {
          top: 30,
          bottom: 20,
          left: 50,
          right: 20,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["入库", "出库", "库存"],
        },
        xAxis: {
          type: "category",
          data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "入库",
            type: "line",
            lineStyle: { width: 2 }, // 调整线条粗细
            symbolSize: 6, // 调整数据点大小
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: "出库",
            type: "line",
            lineStyle: { width: 2 }, // 调整线条粗细
            symbolSize: 6, // 调整数据点大小
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: "库存",
            type: "line",
            lineStyle: { width: 2 }, // 调整线条粗细
            symbolSize: 6, // 调整数据点大小
            data: [150, 232, 201, 154, 190, 330, 410],
          },
        ],
      });
    },

    // 在窗口大小变化时重新调整图表大小
    handleResize() {
      if (this.storageChart) this.storageChart.resize();
      if (this.typeChart) this.typeChart.resize();
      if (this.trendChart) this.trendChart.resize();
    },
  },
  mounted() {
    if (this.storageData.length === 0) {
      this.loadLocalStorage();
    }
    if (this.goodstypeData.length === 0) {
      this.loadLocalGoodsType();
    }
    this.loadStatistics();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.storageChart) this.storageChart.dispose();
    if (this.typeChart) this.typeChart.dispose();
    if (this.trendChart) this.trendChart.dispose();
  },
};
</script>

<style scoped>
.stat-card {
  display: flex;
  justify-content: space-between;
  text-align: center;
  padding: 10px 0;
}

.stat-item {
  padding: 5px 10px;
  margin: 0 5px;
  border-radius: 4px;
  background-color: #f8f8f8;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
}

.stat-value.warning {
  color: #f56c6c;
}

/* 卡片标题样式 */
.el-card__header {
  padding: 12px 20px;
  font-size: 14px;
  font-weight: bold;
}

.el-card__body {
  padding: 15px;
}
</style>