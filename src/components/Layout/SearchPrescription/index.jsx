import React, { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

import { InputSearchNumber } from "components/Inputs";
import notification from "components/notification";
import Tag from "components/Tag";
import Empty from "components/Empty";
import { formatAge } from "utils/transformers/utils";
import { useOutsideAlerter } from "lib/hooks";

import { searchPrescriptions } from "features/lists/ListsSlice";

import { SearchPrescriptionContainer } from "./index.style";

export default function SearchPrescription({ type, size }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setOpen(false);
  });
  const navigateTo = useCallback(
    (idPrescription, admissionNumber, concilia) => {
      setOpen(false);
      if (type === "summary") {
        window.open(`/sumario-alta/${admissionNumber}`);
      } else {
        if (concilia) {
          window.open(`/conciliacao/${idPrescription}`);
        } else {
          window.open(`/prescricao/${idPrescription}`);
        }
      }
    },
    [type]
  );

  const [open, setOpen] = useState(false);
  const [itemActive, setItemActive] = useState(null);
  const loadStatus = useSelector(
    (state) => state.lists.searchPrescriptions.status
  );
  const options = useSelector((state) => state.lists.searchPrescriptions.list);

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
            const index = options.findIndex(
              (i) => i.idPrescription === itemActive
            );
            navigateTo(
              options[index].idPrescription,
              options[index].admissionNumber,
              options[index].concilia
            );

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
  }, [open, itemActive, options, navigateTo]);

  useEffect(() => {
    const handleShortcut = (e) => {
      const keyCode = e.keyCode || e.which;

      if (e.ctrlKey || e.metaKey) {
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
    dispatch(searchPrescriptions({ term: value })).then((response) => {
      setOpen(true);

      if (options.length) {
        setItemActive(options[0].idPrescription);
      }
    });
  };

  const search = (value) => {
    if (value.length < 3) return;

    if (value.length > 18) {
      notification.error({ message: "Número inválido." });
      return;
    }

    const reg = /^\d*$/;
    const searchValue = value.trim();

    if (!isNaN(searchValue) && reg.test(searchValue) && searchValue !== "") {
      fetchData(searchValue);
    } else {
      notification.error({ message: "Número inválido." });
    }
  };

  const getDate = (option) => {
    const dtFormat = "dd/MM/yyyy";

    if (option.concilia && option.admissionDate) {
      return format(new Date(option.admissionDate), dtFormat);
    }

    if (option.date) {
      return format(new Date(option.date), dtFormat);
    }

    return "--";
  };

  return (
    <SearchPrescriptionContainer ref={wrapperRef} className={`${type} ${size}`}>
      <InputSearchNumber
        placeholder={t("layout.iptSearch") + " (Ctrl + k)"}
        size="large"
        onSearch={search}
        id="gtm-search-box"
        type="number"
        loading={loadStatus === "loading"}
        allowClear
        ref={inputRef}
      />
      <div className={`search-result ${open ? "open" : ""}`}>
        {options.map((option, index) => (
          <div
            onClick={() =>
              navigateTo(
                option.idPrescription,
                option.admissionNumber,
                option.concilia
              )
            }
            key={option.idPrescription}
            className={option.idPrescription === itemActive ? "active" : ""}
            onMouseEnter={() => setItemActive(option.idPrescription)}
            data-id={option.idPrescription}
            tabIndex={index}
          >
            <div className="search-result-info">
              <div className="search-result-info-primary">
                {option.agg || option.concilia
                  ? `${t(
                      option.concilia
                        ? "labels.conciliation"
                        : "patientCard.admission"
                    )} ${option.admissionNumber}`
                  : `${t("patientCard.prescription")} ${option.idPrescription}`}
                {" - "}
                <span>{getDate(option)}</span>
              </div>
              <div className="search-result-info-secondary">
                {option.birthdate && (
                  <Tag color="#a991d6">{formatAge(option.birthdate)}</Tag>
                )}
                {option.gender && (
                  <Tag color="#a991d6">
                    {option.gender === "M"
                      ? t("patientCard.male")
                      : t("patientCard.female")}
                  </Tag>
                )}
                {option.department && (
                  <Tag color="#a991d6">{option.department}</Tag>
                )}
              </div>
            </div>
            {type !== "summary" && (
              <div>
                {option.status === "s" && <Tag color="green">Checada</Tag>}
                {option.status !== "s" && <Tag color="orange">Pendente</Tag>}
              </div>
            )}
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
