import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * End-user side of the protocol description: clicking a protocol alert in the
 * patient card explains, in plain language, what makes that protocol fire.
 * The item names arrive already resolved from /protocol/:id/description.
 */

const prescription = loadFixture<any>("prescriptions/single-199.json");

const withProtocolAlerts = {
  ...prescription,
  data: {
    ...prescription.data,
    protocolAlerts: {
      "2026-08-03": [
        {
          id: 77,
          level: "high",
          message: "Antimicrobiano em paciente idoso",
          description: "Avaliar necessidade de ajuste de dose",
          variableMessages: [],
        },
      ],
    },
  },
};

const description = {
  status: "success",
  data: {
    id: 77,
    name: "Protocolo Antimicrobiano",
    protocolType: 2,
    trigger: "{{subs}} and {{idade}}",
    variables: [
      { name: "subs", field: "substance", operator: "IN", value: ["1", "2"] },
      { name: "idade", field: "age", operator: ">=", value: 65 },
    ],
    labels: {
      substance: { "1": "Vancomicina", "2": "Meropenem" },
    },
  },
};

async function openProtocolsTab(page: any) {
  await page.goto("/prescricao/199");
  await expect(page.getByText("Paciente 99")).toBeVisible();

  // the protocol tab is icon-only, so its accessible name is the icon's
  await page.getByRole("tab", { name: "file-ppt" }).click();
}

test("explains a protocol alert in plain language", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", { json: withProtocolAlerts });
  mockApi.override("GET /protocol/:id/description", { json: description });

  await openProtocolsTab(page);

  const alert = page.getByRole("button", {
    name: "Antimicrobiano em paciente idoso",
  });
  await expect(alert).toBeVisible();
  await alert.click();

  const modal = page
    .getByRole("dialog")
    .filter({ hasText: "Como este protocolo é disparado" });
  const sentence = modal.locator(".expression-sentence");

  await expect(sentence.locator(".sentence-title")).toContainText(
    "Protocolo Antimicrobiano dispara quando"
  );
  // server-resolved names, not ids
  await expect(sentence.getByText("Vancomicina")).toBeVisible();
  await expect(sentence.getByText("Meropenem")).toBeVisible();
  await expect(sentence.locator(".condition-subject").first()).toHaveText(
    "a substância de algum item prescrito"
  );
  await expect(sentence.getByText("65 anos")).toBeVisible();

  // technical variable names stay in the editor, not here
  await expect(sentence.locator(".condition-varname")).toHaveCount(0);

  // one fetch per open (StrictMode double-invokes effects in dev), never a loop
  const calls = mockApi.requests.filter((r) =>
    r.path.includes("/protocol/77/description")
  );
  expect(calls.length).toBeLessThanOrEqual(2);
});

test("falls back to a notice when the trigger cannot be described", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", { json: withProtocolAlerts });
  mockApi.override("GET /protocol/:id/description", {
    json: {
      status: "success",
      data: { ...description.data, trigger: "{{subs}} and banana(" },
    },
  });

  await openProtocolsTab(page);
  await page
    .getByRole("button", { name: "Antimicrobiano em paciente idoso" })
    .click();

  const modal = page
    .getByRole("dialog")
    .filter({ hasText: "Como este protocolo é disparado" });

  await expect(
    modal.getByText("A descrição deste protocolo não está disponível.")
  ).toBeVisible();
});
