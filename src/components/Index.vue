<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-aside :width="aside_witdh" style="height: 100vh; background-color: rgb(238, 241, 246);margin-left: -1px;">
            <AsidePage :isCollapse="isCollapse"></AsidePage>
        </el-aside>

        <el-container style="height: 100%;">
            <el-header style="text-align: right; font-size: 12px;height: 100%;border-bottom: rgba(168,168,168,0.3) 1px solid;">
                <HeaderPage> @doCollapse="doCollapse" :icon="icon"</HeaderPage>
            </el-header>

            <el-main style="height: 100%;">
               <!-- <MainPage></MainPage> -->
                <router-view/>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import AsidePage from "./Aside";
    import HeaderPage from "./Header";


    export default {
        name: "IndexPage",
        components:{AsidePage,HeaderPage},
        data(){
            return {
                isCollapse:false,
                aside_witdh:'200px',
                icon:'el-icon-s-fold'
            }
        },
        methods:{
            doCollapse(){
                console.log("doCollapse..")

                this.isCollapse = !this.isCollapse
                if(!this.isCollapse){// 展开
                    this.aside_witdh='200px'
                    this.icon='el-icon-s-fold'
                }else{//关起、关闭、收起
                    this.aside_witdh='64px'
                    this.icon='el-icon-s-unfold'
                }
            }
        }
    }
</script>

<style scoped>
    .el-header {
        background-color: #B3C0D1;
        color: #333;
        line-height: 60px;
    }
    .el-main{
        padding: 5px;
    }
    .el-aside {
        color: #333;
    }
</style>