import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * Certificate generation for finished training modules. The Training Central
 * shows a "Certificado" button only on completed rows; clicking it fetches the
 * certificate data (the backend refuses unfinished modules) and opens the
 * browser print flow — the print dialog itself is outside what the mocked
 * suite can assert, so these tests pin the gating and the request.
 */

const trainingList = (finished: boolean) => ({
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
    },
  ],
});

const certificate = {
  status: "success",
  data: {
    userName: "E2E Test",
    trainingId: 1,
    trainingTitle: "Módulo básico",
    totalLessons: 2,
    completedAt: "2026-08-31T10:00:00",
  },
};

test.use({ storageState: { cookies: [], origins: [] } });

test("a completed module offers the certificate and fetches its data", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  mockApi.override("GET /training/list", { json: trainingList(true) });
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

test("an unfinished module offers no certificate button", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  mockApi.override("GET /training/list", { json: trainingList(false) });

  await page.getByRole("menuitem", { name: "Treinamento" }).click();
  await expect(
    page.getByRole("heading", { name: "Central de Treinamento" }),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "Continuar" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Certificado" })).toHaveCount(
    0,
  );
});

test("a backend refusal surfaces the translated error", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: ["USER_ONBOARDING"] });

  mockApi.override("GET /training/list", { json: trainingList(true) });
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
