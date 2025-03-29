export class ResponseHttp<T> {
  status: number;
  message: string;
  data?: T | T[];
  error?: string;

  constructor(
    status: number,
    message: string,
    data?: T | T[],
    error?: string
  ) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.error = error;
  }
}
 