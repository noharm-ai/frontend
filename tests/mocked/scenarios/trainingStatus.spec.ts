import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * The mandatory-training indicator in the application header and the avatar
 * badge, both derived from the `training` counts in the authentication payload.
 * The backend resolves which modules are mandatory for this user (schema scope +
 * audience), so the frontend only compares two numbers — `mandatoryTotal === 0`
 * is the single "nothing to do" case and needs no request of its own.
 */

const PILL = "#gtm-btn-pending-training";
const BADGE = ".training-badge";

const training = (mandatoryTotal: number, mandatoryFinished: number) => ({
  features: ["USER_ONBOARDING"],
  training: { mandatoryTotal, mandatoryFinished },
});

const noTrainingListRequests = (mockApi: { requests: { path: string }[] }) =>
  mockApi.requests.filter((r) => r.path === "/training/list");

test.use({ storageState: { cookies: [], origins: [] } });

test("no mandatory module means no indicator and no badge", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, training(0, 0));

  await expect(page.locator(PILL)).toHaveCount(0);
  await expect(page.locator(BADGE)).toHaveCount(0);

  // the header derives everything from the payload
  expect(noTrainingListRequests(mockApi)).toHaveLength(0);
});

test("pending training shows the header indicator with the remaining count", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, training(3, 1));

  await expect(
    page.getByRole("menuitem", { name: "Treinamento" }),
  ).toBeVisible();

  const pill = page.locator(PILL);
  await expect(pill).toBeVisible();
  await expect(pill.locator(".pill-count")).toHaveText("2");
  await expect(page.locator(BADGE)).toHaveCount(0);

  expect(noTrainingListRequests(mockApi)).toHaveLength(0);

  mockApi.override("GET /training/list", {
    json: {
      status: "success",
      data: [
        {
          id: 1,
          page: "p",
          title: "Módulo obrigatório",
          description: "",
          position: 1,
          mandatory: true,
          totalLessons: 2,
          totalLessonsFinished: 0,
          finished: false,
        },
      ],
    },
  });

  await pill.click();
  await expect(page).toHaveURL(/\/treinamento$/);
  await expect(
    page.getByRole("heading", { name: "Central de Treinamento" }),
  ).toBeVisible();
});

test("completed training shows the avatar badge and no indicator", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, training(2, 2));

  await expect(page.locator(BADGE)).toBeVisible();
  await expect(page.locator(PILL)).toHaveCount(0);

  expect(noTrainingListRequests(mockApi)).toHaveLength(0);
});

// a payload with no `training` key at all (an older backend, or a session
// restored from redux-persist before this change) must not render anything
test("a missing training payload renders neither indicator nor badge", async ({
  page,
  mockApi,
}) => {
  // JSON.stringify drops undefined keys, so this really omits `training`
  await loginWithAuth(page, mockApi, {
    features: ["USER_ONBOARDING"],
    training: undefined,
  });

  await expect(page.locator(PILL)).toHaveCount(0);
  await expect(page.locator(BADGE)).toHaveCount(0);
});

test("the training menu entry follows the USER_ONBOARDING feature", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, { features: [] });

  await expect(page.getByRole("menuitem", { name: "Treinamento" })).toHaveCount(
    0,
  );
});
