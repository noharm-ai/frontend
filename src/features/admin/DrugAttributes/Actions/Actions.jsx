import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { ReloadOutlined, RetweetOutlined } from "@ant-design/icons";

import Button from "components/Button";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { addDefaultUnits } from "../DrugAttributesSlice";
import CopyConversion from "../CopyConversion/CopyConversion";

export default function Actions({ reload }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [copyConversionVisible, setCopyConversionVisible] = useState(false);
  const isAddingDefaultUnits =
    useSelector(
      (state) => state.admin.drugAttributes.addDefaultUnits.status
    ) === "loading";
  const isCopyingConversion =
    useSelector((state) => state.admin.drugAttributes.copyConversion.status) ===
    "loading";

  const showDefaultUnitDialog = () => {
    DefaultModal.confirm({
      title: "Confirma a atualização de unidade padrão?",
      content: (
        <>
          <p>
            Esta operação atualizará a <strong>Unidade Padrão</strong> de todos
            medicamentos sem unidade padrão definida e que tiverem somente uma
            unidade de medida no histórico de prescrição (prescricaoagg).
          </p>
          <p>
            Os medicamentos que não forem atualizados posssuem mais de uma
            unidade de medida no histórico de prescrição ou nunca foram
            prescritos.
          </p>
        </>
      ),
      onOk: executeAddDefaultUnits,
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  const executeAddDefaultUnits = () => {
    dispatch(addDefaultUnits()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Unidades Padrão Atualizadas!",
          description: `${response.payload.data.data} medicamentos atualizados`,
        });

        reload();
      }
    });
  };

  return (
    <>
      <Button
        type="primary"
        icon={<ReloadOutlined />}
        loading={isAddingDefaultUnits}
        onClick={() => showDefaultUnitDialog()}
      >
        Atualizar Unidade Padrão
      </Button>

      <Button
        type="primary"
        icon={<RetweetOutlined />}
        loading={isCopyingConversion}
        onClick={() => setCopyConversionVisible(true)}
      >
        Copiar Conversões
      </Button>

      <CopyConversion
        open={copyConversionVisible}
        setOpen={setCopyConversionVisible}
        reload={reload}
      />
    </>
  );
}
