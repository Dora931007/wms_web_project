<template>
  <div
    class="dashboard-container"
    style="height: calc(100vh - 60px); overflow: hidden"
  >
    <el-row
      :gutter="15"
      style="margin-top: 15px"
    >
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
        <el-card style="height: 100%">
          <div slot="header">库存概况</div>
          <div class="stat-card" style="height: 200px">
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
        <el-card style="height: 100%">
          <div slot="header">库存分布(按物品)</div>
          <div id="goodsChart" style="height: 219px"></div>
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
    goodsData: {
      type: Array,
      default: () => [],
    },
    httpUrl: {
      type: String,
      required: true,
    },
    tableData: {
      // 新增tableData prop接收商品数据
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      // 原有数据...
      statData: {
        storageStats: [],
        typeStats: [],
        goodsStats: [],
        lowStockCount: 0,
        totalGoods: 0,
        totalStock: 0,
      },
      storageChart: null,
      typeChart: null,
      goodsChart: null,
      localStorageData: [],
      localGoodstypeData: [],
      localGoodsData: [],
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
    computedGoodsData() {
      return this.goodsData.length > 0 ? this.goodsData : this.localGoodsData;
    },
  },
  methods: {
    // 修改loadStatistics方法
    // async loadStatistics() {
    //   try {
    //     // 如果有传入的tableData，则使用本地计算
    //     if (this.tableData.length > 0) {
    //       this.calculateLocalStats();
    //     } else {
    //       // 否则从后端获取
    //       const res = await this.$axios.get(
    //         this.$httpUrl + "/goods/statistics"
    //       );
    //       if (res.data.code === 200) {
    //         this.statData = res.data.data;
    //         this.initCharts();
    //       }
    //     }
    //   } catch (error) {
    //     console.error("加载统计信息失败:", error);
    //   }
    // },

    async loadStatistics() {
      try {
        if (this.tableData.length > 0) {
          this.calculateLocalStats();
        } else {
          const res = await this.$axios.get(
            this.$httpUrl + "/goods/statistics"
          );
          if (res.data.code === 200) {
            console.log("res.data.data的值是" + res.data.data.goodsStats);

            this.statData = {
              storageStats: res.data.data.storageStats || [],
              typeStats: res.data.data.typeStats || [],
              goodsStats: res.data.data.goodsStats || [], // 确保goodsStats有默认值
              lowStockCount: res.data.data.lowStockCount || 0,
              totalGoods: res.data.data.totalGoods || 0,
              totalStock: res.data.data.totalStock || 0,
            };
            this.initCharts();
          }
        }
      } catch (error) {
        console.error("加载统计信息失败:", error);
        // 初始化空数据防止图表报错
        this.statData = {
          storageStats: [],
          typeStats: [],
          goodsStats: [], // 确保goodsStats有默认值
          lowStockCount: 0,
          totalGoods: 0,
          totalStock: 0,
        };
        this.initCharts();
      }
    },

    // 新增计算方法
    calculateLocalStats() {
      // 按仓库统计
      const storageStats = {};
      // 按分类统计
      const typeStats = {};
      // 按物品统计
      const goodsStats = {};
      // 库存预警
      let lowStockCount = 0;
      // 总库存
      let totalStock = 0;

      this.tableData.forEach((item) => {
        // 仓库统计
        if (!storageStats[item.storage]) {
          storageStats[item.storage] = 0;
        }
        storageStats[item.storage] += item.count || 0;

        // 分类统计
        if (!typeStats[item.goodstype]) {
          typeStats[item.goodstype] = 0;
        }
        typeStats[item.goodstype] += item.count || 0;

        // 物品统计
        if (!goodsStats[item.goods]) {
          goodsStats[item.goods] = 0;
        }
        goodsStats[item.goods] += item.count || 0;

        // 库存预警
        if (item.count < 10) {
          lowStockCount++;
        }

        // 总库存
        totalStock += item.count || 0;
      });

      this.statData = {
        storageStats: Object.keys(storageStats).map((key) => ({
          storage: parseInt(key),
          total: storageStats[key],
        })),
        typeStats: Object.keys(typeStats).map((key) => ({
          goodstype: parseInt(key),
          total: typeStats[key],
        })),
        goodsStats:
          Object.keys(goodsStats).map((key) => ({
            goods: parseInt(key),
            total: goodsStats[key],
          })) || [], // 确保即使为空也返回数组
        lowStockCount,
        totalGoods: this.tableData.length,
        totalStock,
      };

      this.initCharts();
    },
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
    loadLocalGoods() {
      if (this.goodsData.length === 0) {
        this.$axios
          .get(this.httpUrl + "/goods/list")
          .then((res) => res.data)
          .then((res) => {
            if (res.code == 200) {
              this.localGoodsData = res.data;
              // 转换为映射表，提高查找效率
              //this.goodsMap = new Map(res.data.data.map(item => [item.name, item]));
              this.loadStatistics();
            }
          });
      }
    },
    // 初始化图表
    initCharts() {
      // 确保数据存在
      if (!this.statData) {
        console.error("statData is undefined");
        return;
      }

      // 确保goodsStats存在，如果不存在则初始化为空数组
      //const goodsStats = this.statData.goodsStats || [];
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

      // 物品分布柱状图
      this.goodsChart = echarts.init(document.getElementById("goodsChart"));
      // 对商品数据进行排序（按库存量降序）
      const sortedGoodsStats = [...(this.statData.goodsStats || [])]
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          ...item,
          name: item.name || "未知物品", // 直接使用接口返回的name字段
        }));
      console.log("排序后的商品数据:", sortedGoodsStats);
      // 限制显示前10个商品
      const topGoodsStats = sortedGoodsStats.slice(0, 10);

      this.goodsChart.setOption({
        grid: {
          // 添加与分类图表相同的grid配置
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
          data: topGoodsStats.map((item) => item.name),
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "库存数量",
            type: "bar",
            data: topGoodsStats.map((item) => item.total),
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
    },
    // 在窗口大小变化时重新调整图表大小
    handleResize() {
      if (this.storageChart) this.storageChart.resize();
      if (this.typeChart) this.typeChart.resize();
      if (this.goodsDistributionChart) this.goodsDistributionChart.resize();
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
    if (this.goodsDistributionChart) this.goodsDistributionChart.dispose();
  },
};
</script>

<style scoped>
/* 添加一些特定样式 */
#goodsDistributionChart {
  width: 100%;
  min-height: 300px;
}
.stat-card {
  height: 100%;
  display: flex;
  justify-content: space-between;
  text-align: center;
  padding: 10px 0;
  flex-direction: column;
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
  height: calc(100% - 57px); 
  padding: 15px;
}
</style>