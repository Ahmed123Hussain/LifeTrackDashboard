export class ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: any;

  constructor(success: boolean, message: string, data?: any, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}

export const successResponse = (data: any, message: string = 'Success') => {
  return new ApiResponse(true, message, data);
};

export const errorResponse = (message: string, error?: any) => {
  return new ApiResponse(false, message, null, error);
};
