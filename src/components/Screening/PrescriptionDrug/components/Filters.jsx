import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  FilterOutlined,
  WarningOutlined,
  BorderOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Affix } from "antd";

import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import { Radio } from "components/Inputs";
import Tooltip from "components/Tooltip";
import DefaultModal from "components/Modal";
import {
  setPrescriptionFilters,
  setPrescriptionPerspective,
  setSelectedRowsActive,
} from "features/prescription/PrescriptionSlice";
import {
  setPrescriptionListType,
  setPrescriptionListOrder,
  savePreferences,
} from "features/preferences/PreferencesSlice";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

import { ToolBox } from "../PrescriptionDrug.style";
import { Form } from "styles/Form.style";

export default function Filters({
  showPrescriptionOrder,
  addMultipleIntervention,
}) {
  const { t } = useTranslation();
  const [configModal, setConfigModal] = useState(false);
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.prescriptionv2.filters);
  const prescriptionPerspective = useSelector(
    (state) => state.prescriptionv2.perspective
  );
  const selectedRows = useSelector(
    (state) => state.prescriptionv2.selectedRows.list
  );
  const selectedRowsActive = useSelector(
    (state) => state.prescriptionv2.selectedRows.active
  );
  const prescriptionListType = useSelector(
    (state) => state.preferences.prescription.listType
  );
  const prescriptionListOrder = useSelector(
    (state) => state.preferences.prescription.listOrder
  );

  const filterOptions = () => {
    const items = [
      {
        key: "alertsLevelGroup",
        label: t(`prescriptionDrugFilters.alertsLevelGroup`),
        children: [
          {
            key: "alertsAll_level",
            label: t(`prescriptionDrugFilters.alertsAll`),
          },
          {
            key: "alertsHigh",
            label: t(`prescriptionDrugFilters.alertsHigh`),
          },
          {
            key: "alertsMedium",
            label: t(`prescriptionDrugFilters.alertsMedium`),
          },
          {
            key: "alertsLow",
            label: t(`prescriptionDrugFilters.alertsLow`),
          },
        ],
      },
      {
        key: "alertsTypeGroup",
        label: t(`prescriptionDrugFilters.alertsTypeGroup`),
        children: [
          {
            key: "alertsAll_type",
            label: t(`prescriptionDrugFilters.alertsAll`),
          },
          ...DrugAlertTypeEnum.getAlertTypes(t).map((a) => ({
            key: `drugAlertType.${a.id}`,
            label: a.label,
          })),
        ],
      },
      {
        key: "hv",
        label: t(`prescriptionDrugFilters.hv`),
      },
      {
        key: "am",
        label: t(`prescriptionDrugFilters.am`),
      },

      {
        key: "active",
        label: t(`prescriptionDrugFilters.active`),
      },

      {
        key: "withValidation",
        label: t(`prescriptionDrugFilters.withValidation`),
      },
      {
        key: "diff",
        label: t(`prescriptionDrugFilters.diff`),
      },
    ];

    return {
      items,
      onClick: handleFilterClick,
    };
  };

  const actionOptions = () => {
    const items = [
      {
        key: "addIntervention",
        label: "Enviar intervenção",
        icon: <WarningOutlined style={{ fontSize: "16px" }} />,
        disabled: selectedRows.length === 0,
        danger: true,
      },
      {
        type: "divider",
      },
      {
        key: "reset",
        label: "Remover seleção",
        icon: <BorderOutlined style={{ fontSize: "16px" }} />,
        disabled: !selectedRowsActive,
      },
    ];

    return {
      items,
      onClick: handleActionClick,
    };
  };

  const handleActionClick = ({ key }) => {
    switch (key) {
      case "reset":
        dispatch(setSelectedRowsActive(false));
        break;
      case "addIntervention":
        addMultipleIntervention(selectedRows);
        break;
      default:
        console.error(key);
    }
  };

  const handleFilterClick = ({ key }) => {
    const index = filters.indexOf(key);

    if (index === -1) {
      dispatch(setPrescriptionFilters([...filters, key]));
    } else {
      const newFilter = [...filters];
      newFilter.splice(index, 1);
      dispatch(setPrescriptionFilters(newFilter));
    }
  };

  const togglePrescriptionOrder = (order) => {
    dispatch(setPrescriptionListOrder(order));
    dispatch(savePreferences());
  };

  return (
    <ToolBox>
      <Affix offsetTop={50}>
        <div className="filters">
          <Dropdown menu={filterOptions()}>
            <Tag className="add-filter" icon={<FilterOutlined />}>
              {t("labels.filters")}
            </Tag>
          </Dropdown>
          {filters.map((i) => (
            <Tag
              color="#a991d6"
              key={i}
              closable
              onClose={() => handleFilterClick({ key: i })}
            >
              {t(i.split(".").length > 1 ? i : `prescriptionDrugFilters.${i}`)}
            </Tag>
          ))}
        </div>
      </Affix>
      <Affix offsetTop={50}>
        <div className="viz-mode">
          <span>
            <Dropdown.Button
              menu={actionOptions()}
              type={selectedRowsActive ? "primary" : "default"}
              onClick={() =>
                !selectedRowsActive
                  ? dispatch(setSelectedRowsActive(true))
                  : false
              }
            >
              {selectedRowsActive
                ? `${selectedRows.length} selecionados`
                : "Ativar seleção múltipla"}
            </Dropdown.Button>
          </span>
          <Tooltip title="Configurações">
            <Button
              shape="circle"
              icon={<SettingOutlined />}
              onClick={() => setConfigModal(true)}
              style={{ marginLeft: "15px" }}
            />
          </Tooltip>
        </div>
      </Affix>
      <DefaultModal
        destroyOnClose
        open={configModal}
        onCancel={() => setConfigModal(false)}
        width={450}
        footer={null}
        title="Configurações"
      >
        <Form>
          <div className={`form-row`}>
            <div className="form-label">
              <label>Modo de visualização:</label>
            </div>
            <div className="form-input">
              <Radio.Group
                onChange={(e) => {
                  dispatch(setPrescriptionListType(e.target.value));
                  dispatch(savePreferences());
                }}
                value={prescriptionListType}
                buttonStyle="solid"
              >
                <Radio.Button value="default">Padrão</Radio.Button>
                <Radio.Button value="condensed">Condensado</Radio.Button>
              </Radio.Group>
            </div>
            <div className="form-info">
              O modo Condensado agrupa os itens por vigência e reduz o tamanho
              da linha.
            </div>
          </div>

          <div className={`form-row`}>
            <div className="form-label">
              <label>Perspectiva (Beta):</label>
            </div>
            <div className="form-input">
              <Radio.Group
                onChange={(e) => {
                  dispatch(setPrescriptionPerspective(e.target.value));
                }}
                value={prescriptionPerspective}
                buttonStyle="solid"
              >
                <Radio.Button value="default">Padrão</Radio.Button>
                <Radio.Button value="alerts">Alertas</Radio.Button>
              </Radio.Group>
            </div>
            <div className="form-info">
              A perspectiva por Alertas, tem o objetivo de agilizar a análise
              dos alertas emitidos para cada item. (Funcionalidade Beta)
            </div>
          </div>

          {showPrescriptionOrder && (
            <div className={`form-row`}>
              <div className="form-label">
                <label>Ordenação:</label>
              </div>
              <div className="form-input">
                <Radio.Group
                  onChange={(e) => {
                    togglePrescriptionOrder(e.target.value);
                  }}
                  value={prescriptionListOrder}
                  buttonStyle="solid"
                >
                  <Radio.Button value="asc">Crescente</Radio.Button>
                  <Radio.Button value="desc">Decrescente</Radio.Button>
                </Radio.Group>
              </div>
              <div className="form-info">
                Altera a ordem em que as prescrições são exibidas.
              </div>
            </div>
          )}
        </Form>
      </DefaultModal>
    </ToolBox>
  );
}
