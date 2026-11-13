import { test, expect } from "../support/mockApi";
import { loginWithFeatures } from "../support/featureLogin";

/**
 * Cultures of the infection control page (/controle-infeccao/:admissionNumber,
 * src/features/infectionControl/InfectionControlCultures).
 *
 * GET /infection-control/admission/:admissionNumber/cultures brings every
 * collection (exam, material and collection date) of the patient released in
 * the last 60 days, each with its cultures and their antibiograms. The card
 * lists them with each microorganism's antibiogram summed up, and a collection
 * opens whole in a drawer. It is loaded apart from the timeline: a failure
 * stays in its section, which retries it alone. With the culture feature the
 * cultures by drug (GET /prescriptions/:id/cultures), the view the screening
 * card has in its culture tab, sit beside them, and tell which drugs the
 * prescription carries.
 */

const ADMISSION = 9300;
const PATIENT_ID = 4330;
const PAGE_URL = `/controle-infeccao/${ADMISSION}`;
const ENDPOINT = "GET /infection-control/admission/:admissionNumber/cultures";
const TIMELINE_ENDPOINT =
  "GET /infection-control/antimicrobial-timeline/:admissionNumber";

const hoursFromNow = (hours: number) =>
  new Date(Date.now() + hours * 60 * 60 * 1000).toISOString().slice(0, 19);

const timeline = {
  status: "success",
  data: {
    now: hoursFromNow(0),
    patient: {
      idPatient: `${PATIENT_ID}`,
      admissionNumber: ADMISSION,
      admissionDate: hoursFromNow(-240),
      dischargeDate: null,
      dischargeReason: null,
      birthdate: "1980-05-10T00:00:00",
      gender: "F",
      weight: 64,
      weightDate: hoursFromNow(-240),
      height: 165,
      idPrescription: null,
      bed: "3B",
      record: null,
      department: "UTI Adulto",
      segment: "Segmento Adulto",
      idSegment: 3,
    },
    courses: [],
    exams: [],
    alertExams: 0,
    followUp: { enabled: false, admissionNumber: ADMISSION },
  },
};

const withPrescription = (idPrescription: string | null) => ({
  status: "success",
  data: {
    ...timeline.data,
    patient: { ...timeline.data.patient, idPrescription },
  },
});

const BLOOD_COLLECTED = hoursFromNow(-30);

const culture = (overrides: Record<string, unknown>) => ({
  examName: "Hemocultura teste",
  material: "Sangue teste",
  collectionDate: BLOOD_COLLECTED,
  releaseDate: hoursFromNow(-6),
  gram: null,
  previousResult: null,
  microorganisms: [],
  antibiogram: [],
  ...overrides,
});

const result = (
  microorganism: string | null,
  drug: string,
  resultType: string,
  text: string,
  mic: string | null = null,
) => ({
  microorganism,
  drug,
  result: text,
  resultType,
  resultDetail: null,
  mic,
});

// a collection: its exam, material and date are its first culture's
const collection = (cultures: Record<string, any>[]) => ({
  id: cultures[0].id,
  examName: cultures[0].examName,
  material: cultures[0].material,
  collectionDate: cultures[0].collectionDate,
  cultures,
});

const payload = (collections: unknown[]) => ({
  status: "success",
  data: {
    admissionNumber: ADMISSION,
    releasedSince: hoursFromNow(-60 * 24),
    collections,
    cultures: [],
  },
});

// a blood collection: a partial report, then the final one with the
// antibiogram of the microorganism it found
const PARTIAL = culture({
  id: "11",
  releaseDate: hoursFromNow(-20),
  gram: "Cocos gram positivos agrupados em cachos.",
  previousResult: "Crescimento bacteriano em 14 horas.",
});
const FINAL = culture({
  id: "12",
  releaseDate: hoursFromNow(-6),
  gram: "Cocos gram positivos agrupados em cachos.",
  previousResult: "<div><label>RESULTADO: </label><span>Positivo</span></div>",
  microorganisms: ["Microrganismo A teste"],
  antibiogram: [
    result("Microrganismo A teste", "OXACILINA", "R", "Resistente", ">2"),
    result("Microrganismo A teste", "PENICILINA", "R", "Resistente"),
    result("Microrganismo A teste", "CLINDAMICINA", "R", "Resistente"),
    result("Microrganismo A teste", "VANCOMICINA", "S", "Sensível", "1"),
    result("Microrganismo A teste", "LINEZOLIDA", "S", "Sensível"),
  ],
});
const BLOOD = collection([PARTIAL, FINAL]);

