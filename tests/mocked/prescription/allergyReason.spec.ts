import type { Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";
import { loadFixture } from "../support/defaultHandlers";

/**
 * Why the allergy alert of a drug was raised or not, in the drug popover
 * maintainers see (components/Screening/PrescriptionDrug/DrugCell).
 *
 * The flag of the item (presmed.alergia) is set when it arrives; the backend
 * confirms it with the patient's allergy records (alergia, backend
 * alert_service.is_allergic): a record of the item decides, otherwise the flag
 * stands. The item carries both: allergyFlag as it arrived and allergyRecord,
 * what the records said ("active", "inactive" or null).
 */

// each test logs in with its own permissions
test.use({ storageState: { cookies: [], origins: [] } });

const BASE_PERMISSIONS = [
  "READ_BASIC_FEATURES",
  "WRITE_BASIC_FEATURES",
  "READ_PRESCRIPTION",
  "WRITE_PRESCRIPTION",
];

type PrescriptionFixture = {
  data: {
    prescription: Record<string, unknown>[];
  };
};

const prescriptionWithAllergies = (
  allergies: Record<string, Record<string, unknown>>,
) => {
  const fixture = loadFixture<PrescriptionFixture>(
    "prescriptions/single-199.json",
  );

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    ...allergies[`${item.idPrescriptionDrug}`],
  }));

  return fixture;
};

const openPrescription = async (page: Page) => {
  await page.goto("/prescricao/199");
  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
};

const drugPopover = async (page: Page, drug: string) => {
  await page.locator(".table-link", { hasText: drug }).first().hover();

  const popover = page.locator(".ant-popover", { hasText: drug });
  await expect(popover).toBeVisible();

  return popover;
};

test.describe("as a MAINTAINER", () => {
  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithPermissions(page, mockApi, [
      ...BASE_PERMISSIONS,
      "MAINTAINER",
    ]);
  });

  test("an allergy record overrides the flag the item arrived with", async ({
    page,
    mockApi,
  }) => {
    mockApi.override("GET /prescriptions/:id", {
      json: prescriptionWithAllergies({
        // recorded after the item arrived without the flag
        "9001": { allergy: true, allergyFlag: "N", allergyRecord: "active" },
        // flagged on arrival, inactivated afterwards
        "9002": { allergy: false, allergyFlag: "S", allergyRecord: "inactive" },
      }),
    });

    await openPrescription(page);

    await expect(
      (await drugPopover(page, "Dipirona 500mg")).getByText("alergia:", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(
        "sim — registro ativo na tabela alergia (presmed.alergia: N)",
      ),
    ).toBeVisible();

    await page.mouse.move(0, 0);

    await drugPopover(page, "Omeprazol 20mg");
    await expect(
      page.getByText(
        "não — registro inativado na tabela alergia (presmed.alergia: S)",
      ),
    ).toBeVisible();
  });

  test("without a record of the item the flag stands", async ({
    page,
    mockApi,
  }) => {
    // some clients have no allergy records at all
    mockApi.override("GET /prescriptions/:id", {
      json: prescriptionWithAllergies({
        "9001": { allergy: true, allergyFlag: "S", allergyRecord: null },
        "9002": { allergy: false, allergyFlag: null, allergyRecord: null },
      }),
    });

    await openPrescription(page);

    await drugPopover(page, "Dipirona 500mg");
    await expect(
      page.getByText(
        "sim — presmed.alergia: S (sem registro do medicamento na tabela alergia)",
      ),
    ).toBeVisible();

    await page.mouse.move(0, 0);

    await drugPopover(page, "Omeprazol 20mg");
    await expect(
      page.getByText(
        "não — presmed.alergia: vazio (sem registro do medicamento na tabela alergia)",
      ),
    ).toBeVisible();
  });

  test("a backend that does not confirm the flag states nothing", async ({
    page,
    mockApi,
  }) => {
    // the item carries no allergyRecord: there is no reason to tell
    mockApi.override("GET /prescriptions/:id", {
      json: prescriptionWithAllergies({}),
    });

    await openPrescription(page);

    const popover = await drugPopover(page, "Dipirona 500mg");
    await expect(popover.getByText("fkpresmed:")).toBeVisible();
    await expect(popover.getByText("alergia:", { exact: true })).toHaveCount(0);
  });
});

test("the reason is out of reach without MAINTAINER", async ({
  page,
  mockApi,
}) => {
  await loginWithPermissions(page, mockApi, BASE_PERMISSIONS);
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithAllergies({
      "9001": { allergy: true, allergyFlag: "N", allergyRecord: "active" },
    }),
  });

  await openPrescription(page);

  const popover = await drugPopover(page, "Dipirona 500mg");
  await expect(popover.getByText("Substância:")).toBeVisible();
  await expect(popover.getByText("alergia:", { exact: true })).toHaveCount(0);
});
