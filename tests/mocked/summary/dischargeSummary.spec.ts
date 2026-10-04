import type { Locator, Page } from "@playwright/test";

import { test, expect } from "../support/mockApi";
import type { MockApi } from "../support/mockApi";
import { loadFixture } from "../support/defaultHandlers";
import { pickMenuItem } from "../support/antd";

/**
 * Discharge summary (/sumario-alta/:admissionNumber, src/features/summary).
 *
 * One GET /summary/:admissionNumber brings the whole admission: the patient,
 * the lists the page verbalizes itself (allergies, lab exams, drugs, recipe)
 * and a per-block LLM configuration. The eight AI blocks are then generated
 * one at a time through POST /summary/prompt — a block whose config carries no
 * audit record is answered "Nada consta" without ever reaching the model.
 *
 * Everything the pharmacist does afterwards lands in /memory: a like, a
 * dislike with its reason, an edit, the draft, and the finished summary.
 */

const ADMISSION = 9100;
/** Distinct from the id the shared storage state already has cached. */
const PATIENT_ID = 4210;
const SUMMARY_URL = `/sumario-alta/${ADMISSION}`;

/**
 * Blocks are rendered as a styled-components div right after the heading that
 * names them, so the heading id is the only stable anchor they have.
 */
const PANEL = {
  patient: "#id-paciente",
  admission: "#dados-internacao",
  reason: "#motivo-admissao",
  diagnosis: "#diagnosticos",
  allergies: "#alergias",
  previousDrugs: "#medicamentos-uso-previo",
  labExams: "#exames-lab",
  textExams: "#exames-textuais",
  procedures: "#procedimentos",
  drugsUsed: "#medicamentos-internacao",
  drugsSuspended: "#medicamentos-interrompidos",
  recipe: "#receita",
  dischargePlan: "#plano-alta",
} as const;

const panel = (page: Page, block: keyof typeof PANEL): Locator =>
  page.locator(`${PANEL[block]} + div`);

/**
 * The AI blocks are started on a 1s + 1.5s staircase (see startLoadingBlocks),
 * so the last one only asks the model ~11s in. Waiting on a late block needs
 * more than the default assertion timeout.
 */
const LATE_BLOCK_TIMEOUT = 20000;

/**
 * Answers a prompt from the system message it carries, so one handler gives
 * every block its own recognizable text.
 */
const answerFor = (prompt: string) => {
  const answer = prompt.includes("motivo")
    ? "Admitida por pneumonia adquirida na comunidade."
    : prompt.includes("diagnóstico")
      ? "Pneumonia adquirida na comunidade (CID J18)."
      : prompt.includes("medicamentos prévios")
        ? "Losartana 50mg, uso contínuo."
        : prompt.includes("internação")
          ? "Evoluiu com melhora progressiva do padrão respiratório."
          : prompt.includes("procedimento")
            ? "Nenhum procedimento cirúrgico realizado."
            : prompt.includes("condição de alta")
              ? "Alta em bom estado geral, afebril."
              : prompt.includes("plano de alta")
                ? "Retorno ambulatorial em 7 dias."
                : "Resposta gerada pela IA.";

  return { status: "success", data: { answer } };
};

function installSummaryHandlers(mockApi: MockApi, summary?: unknown) {
  mockApi.override(
    "GET /summary/:admissionNumber",
    summary ? { json: summary } : { json: loadFixture("summary/summary.json") },
  );
  mockApi.override("POST /summary/prompt", (route) => {
    const body = route.request().postData() ?? "";
    return route.fulfill({ json: answerFor(body) });
  });
  // the patient name never comes from /summary: it is resolved by the getname
  // service, whose default fixture answers for any id
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Fulano Beltrano" },
  });
  // every reaction, edit and draft the page records
  mockApi.override("PUT /memory", { json: { status: "success", data: {} } });
  mockApi.override("PUT /memory/unique/:type", {
    json: { status: "success", data: {} },
  });
}

async function openSummary(page: Page, mockApi: MockApi, summary?: unknown) {
  installSummaryHandlers(mockApi, summary);
  await page.goto(SUMMARY_URL);
  await expect(
    page.getByRole("heading", { name: "1) IDENTIFICAÇÃO DO PACIENTE" }),
  ).toBeVisible();
}

/**
 * The block actions are icon-only buttons, so their accessible name is the
 * antd icon's aria-label. getByRole matches names by substring unless told
 * otherwise, and "like" is a substring of "dislike".
 */
const action = (scope: Locator, icon: string) =>
  scope.getByRole("button", { name: icon, exact: true });

/**
 * Answers the "there is a draft for this summary" confirm.
 *
 * React StrictMode runs the mount effect twice on the dev server, so the same
 * confirm can be stacked twice there while a production build only ever shows
 * one. Answer whatever is open, topmost first.
 */
