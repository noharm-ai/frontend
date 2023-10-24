import React, { useState } from "react";
import { useSelector } from "react-redux";
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
        Gerar Texto
      </Button>
      <Button
        type="primary"
        onClick={() => setModalSave(true)}
        icon={<CheckOutlined />}
      >
        Finalizar Sumário
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
          tooltip="Gerar Texto"
        />
        <FloatButton
          onClick={() => setModalSave(true)}
          icon={<CheckOutlined />}
          tooltip="Finalizar Sumário"
        />
      </FloatButton.Group>
      <BackTop style={{ bottom: 25 }} tooltip="Voltar ao topo" />
      <SummaryStatus setModalSave={setModalSave} />
    </>
  );
}
