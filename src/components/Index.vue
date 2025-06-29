<template>
  <el-container style="height: 100%; border: 1px solid #eee">
    <el-aside
      :width="aside_witdh"
      style="
        height: 100vh;
        background-color: rgb(238, 241, 246);
        margin-left: -1px;
      "
    >
      <AsidePage></AsidePage>
    </el-aside>

    <el-container style="height: 100%">
      <el-header
        style="
          text-align: right;
          font-size: 12px;
          height: 100%;
          border-bottom: rgba(168, 168, 168, 0.3) 1px solid;
        "
      >
        <HeaderPage></HeaderPage>
      </el-header>

      <el-main style="height: 100%">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import AsidePage from "./Aside";
import HeaderPage from "./Header";

export default {
  name: "IndexPage",
  components: { AsidePage, HeaderPage },
  data() {
    return {
      aside_witdh: "200px",
    };
  },
  methods: {},
  created() {
    // 检查当前是否在首页，否则跳转
    if (this.$route.path !== "/Home") {
      this.$router.replace("/Home");
    }
  },
};
</script>

<style scoped>
.el-header {
  background-color: #b3c0d1;
  color: #333;
  line-height: 60px;
}
.el-main {
  padding: 5px;
}
.el-aside {
  color: #333;
}
</style>