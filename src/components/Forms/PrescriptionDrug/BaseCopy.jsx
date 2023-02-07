import "styled-components/macro";
import React, { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import { useTranslation } from "react-i18next";

import LoadBox, { LoadContainer } from "components/LoadBox";
import { Checkbox } from "components/Inputs";
import Empty from "components/Empty";
import { store } from "store/index";
import api from "services/api";
import { Box, FieldError, CheckboxContainer } from "../Form.style";

export default function BaseNotes({ item }) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const { t } = useTranslation();
  const { values, setFieldValue, errors, touched } = useFormikContext();
  const { selectedDrugs, idPrescription } = values;

  useEffect(() => {
    const state = store.getState();
    const access_token = state.auth.identify.access_token;
    api
      .getPrescriptionMissingDrugs(access_token, idPrescription)
      .then((response) => {
        setLoading(false);

        setOptions(
          response.data.data.map((i) => {
            return { label: i.name, idDrug: i.idDrug };
          })
        );
      });
  }, [idPrescription]);

  const onChange = (idDrug, checked) => {
    const drugs = new Set(selectedDrugs);

    if (checked) {
      drugs.add(idDrug);
    } else {
      drugs.delete(idDrug);
    }

    setFieldValue("selectedDrugs", [...drugs]);
  };

  if (loading) {
    return (
      <LoadContainer>
        <LoadBox />
      </LoadContainer>
    );
  }

  return (
    <>
      <Box hasError={errors.selectedDrugs && touched.selectedDrugs}>
        <CheckboxContainer>
          <label className="checkbox-container__label">
            Selecione os medicamentos que deseja incluir nesta prescrição:
          </label>
          {options.map((o) => (
            <div className="checkbox-container__item">
              <Checkbox onChange={(e) => onChange(o.idDrug, e.target.checked)}>
                {o.label}
              </Checkbox>
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
        </CheckboxContainer>
        {errors.selectedDrugs && touched.selectedDrugs && (
          <FieldError>{errors.selectedDrugs}</FieldError>
        )}
      </Box>
    </>
  );
}
