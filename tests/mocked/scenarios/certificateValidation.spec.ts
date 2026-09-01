import { test, expect } from "../support/mockApi";

/**
 * Public certificate validation. Someone holding a printed certificate types
 * its code (or opens the printed URL) and gets a confirmation in a modal —
 * without a NoHarm account.
 *
 * Note what is deliberately missing from every test below: there is no
 * `loginWithAuth(...)` call. That absence is the assertion. Unlike the
 * certificate print flow, whose print dialog is outside what Playwright can
 * see, this page renders on screen and is fully assertable.
 */

const CODE = "ABCD-EFGH-JKMN";

const validCertificate = {
  status: "success",
  data: {
    valid: true,
    maskedName: "F***** B*******",
    trainingTitle: "Módulo básico",
    totalHours: 8,
    totalLessons: 2,
    lessons: ["Introdução à prescrição", "Boas práticas de checagem"],
    completedAt: "2026-08-31T10:00:00",
  },
};

const notFound = {
  status: "success",
  data: { valid: false },
};

// anonymous: no stored session at all
test.use({ storageState: { cookies: [], origins: [] } });

test("an anonymous visitor can validate a certificate from the printed URL", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto(`/validar-certificado/${CODE}`);

  // the auth gate must not bounce an anonymous visitor to login
  await expect(page).toHaveURL(new RegExp(`/validar-certificado/${CODE}$`));

  const modal = page.getByRole("dialog");

  await expect(modal.getByText("Certificado válido")).toBeVisible();
  await expect(modal.getByText("Módulo básico")).toBeVisible();
  await expect(modal.getByText("8 horas")).toBeVisible();
});

test("closing the result clears the code so the same one can be checked again", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto(`/validar-certificado/${CODE}`);
  await expect(page.getByRole("dialog")).toBeVisible();

  // scoped to the footer: antd's close X carries the same accessible name
  await page
    .locator(".ant-modal-footer")
    .getByRole("button", { name: "Fechar" })
    .click();

  await expect(page.getByRole("dialog")).toBeHidden();
  // the code leaves the URL, otherwise re-submitting it would not be a
  // navigation and the modal would never reopen
  await expect(page).toHaveURL(/\/validar-certificado$/);

  await page.getByLabel("Código de validação").fill(CODE);
  await page.getByRole("button", { name: "Validar" }).click();

  await expect(page.getByRole("dialog")).toBeVisible();
});

test("the page shows the masked name and never the full one", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto(`/validar-certificado/${CODE}`);

  await expect(
    page.getByRole("dialog").getByText("F***** B*******"),
  ).toBeVisible();
  await expect(page.getByText("Fulano Beltrano")).toHaveCount(0);
});

test("the lessons taken are listed in module order", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto(`/validar-certificado/${CODE}`);

  const lessons = page.getByRole("dialog").locator(".lessons li");

  await expect(lessons).toHaveText([
    "Introdução à prescrição",
    "Boas práticas de checagem",
  ]);
});

test("a certificate with no lessons listed renders no empty list", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", {
    json: {
      status: "success",
      data: { ...validCertificate.data, lessons: [] },
    },
  });

  await page.goto(`/validar-certificado/${CODE}`);

  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.locator(".lessons")).toHaveCount(0);
});

test("an unknown code reports not found rather than an error", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: notFound });

  await page.goto("/validar-certificado/ZZZZ-ZZZZ-ZZZZ");

  await expect(
    page.getByRole("dialog").getByText("Certificado não encontrado"),
  ).toBeVisible();
  await expect(page.getByText("Certificado válido")).toHaveCount(0);
});

test("a typed code is normalized before it reaches the backend", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto("/validar-certificado");

  // lowercase, spaced, and with the characters a human misreads off paper:
  // O for zero and I/l for one
  await page.getByLabel("Código de validação").fill("abcd efgh jkmn");
  await page.getByRole("button", { name: "Validar" }).click();

  await expect
    .poll(() =>
      mockApi.requests.filter(
        (r) => r.path === "/public/certificate/ABCDEFGHJKMN",
      ),
    )
    .toHaveLength(1);
});

test("misread characters fold onto the digits they resemble", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto("/validar-certificado");

  // O -> 0 and I/L -> 1, so a certificate read aloud still resolves
  await page.getByLabel("Código de validação").fill("OIL2-3456-789A");
  await page.getByRole("button", { name: "Validar" }).click();

  await expect
    .poll(() =>
      mockApi.requests.filter(
        (r) => r.path === "/public/certificate/01123456789A",
      ),
    )
    .toHaveLength(1);
});

test("a code of the wrong length is rejected without a request", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", { json: validCertificate });

  await page.goto("/validar-certificado");

  await page.getByLabel("Código de validação").fill("ABC");
  await page.getByRole("button", { name: "Validar" }).click();

  await expect(
    page.getByText("O código deve ter 12 caracteres."),
  ).toBeVisible();
  expect(
    mockApi.requests.filter((r) => r.path.startsWith("/public/certificate")),
  ).toHaveLength(0);
});

test("a server fault reports an error, distinct from not found", async ({
  page,
  mockApi,
}) => {
  mockApi.override("GET /public/certificate/:code", {
    status: 500,
    json: { status: "error", message: "boom" },
  });

  await page.goto(`/validar-certificado/${CODE}`);

  await expect(
    page.getByRole("dialog").getByText("Não foi possível validar"),
  ).toBeVisible();
  await expect(page.getByText("Certificado não encontrado")).toHaveCount(0);
});
