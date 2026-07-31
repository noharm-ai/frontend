import { test, expect } from "../support/mockApi";

const protocolFixture = {
  id: 1,
  name: "Protocolo Idoso",
  protocolType: 2,
  statusType: 2,
  config: {
    variables: [{ name: "v1", field: "age", operator: ">", value: 60 }],
    trigger: "{{v1}}",
    result: {
      level: "high",
      message: "Paciente idoso",
      description: "Paciente idoso",
    },
  },
};

test("trigger builder round-trip and advanced mode", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/protocol/list", {
    json: { status: "success", data: [protocolFixture] },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");

  // builder opens by default with the parsed expression
  await expect(main.getByRole("button", { name: "v1" }).first()).toBeVisible();
  await expect(main.locator("code", { hasText: "{{v1}}" })).toBeVisible();

  // add a second condition and pick the variable from the dropdown
  await main.getByRole("button", { name: "condição" }).click();
  await main.getByRole("button", { name: "selecionar variável" }).click();
  await page.getByRole("menuitem", { name: "v1 · Idade > 60" }).click();
  await expect(
    main.locator("code", { hasText: "{{v1}} and {{v1}}" })
  ).toBeVisible();

  // negate the whole group
  await main.getByRole("checkbox", { name: "NÃO" }).first().check();
  await expect(
    main.locator("code", { hasText: "not ({{v1}} and {{v1}})" })
  ).toBeVisible();

  // switch to advanced mode: textarea carries the generated expression
  await main.getByText("Avançado").click();
  const textarea = main.locator("textarea").last();
  await expect(textarea).toHaveValue("not ({{v1}} and {{v1}})");

  // garbage blocks switching back
  await textarea.fill("banana");
  await main.getByText("Visual", { exact: true }).click();
  await expect(
    main.getByText(/Não foi possível interpretar a expressão/)
  ).toBeVisible();
  await expect(textarea).toHaveValue("banana");

  // valid expression parses back into the builder
  await textarea.fill("{{v1}} or ({{v1}} and not {{v1}})");
  await main.getByText("Visual", { exact: true }).click();
  await expect(
    main.locator("code", { hasText: "{{v1}} or ({{v1}} and not {{v1}})" })
  ).toBeVisible();

  // deleting a referenced variable asks for confirmation
  await main.getByRole("button", { name: "delete" }).first().click();
  const confirm = page
    .getByRole("dialog")
    .filter({ hasText: "Remover variável em uso" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await expect(main.getByRole("button", { name: "v1" }).first()).toBeVisible();
});
