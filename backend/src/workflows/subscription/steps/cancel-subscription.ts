import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { SUBSCRIPTION_MODULE } from '../../../modules/subscription';
import SubscriptionService from '../../../modules/subscription/service';
import AuthorizeNetService from '../../../modules/subscription/services/authorize-net';

export interface CancelSubscriptionInput {
  subscription_id: string;
}

export const cancelSubscriptionStep = createStep(
  'cancel-subscription-step',
  async (input: CancelSubscriptionInput, { container }) => {
    const subscriptionService: SubscriptionService =
      container.resolve(SUBSCRIPTION_MODULE);
    const authorizeNetService = new AuthorizeNetService();

    const subscription = await subscriptionService.retrieveSubscription(
      input.subscription_id,
    );

    // Cancel in Authorize.Net first
    if (
      subscription.authorize_subscription_id &&
      !subscription.authorize_subscription_id.startsWith('TEST_')
    ) {
      await authorizeNetService.cancelSubscription(
        subscription.authorize_subscription_id,
      );
    }

    // Update subscription status in database
    const [updated] = await subscriptionService.updateSubscriptions([{
      selector: { id: input.subscription_id },
      data: {
        status: 'canceled',
        canceled_at: new Date(),
      },
    }]);

    return new StepResponse(updated);
  },
);
