import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQueueStore = defineStore('queue', () => {
  const items = ref([])

  const pendingCount = computed(() => items.value.length)

  const fetchQueue = async () => {
    // TODO: Call API
    items.value = [
      {
        _id: '1',
        patient_name: '张大爷',
        issue: '未确认服药 - 降压药',
        priority: 'medium',
        created_at: new Date().toISOString()
      },
      {
        _id: '2',
        patient_name: '李阿姨',
        issue: '紧急: 胸痛',
        priority: 'urgent',
        created_at: new Date().toISOString()
      }
    ]
  }

  const completeItem = async (id) => {
    // TODO: Call API to mark complete
    items.value = items.value.filter(item => item._id !== id)
  }

  return {
    items,
    pendingCount,
    fetchQueue,
    completeItem
  }
})
