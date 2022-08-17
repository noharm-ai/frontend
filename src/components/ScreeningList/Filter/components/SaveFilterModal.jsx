import React, { useState } from "react";

import Heading from "components/Heading";
import { Row, Col } from "components/Grid";
import Modal from "components/Modal";
import { Input } from "components/Inputs";
import Switch from "components/Switch";

import { HelpText } from "../Filter.style";

export default function SaveFilterModal({
  setSaveFilterOpen,
  saveFilterAction,
  open,
}) {
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");

  const save = () => {
    saveFilterAction(filterName, filterType);
    setSaveFilterOpen(false);
    setFilterName("");
  };

  return (
    <Modal
      visible={open}
      onCancel={() => setSaveFilterOpen(false)}
      onOk={() => save()}
      okButtonProps={{
        disabled: filterName === "",
      }}
      okText="Salvar"
      okType="primary gtm-bt-save-filter"
      cancelText="Cancelar"
    >
      <Heading
        as="label"
        size="14px"
        className="fixed"
        style={{ marginTop: "12px" }}
      >
        Nome do filtro:
      </Heading>
      <Input
        onChange={({ target }) => setFilterName(target.value)}
        value={filterName}
      />

      <Row gutter={20} style={{ marginTop: "15px" }}>
        <Col xs={4}>
          <Heading as="label" size="14px" className="fixed">
            Público:
          </Heading>
        </Col>
        <Col xs={20}>
          <Switch
            onChange={(value) => setFilterType(value ? "public" : "private")}
            checked={filterType === "public"}
          />
          <HelpText>
            * Filtros públicos são acessíveis por toda a equipe.
          </HelpText>
        </Col>
      </Row>
    </Modal>
  );
}
