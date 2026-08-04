import { test, expect } from "../support/mockApi";

/**
 * Protocol test runner: evaluates the protocol config being edited against
 * a sample of real prescriptions, chunked to respect the 30s API window.
 * Impossible to cover with the seeded e2e database (needs a deterministic
 * sample + per-chunk assertions), so the whole flow is mocked.
 */

const SAMPLE_IDS = Array.from({ length: 12 }, (_, i) => String(100 + i));

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

const dateGroup = (activated: boolean) => ({
  date: "2026-07-31",
  activated,
  summary: `Protocolo 'Protocolo Idoso' ${
    activated ? "ATIVADO" : "NÃO ativado"
  }: o gatilho avaliou como ${activated ? "verdadeiro" : "falso"}.`,
});

test("tests a protocol against a sample of prescriptions in chunks", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });
  mockApi.override("POST /protocol/test/sample", {
    json: {
      status: "success",
      data: { idPrescriptionList: SAMPLE_IDS, total: SAMPLE_IDS.length },
    },
  });
  mockApi.override("POST /protocol/test", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}");
    const results = (body.idPrescriptionList as (string | number)[]).map(
      (id) => {
        const activated = Number(id) % 2 === 0;
        return {
          idPrescription: String(id),
          typeMatch: true,
          activated,
          dateGroups: [dateGroup(activated)],
          error: null,
          ...(body.detailed
            ? {
                trace: {
                  idPrescription: String(id),
                  evaluatedAt: new Date().toISOString(),
                  protocols: [
                    {
                      idProtocol: 0,
                      name: body.name ?? "Protocolo em teste",
                      protocolType: body.protocolType,
                      statusType: 2,
                      applicable: true,
                      applicabilityNotes: [],
                      dateGroups: [
                        {
                          ...dateGroup(activated),
                          trigger: {
                            expression: "{{v1}}",
                            substituted: String(activated),
                            result: activated,
                          },
                          result: activated ? { level: "high" } : null,
                          variableMessages: [],
                          relatedItems: [],
                          variables: [],
                        },
                      ],
                    },
                  ],
                },
              }
            : {}),
        };
      },
    );

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        data: { evaluatedAt: new Date().toISOString(), results },
      }),
    });
  });

  await page.goto("/admin/protocolos/1");

  // the batch test panel lives in the "Amostra do dia" tab; running it
  // replaces the form with progress and then a totals summary
  const main = page.getByRole("main");
  await main.getByRole("tab", { name: "Amostra do dia" }).click();
  await page.locator("#protocol-batch-run").click();
  await expect(main.getByText("Ativado: 6", { exact: true })).toBeVisible();
  await expect(main.getByText("Não ativado: 6")).toBeVisible();

  // full results live in a modal
  await main.getByRole("button", { name: "Ver resultados" }).click();
  const modal = page
    .getByRole("dialog")
    .filter({ hasText: "Resultados do teste" });
  await expect(modal.getByText("Ativado: 6", { exact: true })).toBeVisible();

  // the batch was split into ceil(12/5) = 3 requests of at most 5 ids
  const chunkCalls = mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/protocol/test",
  );
  expect(chunkCalls).toHaveLength(3);
  const chunkSizes = chunkCalls.map(
    (r) => JSON.parse(r.postData ?? "{}").idPrescriptionList.length,
  );
  expect(chunkSizes).toEqual([5, 5, 2]);
  chunkCalls.forEach((r) => {
    const body = JSON.parse(r.postData ?? "{}");
    expect(body.config.trigger).toBe("{{v1}}");
    expect(body.protocolType).toBe(2);
  });

  // drill-down: detail button requests the full trace and renders it
  await modal
    .getByRole("row", { name: /100/ })
    .getByRole("button")
    .last()
    .click();

  const traceModal = page
    .getByRole("dialog")
    .filter({ hasText: "Explicação da avaliação de protocolos" });
  await expect(traceModal.getByText("Protocolo Idoso").first()).toBeVisible();

  const detailCall = mockApi.requests
    .filter((r) => r.method === "POST" && r.path === "/protocol/test")
    .at(-1);
  const detailBody = JSON.parse(detailCall?.postData ?? "{}");
  expect(detailBody.detailed).toBe(true);
  expect(detailBody.idPrescriptionList).toEqual(["100"]);

  // "test again" returns the card to the form state
  await traceModal.locator(".ant-modal-close").click();
  await expect(traceModal).toBeHidden();
  await modal.locator(".ant-modal-close").click();
  await expect(modal).toBeHidden();
  await main.getByRole("button", { name: "Testar novamente" }).click();
  await expect(page.locator("#protocol-batch-run")).toBeVisible();
});

