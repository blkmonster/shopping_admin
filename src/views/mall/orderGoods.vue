<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.orderSn" clearable class="filter-item" style="width: 160px;" placeholder="请输入订单编号" />
      <el-input v-model="listQuery.goodsSn" clearable class="filter-item" style="width: 160px;" placeholder="请输入商品编号" />
      <el-input v-model="listQuery.goodsName" clearable class="filter-item" style="width: 160px;" placeholder="请输入商品名称" />
      <el-input v-model="listQuery.drawbackCause" clearable class="filter-item" style="width: 160px;" placeholder="请选择退款原因" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" min-width="120" label="订单编号" prop="orderSn" />
      <el-table-column align="center" label="商品编号" prop="goodsSn" show-overflow-tooltip/>
      <el-table-column align="center" label="商品名称" prop="goodsName" show-overflow-tooltip/>
      <el-table-column align="center" label="商品数量" prop="number" show-overflow-tooltip/>
      <el-table-column align="center" label="商品售价" prop="price" show-overflow-tooltip/>
      <el-table-column align="center" label="实际付款" prop="payPrice" show-overflow-tooltip/>
      <el-table-column align="center" label="商品图片" prop="picUrl">
        <template slot-scope="scope">
          <el-image :src="scope.row.picUrl" style="width: 40px; height: 40px" />
        </template>
      </el-table-column>
      <el-table-column align="center" label="退款金额" prop="drawbackPrice" show-overflow-tooltip/>
      <el-table-column align="center" label="退款原因" prop="drawbackCause" show-overflow-tooltip/>
      <el-table-column align="center" label="问题描述" prop="drawbackMessage" show-overflow-tooltip/>
      <el-table-column align="center" label="退款原因详情图片" prop="drawbackPhoto">
        <template slot-scope="scope">
          <el-image :src="scope.row.drawbackPhoto" :preview-src-list="scope.row.drawbackPhoto" style="width: 40px; height: 40px" />
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="200" class-name="oper">
        <template slot-scope="scope">
<!--          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>-->
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">驳回</el-button>
          <el-button type="primary" size="mini" @click="confirmShip(scope.row)">退款</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<style lang="scss" scoped>
.el-table--medium th, .el-table--medium td {
    padding: 3px 0;
}

.el-input-number--medium {
  width: 100%;
}

.oper .el-button--mini {
  padding: 7px 4px;
  width: 40px;
  font-size: 10px;
  margin-left: 1px;
}

::v-deep .el-table__expanded-cell {
  padding: 6px 80px;
}

.order-goods {
  display: flex;
  justify-content: space-around;
  justify-items: center;
  align-items:center;
  padding: 6px 0;
}

.name {
  width: 200px;
}

.spec {
  width: 180px;
}

.price {
  width: 120px;
}

.num {
  width: 120px;
}
.banmaPic {
  width: 90px;
  position: absolute;
  left: 100px;
  top: 130px;
}
.goodsPic {
  margin: auto;
  width: 290px;
  height: 375px;
}
.goodsImg {
  width: 290px;
  height: 375px;
  position: relative;
}
</style>

<script>
import { listOrderGoods, rejectOrderGoods, drawbackOrderGoods } from '@/api/order'
import Pagination from '@/components/Pagination'

// 2为申请退款
const drawbackNo = 2

export default {
  name: 'OrderGoods',
  components: { Pagination },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        orderSn: undefined,
        goodsSn: undefined,
        goodsName: undefined,
        drawbackCause: undefined,
        drawback: drawbackNo
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listOrderGoods(this.listQuery).then(response => {
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
    // 退款
    confirmShip(row) {
      this.$confirm('确定退款?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        drawbackOrderGoods(row).then(response => {
          this.$notify.success({
            title: '成功',
            message: '退款成功'
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
    // 驳回
    handleDelete(row) {
      this.$confirm('确定驳回?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        rejectOrderGoods(row).then(response => {
          this.$notify.success({
            title: '成功',
            message: '驳回成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch(() => {})
    }
  }
}
</script>