async function answerDraftPrompt(page: Page, answer: "Sim" | "Não") {
  const confirms = page.locator(".ant-modal", {
    hasText: "Existe um rascunho para este sumário",
  });

  await expect(confirms.first()).toBeVisible();
  await expect(confirms.first()).not.toHaveClass(/ant-zoom/);

  for (let open = await confirms.count(); open > 0; open--) {
    await confirms.last().getByRole("button", { name: answer }).click();
    await expect(confirms).toHaveCount(open - 1);
  }
}

/** Waits out the zoom motion so the modal's buttons are clickable. */
async function settledModal(
  page: Page,
  hasText: string,
  selector = ".ant-modal",
) {
  const modal = page.locator(selector, { hasText }).first();
  await expect(modal).toBeVisible();
  await expect(modal).not.toHaveClass(/ant-zoom/);
  return modal;
}

const promptCount = (mockApi: MockApi) =>
  mockApi.requests.filter((r) => r.path === "/summary/prompt").length;

const memoryWrites = (mockApi: MockApi) =>
  mockApi.requests
    .filter((r) => r.method === "PUT" && r.path === "/memory")
    .map((r) => JSON.parse(r.postData ?? "{}"));

test("the payload fills every block the page verbalizes itself", async ({
  page,
  mockApi,
}) => {
  await openSummary(page, mockApi);

  const patient = panel(page, "patient");
  await expect(patient).toContainText("Fulano Beltrano");
  await expect(patient).toContainText("10/05/1980");
  await expect(patient).toContainText(`${ADMISSION}`);
  await expect(patient).toContainText("Feminino");
  await expect(patient).toContainText("Parda");

  const admission = panel(page, "admission");
  await expect(admission).toContainText("Data de internação:");
  await expect(admission).toContainText("Data de alta:");

  // allergies, lab exams and suspended drugs are plain bullet lists
  await expect(panel(page, "allergies")).toContainText("Dipirona");
  await expect(panel(page, "allergies")).toContainText("Penicilina");
  await expect(panel(page, "labExams")).toContainText(
    "Creatinina (04/03/2024): 1.1 mg/dL",
  );
  await expect(panel(page, "drugsSuspended")).toContainText("Varfarina 5mg");

  // drugs used are grouped by therapeutic class, and the J1 group spells the
  // period out on its own line
  const drugsUsed = panel(page, "drugsUsed");
  await expect(drugsUsed).toContainText("Antimicrobianos:");
  await expect(drugsUsed).toContainText("Ceftriaxona 1g -- 7 dias");
  await expect(drugsUsed).toContainText("Trato digestivo: Omeprazol 40mg");

  // the recipe is grouped by route instead
  const recipe = panel(page, "recipe");
  await expect(recipe).toContainText("Via Oral:");
  await expect(recipe).toContainText("Amoxicilina 500mg: 1 CP 8/8 horas");
  await expect(recipe).toContainText("Via Subcutânea:");
  await expect(recipe).toContainText("Enoxaparina 40mg: 1 SER 1x ao dia");
});

test("an empty list is verbalized as its own 'nothing found' sentence", async ({
  page,
  mockApi,
}) => {
  const summary = loadFixture<any>("summary/summary.json");
  summary.data.allergies = [];
  summary.data.exams = [];
  summary.data.drugsUsed = [];
  summary.data.receipt = [];

  await openSummary(page, mockApi, summary);

  await expect(panel(page, "allergies")).toContainText(
    "Nenhuma alergia encontrada",
  );
  await expect(panel(page, "labExams")).toContainText(
    "Nenhum exame encontrado",
  );
  await expect(panel(page, "drugsUsed")).toContainText(
    "Nenhum registro encontrado",
  );
  await expect(panel(page, "recipe")).toContainText(
    "Nenhum medicamento encontrado",
  );
});

test("AI blocks are generated one at a time, and one without audit skips the model", async ({
  page,
  mockApi,
}) => {
  await openSummary(page, mockApi);

  await expect(panel(page, "reason")).toContainText(
    "Admitida por pneumonia adquirida na comunidade.",
  );
  await expect(panel(page, "diagnosis")).toContainText("CID J18");

  // textExams is configured with an empty audit list: the block is filled
  // locally and never reaches POST /summary/prompt
  await expect(panel(page, "textExams")).toContainText("Nada consta", {
    timeout: LATE_BLOCK_TIMEOUT,
  });
  await expect(panel(page, "procedures")).toContainText(
    "Nenhum procedimento cirúrgico realizado.",
    { timeout: LATE_BLOCK_TIMEOUT },
  );

  // seven of the eight AI blocks carry audit records
  const prompts = mockApi.requests.filter((r) => r.path === "/summary/prompt");
  expect(prompts.length).toBeLessThanOrEqual(7);
  expect(
    prompts.some((r) => (r.postData ?? "").includes("Resuma os exames")),
  ).toBe(false);

  // the block's own configuration is what is sent to the model
  // only the block's own prompt travels to the model; the audit stays local
  expect(prompts[0].postData).toContain("Resuma o motivo da admissão.");
  expect(prompts[0].postData).not.toContain("Evolução médica 01/03");
});

