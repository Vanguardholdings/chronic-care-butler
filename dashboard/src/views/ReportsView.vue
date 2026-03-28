<template>
  <div class="reports">
    <h1>统计报告</h1>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>本周报告</span>
            <el-button style="float: right" type="primary" size="small">下载</el-button>
          </template>
          <p>生成时间: 2024-03-25</p>
          <p>依从性: 85.6%</p>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>本月报告</span>
            <el-button style="float: right" type="primary" size="small">下载</el-button>
          </template>
          <p>生成时间: 2024-03-01</p>
          <p>依从性: 83.2%</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.reports {
  padding: 20px;
}
</style>
