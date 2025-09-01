import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ControlCenterView from '../views/ControlCenterView.vue'
import DefaultResponseView from '../views/DefaultResponseView.vue'
import PresentationView from '../views/PresentationView.vue'
import RemoteDevicesView from '../views/RemoteDevicesView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
  },
  {
    path: '/control-center',
    name: 'control-center',
    component: ControlCenterView,
  },
  {
    path: '/default-response',
    name: 'default-response',
    component: DefaultResponseView,
  },
  {
    path: '/presentation',
    name: 'presentation',
    component: PresentationView,
  },
  {
    path: '/remote-devices/:gameId',
    name: 'remote-devices',
    component: RemoteDevicesView,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
