<template>
  <div class="leads-page">
    <div class="page-header">
      <t-space>
        <t-select
          v-model="selectedStage"
          placeholder="筛选状态"
          clearable
          style="width: 200px;"
          @change="loadLeads"
        >
          <t-option value="uncontacted" label="未跟进" />
          <t-option value="contacted" label="跟进中" />
          <t-option value="qualified" label="已合格" />
          <t-option value="converted" label="已成交" />
          <t-option value="invalid" label="无效" />
        </t-select>
        <t-button theme="primary" @click="showCreateDialog = true">
          <template #icon><t-icon name="add" /></template>
          新建线索
        </t-button>
        <t-button theme="default" @click="showMockDialog = true">
          <template #icon><t-icon name="tools" /></template>
          Mock数据
        </t-button>
      </t-space>
    </div>

    <t-table
      :data="leads"
      :columns="columns"
      :loading="loading"
      row-key="id"
      stripe
      hover
    >
      <template #stage="{ row }">
        <t-tag :theme="getStageTheme(row.stage)" variant="light">
          {{ getStageLabel(row.stage) }}
        </t-tag>
      </template>

      <template #intentionLevel="{ row }">
        <t-tag v-if="row.intentionLevel" :theme="getIntentionTheme(row.intentionLevel)" variant="light">
          {{ getIntentionLabel(row.intentionLevel) }}
        </t-tag>
        <span v-else>-</span>
      </template>
      
      <template #action="{ row }">
        <t-space>
          <t-link theme="primary" @click="handleEdit(row)">编辑</t-link>
          <t-popconfirm content="确定删除此线索吗？" @confirm="handleDelete(row.id)">
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
      :header="editingLead ? '编辑线索' : '新建线索'"
      width="600px"
      @confirm="handleSubmit"
      @close="handleCloseDialog"
    >
      <t-form :data="formData" label-align="right" :label-width="100">
        <t-form-item label="线索名称" name="leadName">
          <t-input v-model="formData.leadName" placeholder="请输入线索名称" />
        </t-form-item>
        <t-form-item label="联系方式" name="contactInfo">
          <t-input v-model="formData.contactInfo" placeholder="请输入联系方式" />
        </t-form-item>
        <t-form-item label="状态" name="stage">
          <t-select v-model="formData.stage" placeholder="请选择状态">
            <t-option value="uncontacted" label="未跟进" />
            <t-option value="contacted" label="跟进中" />
            <t-option value="qualified" label="已合格" />
            <t-option value="converted" label="已成交" />
            <t-option value="invalid" label="无效" />
          </t-select>
        </t-form-item>
        <t-form-item label="意向等级" name="intentionLevel">
          <t-select v-model="formData.intentionLevel" placeholder="请选择意向等级" clearable>
            <t-option value="low" label="低" />
            <t-option value="medium" label="中" />
            <t-option value="high" label="高" />
          </t-select>
        </t-form-item>
      </t-form>
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
              content="确定清空所有线索数据吗？此操作不可恢复！"
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
import { leadApi, type Lead } from '@/api/lead'
import { MessagePlugin } from 'tdesign-vue-next'

const leads = ref<Lead[]>([])
const loading = ref(false)
const selectedStage = ref('')
const showCreateDialog = ref(false)
const editingLead = ref<Lead | null>(null)
const showMockDialog = ref(false)
const mockCount = ref(10)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const formData = ref({
  leadName: '',
  contactInfo: '',
  stage: 'uncontacted' as 'uncontacted' | 'contacted' | 'qualified' | 'converted' | 'invalid',
  intentionLevel: '' as 'low' | 'medium' | 'high' | ''
})

const columns = [
  { colKey: 'leadName', title: '线索名称', width: 150 },
  { colKey: 'contactInfo', title: '联系方式', width: 150 },
  { colKey: 'stage', title: '状态', width: 120 },
  { colKey: 'intentionLevel', title: '意向等级', width: 120 },
  { colKey: 'createdAt', title: '创建时间', width: 180, cell: (h: any, { row }: any) => formatDate(row.createdAt) },
  { colKey: 'action', title: '操作', width: 150, fixed: 'right' }
]

const getStageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    uncontacted: '未跟进',
    contacted: '跟进中',
    qualified: '已合格',
    converted: '已成交',
    invalid: '无效'
  }
  return labels[stage] || stage
}

const getStageTheme = (stage: string) => {
  const themes: Record<string, string> = {
    uncontacted: 'default',
    contacted: 'primary',
    qualified: 'warning',
    converted: 'success',
    invalid: 'danger'
  }
  return themes[stage] || 'default'
}

const getIntentionLabel = (level: string) => {
  const labels: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[level] || level
}

const getIntentionTheme = (level: string) => {
  const themes: Record<string, string> = {
    low: 'default',
    medium: 'warning',
    high: 'danger'
  }
  return themes[level] || 'default'
}

const loadLeads = async () => {
  loading.value = true
  try {
    const result = await leadApi.getAll(selectedStage.value, pagination.value.current, pagination.value.pageSize)
    leads.value = result.data
    pagination.value.total = result.total
  } catch (error) {
    MessagePlugin.error('加载线索列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = () => {
  loadLeads()
}

const handleEdit = (lead: Lead) => {
  editingLead.value = lead
  formData.value = {
    leadName: lead.leadName,
    contactInfo: lead.contactInfo,
    stage: lead.stage,
    intentionLevel: (lead.intentionLevel || '') as any
  }
  showCreateDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await leadApi.delete(id)
    MessagePlugin.success('删除成功')
    loadLeads()
  } catch (error) {
    MessagePlugin.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formData.value.leadName || !formData.value.contactInfo) {
    MessagePlugin.warning('请填写必填信息')
    return
  }

  try {
    const data = {
      ...formData.value,
      intentionLevel: formData.value.intentionLevel || undefined
    }

    if (editingLead.value) {
      await leadApi.update(editingLead.value.id, data)
      MessagePlugin.success('更新成功')
    } else {
      await leadApi.create(data as any)
      MessagePlugin.success('创建成功')
    }
    showCreateDialog.value = false
    loadLeads()
  } catch (error) {
    MessagePlugin.error(editingLead.value ? '更新失败' : '创建失败')
  }
}

const handleCloseDialog = () => {
  editingLead.value = null
  formData.value = {
    leadName: '',
    contactInfo: '',
    stage: 'uncontacted',
    intentionLevel: ''
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleGenerateMock = async () => {
  try {
    const result = await leadApi.generateMock(mockCount.value)
    MessagePlugin.success(result.message)
    loadLeads()
  } catch (error) {
    MessagePlugin.error('生成Mock数据失败')
  }
}

const handleClearMock = async () => {
  try {
    const result = await leadApi.clearMock()
    MessagePlugin.success(result.message)
    showMockDialog.value = false
    loadLeads()
  } catch (error) {
    MessagePlugin.error('清空数据失败')
  }
}

const handleMockConfirm = () => {
  showMockDialog.value = false
}

onMounted(() => {
  loadLeads()
})
</script>

<style scoped>
.leads-page {
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
