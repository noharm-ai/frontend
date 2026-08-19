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

const SUBSTANCE_IDS = ["1", "2", "3", "4", "5", "6", "7", "8"];

const listProtocolFixture = {
  id: 1,
  name: "Protocolo Antimicrobiano",
  protocolType: 2,
  statusType: 2,
  config: {
    variables: [
      {
        name: "subs",
        field: "substance",
        operator: "IN",
        value: SUBSTANCE_IDS,
      },
      { name: "idade", field: "age", operator: ">=", value: 65 },
      // resolved from a bounded lookup endpoint
      { name: "setor", field: "idDepartment", operator: "IN", value: ["7"] },
      // resolved from the redux segment list, not from an endpoint
      { name: "seg", field: "idSegment", operator: "IN", value: [1] },
    ],
    trigger: "{{subs}} and {{idade}} and {{setor}} and {{seg}}",
    result: {
      level: "high",
      message: "Antimicrobiano em idoso",
      description: "Antimicrobiano em idoso",
    },
  },
};

test("trigger builder round-trip and advanced mode", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: protocolFixture },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  const sentence = main.locator(".expression-sentence");

  // the builder lives in the "Gatilho" step
  await main.locator(".ant-steps-item").filter({ hasText: "Gatilho" }).click();

  // builder opens with the parsed expression described in prose
  await expect(main.getByRole("button", { name: "v1" }).first()).toBeVisible();
  await expect(sentence.locator(".sentence-title")).toContainText(
    "O protocolo dispara quando"
  );
  await expect(sentence.locator(".condition-subject")).toHaveText(
    "a idade do paciente"
  );
  await expect(sentence.locator(".criterion-phrase")).toHaveText("é maior que");
  await expect(sentence.locator(".criterion-text")).toHaveText("60 anos");

  // add a second condition and pick the variable from the dropdown
  await main.getByRole("button", { name: "condição" }).click();
  await main.getByRole("button", { name: "selecionar variável" }).click();
  await page.getByRole("menuitem", { name: "v1 · Idade > 60" }).click();
  await expect(sentence.locator(".group-headline")).toHaveText(
    "todas as condições abaixo são atendidas:"
  );
  await expect(sentence.locator(".sentence-connector")).toHaveText("e");
  await expect(sentence.locator(".condition-subject")).toHaveCount(2);

  // negate the whole group via the header chip
  await main.getByRole("button", { name: "NÃO" }).first().click();
  await expect(sentence.locator(".group-headline")).toContainText(
    "as condições abaixo não são todas atendidas:"
  );

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

  // valid expression parses back into the builder; nested groups render
  // as an indented outline
  await textarea.fill("{{v1}} or ({{v1}} and not {{v1}})");
  await main.getByText("Visual", { exact: true }).click();
  await expect(sentence.locator(".group-headline").first()).toHaveText(
    "pelo menos uma das condições abaixo é atendida:"
  );
  await expect(
    sentence.locator(".sentence-group .sentence-group .group-headline")
  ).toHaveText("todas as condições abaixo são atendidas:");
  await expect(sentence.locator(".sentence-connector")).toHaveText(["ou", "e"]);
  await expect(sentence.locator(".condition-not")).toHaveText("NÃO");

  // deleting a referenced variable (in the "Variáveis" step) asks for
  // confirmation
  await main
    .locator(".ant-steps-item")
    .filter({ hasText: "Variáveis" })
    .click();
  await main.getByRole("button", { name: "delete" }).first().click();
  const confirm = page
    .getByRole("dialog")
    .filter({ hasText: "Remover variável em uso" });
  await expect(confirm).toBeVisible();
  await confirm.getByRole("button", { name: "Cancelar" }).click();
  await main.locator(".ant-steps-item").filter({ hasText: "Gatilho" }).click();
  await expect(main.getByRole("button", { name: "v1" }).first()).toBeVisible();
});

test("sentence describes every item behind the stored ids", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /admin/protocol/:id", {
    json: { status: "success", data: listProtocolFixture },
  });
  mockApi.override("GET /substance/resolve", {
    json: {
      status: "success",
      data: SUBSTANCE_IDS.map((id) => ({
        sctid: id,
        name: `Substância ${id}`,
      })),
    },
  });
  mockApi.override("GET /admin/protocol/department/list", {
    json: {
      status: "success",
      data: [
        {
          idDepartment: "7",
          name: "UTI Adulto",
          segments: [{ id: "1", name: "Segmento UTI" }],
        },
      ],
    },
  });

  await page.goto("/admin/protocolos/1");

  const main = page.getByRole("main");
  await main.locator(".ant-steps-item").filter({ hasText: "Gatilho" }).click();

  const sentence = main.locator(".expression-sentence");
  const substanceCard = sentence
    .locator(".condition-criterion")
    .filter({ hasText: "Substância 1" });

  // ids are replaced by their descriptions, not by an item count
  await expect(substanceCard.locator(".item-chip").first()).toHaveText(
    "1 - Substância 1"
  );
  await expect(sentence).not.toContainText("itens]");

  // long lists fold behind a toggle instead of burying the sentence
  await expect(substanceCard.locator(".item-chip")).toHaveCount(6);
  await substanceCard.getByRole("button", { name: "+2 itens" }).click();
  await expect(substanceCard.locator(".item-chip")).toHaveCount(8);
  await expect(substanceCard.locator(".item-chip").last()).toHaveText(
    "8 - Substância 8"
  );

  // the scalar condition reads as prose with its unit
  await expect(
    sentence.locator(".condition-criterion").filter({ hasText: "65" })
  ).toContainText("é maior ou igual a");

  // lookup-table ids (setor) and redux-backed ids (segmento) describe too
  await expect(sentence.getByText("UTI Adulto (7)")).toBeVisible();
  await expect(sentence.getByText("Adulto (1)")).toBeVisible();
});
