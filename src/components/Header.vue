<template>
  <div style="display: flex; line-height: 60px">
    <div style="flex: 1; text-align: center; font-size: 34px">
      <span>欢迎来到仓库管理系统</span>
    </div>
    <el-dropdown>
      <span>{{ user.name }}</span
      ><i class="el-icon-arrow-down" style="margin-left: 10px"></i>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<script>
export default {
  name: "HeaderPage",
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("CurUser")),
    };
  },
  methods: {
    toUser() {
      console.log("to_user");
      this.$router.push("/Home");
    },
    logout() {
      console.log("logout");

      this.$confirm("您确定要退出登录吗?", "退出登录", {
        confirmButtonText: "确定", //确认按钮的文字显示
        type: "warning",
        center: true, 
      })
        .then(() => {
          this.$message({
            type: "success",
            message: "退出登录成功",
          });

          this.$router.push("/");
          sessionStorage.clear();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消退出登录",
          });
        });
    },
  },
};
</script>

<style scoped>
</style>