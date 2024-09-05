import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StandardResponse } from '../dto/standard-response.dto';
import { ResponseService } from '../services/response.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly responseService: ResponseService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Log detailed error for debugging
    this.logger.error(
      `HTTP Status: ${status} Error Message: ${message}`,
      exception instanceof Error ? exception.stack : '',
    );

    // Create a standardized error response
    const errorResponse: StandardResponse<null> = this.responseService.error(
      status === HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Something went wrong. Please try again later.'
        : message,
    );

    // Add details if available
    if (exception instanceof HttpException) {
      const responseMessage = exception.getResponse();
      if (
        typeof responseMessage === 'object' &&
        responseMessage.hasOwnProperty('message')
      ) {
        errorResponse.errors = [(responseMessage as any).message]; // Include additional error details
      }
    }

    // Send the standardized error response
    response.status(status).json(errorResponse);
  }
}
