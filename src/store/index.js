import vue from 'vue'
import Vuex from 'vuex'
import router,{resetRouter} from "../router";
import  createPersistedState from 'vuex-persistedstate';
vue.use(Vuex)

/**
 * 动态添加新路由
 * menuList - 从后端获取的菜单列表
 */
function addNewRoute(menuList) {
    // 确保 menuList 是数组
    if (!Array.isArray(menuList)) {
        console.error('menuList 不是数组:', menuList);
        return;
    }
    
    console.log('菜单列表:', menuList);
    // 获取当前路由配置
    let routes = router.options.routes;
    
    routes.forEach(routeItem => {
        if(routeItem.path == "/Index") {
            // 遍历菜单列表，为每个菜单项创建路由
            menuList.forEach(menu => {
                // 校验菜单项的必要属性
                if (!menu.menuclick || !menu.menuname || !menu.menucomponent) {
                    console.error('菜单项缺少必要属性:', menu);
                    return;
                }
                
                // 创建子路由配置对象
                let childRoute = {
                    path: '/' + menu.menuclick, // 路由路径
                    name: menu.menuname,        // 路由名称
                    meta: {                     // 路由元信息
                        title: menu.menuname    // 页面标题
                    },
                    component: () => import('../components/' + menu.menucomponent)
                };
                // 将子路由添加到/Index的子路由中
                routeItem.children.push(childRoute);
            });
        }
    });
    // 重置路由，添加新的路由配置
    resetRouter();
    router.addRoutes(routes);
}

export default new Vuex.Store({
    state: {
        menu: [] // 存储菜单列表
    },
    mutations: {
        //设置菜单列表并动态添加路由
        setMenu(state,menuList) {
            state.menu = menuList
            addNewRoute(menuList) // 设置菜单时自动添加路由
        }
    },
    getters: {
        // 获取菜单列表
        getMenu(state) {
            return state.menu 
        }
    },

    // 使用vuex-persistedstate插件实现状态持久化
    plugins:[createPersistedState()] 
})

