# 常见问题与最佳实践

## 📚 导航

[← 数据大屏开发](./04-数据大屏开发.md) | [返回项目概览](./01-项目概览.md)

---

## 🚨 环境配置问题

### Q1: 启动后端时报错 "Cannot find module"

**问题描述**：
```
Error: Cannot find module '@nestjs/core'
```

**解决方案**：
```bash
# 删除 node_modules 和 package-lock.json
cd backend
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install
```

---

### Q2: 前端启动失败，提示端口被占用

**问题描述**：
```
Port 5173 is already in use
```

**解决方案**：

**方法1**：杀死占用端口的进程
```bash
# macOS/Linux
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**方法2**：修改端口
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5174  // 改用其他端口
  }
})
```

---

### Q3: TypeScript 类型错误

**问题描述**：
```
Property 'xxx' does not exist on type 'xxx'
```

**解决方案**：

1. **重启 VS Code TypeScript 服务器**
   - `Cmd/Ctrl + Shift + P`
   - 输入 "TypeScript: Restart TS Server"

2. **检查 tsconfig.json 配置**
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true  // 跳过库文件检查
  }
}
```

3. **添加类型声明**
```typescript
// 临时解决
const req: any = ...

// 正确方式
interface RequestWithUser extends Request {
  user: User
}
const req: RequestWithUser = ...
```

---

## 🔐 认证与权限问题

### Q4: 登录后仍然跳转到登录页

**原因分析**：
- Token 未正确保存
- 路由守卫逻辑错误
- Token 已过期

**解决方案**：

```typescript
// 检查 localStorage
console.log(localStorage.getItem('token'))
console.log(localStorage.getItem('user'))

// 检查路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  authStore.initAuth()  // 确保初始化
  
  console.log('Is Authenticated:', authStore.isAuthenticated())
  console.log('Target Path:', to.path)
  
  // ... 守卫逻辑
})
```

---

### Q5: API 请求返回 401 未授权

**检查清单**：

1. **Token 是否存在**
```typescript
const token = localStorage.getItem('token')
console.log('Token:', token)
```

2. **请求头是否正确**
```typescript
// api/index.ts
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  console.log('Adding token:', token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

3. **Token 格式是否正确**
```
正确格式：Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Q6: 普通用户看到了其他人的数据

**原因**：权限控制未生效

**解决方案**：

检查后端 Service 层：
```typescript
findAll(userId: string, userRole: string): Customer[] {
  const customers = this.storageService.read<Customer>('customers');
  
  // ✅ 确保有权限过滤
  if (userRole === 'admin') {
    return customers;
  }
  
  // ✅ 销售只能看自己的
  return customers.filter(customer => customer.ownerId === userId);
}
```

---

## 💾 数据存储问题

### Q7: 数据保存后刷新页面就消失了

**原因分析**：
- JSON 文件未正确写入
- 文件路径错误
- 数据格式错误

**解决方案**：

1. **检查 data 目录**
```bash
ls -la data/
# 应该看到 customers.json, leads.json 等文件
```

2. **查看 JSON 文件内容**
```bash
cat data/customers.json
```

3. **检查文件权限**
```bash
chmod 755 data/
```

4. **添加调试日志**
```typescript
// json-storage.service.ts
write<T>(fileName: string, data: T[]): void {
  const filePath = this.getFilePath(fileName);
  console.log('Writing to:', filePath);
  console.log('Data:', JSON.stringify(data, null, 2));
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log('Write successful');
}
```

---

### Q8: JSON 文件内容格式错误

**问题描述**：
```json
[{"id":"1","name":"张三"}{id":"2","name":"李四"}]  // ❌ 缺少逗号
```

**解决方案**：

手动修复或删除文件：
```bash
# 删除损坏的文件
rm data/customers.json

# 系统会自动创建新文件
```

---

## 🎨 前端界面问题

### Q9: TDesign 组件样式不生效

**原因**：样式未正确引入

**解决方案**：

```typescript
// main.ts
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'  // ✅ 确保引入

app.use(TDesign)
```

---

### Q10: 表格数据不显示

**检查清单**：

1. **数据格式是否正确**
```typescript
// ✅ 应该是数组
const customers = ref<Customer[]>([])

// ❌ 不应该是对象
const customers = ref<Customer>({})
```

2. **列配置是否正确**
```typescript
const columns = [
  { colKey: 'name', title: '姓名' },  // colKey 要与数据字段对应
  { colKey: 'phone', title: '电话' }
]
```

3. **row-key 是否设置**
```vue
<t-table
  :data="customers"
  :columns="columns"
  row-key="id"  <!-- ✅ 必须设置 -->
/>
```

---

### Q11: 对话框关闭后数据未清空

**问题描述**：
关闭对话框后再次打开，仍显示上次的数据

**解决方案**：

```vue
<script setup lang="ts">
const visible = ref(false)
const formData = ref({ name: '', phone: '' })

const handleClose = () => {
  // ✅ 关闭时清空数据
  formData.value = { name: '', phone: '' }
  visible.value = false
}
</script>

<t-dialog
  v-model:visible="visible"
  @close="handleClose"
>
  <!-- ... -->
</t-dialog>
```

---

## 📊 数据大屏问题

### Q12: Echarts 图表不显示

**常见原因**：

1. **容器高度为 0**
```css
/* ✅ 必须设置高度 */
.chart-content {
  height: 300px;
}
```

2. **数据格式错误**
```typescript
// ❌ 错误
series: [{ data: { x: 1, y: 2 } }]

// ✅ 正确
series: [{ data: [1, 2, 3] }]
```

3. **未等待 DOM 渲染完成**
```typescript
// ❌ 错误
const chart = echarts.init(chartRef.value)

// ✅ 正确
onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
  }
})
```

---

### Q13: 图表响应式失效

**解决方案**：

```typescript
const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)  // ✅ 记得清理
})
```

---

## 🐛 调试技巧

### 后端调试

```typescript
// 1. 打印日志
console.log('User ID:', userId);
console.log('Customers:', customers);

