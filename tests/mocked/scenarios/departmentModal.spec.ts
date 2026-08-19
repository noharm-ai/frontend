import { test, expect } from "../support/mockApi";

const protocolFixture = {
  id: 1,
  name: "Protocolo Setor",
  protocolType: 2,
  statusType: 2,
  config: {
    variables: [
      { name: "setor", field: "idDepartment", operator: "IN", value: ["7"] },
    ],
    trigger: "{{setor}}",
    result: { level: "high", message: "m", description: "d" },
  },
};

test("department modal shows the segment column and filters by segment", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });
  mockApi.override("GET /admin/protocol/department/list", {
    json: {
      status: "success",
      data: [
        {
          idDepartment: "7",
          name: "UTI Adulto",
          segments: [{ id: 1, name: "Segmento Adulto" }],
        },
        {
          idDepartment: "8",
          name: "Pediatria",
          segments: [
            { id: 2, name: "Segmento Pediatrico" },
            { id: 1, name: "Segmento Adulto" },
          ],
        },
        { idDepartment: "9", name: "Sem Segmento", segments: [] },
      ],
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main
    .locator(".ant-steps-item")
    .filter({ hasText: "Variáveis" })
    .click();

  // the button that opens the modal carries only the table icon
  await main.getByRole("button", { name: "table", exact: true }).click();

  const modal = page
    .getByRole("dialog")
    .filter({ hasText: "Selecionar setores" });
  await expect(modal).toBeVisible();

  // segment column renders one tag per segment, and a dash when none
  await expect(
    modal.getByRole("columnheader", { name: "Segmento" }),
  ).toBeVisible();
  const rows = modal.locator(".ant-table-tbody tr.ant-table-row");
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(1)).toContainText("Segmento Pediatrico");
  await expect(rows.nth(1)).toContainText("Segmento Adulto");
  await expect(rows.nth(2)).toContainText("—");

  // filter by segment narrows the rows
  await modal.getByRole("combobox").last().click();
  await page.getByTitle("Segmento Pediatrico").click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText("Pediatria");

  // the pre-selected setor (7) survives being filtered out
  await expect(modal.getByText("Setores selecionados (1)")).toBeVisible();
});
