import React, { useState, useRef, useEffect } from "react";
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
  const inputRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setOpen(false);
  });

  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemActive, setItemActive] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const focusActiveItem = () => {
      setTimeout(() => {
        wrapperRef.current
          .querySelectorAll(".search-result .active")[0]
          .focus();
      }, 100);
    };

    const handleArrowNav = (e) => {
      const keyCode = e.keyCode || e.which;
      const actionKey = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        space: 32,
        enter: 13,
      };

      if (keyCode === actionKey.up || keyCode === actionKey.down) {
        e.preventDefault();
      }

      if (open) {
        switch (keyCode) {
          case actionKey.up:
            const indexUp = options.findIndex(
              (i) => i.idPrescription === itemActive
            );
            if (indexUp - 1 >= 0) {
              setItemActive(options[indexUp - 1].idPrescription);
              focusActiveItem();
            }

            break;
          case actionKey.down:
            const indexDown = options.findIndex(
              (i) => i.idPrescription === itemActive
            );
            if (indexDown + 1 < options.length) {
              setItemActive(options[indexDown + 1].idPrescription);
              focusActiveItem();
            }

            break;
          case actionKey.space:
          case actionKey.enter:
            navigateTo(itemActive);

            break;
          default:
            setOpen(false);
            inputRef.current?.focus();
        }
      }
    };

    if (open) {
      window.addEventListener("keydown", handleArrowNav);
    }

    return () => {
      window.removeEventListener("keydown", handleArrowNav);
    };
  }, [open, itemActive, options]);

  useEffect(() => {
    const handleShortcut = (e) => {
      const keyCode = e.keyCode || e.which;

      if (e.ctrlKey) {
        if (keyCode === 75) {
          inputRef.current?.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcut);
    };
  }, []);

  const fetchData = async (value) => {
    setLoading(true);

    const state = store.getState();
    const access_token = state.auth.identify.access_token;
    const { data } = await api.searchPrescriptions(access_token, value);

    setLoading(false);

    if (data.status === "success") {
      setOptions(data.data);
      setOpen(true);

      if (data.data.length) {
        setItemActive(data.data[0].idPrescription);
      }
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
        placeholder={t("layout.iptSearch") + " (Ctrl + k)"}
        size="large"
        onSearch={search}
        id="gtm-search-box"
        type="number"
        loading={loading}
        allowClear
        ref={inputRef}
      />
      <div className={`search-result ${open ? "open" : ""}`}>
        {options.map((option, index) => (
          <div
            onClick={() => navigateTo(option.idPrescription)}
            key={option.idPrescription}
            className={option.idPrescription === itemActive ? "active" : ""}
            onMouseEnter={() => setItemActive(option.idPrescription)}
            data-id={option.idPrescription}
            tabIndex={index}
          >
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
