<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 200px;" placeholder="请输入类目名称" />
      <el-input v-model="listQuery.keywords" clearable class="filter-item" style="width: 200px;" placeholder="请输入标签" />
      <el-select v-model="listQuery.level" clearable style="width: 200px" class="filter-item" placeholder="请选择类目级别">
        <el-option label="一级类目" value="一级类目"/>
        <el-option label="二级类目" value="二级类目"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="类目名" prop="name"/>
      <el-table-column align="center" prop="icon_url" label="类目图标">
        <template slot-scope="scope">
          <img v-if="scope.row.iconUrl" :src="scope.row.iconUrl" width="100">
        </template>
      </el-table-column>
      <el-table-column align="center" label="标签" prop="keywords"/>
      <el-table-column align="center" label="简介" prop="desc" show-overflow-tooltip/>
      <el-table-column align="center" label="级别" prop="level">
        <template slot-scope="scope">
          <el-tag :type="scope.row.level === '一级类目' ? 'primary' : 'info' ">{{ scope.row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['POST /admin/category/update']" type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/category/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="类目名" prop="name">
          <el-input v-model="dataForm.name"/>
        </el-form-item>
        <el-form-item label="标签" prop="keywords">
          <el-input v-model="dataForm.keywords"/>
        </el-form-item>
        <el-form-item label="类目简介" prop="desc">
          <el-input v-model="dataForm.desc"/>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="dataForm.level">
            <el-option label="一级类目" value="一级类目"/>
            <el-option label="二级类目" value="二级类目"/>
          </el-select>
        </el-form-item>
        <el-form-item v-if="dataForm.level === '二级类目'" label="父类目" prop="pid">
          <el-select v-model="dataForm.pid">
            <el-option v-for="item in catL1" :key="item.id" :label="item.name" :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="类目图标" prop="iconUrl">
          <el-upload
            :headers="headers"
            :action="uploadPath"
            :show-file-list="false"
            :on-success="uploadIconUrl"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.png,.gif,.icon,.webp">
            <img v-if="dataForm.iconUrl" :src="dataForm.iconUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"/>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus==='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchList, queryL1, updateStoreImport, deleteDraw, createDraw } from '@/api/category'
import Pagination from '@/components/Pagination/index.vue' // Secondary package based on el-pagination
import { getToken } from '@/utils/auth'
import { uploadPath } from '@/api/storage'

export default {
  components: { Pagination },
  data() {
    return {
      uploadPath,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        name: undefined,
        keywords: undefined,
        level: undefined
      },
      downloadLoading: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogFormVisible: false,
      dataForm: {
        id: 0,
        name: undefined,
        keywords: undefined,
        desc: undefined,
        level: undefined,
        pid: undefined,
        iconUrl: undefined

      },
      catL1: [],
      rules: {
        name: [
          { required: true, message: '类目名不能为空', trigger: 'blur' }
        ],
        level: [{ required: true, message: '类目级别不能为空', trigger: 'blur' }]
      }
    }
  },
  computed: {
    headers() {
      return {
        'X-Store-Admin-Token': getToken()
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
      queryL1().then(response => {
        this.catL1 = response.data.data.list
      }).catch(() => {
        this.catL1 = []
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    //   编辑信息
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 更新信息
    updateData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          updateStoreImport(this.dataForm)
            .then(() => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify.success({
                title: '成功',
                message: '更新成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    resetForm() {
      this.dataForm = {
        id: 0,
        name: undefined,
        keywords: undefined,
        desc: undefined,
        level: undefined,
        pid: undefined,
        iconUrl: undefined
      }
    },
    // 添加
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 确认添加
    createData() {
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          createDraw(this.dataForm)
            .then(response => {
              this.dialogFormVisible = false
              this.getList()
              this.$notify.success({
                title: '成功',
                message: '创建成功'
              })
            })
            .catch(response => {
              this.$notify.error({
                title: '失败',
                message: response.data.errmsg
              })
            })
        }
      })
    },
    // 删除
    handleDelete(row) {
      this.$confirm('是否删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteDraw(row).then(res => {
          this.$notify.success({
            title: '成功',
            message: '删除成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      })
    },
    uploadIconUrl: function(response) {
      this.dataForm.iconUrl = response.data.url
    }

  }
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>
