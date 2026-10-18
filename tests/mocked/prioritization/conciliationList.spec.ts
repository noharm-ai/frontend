import type { Page, Request } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Conciliation prioritization (/priorizacao/conciliacoes).
 *
 * It reuses the prescription table (containers/ScreeningList) with
 * prioritizationType="conciliation", which changes what is asked from the
 * backend (concilia=1, never agg), the wording of the status filters and of
 * the prescriber filter (here the professional responsible for the
 * conciliation), and where a row leads: /conciliacao/:id instead of
 * /prescricao/:id.
 *
 * The page already searches on load (the shared storage state carries a
 * segment), so the request is awaited from the navigation itself.
 */

type Prescription = Record<string, unknown>;

const BASE = loadFixture<{ data: Prescription[] }>("prescriptions/list.json")
  .data[0];

const conciliation = (
  idPrescription: number,
  idPatient: number,
  status: string,
): Prescription => ({
  ...BASE,
  idPrescription,
  idPatient,
  admissionNumber: idPatient * 100,
  namePatient: `Paciente ${idPatient}`,
  status,
  agg: false,
  concilia: "s",
});

test.beforeEach(async ({ mockApi }) => {
  mockApi.override("GET /prescriptions", {
    json: {
      status: "success",
      data: [
        conciliation(701, 71, "0"),
        conciliation(702, 72, "0"),
        conciliation(703, 73, "s"),
      ],
    },
  });
});

const isListRequest = (request: Request) =>
  request.method() === "GET" &&
  new URL(request.url()).pathname === "/prescriptions";

const listParams = async (request: Promise<Request>) =>
  new URL((await request).url()).searchParams;

const open = async (page: Page) => {
  const request = page.waitForRequest(isListRequest);
  await page.goto("/priorizacao/conciliacoes");

  return listParams(request);
};

const search = async (page: Page) => {
  const request = page.waitForRequest(isListRequest);
  await page.locator(".gtm-btn-search").click();

  return listParams(request);
};

const rows = (page: Page) => page.locator(".ant-table-tbody tr.ant-table-row");

const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// the button name is the label followed by its counter
const statusButton = (page: Page, label: string) =>
  page
    .locator('[data-kb="prioritization.table.status"]')
    .getByRole("button", { name: new RegExp(`^${escapeRegex(label)}`) });

test("asks the backend for conciliations only", async ({ page }) => {
  const params = await open(page);

  await expect(
    page.getByRole("heading", { name: "Priorização de Conciliações" }),
  ).toBeVisible();

  expect(params.get("concilia")).toBe("1");
  expect(params.get("agg")).toBe("0");
  // the patient-only filters never leak into a conciliation search
  expect(params.has("hasConciliation")).toBe(false);

  await expect(rows(page)).toHaveCount(3);
});

test("counts and filters pending and checked conciliations", async ({
  page,
}) => {
  await open(page);
  await expect(rows(page)).toHaveCount(3);

  await expect(statusButton(page, "Conciliações pendentes")).toHaveText(/2$/);
  await expect(statusButton(page, "Conciliações checadas")).toHaveText(/1$/);
  await expect(statusButton(page, "Todas")).toHaveText(/3$/);

  await statusButton(page, "Conciliações checadas").click();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page)).toContainText(["Checada"]);

  await statusButton(page, "Conciliações pendentes").click();
  await expect(rows(page)).toHaveCount(2);
  await expect(rows(page)).toContainText(["Pendente", "Pendente"]);

  await statusButton(page, "Todas").click();
  await expect(rows(page)).toHaveCount(3);
});

test("rows open the conciliation screen", async ({ page }) => {
  // record the new tab instead of opening it: the conciliation screen itself
  // is not under test here
  await page.addInitScript(() => {
    const opened: string[] = [];
    (window as unknown as { __opened: string[] }).__opened = opened;
    window.open = (url?: string | URL) => {
      opened.push(String(url));
      return null;
    };
  });
  await open(page);

  await rows(page)
    .filter({ hasText: "Checada" })
    .locator(".gtm-bt-detail")
    .click();

  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __opened: string[] }).__opened,
      ),
    )
    .toEqual(["/conciliacao/703"]);
});

test("filters by the professional responsible for the conciliation", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "Ver mais" }).click();

  await expect(page.getByText("Responsável:", { exact: true })).toBeVisible();
  await expect(page.getByText("Prescritor:", { exact: true })).toHaveCount(0);

  const field = page
    .locator(".form-row")
    .filter({ has: page.getByText("Responsável:", { exact: true }) })
    .locator("input")
    .last();
  await field.fill("Fulano Beltrano");

  const params = await search(page);
  expect(params.get("prescriber")).toBe("Fulano Beltrano");
  expect(params.get("concilia")).toBe("1");
});
