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
        <el-card>
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
    // 仓库数据
    storageData: {
      type: Array,
      default: () => [],
    },
    // 商品类型数据
    goodstypeData: {
      type: Array,
      default: () => [],
    },
    // 商品数据
    goodsData: {
      type: Array,
      default: () => [],
    },
    // 表格数据
    tableData: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      statData: {
        // 统计数据
        storageStats: [], // 按仓库统计
        typeStats: [], // 按分类统计
        goodsStats: [], // 按物品统计
        lowStockCount: 0, // 低库存数量
        totalGoods: 0, // 商品总数
        totalStock: 0, // 库存总量
      },
      storageChart: null, // 仓库图表实例
      typeChart: null, // 分类图表实例
      goodsChart: null, // 物品图表实例
      localStorageData: [], // 本地仓库数据缓存
      localGoodstypeData: [], // 本地分类数据缓存
      localGoodsData: [], // 本地商品数据缓存
    };
  },
  computed: {
    // 计算最终的仓库数据(优先使用props传入的数据)
    computedStorageData() {
      return this.storageData.length > 0
        ? this.storageData
        : this.localStorageData;
    },
    // 计算最终的分类数据
    computedGoodstypeData() {
      return this.goodstypeData.length > 0
        ? this.goodstypeData
        : this.localGoodstypeData;
    },
    // 计算最终的商品数据
    computedGoodsData() {
      return this.goodsData.length > 0 ? this.goodsData : this.localGoodsData;
    },
  },
  methods: {
    // 加载统计数据
    async loadStatistics() {
      try {
        if (this.tableData.length > 0) {
          // 如果有表格数据，则本地计算统计信息
          this.calculateLocalStats();
        } else {
          // 否则从API获取统计信息
          const res = await this.$axios.get(
            this.$httpUrl + "/goods/statistics"
          );
          if (res.data.code === 200) {
            this.statData = {
              storageStats: res.data.data.storageStats || [],
              typeStats: res.data.data.typeStats || [],
              goodsStats: res.data.data.goodsStats || [],
              lowStockCount: res.data.data.lowStockCount || 0,
              totalGoods: res.data.data.totalGoods || 0,
              totalStock: res.data.data.totalStock || 0,
            };
            this.initCharts(); // 初始化图表
          }
        }
      } catch (error) {
        console.error("加载统计信息失败:", error);
        // 始化空数据防止图表报错
        this.statData = {
          storageStats: [],
          typeStats: [],
          goodsStats: [],
          lowStockCount: 0,
          totalGoods: 0,
          totalStock: 0,
        };
        this.initCharts();
      }
    },

    //本地计算统计信息
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

      // 遍历表格数据计算各项统计
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

      // 更新统计数据
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

    //加载本地仓库数据
    loadLocalStorage() {
      if (this.storageData.length === 0) {
        this.$axios
          .get(this.$httpUrl + "/storage/list")
          .then((res) => res.data)
          .then((res) => {
            if (res.code == 200) {
              this.localStorageData = res.data;
              this.loadStatistics();
            }
          });
      }
    },

    // 加载本地分类数据
    loadLocalGoodsType() {
      if (this.goodstypeData.length === 0) {
        this.$axios
          .get(this.$httpUrl + "/goodstype/list")
          .then((res) => res.data)
          .then((res) => {
            if (res.code == 200) {
              this.localGoodstypeData = res.data;
              this.loadStatistics();
            }
          });
      }
    },

    // 加载本地物品数据
    loadLocalGoods() {
      if (this.goodsData.length === 0) {
        this.$axios
          .get(this.$httpUrl + "/goods/list")
          .then((res) => res.data)
          .then((res) => {
            if (res.code == 200) {
              this.localGoodsData = res.data;
              this.loadStatistics();
            }
          });
      }
    },

    // 初始化所有图表
    initCharts() {
      if (!this.statData) {
        console.error("statData is undefined");
        return;
      }
      // 初始化仓库分布饼图
      this.initStorageChart();

      // 初始化分类分布柱状图
      this.initTypeChart();

      // 初始化物品分布柱状图
      this.initGoodsChart();
    },

    /**
     * 初始化仓库库存分布饼图
     * 展示各仓库库存量占比情况
     */
    initStorageChart() {
      this.storageChart = echarts.init(document.getElementById("storageChart"));
      this.storageChart.setOption({
        // 设置图表配置项
        tooltip: {
          // 提示框配置 提示框内容格式
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },

        // 图例配置
        legend: {
          orient: "vertical",
          right: 10,
          top: "center",
          // 图例数据，通过仓库统计数据生成
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
            type: "pie", // 饼图类型
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,

            itemStyle: {
              // 图形样式
              borderRadius: 10,
              borderColor: "#fff",
              borderWidth: 2,
            },

            label: {
              // 标签配置
              show: false,
              position: "center",
            },

            emphasis: {
              // 高亮状态下的样式
              label: {
                show: true,
                fontSize: "18",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false, // 不显示标签引导线
            },

            // 饼图数据
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
    },

    /**
     * 初始化商品分类库存分布柱状图
     * 展示各类别商品的库存量对比
     */
    initTypeChart() {
      this.typeChart = echarts.init(document.getElementById("typeChart"));
      // 对分类数据进行排序（按库存量降序）并映射名称
      const sortedTypeStats = [...(this.statData.typeStats || [])]
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          ...item,
          name:
            this.goodstypeData.find((t) => t.id == item.goodstype)?.name || "未知分类",
        }));

      // 设置图表配置项
      this.typeChart.setOption({
        grid: {
          // 网格配置
          top: 30,
          bottom: 20,
          left: 50,
          right: 20,
        },
        tooltip: {
          // 提示框配置
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          // X轴配置
          type: "category",
          data: sortedTypeStats.map((item) => item.name),
          axisLabel: {
            interval: 0, // 确保所有标签都显示
          },
        },
        yAxis: {
          // Y轴配置
          type: "value",
        },
        series: [
          {
            name: "库存数量",
            type: "bar", // 柱状图类型
            data: sortedTypeStats.map((item) => item.total),
            barWidth: "50%",
            itemStyle: {
              // 图形样式
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

    /**
     * 初始化商品库存分布柱状图
     * 展示各具体商品的库存量对比（仅显示前10）
     */
    initGoodsChart() {
      this.goodsChart = echarts.init(document.getElementById("goodsChart"));
      // 对商品数据进行排序（按库存量降序）并映射名称
      const sortedGoodsStats = [...(this.statData.goodsStats || [])]
        .sort((a, b) => b.total - a.total)
        .map((item) => ({
          ...item,
          name: item.name || "未知物品",
        }));
      // 限制只显示前10个商品
      const topGoodsStats = sortedGoodsStats.slice(0, 10);

      // 设置图表配置项
      this.goodsChart.setOption({
        grid: { // 网格配置
          top: 30,
          bottom: 20,
          left: 50,
          right: 20,
        },
        tooltip: {// 提示框配置
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        xAxis: {
          type: "category",
          data: topGoodsStats.map((item) => item.name),
          axisLabel: {
            interval: 0, // 强制显示所有标签
          },
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
  },

//生命周期钩子 执行时机：组件DOM挂载完成后
  mounted() { 
   // 如果props中没有传入storageData，则调用本地加载方法
    if (this.storageData.length === 0) {
      this.loadLocalStorage();
    }
    if (this.goodstypeData.length === 0) {
      this.loadLocalGoodsType();
    }
    this.loadStatistics();
  },

  //生命周期钩子 执行时机：组件销毁前
  //组件销毁前清理 销毁所有ECharts实例，释放资源
  beforeDestroy() {
    if (this.storageChart) this.storageChart.dispose(); 
    if (this.typeChart) this.typeChart.dispose();
    if (this.goodsChart) this.goodsChart.dispose();
  },
};
</script>

<style scoped>
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