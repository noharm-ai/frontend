import { Divider } from "antd";

import { formatDateTime } from "src/utils/date";
import { MainTab } from "./MainTab";
import { VariableTab } from "./VariableTab";
import { TriggerTab } from "./TriggerTab";
import { EditorLayout, SidePanel, FormSection } from "../Protocol.style";

export function BaseForm({ formData }: { formData: any }) {
  return (
    <>
      <EditorLayout>
        <div>
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
        <SidePanel>
          <h3 className="side-panel-title">Gatilho</h3>
          <TriggerTab />
        </SidePanel>
      </EditorLayout>
    </>
  );
}
