import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";
import { RightOutlined, PlusOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import Button from "components/Button";
import Tag from "components/Tag";
import Empty from "components/Empty";
import notification from "components/notification";
import {
  setChooseConciliationModal,
  getConciliationList,
  createConciliation,
} from "../PrescriptionSlice";
import { getErrorMessage } from "utils/errorHandler";
import { formatDate } from "utils/date";
import FeaturesService from "services/features";

import { ChooseConciliationContainer } from "./ChooseConciliation.style";

export default function ChooseConciliation() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const list = useSelector(
    (state) => state.prescriptionv2.chooseConciliation.list
  );
  const status = useSelector(
    (state) => state.prescriptionv2.chooseConciliation.status
  );
  const admissionNumber = useSelector(
    (state) => state.prescriptionv2.chooseConciliation.admissionNumber
  );
  const features = useSelector((state) => state.user.account.features);
  const [loading, setLoading] = useState(false);

  const featureService = FeaturesService(features);

  useEffect(() => {
    if (admissionNumber) {
      dispatch(getConciliationList({ admissionNumber })).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        }
      });
    }
  }, [admissionNumber, dispatch, t]);

  const addConciliation = () => {
    setLoading(true);
    dispatch(createConciliation({ admissionNumber })).then((response) => {
      setLoading(false);

      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Conciliação criada com sucesso.",
        });
        window.open(`/conciliacao/${response.payload.data}`);
        dispatch(setChooseConciliationModal(null));
      }
    });
  };

  return (
    <DefaultModal
      open={admissionNumber}
      width={350}
      centered
      destroyOnHidden
      onCancel={() => dispatch(setChooseConciliationModal(false))}
      footer={null}
      maskClosable={false}
    >
      <Spin spinning={status === "loading"}>
        <ChooseConciliationContainer>
          <div className="heading">Selecionar conciliação:</div>
          {list.map((i) => (
            <div
              className="conciliation"
              key={i.id}
              onClick={() => window.open(`/conciliacao/${i.id}`)}
            >
              <div>
                <div className="date">{formatDate(i.date)}</div>
                <div className="tag">
                  <Tag color={i.status === "s" ? "success" : "warning"}>
                    {i.status === "s" ? "Checado" : "Pendente"}
                  </Tag>
                </div>
              </div>
              <RightOutlined />
            </div>
          ))}
          {list.length === 0 && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhuma conciliação encontrada."
            />
          )}
          {featureService.hasConciliationEdit() && (
            <div className="action">
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => addConciliation()}
                loading={loading}
              >
                Nova conciliação
              </Button>
            </div>
          )}
        </ChooseConciliationContainer>
      </Spin>
    </DefaultModal>
  );
}
