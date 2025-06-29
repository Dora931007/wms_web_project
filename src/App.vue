
<template>
  <div id="app">
    <router-view /> 
  </div>
</template>

<script>
export default {
  name: "App",
  components: {},
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("CurUser")),
    };
  },

  //监视 Vuex store 中的 menu 状态变化  
  watch: {
    "$store.state.menu": {//当 menu 变化时执行处理函数:
      handler(val, old) {
        if (!old && this.user && this.user.no) {
          this.$store.commit("setMenu", val); //如果条件满足，提交一个名为 "setMenu" 的 mutation 来更新菜单状态
        }
      },
      immediate: true, //表示在组件创建时立即执行一次处理函数
    },
  },
};
</script>

<style>
#app {
  height: 100%;
}
</style>
