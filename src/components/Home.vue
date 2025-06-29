<template>
  <div
    style="
      text-align: center;
      background-color: #f1f1f3;
      height: 100%;
      padding: 0px;
      margin: 0px;
    "
  >
    <!-- 添加可视化组件     -->
    <goods-visualization
      :storage-data="storageData"
      :goodstype-data="goodstypeData"
      :http-url="$httpUrl"
    />
  </div>
</template>

<script>
import GoodsVisualization from "./goods/GoodsVisualization.vue";
export default {
  name: "HomePage",
  components: {  GoodsVisualization },
  data() {
    return {
      user: {},
      storageData: [],  // 新增仓库数据
      goodstypeData: [] // 新增分类数据
    };
  },
  computed: {},
  methods: {
    handleRefreshCharts() {
      // 调用 GoodsVisualization 的刷新方法
      this.$refs.goodsVisualization.loadStatistics();
    },
    init() {
      this.user = JSON.parse(sessionStorage.getItem("CurUser"));
      this.loadStorage();
      this.loadGoodsType();
    },
    loadStorage() {
      this.$axios.get(this.$httpUrl + "/storage/list")
        .then(res => res.data)
        .then(res => {
          if (res.code == 200) {
            this.storageData = res.data;
          }
        });
    },
    loadGoodsType() {
      this.$axios.get(this.$httpUrl + "/goodstype/list")
        .then(res => res.data)
        .then(res => {
          if (res.code == 200) {
            this.goodstypeData = res.data;
          }
        });
    }
  },
  created() {
    this.init();
  },
};
</script>

<style scoped>
.el-descriptions {
  width: 90%;

  margin: 0 auto;
  text-align: center;
}
</style>