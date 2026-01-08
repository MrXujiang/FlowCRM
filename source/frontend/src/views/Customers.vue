<template>
  <div class="customers-page">
    <div class="page-header">
      <t-space>
        <t-input
          v-model="searchKeyword"
          placeholder="搜索客户（姓名、电话、公司）"
          clearable
          style="width: 300px;"
          @change="handleSearch"
        >
          <template #prefix-icon>
            <t-icon name="search" />
          </template>
        </t-input>
        <t-button theme="primary" @click="showCreateDialog = true">
          <template #icon><t-icon name="add" /></template>
          新建客户
        </t-button>
        <t-button theme="default" @click="showMockDialog = true">
          <template #icon><t-icon name="tools" /></template>
          Mock数据
        </t-button>
      </t-space>
    </div>

    <t-table
      :data="customers"
      :columns="columns"
      :loading="loading"
      row-key="id"
      stripe
      hover
    >
      <template #tags="{ row }">
        <t-tag v-for="tag in row.tags" :key="tag" theme="primary" variant="light" style="margin-right: 4px;">
          {{ tag }}
        </t-tag>
      </template>
      
      <template #action="{ row }">
        <t-space>
          <t-link theme="primary" @click="handleView(row)">查看</t-link>
          <t-link theme="primary" @click="handleEdit(row)">编辑</t-link>
          <t-popconfirm content="确定删除此客户吗？" @confirm="handleDelete(row.id)">
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
      :header="editingCustomer ? '编辑客户' : '新建客户'"
      width="600px"
      @confirm="handleSubmit"
      @close="handleCloseDialog"
    >
      <t-form :data="formData" label-align="right" :label-width="80">
        <t-form-item label="姓名" name="name">
          <t-input v-model="formData.name" placeholder="请输入客户姓名" />
        </t-form-item>
        <t-form-item label="电话" name="phone">
          <t-input v-model="formData.phone" placeholder="请输入联系电话" />
        </t-form-item>
        <t-form-item label="公司" name="company">
          <t-input v-model="formData.company" placeholder="请输入公司名称" />
        </t-form-item>
        <t-form-item label="来源" name="source">
          <t-input v-model="formData.source" placeholder="如：网络推广、朋友介绍等" />
        </t-form-item>
        <t-form-item label="标签" name="tags">
          <t-select v-model="formData.tags" multiple placeholder="选择或输入标签" creatable filterable>
            <t-option value="重点客户" label="重点客户" />
            <t-option value="意向客户" label="意向客户" />
            <t-option value="老客户" label="老客户" />
          </t-select>
        </t-form-item>
        <t-form-item label="备注" name="remarks">
          <t-textarea v-model="formData.remarks" placeholder="请输入备注信息" :autosize="{ minRows: 3 }" />
        </t-form-item>
        <t-form-item label="附件" name="attachments">
          <t-upload
            v-model="formData.attachments"
            :action="uploadAction"
            :headers="uploadHeaders"
            :before-upload="handleBeforeUpload"
            :on-success="handleUploadSuccess"
            :on-remove="handleRemoveFile"
            :max="5"
            theme="file-flow"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            tips="支持图片、PDF、Word、Excel文件，单个文件不超过10MB，最多5个文件"
          />
        </t-form-item>
      </t-form>
    </t-dialog>

    <!-- 查看详情对话框 -->
    <t-dialog
      v-model:visible="showDetailDialog"
      header="客户详情"
      width="600px"
      :footer="false"
    >
      <div v-if="viewingCustomer" class="customer-detail">
        <t-descriptions :column="2" bordered>
          <t-descriptions-item label="姓名">{{ viewingCustomer.name }}</t-descriptions-item>
          <t-descriptions-item label="电话">{{ viewingCustomer.phone }}</t-descriptions-item>
          <t-descriptions-item label="公司">{{ viewingCustomer.company || '-' }}</t-descriptions-item>
          <t-descriptions-item label="来源">{{ viewingCustomer.source || '-' }}</t-descriptions-item>
          <t-descriptions-item label="标签" :span="2">
            <t-tag v-for="tag in viewingCustomer.tags" :key="tag" theme="primary" variant="light" style="margin-right: 4px;">
              {{ tag }}
            </t-tag>
            <span v-if="!viewingCustomer.tags?.length">-</span>
          </t-descriptions-item>
          <t-descriptions-item label="备注" :span="2">
            {{ viewingCustomer.remarks || '-' }}
          </t-descriptions-item>
          <t-descriptions-item label="附件" :span="2">
            <div v-if="viewingCustomer.attachments && viewingCustomer.attachments.length > 0" class="attachments-list">
              <div v-for="file in viewingCustomer.attachments" :key="file.filename" class="attachment-item">
                <a :href="getFileUrl(file.url)" target="_blank" class="attachment-link">
                  <t-icon name="file" />
                  {{ file.originalName }}
                  <span class="file-size">({{ formatFileSize(file.size) }})</span>
                </a>
              </div>
            </div>
            <span v-else>-</span>
          </t-descriptions-item>
          <t-descriptions-item label="创建时间" :span="2">
            {{ formatDate(viewingCustomer.createdAt) }}
          </t-descriptions-item>
        </t-descriptions>
      </div>
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
              content="确定清空所有客户数据吗？此操作不可恢复！"
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
import { customerApi, type Customer } from '@/api/customer'
import { uploadApi, type FileAttachment } from '@/api/upload'
import { MessagePlugin } from 'tdesign-vue-next'

