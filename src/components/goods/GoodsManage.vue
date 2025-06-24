<template>
  <div>
    <div style="margin-bottom: 10px; margin-left: 5px">
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
      <el-button type="primary" style="margin-left: 10px" @click="loadPost"
        >查询</el-button
      >
      <el-button type="success" @click="resetParam">重置</el-button>

      <el-button
        type="primary"
        style="margin-left: 10px"
        @click="add"
        v-if="user.roleId != 2"
        >新增</el-button
      >
      <el-button
        type="primary"
        style="margin-left: 10px"
        @click="inGoods"
        v-if="user.roleId != 2"
        >入库</el-button
      >
      <el-button
        type="primary"
        style="margin-left: 10px"
        @click="outGoods"
        v-if="user.roleId != 2"
        >出库</el-button
      >
      <el-upload
        :action="uploadUrl"
        style="display: inline-block; margin-left: 10px"
        :show-file-list="false"
        :on-success="handleImportSuccess"
        :on-error="handleImportError"
        :before-upload="beforeImportUpload"
        accept=".xlsx,.xls"
      >
        <el-button type="primary">导入</el-button>
      </el-upload>

      <el-button type="primary" style="margin-left: 10px" @click="exportGoods"
        >导出</el-button
      >
    </div>
    <el-table
      :data="tableData"
      :header-cell-style="{ background: '#f2f5fc', color: '#555555' }"
      border
      highlight-current-row
      @current-change="selectCurrentChange"
    >
      <el-table-column label="序号" width="60" type="index" :index="indexMethod"></el-table-column>
      <el-table-column prop="name" label="物品名称" width="180">
      </el-table-column>
      <el-table-column
        prop="storage"
        label="所属仓库"
        width="180"
        :formatter="formatStorage"
      >
      </el-table-column>
      <el-table-column
        prop="goodstype"
        label="所属分类"
        width="180"
        :formatter="formatGoodsType"
      >
      </el-table-column>
      <el-table-column prop="count" label="物品数量" width="130">
      </el-table-column>
      <el-table-column prop="remark" label="备注"> </el-table-column>

      <el-table-column prop="operate" label="操作" v-if="user.roleId != 2">
        <template slot-scope="scope">
          <el-button size="small" type="success" @click="mod(scope.row)"
            >编辑</el-button
          >
          <el-popconfirm
            title="确定删除吗？"
            @confirm="del(scope.row.id)"
            style="margin-left: 10px"
          >
            <el-button slot="reference" size="small" type="danger"
              >删除</el-button
            >
          </el-popconfirm>
        </template>
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

    <el-dialog
      :title="isNewRecord ? '新增' : '编辑'"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
    >
      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="物品名称" prop="name">
          <el-col :span="20">
            <el-input v-model="form.name"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="所属仓库" prop="storage">
          <el-col :span="20">
            <el-select
              v-model="form.storage"
              placeholder="请选择仓库"
              style="width: 100%"
            >
              <el-option
                v-for="item in storageData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="所属分类" prop="goodstype">
          <el-col :span="20">
            <el-select
              v-model="form.goodstype"
              placeholder="请选择分类"
              style="width: 100%"
            >
              <el-option
                v-for="item in goodstypeData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </el-col>
        </el-form-item>
        <el-form-item label="物品数量" prop="count">
          <el-col :span="20">
            <el-input v-model="form.count"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-col :span="20">
            <el-input type="textarea" v-model="form.remark"></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="operationType === 'in' ? '入库' : '出库'"
      :visible.sync="inDialogVisible"
      width="30%"
      center
    >
      <el-dialog
        width="50%"
        title="用户选择"
        :visible.sync="innerVisible"
        append-to-body
      >
        <select-user @doSelectUser="doSelectUser"></select-user>
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取 消</el-button>
          <el-button type="primary" @click="confirmUser">确 定</el-button>
        </span>
      </el-dialog>
      <el-form ref="form1" :rules="rules1" :model="form1" label-width="80px">
        <el-form-item label="物品名称">
          <el-col :span="20">
            <el-input v-model="form1.goodsname" readonly></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="申请人">
          <el-col :span="20">
            <el-input
              v-model="form1.username"
              readonly
              @click.native="selectUser"
            ></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="物品数量" prop="count">
          <el-col :span="20">
            <el-input v-model="form1.count"></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-col :span="20">
            <el-input type="textarea" v-model="form1.remark"></el-input>
          </el-col>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="inDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="doGoods" :disabled="!formValid"
          >{{ operationType === 'in' ? '确认入库' : '确认出库' }} </el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SelectUser from "../user/SelectUser.vue";
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx'; 
export default {
  components: { SelectUser },
  name: "GoodsManage",
  data() {
    let checkCount = (rule, value, callback) => {
      if (value > 9999) {
        callback(new Error("数量输⼊过⼤"));
      } else {
        callback();
      }
    };
    return {
      user: JSON.parse(sessionStorage.getItem("CurUser")),
      goodstypeData: [],
      storageData: [],
      tableData: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      name: "",
      goodstype: "",
      storage: "",
      isNewRecord: true,
      centerDialogVisible: false,
      inDialogVisible: false,
      innerVisible: false,
      operationType: 'in', // 'in'表示入库，'out'表示出库
      currentRow: {},
      formValid: false,
      tempUser: {},
      uploadUrl: this.$httpUrl + '/goods/import',

      form1: {
        goods: "",
        goodsname: "",
        count: "",
        username: "",
        userId: "",
        adminId: "",
        remark: "",
        action: "1",
      },

      form: {
        id: "",
        name: "",
        storage: "",
        goodstype: "",
        count: "",
        remark: "",
      },

      rules1: {
        count: [
          { required: true, message: "请输入数量", trigger: "blur" },
          {
            validator: (rule, value, callback) => {
              if (!value) {
                callback(new Error("请输入数量"));
              } else if (!/^[1-9]\d*$/.test(value)) {
                callback(new Error("请输入正整数"));
              } else if (
                this.form1.action === "2" &&
                parseInt(value) > parseInt(this.currentRow.count)
              ) {
                // 只有出库(action=2)时才检查库存
                callback(
                  new Error(
                    `出库数量不能大于当前库存(${this.currentRow.count})`
                  )
                );
              } else {
                callback();
              }
            },
            trigger: "blur",
          },
        ],
      },

      rules: {
        name: [{ required: true, message: "请输入物品名称", trigger: "blur" }],
        goodstype: [{ required: true, message: "请选择分类", trigger: "blur" }],
        storage: [{ required: true, message: "请选择仓库", trigger: "blur" }],
        count: [
          { required: true, message: "请输⼊数量", trigger: "blur" },
          {
            pattern: /^([1-9][0-9]*){1,4}$/,
            message: "数量必须为正整数字",
            trigger: "blur",
          },
          { validator: checkCount, trigger: "blur" },
        ],
      },
    };
  },
  methods: {
    indexMethod(index) {
      return (this.pageNum - 1) * this.pageSize + index + 1;
    },
    beforeImportUpload(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            // 验证表头
            const requiredHeaders = ['物品名称', '所属仓库', '所属分类', '物品数量'];
            const headers = Object.keys(jsonData[0] || {});
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
              this.$message.error(`缺少必要列: ${missingHeaders.join(', ')}`);
              return reject(false);
            }
            
            // 验证数据
            const errors = [];
            jsonData.forEach((row, index) => {
              if (!row['物品名称'] || !row['所属仓库'] || 
                  !row['所属分类'] || row['物品数量'] == null) {
                errors.push(`第${index + 2}行数据不完整`);
              }
            });
            
            if (errors.length > 0) {
              this.$message.error(`发现${errors.length}处数据问题，请修正后重新导入`);
              console.error('导入数据错误:', errors);
              return reject(false);
            }
            
            resolve(true);
          } catch (error) {
            this.$message.error('文件解析失败: ' + error.message);
            reject(false);
          }
        };
        reader.readAsArrayBuffer(file);
      });
    },
    
    handleImportSuccess(response) {
      if (response.code === 200) {
        this.$message.success( '导入成功');
        this.loadPost();
      } else {
        this.$message.error(response.msg || '导入失败');
      }
    },
    
    handleImportError(error) {
      this.$message.error('导入失败: ' + (error.message || '未知错误'));
    },
    exportGoods() {
      this.$axios({
        url: this.$httpUrl + "/goods/export",
        method: "get",
        responseType: "blob",
      })
        .then((response) => {
          saveAs(new Blob([response.data]), "物品信息.xlsx");
          this.$message.success("导出成功");
        })
        .catch((error) => {
          console.error("导出失败:", error);
          this.$message.error("导出失败");
        });
    },
    doSelectUser(val) {
      console.log(val);
      this.tempUser = val;
    },
    confirmUser() {
      this.form1.userId = this.tempUser.id;
      this.form1.username = this.tempUser.name;
      this.innerVisible = false;
    },
    selectUser() {
      this.innerVisible = true;
    },
    selectCurrentChange(val) {
      this.currentRow = val;
    },
    //
    outGoods() {
      if (!this.currentRow.id) {
        alert("请选择出库商品");
        return;
      }

      if (this.currentRow.count <= 0) {
        alert("该商品库存不足，无法出库！");
        return;
      }
      this.operationType = 'out';
      this.inDialogVisible = true;
      this.$nextTick(() => {
        this.resetInForm();
        this.$emit('refresh-charts');
        this.form1.goodsname = this.currentRow.name;
        this.form1.goods = this.currentRow.id;
        this.form1.adminId = this.user.id;
        this.form1.action = "2";

        // 确保表单引用存在后再设置监听
        if (this.$refs.form1) {
          this.$watch(
            () => [this.form1.count, this.form1.userId],
            () => {
              this.$refs.form1.validate((valid) => {
                this.formValid = valid;
              });
            },
            { immediate: true }
          );
        }
      });
    },

    inGoods() {
      if (!this.currentRow.id) {
        alert("请选择入库商品");
        return;
      }
      this.operationType = 'in';
      this.inDialogVisible = true;
      this.$nextTick(() => {
        this.resetInForm();
        this.$emit('refresh-charts');
        this.form1.goodsname = this.currentRow.name;
        this.form1.goods = this.currentRow.id;
        this.form1.adminId = this.user.id;
        this.form1.action = "1";

        // 确保表单引用存在后再设置监听
        if (this.$refs.form1) {
          this.$watch(
            () => [this.form1.count, this.form1.userId],
            () => {
              this.$refs.form1.validate((valid) => {
                this.formValid = valid;
              });
            },
            { immediate: true }
          );
        }
      });
    },
    formatStorage(row) {
      let temp = this.storageData.find((item) => {
        return item.id == row.storage;
      });
      return temp && temp.name;
    },
    formatGoodsType(row) {
      let temp = this.goodstypeData.find((item) => {
        return item.id == row.goodstype;
      });
      return temp && temp.name;
    },
    resetParam() {
      this.name = "";
      this.storage = "";
      this.goodstype = "";
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
    resetInForm() {
      this.$refs.form1.resetFields();
    },
    del(id) {
      console.log(id);
      this.$axios
        .get(this.$httpUrl + "/goods/del?id=" + id, this.form)
        //.then((res) => res.data)
        .then((res) => {
          console.log(res);
          if (res.status == 200) {
            this.$message({
              message: "删除成功",
              type: "success",
            });
            this.centerDialogVisible = false;
            this.loadPost();
          } else {
            this.$message({
              message: "删除失败",
              type: "error",
            });
          }
        });
    },
    mod(row) {
      this.centerDialogVisible = true;
      this.isNewRecord = false;
      this.$nextTick(() => {
        this.form.id = row.id;
        this.form.name = row.name;
        this.form.storage = row.storage;
        this.form.goodstype = row.goodstype;
        this.form.count = row.count;
        this.form.remark = row.remark;
      });
    },
    add() {
      this.isNewRecord = true ;
      this.centerDialogVisible = true;
      this.$nextTick(() => {
        this.resetForm();
        this.form.id = "";
      });
    },
    doSave() {
      this.$axios
        .post(this.$httpUrl + "/goods/save", this.form)
        //.then((res) => res.data)
        .then((res) => {
          console.log(res);
          if (res.status == 200) {
            this.$message({
              message: "新增成功",
              type: "success",
            });
            this.centerDialogVisible = false;
            this.loadPost();
          } else {
            this.$message({
              message: "新增失败",
              type: "error",
            });
          }
        });
    },
    doMod() {
      this.$axios
        .post(this.$httpUrl + "/goods/update", this.form)
        //.then((res) => res.data)
        .then((res) => {
          console.log(res);
          if (res.status == 200) {
            this.$message({
              message: "操作成功",
              type: "success",
            });
            this.centerDialogVisible = false;
            this.loadPost();
            this.resetForm();
          } else {
            this.$message({
              message: "操作失败",
              type: "error",
            });
          }
        });
    },
    save() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (this.form.id) {
            this.doMod();
          } else {
            this.doSave();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    doGoods() {
      this.$axios
        .post(this.$httpUrl + "/record/save", this.form1)
        //.then((res) => res.data)
        .then((res) => {
          console.log(res);
          if (res.status == 200) {
            this.$message({
              message: "操作成功",
              type: "success",
            });
            this.inDialogVisible = false;
            this.loadPost();
            this.resetInForm();
            // 新增：触发父组件的刷新事件
          
          } else {
            this.$message({
              message: "操作失败",
              type: "error",
            });
          }
        });
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
    loadPost() {
      this.$axios
        .post(this.$httpUrl + "/goods/listPage", {
          pageSize: this.pageSize,
          pageNum: this.pageNum,
          param: {
            name: this.name,
            goodstype: this.goodstype + "",
            storage: this.storage + "",
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
          console.log(res);
          if (res.code == 200) {
            this.goodstypeData = res.data;
          } else {
            alert("获取数据失败");
          }
        });
    },
  },

  beforeMount() {
    this.loadStorage();
    this.loadGoodsType();
    this.loadPost();
  },
};
</script>

<style scoped>
</style>