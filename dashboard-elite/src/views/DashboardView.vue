<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">Dashboard</h1>
        <p class="text-body-2 text-grey">Real-time patient monitoring and adherence tracking</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" size="large" rounded="lg">
        Add Patient
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" variant="outlined">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-grey mb-1">Total Patients</p>
                <p class="text-h3 font-weight-bold">156</p>
                <p class="text-caption text-success mt-1">
                  <v-icon icon="mdi-arrow-up" size="small"></v-icon>
                  +5 today
                </p>
              </div>
              <v-avatar color="primary" size="56" rounded="lg">
                <v-icon icon="mdi-account-group" size="28" color="white"></v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" variant="outlined">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-grey mb-1">Today's Adherence</p>
                <p class="text-h3 font-weight-bold">87.5%</p>
                <p class="text-caption text-success mt-1">
                  <v-icon icon="mdi-arrow-up" size="small"></v-icon>
                  +2.3% from yesterday
                </p>
              </div>
              <v-avatar color="success" size="56" rounded="lg">
                <v-icon icon="mdi-check-circle" size="28" color="white"></v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" variant="outlined">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-grey mb-1">Pending Tasks</p>
                <p class="text-h3 font-weight-bold">12</p>
                <p class="text-caption text-warning mt-1">
                  <v-icon icon="mdi-alert" size="small"></v-icon>
                  3 urgent
                </p>
              </div>
              <v-avatar color="warning" size="56" rounded="lg">
                <v-icon icon="mdi-clipboard-list" size="28" color="white"></v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" variant="outlined">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-grey mb-1">Critical Alerts</p>
                <p class="text-h3 font-weight-bold">3</p>
                <p class="text-caption text-error mt-1">
                  <v-icon icon="mdi-alert-circle" size="small"></v-icon>
                  Action needed
                </p>
              </div>
              <v-avatar color="error" size="56" rounded="lg">
                <v-icon icon="mdi-heart-pulse" size="28" color="white"></v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content Grid -->
    <v-row>
      <!-- Patient Table -->
      <v-col cols="12" lg="8">
        <v-card variant="outlined" class="fill-height">
          <v-card-title class="d-flex align-center py-4 px-6">
            <span class="text-h6">Recent Patients</span>
            <v-spacer></v-spacer>
            <v-btn variant="text" color="primary" size="small">View All</v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-data-table
            :headers="headers"
            :items="patients"
            density="comfortable"
            hover
            class="healthcare-table"
          >
            <template v-slot:item.patient="{ item }">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="36" class="mr-3">
                  <span class="text-white font-weight-bold">{{ item.name[0] }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption text-grey">{{ item.age }} years • {{ item.gender }}</div>
                </div>
              </div>
            </template>

            <template v-slot:item.conditions="{ item }">
              <v-chip
                v-for="condition in item.conditions"
                :key="condition"
                size="small"
                color="info"
                variant="outlined"
                class="mr-1"
              >
                {{ condition }}
              </v-chip>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="elevated"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:item.adherence="{ item }">
              <div class="d-flex align-center">
                <v-progress-linear
                  :model-value="item.adherence"
                  :color="getAdherenceColor(item.adherence)"
                  height="6"
                  rounded
                  class="mr-2"
                  style="width: 60px;"
                ></v-progress-linear>
                <span class="text-caption">{{ item.adherence }}%</span>
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-btn icon="mdi-eye" variant="text" size="small" color="primary"></v-btn>
              <v-btn icon="mdi-pencil" variant="text" size="small" color="grey"></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <!-- Task Queue -->
      <v-col cols="12" lg="4">
        <v-card variant="outlined" class="fill-height">
          <v-card-title class="d-flex align-center py-4 px-6">
            <span class="text-h6">Task Queue</span>
            <v-spacer></v-spacer>
            <v-chip color="error" size="small">{{ urgentTasks.length }} Urgent</v-chip>
          </v-card-title>
          <v-divider></v-divider>
          <v-list class="pa-0">
            <v-list-item
              v-for="task in tasks"
              :key="task.id"
              class="px-6 py-3"
            >
              <template v-slot:prepend>
                <v-avatar :color="getPriorityColor(task.priority)" size="8" rounded="circle" class="mr-3"></v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">{{ task.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{ task.patient }}</v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  icon="mdi-check"
                  variant="text"
                  size="small"
                  color="success"
                  @click="completeTask(task.id)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions class="pa-4">
            <v-btn variant="outlined" color="primary" block>View All Tasks</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Row -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card variant="outlined">
          <v-card-title class="py-4 px-6">
            <span class="text-h6">Adherence Trends</span>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-center" style="height: 300px;">
              <div class="text-center">
                <v-icon icon="mdi-chart-line" size="64" color="grey" class="mb-4"></v-icon>
                <p class="text-h6 text-grey">Adherence Analytics</p>
                <p class="text-body-2 text-grey">ECharts integration ready</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const headers = [
  { title: 'Patient', key: 'patient', sortable: true },
  { title: 'Room/Bed', key: 'room', sortable: true },
  { title: 'Conditions', key: 'conditions', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Adherence', key: 'adherence', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' },
]

const patients = ref([
  {
    id: 1,
    name: '张建国',
    age: 68,
    gender: 'Male',
    room: '301-A',
    conditions: ['Hypertension', 'Diabetes'],
    status: 'Active',
    adherence: 92,
  },
  {
    id: 2,
    name: '李秀英',
    age: 72,
    gender: 'Female',
    room: '302-B',
    conditions: ['Hypertension'],
    status: 'Critical',
    adherence: 45,
  },
  {
    id: 3,
    name: '王明华',
    age: 65,
    gender: 'Male',
    room: '303-C',
    conditions: ['Diabetes'],
    status: 'Active',
    adherence: 87,
  },
])

const tasks = ref([
  { id: 1, title: 'Missed medication', patient: '张建国', priority: 'high' },
  { id: 2, title: 'Blood pressure alert', patient: '李秀英', priority: 'urgent' },
  { id: 3, title: 'Follow-up required', patient: '王明华', priority: 'medium' },
])

const urgentTasks = tasks.value.filter(t => t.priority === 'urgent')

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Active': 'success',
    'Critical': 'error',
    'Inactive': 'grey',
  }
  return colors[status] || 'grey'
}

const getAdherenceColor = (value: number) => {
  if (value >= 90) return 'success'
  if (value >= 70) return 'warning'
  return 'error'
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    'urgent': 'error',
    'high': 'warning',
    'medium': 'info',
  }
  return colors[priority] || 'grey'
}

const completeTask = (id: number) => {
  const index = tasks.value.findIndex(t => t.id === id)
  if (index > -1) {
    tasks.value.splice(index, 1)
  }
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.healthcare-table :deep(.v-data-table__tr:hover) {
  background-color: rgba(59, 130, 246, 0.05);
}
</style>
