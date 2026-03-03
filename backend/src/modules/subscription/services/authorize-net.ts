import ApiContracts from 'authorizenet/lib/apicontracts';
import ApiControllers from 'authorizenet/lib/apicontrollers';

export interface AuthorizeNetConfig {
  apiLogin?: string;
  transactionKey?: string;
  environment?: 'production' | 'sandbox';
}

export interface CreateSubscriptionRequest {
  customerProfileId?: string;
  customerPaymentProfileId?: string;
  paymentToken?: string;
  email?: string;
  customerId?: string;
  planId: string;
  amount: number;
  interval: 'months' | 'weeks' | 'days';
  intervalLength: number;
  startDate?: string;
  totalOccurrences?: number;
}

export class AuthorizeNetService {
  private apiLogin: string;
  private transactionKey: string;
  private environment: string;
  private environmentUrl: string;

  constructor(config?: AuthorizeNetConfig) {
    this.apiLogin = config?.apiLogin || process.env.AUTHORIZE_NET_API_LOGIN || '';
    this.transactionKey = config?.transactionKey || process.env.AUTHORIZE_NET_TRANSACTION_KEY || '';
    
    const env = config?.environment || process.env.AUTHORIZE_NET_ENVIRONMENT || 'sandbox';
    this.environment = env === 'production' ? 'production' : 'sandbox';
    this.environmentUrl = this.environment === 'production'
      ? 'https://api.authorize.net/xml/v1/request.api'
      : 'https://apitest.authorize.net/xml/v1/request.api';

    if (!this.apiLogin || !this.transactionKey) {
      throw new Error('Authorize.Net credentials not configured');
    }
  }

  getEnvironment(): string {
    return this.environment;
  }

  isSandbox(): boolean {
    return this.environment === 'sandbox';
  }

  private getMerchantAuth(): ApiContracts.MerchantAuthenticationType {
    const merchantAuth = new ApiContracts.MerchantAuthenticationType();
    merchantAuth.setName(this.apiLogin);
    merchantAuth.setTransactionKey(this.transactionKey);
    return merchantAuth;
  }

  async createSubscription(request: CreateSubscriptionRequest): Promise<{
    success: boolean;
    subscriptionId: string;
    customerProfileId?: string;
    customerPaymentProfileId?: string;
  }> {
    return new Promise((resolve, reject) => {
      const merchantAuth = this.getMerchantAuth();

      const interval = new ApiContracts.PaymentScheduleType.Interval();
      interval.setLength(request.intervalLength);
      interval.setUnit(ApiContracts.ARBSubscriptionUnitEnum[request.interval.toUpperCase()]);

      const paymentSchedule = new ApiContracts.PaymentScheduleType();
      paymentSchedule.setInterval(interval);
      paymentSchedule.setStartDate(request.startDate || new Date().toISOString().split('T')[0]);
      paymentSchedule.setTotalOccurrences(request.totalOccurrences || 9999);

      const subscription = new ApiContracts.ARBSubscriptionType();
      subscription.setName(request.planId);
      subscription.setPaymentSchedule(paymentSchedule);
      subscription.setAmount(request.amount);

      if (request.paymentToken) {
        const opaqueData = new ApiContracts.OpaqueDataType();
        opaqueData.setDataDescriptor('COMMON.ACCEPT.INAPP.PAYMENT');
        opaqueData.setDataValue(request.paymentToken);

        const payment = new ApiContracts.PaymentType();
        payment.setOpaqueData(opaqueData);

        subscription.setPayment(payment);

        const billTo = new ApiContracts.NameAndAddressType();
        billTo.setFirstName('Customer');
        billTo.setLastName('User');
        subscription.setBillTo(billTo);

        if (request.email) {
          const customer = new ApiContracts.CustomerType();
          customer.setEmail(request.email);
          if (request.customerId) {
            customer.setId((request.customerId || request.email).substring(0, 20));
          }
          subscription.setCustomer(customer);
        }
      } else if (request.customerProfileId && request.customerPaymentProfileId) {
        const customerProfileId = new ApiContracts.CustomerProfileIdType();
        customerProfileId.setCustomerProfileId(request.customerProfileId);
        customerProfileId.setCustomerPaymentProfileId(request.customerPaymentProfileId);
        subscription.setProfile(customerProfileId);
      } else {
        reject(new Error('Either paymentToken or customerProfileId/customerPaymentProfileId required'));
        return;
      }

      const createRequest = new ApiContracts.ARBCreateSubscriptionRequest();
      createRequest.setMerchantAuthentication(merchantAuth);
      createRequest.setSubscription(subscription);

      const ctrl = new ApiControllers.ARBCreateSubscriptionController(createRequest.getJSON());
      ctrl.setEnvironment(this.environmentUrl);

      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new ApiContracts.ARBCreateSubscriptionResponse(apiResponse);

        if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          resolve({
            success: true,
            subscriptionId: response.getSubscriptionId(),
            customerProfileId: response.getProfile()?.getCustomerProfileId(),
            customerPaymentProfileId: response.getProfile()?.getCustomerPaymentProfileId(),
          });
        } else {
          const errorCode = response.getMessages().getMessage()[0].getCode();
          const errorMessage = response.getMessages().getMessage()[0].getText();
          reject(new Error(`Authorize.Net Error [${errorCode}]: ${errorMessage}`));
        }
      });
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const merchantAuth = this.getMerchantAuth();

      const cancelRequest = new ApiContracts.ARBCancelSubscriptionRequest();
      cancelRequest.setMerchantAuthentication(merchantAuth);
      cancelRequest.setSubscriptionId(subscriptionId);

      const ctrl = new ApiControllers.ARBCancelSubscriptionController(cancelRequest.getJSON());
      ctrl.setEnvironment(this.environmentUrl);

      ctrl.execute(() => {
        const apiResponse = ctrl.getResponse();
        const response = new ApiContracts.ARBCancelSubscriptionResponse(apiResponse);

        if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
          resolve({ success: true });
        } else {
          reject(new Error(response.getMessages().getMessage()[0].getText()));
        }
      });
    });
  }
}

export default AuthorizeNetService;
