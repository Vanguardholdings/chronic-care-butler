// src/composables/useParallax.ts
import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useParallax(intensity: number = 0.02) {
  const offsetX = ref(0)
  const offsetY = ref(0)

  function handleScroll() {
    const scrollY = window.scrollY
    offsetY.value = scrollY * intensity
  }

  function handleMouseMove(e: MouseEvent) {
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    offsetX.value = (e.clientX - centerX) * intensity
    offsetY.value = (e.clientY - centerY) * intensity
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('mousemove', handleMouseMove)
  })

  return { offsetX, offsetY }
}