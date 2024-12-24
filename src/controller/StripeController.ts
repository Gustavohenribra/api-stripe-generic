import { Action } from "../interfaces/BaseController";
import StripeService from "../services/StripeService";
import Stripe from "stripe";

class StripeController {
    subscribe: Action = async (req, res, next) => {
        try {
            const { user, customer, currency, items, paymentMethodId } =
                req.body;

            if (
                !user ||
                !currency ||
                !items ||
                !items.length ||
                !paymentMethodId
            ) {
                res.status(400).json({
                    error: "User, currency, items e paymentMethodId são obrigatórios.",
                });
                return;
            }

            const customerData = customer
                ? { id: customer }
                : await StripeService.findOrCreateCustomer(
                      user,
                      paymentMethodId
                  );

            const subscription = await StripeService.createSubscription(
                customerData.id,
                items
            );

            res.status(201).json({
                message: "Subscrição criada com sucesso!",
                customer: customerData,
                subscription,
            });

            return;
        } catch (err: any) {
            res.status(500).json({
                error: "Erro ao criar subscrição. Tente novamente mais tarde.",
                details: err.message || "Erro desconhecido.",
            });
            next(err);
            return;
        }
    };

    cancelSubscription: Action = async (req, res, next) => {
        try {
            const { subscriptionId } = req.body;

            if (!subscriptionId) {
                res.status(400).json({
                    error: "O ID da assinatura é obrigatório.",
                });
                return;
            }

            const cancellationResult = await StripeService.cancelSubscription(
                subscriptionId
            );

            res.status(200).json({
                message: "Assinatura cancelada com sucesso!",
                cancellationResult,
            });
            return;
        } catch (err: any) {
            res.status(500).json({
                error: "Erro ao cancelar assinatura. Tente novamente mais tarde.",
                details: err.message || "Erro desconhecido.",
            });
            next(err);
            return;
        }
    };

    updateSubscription: Action = async (req, res, next) => {
        try {
            const { subscriptionId, newPriceId, upgradeNow } = req.body;

            if (!subscriptionId || !newPriceId) {
                res.status(400).json({
                    error: "O ID da assinatura e o novo priceId são obrigatórios.",
                });
                return;
            }

            const currentSubscription = await StripeService.getSubscription(
                subscriptionId
            );

            if (!currentSubscription) {
                res.status(404).json({
                    error: "Assinatura não encontrada.",
                });
                return;
            }

            const updatedSubscription =
                await StripeService.updateSubscriptionItems(
                    subscriptionId,
                    newPriceId,
                );

            res.status(200).json({
                message: "Assinatura atualizada com sucesso!",
                updatedSubscription,
            });
        } catch (err: any) {
            res.status(500).json({
                error: "Erro ao atualizar assinatura. Tente novamente mais tarde.",
                details: err.message || "Erro desconhecido.",
            });
            next(err);
            return;
        }
    };

    handleWebhook: Action = async (req, res, next) => {
        const sig = req.headers["stripe-signature"] as string;

        let event: Stripe.Event;

        try {
            event = StripeService.verifyWebhook(req.body, sig);
        } catch (err: any) {
            res.status(400).send({ error: `Webhook Error: ${err.message}` });
            next(err);
            return;
        }

        const processedData: any[] = [];

        try {
            switch (event.type) {
                case "customer.subscription.created":
                case "customer.subscription.updated":
                    const subscriptionData =
                        this.extractSubscriptionData(event);
                    processedData.push({
                        eventType: event.type,
                        data: subscriptionData,
                    });
                    break;
                case "customer.subscription.deleted":
                    const deletedSubscriptionData =
                        this.extractSubscriptionData(event);
                    processedData.push({
                        eventType: event.type,
                        data: deletedSubscriptionData,
                    });
                    break;
                case "invoice.payment_succeeded":
                case "invoice.payment_failed":
                    const invoiceData = this.extractInvoiceData(event);
                    processedData.push({
                        eventType: event.type,
                        data: invoiceData,
                    });
                    break;
            }
            console.log(processedData);
            res.status(200).json({
                processedEvents: processedData,
            });
            return;
        } catch (err: any) {
            res.status(500).json({
                error: "Erro ao processar evento do webhook.",
                details: err.message || "Erro desconhecido.",
            });
            next(err);
            return;
        }
    };

    private extractSubscriptionData(event: Stripe.Event): Record<string, any> {
        const subscription = event.data.object as Stripe.Subscription;
        return {
            subscriptionId: subscription.id,
            customerId: subscription.customer,
            status: subscription.status,
            items: subscription.items.data.map((item) => ({
                priceId: item.price.id,
                quantity: item.quantity,
            })),
            startDate: subscription.start_date,
            currentPeriodEnd: subscription.current_period_end,
        };
    }

    private extractInvoiceData(event: Stripe.Event): Record<string, any> {
        const invoice = event.data.object as Stripe.Invoice;
        return {
            invoiceId: invoice.id,
            customerId: invoice.customer,
            amountPaid: invoice.amount_paid,
            status: invoice.status,
            paymentIntentId: invoice.payment_intent,
            subscriptionId: invoice.subscription,
        };
    }
}

export default new StripeController();
