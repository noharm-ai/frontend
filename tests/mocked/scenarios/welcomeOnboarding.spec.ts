import { test, expect } from "../support/mockApi";
import { loginWithAuth } from "../support/featureLogin";

/**
 * The welcome modal shown to a user whose onboarding is still pending. It only
 * opens once the schema is in production: during integration the team is still
 * setting the client up, so the status stays pending and the modal waits for
 * the first login after go-live.
 */

const MODAL_TITLE = "Boas-vindas, E2E!";

const pendingOnboarding = (integrationStatus: number) => ({
  features: ["USER_ONBOARDING"],
  onboardingStatus: "pending",
  integrationStatus,
});

const completeOnboardingRequests = (mockApi: {
  requests: { path: string }[];
}) => mockApi.requests.filter((r) => r.path === "/user/complete-onboarding");

test.use({ storageState: { cookies: [], origins: [] } });

test("pending onboarding opens the welcome modal in production", async ({
  page,
  mockApi,
}) => {
  await loginWithAuth(page, mockApi, pendingOnboarding(1));

  await expect(page.getByText(MODAL_TITLE)).toBeVisible();
});

for (const [label, integrationStatus] of [
  ["integration", 0],
  ["canceled", 2],
] as const) {
  test(`pending onboarding keeps the welcome modal closed during ${label}`, async ({
    page,
    mockApi,
  }) => {
    await loginWithAuth(page, mockApi, pendingOnboarding(integrationStatus));

    await expect(page.getByText(MODAL_TITLE)).toHaveCount(0);
    // the status must stay pending so the modal shows after go-live
    expect(completeOnboardingRequests(mockApi)).toHaveLength(0);
  });
}
