import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Certificate generation for finished training modules. The Training Central
 * shows a "Certificado" button on rows whose `certificateAvailable` flag is
 * set — the backend derives it from the completion record, so it stays true
 * when new lessons reopen the module. Clicking it fetches the certificate
 * data and opens the browser print flow — the print dialog itself is outside
 * what the mocked suite can assert, so these tests pin the gating and the
 * request.
 */

const trainingList = ({
  finished,
  certificateAvailable,
}: {
  finished: boolean;
  certificateAvailable: boolean;
}) => ({
  status: "success",
  data: [
    {
      id: 1,
      page: "p",
      title: "Módulo básico",
      description: "",
      position: 1,
      mandatory: false,
      totalLessons: 2,
      totalLessonsFinished: finished ? 2 : 1,
      finished,
      certificateAvailable,
    },
  ],
});

const certificate = {
  status: "success",
  data: {
    userName: "E2E Test",
    trainingId: 1,
    trainingTitle: "Módulo básico",
    totalHours: 8,
    totalLessons: 2,
    completedAt: "2026-08-31T10:00:00",
    validationCode: "ABCD-EFGH-JKMN",
  },
};

test.use({ storageState: { cookies: [], origins: [] } });

test("a completed module offers the certificate and fetches its data", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  mockApi.override("GET /training/list", {
    json: trainingList({ finished: true, certificateAvailable: true }),
  });
  mockApi.override("GET /training/:id/certificate", { json: certificate });

  await page.getByRole("menuitem", { name: "Treinamento" }).click();
  await expect(
    page.getByRole("heading", { name: "Central de Treinamento" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Certificado" }).click();

  await expect
    .poll(() =>
      mockApi.requests.filter((r) => r.path === "/training/1/certificate"),
    )
    .toHaveLength(1);
});

test("a never-completed module offers no certificate button", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  mockApi.override("GET /training/list", {
    json: trainingList({ finished: false, certificateAvailable: false }),
  });

  await page.getByRole("menuitem", { name: "Treinamento" }).click();
  await expect(
    page.getByRole("heading", { name: "Central de Treinamento" }),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Certificado" })).toHaveCount(
    0,
  );
});

test("a module reopened by new lessons keeps its certificate button", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  // finished counts say "in progress", but the completion record stands
  mockApi.override("GET /training/list", {
    json: trainingList({ finished: false, certificateAvailable: true }),
  });
  mockApi.override("GET /training/:id/certificate", { json: certificate });

  await page.getByRole("menuitem", { name: "Treinamento" }).click();
  await expect(
    page.getByRole("heading", { name: "Central de Treinamento" }),
  ).toBeVisible();

  // the row is back to "continue" mode, yet the certificate stays offered
  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  await page.getByRole("button", { name: "Certificado" }).click();

  await expect
    .poll(() =>
      mockApi.requests.filter((r) => r.path === "/training/1/certificate"),
    )
    .toHaveLength(1);
});

test("a backend refusal surfaces the translated error", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  mockApi.override("GET /training/list", {
    json: trainingList({ finished: true, certificateAvailable: true }),
  });
  mockApi.override("GET /training/:id/certificate", {
    status: 400,
    json: {
      status: "error",
      message: "Módulo de treinamento ainda não concluído",
      code: "errors.trainingNotFinished",
    },
  });

  await page.getByRole("menuitem", { name: "Treinamento" }).click();
  await page.getByRole("button", { name: "Certificado" }).click();

  await expect(
    page.getByText(
      "Conclua todas as lições do módulo para emitir o certificado.",
    ),
  ).toBeVisible();
});
