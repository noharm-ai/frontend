import { useTranslation } from "react-i18next";
import { Result, Space } from "antd";

import { MaintainerBadge } from "components/MaintainerBadge/MaintainerBadge";
import { PageHeader } from "styles/PageHeader.style";
import { PageCard } from "styles/Utils.style";

import { PrescriptionTestCase } from "../PrescriptionTestCase/PrescriptionTestCase";
import { useCanCreateTestCases } from "../PrescriptionTestCase/access";

/**
 * The test case prescription page (menu Curadoria): maintainers of the test
 * schema create prescriptions as if the hospital had sent them.
 */
export function PrescriptionTestCasePage() {
  const { t } = useTranslation();
  const canCreate = useCanCreateTestCases();

  const title = (
    <h1 className="page-header-title" data-kb="prescriptionTestCase.title">
      <Space size={8}>
        {t("titles.prescriptionTestCase")}
        <MaintainerBadge />
      </Space>
    </h1>
  );

  if (canCreate) {
    // the form's header holds its button
    return <PrescriptionTestCase title={title} />;
  }

  return (
    <>
      <PageHeader>
        <div>{title}</div>
      </PageHeader>
      <PageCard>
        <Result status="403" subTitle={t("prescriptionTestCase.unavailable")} />
      </PageCard>
    </>
  );
}
