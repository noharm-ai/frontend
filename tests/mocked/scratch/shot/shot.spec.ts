import { test } from "../../support/mockApi";
import { loadFixture } from "../../support/defaultHandlers";

const c = (drug: string, result: string | null, prediction: string | null, probability: number | null, material = "Sangue Total") => ({
  drug,
  items: [{ key: drug, microorganism: "Microorganismo Teste", material, result, prediction, probability, collectionDate: "2024-03-01T12:17:03", releaseDate: result ? "2024-03-08T07:17:02" : null }],
});

const CULTURES = [
  c("AMOXICILINA + CLAVULANATO", null, "R", 0.82),
  c("AMICACINA", "Sensível", null, null),
  c("CEFEPIME", "Resistente", null, null),
  c("CIPROFLOXACINO", "Sensível", null, null),
  c("GENTAMICINA", null, "S", 0.65),
  c("LINEZOLIDA", "Sensível", null, null, "Urina"),
  c("MEROPENEM", null, "S", 0.71),
  c("OXACILINA", "Resistente", null, null),
  c("PIPERACILINA + TAZOBACTAM", null, "R", 0.77),
  c("VANCOMICINA", "Intermediário", null, null),
];

test("shot", async ({ page, mockApi }) => {
  const fixture = loadFixture<{ data: Record<string, unknown> }>("prescriptions/single-199.json");
  fixture.data = { ...fixture.data, cultures: CULTURES };
  mockApi.override("GET /prescriptions/:id", { json: fixture });

  await page.goto("/prescricao/199");
  await page.getByRole("heading", { name: "Prescrição nº 199 Liberada em" }).waitFor();
  const card = page.locator(".ant-col", { has: page.getByRole("radio", { name: "Exames" }) }).first();
  await page.locator(".ant-segmented-item-label", { hasText: "Cultura" }).click();
  await page.waitForTimeout(300);
  await card.screenshot({ path: "/private/tmp/claude-501/-Users-marceloarocha-Projects-noharm-frontend/db31849f-b395-40c5-a3fe-4381ba8c0264/scratchpad/culture-groups.png" });
});
