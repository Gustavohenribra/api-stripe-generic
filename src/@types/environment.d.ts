declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'dev' | 'prod';
  
        PORT: string;
        
        API_KEY:string;

        STRIPE_PUBLISH_KEY: string;
        STRIPE_SECRET_KEY: string;
        STRIPE_WEBHOOK_SECRET: string;
    }
  }
  }
  
  export { };