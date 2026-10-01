import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "src/store";

import {
  DEEP_LINK_PARAMS,
  PrescriptionModal,
  hasDeepLinkParams,
  parsePrescriptionDeepLink,
} from "utils/prescriptionLinks";
import {
  setExamsModalAdmissionNumber,
  setExamsModalHighlight,
} from "features/exams/ExamModal/ExamModalSlice";
import {
  setAlertsModalOpen,
  setInitialFilters,
  setReportData,
} from "features/reports/AlertListReport/AlertListReportSlice";
import { setModalVisibilityThunk } from "store/ducks/prescriptions/thunk";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

/** The fields of the loaded prescription (legacy duck, untyped) used here. */
interface LoadedPrescription {
  idPrescription?: string;
  admissionNumber?: number;
  alertsList?: unknown[];
}

/**
 * Opens a modal of the prescription screen from the URL, once the prescription
 * has loaded: `?modal=exames[&fkexame=]`, `?modal=evolucoes[&fkevolucao=]` or
 * `?modal=alertas` (see utils/prescriptionLinks). The params are consumed once
 * and removed from the URL, so a refresh or moving to another prescription does
 * not reopen the modal.
 */
export const usePrescriptionDeepLink = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const isFetching = useAppSelector(
    (state) => state.prescriptions?.single.isFetching,
  );
  const prescription = useAppSelector(
    (state) => state.prescriptions?.single.data,
  ) as LoadedPrescription | undefined;

  // Only act on a load that started after this page mounted: on in-app
  // navigation the store still holds the previous prescription, not yet
  // marked as fetching, on the first render.
  const armedRef = useRef(false);
  const consumedRef = useRef(false);

  useEffect(() => {
    if (isFetching) {
      armedRef.current = true;
      return;
    }
    if (consumedRef.current || !armedRef.current) return;
    if (!prescription?.idPrescription) return;
    if (!hasDeepLinkParams(searchParams)) return;

    consumedRef.current = true;

    const deepLink = parsePrescriptionDeepLink(searchParams);

    const next = new URLSearchParams(searchParams);
    DEEP_LINK_PARAMS.forEach((param) => next.delete(param));
    setSearchParams(next, { replace: true });

    if (!deepLink) return;

    switch (deepLink.modal) {
      case PrescriptionModal.EXAMS:
        dispatch(setExamsModalAdmissionNumber(prescription.admissionNumber));
        if (deepLink.fkexame) {
          dispatch(setExamsModalHighlight(deepLink.fkexame));
        }
        break;

      case PrescriptionModal.CLINICAL_NOTES:
        // the notes list modal, with the linked note selected when given
        dispatch(
          setModalVisibilityThunk(
            "clinicalNotes",
            deepLink.fkevolucao ? { selectedId: deepLink.fkevolucao } : true,
          ),
        );
        break;

      case PrescriptionModal.ALERTS:
        dispatch(setInitialFilters({}));
        dispatch(setReportData(prescription.alertsList ?? []));
        dispatch(setAlertsModalOpen(true));
        trackPrescriptionAction(TrackedPrescriptionAction.SHOW_ALERTS_MODAL, {
          filters: {},
          source: "deeplink",
        });
        break;
    }
  }, [isFetching, prescription, searchParams, setSearchParams, dispatch]);
};
