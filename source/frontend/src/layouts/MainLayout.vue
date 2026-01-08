<template>
  <t-layout style="height: 100vh;">
    <t-aside :width="200">
      <div class="logo">NO-CRM</div>
      <t-menu :value="activeMenu" @change="handleMenuChange">
        <t-menu-item value="dashboard">
          <template #icon><t-icon name="dashboard" /></template>
          数据大屏
        </t-menu-item>
        <t-menu-item value="customers">
          <template #icon><t-icon name="user" /></template>
          客户管理
        </t-menu-item>
        <t-menu-item value="leads">
          <template #icon><t-icon name="chart-line" /></template>
          线索管理
        </t-menu-item>
        <t-menu-item value="activities">
          <template #icon><t-icon name="time" /></template>
          跟进记录
        </t-menu-item>
        <t-menu-item value="tasks">
          <template #icon><t-icon name="bulletpoint" /></template>
          任务管理
        </t-menu-item>
      </t-menu>
    </t-aside>

    <t-layout>
      <t-header>
        <div class="header-content">
          <div class="header-title">{{ getPageTitle() }}</div>
          <div class="header-user">
            <span>{{ authStore.user?.name }}</span>
            <t-button theme="default" size="small" @click="handleLogout" style="margin-left: 16px;">
              退出登录
            </t-button>
          </div>
        </div>
      </t-header>

      <t-content style="padding: 24px;">
        <router-view />
      </t-content>
    </t-layout>
  </t-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = ref('dashboard')

watch(() => route.name, (newName) => {
  if (newName) {
    activeMenu.value = newName.toString().toLowerCase()
  }
}, { immediate: true })

const handleMenuChange = (value: string) => {
  router.push(`/${value}`)
}

const handleLogout = () => {
  authStore.logout()
  MessagePlugin.success('已退出登录')
  router.push('/login')
}

const getPageTitle = () => {
  const titles: Record<string, string> = {
    dashboard: '数据大屏',
    customers: '客户管理',
    leads: '线索管理',
    activities: '跟进记录',
    tasks: '任务管理'
  }
  return titles[activeMenu.value] || 'NO-CRM'
}
</script>

<style scoped>
.logo {
  height: 64px;
  line-height: 64px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background: #0052d9;
}

.header-content {
  height: 64px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-title {
  font-size: 18px;
  font-weight: 500;
}

.header-user {
  display: flex;
  align-items: center;
}
</style>
