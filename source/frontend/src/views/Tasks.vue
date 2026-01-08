<template>
  <div class="tasks-page">
    <div class="page-header">
      <t-space>
        <t-radio-group v-model="filterStatus" @change="loadTasks">
          <t-radio-button value="">全部</t-radio-button>
          <t-radio-button value="todo">待办</t-radio-button>
          <t-radio-button value="completed">已完成</t-radio-button>
        </t-radio-group>
        <t-button theme="primary" @click="showCreateDialog = true">
          <template #icon><t-icon name="add" /></template>
          新建任务
        </t-button>
        <t-button theme="warning" @click="loadDueSoon">
          <template #icon><t-icon name="time" /></template>
          即将到期 ({{ dueSoonTasks.length }})
        </t-button>
        <t-button theme="default" @click="showMockDialog = true">
          <template #icon><t-icon name="tools" /></template>
          Mock数据
        </t-button>
      </t-space>
    </div>

    <t-table
      :data="tasks"
      :columns="columns"
      :loading="loading"
      row-key="id"
      stripe
      hover
    >
      <template #status="{ row }">
        <t-tag :theme="row.status === 'completed' ? 'success' : 'warning'" variant="light">
          {{ row.status === 'completed' ? '已完成' : '待办' }}
        </t-tag>
      </template>

      <template #priority="{ row }">
        <t-tag :theme="getPriorityTheme(row.priority)" variant="light">
          {{ getPriorityLabel(row.priority) }}
        </t-tag>
      </template>

      <template #dueDate="{ row }">
        <span :class="{ 'overdue': isOverdue(row.dueDate) && row.status === 'todo' }">
          {{ formatDate(row.dueDate) }}
        </span>
      </template>
      
      <template #action="{ row }">
        <t-space>
          <t-link
            v-if="row.status === 'todo'"
            theme="success"
            @click="handleToggleStatus(row)"
          >
            完成
          </t-link>
          <t-link
            v-else
            theme="primary"
            @click="handleToggleStatus(row)"
          >
            重新打开
          </t-link>
          <t-link theme="primary" @click="handleEdit(row)">编辑</t-link>
          <t-popconfirm content="确定删除此任务吗？" @confirm="handleDelete(row.id)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <t-pagination
        v-model="pagination.current"
        v-model:pageSize="pagination.pageSize"
        :total="pagination.total"
        :pageSizeOptions="[10, 20, 50, 100]"
        show-jumper
        @change="handlePageChange"
      />
    </div>

    <!-- 创建/编辑对话框 -->
    <t-dialog
      v-model:visible="showCreateDialog"
      :header="editingTask ? '编辑任务' : '新建任务'"
      width="600px"
      @confirm="handleSubmit"
      @close="handleCloseDialog"
    >
      <t-form :data="formData" label-align="right" :label-width="100">
        <t-form-item label="任务标题" name="title">
          <t-input v-model="formData.title" placeholder="请输入任务标题" />
        </t-form-item>
        <t-form-item label="任务描述" name="description">
          <t-textarea
            v-model="formData.description"
            placeholder="请输入任务描述（可选）"
            :autosize="{ minRows: 3 }"
          />
        </t-form-item>
        <t-form-item label="截止时间" name="dueDate">
          <t-date-picker
            v-model="formData.dueDate"
            enable-time-picker
            placeholder="请选择截止时间"
            style="width: 100%;"
          />
        </t-form-item>
        <t-form-item label="优先级" name="priority">
          <t-select v-model="formData.priority" placeholder="请选择优先级">
            <t-option value="low" label="低" />
            <t-option value="medium" label="中" />
            <t-option value="high" label="高" />
          </t-select>
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 即将到期对话框 -->
    <t-dialog
      v-model:visible="showDueSoonDialog"
      header="即将到期的任务"
      width="700px"
      :footer="false"
    >
      <t-list v-if="dueSoonTasks.length > 0" :split="true">
        <t-list-item v-for="task in dueSoonTasks" :key="task.id">
          <t-list-item-meta>
            <template #title>
              <t-space>
                <span>{{ task.title }}</span>
                <t-tag :theme="getPriorityTheme(task.priority)" variant="light" size="small">
                  {{ getPriorityLabel(task.priority) }}
                </t-tag>
              </t-space>
            </template>
            <template #description>
              {{ task.description || '无描述' }}
            </template>
          </t-list-item-meta>
          <template #action>
            <t-tag theme="warning">{{ formatDate(task.dueDate) }}</t-tag>
          </template>
        </t-list-item>
      </t-list>
      <t-empty v-else description="暂无即将到期的任务" />
    </t-dialog>

    <!-- Mock数据对话框 -->
    <t-dialog
      v-model:visible="showMockDialog"
      header="Mock数据管理"
      width="500px"
      @confirm="handleMockConfirm"
    >
      <t-form label-align="right" :label-width="100">
        <t-form-item label="生成数量">
          <t-input-number v-model="mockCount" :min="1" :max="100" placeholder="请输入生成数量" />
        </t-form-item>
        <t-form-item label="操作">
          <t-space>
            <t-button theme="primary" @click="handleGenerateMock">
              <template #icon><t-icon name="add" /></template>
              生成Mock数据
            </t-button>
            <t-popconfirm
              content="确定清空所有任务数据吗？此操作不可恢复！"
              @confirm="handleClearMock"
            >
              <t-button theme="danger">
                <template #icon><t-icon name="delete" /></template>
                清空所有数据
              </t-button>
            </t-popconfirm>
          </t-space>
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { taskApi, type Task } from '@/api/task'
import { MessagePlugin } from 'tdesign-vue-next'

