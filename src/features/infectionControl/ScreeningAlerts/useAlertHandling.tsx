import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch } from "src/store";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import RichTextView from "components/RichTextView";
import { getErrorMessage } from "utils/errorHandler";
import { getSubstanceHandling } from "features/serverActions/ServerActionsSlice";
import {
  trackPrescriptionAction,
  TrackedPrescriptionAction,
} from "src/utils/tracker";

/**
 * The handling of the substance for a type of alert, shown in a modal (a
 * static one, which antd stacks above any drawer). The type whose handling is
 * loading keeps the other buttons waiting
 */
export function useAlertHandling(idSubstance?: string | null) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const showHandling = (alertType: string) => {
    trackPrescriptionAction(TrackedPrescriptionAction.CLICK_ALERT_HANDLING);

    setLoadingType(alertType);
    // the thunk is untyped (ServerActionsSlice.js)
    const fetchHandling = getSubstanceHandling as any;
    dispatch(fetchHandling({ sctid: idSubstance, alertType })).then(
      (response: any) => {
        setLoadingType(null);

        if (response.error) {
          notification.error({ message: getErrorMessage(response, t) });
        } else if (response.payload.data) {
          DefaultModal.info({
            title: t("infectionControl.alerts.handlingTitle"),
            content: (
              <RichTextView text={response.payload.data} maxWidth="100%" />
            ),
            icon: null,
            width: 550,
            okText: t("infectionControl.alerts.close"),
            okButtonProps: { type: "default" },
            wrapClassName: "default-modal",
            mask: { blur: false },
          });
        }
      },
    );
  };

  return { loadingType, showHandling };
}
