import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * The release of a checked prescription to the origin system is asynchronous:
 * when it fails, the pending errors are exposed by
 * GET /prescriptions/:id/integration-errors, which the screening page only
 * calls once the prescription is checked. Before this alert the failure was
 * only reachable through the "Histórico de Eventos" report.
 */

const checkedPrescription = (headers?: Record<string, unknown>) => {
  const fixture = loadFixture<{
    status: string;
    data: Record<string, unknown>;
  }>("prescriptions/single-199.json");

  return {
    json: {
      ...fixture,
      data: {
        ...fixture.data,
        status: "s",
        user: "E2E Test",
        ...(headers ? { headers } : {}),
      },
    },
  };
};

const integrationErrors = (errors: unknown[]) => ({
  json: { status: "success", data: errors },
});

const ALERT_TITLE = "Falha no envio da checagem ao sistema de origem";

test("a checked prescription with no pending error shows no alert", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", checkedPrescription());
  mockApi.override(
    "GET /prescriptions/:id/integration-errors",
    integrationErrors([]),
  );

  await page.goto("/prescricao/199");

  await expect(page.getByText("Checada porE2E Test")).toBeVisible();
  await expect(page.getByText(ALERT_TITLE)).toBeHidden();
});

test("an unchecked prescription never asks for integration errors", async ({
  page,
  mockApi,
}) => {
  await page.goto("/prescricao/199");

  await expect(page.getByRole("button", { name: "Checar" })).toBeVisible();
  await expect(page.getByText(ALERT_TITLE)).toBeHidden();

  // the release is only sent after a check: there is nothing to ask for
  expect(
    mockApi.requests.filter((r) => r.path.endsWith("/integration-errors")),
  ).toHaveLength(0);
});

test("a pending release error is shown on the prescription page", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", checkedPrescription());
  mockApi.override(
    "GET /prescriptions/:id/integration-errors",
    integrationErrors([
      {
        idPrescription: "199",
        date: "2026-01-20T10:30:00",
        message: "PEP indisponível",
        extra: { message: "PEP indisponível", statusCode: 500 },
      },
    ]),
  );

  await page.goto("/prescricao/199");

  await expect(page.getByText(ALERT_TITLE)).toBeVisible();
  await expect(
    page.getByText(
      "A checagem desta prescrição não foi recebida pelo sistema de origem",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ver detalhes" }).click();

  await expect(page.getByText("Prescrição 199")).toBeVisible();
  await expect(page.getByText("20/01/2026 10:30")).toBeVisible();
  await expect(page.getByText("PEP indisponível").first()).toBeVisible();
});

test("the aggregated prescriptions are sent along and their errors listed together", async ({
  page,
  mockApi,
}) => {
  const fixture = loadFixture<{ data: { headers: Record<string, unknown> } }>(
    "prescriptions/single-199.json",
  );
  const header = fixture.data.headers["199"];

  mockApi.override(
    "GET /prescriptions/:id",
    checkedPrescription({ "201": header, "202": header }),
  );

  let requestedList: string | null = null;
  mockApi.override("GET /prescriptions/:id/integration-errors", (route) => {
    requestedList = new URL(route.request().url()).searchParams.get(
      "idPrescriptionList",
    );

    return route.fulfill({
      json: {
        status: "success",
        data: [
          {
            idPrescription: "201",
            date: "2026-01-20T10:30:00",
            message: "PEP indisponível",
            extra: null,
          },
          {
            idPrescription: "202",
            date: "2026-01-20T09:00:00",
            message: null,
            extra: null,
          },
        ],
      },
    });
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByText("2 checagens não foram recebidas pelo sistema de origem"),
  ).toBeVisible();

  // the ids already on screen spare the backend from rebuilding the agg list
  expect(requestedList).toBe("201,202");

  await page.getByRole("button", { name: "Ver detalhes" }).click();

  await expect(page.getByText("Prescrição 201")).toBeVisible();
  await expect(page.getByText("Prescrição 202")).toBeVisible();
});

test("checking again re-reads the errors instead of keeping a stale alert", async ({
  page,
  mockApi,
}) => {
  // the release fails, then the retry triggered by the new check succeeds
  const responses = [
    [
      {
        idPrescription: "199",
        date: "2026-01-20T10:30:00",
        message: "PEP indisponível",
        extra: null,
      },
    ],
    [],
  ];

  mockApi.override("GET /prescriptions/:id/integration-errors", (route) =>
    route.fulfill({
      json: { status: "success", data: responses.shift() ?? [] },
    }),
  );

  await page.goto("/prescricao/199");

  await page.getByRole("button", { name: "check Checar" }).click();
  await expect(page.getByText("Checada porE2E Test")).toBeVisible();
  await expect(page.getByText(ALERT_TITLE)).toBeVisible();

  await page.getByRole("button", { name: "rollback" }).click();
  await expect(page.getByText(ALERT_TITLE)).toBeHidden();

  await page.getByRole("button", { name: "check Checar" }).click();
  await expect(page.getByText("Checada porE2E Test")).toBeVisible();
  await expect(page.getByText(ALERT_TITLE)).toBeHidden();

  expect(
    mockApi.requests.filter((r) => r.path.endsWith("/integration-errors")),
  ).toHaveLength(2);
});
