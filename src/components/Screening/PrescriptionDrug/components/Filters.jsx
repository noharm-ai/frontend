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
  PlusOutlined,
  CopyOutlined,
  SortAscendingOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Affix, Popconfirm } from "antd";

import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import {
  setPrescriptionFilters,
  setPrescriptionPerspective,
  setSelectedRowsActive,
  copyConciliation,
} from "features/prescription/PrescriptionSlice";
import {
  setPrescriptionListType,
  setPrescriptionListOrder,
  setPrescriptionDrugOrder,
  savePreferences,
} from "features/preferences/PreferencesSlice";
import { selectPrescriptionDrugThunk } from "store/ducks/prescriptionDrugs/thunk";
import { fetchScreeningThunk } from "store/ducks/prescriptions/thunk";
import PrescriptionDiff from "features/prescription/PrescriptionDiff/PrescriptionDiff";
import DrugAlertTypeEnum from "models/DrugAlertTypeEnum";
import FeaturesService from "services/features";
import { getErrorMessage } from "utils/errorHandler";

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
  const prescriptionDrugOrder = useSelector(
    (state) => state.preferences.prescription.drugOrder
  );
  const prescriptionHasDiff = useSelector(
    (state) => state.prescriptions.single.data.prescriptionCompare.hasDiff
  );
  const prescription = useSelector((state) => state.prescriptions.single.data);
  const features = useSelector((state) => state.user.account.features);
  const [prescriptionDiffModal, setPrescriptionDiffModal] = useState(false);
  const [copyingConciliation, setCopyingConciliation] = useState(false);

  const featureService = FeaturesService(features);

  const hasAddDrugPermission =
    (prescription.concilia && featureService.hasConciliationEdit()) ||
    (!prescription.agg && featureService.hasPrimaryCare());

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
        key: "attrGroup",
        label: t(`prescriptionDrugFilters.attrGroup`),
        children: [
          {
            key: "hv",
            label: t(`prescriptionDrugFilters.hv`),
          },
          {
            key: "am",
            label: t(`prescriptionDrugFilters.am`),
          },
          {
            key: "controlled",
            label: t(`prescriptionDrugFilters.controlled`),
          },
          {
            key: "liver",
            label: t(`prescriptionDrugFilters.liver`),
          },
          {
            key: "np",
            label: t(`prescriptionDrugFilters.np`),
          },
          {
            key: "fallRisk",
            label: t(`prescriptionDrugFilters.fallRisk`),
          },
        ],
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

  const sortOptions = () => {
    const iconStyle = { fontSize: "16px" };
    const getIcon = (active) =>
      active ? (
        <CheckSquareOutlined style={iconStyle} />
      ) : (
        <BorderOutlined style={iconStyle} />
      );

    const items = [
      {
        key: "ATTRIBUTE",
        label: "AM, AV, C, outros",
        icon: getIcon(prescriptionDrugOrder === "ATTRIBUTE"),
      },
      {
        key: "DRUG_NAME",
        label: "Nome do medicamento",
        icon: getIcon(prescriptionDrugOrder === "DRUG_NAME"),
      },
      {
        key: "PERIOD",
        label: "Período",
        icon: getIcon(prescriptionDrugOrder === "PERIOD"),
      },
      {
        key: "CUSTOM",
        label: "Pré-definida (infusão)",
        icon: getIcon(prescriptionDrugOrder === "CUSTOM"),
      },
      {
        key: "SCORE",
        label: "Scores",
        icon: getIcon(prescriptionDrugOrder === "SCORE"),
      },

      {
        key: "ROUTE",
        label: "Via",
        icon: getIcon(prescriptionDrugOrder === "ROUTE"),
      },
    ];

    return {
      items,
      onClick: ({ key }) => dispatch(setPrescriptionDrugOrder(key)),
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

  const addPrescriptionDrug = () => {
    dispatch(
      selectPrescriptionDrugThunk({
        idPrescription: prescription.idPrescription,
        idSegment: prescription.idSegment,
        idHospital: prescription.idHospital,
        source: "prescription",
        updateDrug: true,
        concilia: prescription.concilia,
      })
    );
  };

  const executeCopyConciliation = () => {
    setCopyingConciliation(true);

    dispatch(
      copyConciliation({ idPrescription: prescription.idPrescription })
    ).then((response) => {
      setCopyingConciliation(false);

      if (response.error) {
        notification.error({
          message: t("error.title"),
          description: getErrorMessage(response, t),
        });
      } else {
        dispatch(fetchScreeningThunk(prescription.idPrescription));
        notification.success({
          message: "Conciliação copiada com sucesso",
        });
      }
    });
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
          {hasAddDrugPermission && (
            <Button
              icon={<PlusOutlined />}
              onClick={() => addPrescriptionDrug()}
              style={{ marginRight: "10px" }}
            >
              Adicionar medicamento
            </Button>
          )}
          {prescription.concilia && featureService.hasConciliationEdit() && (
            <Popconfirm
              title="Copiar conciliação"
              description="Esta ação copia todos os medicamentos da conciliação anterior deste paciente. Confirma?"
              okText="Sim"
              cancelText="Não"
              onConfirm={() => executeCopyConciliation()}
            >
              <Tooltip title="Copiar medicamentos da conciliação anterior">
                <Button
                  icon={<CopyOutlined />}
                  style={{ marginRight: "10px" }}
                  loading={copyingConciliation}
                >
                  Copiar
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
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

          <Tooltip title="Ordenar lista de medicamentos por:">
            <span>
              <Dropdown menu={sortOptions()} trigger={["click"]}>
                <Button
                  shape="circle"
                  type="primary"
                  icon={<SortAscendingOutlined />}
                  style={{ marginLeft: "10px" }}
                />
              </Dropdown>
            </span>
          </Tooltip>

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
