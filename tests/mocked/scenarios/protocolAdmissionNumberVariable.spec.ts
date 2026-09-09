import { test, expect } from "../support/mockApi";

/**
 * Protocol variable "Atendimento (nratendimento)" (field: admissionNumber):
 * the value is a list of admission numbers typed by the user and tested with
 * IN/NOTIN against the patient's own admission number. There is no lookup
 * endpoint; the select is a free-text tag input that only keeps digits.
 */

const protocolFixture = {
  id: 1,
  name: "Protocolo Atendimento",
  protocolType: 2,
  statusType: 2,
  config: {
    variables: [
      {
        name: "atendimento",
        field: "admissionNumber",
        operator: "IN",
        value: ["123456", "654321"],
      },
    ],
    trigger: "{{atendimento}}",
    result: { level: "high", message: "m", description: "d" },
  },
};

test("admission number variable accepts typed numbers only", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main
    .locator(".ant-steps-item")
    .filter({ hasText: "Variáveis" })
    .click();

  const variable = main.locator(".variable-title", { hasText: "atendimento" });
  await expect(variable).toBeVisible();

  // the field description explains what the list is tested against
  await expect(
    main.getByText("pessoa.nratendimento", { exact: false }),
  ).toBeVisible();

  // saved numbers render as selected chips
  const chip = (name: string) =>
    main.locator(`.ant-select-selection-item[title="${name}"]`);
  await expect(chip("123456")).toBeVisible();
  await expect(chip("654321")).toBeVisible();

  // the user types a new number and presses Enter to add it (the placeholder
  // is hidden while chips are selected, so target the tag input itself)
  const input = main
    .locator(".form-row")
    .filter({ hasText: "Valor:" })
    .getByRole("combobox");
  await input.click();
  await input.fill("777");
  await input.press("Enter");
  await expect(chip("777")).toBeVisible();

  // non-numeric entries are discarded
  await input.fill("abc");
  await input.press("Enter");
  await expect(chip("abc")).toHaveCount(0);
  await expect(main.locator(".ant-select-selection-item")).toHaveCount(3);
});
