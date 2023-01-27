import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { InputSearchNumber } from "components/Inputs";
import Tag from "components/Tag";
import Empty from "components/Empty";
import { store } from "store/index";
import api from "services/api";
import { formatAge } from "utils/transformers/utils";
import { useOutsideAlerter } from "lib/hooks";

import { SearchPrescriptionContainer } from "./index.style";

export default function SearchPrescription() {
  const { t } = useTranslation();
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setOpen(false);
  });

  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchData = async (value) => {
    setLoading(true);

    const state = store.getState();
    const access_token = state.auth.identify.access_token;
    const { data } = await api.searchPrescriptions(access_token, value);

    setLoading(false);

    if (data.status === "success") {
      setOptions(data.data);
      setOpen(true);
    }
  };

  const search = (value) => {
    if (value.length < 3) return;
    fetchData(value);
  };

  const navigateTo = (idPrescription) => {
    setOpen(false);
    window.open(`/prescricao/${idPrescription}`);
  };

  return (
    <SearchPrescriptionContainer ref={wrapperRef}>
      <InputSearchNumber
        placeholder={t("layout.iptSearch")}
        size="large"
        onSearch={search}
        id="gtm-search-box"
        type="number"
        loading={loading}
        allowClear
      />
      <div className={`search-result ${open ? "open" : ""}`}>
        {options.map((option) => (
          <div onClick={() => navigateTo(option.idPrescription)}>
            <div className="search-result-info">
              <div className="search-result-info-primary">
                {option.agg
                  ? `${t("patientCard.admission")} ${option.admissionNumber}`
                  : `${t("patientCard.prescription")} ${option.idPrescription}`}
                {" - "}
                <span>{format(new Date(option.date), "dd/MM/yyyy")}</span>
              </div>
              <div className="search-result-info-secondary">
                {option.birthdate && <Tag>{formatAge(option.birthdate)}</Tag>}
                {option.gender && (
                  <Tag>
                    {option.gender === "M"
                      ? t("patientCard.male")
                      : t("patientCard.female")}
                  </Tag>
                )}
                {option.department && <Tag>{option.department}</Tag>}
              </div>
            </div>
            <div>
              {option.status === "s" && <Tag color="green">Checada</Tag>}
              {option.status !== "s" && <Tag color="orange">Pendente</Tag>}
            </div>
          </div>
        ))}
        {!options.length && (
          <div className="not-found">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={t("screeningList.empty")}
            />
          </div>
        )}
      </div>
    </SearchPrescriptionContainer>
  );
}
