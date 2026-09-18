import { test, expect } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";

/**
 * The AWaRe group of an antimicrobial on the prescription drug list
 * (components/AwareTag, components/Screening/PrescriptionDrug/DrugCell).
 *
 * The level comes from the substance of the drug (utils/drug_list, atbLevel),
 * and it is the same tag the culture card carries: the dot and the initial of
 * the group, with the word one hover away. A drug the scale does not place
 * carries no tag at all.
 */

type PrescriptionFixture = {
  data: {
    prescription: Record<string, unknown>[];
  };
};

const prescriptionWithLevels = (levels: Record<string, unknown>) => {
  const fixture = loadFixture<PrescriptionFixture>(
    "prescriptions/single-199.json",
  );

  fixture.data.prescription = fixture.data.prescription.map((item) => ({
    ...item,
    atbLevel: levels[`${item.idPrescriptionDrug}`] ?? null,
    // the AM tag marks the drug as an antimicrobial, which is what the AWaRe
    // group qualifies: the two are read together
    am: levels[`${item.idPrescriptionDrug}`] != null,
  }));

  return fixture;
};

const drugRow = (page: import("@playwright/test").Page, drug: string) =>
  page.locator("tr", { hasText: drug }).first();

test("the drug list states the AWaRe group of an antimicrobial", async ({
  page,
  mockApi,
}) => {
  // the first drug is a reserve antimicrobial, the second is not on the scale
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithLevels({ "9001": 3 }),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();

  const antimicrobial = drugRow(page, "Dipirona 500mg");
  await expect(antimicrobial.locator(".culture-aware")).toHaveText("R");
  await expect(antimicrobial.locator(".culture-aware")).toHaveClass(
    /culture-aware-3/,
  );

  // and it is read right after the AM tag that says the drug is an
  // antimicrobial, never somewhere else among the tags
  await expect(
    antimicrobial
      .locator("td", { hasText: "Dipirona 500mg" })
      .first()
      .locator(".ant-space-item"),
  ).toHaveText(["AM", "R"]);

  // a drug the scale does not place carries nothing: the column is curated
  // apart from the list, and a tag on every row would say nothing
  await expect(
    drugRow(page, "Omeprazol 20mg").locator(".culture-aware"),
  ).toHaveCount(0);

  // the word the letter stands for is one hover away
  await antimicrobial.locator(".culture-aware").hover();
  await expect(page.getByText("Classificação AWaRe: Reserva")).toBeVisible();
});

test("the drug list carries no AWaRe tag without the classification", async ({
  page,
  mockApi,
}) => {
  // what every drug looks like until the substances are curated: the payload
  // carries the field as null and nothing is shown
  mockApi.override("GET /prescriptions/:id", {
    json: prescriptionWithLevels({}),
  });

  await page.goto("/prescricao/199");

  await expect(
    page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }),
  ).toBeVisible();
  await expect(page.getByText("Dipirona 500mg")).toBeVisible();
  await expect(page.locator(".culture-aware")).toHaveCount(0);
});
