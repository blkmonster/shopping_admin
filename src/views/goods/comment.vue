<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.goodsSn" clearable class="filter-item" style="width: 200px;" placeholder="请输入商品编号" />
      <el-select v-model="listQuery.star" clearable style="width: 200px" class="filter-item" placeholder="评分">
        <el-option label="五星" value="5"/>
        <el-option label="四星" value="4"/>
        <el-option label="三星" value="3"/>
        <el-option label="两星" value="2"/>
        <el-option label="一星" value="1"/>
      </el-select>
      <el-select v-model="listQuery.hasPicture" clearable style="width: 200px" class="filter-item" placeholder="是否有图">
        <el-option label="有图" value="1"/>
        <el-option label="无图" value="0"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="商品编号" prop="goodsSn" />
      <el-table-column align="center" label="评分" prop="star">
        <template slot-scope="scope">
          <el-rate v-model="scope.row.star" disabled/>
        </template>
      </el-table-column>
      <el-table-column align="center" label="关键词" prop="keywords" show-overflow-tooltip/>
      <el-table-column align="center" label="评论内容" prop="content" show-overflow-tooltip/>
      <el-table-column align="center" label="回复内容" prop="adminContent" show-overflow-tooltip/>
      <el-table-column align="center" label="评论图片" prop="picUrls">
        <template slot-scope="scope">
          <el-image v-for="item in scope.row.picUrls" :key="item" :src="item" :preview-src-list="scope.row.picUrls" :lazy="true" style="width: 40px; height: 40px; margin-right: 5px;" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="时间" prop="addTime" />

      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleReply(scope.row)">回复</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 评论回复 -->
    <el-dialog :visible.sync="replyFormVisible" title="回复">
      <el-form ref="replyForm" :model="replyForm" status-icon label-position="left" label-width="100px" style="width: 400px; margin-left:50px;">
        <el-form-item label="回复内容" prop="content">
          <el-input v-model="replyForm.adminContent" :autosize="{ minRows: 4, maxRows: 8}" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replyFormVisible = false">取消</el-button>
        <el-button type="primary" @click="reply">确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { listComment, deleteComment, replyComment } from '@/api/comment'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'Comment',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsSn: undefined,
        star: undefined,
        hasPicture: undefined,
      },
      replyForm: {
        id:undefined,
        adminContent: ''
      },
      replyFormVisible: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listComment(this.listQuery).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleReply(row) {
      this.replyForm = { id: row.id, adminContent: '' }
      this.replyFormVisible = true
    },
    reply() {
      replyComment(this.replyForm).then(response => {
        this.replyFormVisible = false
        this.$notify.success({
          title: '成功',
          message: '回复成功'
        })
        this.getList()
      }).catch(response => {
        this.$notify.error({
          title: '失败',
          message: response.data.errmsg
        })
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteComment(row).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch(() => {})
    },
  }
}
</script>
