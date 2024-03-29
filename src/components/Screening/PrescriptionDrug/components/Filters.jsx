import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { FilterOutlined, CaretUpOutlined } from "@ant-design/icons";
import { Affix } from "antd";

import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import Button from "components/Button";
import { Radio } from "components/Inputs";
import Tooltip from "components/Tooltip";
import { setPrescriptionFilters } from "features/prescription/PrescriptionSlice";
import {
  setPrescriptionListType,
  setPrescriptionListOrder,
  savePreferences,
} from "features/preferences/PreferencesSlice";

import { ToolBox } from "../PrescriptionDrug.style";

export default function Filters({ showPrescriptionOrder }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.prescriptionv2.filters);
  const prescriptionListType = useSelector(
    (state) => state.preferences.prescription.listType
  );
  const prescriptionListOrder = useSelector(
    (state) => state.preferences.prescription.listOrder
  );

  const filterOptions = () => {
    const items = [
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
        key: "alerts",
        label: t(`prescriptionDrugFilters.alerts`),
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
              {t(`prescriptionDrugFilters.${i}`)}
            </Tag>
          ))}
        </div>
      </Affix>
      <div className="viz-mode">
        <Tooltip title="Modo de visualização">
          <Radio.Group
            onChange={(e) => {
              dispatch(setPrescriptionListType(e.target.value));
              dispatch(savePreferences());
            }}
            value={prescriptionListType}
          >
            <Radio.Button value="default">Padrão</Radio.Button>
            <Radio.Button value="condensed">Condensado</Radio.Button>
          </Radio.Group>
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
              style={{ marginLeft: "15px" }}
            />
          </Tooltip>
        )}
      </div>
    </ToolBox>
  );
}
