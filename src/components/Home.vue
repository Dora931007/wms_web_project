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
    <!-- <h1 style="font-size: 50px;">{{'欢迎你！'+user.name}}</h1>
    <el-descriptions title="个人中心" :column="2" size="40" border>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-s-custom"></i>
          账号
        </template>
        {{ user.no }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-mobile-phone"></i>
          电话
        </template>
        {{ user.phone }}
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-location-outline"></i>
          性别
        </template>
        <el-tag
          :type="user.sex === '1' ? 'primary' : 'danger'"
          disable-transitions
          ><i :class="user.sex == 1 ? 'el-icon-male' : 'el-icon-female'"></i
          >{{ user.sex == 1 ? "男" : "女" }}</el-tag
        >
      </el-descriptions-item>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-tickets"></i>
          角色
        </template>
        <el-tag type="success" disable-transitions>{{
          user.roleId == 0 ? "超级管理员" : user.roleId == 1 ? "管理员" : "用户"
        }}</el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <DateUtils></DateUtils> -->
    <!-- 添加可视化组件     -->
    <goods-visualization
      :storage-data="storageData"
      :goodstype-data="goodstypeData"
      :http-url="$httpUrl"
    />
  </div>
</template>

<script>
// import DateUtils from "./DateUtils";
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