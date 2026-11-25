import { useState } from "react";
import { useTranslation } from "react-i18next";
import { isEmpty } from "lodash";

import Modal from "components/Modal";
import notification from "components/notification";
import { Input } from "components/Inputs";
import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch, useAppSelector } from "store/index";
import { saveFilter, fetchFilter } from "./MemoryFilterSlice";
import type { ISavedFilter } from "./MemoryFilterSlice";

interface IMemoryFilterSaveProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  type: string;
  currentValue: Record<string, unknown>;
}

export function MemoryFilterSave({
  setOpen,
  open,
  type,
  currentValue,
}: IMemoryFilterSaveProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const status = useAppSelector(
    (state) => state.memoryFilter[type]?.status || "idle",
  );
  const [filterName, setFilterName] = useState("");

  const save = () => {
    dispatch(fetchFilter(type)).then((response: unknown) => {
      if (fetchFilter.rejected.match(response)) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else if (fetchFilter.fulfilled.match(response)) {
        const data: ISavedFilter[] = isEmpty(response.payload.data)
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
          }),
        ).then((response: unknown) => {
          if (saveFilter.rejected.match(response)) {
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
      okType="primary"
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
