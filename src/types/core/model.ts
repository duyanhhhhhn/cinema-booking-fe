
import { appConfig } from '@/configs/appConfig'
import type { IServiceConstructorData } from './api'
import { Api } from './api'

export function getAdminTokenFn() {
  const token = localStorage.getItem(appConfig.adminAuthKey)

  if (!token) return null

  return token
}

/**
 * Core model, every model extend this class have a static init method use to implement http service adapter,
 * that's all
 */
export class Model {
  static api: Api
  static path: string
  static area: string

  static setup(
    modelConfig: IServiceConstructorData = {
      path: ''
    }
  ) {
    const { path, baseUrl, getTokenFn } = modelConfig

    this.api = new Api({
      path,
      baseUrl: baseUrl || appConfig.apiEndpoint,
      getTokenFn: getTokenFn || getAdminTokenFn
    })
    this.path = path
  }
}
