import type { AxiosResponse, AxiosError, ResponseType } from 'axios';
import axios from 'axios';

export declare interface FetchOptions {
  method?: string,
  upload?: boolean,
  data?: any,
  json?: boolean,
  cache?: boolean,
  headers?: any,
  errorMessage?: string | boolean,
  responseType?: ResponseType,
  onUploadProgress?: (progress: any) => void,
  onUploadPercent?: (percent: number, progressEvent: any) => void,
}

export declare interface FetchResult {
  isSuccess: boolean,
  code: number | string,
  msg?: string,
  data?: any,
  $response?: AxiosResponse | AxiosError | Error,
}

const DEFAULT_ERROR_CODE = 99999;

// 创建axios实例
const instance = axios.create({
  baseURL: '',
  timeout: 30000,
});

// request拦截器
instance.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = config.data;
  }
  return config;
}, error => {
  // Do something with request error
  console.error(error) // for debug
  Promise.reject(error)
});

export async function $fetch(url: string, inputOptions: FetchOptions = {}): Promise<FetchResult> {
  const options = { ...inputOptions };

  if (!options.method) {
    options.method = 'post';
  }

  if (!options.data) {
    options.data = {};
  }

  if (!options.headers) {
    options.headers = {};
  }
  if (options.upload === true) {
    const fd = new FormData();

    for (const key in options.data) {
      if (Object.prototype.hasOwnProperty.call(options.data, key)) {
        const value = options.data[key];

        if (value === undefined) {
          continue;
        }

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === 'object') {
              for (const subKey in item) {
                if (Object.prototype.hasOwnProperty.call(item, subKey)) {
                  fd.append(`${key}[${index}][${subKey}]`, item[subKey]);
                }
              }
            }
            else {
              fd.append(`${key}[]`, item);
            }
          });
        }
        else {
          fd.append(key, value);
        }
      }
    }

    options.data = fd;
  }
  else if (options.method === 'post') {
    if (options.json !== false) {
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
    }
    else {
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
  }

  if (options.method.toLowerCase() === 'get' && options.cache !== true) {
    options.data._ = String(+new Date()) + String(Math.floor(Math.random() * 9999));
  }

  if (!options.onUploadProgress && options.onUploadPercent) {
    options.onUploadProgress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        options.onUploadPercent?.(Math.floor((progressEvent.loaded / progressEvent.total) * 100), progressEvent);
      }
    }
  }

  let result: FetchResult;

  try {
    const response = await instance(url, options);

    if (options.responseType === 'blob') {
      // 当 responseType 是 blob 时，处理 blob 数据
      // 例如，你可能需要将 blob 转换为文件、URL 或其他格式
      result = {
        isSuccess: true,
        code: 0,
        data: response.data, // 这里 response.data 将是 Blob 类型
        msg: '',
        $response: response,
      };
    } else {
      // 当 responseType 不是 blob 时，使用原始的处理逻辑
      result = {
        isSuccess: response?.data.success ?? true,
        code: response?.data.code ?? 0,
        data: response?.data.data,
        msg: response?.data.message,
        $response: response,
      };
    }
  }
  catch (error: any) {
    if (axios.isAxiosError(error)) {
      const response = error.response;

      result = {
        isSuccess: response?.data.success ?? false,
        code: response?.data.error.code ?? DEFAULT_ERROR_CODE,
        data: response?.data.error.details,
        msg: response?.data.error.message || response?.data.message,
        $response: response,
      }
    }
    else {
      result = {
        isSuccess: false,
        code: DEFAULT_ERROR_CODE,
        msg: error.message,
        $response: error,
      }
    }
  }

  return result;
}
