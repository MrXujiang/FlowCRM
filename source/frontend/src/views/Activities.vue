<template>
  <div class="activities-page">
    <div class="page-header">
      <t-space>
        <t-button theme="primary" @click="showCreateDialog = true">
          <template #icon><t-icon name="add" /></template>
          新建跟进记录
        </t-button>
        <t-button theme="default" @click="loadReminders">
          <template #icon><t-icon name="notification" /></template>
          即将提醒 ({{ reminders.length }})
        </t-button>
        <t-button theme="default" @click="showMockDialog = true">
          <template #icon><t-icon name="tools" /></template>
          Mock数据
        </t-button>
      </t-space>
    </div>

    <t-table
      :data="activities"
      :columns="columns"
      :loading="loading"
      row-key="id"
      stripe
      hover
    >
      <template #type="{ row }">
        <t-tag :theme="getTypeTheme(row.type)" variant="light">
          {{ getTypeLabel(row.type) }}
        </t-tag>
      </template>
      
      <template #action="{ row }">
        <t-space>
          <t-link theme="primary" @click="handleEdit(row)">编辑</t-link>
          <t-popconfirm content="确定删除此记录吗？" @confirm="handleDelete(row.id)">
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
      :header="editingActivity ? '编辑跟进记录' : '新建跟进记录'"
      width="600px"
      @confirm="handleSubmit"
      @close="handleCloseDialog"
    >
      <t-form :data="formData" label-align="right" :label-width="100">
        <t-form-item label="跟进方式" name="type">
          <t-select v-model="formData.type" placeholder="请选择跟进方式">
            <t-option value="call" label="电话" />
            <t-option value="email" label="邮件" />
            <t-option value="meeting" label="会议" />
            <t-option value="other" label="其他" />
          </t-select>
        </t-form-item>
        <t-form-item label="跟进时间" name="date">
          <t-date-picker
            v-model="formData.date"
            enable-time-picker
            placeholder="请选择跟进时间"
            style="width: 100%;"
          />
        </t-form-item>
        <t-form-item label="跟进内容" name="notes">
          <t-textarea
            v-model="formData.notes"
            placeholder="请输入跟进内容"
            :autosize="{ minRows: 3 }"
          />
        </t-form-item>
        <t-form-item label="下次提醒" name="remindDate">
          <t-date-picker
            v-model="formData.remindDate"
            enable-time-picker
            placeholder="设置下次跟进提醒时间（可选）"
            clearable
            style="width: 100%;"
          />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 提醒列表对话框 -->
    <t-dialog
      v-model:visible="showRemindersDialog"
      header="即将提醒的跟进"
      width="700px"
      :footer="false"
    >
      <t-list v-if="reminders.length > 0" :split="true">
        <t-list-item v-for="item in reminders" :key="item.id">
          <t-list-item-meta>
            <template #title>
              {{ getTypeLabel(item.type) }} - {{ formatDate(item.date) }}
            </template>
            <template #description>
              {{ item.notes }}
            </template>
          </t-list-item-meta>
          <template #action>
            <t-tag theme="warning">{{ formatDate(item.remindDate!) }}</t-tag>
          </template>
        </t-list-item>
      </t-list>
      <t-empty v-else description="暂无即将提醒的跟进" />
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
              content="确定清空所有跟进记录吗？此操作不可恢复！"
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
import { activityApi, type Activity } from '@/api/activity'
import { MessagePlugin } from 'tdesign-vue-next'

const activities = ref<Activity[]>([])
const reminders = ref<Activity[]>([])
const loading = ref(false)
const showCreateDialog = ref(false)
const showRemindersDialog = ref(false)
const editingActivity = ref<Activity | null>(null)
const showMockDialog = ref(false)
const mockCount = ref(10)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const formData = ref({
  type: 'call' as 'call' | 'email' | 'meeting' | 'other',
  date: '',
  notes: '',
  remindDate: ''
})

const columns = [
  { colKey: 'type', title: '跟进方式', width: 100 },
  { colKey: 'date', title: '跟进时间', width: 180, cell: (h: any, { row }: any) => formatDate(row.date) },
  { colKey: 'notes', title: '跟进内容', ellipsis: true },
  { colKey: 'remindDate', title: '提醒时间', width: 180, cell: (h: any, { row }: any) => row.remindDate ? formatDate(row.remindDate) : '-' },
  { colKey: 'action', title: '操作', width: 150, fixed: 'right' }
]

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    call: '电话',
    email: '邮件',
    meeting: '会议',
    other: '其他'
  }
  return labels[type] || type
}

const getTypeTheme = (type: string) => {
  const themes: Record<string, string> = {
    call: 'primary',
    email: 'success',
    meeting: 'warning',
    other: 'default'
  }
  return themes[type] || 'default'
}

const loadActivities = async () => {
  loading.value = true
  try {
    const result = await activityApi.getAll(undefined, undefined, pagination.value.current, pagination.value.pageSize)
    activities.value = result.data
    pagination.value.total = result.total
  } catch (error) {
    MessagePlugin.error('加载跟进记录失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadActivities()
}

const loadReminders = async () => {
  try {
    reminders.value = await activityApi.getReminders()
    if (reminders.value.length > 0) {
      showRemindersDialog.value = true
    } else {
      MessagePlugin.info('暂无即将提醒的跟进')
    }
  } catch (error) {
    MessagePlugin.error('加载提醒失败')
  }
}

const handleEdit = (activity: Activity) => {
  editingActivity.value = activity
  formData.value = {
    type: activity.type,
    date: activity.date,
    notes: activity.notes,
    remindDate: activity.remindDate || ''
  }
  showCreateDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await activityApi.delete(id)
    MessagePlugin.success('删除成功')
    loadActivities()
  } catch (error) {
    MessagePlugin.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formData.value.date || !formData.value.notes) {
    MessagePlugin.warning('请填写必填信息')
    return
  }

  try {
    const data = {
      ...formData.value,
      remindDate: formData.value.remindDate || undefined
    }

    if (editingActivity.value) {
      await activityApi.update(editingActivity.value.id, data)
      MessagePlugin.success('更新成功')
    } else {
      await activityApi.create(data as any)
      MessagePlugin.success('创建成功')
    }
    showCreateDialog.value = false
    loadActivities()
    loadReminders()
  } catch (error) {
    MessagePlugin.error(editingActivity.value ? '更新失败' : '创建失败')
  }
}

const handleCloseDialog = () => {
  editingActivity.value = null
  formData.value = {
    type: 'call',
    date: '',
    notes: '',
    remindDate: ''
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleGenerateMock = async () => {
  try {
    const result = await activityApi.generateMock(mockCount.value)
    MessagePlugin.success(result.message)
    loadActivities()
  } catch (error) {
    MessagePlugin.error('生成Mock数据失败')
  }
}

const handleClearMock = async () => {
  try {
    const result = await activityApi.clearMock()
    MessagePlugin.success(result.message)
    showMockDialog.value = false
    loadActivities()
  } catch (error) {
    MessagePlugin.error('清空数据失败')
  }
}

const handleMockConfirm = () => {
  showMockDialog.value = false
}

onMounted(() => {
  loadActivities()
  loadReminders()
})
</script>

<style scoped>
.activities-page {
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
</style>
