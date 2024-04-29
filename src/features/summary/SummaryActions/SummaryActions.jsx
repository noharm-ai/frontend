import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  CheckOutlined,
  MenuOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { FloatButton } from "antd";

import Button from "components/Button";
import BackTop from "components/BackTop";
import MemoryDraft from "features/memory/MemoryDraft/MemoryDraft";
import SummaryText from "../SummaryText/SummaryText";
import SummarySave from "../SummarySave/SummarySave";
import SummaryStatus from "../SummaryStatus/SummaryStatus";

export default function SummaryActions({ admissionNumber, loadDraft }) {
  const { t } = useTranslation();
  const blocks = useSelector((state) => state.summary.blocks);

  const [modalText, setModalText] = useState(false);
  const [modalSave, setModalSave] = useState(false);

  return (
    <>
      <MemoryDraft
        type={`draft_summary_${admissionNumber}`}
        currentValue={blocks}
        setValue={loadDraft}
      ></MemoryDraft>

      <Button
        type="default"
        onClick={() => setModalText(true)}
        icon={<FileTextOutlined />}
      >
        {t("summary.generateText")}
      </Button>
      <Button
        type="primary"
        onClick={() => setModalSave(true)}
        icon={<CheckOutlined />}
      >
        {t("summary.finishSummary")}
      </Button>

      <SummaryText open={modalText} setOpen={setModalText}></SummaryText>
      <SummarySave
        open={modalSave}
        setOpen={setModalSave}
        admissionNumber={admissionNumber}
      ></SummarySave>

      <FloatButton.Group
        trigger="click"
        type="primary"
        icon={<MenuOutlined />}
        tooltip="Menu"
        style={{ bottom: 25, right: 80 }}
      >
        <FloatButton
          icon={<FileTextOutlined />}
          onClick={() => setModalText(true)}
          tooltip={t("summary.generateText")}
        />
        <FloatButton
          onClick={() => setModalSave(true)}
          icon={<CheckOutlined />}
          tooltip={t("summary.finishSummary")}
        />
      </FloatButton.Group>
      <BackTop style={{ bottom: 25 }} tooltip="Voltar ao topo" />
      <SummaryStatus setModalSave={setModalSave} />
    </>
  );
}
