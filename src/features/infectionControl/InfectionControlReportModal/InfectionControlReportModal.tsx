import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";
import { Dayjs } from "dayjs";

import DefaultModal from "components/Modal";

import {
  IAntimicrobialTimeline,
  ICourse,
  IFollowUp,
  IRecentCulture,
} from "../InfectionControlSlice";
import { InfectionControlReport } from "../InfectionControlReport/InfectionControlReport";
import { ReportBody } from "../InfectionControlReport/InfectionControlReport.style";

interface InfectionControlReportModalProps {
  open: boolean;
  onClose: () => void;
  data: IAntimicrobialTimeline;
  // null when the follow-up failed to load, or the schema does not have it
  followUp: IFollowUp | null;
  // as the timeline sorts them
  courses: ICourse[];
  drugNames: Record<number, string>;
  // null while they load, or when they failed to
  cultures: IRecentCulture[] | null;
  now: Dayjs;
}

/**
 * The infection control report of the admission the page shows, over it: the
 * modal scrolls the document and prints it whole
 */
export function InfectionControlReportModal({
  open,
  onClose,
  data,
  followUp,
  courses,
  drugNames,
  cultures,
  now,
}: InfectionControlReportModalProps) {
  const { t } = useTranslation();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: t("infectionControl.report.documentTitle", {
      admissionNumber: data.patient.admissionNumber,
    }),
    pageStyle: "@page { size: A4; margin: 12mm; }",
  });

  return (
    <DefaultModal
      open={open}
      width={980}
      centered
      destroyOnHidden
      onCancel={onClose}
      footer={
        <>
          <Button onClick={onClose}>
            {t("infectionControl.report.close")}
          </Button>
          <Button
            type="primary"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint()}
          >
            {t("infectionControl.report.print")}
          </Button>
        </>
      }
    >
      <ReportBody data-kb="infectionControl.report">
        <InfectionControlReport
          ref={printRef}
          data={data}
          followUp={followUp}
          courses={courses}
          drugNames={drugNames}
          cultures={cultures}
          now={now}
        />
      </ReportBody>
    </DefaultModal>
  );
}
