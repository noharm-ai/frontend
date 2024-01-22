import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { FilterOutlined } from "@ant-design/icons";
import { Affix } from "antd";

import Tag from "components/Tag";
import Dropdown from "components/Dropdown";
import { Radio } from "components/Inputs";
import Tooltip from "components/Tooltip";
import { setPrescriptionFilters } from "features/prescription/PrescriptionSlice";
import {
  setPrescriptionListType,
  savePreferences,
} from "features/preferences/PreferencesSlice";

import { ToolBox } from "../PrescriptionDrug.style";

export default function Filters() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.prescriptionv2.filters);
  const prescriptionListType = useSelector(
    (state) => state.preferences.prescription.listType
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
      </div>
    </ToolBox>
  );
}
