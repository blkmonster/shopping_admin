<template>
  <div class="app-container">

    <!-- 查询和其他操作 -->
    <div class="filter-container">
      <el-input v-model="listQuery.userId" clearable class="filter-item" style="width: 160px;" placeholder="请输入用户id" />
      <el-input v-model="listQuery.userName" clearable class="filter-item" style="width: 160px;" placeholder="请输入收货人名称" />
      <el-input v-model="listQuery.orderSn" clearable class="filter-item" style="width: 160px;" placeholder="请输入订单编号" />
      <el-date-picker v-model="listQuery.timeArray" type="datetimerange" value-format="yyyy-MM-dd HH:mm:ss" class="filter-item" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" />
      <el-select v-model="listQuery.orderStatus" clearable style="width: 200px" class="filter-item" placeholder="请选择订单状态">
        <el-option v-for="(key, value) in statusMap" :key="key" :label="key" :value="value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查找</el-button>
    </div>

    <!-- 查询结果 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column type="expand">
        <template slot-scope="props" >
          <div v-for="item in props.row.orderGoodsList" :key="item.id" class="order-goods">
            <div class="picture">
              <img :src="item.picUrl" width="40">
            </div>
            <div class="name">
              商品名称：{{ item.goodsName }}
            </div>
            <div class="price">
              单价：{{ item.payPrice }} 元
            </div>
            <div class="num">
              数量：{{ item.number }} 件
            </div>
            <div class="price">
              小计：{{ item.price * item.number }} 元
            </div>
            <div v-if="item.drawback === 1">
              已退款：{{ item.drawbackPrice }} 元
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" min-width="120" label="订单编号" prop="orderSn" />
      <el-table-column align="center" label="用户id" width="80" prop="userId"/>
      <el-table-column align="center" label="下单时间" prop="orderTime" min-width="100">
        <template slot-scope="scope">
          {{ (scope.row.orderTime || '').substring(0, 10) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="预约送达时间" prop="appointTime" width="160px">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.appointTime }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户留言" prop="message" show-overflow-tooltip/>
      <el-table-column align="center" label="实付金额" prop="orderPrice">
        <template slot-scope="scope">
          {{ scope.row.orderPrice }} 元
        </template>
      </el-table-column>
      <el-table-column align="center" label="收货人" prop="userName">
        <template slot-scope="scope">
          <span style="color:red; font-weight:bold;">{{ scope.row.userName }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="收货电话" prop="mobile" min-width="100" />
      <el-table-column align="center" label="订单状态" prop="orderStatus">
        <template slot-scope="scope">
          <el-tag>{{ scope.row.orderStatus | orderStatusFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="300" class-name="oper">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
<!--          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>-->
          <el-button v-show="scope.row.orderStatus === 201" type="primary" size="mini" @click="confirmShip(scope.row)">发货</el-button>
          <el-button v-show="scope.row.orderStatus === 301" type="warning" size="small" @click="handleConfirm(scope.row)">系统收货</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 订单详情对话框 -->
    <el-dialog :visible.sync="orderDialogVisible" title="订单详情" width="800">
      <section ref="print">
        <el-form :data="orderDetail" label-position="left">
          <el-form-item label="订单编号">
            <span>{{ orderDetail.orderSn }}</span>
          </el-form-item>
          <el-form-item label="订单状态">
            <el-tag>{{ orderDetail.orderStatus | orderStatusFilter }}</el-tag>
          </el-form-item>
          <el-form-item label="用户留言">
            <span>{{ orderDetail.message }}</span>
          </el-form-item>
          <el-form-item label="收货信息">
            <span>（收货人）{{ orderDetail.userName }}</span>
            <span>（手机号）{{ orderDetail.mobile }}</span>
            <span>（地址）{{ orderDetail.address }}</span>
          </el-form-item>
          <el-form-item label="预约送达时间">
            <span>{{ orderDetail.appointTime }}</span>
          </el-form-item>
          <el-form-item label="商品信息">
            <el-table :data="orderDetail.orderGoodsList" border fit highlight-current-row>
              <el-table-column align="center" label="商品名称" prop="goodsName" />
              <el-table-column align="center" label="商品编号" prop="goodsSn" />
              <el-table-column align="center" label="货品价格" prop="price" />
              <el-table-column align="center" label="货品数量" prop="number" />
              <el-table-column align="center" label="是否退款" prop="drawback" >
                <template slot-scope="scope" >
                  {{scope.row.drawback === 1 ? "是" : "否"}}
                </template>
              </el-table-column>
              <el-table-column type="expand"  align="center" label="退款信息">
                <template slot-scope="props" >
                  <div v-if="props.row.drawback === 1">
                    <div class="name">
                      退款金额：{{ props.row.drawbackPrice }} 元
                    </div>
                    <div class="price">
                      退款原因：{{ props.row.drawbackCause }}
                    </div>
                    <div class="num">
                      问题描述：{{ props.row.drawbackMessage }}
                    </div>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
          <el-form-item label="费用信息">
            <span>
              (实际费用){{ orderDetail.orderPrice }}元 =
              (商品总价){{ orderDetail.goodsPrice }}元 +
              (配送费用){{ orderDetail.freightPrice }}元
              <span v-if="orderDetail.couponPrice > 0">-(优惠减免){{ orderDetail.couponPrice }}元</span>
            </span>
          </el-form-item>
          <el-form-item label="支付信息">
            <span>（支付渠道）微信支付</span>
            <span>（支付时间）{{ orderDetail.payTime }}</span>
          </el-form-item>
          <el-form-item label="物流信息">
            <span>（下单时间）{{ orderDetail.orderTime }}</span>
            <span>（发货时间）{{ orderDetail.startTime }}</span>
            <span>（确认收货时间）{{ orderDetail.confirmTime }}</span>
          </el-form-item>

        </el-form>
      </section>
      <span slot="footer" class="dialog-footer">
        <el-button @click="orderDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="printOrder">打 印</el-button>
      </span>
    </el-dialog>

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
import { detailOrder, listOrder, deleteOrder, shipOrder, confirmOrder } from '@/api/order'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

const statusMap = {
  101: '未付款',
  102: '用户取消',
  103: '系统取消',
  201: '已付款',
  202: '申请退款',
  203: '已退款',
  301: '已发货',
  401: '用户收货',
  402: '系统收货',
  501: '未评价',
  502: '已完成'
}

export default {
  name: 'Order',
  components: { Pagination },
  filters: {
    orderStatusFilter(status) {
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        userId: undefined,
        userName: undefined,
        orderSn: undefined,
        timeArray: [],
        orderStatus: undefined
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      statusMap,
      orderDialogVisible: false,
      orderDetail: {
        orderGoodsList: []
      },
      shipForm: {
        id: undefined,
        orderStatus: undefined
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      if (this.listQuery.timeArray && this.listQuery.timeArray.length === 2) {
        this.listQuery.start = this.listQuery.timeArray[0]
        this.listQuery.end = this.listQuery.timeArray[1]
      } else {
        this.listQuery.start = null
        this.listQuery.end = null
      }
      const listQuery1 = {
        page: 1,
        limit: 20,
        userId: this.listQuery.userId,
        userName: this.listQuery.userName,
        orderSn: this.listQuery.orderSn,
        orderStatus: this.listQuery.orderStatus,
        start: this.listQuery.start,
        end: this.listQuery.end
      }
      if (this.listQuery.orderId) {
        detailOrder(this.listQuery.orderId).then(response => {
          this.list = []
          if (response.data.data.order) {
            this.list.push(response.data.data.order)
            this.total = 1
            this.listLoading = false
          }
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      } else {
        listOrder(listQuery1).then(response => {
          this.list = response.data.data.list
          this.total = response.data.data.total
          this.listLoading = false
        }).catch(() => {
          this.list = []
          this.total = 0
          this.listLoading = false
        })
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleDetail(row) {
      var that = this
      detailOrder(row.id).then(response => {
        that.orderDetail = response.data.data
      })
      this.orderDialogVisible = true
    },
    confirmShip(row) {
      this.shipForm.id = row.id
      this.shipForm.orderStatus = 301
      this.$confirm('确定发货?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        shipOrder(this.shipForm).then(response => {
          this.$notify.success({
            title: '成功',
            message: '确认发货成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch()
    },
    handleConfirm(row) {
      this.shipForm.id = row.id
      this.shipForm.orderStatus = 402
      this.$confirm('确定收货?', '', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        confirmOrder(this.shipForm).then(response => {
          this.$notify.success({
            title: '成功',
            message: '确认收货成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch()
    },
    handleDelete(row) {
      this.$confirm('确定删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteOrder({ id: row.id }).then(response => {
          this.$notify.success({
            title: '成功',
            message: '订单删除成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch()
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['订单ID', '订单编号', '用户ID', '订单状态', '是否删除', '收货人', '收货联系电话', '收货地址']
        const filterVal = ['id', 'orderSn', 'userId', 'orderStatus', 'isDelete', 'consignee', 'mobile', 'address']
        excel.export_json_to_excel2(tHeader, this.list, filterVal, '订单信息')
        this.downloadLoading = false
      })
    },
    // 打印
    printOrder() {
      this.$print(this.$refs.print)
      this.orderDialogVisible = false
    }
  }
}
</script>
