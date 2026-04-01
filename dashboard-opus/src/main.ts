// src/main.ts
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import App from './App.vue'
import router from './router'
import './styles/global.scss'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'healthcareLight',
    themes: {
      healthcareLight: {
        dark: false,
        colors: {
          background: '#f0f4f8',
          surface: '#ffffff',
          primary: '#2563eb',
          secondary: '#6366f1',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#6366f1',
          'on-background': '#1e293b',
          'on-surface': '#1e293b',
        }
      }
    }
  },
  defaults: {
    VBtn: {
      variant: 'flat',
      rounded: 'lg',
    },
    VCard: {
      rounded: 'lg',
      flat: true,
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
    }
  }
})

const app = createApp(App)
app.use(vuetify)
app.use(router)
app.mount('#app')