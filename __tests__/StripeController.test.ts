import request from "supertest";
import server from "../src";
import StripeService from "../src/services/StripeService";

jest.mock("../src/services/StripeService");

jest.mock("../src/middlewares/AuthMiddleware", () => {
    return jest.fn((_req, _res, next) => next());
});

describe("StripeController", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /payment/subscribe", () => {
    it("deve criar uma assinatura com sucesso", async () => {
      (StripeService.findOrCreateCustomer as jest.Mock).mockResolvedValue({
        id: "cus_test123",
        email: "test@example.com",
      });

      (StripeService.createSubscription as jest.Mock).mockResolvedValue({
        id: "sub_test123",
      });

      const response = await request(server).post("/payment/subscribe").send({
        user: { email: "test@example.com", name: "Test User" },
        currency: "brl",
        items: [{ price: "price_test123" }],
        paymentMethodId: "pm_test123",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Subscrição criada com sucesso!");
      expect(response.body.subscription.id).toBe("sub_test123");
    });

    it("deve retornar erro 400 para campos obrigatórios ausentes", async () => {
      const response = await request(server).post("/payment/subscribe").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("User, currency, items e paymentMethodId são obrigatórios.");
    });
  });

  describe("POST /payment/cancelSubscription", () => {
    it("deve cancelar uma assinatura com sucesso", async () => {
      (StripeService.cancelSubscription as jest.Mock).mockResolvedValue({
        id: "sub_test123",
        status: "canceled",
      });

      const response = await request(server)
        .post("/payment/cancelSubscription")
        .send({ subscriptionId: "sub_test123" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assinatura cancelada com sucesso!");
    });

    it("deve retornar erro 400 para ID de assinatura ausente", async () => {
      const response = await request(server).post("/payment/cancelSubscription").send({});
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("O ID da assinatura é obrigatório.");
    });
  });

  describe("POST /payment/updateSubscription", () => {
    it("deve atualizar uma assinatura com sucesso", async () => {
      (StripeService.getSubscription as jest.Mock).mockResolvedValue({ id: "sub_test123" });
      (StripeService.updateSubscriptionItems as jest.Mock).mockResolvedValue({
        id: "sub_test123",
        items: [],
      });

      const response = await request(server).post("/payment/updateSubscription").send({
        subscriptionId: "sub_test123",
        newPriceId: "price_test456",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Assinatura atualizada com sucesso!");
    });

    it("deve retornar erro 404 para assinatura não encontrada", async () => {
      (StripeService.getSubscription as jest.Mock).mockResolvedValue(null);

      const response = await request(server).post("/payment/updateSubscription").send({
        subscriptionId: "sub_test123",
        newPriceId: "price_test456",
      });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Assinatura não encontrada.");
    });
  });
});

afterAll((done) => {
    server.close(done);
});