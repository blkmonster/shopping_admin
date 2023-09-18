<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.goodsSn" clearable class="filter-item" style="width: 160px;" placeholder="请输入商品编号" />
      <el-input v-model="listQuery.name" clearable class="filter-item" style="width: 160px;" placeholder="请输入商品名称" />
      <el-input v-model="listQuery.keywords" clearable class="filter-item" style="width: 160px;" placeholder="请输入商品关键字" />
      <el-select v-model="listQuery.categoryId" clearable filterable style="width: 160px" class="filter-item" placeholder="请选择所属类目">
        <el-option v-for="item in categoryList"
                   :key="item.id"
                   :label="item.name"
                   :value="item.id"/>
      </el-select>
      <el-select v-model="listQuery.isNew" clearable style="width: 160px" class="filter-item" placeholder="是否新品">
        <el-option label="新品" value="1"/>
        <el-option label="非新品" value="0"/>
      </el-select>
      <el-select v-model="listQuery.isHot" clearable style="width: 160px" class="filter-item" placeholder="是否热门">
        <el-option label="热门" value="1"/>
        <el-option label="非热门" value="0"/>
      </el-select>
      <el-select v-model="listQuery.isOnSale" clearable style="width: 160px" class="filter-item" placeholder="是否在售">
        <el-option label="在售" value="1"/>
        <el-option label="下架" value="0"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>

      <el-table-column type="expand">
        <template slot-scope="props">
          <el-form label-position="left" class="table-expand">
            <el-form-item label="库存">
              <span>{{ props.row.num }}</span>
            </el-form-item>
            <el-form-item label="商品单位">
              <span>{{ props.row.unit }}</span>
            </el-form-item>
            <el-form-item label="关键字">
              <span>{{ props.row.keywords }}</span>
            </el-form-item>
            <el-form-item label="商品介绍">
              <span>{{ props.row.brief }}</span>
            </el-form-item>
          </el-form>
        </template>
      </el-table-column>

      <el-table-column align="center" label="商品编号" prop="goodsSn" />
      <el-table-column align="center" min-width="100" label="名称" prop="name" />

      <el-table-column align="center" property="picUrl" label="商品图片">
        <template slot-scope="scope">
          <el-image :src="scope.row.picUrl" :preview-src-list="scope.row.gallery" style="width: 40px; height: 40px" />
        </template>
      </el-table-column>

      <el-table-column align="center" min-width="100" label="所属类目" prop="categoryId">
        <template slot-scope="scope">
          <el-tag >{{getCategory(scope.row.categoryId)}}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="市场售价" prop="price" />
      <el-table-column align="center" label="会员价" prop="vipPrice" />
      <el-table-column align="center" label="是否新品" prop="isNew">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isNew === 1 ? 'success' : 'error' ">{{ scope.row.isNew === 1 ? '新品' : '非新品' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否热门" prop="isHot">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isHot === 1 ? 'success' : 'error' ">{{ scope.row.isHot === 1 ? '热门' : '非热门' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="是否在售" prop="isOnSale">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isOnSale === 1 ? 'success' : 'error' ">{{ scope.row.isOnSale === 1 ? '在售' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="详情" prop="detail">
        <template slot-scope="scope">
          <el-dialog :visible.sync="detailDialogVisible" title="商品详情">
            <div class="goods-detail-box" v-html="goodsDetail" />
          </el-dialog>
          <el-button type="primary" size="mini" @click="showDetail(scope.row.detail)">查看</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-tooltip placement="top" content="返回顶部">
      <back-to-top :visibility-height="100" />
    </el-tooltip>

  </div>
</template>

<style>
  .table-expand {
    font-size: 0;
    padding-left: 60px;
  }
  .table-expand label {
    width: 100px;
    color: #99a9bf;
  }
  .table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
  }
  .gallery {
    width: 80px;
    margin-right: 10px;
  }
  .goods-detail-box img {
    width: 100%;
  }
</style>

<script>
import { listGoods, deleteGoods } from '@/api/goods'
import { queryL2 } from '@/api/category'
import BackToTop from '@/components/BackToTop'
import Pagination from '@/components/Pagination'

export default {
  name: 'GoodsList',
  components: { BackToTop, Pagination },
  data() {
    return {
      list: [],
      picList: [],
      categoryList: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        goodsSn: undefined,
        name: undefined,
        keywords: undefined,
        categoryId: undefined,
        isNew: undefined,
        isHot: undefined,
        isOnSale: undefined,
      },
      goodsDetail: '',
      detailDialogVisible: false,
      downloadLoading: false
    }
  },
  created() {
    this.getCategoryList()
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listGoods(this.listQuery).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    // 获取类目
    getCategoryList() {
      queryL2().then(response => {
        this.categoryList = response.data.data.list
      }).catch(() => {
        this.categoryList = []
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push({ path: '/goods/create' })
    },
    handleUpdate(row) {
      this.$router.push({ path: '/goods/edit', query: { id: row.id }})
    },
    //查看详情
    showDetail(detail) {
      this.goodsDetail = detail
      this.detailDialogVisible = true
    },
    handleDelete(row) {
      this.$confirm('确定删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteGoods(row).then(response => {
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
      }).catch(() => {})
    },
    //下载
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['商品ID', '商品编号', '名称', '专柜价格', '当前价格', '是否新品', '是否热品', '是否在售', '宣传图片列表', '商品介绍', '详细介绍', '商品图片', '商品单位', '关键字', '类目ID']
        const filterVal = ['id', 'goodsSn', 'name', 'counterPrice', 'retailPrice', 'isNew', 'isHot', 'isOnSale', 'gallery', 'brief', 'detail', 'picUrl', 'goodsUnit', 'keywords', 'categoryId']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '商品信息')
        this.downloadLoading = false
      })
    },
    // 通过id返回类目名
    getCategory(categoryId) {
      let categoryName = ''
      try {
        this.categoryList.forEach(function(e) {
          if (e.id === categoryId){
            categoryName = e.name
            throw new Error("")
          }
        });
      }catch (e) {
      }
      return categoryName
    },
  }
}
</script>
