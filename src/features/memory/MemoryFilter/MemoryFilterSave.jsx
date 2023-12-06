import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import isEmpty from "lodash.isempty";

import Modal from "components/Modal";
import notification from "components/notification";
import { Input } from "components/Inputs";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { saveFilter, fetchFilter } from "./MemoryFilterSlice";

export default function MemoryFilterSave({
  setOpen,
  open,
  type,
  currentValue,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const status = useSelector(
    (state) => state.memoryFilter[type]?.status || "idle"
  );
  const [filterName, setFilterName] = useState("");

  const save = () => {
    dispatch(fetchFilter(type)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        const data = isEmpty(response.payload.data)
          ? []
          : [...response.payload.data[0].value];
        data.push({
          name: filterName,
          data: currentValue,
          active: true,
        });

        dispatch(
          saveFilter({
            type,
            value: data,
          })
        ).then((response) => {
          if (response.error) {
            notification.error({
              message: getErrorMessage(response, t),
            });
          } else {
            setOpen(false);
            setFilterName("");
            notification.success({
              message: t("success.generic"),
            });
          }
        });
      }
    });
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      onOk={() => save()}
      okButtonProps={{
        disabled: filterName === "",
      }}
      okText="Salvar"
      okType="primary gtm-bt-save-filter"
      cancelText="Cancelar"
      confirmLoading={status === "loading"}
    >
      <Form>
        <div className={`form-row`}>
          <div className="form-label">
            <label>Nome do filtro:</label>
          </div>
          <div className="form-input">
            <Input
              onChange={({ target }) => setFilterName(target.value)}
              value={filterName}
            />
          </div>
        </div>
      </Form>
    </Modal>
  );
}
