import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckOutlined, PlusOutlined, FormOutlined } from "@ant-design/icons";

import { Row, Col } from "components/Grid";
import { Select } from "components/Inputs";
import Heading from "components/Heading";
import notification from "components/notification";
import Button from "components/Button";
import Tooltip from "components/Tooltip";

import FormSubstance from "containers/Forms/Substance";

const saveMessage = {
  message: "Uhu! Substância alterada com sucesso! :)",
};

const formId = "editSubstance";

export default function EditSubstance({
  drugData,
  fetchSubstances,
  substance,
  saveDrug,
  saveStatus,
  idDrug,
  updateDrugData,
  security,
  selectSubstance,
  fetchRelations,
}) {
  const { t } = useTranslation();
  const [isFormVisible, setFormVisibility] = useState(false);
  const [currentSubstance, setCurrentSubstance] = useState({});
  const { isSaving } = saveStatus;

  useEffect(() => {
    fetchSubstances();
  }, [fetchSubstances]);

  useEffect(() => {
    setCurrentSubstance({
      sctidA: drugData.sctidA,
      sctNameA: drugData.sctNameA,
    });
  }, [drugData.sctNameA, drugData.sctidA]);

  const onCancelForm = () => {
    setFormVisibility(false);
  };

  const afterSaveForm = () => {
    setFormVisibility(false);
  };

  const changeSubstance = (value) => {
    setCurrentSubstance({ sctidA: value.value, sctNameA: value.label });

    fetchRelations(value.value);
  };

  const saveSubstance = () => {
    const { sctidA, sctNameA } = currentSubstance;

    updateDrugData({
      sctidA,
      sctNameA,
    });

    saveDrug({
      id: idDrug,
      sctid: sctidA,
      formId,
    })
      .then(() => {
        notification.success(saveMessage);
      })
      .catch((err) => {
        console.error("err", err);
        notification.error({
          message: t("error.title"),
          description: t("error.description"),
        });
      });
  };

  const edit = () => {
    selectSubstance({
      sctid: drugData.sctidA,
      name: drugData.sctNameA,
    });
    setFormVisibility(true);
  };
  const add = () => {
    selectSubstance({
      isAdd: true,
    });
    setFormVisibility(true);
  };

  return (
    <>
      <Row type="flex" gutter={24} align="middle">
        <Col md={4} xxl={2}>
          <Heading as="h3" size="16px" textAlign="right">
            Substância:
          </Heading>
        </Col>
        <Col md={24 - 4} xxl={24 - 8}>
          <Select
            id="sctidA"
            labelInValue
            style={{ width: "70%" }}
            showSearch
            optionFilterProp="children"
            placeholder="Selecione a substância..."
            value={{ value: currentSubstance.sctidA || "" }}
            loading={substance.isFetching}
            disabled={isSaving}
            onChange={changeSubstance}
          >
            <Select.Option key="0" value="0">
              &nbsp;
            </Select.Option>
            {substance.list.map(({ sctid, name, active }) => (
              <Select.Option key={sctid} value={sctid} title={name}>
                {`${active ? "" : "(INATIVO) "}`}
                {name}
              </Select.Option>
            ))}
          </Select>
          {drugData.sctidA !== currentSubstance.sctidA && (
            <Tooltip title="Confirmar e Salvar a alteração">
              <Button
                type="primary gtm-bt-change-substancia"
                style={{ marginLeft: "5px" }}
                onClick={saveSubstance}
                disabled={isSaving}
                loading={isSaving}
                icon={<CheckOutlined />}
              ></Button>
            </Tooltip>
          )}
          {security.isAdmin() &&
            drugData.sctidA === currentSubstance.sctidA && (
              <>
                <Tooltip title="Editar substância">
                  <Button
                    type="primary gtm-bt-edit-substancia"
                    style={{ marginLeft: "5px" }}
                    onClick={edit}
                    icon={<FormOutlined />}
                  ></Button>
                </Tooltip>
                <Tooltip title="Adicionar substância">
                  <Button
                    type="primary gtm-bt-add-substancia"
                    style={{ marginLeft: "5px" }}
                    onClick={add}
                    icon={<PlusOutlined />}
                  ></Button>
                </Tooltip>
              </>
            )}
        </Col>
      </Row>
      <FormSubstance
        visible={isFormVisible}
        onCancel={onCancelForm}
        okText="Salvar"
        okType="primary gtm-bt-save-substance"
        cancelText="Cancelar"
        afterSave={afterSaveForm}
      />
    </>
  );
}
