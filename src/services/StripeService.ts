import Stripe from "stripe";
import { User } from "../@types/UserTypes";

class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
            apiVersion: "2024-12-18.acacia",
        });
    }

    async findOrCreateCustomer(
        user: User,
        paymentMethodId: string
    ): Promise<Stripe.Customer> {
        try {
            const existingCustomers = await this.stripe.customers.list({
                email: user.email,
                limit: 1,
            });

            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0];
            }

            return await this.stripe.customers.create({
                email: user.email,
                name: user.name,
                payment_method: paymentMethodId,
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
        } catch (err: any) {
            console.error("Erro ao criar ou buscar cliente:", err);
            throw new Error(
                "Erro ao criar ou buscar cliente. Verifique os dados fornecidos."
            );
        }
    }

    async createSubscription(
        customerId: string,
        items: { price: string; quantity?: number }[]
    ): Promise<Stripe.Subscription> {
        try {
            return await this.stripe.subscriptions.create({
                customer: customerId,
                items: items.map((item) => ({
                    price: item.price,
                    quantity: 1,
                })),
                expand: ["latest_invoice.payment_intent"],
            });
        } catch (err: any) {
            console.error("Erro ao criar assinatura:", err);
            throw new Error(
                "Erro ao criar assinatura. Verifique os dados fornecidos."
            );
        }
    }

    async cancelSubscription(
        subscriptionId: string
    ): Promise<Stripe.Subscription> {
        try {
            return await this.stripe.subscriptions.update(subscriptionId, {
                cancel_at_period_end: true,
            });
        } catch (err) {
            console.error("Erro ao cancelar a assinatura:", err);
            throw new Error("Não foi possível cancelar a assinatura.");
        }
    }

    async getSubscription(
        subscriptionId: string
    ): Promise<Stripe.Subscription | null> {
        try {
            return await this.stripe.subscriptions.retrieve(subscriptionId);
        } catch (err) {
            console.error("Erro ao buscar assinatura:", err);
            return null;
        }
    }

    async updateSubscriptionItems(
        subscriptionId: string,
        newPriceId: string
    ): Promise<Stripe.Subscription | Stripe.SubscriptionSchedule> {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(
                subscriptionId
            );
    
            if (!subscription) {
                throw new Error("Assinatura não encontrada.");
            }
    
            await this.cancelSubscriptionSchedules(subscription.customer as string);
    
            const subscriptionItemId = subscription.items.data[0]?.id;
    
            const currentPriceId = subscription.items.data[0]?.price.id;
            const currentPrice = await this.stripe.prices.retrieve(currentPriceId);
            const newPrice = await this.stripe.prices.retrieve(newPriceId);
    
            if (!currentPrice || !newPrice) {
                throw new Error("Preços atuais ou novos não encontrados.");
            }
    
            const isUpgrade = newPrice.unit_amount! > currentPrice.unit_amount!;
    
            if (isUpgrade) {
                if (!subscriptionItemId) {
                    throw new Error("Nenhum item encontrado na assinatura.");
                }
    
                await this.stripe.subscriptionItems.update(subscriptionItemId, {
                    price: newPriceId,
                    proration_behavior: "always_invoice",
                    payment_behavior: "allow_incomplete",
                });
    
                return await this.stripe.subscriptions.retrieve(subscriptionId, {
                    expand: ["latest_invoice.payment_intent"],
                });
            } else {
                return await this.createSubscriptionSchedule(
                    subscriptionId,
                    subscription.customer as string,
                    newPriceId
                );
            }
        } catch (error: any) {
            console.error("Erro ao atualizar itens da assinatura:", error);
            throw new Error("Erro ao atualizar itens da assinatura.");
        }
    }    

    private async cancelSubscriptionSchedules(
        customerId: string
    ): Promise<void> {
        try {
            const subscriptionSchedules =
                await this.stripe.subscriptionSchedules.list({
                    customer: customerId,
                });
                console.log(subscriptionSchedules.data);
                for (const schedule of subscriptionSchedules.data) {
                    if (schedule.status === "active" || schedule.status === "not_started") {
                        await this.stripe.subscriptionSchedules.release(schedule.id);
                    }
                }
        } catch (error: any) {
            console.error("Erro ao cancelar schedules do cliente:", error);
            throw new Error("Erro ao cancelar schedules existentes.");
        }
    }

    private async createSubscriptionSchedule(
        subscriptionId: string,
        customerId: string,
        newPriceId: string
    ): Promise<Stripe.SubscriptionSchedule> {
        try {
            let schedule = await this.stripe.subscriptionSchedules.create({
                from_subscription: subscriptionId,
            });
    
            const currentPhase = schedule.phases[0];
    
            const currentPriceId =
                typeof currentPhase.items[0].price === "string"
                    ? currentPhase.items[0].price
                    : (currentPhase.items[0].price as Stripe.Price).id;
    
            if (!currentPriceId) {
                throw new Error("O preço atual não foi encontrado.");
            }
    
            schedule = await this.stripe.subscriptionSchedules.update(schedule.id, {
                phases: [
                    {
                        items: [
                            {
                                price: currentPriceId,
                                quantity: 1,
                            },
                        ],
                        start_date: currentPhase.start_date,
                        end_date: currentPhase.end_date,
                        proration_behavior: "none",
                    },
                    {
                        items: [
                            {
                                price: newPriceId,
                                quantity: 1,
                            },
                        ],
                        proration_behavior: "none",
                        iterations: 1,
                    },
                ],
            });
    
            return schedule;
        } catch (error: any) {
            console.error(
                "Erro ao criar ou atualizar o cronograma de assinatura:",
                error
            );
            throw new Error("Erro ao criar ou atualizar cronograma.");
        }
    }

    verifyWebhook(payload: Buffer, signature: string): Stripe.Event {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

        try {
            return this.stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret
            );
        } catch (err: any) {
            throw new Error("Erro na validação do webhook: " + err.message);
        }
    }
}

export default new StripeService();