// 2. 查看请求参数
@Post()
create(@Body() dto: CreateCustomerDto, @Request() req: any) {
  console.log('DTO:', dto);
  console.log('User:', req.user);
  // ...
}

// 3. 捕获错误
try {
  await someAsyncOperation();
} catch (error) {
  console.error('Error:', error);
  throw error;
}
```

### 前端调试

```typescript
// 1. 控制台输出
console.log('Data:', data)
console.table(customers.value)

// 2. Vue DevTools
// 安装浏览器插件后，可以查看：
// - 组件状态
// - Pinia store
// - 路由信息

// 3. 网络请求
// 打开浏览器 DevTools → Network 标签
// 查看请求和响应

// 4. 断点调试
debugger  // 代码会在这里暂停
```

---

## 💡 最佳实践

### 代码组织

```typescript
// ✅ 按功能分组
const { user, login, logout } = useAuthStore()
const customers = ref<Customer[]>([])
const loading = ref(false)

const loadCustomers = async () => { /* ... */ }
const handleCreate = async () => { /* ... */ }

onMounted(() => {
  loadCustomers()
})

// ❌ 混乱的代码
const a = ref(1)
const b = () => {}
const c = ref(2)
const d = () => {}
```

### 错误处理

```typescript
// ✅ 友好的错误提示
try {
  await customerApi.create(data)
  MessagePlugin.success('创建成功')
} catch (error: any) {
  const message = error.response?.data?.message || '创建失败'
  MessagePlugin.error(message)
  console.error('Create error:', error)
}

// ❌ 不处理错误
await customerApi.create(data)
```

### 类型安全

```typescript
// ✅ 使用 TypeScript 类型
interface Customer {
  id: string
  name: string
  phone: string
}

const customers = ref<Customer[]>([])

// ❌ 使用 any
const customers: any = []
```

### 性能优化

```typescript
// ✅ 避免不必要的重新渲染
const filteredCustomers = computed(() => {
  return customers.value.filter(c => c.name.includes(keyword.value))
})

// ❌ 在模板中过滤
<div v-for="customer in customers.filter(c => c.name.includes(keyword))">
```

---

## 🔒 安全建议

### 1. 密码安全

```typescript
// ✅ 使用 bcrypt 加密
import * as bcrypt from 'bcrypt'

const hashedPassword = await bcrypt.hash(password, 10)
const isValid = await bcrypt.compare(inputPassword, hashedPassword)

// ❌ 明文存储
const user = { password: '123456' }
```

### 2. Token 管理

```typescript
// ✅ 设置过期时间
JwtModule.register({
  secret: 'your-secret-key',
  signOptions: { expiresIn: '24h' }
})

// ✅ 使用环境变量
const secret = process.env.JWT_SECRET || 'default-secret'
```

### 3. 输入验证

```typescript
// ✅ 使用 class-validator
export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  name: string;
}

// ❌ 不验证
create(@Body() dto: any) { /* ... */ }
```

---

## 📝 开发检查清单

### 添加新功能前

- [ ] 理解需求，画出流程图
- [ ] 设计数据模型
- [ ] 确定 API 接口
- [ ] 准备测试数据

### 编码时

- [ ] 使用 TypeScript 类型
- [ ] 添加必要的注释
- [ ] 处理错误情况
- [ ] 遵循代码规范

### 提交代码前

- [ ] 测试所有功能
- [ ] 检查控制台是否有错误
- [ ] 格式化代码
- [ ] 编写清晰的提交信息

### 部署前

- [ ] 构建生产版本
- [ ] 测试生产环境
- [ ] 备份数据
- [ ] 准备回滚方案

---

## 🆘 获取帮助

### 查看文档

1. [项目概览](./01-项目概览.md)
2. [后端开发指南](./02-后端开发指南.md)
3. [前端开发指南](./03-前端开发指南.md)
4. [数据大屏开发](./04-数据大屏开发.md)

### 在线资源

- [NestJS 官方文档](https://nestjs.bootcss.com/)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [TDesign 组件库](https://tdesign.tencent.com/vue-next/overview)
- [Echarts 文档](https://echarts.apache.org/zh/index.html)
- [Stack Overflow](https://stackoverflow.com/)

### 调试工具

- Chrome DevTools
- Vue DevTools
- Postman
- VS Code Debugger

---

## 💬 常用命令速查

### 后端

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run build && npm run start:prod

# 测试
npm run test
```

### 前端

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 预览
npm run preview
```

### Git

```bash
# 查看状态
git status

# 提交代码
git add .
git commit -m "feat: 添加新功能"
git push

# 撤销修改
git checkout -- <file>
git reset --hard HEAD
```

---

## 🎓 学习路径建议

### 初级开发者

1. 熟悉 TypeScript 基础
2. 学习 Vue 3 Composition API
3. 了解 NestJS 模块化架构
4. 掌握 RESTful API 设计

### 中级开发者

1. 深入理解响应式原理
2. 掌握状态管理（Pinia）
3. 学习图表可视化（Echarts）
4. 了解性能优化技巧

### 进阶方向

1. 微服务架构
2. 数据库集成（MySQL/MongoDB）
3. 单元测试和 E2E 测试
4. CI/CD 部署流程

---
