<template>
  <div class="login-container">
    <!-- 动态背景气泡 -->
    <div class="bubbles">
      <div class="bubble" v-for="i in 10" :key="i" :style="getBubbleStyle(i)"></div>
    </div>
    
    <div class="login-wrapper">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="logo-icon">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" stroke-width="3" opacity="0.3"/>
              <circle cx="50" cy="50" r="35" fill="none" stroke="#fff" stroke-width="3" opacity="0.5"/>
              <circle cx="50" cy="50" r="25" fill="#fff" opacity="0.8"/>
              <text x="50" y="58" text-anchor="middle" font-size="24" fill="#0052D9" font-weight="bold">CRM</text>
            </svg>
          </div>
          <h1 class="brand-title">NO-CRM</h1>
          <p class="brand-subtitle">客户管理系统</p>
          <div class="brand-features">
            <div class="feature-item" v-for="(feature, index) in features" :key="index" :style="{ animationDelay: `${index * 0.2}s` }">
              <div class="feature-icon">✓</div>
              <span>{{ feature }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录区域 -->
      <div class="form-section">
        <t-card class="login-card" :bordered="false">
          <div class="login-header">
            <h2>欢迎回来</h2>
            <p>轻量级CRM，快速管理客户和销售机会</p>
          </div>
          
          <t-tabs v-model="activeTab" class="login-tabs">
            <t-tab-panel value="login" label="登录">
              <t-form :data="loginForm" @submit="handleLogin" label-align="top">
                <t-form-item label="邮箱" name="email">
                  <t-input v-model="loginForm.email" placeholder="请输入邮箱" size="large" />
                </t-form-item>
                <t-form-item label="密码" name="password">
                  <t-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" />
                </t-form-item>
                <t-form-item style="margin-top: 32px;">
                  <t-button theme="primary" type="submit" block size="large" :loading="loading">
                    登录
                  </t-button>
                </t-form-item>
              </t-form>
            </t-tab-panel>

            <t-tab-panel value="register" label="注册">
              <t-form :data="registerForm" @submit="handleRegister" label-align="top">
                <t-form-item label="姓名" name="name">
                  <t-input v-model="registerForm.name" placeholder="请输入姓名" size="large" />
                </t-form-item>
                <t-form-item label="邮箱" name="email">
                  <t-input v-model="registerForm.email" placeholder="请输入邮箱" size="large" />
                </t-form-item>
                <t-form-item label="密码" name="password">
                  <t-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6位）" size="large" />
                </t-form-item>
                <t-form-item label="角色" name="role">
                  <t-select v-model="registerForm.role" placeholder="请选择角色" size="large">
                    <t-option value="admin" label="管理员" />
                    <t-option value="sales" label="销售" />
                  </t-select>
                </t-form-item>
                <t-form-item style="margin-top: 32px;">
                  <t-button theme="primary" type="submit" block size="large" :loading="loading">
                    注册
                  </t-button>
                </t-form-item>
              </t-form>
            </t-tab-panel>
          </t-tabs>
        </t-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { MessagePlugin } from 'tdesign-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loading = ref(false)

const features = [
  '客户信息管理',
  '销售线索跟进',
  '任务提醒功能',
  '团队协作工具'
]

const loginForm = ref({
  email: '',
  password: ''
})

const registerForm = ref({
  name: '',
  email: '',
  password: '',
  role: 'sales' as 'admin' | 'sales'
})

const getBubbleStyle = (index: number) => {
  const size = Math.random() * 60 + 20
  const left = Math.random() * 100
  const delay = Math.random() * 5
  const duration = Math.random() * 10 + 10
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`
  }
}

const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    MessagePlugin.warning('请填写完整信息')
    return
  }

  loading.value = true
  try {
    await authStore.login(loginForm.value.email, loginForm.value.password)
    MessagePlugin.success('登录成功')
    router.push('/')
  } catch (error: any) {
    MessagePlugin.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  const { name, email, password, role } = registerForm.value
  
  if (!name || !email || !password || !role) {
    MessagePlugin.warning('请填写完整信息')
    return
  }

  if (password.length < 6) {
    MessagePlugin.warning('密码至少6位')
    return
  }

  loading.value = true
  try {
    await authStore.register(email, password, name, role)
    MessagePlugin.success('注册成功')
    router.push('/')
  } catch (error: any) {
    MessagePlugin.error(error.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0052D9 0%, #1890FF 50%, #40A9FF 100%);
  overflow: hidden;
}

/* 动态气泡效果 */
.bubbles {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.bubble {
  position: absolute;
  bottom: -100px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: rise 15s infinite ease-in;
  backdrop-filter: blur(5px);
}

@keyframes rise {
  0% {
    bottom: -100px;
    transform: translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    bottom: 110%;
    transform: translateX(100px) scale(1.3);
    opacity: 0;
  }
}

/* 主容器 */
.login-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  width: 1000px;
  min-height: 600px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧品牌区 */
.brand-section {
  flex: 1;
  background: linear-gradient(135deg, #0052D9 0%, #1890FF 100%);
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.brand-section::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.brand-section::after {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(10deg);
  }
}

.brand-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
}

.logo-icon {
  margin-bottom: 24px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.brand-title {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 12px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.brand-subtitle {
  font-size: 20px;
  opacity: 0.95;
  margin: 0 0 48px 0;
  font-weight: 300;
}

.brand-features {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  opacity: 0;
  animation: fadeInLeft 0.6s ease-out forwards;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-icon {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-weight: bold;
}

/* 右侧表单区 */
.form-section {
  flex: 1;
  padding: 60px 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  box-shadow: none;
  background: transparent;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1a1a1a;
  font-weight: 600;
}

.login-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.login-tabs {
  margin-top: 24px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .login-wrapper {
    width: 90%;
    max-width: 900px;
  }
  
  .brand-section {
    padding: 40px 30px;
  }
  
  .form-section {
    padding: 40px 30px;
  }
}

@media (max-width: 768px) {
  .login-wrapper {
    flex-direction: column;
    width: 90%;
    max-width: 500px;
  }
  
  .brand-section {
    padding: 40px 20px;
  }
  
  .brand-title {
    font-size: 36px;
  }
  
  .form-section {
    padding: 40px 30px;
  }
}
</style>
