export class ApiError extends Error {
  code: string;
  requestId?: string;
  statusCode: number;
  retryAfter?: number;

  constructor(
    message: string,
    code: string,
    statusCode: number,
    requestId?: string,
    retryAfter?: number
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.retryAfter = retryAfter;
  }
}
