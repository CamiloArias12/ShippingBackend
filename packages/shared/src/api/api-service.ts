import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

type LoggerFunction = (message: string, meta?: object) => void;

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private logger?: LoggerFunction;
  host: string;
  
  constructor(host: string, logger?: LoggerFunction) {
    this.host = host;
    this.axiosInstance = axios.create({
      baseURL: host
    });
    this.logger = logger;
  }

  /**
   * Log messages if logger is enabled
   * @param message - Log message
   * @param meta - Additional meta information
   */
  private log(message: string, meta?: object) {
    if (this.logger) {
      this.logger(message, meta);
    }
  }

  /**
   * Send a GET request
   * @param path - The API path
   * @param params - Query parameters
   * @param config - Optional Axios request config
   * @returns Response data or null if request fails
   */
  async get(
    path: string,
    params?: object,
    config?: AxiosRequestConfig
  ): Promise<any | null> {
    this.log(`GET Request: ${path}`, { params });
    try {
      const response = await this.axiosInstance.get(path, {
        ...config,
        params
      });
      this.log(`GET Response: ${path}`, {
        status: response.status,
        data: response.data
      });
      return response;
    } catch (e) {
      const error = e as Error;
      this.log(`GET Error: ${path}`, { error: error.message });
      return null;
    }
  }

  /**
   * Send a POST request
   * @param path - The API path
   * @param data - The request body (JSON or FormData)
   * @param config - Optional Axios request config
   * @returns Response data or null if request fails
   */
  async post(
    path: string,
    data?: object | FormData,
    config?: AxiosRequestConfig
  ): Promise<any | null> {
    this.log(`POST Request: ${path}`, { data });
    try {
      const response = await this.axiosInstance.post(
        path,
        data,
        this.applyHeadersForData(data, config)
      );
      this.log(`POST Response: ${path}`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (e) {
      const error = e as any;
      if (error.response && error.response.status === 400) {
        this.log(`POST Error 400: ${path}`, { error: error.response.data });
        return error.response.data;
      }
      this.log(`POST Error: ${path}`, { error: error.message });
      return null;
    }
  }

  /**
   * Send a PUT request
   * @param path - The API path
   * @param data - The request body (JSON or FormData)
   * @param config - Optional Axios request config
   * @returns Response data or null if request fails
   */
  async put(
    path: string,
    data?: object | FormData,
    config?: AxiosRequestConfig
  ): Promise<any | null> {
    this.log(`PUT Request: ${path}`, { data });
    try {
      const response = await this.axiosInstance.put(
        path,
        data,
        this.applyHeadersForData(data, config)
      );
      this.log(`PUT Response: ${path}`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (e) {
      const error = e as Error;
      this.log(`PUT Error: ${path}`, { error: error.message });
      return null;
    }
  }

  /**
   * Send a PATCH request
   * @param path - The API path
   * @param data - The request body (JSON or FormData)
   * @param config - Optional Axios request config
   * @returns Response data or null if request fails
   */
  async patch(
    path: string,
    data?: object | FormData,
    config?: AxiosRequestConfig
  ): Promise<any | null> {
    this.log(`PATCH Request: ${path}`, { data });
    try {
      const response = await this.axiosInstance.patch(
        path,
        data,
        this.applyHeadersForData(data, config)
      );
      this.log(`PATCH Response: ${path}`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (e) {
      const error = e as Error;
      this.log(`PATCH Error: ${path}`, { error: error.message });
      return null;
    }
  }

  /**
   * Send a DELETE request
   * @param path - The API path
   * @param data - Optional body (JSON or FormData)
   * @param config - Optional Axios request config
   * @returns Response data or null if request fails
   */
  async delete(
    path: string,
    data?: object | FormData,
    config?: AxiosRequestConfig
  ): Promise<any | null> {
    this.log(`DELETE Request: ${path}`, { data });
    try {
      const response = await this.axiosInstance.delete(path, {
        ...this.applyHeadersForData(data, config),
        data
      });
      this.log(`DELETE Response: ${path}`, {
        status: response.status,
        data: response.data
      });
      return response.data;
    } catch (e) {
      const error = e as Error;
      this.log(`DELETE Error: ${path}`, { error: error.message });
      return null;
    }
  }

  /**
   * Determines if data is FormData and applies appropriate headers
   * @param data - The request body (JSON or FormData)
   * @param config - Existing Axios request config
   * @returns Updated Axios request config with headers
   */
  private applyHeadersForData(
    data: any,
    config?: AxiosRequestConfig
  ): AxiosRequestConfig {
    if (data instanceof FormData) {
      return {
        ...config,
        headers: {
          ...(config?.headers || {}),
          'Content-Type': 'multipart/form-data'
        }
      };
    }
    return config || {};
  }
}
