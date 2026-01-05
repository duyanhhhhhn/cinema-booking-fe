import { appConfig } from '@/configs/appConfig'
import type { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios'
import axios, { AxiosError } from 'axios'


interface IServerError {
  message: string
  error: string
  errors: Record<string, string[]> | string[][]
  code?: number
}

export interface IHttpError {
  status?: number
  status_code?: string
  message: string
  errors: Record<string, string[]> | string[][] | undefined
  error: boolean
  code?: number
}

export interface IPaginateResponse<T> {
  message: string
  data: T[]
  meta: {
    page: number
    total: number
    perPage: number
  }
}

export interface IResponse<T> {
  message: string
  data: T
}

export interface IServiceConstructorData {
  /**
   * The API Server base path, for example, `/posts`
   */
  path: string

  baseUrl?: string

  getTokenFn?: () => string | null | undefined

  model?: string

  headers?: Record<string, string>
}

export class Api {
  http: AxiosInstance = axios.create()

  path = ''

  /**
   * The service setting up responsibilities are:
   * - Set up the http client base url
   * @param config
   */
  constructor(config: IServiceConstructorData) {
    const { path, baseUrl, headers = {} } = config

    this.path = path
    let token = null

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken')
    }

    const instanceConfig: CreateAxiosDefaults = {
      headers: {
        ...headers,
        Authorization: token ? `Bearer ${token}` : undefined
      },
      baseURL: baseUrl || appConfig.apiEndpoint,
      paramsSerializer: {
        indexes: null
      }
    }

    this.http = axios.create(instanceConfig)
    
    // Request interceptor - Thêm token vào mỗi request
    this.http.interceptors.request.use(config => {
      // Lấy token mới nhất từ localStorage mỗi lần request
      if (typeof window !== 'undefined') {
        const currentToken = localStorage.getItem('accessToken')
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`
        }
      }
      
      // Không gửi Authorization header cho login endpoint
      if (config.url && config.url.includes('/auth/login')) {
        config.headers.Authorization = undefined
      }

      const lang = localStorage.getItem('i18nextLng') || localStorage.getItem('lang') || 'en'

      config.headers['X-Lang'] = lang

      return config
    })
    
    // Response interceptor - Xử lý auto refresh token khi 401
    this.http.interceptors.response.use(
      response => {
        if (response.data === 404 || response.data === 403) {
          throw new AxiosError('Not found', String(response.data))
        }
        return response
      },
      async (error) => {
        const originalRequest = error.config
        
        // Nếu lỗi 401 và chưa retry, thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          
          // Không refresh cho các endpoint auth
          if (originalRequest.url?.includes('/auth/login') || 
              originalRequest.url?.includes('/auth/refresh-token')) {
            return Promise.reject(error)
          }
          
          try {
            if (typeof window !== 'undefined') {
              const refreshToken = localStorage.getItem('refreshToken')
              
              if (!refreshToken) {
                // Không có refresh token, logout
                localStorage.removeItem('accessToken')
                localStorage.removeItem('expiresIn')
                localStorage.removeItem('refreshToken')
                return Promise.reject(error)
              }
              
              // Gọi API refresh token
              const refreshResponse = await axios.post(
                `${baseUrl || appConfig.apiEndpoint}/auth/refresh-token`,
                {},
                {
                  headers: {
                    Authorization: `Bearer ${refreshToken}`,
                  },
                }
              )
              
              const newToken = refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken
              
              if (newToken) {
                // Lưu token mới
                localStorage.setItem('accessToken', newToken)
                
                // Cập nhật expiresIn nếu có
                const expiresIn = refreshResponse.data?.data?.expiresIn || refreshResponse.data?.expiresIn
                if (expiresIn) {
                  const expiresTime = {
                    value: expiresIn,
                    expiresAt: Date.now() + expiresIn * 1000,
                  }
                  localStorage.setItem('expiresIn', JSON.stringify(expiresTime))
                }
                
                // Retry request với token mới
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return this.http(originalRequest)
              }
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError)
            // Refresh failed, logout
            if (typeof window !== 'undefined') {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('expiresIn')
              localStorage.removeItem('refreshToken')
            }
            return Promise.reject(refreshError)
          }
        }
        
        return this.handleError(error)
      }
    )
  }

  handleError(err: AxiosError<Partial<IServerError>>) {
    const finalError: IHttpError = {
      code: err.response?.data?.code ? Number(err.response?.data?.code) : err.code ? Number(err.code) : undefined,
      status: err.response?.status || err.status,
      message: err?.response?.data?.message || err?.response?.data?.error || err.message,
      errors: err.response?.data.errors,
      error: true
    }

    return Promise.reject(finalError)
  }

  /**
   * Overwrite GET method
   * @param config
   */
  get<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, ...requestConfig } = config

    return this.http.get<T>(url, requestConfig)
  }

  /**
   * Overwrite POST method
   * @param config
   */
  post<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...params } = config

    return this.http.post<T>(url, data, params)
  }

  /**
   * Overwrite POST FormData method
   * @param config
   */

  postFormData<T>(config: AxiosRequestConfig = {}) {
    const token = localStorage.getItem(`accessToken`)

    const { url = this.path, data, ...params } = config

    return this.http.post<T>(`${appConfig.apiEndpoint}${url}`, data, {
      ...params,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Overwrite PUT method
   * @param config
   */
  put<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...requestConfig } = config

    return this.http.put<T>(url, data, requestConfig)
  }

  putFormData(config: AxiosRequestConfig = {}) {
    const token = localStorage.getItem(`${process.env.VITE_APP_NAME}-token`)

    const { url = this.path, data, ...params } = config

    return this.http.put(`${process.env.VITE_END_PONIT}/${url}`, data, {
      ...params,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Overwrite PATCH method
   * @param config
   */
  patch<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...requestConfig } = config

    return this.http.patch<T>(url, data, requestConfig)
  }

  /**
   * Overwrite DELETE method
   * @param config
   */
  delete<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, ...requestConfig } = config

    return this.http.delete<T>(url, requestConfig)
  }

  /**
   * Upload
   * @return {Promise<T>}
   * @param config
   */
  upload<T>(config: AxiosRequestConfig = {}) {
    const { url = this.path, data, ...requestConfig } = config

    return this.http.post<T>(url, data, {
      ...requestConfig,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  uploadFile<T>(url: string, file: File, otherFields?: Record<string, any>) {
    const formData = new FormData()

    formData.append('file', file)

    if (otherFields) {
      Object.entries(otherFields).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    return this.upload<T>({ url, data: formData })
  }

  /**
   * Upload single file
   * @param {File} file
   * @param {string} url
   * @return {Promise<T>}
   */
  uploadSingleFile<T>(url: string, file: File, store_id: string) {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('store_id', store_id)

    return this.upload<T>({ url, data: formData })
  }

  /**
   * Download single file
   * @param url
   * @param fileName
   */
  async downloadFile(url: string, fileName: string, options?: AxiosRequestConfig) {
    const { data } = await this.http.get(url, {
      ...options,
      responseType: 'blob'
    })

    const link = document.createElement('a')

    link.href = URL.createObjectURL(new Blob([data]))
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
  }
}
