import type { ReactNode } from "react";
import { Divider, Tabs } from "antd";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "src/utils/date";
import { MainTab } from "./MainTab";
import { VariableTab } from "./VariableTab";
import { TriggerTab } from "./TriggerTab";
import { TargetTestPanel } from "../Test/TargetTestPanel";
import { BatchTestPanel } from "../Test/BatchTestPanel";
import {
  EditorLayout,
  SidePanel,
  SidePanelStack,
  FormSection,
} from "../Protocol.style";

export function BaseForm({
  formData,
  header,
}: {
  formData: any;
  header?: ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <>
      <EditorLayout>
        <div>
          {header}

          <FormSection>
            <h3 className="form-section-title">Geral</h3>
            <MainTab />
          </FormSection>

          <FormSection>
            <h3 className="form-section-title">Variáveis</h3>
            <VariableTab />
          </FormSection>

          {formData.createdAt && (
            <>
              <Divider style={{ marginBottom: "10px" }} />
              <span style={{ opacity: 0.7 }}>
                Criado em: {formatDateTime(formData.createdAt)}
              </span>
            </>
          )}
        </div>
        <SidePanelStack>
          <SidePanel>
            <h3 className="side-panel-title">Gatilho</h3>
            <TriggerTab />
          </SidePanel>

          <SidePanel>
            <h3 className="side-panel-title">{t("titles.protocolTest")}</h3>
            <Tabs
              className="side-panel-tabs"
              defaultActiveKey="target"
              items={[
                {
                  key: "target",
                  label: t("labels.protocolTargetTest"),
                  children: <TargetTestPanel />,
                },
                {
                  key: "sample",
                  label: t("labels.protocolSampleTest"),
                  children: <BatchTestPanel />,
                },
              ]}
            />
          </SidePanel>
        </SidePanelStack>
      </EditorLayout>
    </>
  );
}