const customers = ref<Customer[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const showCreateDialog = ref(false)
const showDetailDialog = ref(false)
const editingCustomer = ref<Customer | null>(null)
const viewingCustomer = ref<Customer | null>(null)
const showMockDialog = ref(false)
const mockCount = ref(10)
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
})

const formData = ref<{
  name: string
  phone: string
  company: string
  source: string
  tags: string[]
  remarks: string
  attachments: any[]
}>({
  name: '',
  phone: '',
  company: '',
  source: '',
  tags: [] as string[],
  remarks: '',
  attachments: []
})

const columns = [
  { colKey: 'name', title: '姓名', width: 120 },
  { colKey: 'phone', title: '电话', width: 140 },
  { colKey: 'company', title: '公司', width: 150 },
  { colKey: 'source', title: '来源', width: 120 },
  { colKey: 'tags', title: '标签', width: 200 },
  { colKey: 'action', title: '操作', width: 180, fixed: 'right' }
]

// 上传配置
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
const uploadAction = isDev ? 'http://localhost:3000/api/upload/single' : '/api/upload/single'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

const loadCustomers = async () => {
  loading.value = true
  try {
    const result = await customerApi.getAll(searchKeyword.value, pagination.value.current, pagination.value.pageSize)
    customers.value = result.data
    pagination.value.total = result.total
  } catch (error) {
    MessagePlugin.error('加载客户列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1  // 搜索时重置到第一页
  loadCustomers()
}

const handlePageChange = () => {
  loadCustomers()
}

const handleView = (customer: Customer) => {
  viewingCustomer.value = customer
  showDetailDialog.value = true
}

const handleEdit = (customer: Customer) => {
  editingCustomer.value = customer
  formData.value = {
    name: customer.name,
    phone: customer.phone,
    company: customer.company || '',
    source: customer.source || '',
    tags: customer.tags || [],
    remarks: customer.remarks || '',
    attachments: customer.attachments ? customer.attachments.map(file => ({
      name: file.originalName,
      url: file.url,
      status: 'success',
      response: file
    })) : []
  }
  showCreateDialog.value = true
}

const handleDelete = async (id: string) => {
  try {
    await customerApi.delete(id)
    MessagePlugin.success('删除成功')
    loadCustomers()
  } catch (error) {
    MessagePlugin.error('删除失败')
  }
}

const handleSubmit = async () => {
  if (!formData.value.name || !formData.value.phone) {
    MessagePlugin.warning('请填写必填信息')
    return
  }

  try {
    // 处理附件数据
    const attachments = formData.value.attachments
      .filter((file: any) => file.status === 'success' && file.response)
      .map((file: any) => ({
        filename: file.response.filename,
        originalName: file.response.originalName,
        size: file.response.size,
        mimetype: file.response.mimetype,
        url: file.response.url,
        uploadedAt: file.response.uploadedAt || new Date().toISOString()
      }))

    const submitData = {
      ...formData.value,
      attachments
    }

    if (editingCustomer.value) {
      await customerApi.update(editingCustomer.value.id, submitData)
      MessagePlugin.success('更新成功')
    } else {
      await customerApi.create(submitData)
      MessagePlugin.success('创建成功')
    }
    showCreateDialog.value = false
    loadCustomers()
  } catch (error) {
    MessagePlugin.error(editingCustomer.value ? '更新失败' : '创建失败')
  }
}

const handleCloseDialog = () => {
  editingCustomer.value = null
  formData.value = {
    name: '',
    phone: '',
    company: '',
    source: '',
    tags: [],
    remarks: '',
    attachments: []
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileUrl = (url: string) => {
  return uploadApi.getFileUrl(url)
}

const handleBeforeUpload = (file: File) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    MessagePlugin.error('文件大小不能超过10MB')
    return false
  }
  return true
}

const handleUploadSuccess = (res: any) => {
  MessagePlugin.success('文件上传成功')
  return res
}

const handleRemoveFile = (context: any) => {
  const { file } = context
  if (file.response && file.response.filename) {
    // 如果需要，可以调用后端删除接口
    // uploadApi.deleteFile(file.response.filename)
  }
  return true
}

const handleGenerateMock = async () => {
  try {
    const result = await customerApi.generateMock(mockCount.value)
    MessagePlugin.success(result.message)
    loadCustomers()
  } catch (error) {
    MessagePlugin.error('生成Mock数据失败')
  }
}

const handleClearMock = async () => {
  try {
    const result = await customerApi.clearMock()
    MessagePlugin.success(result.message)
    showMockDialog.value = false
    loadCustomers()
  } catch (error) {
    MessagePlugin.error('清空数据失败')
  }
}

const handleMockConfirm = () => {
  showMockDialog.value = false
}

onMounted(() => {
  loadCustomers()
})
</script>

<style scoped>
.customers-page {
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

.customer-detail {
  padding: 16px 0;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
}

.attachment-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--td-brand-color);
  text-decoration: none;
}

.attachment-link:hover {
  text-decoration: underline;
}

.file-size {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
}
</style>
