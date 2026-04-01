// src/composables/use3DCard.ts
import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

interface Use3DCardOptions {
  maxTilt?: number
  perspective?: number
  scale?: number
  speed?: number
  glare?: boolean
}

export function use3DCard(
  elementRef: Ref<HTMLElement | null>,
  options: Use3DCardOptions = {}
) {
  const {
    maxTilt = 8,
    perspective = 1000,
    scale = 1.02,
    speed = 400,
    glare = true
  } = options

  const tiltX = ref(0)
  const tiltY = ref(0)
  const isHovering = ref(false)
  const glarePosition = ref({ x: 50, y: 50 })

  let rafId: number | null = null
  let currentTiltX = 0
  let currentTiltY = 0
  let targetTiltX = 0
  let targetTiltY = 0

  function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  }

  function animate() {
    currentTiltX = lerp(currentTiltX, targetTiltX, 0.08)
    currentTiltY = lerp(currentTiltY, targetTiltY, 0.08)
    tiltX.value = currentTiltX
    tiltY.value = currentTiltY

    if (
      Math.abs(currentTiltX - targetTiltX) > 0.01 ||
      Math.abs(currentTiltY - targetTiltY) > 0.01
    ) {
      rafId = requestAnimationFrame(animate)
    }
  }

  function handleMouseMove(e: MouseEvent) {
    if (!elementRef.value) return
    const rect = elementRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    targetTiltX = -(mouseY / (rect.height / 2)) * maxTilt
    targetTiltY = (mouseX / (rect.width / 2)) * maxTilt

    glarePosition.value = {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    }

    if (rafId === null) {
      rafId = requestAnimationFrame(animate)
    }
  }

  function handleMouseEnter() {
    isHovering.value = true
  }

  function handleMouseLeave() {
    isHovering.value = false
    targetTiltX = 0
    targetTiltY = 0
    if (rafId === null) {
      rafId = requestAnimationFrame(animate)
    }
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseenter', handleMouseEnter)
    el.addEventListener('mouseleave', handleMouseLeave)
  })

  onBeforeUnmount(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('mousemove', handleMouseMove)
    el.removeEventListener('mouseenter', handleMouseEnter)
    el.removeEventListener('mouseleave', handleMouseLeave)
    if (rafId !== null) cancelAnimationFrame(rafId)
  })

  const cardStyle = ref({})

  function getTransformStyle() {
    return {
      transform: `perspective(${perspective}px) rotateX(${tiltX.value}deg) rotateY(${tiltY.value}deg) scale3d(${isHovering.value ? scale : 1}, ${isHovering.value ? scale : 1}, ${isHovering.value ? scale : 1})`,
      transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
      transformStyle: 'preserve-3d' as const
    }
  }

  return {
    tiltX,
    tiltY,
    isHovering,
    glarePosition,
    getTransformStyle
  }
}