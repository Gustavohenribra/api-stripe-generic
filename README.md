
# API de Pagamentos com Stripe

## Descrição do Projeto

Este projeto é uma API desenvolvida para gerenciar assinaturas e pagamentos utilizando a plataforma [Stripe](https://stripe.com/). Ele fornece funcionalidades como criação, atualização, cancelamento de assinaturas e manipulação de webhooks para automatizar notificações e eventos de pagamento. A API foi construída com **Node.js** e **TypeScript**, garantindo escalabilidade, segurança e fácil manutenção.

---

## Funcionalidades

- **Criação de Assinaturas**: Permite criar assinaturas associadas a clientes e métodos de pagamento.
- **Atualização de Assinaturas**: Suporte para upgrades (mudança para planos mais caros) e downgrades (mudança para planos mais baratos) com manipulação automática de cronogramas.
- **Cancelamento de Assinaturas**: Cancela uma assinatura no final do período de cobrança.
- **Webhooks**: Processa eventos enviados pelo Stripe, como faturas pagas, falhas em pagamentos e atualizações de assinaturas.
- **Autenticação via API Key**: Validação de requisições protegidas por uma chave de API.
- **Rate Limiting**: Limitação de taxa para evitar sobrecarga e abusos na API.

---

## Tecnologias Utilizadas

- **Node.js**: Plataforma de execução para o JavaScript no servidor.
- **TypeScript**: Superset do JavaScript que adiciona tipagem estática.
- **Express.js**: Framework web minimalista e flexível.
- **Stripe SDK**: Biblioteca oficial para integração com a API do Stripe.
- **dotenv**: Gerenciamento de variáveis de ambiente.
- **cors**: Middleware para habilitar CORS.
- **body-parser**: Middleware para parse de JSON.
- **express-rate-limit**: Middleware para limitar requisições.
- **Jest**: Framework de testes para assegurar qualidade do código.

---

## Estrutura do Projeto

### `/routes/`
Gerencia as rotas da API, como `/payment/subscribe`, `/payment/cancelSubscription` e `/payment/updateSubscription`.

### `/controller/`
Contém a lógica das operações disponíveis na API, como a criação, atualização e cancelamento de assinaturas.

### `/services/`
Gerencia as interações com a API do Stripe, como criação de clientes, assinaturas e manipulação de cronogramas.

### `/middlewares/`
Middlewares de autenticação e manipulação de erros.

### `/exceptions/`
Gerencia exceções personalizadas para uma resposta mais detalhada em caso de erros.

### `/__tests__/`
Contém os testes automatizados do projeto.

---

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Gustavohenribra/api-stripe-generic.git
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

## Testes

Este projeto utiliza o **Jest** para testes unitários e de integração. Para rodar os testes:

1. Execute o comando:
   ```bash
   npm run test
   ```
2. O Jest executará os testes na pasta `__tests__/` e exibirá os resultados no terminal.

---

## Endpoints Disponíveis

### `POST /payment/subscribe`
Cria uma nova assinatura.

### `POST /payment/cancelSubscription`
Cancela uma assinatura existente.

### `POST /payment/updateSubscription`
Atualiza uma assinatura (upgrade ou downgrade).

### `POST /payment/handleWebhook`
Manipula eventos enviados pelo Stripe via webhooks.

---

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou sugestões. Faça um fork do projeto, crie uma branch e abra um pull request.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---
