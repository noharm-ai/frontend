import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { CopyOutlined } from "@ant-design/icons";

import { useAppDispatch, useAppSelector } from "src/store";
import { InputNumber, Input, Select, Radio } from "components/Inputs";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import Switch from "components/Switch";
import Tooltip from "components/Tooltip";
import { FeatureService } from "services/FeatureService";
import Feature from "models/Feature";
import { fetchExamTypes, fetchGlobalExams } from "./ExamFormSlice";

export function ExamFormBase() {
  const dispatch = useAppDispatch();
  //@ts-expect-error - segments is not typed
  const segments = useAppSelector((state) => state.segments.list);
  const examTypes = useAppSelector(
    (state) => state.admin.examForm.examTypes.list,
  );
  const examTypesStatus = useAppSelector(
    (state) => state.admin.examForm.examTypes.status,
  );
  const globalExams = useAppSelector(
    (state) => state.admin.examForm.globalExams.list,
  );
  const globalExamsStatus = useAppSelector(
    (state) => state.admin.examForm.globalExams.status,
  );
  const { values, setFieldValue, errors } = useFormikContext<any>();
  const [typeMode, setTypeMode] = useState<"select" | "input">("select");

  const { type, name, initials, min, max, ref, active } = values;

  const canAddExams =
    values.new && FeatureService.has(Feature.ADD_EXAMS);

  useEffect(() => {
    if (values.new) {
      dispatch(fetchExamTypes());
    }

    dispatch(fetchGlobalExams());
  }, []); //eslint-disable-line

  const handleTypeModeChange = (mode: "select" | "input") => {
    setTypeMode(mode);
    setFieldValue("type", undefined);
  };

  const applyRef = ({ key }: { key: string }) => {
    const examConfig = globalExams.find(
      (item: any) => item.tpexam === values.tpExamRef,
    );

    if (!examConfig) return;

    setFieldValue("name", examConfig.name);
    setFieldValue("initials", examConfig.initials);

    if (key === "adult") {
      setFieldValue("ref", examConfig.ref_adult);
      setFieldValue("min", examConfig.min_adult);
      setFieldValue("max", examConfig.max_adult);
    } else {
      setFieldValue("ref", examConfig.ref_pediatric);
      setFieldValue("min", examConfig.min_pediatric);
      setFieldValue("max", examConfig.max_pediatric);
    }
  };

  const copyOptions = () => {
    const items = [
      {
        key: "adult",
        label: "Adulto",
      },
      {
        key: "pediatric",
        label: "Pediátrico",
      },
    ];

    return {
      items,
      onClick: applyRef,
    };
  };

  return (
    <>
      <div className={`form-row ${errors.type ? "error" : ""}`}>
        <div className="form-label">
          <label>Segmento:</label>
        </div>
        <div className="form-input">
          <Select
            optionFilterProp="children"
            showSearch
            placeholder="Selecione o segmento..."
            onChange={(value) => setFieldValue("idSegment", value)}
            value={values.idSegment}
            loading={examTypesStatus === "loading"}
            disabled={!values.new || !!values.idSegment}
          >
            {segments.map((item: any) => (
              <Select.Option key={item.id} value={item.id}>
                {item.description}
              </Select.Option>
            ))}
          </Select>
        </div>
        {errors.idSegment && (
          <div className="form-error">{String(errors.idSegment)}</div>
        )}
      </div>

      <div className={`form-row ${errors.type ? "error" : ""}`}>
        <div className="form-label">
          <label>Tipo de Exame:</label>
        </div>
        <div className="form-input">
          {canAddExams && (
            <Radio.Group
              value={typeMode}
              onChange={(e) => handleTypeModeChange(e.target.value)}
              style={{ marginBottom: "8px", display: "block" }}
            >
              <Radio value="select">Selecionar existente</Radio>
              <Radio value="input">Digitar novo</Radio>
            </Radio.Group>
          )}
          {canAddExams && typeMode === "input" ? (
            <Input
              value={type}
              onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
                setFieldValue("type", target.value)
              }
              maxLength={100}
              placeholder="Digite o tipo de exame..."
            />
          ) : (
            <Select
              optionFilterProp="children"
              showSearch
              placeholder="Selecione o exame..."
              onChange={(value) => setFieldValue("type", value)}
              value={type}
              loading={examTypesStatus === "loading"}
              disabled={!values.new || !!values.type}
            >
              {examTypes.map((item: string) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          )}
        </div>
        {errors.type && <div className="form-error">{String(errors.type)}</div>}
      </div>

      <div className={`form-row`}>
        <div className="form-label">
          <label>Exame padrão NoHarm:</label>
        </div>
        <div className="form-input">
          <div style={{ display: "flex" }} id="exam-ref-container">
            <Select
              optionFilterProp="children"
              showSearch
              value={values.tpExamRef}
              placeholder="Selecione o exame correspondente..."
              onChange={(value) => setFieldValue("tpExamRef", value)}
              loading={globalExamsStatus === "loading"}
              getPopupContainer={() =>
                document.getElementById("exam-ref-container") || document.body
              }
            >
              {globalExams &&
                globalExams.map((item: any) => (
                  <Select.Option key={item.tpexam} value={item.tpexam}>
                    {item.name} ({item.tpexam})
                  </Select.Option>
                ))}
            </Select>
            <Tooltip title="Copiar da referência">
              <Dropdown menu={copyOptions()}>
                <Button
                  shape="circle"
                  icon={<CopyOutlined />}
                  type="primary"
                  style={{ marginLeft: "5px" }}
                />
              </Dropdown>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={`form-row ${errors.name ? "error" : ""}`}>
        <div className="form-label">
          <label>Nome:</label>
        </div>
        <div className="form-input">
          <Input
            value={name}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("name", target.value)
            }
            maxLength={250}
          />
        </div>
        {errors.name && <div className="form-error">{String(errors.name)}</div>}
      </div>

      <div className={`form-row ${errors.initials ? "error" : ""}`}>
        <div className="form-label">
          <label>Rótulo:</label>
        </div>
        <div className="form-input">
          <Input
            value={initials}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("initials", target.value)
            }
            maxLength={50}
          />
        </div>
        {errors.initials && (
          <div className="form-error">{String(errors.initials)}</div>
        )}
      </div>

      <div className={`form-row ${errors.ref ? "error" : ""}`}>
        <div className="form-label">
          <label>Referência:</label>
        </div>
        <div className="form-input">
          <Input
            value={ref}
            onChange={({ target }: React.ChangeEvent<HTMLInputElement>) =>
              setFieldValue("ref", target.value)
            }
            maxLength={250}
          />
        </div>
        {errors.ref && <div className="form-error">{String(errors.ref)}</div>}
      </div>

      <div className={`form-row ${errors.min ? "error" : ""}`}>
        <div className="form-label">
          <label>Valor mínimo:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{ width: 120 }}
            min={-999999}
            max={999999}
            value={min}
            onChange={(value: number) => setFieldValue("min", value)}
          />
        </div>
        {errors.min && <div className="form-error">{String(errors.min)}</div>}
      </div>

      <div className={`form-row ${errors.max ? "error" : ""}`}>
        <div className="form-label">
          <label>Valor máximo:</label>
        </div>
        <div className="form-input">
          <InputNumber
            style={{ width: 120 }}
            min={0}
            max={999999}
            value={max}
            onChange={(value: number) => setFieldValue("max", value)}
          />
        </div>
        {errors.max && <div className="form-error">{String(errors.max)}</div>}
      </div>

      <div className={`form-row ${errors.active ? "error" : ""}`}>
        <div className="form-label">
          <label>Ativo:</label>
        </div>
        <div className="form-input">
          <Switch
            onChange={(value: boolean) => setFieldValue("active", value)}
            checked={active}
          />
        </div>
        {errors.active && (
          <div className="form-error">{String(errors.active)}</div>
        )}
      </div>
    </>
  );
}
