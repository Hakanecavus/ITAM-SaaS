import Iyzipay from 'iyzipay';

// Iyzico Sandbox or Production keys from Environment Variables
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || 'sandbox-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-secret-key',
  uri: process.env.IYZICO_URI || 'https://sandbox-api.iyzipay.com'
});

export default iyzipay;
