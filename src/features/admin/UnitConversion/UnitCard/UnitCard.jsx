import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Spin, Alert } from "antd";
import {
  CheckOutlined,
  StarOutlined,
  FileTextOutlined,
  RobotOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Formik } from "formik";

import { InputNumber } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { createSlug } from "utils/transformers/utils";
import { Form } from "styles/Form.style";
import { ConversionUnitCard } from "./UnitCard.style";
import { updateListFactors, saveConversions } from "../UnitConversionSlice";
import { setDrawerSctid } from "../../DrugReferenceDrawer/DrugReferenceDrawerSlice";
import { getErrorMessage } from "utils/errorHandler";
import { matchPrediction, isValidConversion } from "../transformer";

export default function UnitCard({
  idDrug,
  name,
  idSegment,
  data,
  prescribedQuantity,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infered, setInfered] = useState(!isValidConversion(data));

  useEffect(() => {
    setError(null);
  }, [idSegment]);

  const Link = () => (
    <div
      style={{ display: "flex", flexDirection: "column", padding: "0.5rem 0" }}
    >
      <div>
        <Tooltip title="Ver medicamento">
          <button
            href="#"
            tabIndex={-1}
            onClick={() =>
              window.open(
                `/medicamentos/${idSegment}/${idDrug}/${createSlug(name)}`,
                "_blank"
              )
            }
          >
            {name}
          </button>
        </Tooltip>
      </div>
      <div style={{ fontSize: "10px", opacity: 0.5 }}>
        Contagem: {prescribedQuantity || "--"}
      </div>
    </div>
  );

  const ExtraAction = ({ sctid }) => (
    <Tooltip title="Referência">
      <Button
        shape="circle"
        icon={<FileTextOutlined />}
        loading={loading}
        onClick={() => showRef(sctid)}
      />
    </Tooltip>
  );

  const showRef = (sctid) => {
    dispatch(setDrawerSctid(sctid));
  };

  const initialValues = {
    idDrug,
    name,
    idSegment,
    conversionList: (data || []).map((item) => {
      return {
        ...item,
        factor: infered ? item.prediction : item.factor,
      };
    }),
  };

  const resetForm = (setFieldValue) => {
    setFieldValue("conversionList", data);
    setError(null);
    setInfered(false);
  };

  const applyPredictions = async (setFieldValue) => {
    const newConversionList = data.map((item) => {
      return {
        ...item,
        factor: item.prediction,
      };
    });
    setFieldValue("conversionList", newConversionList);
    setInfered(true);
  };

  const submit = (params) => {
    setError(null);

    if (isValidConversion(params.conversionList)) {
      setLoading(true);
      const payload = {
        idDrug,
        idSegment,
        idMeasureUnitDefault: params.conversionList.find((i) => i.factor === 1)
          .idMeasureUnit,
        conversionList: params.conversionList,
      };

      dispatch(saveConversions(payload)).then((response) => {
        if (response.error) {
          const errorMsg = getErrorMessage(response, t);
          setError(errorMsg);
          notification.error({
            message: errorMsg,
          });
        } else {
          dispatch(updateListFactors(params.conversionList));
          setInfered(false);
          notification.success({
            message: "Conversão atualizada!",
            description: `Geração de scores solicitada, aguarde alguns minutos para atualizar. (${params.name})`,
          });
        }

        setLoading(false);
      });
    } else {
      const errorMsg =
        "Todas as conversões precisam estar preenchidas e, ao menos uma, deve ter o fator 1.";
      setError(errorMsg);
      notification.error({
        message: "Conversão inválida!",
        description: errorMsg,
      });
    }
  };

  return (
    <Formik enableReinitialize onSubmit={submit} initialValues={initialValues}>
      {({ handleSubmit, values, setFieldValue, dirty }) => (
        <ConversionUnitCard
          title={<Link />}
          type="inner"
          className={`${isValidConversion(data) ? "success" : "error"} ${
            dirty ? "warning" : ""
          }`}
          extra={<ExtraAction sctid={data[0].sctid} />}
        >
          <Spin spinning={loading}>
            <Form>
              <div className="conversion-unit-card-container">
                <div>
                  <Row gutter={[24, 16]}>
                    {values.conversionList.map((i, index) => (
                      <Col xs={12} key={i.idMeasureUnit}>
                        <div className="form-row">
                          <div className="form-label">
                            {i.measureUnit || "--"}
                          </div>
                          <div className="form-input">
                            <InputNumber
                              value={i.factor}
                              min={0}
                              max={99999999}
                              className={`${
                                i.factor === 1 ? "success default-unit" : ""
                              } ${!i.factor ? "error" : ""}`}
                              addonBefore={
                                i.factor === 1 ? <StarOutlined /> : "X"
                              }
                              status={i.factor ? "" : "error"}
                              onChange={(val) =>
                                setFieldValue(
                                  `conversionList.${index}.factor`,
                                  val
                                )
                              }
                            />
                          </div>
                          {infered && i.probability && (
                            <Tooltip title="Probabilidade da inferência estar correta">
                              <div
                                className="form-info"
                                style={{
                                  display: "inline-block",
                                  cursor: "default",
                                }}
                              >
                                {i.probability.toFixed()}%
                              </div>
                            </Tooltip>
                          )}
                          {!infered && matchPrediction(i) && (
                            <Alert
                              type="error"
                              showIcon
                              style={{ marginTop: 8, fontSize: 12 }}
                              message={`Inferência: ${i.prediction}`}
                            />
                          )}
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
                {error && (
                  <Alert
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginTop: "20px" }}
                  />
                )}

                {infered && (
                  <Alert
                    message="Conversões inferidas"
                    description={<>Revise antes de salvar.</>}
                    type="warning"
                    closable
                    showIcon
                    style={{ marginTop: "20px" }}
                  />
                )}

                <div className={`form-row`}>
                  <div className="form-action-bottom">
                    <Button
                      type="link"
                      onClick={() => resetForm(setFieldValue)}
                      icon={<DeleteOutlined />}
                      danger
                      disabled={!infered}
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={() => applyPredictions(setFieldValue)}
                      icon={<RobotOutlined />}
                    >
                      Inferir
                    </Button>
                    <Button onClick={handleSubmit} icon={<CheckOutlined />}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          </Spin>
        </ConversionUnitCard>
      )}
    </Formik>
  );
}
