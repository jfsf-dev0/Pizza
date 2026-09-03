# Contrato de Webhook & Especificação de Integração — Mercado Pago SaaS

Este documento define o contrato de Webhooks e a especificação de integração do Mercado Pago para o **SaaS White-Label de Pizzarias**.

---

## 🏛️ 1. Arquitetura Multi-Tenant de Gateways

No modelo SaaS White-Label, existem duas camadas independentes de cobrança:

### A. Cobrança de Assinatura do SaaS (Plano R$ 119/mês)
* **Credenciais:** Utiliza o `MERCADOPAGO_SAAS_ACCESS_TOKEN` global da plataforma SaaS.
* **Fluxo:** O dono da pizzaria assina o plano do SaaS via Mercado Pago Preapproval / Subscription API.
* **Orquestração:** Processado pelo N8N Workflow de Onboarding.

### B. Processamento de Pedidos dos Clientes da Pizzaria
* **Credenciais:** Armazenadas por restaurante em `restaurant_settings.gateway_config`:
  ```json
  {
    "provider": "mercadopago",
    "access_token": "APP_USR-xxxx-xxxx-xxxx",
    "public_key": "APP_USR-yyyy-yyyy-yyyy",
    "webhook_secret": "sec_zzzz",
    "sandbox_mode": false
  }
  ```
* **Fluxo:** Quando o cliente final finaliza um pedido no PWA da Pizzaria X (ex: `pizzariadoze.meusaaspizza.com.br`), o PIX ou Cartão de Crédito é transacionado diretamente na conta Mercado Pago da Pizzaria X.

---

## 🔐 2. Validação de Assinatura Digital do Webhook (HMAC SHA-256)

Para prevenir ataques de spoofing ou replay, todas as requisições de Webhook recebidas do Mercado Pago **DEVEM** ser validadas utilizando o cabeçalho `x-signature` e o `webhook_secret`.

### Algoritmo de Validação (Exemplo em TypeScript / Deno / Node.js)

```typescript
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

export async function verifyMercadoPagoSignature(
  req: Request,
  webhookSecret: string
): Promise<boolean> {
  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  // Extrair timestamp (ts) e hash (v1) do cabeçalho x-signature (formato: ts=12345,v1=hash)
  const parts = Object.fromEntries(
    xSignature.split(",").map((p) => p.trim().split("="))
  );
  const ts = parts["ts"];
  const hash = parts["v1"];

  if (!ts || !hash) return false;

  // URL base / query da requisição
  const url = new URL(req.url);
  const dataId = url.searchParams.get("data.id") || "";

  // Template assinado: id:[data.id];request-id:[x-request-id];ts:[ts];
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(manifest)
  );

  const calculatedHash = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return calculatedHash === hash;
}
```

---

## 📄 3. Contratos de Payload por Evento

### Evento 1: `payment.created` / `payment.updated`
Disparado quando um pagamento PIX ou Cartão de Crédito tem seu status alterado.

#### Request Body (JSON)
```json
{
  "action": "payment.updated",
  "api_version": "v1",
  "data": {
    "id": "1234567890"
  },
  "date_created": "2026-09-02T22:00:00Z",
  "id": 987654321,
  "live_mode": true,
  "type": "payment",
  "user_id": "11223344"
}
```

---

### Evento 2: `subscription.authorized_payment` (Assinatura Recorrente SaaS R$ 119)
Disparado no pagamento mensal da assinatura do SaaS.

#### Request Body (JSON)
```json
{
  "action": "created",
  "api_version": "v1",
  "data": {
    "id": "2c93808472740e5a0172777f99999999"
  },
  "date_created": "2026-09-02T22:00:00Z",
  "id": 99887766,
  "live_mode": true,
  "type": "subscription_authorized_payment",
  "user_id": "11223344"
}
```

---

## 🚦 4. Códigos de Resposta HTTP & Política de Tentativas

| Código HTTP | Significado | Ação do Mercado Pago |
|---|---|---|
| `200 OK` / `201 Created` | Evento recebido e processado com sucesso. | Nenhuma nova tentativa. |
| `400 Bad Request` | Payload malformatado ou assinatura HMAC inválida. | Não tenta novamente (falha grave). |
| `500 / 502 / 503` | Erro interno temporário no servidor/N8N. | Mercado Pago tentará reenviar exponencialmente (até 48h). |

---

## 🔄 5. Schema JSON dos Metadados do Checkout do SaaS

No momento em que o dono da pizzaria contrata o plano de R$ 119, os metadados abaixo devem ser anexados na chamada da API de Preference/Preapproval:

```json
{
  "payer_email": "dono@pizzariadoze.com.br",
  "back_url": "https://meusaaspizza.com.br/onboarding/sucesso",
  "metadata": {
    "restaurant_id": "e4444444-4444-4444-4444-444444444444",
    "owner_email": "dono@pizzariadoze.com.br",
    "owner_phone": "5511998877665",
    "subdomain": "pizzariadoze",
    "plan": "standard"
  }
}
```
