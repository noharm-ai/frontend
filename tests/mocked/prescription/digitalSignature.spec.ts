import { test, expect } from "../support/mockApi";
import { loginWithPermissions } from "../support/featureLogin";

/**
 * Digital signature of a clinical note
 * (src/features/clinicalNotes/DigitalSignature/DigitalSignature.tsx).
 *
 * A note that already carries an idSignRequest opens the modal in the
 * "already requested" state; "Abrir documento existente" must reuse the stored
 * request and show the link WITHOUT closing the modal.
 *
 * Regression: clinicalNotesUpdate used to rebuild state.list into empty groups,
 * which made the list effect call select(undefined); View then bailed on
 * isEmpty(selected) and unmounted the modal along with the whole notes view, so
 * the link only showed up on a later re-open.
 */

const ADMISSION = 9999;

const NOTE = {
  id: "555",
  admissionNumber: ADMISSION,
  text: "Evolução de teste para assinatura digital",
  date: "2024-01-02T03:04:05",
  prescriber: "Fulano Beltrano",
  position: "Farmacêutica",
  form: null,
  template: null,
  idSignRequest: 1001,
};

const notesPayload = {
  status: "success",
  data: {
    notes: [NOTE],
    dates: [{ date: "2024-01-02", total: 1, roles: ["Farmacêutica"] }],
    previousAdmissions: [],
  },
};

const SIGN_LINK = "https://odoo.example.com/sign/document/1001/tok123";

test.use({ storageState: { cookies: [], origins: [] } });

test("an already signed note reuses the request and keeps the modal open", async ({
  page,
  mockApi,
}) => {
  await loginWithPermissions(page, mockApi, ["READ_NAV", "READ_PRESCRIPTION"]);

  mockApi.override("GET /notes/:admissionNumber/v2", { json: notesPayload });
  mockApi.override("POST /notes/digital-signature", {
    json: {
      status: "success",
      data: {
        idSignRequest: 1001,
        link: SIGN_LINK,
        signerName: "E2E Test",
        signerEmail: "e2e@noharm.ai",
        reused: true,
      },
    },
  });

  await page.goto(`/prescricao/evolucao/${ADMISSION}`);
  await expect(page.getByText("Evolução de teste").first()).toBeVisible();

  const noteFetches = () =>
    mockApi.requests.filter(
      (r) => r.method === "GET" && r.path === `/notes/${ADMISSION}/v2`,
    ).length;
  const fetchesBeforeClick = noteFetches();

  // icon-only button: the antd icon carries the accessible label
  await page.locator('button:has([aria-label="signature"])').click();

  // third state: the note already has a signature request
  await expect(
    page.getByText("Esta evolução já foi enviada para assinatura digital."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Abrir documento existente" }).click();

  // the modal must stay open and switch to the result view
  await expect(page.getByText(SIGN_LINK)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Abrir link/ }),
  ).toBeVisible();

  // and the note itself must still be on screen (the view must not unmount)
  await expect(page.getByText("Evolução de teste").first()).toBeVisible();

  const signCalls = mockApi.requests.filter(
    (r) => r.method === "POST" && r.path === "/notes/digital-signature",
  );
  expect(signCalls).toHaveLength(1);

  // The regression only shows up as a re-fetch: patching the note used to wipe
  // state.list, and the [list] effect then re-selected (select(undefined)) and
  // re-loaded the notes, so View bailed on isEmpty(selected) and unmounted the
  // modal until the request came back. Mocked responses are instant, so the
  // flicker is shorter than a retrying assertion can catch -- the absence of an
  // extra GET is the deterministic signal. Reusing must not re-load anything.
  await page.waitForTimeout(500);
  expect(noteFetches()).toBe(fetchesBeforeClick);
});
