import { defineNuxtPlugin } from "#app"
import axios from 'axios'

export default defineNuxtPlugin((nuxtApp) => { 
    // set the base URL for axios
    const instance = axios.create({
        baseURL: process.env.NODE_ENV !== "production" ? 'http://localhost:8000/' : 'https://thinkitsfree.azurewebsites.net/'
    })

    // Interceptor to tattach the token to each request
    instance.interceptors.request.use(config => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    })

    instance.interceptors.response.use(response => {
        return response;
    }, async error => {
        const originalRequest = error.config
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            const refreshToken = localStorage.getItem('refresh_token')

            if (refreshToken) {
                try {
                    const response = await instance.post('api/token/refresh/', { refresh: refreshToken })
                    localStorage.setItem('access_token', response.data.access)
                    instance.defaults.headers.common['Authorization'] = 'Bearer ' + response.data.access
                    originalRequest.headers['Authorization'] = 'Bearer ' + response.data.access
                    return instance(originalRequest);
                } catch (error) {
                    localStorage.removeItem('access_token')
                    localStorage.removeItem('refresh_token')
                    nuxtApp.$router.push('/login')
                }
            } else {
                localStorage.removeItem('access_token')
                localStorage.removeItem('refresh_token')
                nuxtApp.$router.push('/login')
            }
        }
        return Promise.reject(error)
    })
    nuxtApp.provide('axios', instance)
})