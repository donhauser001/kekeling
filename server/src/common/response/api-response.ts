export class ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  static success<T>(data: T, message = 'success'): ApiResponse<T> {
    return new ApiResponse(0, message, data);
  }

  static error(message: string, code = -1): ApiResponse<null> {
    return new ApiResponse(code, message, null);
  }
}