// an older urine collection with two microorganisms in one culture
const URINE = collection([
  culture({
    id: "21",
    examName: "Urocultura teste",
    material: "Urina teste",
    collectionDate: hoursFromNow(-80),
    releaseDate: hoursFromNow(-50),
    previousResult: "Positivo",
    microorganisms: ["Microrganismo B teste", "Microrganismo C teste"],
    antibiogram: [
      result("Microrganismo B teste", "AMICACINA", "S", "Sensível", "<=2"),
      result("Microrganismo B teste", "MEROPENEM", "R", "Resistente", ">8"),
      result("Microrganismo C teste", "AMICACINA", "R", "Resistente"),
      result("Microrganismo C teste", "AMPICILINA", "U", "Intermediário"),
    ],
  }),
]);

// a collection still waiting for the lab: no microorganism, the lab's words
const PENDING = collection([
  culture({
    id: "31",
    examName: "Cultura de ponta de cateter teste",
    material: "Ponta de cateter teste",
    collectionDate: hoursFromNow(-2),
    releaseDate: hoursFromNow(-2),
    previousResult: "Coleta aguardando liberação",
  }),
]);

test.beforeEach(({ mockApi }) => {
  mockApi.override("GET /names/:idPatient", {
    json: { status: "success", idPatient: PATIENT_ID, name: "Maria Teste" },
  });
  mockApi.override(TIMELINE_ENDPOINT, { json: timeline });
});

const rows = (page: any) =>
  page.getByTestId("recent-cultures").getByTestId("culture-collection");

test("lists each collection with what it found", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, { json: payload([PENDING, BLOOD, URINE]) });

  await page.goto(PAGE_URL);

  await expect(
    page.getByRole("heading", { name: "Culturas", exact: true }),
  ).toBeVisible({ timeout: 15000 });
  await expect(rows(page)).toHaveCount(3);

  // newest collection first
  await expect(rows(page).nth(0)).toContainText(
    "Cultura de ponta de cateter teste",
  );
  await expect(rows(page).nth(1)).toContainText("Hemocultura teste");
  await expect(rows(page).nth(2)).toContainText("Urocultura teste");

  // nothing found: the lab's words
  await expect(rows(page).nth(0)).toContainText("Coleta aguardando liberação");
  await expect(
    rows(page).nth(0).getByTestId("collection-organism"),
  ).toHaveCount(0);

  // the two reports of the blood collection, its microorganism and how its
  // antibiogram reads
  const blood = rows(page).nth(1);
  await expect(blood).toContainText("Sangue teste");
  await expect(blood).toContainText("2 resultados");
  const organism = blood.getByTestId("collection-organism");
  await expect(organism).toHaveCount(1);
  await expect(organism).toContainText("Microrganismo A teste");
  await expect(organism.getByTestId("organism-counts")).toHaveText("3 R · 2 S");
  await expect(organism.getByTestId("organism-resistant")).toHaveText(
    "R: OXACILINA, PENICILINA, CLINDAMICINA",
  );
  // no drug of the prescription is known without the cultures by drug
  await expect(blood.getByTestId("organism-in-use")).toHaveCount(0);

  // a microorganism per line; a result the backend could not classify is
  // neither resistant nor susceptible
  const urine = rows(page).nth(2).getByTestId("collection-organism");
  await expect(urine).toHaveCount(2);
  await expect(urine.nth(0).getByTestId("organism-counts")).toHaveText(
    "1 R · 1 S",
  );
  await expect(urine.nth(1).getByTestId("organism-counts")).toHaveText(
    "1 R · 1 outro",
  );
});

