import router from './index'
import Auth from '@/auth'
import Config from '@/config/index'
import store from '@/store'
import User from '@/json/user'
import Home from '@/views/home'

router.beforeEach((to, from, next) => {
  if (Auth.getToken()) { // 判断是否登录
    if (store.state.user.dynamicRouters.length === 0) {
      addRouter(next, to)
    } else {
      next()
    }
  } else {
    if (Config.ROUTER_WHITE_LIST.indexOf(to.path) > -1) { // 判断是否在白名单中
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
    }
  }
})

export const addRouter = (next, to) => {
  let rootRouter = {
    path: '/',
    name: 'home',
    component: () => import('@/views/home'),
    redirect: 'index',
    children: convertRouter(User.routers)
  }
  // let r = convertRouter(User.routers)
  // rootRouter.children = r
  store.dispatch('setDynamicRouters', User.routers)
  router.addRoutes([rootRouter])
  next({ ...to, replace: true })
}

export const convertRouter = (routers) => { // 遍历后台传来的路由字符串，转换为组件对象
  const rtnRouters = routers.filter(router => {
    if (router.component) {
      const component = router.component
      router.component = loadComponent(component)
    }
    if (router.children && router.children.length) {
      router.children = convertRouter(router.children)
    }
    return true
  })
  return rtnRouters
}

export const loadComponent = (viewPath) => {
  return () => import('@/views/' + viewPath)
}

// export const filter = (next, to) => {

// }
