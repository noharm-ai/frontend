import { test, expect } from "../support/mockApi";

/**
 * Protocol variable "Marcadores do paciente" (field: tags): the value is a
 * list of tag names picked from the marcador table. The select loads the
 * patient tag list once and keeps inactive and removed tags visible so a
 * saved protocol never loses what it references.
 */

const protocolFixture = {
  id: 1,
  name: "Protocolo Marcadores",
  protocolType: 2,
  statusType: 2,
  config: {
    variables: [
      {
        name: "marcador",
        field: "tags",
        operator: "IN",
        value: ["ONCOLOGIA", "REMOVIDO"],
      },
    ],
    trigger: "{{marcador}}",
    result: { level: "high", message: "m", description: "d" },
  },
};

test("tags variable lists patient tags and keeps saved names", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });
  mockApi.override("GET /tag/list", {
    json: {
      status: "success",
      data: [
        { name: "ONCOLOGIA", tagType: 1, active: true },
        { name: "PALIATIVO", tagType: 1, active: true },
        { name: "ANTIGO", tagType: 1, active: false },
      ],
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main
    .locator(".ant-steps-item")
    .filter({ hasText: "Variáveis" })
    .click();

  const variable = main.locator(".variable-title", { hasText: "marcador" });
  await expect(variable).toBeVisible();

  // the field description explains the IN/NOTIN semantics for tags
  await expect(
    main.getByText("Um paciente sem marcadores nunca atende ao IN"),
  ).toBeVisible();

  // the tag list was requested with the patient tag type
  await expect
    .poll(() =>
      mockApi.requests.some(
        (r) => r.method === "GET" && r.path === "/tag/list",
      ),
    )
    .toBe(true);

  // saved names render as selected chips, including one no longer listed
  const chip = (name: string) =>
    main.locator(`.ant-select-selection-item[title="${name}"]`);
  await expect(chip("ONCOLOGIA")).toBeVisible();
  await expect(chip("REMOVIDO")).toBeVisible();

  // the dropdown offers the loaded tags, flagging the inactive one
  await chip("ONCOLOGIA").click();
  await expect(page.getByTitle("PALIATIVO")).toBeVisible();
  await expect(page.getByTitle("ANTIGO (inativo)")).toBeVisible();

  await page.getByTitle("PALIATIVO").click();
  await expect(chip("PALIATIVO")).toBeVisible();
});