test("tests a protocol against target prescriptions from the trigger panel", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });
  mockApi.override("POST /protocol/test", async (route) => {
    const body = JSON.parse(route.request().postData() ?? "{}");
    const results = (body.idPrescriptionList as (string | number)[]).map(
      (id) => ({
        idPrescription: String(id),
        typeMatch: true,
        activated: String(id) === "199",
        dateGroups: [dateGroup(String(id) === "199")],
        error: null,
        ...(body.detailed
          ? {
              trace: {
                idPrescription: String(id),
                evaluatedAt: new Date().toISOString(),
                protocols: [
                  {
                    idProtocol: 0,
                    name: "Protocolo Idoso",
                    protocolType: 2,
                    statusType: 2,
                    applicable: true,
                    applicabilityNotes: [],
                    dateGroups: [
                      {
                        ...dateGroup(true),
                        trigger: {
                          expression: "{{v1}}",
                          substituted: "True",
                          result: true,
                        },
                        result: { level: "high" },
                        variableMessages: [],
                        relatedItems: [],
                        variables: [],
                      },
                    ],
                  },
                ],
              },
            }
          : {}),
      }),
    );

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "success",
        data: { evaluatedAt: new Date().toISOString(), results },
      }),
    });
  });

  await page.goto("/admin/protocolos/1");

  // the test panel lives below the trigger card in the side panel
  const panel = page.getByRole("main");
  await expect(panel.getByText("Testar protocolo")).toBeVisible();

  const idsInput = page.locator("#protocol-test-ids");
  await idsInput.fill("199");
  await idsInput.press("Enter");
  await idsInput.fill("200");
  await idsInput.press("Enter");

  await page.locator("#protocol-test-run").click();

  // compact rows: id + activation status only
  await expect(panel.getByRole("link", { name: "199" })).toBeVisible();
  await expect(panel.getByText("Ativado", { exact: true })).toBeVisible();
  await expect(panel.getByRole("link", { name: "200" })).toBeVisible();
  await expect(panel.getByText("Não ativado", { exact: true })).toBeVisible();

  const runCall = mockApi.requests.find(
    (r) => r.method === "POST" && r.path === "/protocol/test",
  );
  const runBody = JSON.parse(runCall?.postData ?? "{}");
  expect(runBody.detailed ?? false).toBe(false);
  expect(runBody.idPrescriptionList).toEqual(["199", "200"]);

  // details button opens the full trace modal
  await panel.getByRole("listitem").filter({ hasText: "199" }).getByRole("button").click();
  const traceModal = page
    .getByRole("dialog")
    .filter({ hasText: "Explicação da avaliação de protocolos" });
  await expect(traceModal.getByText("Protocolo Idoso").first()).toBeVisible();

  const detailCall = mockApi.requests
    .filter((r) => r.method === "POST" && r.path === "/protocol/test")
    .at(-1);
  const detailBody = JSON.parse(detailCall?.postData ?? "{}");
  expect(detailBody.detailed).toBe(true);
  expect(detailBody.idPrescriptionList).toEqual(["199"]);
});
