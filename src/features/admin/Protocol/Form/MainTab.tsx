import { useFormikContext } from "formik";

import Card from "components/Card";
import { Input, Select, Textarea } from "components/Inputs";
import Switch from "components/Switch";
import { HelpTextIcon } from "src/components/HelpTextIcon/HelpTextIcon";
import { IProtocolFormBaseFields } from "./types";
import { ProtocolTypeEnum } from "src/models/ProtocolTypeEnum";
import { ProtocolStatusTypeEnum } from "src/models/ProtocolStatusTypeEnum";

export function MainTab() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<IProtocolFormBaseFields>();

  const alertLevelOptions = [
    {
      value: "low",
      label: "Baixo",
    },
    {
      value: "medium",
      label: "Médio",
    },
    {
      value: "high",
      label: "Alto",
    },
  ];

  const onProtocolTypeChange = (value: number) => {
    setFieldValue("protocolType", value);

    if (value === ProtocolTypeEnum.PRESCRIPTION_ITEM) {
      setFieldValue("config.result.description", "-");
    } else {
      setFieldValue("config.result.description", "");
    }
  };

  return (
    <Card>
      <div className={`form-row ${errors.name && touched.name ? "error" : ""}`}>
        <div className="form-label">
          <label>Nome:</label>
        </div>
        <div className="form-input">
          <Input
            onChange={({ target }) => setFieldValue("name", target.value)}
            value={values.name}
            style={{ width: "100%" }}
          />
        </div>
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div
        className={`form-row ${
          errors.protocolType && touched.protocolType ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Tipo:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="label"
            showSearch
            value={values.protocolType}
            onChange={(value: any) => onProtocolTypeChange(parseInt(value))}
            allowClear
            options={ProtocolTypeEnum.getList()}
          />
        </div>
        {errors.protocolType && (
          <div className="form-error">{errors.protocolType}</div>
        )}
      </div>

      {(values.protocolType === ProtocolTypeEnum.PRESCRIPTION_AGG ||
        values.protocolType === ProtocolTypeEnum.PRESCRIPTION_ALL ||
        values.protocolType === ProtocolTypeEnum.PRESCRIPTION_ITEM) && (
        <div className="form-row">
          <div
            className="form-label-actions"
            style={{ justifyContent: "flex-start", gap: "4px" }}
          >
            <label>Avaliar apenas a data de vigência mais recente:</label>
            <HelpTextIcon pageKey="protocolo-vigencia-mais-recente" />
          </div>
          <div className="form-input">
            <Switch
              checked={values.config?.onlyLatestExpireDate ?? false}
              onChange={(checked: boolean) =>
                setFieldValue("config.onlyLatestExpireDate", checked)
              }
            />
            <div style={{ opacity: 0.7, marginTop: "5px", fontSize: 12 }}>
              {values.protocolType === ProtocolTypeEnum.PRESCRIPTION_ITEM
                ? "Quando ativado, na prescrição agregada o alerta do item é " +
                  "gerado uma única vez, contra o grupo de medicamentos com a " +
                  "vigência mais recente, em vez de uma vez por grupo " +
                  "vigência."
                : "Quando ativado, na prescrição agregada o protocolo é " +
                  "avaliado somente contra o grupo de medicamentos com a data " +
                  "de vigência mais recente, em vez de cada grupo de data."}
            </div>
          </div>
        </div>
      )}

      <div
        className={`form-row ${
          errors.statusType && touched.statusType ? "error" : ""
        }`}
      >
        <div className="form-label">
          <label>Situação:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="label"
            showSearch
            value={values.statusType}
            onChange={(value) => setFieldValue("statusType", value)}
            allowClear
            options={ProtocolStatusTypeEnum.getList()}
          />
        </div>
        {errors.statusType && (
          <div className="form-error">{errors.statusType}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.config?.result?.level && touched.config?.result?.level
            ? "error"
            : ""
        }`}
      >
        <div className="form-label">
          <label>Nível do alerta:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="label"
            showSearch
            value={values.config?.result?.level}
            onChange={(value) => setFieldValue("config.result.level", value)}
            allowClear
            options={alertLevelOptions}
          />
        </div>
        {errors.config?.result?.level && (
          <div className="form-error">{errors.config?.result?.level}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.config?.result?.message && touched.config?.result?.message
            ? "error"
            : ""
        }`}
      >
        <div className="form-label">
          <label>Mensagem de alerta:</label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) =>
              setFieldValue("config.result.message", target.value)
            }
            value={values.config?.result?.message}
          />
        </div>
        {errors.config?.result?.message && (
          <div className="form-error">{errors.config?.result?.message}</div>
        )}
      </div>

      <div
        className={`form-row ${
          errors.config?.result?.description &&
          touched.config?.result?.description
            ? "error"
            : ""
        }`}
      >
        <div className="form-label">
          <label>
            Descrição do protocolo
            {values.protocolType === ProtocolTypeEnum.PRESCRIPTION_ITEM
              ? " (Não utilizado para o tipo de protocolo ITEM PRESCRITO)"
              : " (Tooltip)"}
            :
          </label>
        </div>
        <div className="form-input">
          <Textarea
            onChange={({ target }) =>
              setFieldValue("config.result.description", target.value)
            }
            readOnly={
              values.protocolType === ProtocolTypeEnum.PRESCRIPTION_ITEM
            }
            value={values.config?.result?.description}
          />
        </div>
        {errors.config?.result?.description && (
          <div className="form-error">{errors.config?.result?.description}</div>
        )}
      </div>
    </Card>
  );
}
