class HttpException {
    public status: number;
  
    public message: string;
  
    public handlers: { [key: string]: unknown };
  
    constructor(status: number, message: string, handlers = {}) {
      this.status = status;
      this.message = message;
      this.handlers = handlers;
    }
  }
  
  export default HttpException;