<template>
  <div>
    <div style="margin-bottom: 5px">
      <el-input
        v-model="name"
        placeholder="请输入仓库名"
        suffix-icon="el-icon-search"
        style="width: 200px"
        @keyup.enter.native="loadPost"
      ></el-input>
      <el-button type="primary" style="margin-left: 10px" @click="loadPost"
        >查询</el-button
      >
      <el-button type="success" @click="resetParam">重置</el-button>

      <el-button type="primary" style="margin-left: 10px" @click="add"
        >新增</el-button
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

      <el-button type="primary" style="margin-left: 10px" @click="exportStorage"
        >导出</el-button
      >
    </div>
    <el-table
      :data="tableData"
      :header-cell-style="{ background: '#f2f5fc', color: '#555555' }"
      border
    >
      <el-table-column label="序号" width="60" type="index" :index="indexMethod"></el-table-column>
      <el-table-column prop="name" label="仓库名" width="180"> </el-table-column>
      <el-table-column prop="remark" label="备注" width="350"> </el-table-column>
      
      <el-table-column prop="operate" label="操作">
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
      title="新增"
      :visible.sync="centerDialogVisible"
      width="30%"
      center
    >
      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="仓库名" prop="name">
          <el-col :span="20">
            <el-input v-model="form.name"></el-input>
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
  </div>
</template>

<script>
import { saveAs } from "file-saver";
import * as XLSX from 'xlsx'; 
export default {
  name: "StorageManage",
  data() {
    return {
      tableData: [],
      pageSize: 10,
      pageNum: 1,
      total: 0,
      name: "",
      isNewRecord: true,
      centerDialogVisible: false,
      uploadUrl: this.$httpUrl + '/storage/import',
      form: {
        id: "",
        name: "",
        remark: "",

      },
      rules: { 
        name: [{ required: true, message: "请输入仓库名", trigger: "blur" }],
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
            const requiredHeaders = ['仓库名称'];
            const headers = Object.keys(jsonData[0] || {});
            
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
              this.$message.error(`缺少必要列: ${missingHeaders.join(', ')}`);
              return reject(false);
            }
            
            // 验证数据
            const errors = [];
            jsonData.forEach((row, index) => {
              if (!row['仓库名称']) {
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
    exportStorage(){
      this.$axios({
        url: this.$httpUrl + "/storage/export",
        method: "get",
        responseType: "blob",
      })
        .then((response) => {
          saveAs(new Blob([response.data]), "仓库信息.xlsx");
          this.$message.success("导出成功");
        })
        .catch((error) => {
          console.error("导出失败:", error);
          this.$message.error("导出失败");
        });

    },
    resetParam() {
      this.name = "";
    },
    resetForm() {
      this.$refs.form.resetFields();
    },
    del(id) {
      console.log(id);
      this.$axios
        .get(this.$httpUrl + "/storage/del?id=" + id, this.form)
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
        this.form.remark = row.remark;
      });
    },
    add() {
      this.centerDialogVisible = true;
      this.$nextTick(() => {
        this.resetForm();
      });
    },
    doSave() {
      this.$axios
        .post(this.$httpUrl + "/storage/save", this.form)
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
        .post(this.$httpUrl + "/storage/update", this.form)
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
        .post(this.$httpUrl + "/storage/listPage", {
          pageSize: this.pageSize,
          pageNum: this.pageNum,
          param: {
            name: this.name,
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
  },
  beforeMount() {
    this.loadPost();
  },
};
</script>

<style scoped>
</style>