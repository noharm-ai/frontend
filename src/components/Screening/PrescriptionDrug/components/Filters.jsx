import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  FilterOutlined,
  WarningOutlined,
  BorderOutlined,
  CaretUpOutlined,
  CompressOutlined,
  AlertOutlined,
  AlertFilled,
  DiffOutlined,
} from "@ant-design/icons";
import { Affix } from "antd";

import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
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
import PrescriptionDiff from "features/prescription/PrescriptionDiff/PrescriptionDiff";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";

import { ToolBox } from "../PrescriptionDrug.style";

export default function Filters({
  showPrescriptionOrder,
  addMultipleIntervention,
  showFilter = true,
  showMultipleSelection = true,
  showPerspective = true,
  showVizMode = true,
  showDiff = true,
}) {
  const { t } = useTranslation();
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
  const prescriptionHasDiff = useSelector(
    (state) => state.prescriptions.single.data.prescriptionCompare.hasDiff
  );
  const [prescriptionDiffModal, setPrescriptionDiffModal] = useState(false);

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

  const togglePrescriptionOrder = () => {
    dispatch(
      setPrescriptionListOrder(prescriptionListOrder === "asc" ? "desc" : "asc")
    );
    dispatch(savePreferences());
  };

  const togglePrescriptionListType = () => {
    dispatch(
      setPrescriptionListType(
        prescriptionListType === "condensed" ? "default" : "condensed"
      )
    );
    dispatch(savePreferences());
  };

  const togglePrescriptionPerspective = () => {
    dispatch(
      setPrescriptionPerspective(
        prescriptionPerspective === "alerts" ? "default" : "alerts"
      )
    );
  };

  return (
    <ToolBox>
      <Affix offsetTop={50}>
        <div className="filters">
          {showFilter && (
            <>
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
                  {t(
                    i.split(".").length > 1 ? i : `prescriptionDrugFilters.${i}`
                  )}
                </Tag>
              ))}
            </>
          )}
        </div>
      </Affix>
      <Affix offsetTop={50}>
        <div className="viz-mode">
          {showMultipleSelection && (
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
          )}
          {showPerspective && (
            <Tooltip
              title={
                prescriptionPerspective === "alerts"
                  ? "Desativar perspectiva por Alertas"
                  : "Ativar perspectiva por Alertas (Funcionalidade Beta)"
              }
            >
              <Button
                shape="circle"
                type={
                  prescriptionPerspective === "alerts" ? "primary" : "default"
                }
                icon={
                  prescriptionPerspective === "alerts" ? (
                    <AlertFilled />
                  ) : (
                    <AlertOutlined />
                  )
                }
                onClick={() => togglePrescriptionPerspective()}
                style={{ marginLeft: "20px" }}
              />
            </Tooltip>
          )}
          {showVizMode && (
            <Tooltip
              title={
                prescriptionListType === "condensed"
                  ? "Desativar modo de visualização Condensado"
                  : "Ativar modo de visualização Condensado"
              }
            >
              <Button
                shape="circle"
                type={
                  prescriptionListType === "condensed" ? "primary" : "default"
                }
                icon={<CompressOutlined />}
                onClick={() => togglePrescriptionListType()}
                style={{ marginLeft: "10px" }}
              />
            </Tooltip>
          )}

          {showDiff && (
            <Tooltip
              title={
                prescriptionHasDiff
                  ? `Abrir Comparativo de Vigências (Beta)`
                  : "Não foram encontrados itens adicionados/removidos entre as vigências"
              }
            >
              <Button
                shape="circle"
                icon={<DiffOutlined />}
                onClick={() => setPrescriptionDiffModal(true)}
                style={{ marginLeft: "10px" }}
                disabled={!prescriptionHasDiff}
              />
            </Tooltip>
          )}

          {showPrescriptionOrder && (
            <Tooltip
              title={
                prescriptionListOrder === "asc"
                  ? "Ordenar prescriçoes por Data Decrescente"
                  : "Ordenar prescriçoes por Data Crescente"
              }
            >
              <Button
                className={`btn-order ${
                  prescriptionListOrder === "desc" ? "order-desc" : "order-asc"
                }`}
                shape="circle"
                icon={<CaretUpOutlined />}
                onClick={() => togglePrescriptionOrder()}
                style={{ marginLeft: "10px" }}
              />
            </Tooltip>
          )}
        </div>
      </Affix>
      {prescriptionDiffModal && (
        <PrescriptionDiff
          open={prescriptionDiffModal}
          setOpen={setPrescriptionDiffModal}
        />
      )}
    </ToolBox>
  );
}
