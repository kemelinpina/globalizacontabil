import axios, { AxiosError } from 'axios'

const api = axios.create({
  baseURL: '/api/pg',
  timeout: 300000, // 5 minutos
})

// Interceptor para fallback automático
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    if (error.response?.status === 404 && !error.config.__isRetryRequest) {
      error.config.__isRetryRequest = true
      error.config.baseURL = '/api'
      return axios(error.config)
    }
    return Promise.reject(error)
  }
)

export default api 