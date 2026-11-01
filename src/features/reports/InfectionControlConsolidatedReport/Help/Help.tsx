import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import Modal from "components/Modal";
import Alert from "components/Alert";

import { setHelpModal } from "../InfectionControlConsolidatedReportSlice";

/** What the report shows, how its files are consolidated and when they were last built. */
export function HelpModal() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector(
    (state) => state.reportsArea.infectionControlConsolidated.helpModal,
  );
  const updatedAt = useAppSelector(
    (state) =>
      state.reportsArea.infectionControlConsolidated.filtered.result.updatedAt,
  );

  return (
    <Modal
      open={open}
      width={500}
      onCancel={() => dispatch(setHelpModal(false))}
      footer={null}
    >
      <div data-kb="reports.infectionControl.help">
        <div className="modal-title">
          {t("infectionControlConsolidated.info")}
        </div>

        <p>{t("infectionControlConsolidated.help.p1")}</p>
        <p>{t("infectionControlConsolidated.help.p2")}</p>
        <p>{t("infectionControlConsolidated.help.p3")}</p>

        <Alert
          title={
            <strong>{t("infectionControlConsolidated.alert.title")}</strong>
          }
          description={
            <>
              {t("infectionControlConsolidated.alert.description")}
              <br />
              {t("infectionControlConsolidated.updatedAt")}:{" "}
              {updatedAt ? dayjs(updatedAt).format("DD/MM/YY HH:mm") : "-"}
            </>
          }
          type="info"
          showIcon
        />
      </div>
    </Modal>
  );
}