test("narrows the collections by exam, material or microorganism", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, { json: payload([PENDING, BLOOD, URINE]) });

  await page.goto(PAGE_URL);
  await expect(rows(page)).toHaveCount(3, { timeout: 15000 });

  // secondary: out of sight until asked for
  const form = page.getByTestId("collection-details-form");
  await expect(form).toBeHidden();
  await expect(page.getByTestId("collection-details")).toHaveText("Filtros");
  await page.getByTestId("collection-details").click();
  await expect(form).toContainText("Microrganismo");
  await expect(form.getByTestId("collection-details-clear")).toHaveText(
    "Limpar filtros",
  );
  await expect(form).toBeVisible();

  // every microorganism of the collections, once, in alphabetical order
  await form.getByTestId("collection-details-microorganisms").click();
  const options = page.locator(
    ".ant-select-dropdown:visible .ant-select-item-option",
  );
  await expect(options).toHaveText([
    "Microrganismo A teste",
    "Microrganismo B teste",
    "Microrganismo C teste",
  ]);
  await options.filter({ hasText: "Microrganismo B teste" }).click();

  // picking an option keeps the filters open
  await expect(form).toBeVisible();
  await expect(rows(page)).toHaveCount(1);
  await expect(rows(page).nth(0)).toContainText("Urocultura teste");
  // the button counts the filters in use
  await expect(
    page.getByTestId("collection-details").locator("xpath=.."),
  ).toContainText("1");

  // an exam the urine collection is not: nothing left
  await form.getByTestId("collection-details-exams").click();
  await page
    .locator(".ant-select-dropdown:visible .ant-select-item-option")
    .filter({ hasText: "Hemocultura teste" })
    .click();
  await expect(rows(page)).toHaveCount(0);
  await expect(page.getByText("Nenhuma coleta neste filtro.")).toBeVisible();

  await form.getByTestId("collection-details-clear").click();
  await expect(rows(page)).toHaveCount(3);
});

test("the day of the collections in sight stays under the toolbar", async ({
  page,
  mockApi,
}) => {
  // more collections of one day than the card shows
  const many = Array.from({ length: 12 }, (_, index) =>
    collection([
      culture({
        id: `5${index}`,
        examName: `Hemocultura ${index} teste`,
        previousResult: "Negativo",
      }),
    ]),
  );
  mockApi.override(ENDPOINT, { json: payload(many) });

  await page.goto(PAGE_URL);
  await expect(rows(page)).toHaveCount(12, { timeout: 15000 });

  const day = page.getByTestId("collection-day");
  await expect(day).toHaveCount(1);
  const toolbar = page
    .getByTestId("recent-cultures")
    .locator(".collections-toolbar");

  await rows(page).last().scrollIntoViewIfNeeded();

  // the day, right under the toolbar, both in sight
  const toolbarBox = (await toolbar.boundingBox())!;
  const dayBox = (await day.boundingBox())!;
  const firstRow = (await rows(page).first().boundingBox())!;
  expect(Math.abs(dayBox.y - (toolbarBox.y + toolbarBox.height))).toBeLessThan(
    2,
  );
  // the first row went by under them
  expect(firstRow.y).toBeLessThan(dayBox.y);
});

