import { useState } from "react";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import CultureReport from "features/reports/CultureReport/CultureReport";
import { trackReport, TrackedReport } from "src/utils/tracker";

interface ICultureReportButtonProps {
  // the prescription being screened (store/ducks/prescriptions), untyped
  prescription?: any;
}

/**
 * "Ver todos": the full culture report of the patient, in a modal
 */
export function CultureReportButton({
  prescription,
}: ICultureReportButtonProps) {
  const [reportOpen, setReportOpen] = useState(false);

  const openReport = () => {
    setReportOpen(true);
    trackReport(TrackedReport.CULTURES);
  };

  return (
    <>
      <Button type="link" onClick={openReport}>
        Ver todos
      </Button>

      <DefaultModal
        title={null}
        destroyOnHidden
        open={reportOpen}
        onCancel={() => setReportOpen(false)}
        width="min(1440px, 100%)"
        footer={null}
        style={{ top: "10px", height: "100vh" }}
      >
        <CultureReport
          idPatient={prescription?.idPatient}
          prescription={prescription}
        />
      </DefaultModal>
    </>
  );
}
