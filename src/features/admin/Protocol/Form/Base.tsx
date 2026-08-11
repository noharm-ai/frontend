import { useState } from "react";
import type { ReactNode } from "react";
import { Divider, Steps, Tabs } from "antd";
import {
  CheckOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import { formatDateTime } from "src/utils/date";
import { IProtocolFormBaseFields } from "./types";
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
  StepsCard,
} from "../Protocol.style";

export function BaseForm({
  formData,
  header,
  notice,
}: {
  formData: any;
  header?: ReactNode;
  notice?: ReactNode;
}) {
  const { t } = useTranslation();
  const { errors } = useFormikContext<IProtocolFormBaseFields>();
  const [step, setStep] = useState(0);

  const configErrors = (errors.config ?? {}) as any;
  const stepHasError = [
    Boolean(
      errors.name ||
        errors.protocolType ||
        errors.statusType ||
        configErrors.result
    ),
    Boolean(configErrors.variables),
    Boolean(configErrors.trigger),
  ];

  const sectionStyle = (index: number) =>
    step === index ? undefined : { display: "none" };

  const variableCount = formData.config?.variables?.length ?? 0;

  const stepItems = [
    {
      title: "Geral",
      description: "Identificação e alerta",
      icon: <FileTextOutlined />,
    },
    {
      title: "Variáveis",
      description:
        variableCount > 0
          ? `${variableCount} ${
              variableCount === 1 ? "variável" : "variáveis"
            }`
          : "Nenhuma variável",
      icon: <DatabaseOutlined />,
    },
    {
      title: "Gatilho",
      description: formData.config?.trigger
        ? "Expressão definida"
        : "Não definido",
      icon: <ThunderboltOutlined />,
    },
  ].map((item, index) => {
    const status = stepHasError[index]
      ? ("error" as const)
      : index === step
      ? ("process" as const)
      : index < step
      ? ("finish" as const)
      : ("wait" as const);

    return {
      ...item,
      status,
      icon: status === "finish" ? <CheckOutlined /> : item.icon,
    };
  });

  return (
    <>
      <EditorLayout>
        <div>
          {header}

          {notice}

          <StepsCard>
            <Steps current={step} onChange={setStep} items={stepItems} />
          </StepsCard>

          <FormSection style={sectionStyle(0)}>
            <MainTab />
          </FormSection>

          <FormSection style={sectionStyle(1)}>
            <VariableTab />
          </FormSection>

          <FormSection style={sectionStyle(2)}>
            <TriggerTab />
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
            <h3 className="side-panel-title">{t("titles.protocolTest")}</h3>
            <div className="side-panel-body">
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
            </div>
          </SidePanel>
        </SidePanelStack>
      </EditorLayout>
    </>
  );
}
