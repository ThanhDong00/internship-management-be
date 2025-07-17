export class ApiResponse<T> {
  message: string;
  statusCode: number;
  data?: T;
  errors?: any;

  constructor(message: string, statusCode: number, data?: T, errors?: any) {
    this.message = message;
    this.statusCode = statusCode;
    if (data !== null || data !== undefined) {
      this.data = data;
    }
    if (errors !== undefined) {
      this.errors = errors;
    }
  }

  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): ApiResponse<T> {
    return new ApiResponse(message, statusCode, data);
  }

  static error(
    message: string,
    statusCode: number = 500,
    errors?: any,
  ): ApiResponse<null> {
    return new ApiResponse(message, statusCode, null, errors);
  }
}
