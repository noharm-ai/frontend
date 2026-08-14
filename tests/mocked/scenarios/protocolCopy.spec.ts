import type { Route } from "@playwright/test";

import { test, expect } from "../support/mockApi";

/** Matches the schema in fixtures/auth/authenticate.json. */
const OWN_SCHEMA = "demo";

const result = {
  level: "high",
  message: "Alerta",
  description: "Alerta",
};

const ownProtocol = {
  id: 1,
  name: "Protocolo Local",
  schema: OWN_SCHEMA,
  protocolType: 2,
  statusType: 1,
  config: {
    variables: [{ name: "idade", field: "age", operator: ">=", value: 65 }],
    trigger: "{{idade}}",
    result,
  },
};

/**
 * Lives in another schema and leans on schema-scoped data: setor ids, a
 * tp_exame code and a fkmedicamento inside a combo.
 */
const foreignProtocol = {
  id: 2,
  name: "Protocolo Vizinho",
  schema: "outro",
  protocolType: 4,
  statusType: 1,
  config: {
    variables: [
      { name: "setor", field: "idDepartment", operator: "IN", value: ["7"] },
      {
        name: "exame",
        field: "exam",
        examType: "cr",
        operator: ">",
        value: "1.5",
      },
      { name: "idade", field: "age", operator: ">=", value: 65 },
      {
        name: "combo",
        field: "combination",
        drug: ["55"],
        substance: ["1234"],
      },
    ],
    trigger: "{{setor}} and {{exame}} and {{idade}} and {{combo}}",
    result,
  },
};

/** Shared by every schema ("Todos"): editable from any of them. */
const globalProtocol = {
  id: 3,
  name: "Protocolo Global",
  schema: null,
  protocolType: 2,
  statusType: 1,
  config: {
    variables: [{ name: "idade", field: "age", operator: ">=", value: 80 }],
    trigger: "{{idade}}",
    result,
  },
};

const allProtocols = [ownProtocol, foreignProtocol, globalProtocol];

/** The listing carries no config: it is fetched by id when needed. */
const listAll = {
  json: {
    status: "success",
    data: allProtocols.map(({ config: _config, ...header }) => header),
  },
};

/**
 * Serves one protocol, config included, like GET /admin/protocol/<id>.
 * Enforces the same visibility rule as the endpoint: a protocol owned by
 * another schema is only returned with allSchemas.
 */
const getById = async (route: Route) => {
  const url = new URL(route.request().url());
  const id = Number(url.pathname.split("/").pop());
  const allSchemas = url.searchParams.get("allSchemas") === "true";

  const protocol = allProtocols.find((p) => p.id === id);
  const visible =
    protocol &&
    (allSchemas || !protocol.schema || protocol.schema === OWN_SCHEMA);

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      status: "success",
      data: visible ? protocol : null,
    }),
  });
};

/** Lookups the variable selects hit to resolve the labels of stored ids. */
const lookupHandlers = {
  "GET /admin/protocol/department/list": {
    json: {
      status: "success",
      data: [
        {
          idDepartment: "7",
          name: "UTI",
          segments: [{ id: "1", name: "Segmento UTI" }],
        },
      ],
    },
  },
  "GET /exams/types/list": {
    json: { status: "success", data: [{ examType: "cr", name: "Creatinina" }] },
  },
  "GET /substance/resolve": {
    json: { status: "success", data: [{ sctid: "1234", name: "Vancomicina" }] },
  },
};

test("a copy from another schema drops the schema-scoped values", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/protocol/list", listAll);
  mockApi.override("GET /admin/protocol/:id", getById);
  Object.entries(lookupHandlers).forEach(([key, handler]) =>
    mockApi.override(key, handler),
  );

  await page.goto("/admin/protocolos");

  const foreignRow = page.getByRole("row", { name: /Protocolo Vizinho/ });

  // a protocol owned by another schema cannot be saved back, so editing is off
  await expect(
    foreignRow.getByRole("button", { name: "Editar protocolo" }),
  ).toBeDisabled();

  await foreignRow.getByRole("button", { name: "Copiar protocolo" }).click();

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(
    "Copiar Protocolo",
  );
  await expect(main.locator("input").first()).toHaveValue(
    "Protocolo Vizinho (cópia)",
  );

  // the notice names every variable that lost a value, combos included
  const notice = page.locator(".ant-alert");
  await expect(notice).toContainText("Protocolo Vizinho");
  await expect(notice).toContainText("setor: Setor");
  await expect(notice).toContainText("exame: Exame");
  await expect(notice).toContainText("combo: Medicamento");
  // portable values (age, sctid) are not cleared, so they are not listed
  await expect(notice).not.toContainText("idade");

  // saving is blocked while a cleared field is still empty: the backend drops
  // empty combo attributes silently, so this is the only guard for them
  await main.getByRole("button", { name: "Salvar" }).click();
  await expect(
    page.getByText("Preencha os campos limpos na cópia"),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path === "/admin/protocol/upsert"),
  ).toHaveLength(0);
});

test("a copy inside the same schema keeps every value and saves inactive", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/protocol/list", listAll);
  mockApi.override("GET /admin/protocol/:id", getById);
  mockApi.override("POST /admin/protocol/upsert", {
    json: { status: "success", data: 3 },
  });
  Object.entries(lookupHandlers).forEach(([key, handler]) =>
    mockApi.override(key, handler),
  );

  await page.goto("/admin/protocolos");

  await page
    .getByRole("row", { name: /Protocolo Local/ })
    .getByRole("button", { name: "Copiar protocolo" })
    .click();

  const main = page.getByRole("main");
  await expect(main.locator("input").first()).toHaveValue(
    "Protocolo Local (cópia)",
  );
  // nothing was cleared, so the notice only warns about the inactive status
  await expect(page.locator(".ant-alert")).toContainText("começa como Inativa");

  await main.getByRole("button", { name: "Salvar" }).click();

  await expect
    .poll(
      () =>
        mockApi.requests.filter((r) => r.path === "/admin/protocol/upsert")
          .length,
    )
    .toBe(1);

  const upsert = mockApi.requests.find(
    (r) => r.path === "/admin/protocol/upsert",
  );
  const payload = JSON.parse(upsert!.postData!);
  // a new record, detached from the source, inactive until reviewed
  expect(payload.id).toBeUndefined();
  expect(payload.name).toBe("Protocolo Local (cópia)");
  expect(payload.statusType).toBe(0);
  expect(payload.config.variables).toEqual(ownProtocol.config.variables);
  expect(payload.config.trigger).toBe(ownProtocol.config.trigger);
});

test("a global protocol is editable from any schema", async ({
  page,
  mockApi,
}) => {
  mockApi.override("POST /admin/protocol/list", listAll);
  // the editor loads the record it edits by id, not from the listing
  mockApi.override("GET /admin/protocol/:id", getById);

  await page.goto("/admin/protocolos");

  await page
    .getByRole("row", { name: /Protocolo Global/ })
    .getByRole("button", { name: "Editar protocolo" })
    .click();

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(
    "Protocolo Global",
  );
  // editing it changes behaviour for every schema, so the form says so
  await expect(page.locator(".ant-alert")).toContainText(
    "Protocolo global (Todos os schemas)",
  );
});
