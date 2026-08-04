import { test, expect } from "../support/mockApi";

/**
 * AI trigger assistant: generation and review run against Bedrock in the
 * real backend, so the whole flow is mocked here.
 */

const protocolFixture = {
  id: 1,
  name: "Protocolo Idoso",
  protocolType: 2,
  statusType: 2,
  config: {
    variables: [{ name: "v1", field: "age", operator: ">", value: 60 }],
    trigger: "{{v1}}",
    result: {
      level: "high",
      message: "Paciente idoso",
      description: "Paciente idoso",
    },
  },
};

test("generates and reviews the trigger with the AI assistant", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });
  mockApi.override("POST /protocol/ai/generate-trigger", {
    json: {
      status: "success",
      data: {
        trigger: "not {{v1}}",
        explanation: "Dispara quando o paciente não é idoso.",
      },
    },
  });
  mockApi.override("POST /protocol/ai/review-trigger", {
    json: {
      status: "success",
      data: {
        verdict: "attention",
        summary: "A negação pode não refletir a intenção do alerta.",
        findings: [
          { severity: "warning", message: "O gatilho nega a única variável." },
        ],
      },
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  const sentence = main.locator(".expression-sentence");

  // the assistant lives in its own tab
  await main.getByRole("tab", { name: "Assistente IA" }).click();
  await expect(sentence.locator(".sentence-title")).toContainText(
    "O protocolo dispara quando"
  );
  await expect(sentence.locator(".condition-subject")).toHaveText(
    "a idade do paciente"
  );
  await expect(sentence.locator(".criterion-text")).toHaveText("60 anos");

  // generate: describe the rule; the returned expression is applied and
  // reflected in the sentence
  await page.locator("#protocol-ai-hint").fill("disparar quando não for idoso");
  await page.locator("#protocol-ai-generate").click();
  await expect(
    main.getByText("Expressão gerada e aplicada ao construtor.")
  ).toBeVisible();
  await expect(main.getByText("Dispara quando o paciente não é idoso.")).toBeVisible();
  await expect(sentence.locator(".condition-not")).toHaveText("NÃO");
  await expect(sentence.locator(".condition-subject")).toHaveText(
    "a idade do paciente"
  );

  // the request carries the hint, the variable summaries and the previous trigger
  const genCall = mockApi.requests.find(
    (r) => r.path === "/protocol/ai/generate-trigger",
  );
  const genBody = JSON.parse(genCall?.postData ?? "{}");
  expect(genBody.hint).toBe("disparar quando não for idoso");
  expect(genBody.variables).toEqual([{ name: "v1", summary: "Idade > 60" }]);
  expect(genBody.currentTrigger).toBe("{{v1}}");

  // review: verdict and findings render as alerts
  await page.locator("#protocol-ai-review").click();
  await expect(main.getByText("A expressão merece atenção.")).toBeVisible();
  await expect(
    main.getByText("O gatilho nega a única variável.")
  ).toBeVisible();

  const reviewCall = mockApi.requests.find(
    (r) => r.path === "/protocol/ai/review-trigger",
  );
  const reviewBody = JSON.parse(reviewCall?.postData ?? "{}");
  expect(reviewBody.trigger).toBe("not {{v1}}");
  expect(reviewBody.resultMessage).toBe("Paciente idoso");
});

test("shows the explanation when the rule cannot be expressed", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });
  mockApi.override("POST /protocol/ai/generate-trigger", {
    json: {
      status: "success",
      data: {
        trigger: null,
        explanation:
          "Não há variável de peso declarada. Cadastre uma variável com o campo Peso.",
      },
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main.getByRole("tab", { name: "Assistente IA" }).click();
  await page.locator("#protocol-ai-hint").fill("paciente acima de 100kg");
  await page.locator("#protocol-ai-generate").click();

  await expect(
    main.getByText("Não foi possível montar a expressão.")
  ).toBeVisible();
  await expect(
    main.getByText(/Não há variável de peso declarada/)
  ).toBeVisible();

  // the previous expression stays untouched
  await expect(
    main.locator(".expression-sentence .condition-subject")
  ).toHaveText("a idade do paciente");
});