test.describe("on the timeline", () => {
  // a course from four days ago on, so the timeline is drawn
  const withCourse = {
    ...timeline,
    data: {
      ...timeline.data,
      courses: [
        {
          idDrug: 11,
          drug: "MEROPENEM 1 g SOL INJ",
          substance: null,
          atbLevel: null,
          cpoe: false,
          status: "active",
          start: hoursFromNow(-96),
          end: hoursFromNow(24),
          plannedEnd: null,
          plannedDays: null,
          days: 4,
          lastIdPrescription: "199",
          prescriptionCount: 1,
          gaps: [],
          regimens: [
            {
              start: hoursFromNow(-96),
              end: hoursFromNow(24),
              dose: 1,
              measureUnit: "g",
              frequency: "8h/8h",
              route: "IV",
            },
          ],
        },
      ],
    },
  };
  // collected long before the course: in the card, not on the timeline
  const OLD = collection([
    culture({
      id: "41",
      examName: "Hemocultura antiga teste",
      collectionDate: hoursFromNow(-24 * 30),
      releaseDate: hoursFromNow(-24 * 28),
      previousResult: "Negativo",
    }),
  ]);

  test.beforeEach(({ mockApi }) => {
    mockApi.override(TIMELINE_ENDPOINT, { json: withCourse });
    mockApi.override(ENDPOINT, {
      json: payload([PENDING, BLOOD, URINE, OLD]),
    });
  });

  test("marks each collection on the moment it was collected", async ({
    page,
  }) => {
    await page.goto(PAGE_URL);

    const row = page.getByTestId("timeline-cultures");
    await expect(row).toBeVisible({ timeout: 15000 });
    await expect(row).toContainText("3 coletas");
    const marks = row.getByTestId("timeline-culture");
    await expect(marks).toHaveCount(3);
    // red where a microorganism grew
    await expect(marks.and(page.locator(".isolated"))).toHaveCount(2);

    const urine = row.getByRole("button", { name: /Urocultura teste/ });
    await urine.hover();
    await expect(page.getByRole("tooltip")).toContainText(
      "Microrganismo B teste, Microrganismo C teste",
    );

    // a row of the group of the exams, even without exams: it hides with it
    await expect(
      page
        .getByTestId("exam-timeline-group")
        .locator("xpath=following-sibling::*[1]"),
    ).toHaveAttribute("data-testid", "timeline-cultures");
    await page.getByTestId("toggle-exams").click();
    await expect(row).toHaveCount(0);
    await page.getByTestId("toggle-exams").click();
    await expect(row.getByTestId("timeline-culture")).toHaveCount(3);
  });

  test("opens the collection in the drawer", async ({ page }) => {
    await page.goto(PAGE_URL);
    await expect(rows(page)).toHaveCount(4, { timeout: 15000 });

    // one the filters of the card hide still opens, among all of them
    await page.getByTestId("collection-details").click();
    await page.getByTestId("collection-details-microorganisms").click();
    await page
      .locator(".ant-select-dropdown:visible .ant-select-item-option")
      .filter({ hasText: "Microrganismo A teste" })
      .click();
    await expect(rows(page)).toHaveCount(1);
    await page.keyboard.press("Escape");

    await page
      .getByTestId("timeline-cultures")
      .getByRole("button", { name: /Urocultura teste/ })
      .click();
    const drawer = page.getByRole("dialog");
    await expect(drawer).toContainText("Urocultura teste");
    await expect(drawer.getByTestId("culture-nav")).toContainText("3 de 4");
  });
});

test("the lab's HTML is laid out, never run", async ({ page, mockApi }) => {
  mockApi.override(ENDPOINT, {
    json: payload([
      collection([
        culture({
          id: "1",
          previousResult:
            '<div><label>RESULTADO: </label><span>Negativo</span></div><img src="x" onerror="window.__xss = true">',
        }),
      ]),
    ]),
  });

  await page.goto(PAGE_URL);

  const row = rows(page).first();
  await expect(row.locator("label")).toHaveText("RESULTADO:", {
    timeout: 15000,
  });
  await expect(row).toContainText("Negativo");
  await expect(row.locator("img")).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).__xss)).toBeUndefined();
});

test("a long gram is cut at two lines, whole in the drawer", async ({
  page,
  mockApi,
}) => {
  const longGram = `K P C - ${"Texto longo de teste do laboratório sobre o método. ".repeat(8)}`;
  mockApi.override(ENDPOINT, {
    json: payload([
      collection([culture({ id: "1", gram: longGram, previousResult: "-" })]),
    ]),
  });
  // beside the exams card, as with a prescription, the card is narrower
  mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription("199") });

  await page.goto(PAGE_URL);

  const gram = rows(page).first().getByTestId("culture-gram");
  await expect(gram).toHaveAttribute("title", longGram, { timeout: 15000 });
  const lines = await gram.evaluate((element: HTMLElement) => {
    const lineHeight = parseFloat(getComputedStyle(element).lineHeight);
    return Math.round(element.clientHeight / lineHeight);
  });
  expect(lines).toBe(2);

  await rows(page)
    .first()
    .getByRole("button", { name: "Ver detalhes" })
    .click();
  await expect(
    page.getByTestId("culture-history").getByTestId("culture-gram"),
  ).toHaveText(longGram);
});

