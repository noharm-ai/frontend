import { test, expect } from "../support/mockApi";

/**
 * Protocol creation co-pilot: the chat turns run a Strands agent (Bedrock)
 * in the real backend, so the whole flow is mocked here.
 */

const emptyResultProtocol = {
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

const proposal = {
  name: "Vancomicina em idosos",
  protocolType: 2,
  config: {
    variables: [
      { name: "var_1", field: "age", operator: ">", value: 60 },
      {
        name: "var_2",
        field: "substance",
        operator: "IN",
        value: ["111111"],
      },
    ],
    trigger: "{{var_1}} and {{var_2}}",
    result: {
      type: "SHOW_MESSAGE",
      level: "high",
      message: "Idoso em uso de vancomicina",
      description: "Avaliar função renal e ajuste de dose.",
    },
  },
};

test("interviews, proposes and applies a protocol draft", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: emptyResultProtocol },
  });
  // proposal preview resolves substance ids to names
  mockApi.override("GET /substance/resolve", {
    json: {
      status: "success",
      data: [{ sctid: "111111", name: "VANCOMICINA" }],
    },
  });
  // turn 1: the agent answers with a clarifying question only.
  // the agent replies in simple HTML, which the chat bubble renders as markup
  mockApi.override("POST /protocol/ai/agent-chat", {
    json: {
      status: "success",
      data: {
        message:
          "<p>Qual exame deve ser considerado para <strong>função renal</strong>?</p>",
        proposal: null,
        proposalErrors: [],
      },
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Copiloto IA" }).click();

  const drawer = page.locator(".ant-drawer");
  await drawer
    .locator("#protocol-copilot-input")
    .fill("protocolo para vancomicina em idosos");
  await drawer.locator("#protocol-copilot-send").click();

  const answer = drawer.getByTestId("chat-assistant");
  await expect(
    answer.getByText("Qual exame deve ser considerado para função renal?")
  ).toBeVisible();
  // the HTML comes through as real markup, never as escaped tags
  await expect(answer.locator("strong")).toHaveText("função renal");
  await expect(answer).not.toContainText("<p>");

  // first request carries an empty transcript, the draft and the message
  const firstCall = mockApi.requests.find(
    (r) => r.path === "/protocol/ai/agent-chat"
  );
  const firstBody = JSON.parse(firstCall?.postData ?? "{}");
  expect(firstBody.messages).toEqual([]);
  expect(firstBody.draft.name).toBe("Protocolo Idoso");
  expect(firstBody.message).toBe("protocolo para vancomicina em idosos");

  // turn 2: the agent returns a full validated proposal
  mockApi.override("POST /protocol/ai/agent-chat", {
    json: {
      status: "success",
      data: {
        message: "Aqui está a proposta completa do protocolo.",
        proposal,
        proposalErrors: [],
      },
    },
  });

  await drawer.locator("#protocol-copilot-input").fill("use a creatinina");
  await drawer.locator("#protocol-copilot-send").click();

  const proposalCard = drawer.getByTestId("protocol-copilot-proposal");
  await expect(proposalCard).toBeVisible();
  await expect(proposalCard.getByText("Vancomicina em idosos")).toBeVisible();
  await expect(
    proposalCard.getByText("Idoso em uso de vancomicina")
  ).toBeVisible();

  // second request replays the transcript, assistant turns kept as sent
  const chatCalls = mockApi.requests.filter(
    (r) => r.path === "/protocol/ai/agent-chat"
  );
  const secondBody = JSON.parse(chatCalls[1]?.postData ?? "{}");
  expect(secondBody.messages).toEqual([
    { role: "user", content: "protocolo para vancomicina em idosos" },
    {
      role: "assistant",
      content:
        "<p>Qual exame deve ser considerado para <strong>função renal</strong>?</p>",
    },
  ]);

  // apply: form already has data, so the overwrite confirm shows first
  await proposalCard.getByRole("button", { name: /Aplicar/ }).click();
  await page.getByRole("button", { name: "Substituir" }).click();
  await expect(
    page.getByText("Proposta aplicada ao formulário. Revise antes de salvar.")
  ).toBeVisible();

  // the form now reflects the proposal: two variables (in the "Variáveis"
  // step) and the new trigger (in the "Gatilho" step)
  await drawer.locator(".ant-drawer-close").click();
  await main
    .locator(".ant-steps-item")
    .filter({ hasText: "Variáveis" })
    .click();
  await expect(main.getByText("var_2").first()).toBeVisible();
  await main.locator(".ant-steps-item").filter({ hasText: "Gatilho" }).click();
  const sentence = main.locator(".expression-sentence").first();
  await expect(sentence.locator(".condition-subject").first()).toHaveText(
    "a idade do paciente"
  );
});

test("shows validation errors when the proposal is rejected", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: emptyResultProtocol },
  });
  mockApi.override("POST /protocol/ai/agent-chat", {
    json: {
      status: "success",
      data: {
        message: "Tentei montar a proposta, mas ela não passou na validação.",
        proposal: null,
        proposalErrors: ["Gatilho possui formato inválido"],
      },
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Copiloto IA" }).click();

  const drawer = page.locator(".ant-drawer");
  await drawer.locator("#protocol-copilot-input").fill("crie o protocolo");
  await drawer.locator("#protocol-copilot-send").click();

  await expect(
    drawer.getByText("Gatilho possui formato inválido")
  ).toBeVisible();
  await expect(
    drawer.getByTestId("protocol-copilot-proposal")
  ).toHaveCount(0);
});
