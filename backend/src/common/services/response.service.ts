import { Injectable } from '@nestjs/common';
import { StandardResponse } from '../dto/standard-response.dto';

@Injectable()
export class ResponseService {
  success<T>(message: string, data?: T): StandardResponse<T> {
    return {
      status: 'success',
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  error(message: string, errors?: any[]): StandardResponse<null> {
    return {
      status: 'error',
      message,
      errors,
      timestamp: new Date().toISOString(),
    };
  }
}