test("says when there is no recent culture", async ({ page }) => {
  await page.goto(PAGE_URL);

  await expect(
    page.getByText("Nenhuma cultura liberada nos últimos 60 dias."),
  ).toBeVisible({ timeout: 15000 });
});

test("a failure stays in its section and is retried alone", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, { status: 500, json: { status: "error" } });

  await page.goto(PAGE_URL);

  await expect(
    page.getByText("Não foi possível carregar as culturas."),
  ).toBeVisible({ timeout: 15000 });
  // the rest of the page is there
  await expect(page.getByText("64 kg")).toBeVisible();

  mockApi.override(ENDPOINT, { json: payload([BLOOD]) });
  const timelineRequests = mockApi.requests.filter((r) =>
    r.path.includes("antimicrobial-timeline"),
  ).length;

  await page
    .getByTestId("recent-cultures")
    .getByRole("button", { name: "Tentar novamente" })
    .click();

  await expect(rows(page)).toHaveCount(1);
  expect(
    mockApi.requests.filter((r) => r.path.includes("antimicrobial-timeline"))
      .length,
  ).toBe(timelineRequests);
});

test("a backend without collections lists the latest culture of each exam", async ({
  page,
  mockApi,
}) => {
  mockApi.override(ENDPOINT, {
    json: {
      status: "success",
      data: {
        admissionNumber: ADMISSION,
        releasedSince: hoursFromNow(-60 * 24),
        cultures: [
          {
            id: "1",
            examName: "Hemocultura teste",
            material: "Sangue teste",
            collectionDate: BLOOD_COLLECTED,
            releaseDate: hoursFromNow(-6),
            gram: null,
            previousResult: "Positivo",
            microorganisms: ["Microrganismo A teste"],
          },
        ],
      },
    },
  });

  await page.goto(PAGE_URL);

  await expect(rows(page)).toHaveCount(1, { timeout: 15000 });
  await expect(rows(page).first()).toContainText("Microrganismo A teste");
  await expect(rows(page).first()).toContainText("Sem antibiograma liberado");
});