test("a block the model rejects offers a retry that asks again", async ({
  page,
  mockApi,
}) => {
  installSummaryHandlers(mockApi);
  mockApi.override("POST /summary/prompt", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto(SUMMARY_URL);

  const reason = panel(page, "reason");
  const retry = action(reason, "reload");
  await expect(retry).toBeVisible();
  // the failed block shows nothing but the retry: no answer, no reactions
  await expect(action(reason, "like")).toHaveCount(0);

  mockApi.override("POST /summary/prompt", (route) =>
    route.fulfill({ json: answerFor(route.request().postData() ?? "") }),
  );
  await retry.click();

  await expect(reason).toContainText(
    "Admitida por pneumonia adquirida na comunidade.",
  );
});

test("the refresh button regenerates a block", async ({ page, mockApi }) => {
  await openSummary(page, mockApi);

  const reason = panel(page, "reason");
  await expect(reason).toContainText("Admitida por pneumonia");
  const before = promptCount(mockApi);

  mockApi.override("POST /summary/prompt", {
    json: { status: "success", data: { answer: "Texto regerado." } },
  });
  await action(reason, "reload").click();

  await expect(reason).toContainText("Texto regerado.");
  expect(promptCount(mockApi)).toBeGreaterThan(before);
});

test("the audit modal lists the records the model was given", async ({
  page,
  mockApi,
}) => {
  await openSummary(page, mockApi);

  const reason = panel(page, "reason");
  await expect(reason).toContainText("Admitida por pneumonia");

  await pickMenuItem(page, action(reason, "setting"), /Auditoria/);

  const modal = await settledModal(
    page,
    "Lista de registros encontrados pela IA",
  );
  await expect(modal).toContainText("Evolução médica 01/03");
  await expect(modal).toContainText("Evolução médica 02/03");
});

test("editing a block records the edit against the original answer", async ({
  page,
  mockApi,
}) => {
  await openSummary(page, mockApi);

  const reason = panel(page, "reason");
  await expect(reason).toContainText("Admitida por pneumonia");

  await action(reason, "edit").click();
  await reason.locator("textarea").fill("Texto revisado pelo farmacêutico.");
  await action(reason, "save").click();

  await expect(reason).toContainText("Texto revisado pelo farmacêutico.");

  const edits = memoryWrites(mockApi).filter(
    (m) => m.type === "summary-edited",
  );
  expect(edits).toHaveLength(1);
  expect(edits[0].block).toBe("reason");
  expect(edits[0].value.text).toBe("Texto revisado pelo farmacêutico.");
  expect(edits[0].value.original).toBe(
    "Admitida por pneumonia adquirida na comunidade.",
  );
  expect(edits[0].value.admissionNumber).toBe(`${ADMISSION}`);
});

test("a like is recorded and marks the block; a dislike carries its reason", async ({
  page,
  mockApi,
}) => {
  await openSummary(page, mockApi);

  const reason = panel(page, "reason");
  await expect(reason).toContainText("Admitida por pneumonia");

  const like = action(reason, "like");
  await like.click();
  await expect(like).toHaveClass(/ant-btn-primary/);

  const diagnosis = panel(page, "diagnosis");
  await expect(diagnosis).toContainText("CID J18");
  const dislike = action(diagnosis, "dislike");
  await pickMenuItem(page, dislike, "Informação insuficiente");
  await expect(dislike).toHaveClass(/dangerous/);

  const reactions = memoryWrites(mockApi).filter((m) =>
    ["summary-like", "summary-dislike"].includes(m.type),
  );
  expect(reactions).toHaveLength(2);

  // matched as a whole, so a reaction that never arrived fails the assertion
  // instead of blowing up on a property of undefined
  expect(reactions.find((m) => m.type === "summary-like")).toMatchObject({
    block: "reason",
    value: { text: "Admitida por pneumonia adquirida na comunidade." },
  });

  expect(reactions.find((m) => m.type === "summary-dislike")).toMatchObject({
    block: "diagnosis",
    value: { idReason: "2", reason: "Informação insuficiente" },
  });
});

test("'Gerar Texto' assembles the whole summary and copies it", async ({
  page,
  mockApi,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openSummary(page, mockApi);

  await expect(panel(page, "reason")).toContainText("Admitida por pneumonia");

  await page
    .getByRole("button", { name: /Gerar Texto/ })
    .first()
    .click();

  const modal = await settledModal(page, "Sumário de Alta");
  const text = modal.locator("textarea");
  await expect(text).toContainText("1) Identificação do Paciente");
  await expect(text).toContainText("Fulano Beltrano");
  await expect(text).toContainText(
    "Admitida por pneumonia adquirida na comunidade.",
  );
  await expect(text).toContainText("Via Oral:");

  await modal.getByRole("button", { name: "Copiar" }).click();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("3.2) Receita");
  expect(copied).toContain("Amoxicilina 500mg");
});

test("finishing the summary needs a rating and flips the status", async ({
  page,
  mockApi,
}) => {
  // every block that lands puts the summary back to "pending", so the status
  // only settles once the last one of the staircase has answered
  test.setTimeout(60000);
  await openSummary(page, mockApi);
  await expect(panel(page, "dischargePlan")).toContainText(
    "Retorno ambulatorial em 7 dias.",
    { timeout: LATE_BLOCK_TIMEOUT },
  );

  await expect(page.getByText("Sumário pendente")).toBeVisible();
  await page
    .getByRole("button", { name: /Finalizar Sumário/ })
    .first()
    .click();

  const modal = await settledModal(
    page,
    "Qual é a sua avaliação geral sobre o sumário",
  );
  // the rating is required: submitting without it keeps the modal open
  await modal.getByRole("button", { name: "Finalizar Sumário" }).click();
  await expect(modal.getByText("Campo obrigatório")).toBeVisible();

  await modal.locator(".ant-rate-star").nth(3).click();
  await expect(modal.getByText("Muito Boa")).toBeVisible();
  await modal.locator("textarea").fill("Sumário revisado.");
  await modal.getByRole("button", { name: "Finalizar Sumário" }).click();

  await expect(
    page.getByText("Sumário finalizado com sucesso! Obrigado!"),
  ).toBeVisible();
  await expect(page.getByText("Sumário finalizado!")).toBeVisible();

  const saved = mockApi.requests.find(
    (r) => r.path === `/memory/unique/summary_save_${ADMISSION}`,
  );
  const body = JSON.parse(saved?.postData ?? "{}");
  expect(body.value.rate).toBe(4);
  expect(body.value.obs).toBe("Sumário revisado.");
  expect(body.value.blocks.reason.text).toBe(
    "Admitida por pneumonia adquirida na comunidade.",
  );
});

test("an existing draft is offered, and loading it replaces the generated blocks", async ({
  page,
  mockApi,
}) => {
  const summary = loadFixture<any>("summary/summary.json");
  summary.data.draft = {
    reason: { text: "Motivo escrito no rascunho." },
    allergies: { text: "Alergias do rascunho." },
  };

  installSummaryHandlers(mockApi, summary);
  await page.goto(SUMMARY_URL);

  await answerDraftPrompt(page, "Sim");

  await expect(panel(page, "reason")).toContainText(
    "Motivo escrito no rascunho.",
  );
  await expect(panel(page, "allergies")).toContainText("Alergias do rascunho.");

  // choosing the draft skips the AI staircase entirely
  await page.waitForTimeout(3000);
  expect(promptCount(mockApi)).toBe(0);
});

test("declining the draft generates the blocks instead", async ({
  page,
  mockApi,
}) => {
  const summary = loadFixture<any>("summary/summary.json");
  summary.data.draft = { reason: { text: "Motivo escrito no rascunho." } };

  installSummaryHandlers(mockApi, summary);
  await page.goto(SUMMARY_URL);

  await answerDraftPrompt(page, "Não");

  await expect(panel(page, "reason")).toContainText(
    "Admitida por pneumonia adquirida na comunidade.",
  );
});

test("the draft menu stores the current blocks under this admission", async ({
  page,
  mockApi,
}) => {
  await openSummary(page, mockApi);
  await expect(panel(page, "reason")).toContainText("Admitida por pneumonia");

  await pickMenuItem(
    page,
    page.getByRole("button", { name: "Rascunho" }),
    /Salvar rascunho/,
  );

  await expect(page.locator(".ant-notification-notice").first()).toBeVisible();

  const saved = mockApi.requests.find(
    (r) => r.path === `/memory/unique/draft_summary_${ADMISSION}`,
  );
  expect(saved).toBeTruthy();
  const body = JSON.parse(saved?.postData ?? "{}");
  expect(body.value.reason.text).toBe(
    "Admitida por pneumonia adquirida na comunidade.",
  );
  expect(body.value.allergies.text).toContain("Dipirona");
});

test("a failing summary fetch warns and renders nothing", async ({
  page,
  mockApi,
}) => {
  installSummaryHandlers(mockApi);
  mockApi.override("GET /summary/:admissionNumber", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto(SUMMARY_URL);

  await expect(page.locator(".ant-notification-notice").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "1) IDENTIFICAÇÃO DO PACIENTE" }),
  ).toHaveCount(0);
});
