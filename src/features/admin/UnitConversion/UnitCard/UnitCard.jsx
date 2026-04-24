import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Spin, Alert, Space } from "antd";
import {
  CheckOutlined,
  StarOutlined,
  RobotOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Formik } from "formik";

import { InputNumber, Input } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { Form } from "styles/Form.style";
import { ConversionUnitCard } from "./UnitCard.style";
import { updateListFactors, saveConversions } from "../UnitConversionSlice";
import { setDrawerSctid } from "../../DrugReferenceDrawer/DrugReferenceDrawerSlice";
import { getErrorMessage } from "utils/errorHandler";
import { matchPrediction, isValidConversion } from "../transformer";
import { MeasureUnitEnum } from "models/MeasureUnitEnum";

const UnitCard = forwardRef(function UnitCard(
  {
    idDrug,
    name,
    data,
    substanceMeasureUnit,
    substanceName,
    showPredictions,
    isFocused,
  },
  ref,
) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [infered, setInfered] = useState(
    showPredictions && !isValidConversion(data),
  );

  const cardRef = useRef(null);
  const formikBagRef = useRef(null);

  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isFocused]);

  useImperativeHandle(
    ref,
    () => ({
      save: () => formikBagRef.current?.submitForm(),
      showRef: () => dispatch(setDrawerSctid(data[0]?.sctid)),
      applyPredictions: () => {
        const bag = formikBagRef.current;
        if (!bag) return;
        bag.setFieldValue(
          "conversionList",
          data.map((item) => ({ ...item, factor: item.prediction })),
        );
        setInfered(true);
      },
      resetForm: () => {
        const bag = formikBagRef.current;
        if (!bag) return;
        bag.setFieldValue("conversionList", data);
        setError(null);
        setInfered(false);
      },
      focusFirstInput: () => {
        const input = cardRef.current?.querySelector(
          'input:not([readonly]):not([tabindex="-1"])',
        );
        input?.focus();
        input?.select();
      },
    }),
    [data, dispatch],
  );

  const Link = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "0.5rem 0",
        fontSize: "13px",
      }}
    >
      <div
        style={{ lineHeight: 1.2, cursor: "pointer" }}
        onClick={() => showRef(data[0].sctid)}
      >
        {name}
      </div>
      <Tooltip title={substanceName}>
        <div
          style={{
            fontSize: "10px",
            opacity: 0.5,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {substanceName || "--"}
        </div>
      </Tooltip>
    </div>
  );

  const showRef = (sctid) => {
    dispatch(setDrawerSctid(sctid));
  };

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

  const initialValues = {
    idDrug,
    name,
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
        idMeasureUnitDefault: substanceMeasureUnit,
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
        }

        setLoading(false);
      });
    } else {
      const errorMsg = "Todas as conversões precisam estar preenchidas.";
      setError(errorMsg);
      notification.error({
        message: "Conversão inválida!",
        description: errorMsg,
      });
    }
  };

  const filterConversions = (item) => {
    return item.drugMeasureUnitNh !== item.substanceMeasureUnit;
  };

  return (
    <Formik enableReinitialize onSubmit={submit} initialValues={initialValues}>
      {(formikBag) => {
        formikBagRef.current = formikBag;
        const { handleSubmit, values, setFieldValue, dirty } = formikBag;
        return (
          <div ref={cardRef}>
            <ConversionUnitCard
              $isFocused={isFocused}
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
                        <Col xs={12}>
                          <div className="form-row">
                            <div className="form-label">Unidade padrão</div>
                            <div className="form-input default-unit">
                              <Space orientation="horizontal">
                                <Space.Compact block>
                                  <Space.Addon>
                                    <StarOutlined />
                                  </Space.Addon>
                                  <Input
                                    value={MeasureUnitEnum.getDescription(
                                      substanceMeasureUnit,
                                    )}
                                    readOnly
                                    tabIndex={-1}
                                  />
                                </Space.Compact>
                              </Space>
                            </div>
                          </div>
                        </Col>

                        {values.conversionList
                          .filter(filterConversions)
                          .map((i, index) => (
                            <Col xs={12} key={i.idMeasureUnit}>
                              <div className="form-row">
                                <div className="form-label">
                                  {i.measureUnit || "--"}
                                </div>
                                <div className="form-input">
                                  <Space orientation="horizontal">
                                    <Space.Compact block>
                                      <Space.Addon>{"X"}</Space.Addon>
                                      <InputNumber
                                        value={i.factor}
                                        min={0}
                                        max={99999999}
                                        className={`${!i.factor ? "error" : ""}`}
                                        status={i.factor ? "" : "error"}
                                        onChange={(val) =>
                                          setFieldValue(
                                            `conversionList.${index}.factor`,
                                            val,
                                          )
                                        }
                                      />
                                    </Space.Compact>
                                  </Space>
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
                        title="Conversões inferidas"
                        type="warning"
                        closable
                        showIcon
                        style={{ marginTop: "16px" }}
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
          </div>
        );
      }}
    </Formik>
  );
});

export default UnitCard;
