import { useToast } from 'vue-toast-notification'
// import 'vue-toast-notification/dist/theme-default.css'
import 'vue-toast-notification/dist/theme-bootstrap.css'
// import 'vue-toast-notification/dist/theme-sugar.css'

export default defineNuxtPlugin((_nuxtApp) => {
    return {
        provide: {
            toast: useToast()
        }
    }
})