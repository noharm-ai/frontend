import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Row, Col, Spin, Alert } from "antd";
import {
  CheckOutlined,
  StarOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Formik } from "formik";

import { InputNumber } from "components/Inputs";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { createSlug } from "utils/transformers/utils";
import { Form } from "styles/Form.style";
import { ConversionUnitCard } from "./UnitCard.style";
import {
  updateListFactors,
  fetchDrugAttributes,
  selectDrugRef,
  saveConversions,
} from "../UnitConversionSlice";
import { getErrorMessage } from "utils/errorHandler";

export default function UnitCard({ idDrug, name, idSegment, data }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rejectedSegments, setRejectedSegments] = useState([]);

  useEffect(() => {
    setError(null);
    setRejectedSegments([]);
  }, [idSegment]);

  const Link = () => (
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
  );

  const ExtraAction = ({ idDrug, idSegment }) => (
    <Tooltip title="Referência">
      <Button
        shape="circle"
        icon={<FileTextOutlined />}
        loading={loading}
        onClick={() => showRef(idDrug, idSegment)}
      />
    </Tooltip>
  );

  const showRef = (idDrug, idSegment) => {
    dispatch(selectDrugRef({ idDrug, name, data }));
    dispatch(fetchDrugAttributes({ idDrug, idSegment }));
  };

  const initialValues = {
    idDrug,
    name,
    idSegment,
    conversionList: data || [],
  };

  const submit = (params) => {
    setError(null);

    if (isValid(params.conversionList)) {
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
          if (
            response.payload.data.data.rejected &&
            response.payload.data.data.rejected.length
          ) {
            setRejectedSegments(response.payload.data.data.rejected);
          }

          dispatch(updateListFactors(params.conversionList));
          notification.success({
            message: "Conversão atualizada!",
            description: `${params.name}`,
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

  const isValid = (list) => {
    if (!list || !list.length) return false;

    let valid = true;
    let hasDefault = false;
    list.forEach((item) => {
      if (item.factor === null) {
        valid = false;
      }

      if (item.factor === 1) {
        hasDefault = true;
      }
    });

    return valid && hasDefault;
  };

  return (
    <Formik enableReinitialize onSubmit={submit} initialValues={initialValues}>
      {({ handleSubmit, values, setFieldValue, dirty }) => (
        <ConversionUnitCard
          title={<Link />}
          type="inner"
          className={`${isValid(data) ? "success" : "error"} ${
            dirty ? "warning" : ""
          }`}
          extra={<ExtraAction idDrug={idDrug} idSegment={data[0].idSegment} />}
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
                          {i.prediction && (
                            <div className="form-info">
                              {i.prediction} ({(i.accuracy * 100).toFixed()}%)
                            </div>
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

                {rejectedSegments.length > 0 && (
                  <Alert
                    description={
                      <>
                        Os seguintes segmentos não foram atualizados pois
                        possuem unidades padrão diferentes:{" "}
                        <strong>{rejectedSegments.join(", ")}</strong>.
                      </>
                    }
                    onClose={() => setRejectedSegments([])}
                    type="warning"
                    closable
                    showIcon
                    style={{ marginTop: "20px" }}
                  />
                )}

                <div className={`form-row`}>
                  <div className="form-action-bottom">
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
