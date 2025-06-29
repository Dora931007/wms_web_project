import VueRouter from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'login',
        component: () => import('../components/Login') // 懒加载登录组件
    },
    {
        path: '/Index',// 主框架路由路径
        name: 'index',
        component: () => import('../components/Index'),
        children: [
            {
                path: '/Home',
                name: 'home',
                meta: {
                    title: '首页',
                },
                component: () => import('../components/Home'),
            },
        ]
    }
]
const router = new VueRouter({
    mode: 'history',
    routes
})



export function resetRouter() {
    // 通过替换router.matcher实现路由重置
    router.matcher = new VueRouter({
        mode:'history', //使用history模式（去掉URL中的#）
        routes: []
    }).matcher
}


/*重写VueRouter的push方法
捕获并忽略重复导航到相同路由时产生的错误
防止控制台出现 "Navigating to current location" 的警告*/
const VueRouterPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(to) {
    return VueRouterPush.call(this, to).catch(err => err)
}

export default router;