test.describe("details of a collection", () => {
  test.beforeEach(({ mockApi }) => {
    mockApi.override(ENDPOINT, { json: payload([PENDING, BLOOD, URINE]) });
  });

  test("open in a drawer with each report and the antibiogram", async ({
    page,
  }) => {
    await page.goto(PAGE_URL);

    await rows(page)
      .nth(1)
      .getByRole("button", { name: "Ver detalhes" })
      .click({ timeout: 15000 });

    const drawer = page.getByRole("dialog");
    await expect(drawer).toContainText("Hemocultura teste");
    await expect(drawer).toContainText("Sangue teste");

    const reports = drawer.getByTestId("collection-culture");
    await expect(reports).toHaveCount(2);
    // in the order the lab released them
    await expect(reports.nth(0)).toContainText("Resultado 1 de 2");
    await expect(reports.nth(0)).toContainText("Crescimento bacteriano");
    await expect(reports.nth(0)).toContainText("Nenhum isolado");
    await expect(reports.nth(0).getByTestId("culture-antibiogram")).toHaveCount(
      0,
    );

    const antibiogram = reports.nth(1).getByTestId("culture-antibiogram");
    await expect(
      antibiogram.getByRole("columnheader", { name: "Microrganismo A teste" }),
    ).toBeVisible();
    const oxacillin = antibiogram.getByRole("row", { name: /OXACILINA/ });
    await expect(oxacillin).toContainText("Resistente");
    await expect(oxacillin).toContainText("CIM >2");

    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });

  test("a microorganism per column", async ({ page }) => {
    await page.goto(PAGE_URL);

    await rows(page).nth(2).click({ timeout: 15000 });

    const antibiogram = page
      .getByRole("dialog")
      .getByTestId("culture-antibiogram");
    await expect(antibiogram.getByRole("columnheader")).toHaveText([
      "Medicamento",
      "Microrganismo B teste",
      "Microrganismo C teste",
    ]);
    const amikacin = antibiogram.getByRole("row", { name: /AMICACINA/ });
    await expect(amikacin.getByRole("cell")).toHaveText([
      "AMICACINA",
      "SensívelCIM <=2",
      "Resistente",
    ]);
    // not tested against the other microorganism
    await expect(
      antibiogram.getByRole("row", { name: /MEROPENEM/ }).getByRole("cell"),
    ).toHaveText(["MEROPENEM", "ResistenteCIM >8", "—"]);
  });

  test("moves through the collections of the list", async ({ page }) => {
    await page.goto(PAGE_URL);

    await rows(page).first().click({ timeout: 15000 });

    const drawer = page.getByRole("dialog");
    const nav = drawer.getByTestId("culture-nav");
    await expect(nav).toContainText("1 de 3");
    await expect(
      nav.getByRole("button", { name: "Coleta anterior" }),
    ).toBeDisabled();

    await nav.getByRole("button", { name: "Próxima coleta" }).click();
    await expect(nav).toContainText("2 de 3");
    await expect(drawer).toContainText("Hemocultura teste");

    await page.keyboard.press("ArrowRight");
    await expect(nav).toContainText("3 de 3");
    await expect(drawer).toContainText("Urocultura teste");
    await expect(
      nav.getByRole("button", { name: "Próxima coleta" }),
    ).toBeDisabled();

    await page.keyboard.press("ArrowLeft");
    await expect(nav).toContainText("2 de 3");
  });

  test("moves through the filtered collections only", async ({ page }) => {
    await page.goto(PAGE_URL);

    // the collections of two of the three microorganisms
    await page.getByTestId("collection-details").click({ timeout: 15000 });
    await page.getByTestId("collection-details-microorganisms").click();
    const options = page.locator(
      ".ant-select-dropdown:visible .ant-select-item-option",
    );
    await options.filter({ hasText: "Microrganismo A teste" }).click();
    await options.filter({ hasText: "Microrganismo B teste" }).click();
    await expect(rows(page)).toHaveCount(2);
    await page.keyboard.press("Escape");
    await rows(page).first().click();

    const nav = page.getByRole("dialog").getByTestId("culture-nav");
    await expect(nav).toContainText("1 de 2");
  });
});

test.describe("drugs of the prescription", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page, mockApi }) => {
    await loginWithFeatures(page, mockApi, ["CULTURE"]);
    mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription("199") });
    mockApi.override(ENDPOINT, { json: payload([PENDING, BLOOD, URINE]) });
    // the cultures by drug tell the drugs of the prescription, by the lab's
    // name of the drug
    mockApi.override("GET /prescriptions/:id/cultures", {
      json: {
        status: "success",
        data: [
          { drug: "Oxacilina", prescribed: true, items: [] },
          { drug: "AMICACINA", prescribed: true, items: [] },
          { drug: "VANCOMICINA", prescribed: false, items: [] },
        ],
      },
    });
  });

  test("come first, a resistant one flagged", async ({ page }) => {
    await page.goto(PAGE_URL);

    const blood = rows(page).nth(1);
    await expect(blood.getByTestId("organism-in-use")).toHaveText(
      "OXACILINA Rem uso",
      { timeout: 15000 },
    );
    await expect(blood).toHaveClass(/resistant-in-use/);
    // the other resistances, without the drug in use
    await expect(blood.getByTestId("organism-resistant")).toHaveText(
      "R: PENICILINA, CLINDAMICINA",
    );
    await expect(rows(page).nth(0)).not.toHaveClass(/resistant-in-use/);

    // resistant for one microorganism of the urine, susceptible for the other
    const urine = rows(page).nth(2).getByTestId("collection-organism");
    await expect(urine.nth(0).getByTestId("organism-in-use")).toHaveText(
      "AMICACINA Sem uso",
    );
    await expect(urine.nth(1).getByTestId("organism-in-use")).toHaveText(
      "AMICACINA Rem uso",
    );

    // first in the antibiogram too
    await rows(page).nth(1).click();
    const antibiogram = page
      .getByRole("dialog")
      .getByTestId("culture-antibiogram");
    await expect(antibiogram).toContainText(
      "Medicamento em uso com resultado resistente",
    );
    const first = antibiogram.locator("tbody tr.ant-table-row").first();
    await expect(first).toContainText("OXACILINAem uso");
    await expect(first).toHaveClass(/resistant-in-use/);
  });
});

