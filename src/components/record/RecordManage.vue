<template>
  <div>
    <div style="margin-bottom: 5px; margin-left: 5px">
      <el-input
        v-model="name"
        placeholder="请输入物品名称"
        suffix-icon="el-icon-search"
        style="width: 200px"
        @keyup.enter.native="loadPost"
      ></el-input>
      <el-select
        v-model="storage"
        placeholder="请选择仓库"
        style="margin-left: 10px"
      >
        <el-option
          v-for="item in storageData"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>
      <el-select
        v-model="goodstype"
        placeholder="请选择分类"
        style="margin-left: 10px"
      >
        <el-option
          v-for="item in goodstypeData"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        >
        </el-option>
      </el-select>

      <el-button type="primary" style="margin-left: 5px" @click="loadPost"
        >查询</el-button
      >
      <el-button type="success" @click="resetParam">重置</el-button>

      <el-button
        type="primary"
        style="display: inline-block; margin-left: 10px"
        @click="exportData"
        >导出</el-button
      >
    </div>

    <el-table
      :data="tableData"
      :header-cell-style="{ background: '#f2f5fc', color: '#555555' }"
      border
    >
      <el-table-column
        label="序号"
        width="60"
        type="index"
        :index="indexMethod"
      ></el-table-column>
      <el-table-column prop="goodsname" label="物品名称" width="120">
      </el-table-column>
      <el-table-column prop="storagename" label="所属仓库" width="120">
      </el-table-column>
      <el-table-column prop="goodstype" label="所属分类" width="120">
      </el-table-column>
      <el-table-column prop="adminname" label="操作人" width="120">
      </el-table-column>
      <el-table-column prop="username" label="申请人" width="120">
      </el-table-column>
      <el-table-column prop="count" label="物品数量" width="120">
      </el-table-column>
      <el-table-column prop="createtime" label="操作时间" width="180">
      </el-table-column>
      <el-table-column prop="remark" label="备注" width="350">
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pageNum"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
export default {
  name: "RecordManage",
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("CurUser")),
      storageData: [],
      goodstypeData: [],
      tableData: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      name: "",
      storage: "",
      goodstype: "",
      centerDialogVisible: false,
      form: {
        id: "",
        name: "",
        storage: "",
        goodstype: "",
        count: "",
        remark: "",
      },
    };
  },
  methods: {
    indexMethod(index) {
      return (this.pageNum - 1) * this.pageSize + index + 1;
    },
    exportData() {
      this.$axios
        .post(this.$httpUrl + "/record/listPage", {
          pageSize: 10000,
          pageNum: 1,
          param: {
            name: this.name,
            goodstype: this.goodstype + "",
            storage: this.storage + "",
            roleId: this.user.roleId + "",
            userId: this.user.id + "",
          },
        })
        .then((res) => res.data)
        .then((res) => {
          if (res.code == 200) {
            // 准备导出数据，添加序号字段
            const exportData = res.data.map((item, index) => ({
              序号: index + 1, // 添加前端连续序号
              物品名称: item.goodsname,
              所属仓库: item.storagename,
              所属分类: item.goodstype,
              操作人: item.adminname,
              申请人: item.username,
              物品数量: item.count,
              操作时间: item.createtime,
              备注: item.remark,
            }));

            // 创建工作表和簿
            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "出入库记录");

            // 生成Excel文件
            const excelBuffer = XLSX.write(wb, {
              bookType: "xlsx",
              type: "array",
            });

            // 创建并保存
            const blob = new Blob([excelBuffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, "出入库记录.xlsx");
          } else {
            this.$message.error("导出数据失败");
          }
        })
        .catch((error) => {
          console.error("导出出错:", error);
          this.$message.error("导出过程中发生错误");
        });
    },
    formatStorage(row) {
      let temp = this.storageData.find((item) => {
        return item.id == row.storage;
      });

      return temp && temp.name;
    },
    formatGoodstype(row) {
      let temp = this.goodstypeData.find((item) => {
        return item.id == row.goodstype;
      });
      return temp && temp.name;
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pageNum = 1;
      this.pageSize = val;
      this.loadPost();
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);
      this.pageNum = val;
      this.loadPost();
    },
    resetParam() {
      this.name = "";
      this.storage = "";
      this.goodstype = "";
    },
    loadPost() {
      this.$axios
        .post(this.$httpUrl + "/record/listPage", {
          pageSize: this.pageSize,
          pageNum: this.pageNum,
          param: {
            name: this.name,
            goodstype: this.goodstype + "",
            storage: this.storage + "",
            roleId: this.user.roleId + "",
            userId: this.user.id + "",
          },
        })
        .then((res) => res.data)
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            this.tableData = res.data;
            this.total = res.total;
          } else {
            alert("获取数据失败");
          }
        });
    },
    loadStorage() {
      this.$axios
        .get(this.$httpUrl + "/storage/list")
        .then((res) => res.data)
        .then((res) => {
          console.log(res);
          if (res.code == 200) {
            this.storageData = res.data;
          } else {
            alert("获取数据失败");
          }
        });
    },
    loadGoodsType() {
      this.$axios
        .get(this.$httpUrl + "/goodstype/list")
        .then((res) => res.data)
        .then((res) => {
          console.log("分类为" + res);
          if (res.code == 200) {
            this.goodstypeData = res.data;
          } else {
            alert("获取数据失败");
          }
        });
    },
  },
  beforeMount() {
    this.loadPost();
    this.loadStorage();
    this.loadGoodsType();
  },
};
</script>

<style scoped>
</style>