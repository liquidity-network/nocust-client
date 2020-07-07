import axios from 'axios'

import { store } from '../../store'
import { NCServerError, NCServerErrorCode } from '../../helpers/errors'

type RestVerb = 'get' | 'post' | 'put' | 'delete'
export async function request(url: string, method: RestVerb, data?: Object, params?: Object) {
  // console.log('request', method, store.operatorUrl + url, data ?? '')

  try {
    const response = await axios({
      method,
      url: store.operatorUrl + url,
      data,
      params,
    })
    // log('api response', response.data)

    // Check due to axios bug - https://github.com/axios/axios/issues/61
    if (typeof response.data === 'string') {
      throw new Error('Invalid JSON of server response')
    }

    return response.data
  } catch (e) {
    if (e.response?.status === 404) {
      // console.log('Error:', e.response.data)
      return Promise.reject(new NCServerError(NCServerErrorCode.NOT_FOUND))
    } else if (e.response?.status >= 500) {
      // console.log('Error:', e.response.data)
      return Promise.reject(new NCServerError(NCServerErrorCode.INTERNAL_ERROR))
    } else if (e.response?.status === 400) {
      if (Array.isArray(e.response.data)) {
        return Promise.reject(
          new NCServerError(e.response.data[0].code, e.response.data[0].message),
        )
      } else if (e.response.data.non_field_errors) {
        return Promise.reject(
          new NCServerError(
            e.response.data.non_field_errors[0].code,
            e.response.data.non_field_errors[0].message,
          ),
        )
      } else {
        console.log('Error:', e.response.data)
        return Promise.reject(
          new NCServerError(NCServerErrorCode.UNKNOWN_ERROR, '', { e: e.response }),
        )
      }
    } else {
      return Promise.reject(
        new NCServerError(NCServerErrorCode.UNKNOWN_ERROR, '', { e: e.response }),
      )
    }
  }
}
