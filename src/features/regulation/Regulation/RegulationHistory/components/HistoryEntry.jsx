import React from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Flex, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import CustomFormView from "components/Forms/CustomForm/View";
import { formatDateTime } from "utils/date";
import RegulationAction from "models/regulation/RegulationAction";
import { HistoryEntryContainer } from "./HistoryEntry.style";
import { setActionModal } from "../../RegulationSlice";

export default function HistoryEntry({ movement, first = false }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const viewDetails = (movement) => {
    const template = [
      {
        group: "Detalhes",
        questions: movement.template,
      },
    ];
    DefaultModal.info({
      content: (
        <>
          <CustomFormView template={template} values={movement.data} />
          <Divider />
          <div>
            <strong>Data:</strong> {formatDateTime(movement.createdAt)}
          </div>
          <div>
            <strong>Responsável:</strong> {movement.createdBy}
          </div>
        </>
      ),
      icon: null,
      width: 600,
      okText: "Fechar",
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
      mask: { blur: false },
    });
  };

  if (first) {
    return (
      <HistoryEntryContainer>
        <div className="he-stage">
          {t(`regulation.stage.${movement.origin}`)}
        </div>
        <div style={{ marginTop: "5px" }}>
          <Button type="primary" onClick={() => dispatch(setActionModal(true))}>
            Ação
          </Button>
        </div>
      </HistoryEntryContainer>
    );
  }

  return (
    <HistoryEntryContainer>
      <Flex vertical={true}>
        <div className="he-date" onClick={() => viewDetails(movement)}>
          {formatDateTime(movement.createdAt)}
        </div>
        <div className="he-action">
          {t(`regulation.action.${movement.action}`)}
        </div>
        {movement.action === RegulationAction.UPDATE_STAGE && (
          <div className="he-details">
            {t(`regulation.stage.${movement.origin}`)} -{" "}
            {t(`regulation.stage.${movement.destination}`)}
          </div>
        )}
      </Flex>
      <div className="he-buttons">
        <Button
          shape="circle"
          icon={<SearchOutlined />}
          onClick={() => viewDetails(movement)}
        />
      </div>
    </HistoryEntryContainer>
  );
}