const tasks = ref<Task[]>([])
const dueSoonTasks = ref<Task[]>([])
const loading = ref(false)
const filterStatus = ref('')
const showCreateDialog = ref(false)
const showDueSoonDialog = ref(false)
const editingTask = ref<Task | null>(null)
const showMockDialog = ref(false)
const mockCount = ref(10)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const formData = ref({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium' as 'low' | 'medium' | 'high'
})

const columns = [
  { colKey: 'title', title: '任务标题', width: 200 },
  { colKey: 'description', title: '描述', ellipsis: true },
  { colKey: 'status', title: '状态', width: 100 },
  { colKey: 'priority', title: '优先级', width: 100 },
  { colKey: 'dueDate', title: '截止时间', width: 180 },
  { colKey: 'action', title: '操作', width: 200, fixed: 'right' }
]

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[priority] || priority
}

const getPriorityTheme = (priority: string) => {
  const themes: Record<string, string> = {
    low: 'default',
    medium: 'warning',
    high: 'danger'
  }
  return themes[priority] || 'default'
}

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date()
}

const loadTasks = async () => {
  loading.value = true
  try {
    const result = await taskApi.getAll(filterStatus.value, pagination.value.current, pagination.value.pageSize)
    tasks.value = result.data
    pagination.value.total = result.total
  } catch (error) {
    MessagePlugin.error('加载任务列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadTasks()
}

const loadDueSoon = async () => {
  try {
    dueSoonTasks.value = await taskApi.getDueSoon(3)
    if (dueSoonTasks.value.length > 0) {
      showDueSoonDialog.value = true
    } else {
      MessagePlugin.info('暂无即将到期的任务')
    }
  } catch (error) {
    MessagePlugin.error('加载即将到期任务失败')
  }
}

const handleToggleStatus = async (task: Task) => {
  try {
    const newStatus = task.status === 'todo' ? 'completed' : 'todo'
    await taskApi.update(task.id, { status: newStatus })
    MessagePlugin.success(newStatus === 'completed' ? '任务已完成' : '任务已重新打开')
    loadTasks()
    loadDueSoon()
  } catch (error) {
    MessagePlugin.error('更新失败')
  }
}

const handleEdit = (task: Task) => {
  editingTask.value = task
  formData.value = {
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate,
    priority: task.priority
  }
  showCreateDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await taskApi.delete(id)
    MessagePlugin.success('删除成功')
    loadTasks()
    loadDueSoon()
  } catch (error) {
    MessagePlugin.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formData.value.title || !formData.value.dueDate) {
    MessagePlugin.warning('请填写必填信息')
    return
  }

  try {
    if (editingTask.value) {
      await taskApi.update(editingTask.value.id, formData.value)
      MessagePlugin.success('更新成功')
    } else {
      await taskApi.create(formData.value)
      MessagePlugin.success('创建成功')
    }
    showCreateDialog.value = false
    loadTasks()
    loadDueSoon()
  } catch (error) {
    MessagePlugin.error(editingTask.value ? '更新失败' : '创建失败')
  }
}

const handleCloseDialog = () => {
  editingTask.value = null
  formData.value = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleGenerateMock = async () => {
  try {
    const result = await taskApi.generateMock(mockCount.value)
    MessagePlugin.success(result.message)
    loadTasks()
  } catch (error) {
    MessagePlugin.error('生成Mock数据失败')
  }
}

const handleClearMock = async () => {
  try {
    const result = await taskApi.clearMock()
    MessagePlugin.success(result.message)
    showMockDialog.value = false
    loadTasks()
  } catch (error) {
    MessagePlugin.error('清空数据失败')
  }
}

const handleMockConfirm = () => {
  showMockDialog.value = false
}

onMounted(() => {
  loadTasks()
  loadDueSoon()
})
</script>

<style scoped>
.tasks-page {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
}

.page-header {
  margin-bottom: 24px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.overdue {
  color: #e34d59;
  font-weight: 500;
}
</style>
