import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * The release of a checked prescription to the origin system is asynchronous:
 * when it fails, the backend reports it through `integrationErrors` on the
 * prescription payload. Before this alert the failure was only reachable
 * through the "Histórico de Eventos" report.
 */

const prescriptionWith = (integrationErrors: unknown[]) => {
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
        integrationErrors,
      },
    },
  };
};

const ALERT_TITLE = "Falha no envio da checagem ao sistema de origem";

test("a checked prescription with no pending error shows no alert", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /prescriptions/:id", prescriptionWith([]));

  await page.goto("/prescricao/199");

  await expect(page.getByText("Checada porE2E Test")).toBeVisible();
  await expect(page.getByText(ALERT_TITLE)).toBeHidden();
});

test("a pending release error is shown on the prescription page", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /prescriptions/:id",
    prescriptionWith([
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

test("errors of the aggregated prescriptions are listed together", async ({
  page,
  mockApi,
}) => {
  mockApi.override(
    "GET /prescriptions/:id",
    prescriptionWith([
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
    ]),
  );

  await page.goto("/prescricao/199");

  await expect(
    page.getByText("2 checagens não foram recebidas pelo sistema de origem"),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ver detalhes" }).click();

  await expect(page.getByText("Prescrição 201")).toBeVisible();
  await expect(page.getByText("Prescrição 202")).toBeVisible();
});