test.describe("by drug", () => {
  test("not offered without the culture feature", async ({ page, mockApi }) => {
    mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription("199") });

    await page.goto(PAGE_URL);

    await expect(page.getByTestId("recent-cultures")).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByText("Por medicamento")).toHaveCount(0);
    await expect(page.getByTestId("cultures-by-drug")).toHaveCount(0);
  });

  test.describe("with the culture feature", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page, mockApi }) => {
      await loginWithFeatures(page, mockApi, ["CULTURE"]);
    });

    test("not offered without a prescription", async ({ page, mockApi }) => {
      mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription(null) });

      await page.goto(PAGE_URL);

      await expect(page.getByTestId("recent-cultures")).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Por medicamento")).toHaveCount(0);
    });

    test("is a tab beside the summary, flags a resistant drug in use and opens the full report", async ({
      page,
      mockApi,
    }) => {
      mockApi.override(TIMELINE_ENDPOINT, { json: withPrescription("199") });
      mockApi.override("GET /prescriptions/:id/cultures", {
        json: {
          status: "success",
          data: [
            {
              drug: "OXACILINA",
              prescribed: true,
              atbLevel: 1,
              items: [
                {
                  key: "SANGUE TOTAL#MICROORGANISMO TESTE#OXACILINA",
                  idExamItem: 900001,
                  microorganism: "Microorganismo Teste",
                  material: "Sangue Total",
                  result: "Resistente",
                  resultType: "R",
                  resultDetail: null,
                  prediction: null,
                  predictionType: null,
                  probability: null,
                  collectionDate: "2024-03-01T12:17:03",
                  releaseDate: "2024-03-08T07:17:02",
                },
              ],
            },
          ],
        },
      });

      const culturesRequest = page.waitForRequest((r) =>
        r.url().includes("/prescriptions/199/cultures"),
      );
      await page.goto(PAGE_URL);
      await culturesRequest;

      // one card: the list by exam first, the cultures by drug a tab away.
      // They are loaded with the page, so the tab flags the resistant drug in
      // use before it is opened
      const byDrug = page.getByTestId("cultures-by-drug");
      await expect(page.getByTestId("recent-cultures")).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByRole("tab", { name: "Lista" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await expect(byDrug).toBeHidden();
      await expect(page.getByTestId("cultures-by-drug-alert")).toBeVisible();

      await page.getByRole("tab", { name: "Por medicamento" }).click();
      await expect(byDrug).toBeVisible();
      await expect(page.getByTestId("recent-cultures")).toBeHidden();
      await expect(
        byDrug.locator(".culture-item.culture-row-resistantInUse"),
      ).toHaveCount(1);
      await expect(
        page.getByText(/^Antibiograma de cada medicamento/),
      ).toBeVisible();

      // the full report, for the patient on the page
      mockApi.override("GET /reports/culture", {
        json: { status: "success", data: [] },
      });
      const reportRequest = page.waitForRequest(
        (r) =>
          r.url().includes("/reports/culture") &&
          new URL(r.url()).searchParams.get("idPatient") === `${PATIENT_ID}`,
      );
      // in the card's header, out of the by drug footer
      await expect(
        byDrug.getByRole("button", { name: "Ver todos" }),
      ).toHaveCount(0);
      await page
        .locator('[data-kb="infectionControl.cultures"]')
        .getByRole("button", { name: "Ver todos" })
        .click();
      await reportRequest;
      const report = page.getByRole("dialog");
      await expect(
        report.getByRole("heading", { name: "Relatório: Culturas" }),
      ).toBeVisible();
      // the patient is named on the printed report only
      await expect(report).toContainText("Maria Teste");
      await expect(report).toContainText("10/05/1980");
      await page.keyboard.press("Escape");
      await expect(report).toBeHidden();
    });
  });
});
