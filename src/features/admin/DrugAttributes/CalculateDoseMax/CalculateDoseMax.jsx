import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Result } from "antd";

import notification from "components/notification";
import Heading from "components/Heading";
import DefaultModal from "components/Modal";

import { Form } from "styles/Form.style";
import { getErrorMessage } from "utils/errorHandler";

import { calculateDosemax } from "../DrugAttributesSlice";

export function CalculateDoseMaxDialog({ open, setOpen, reload, ...props }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector(
    (state) => state.admin.drugAttributes.calculateDosemax.status
  );
  const [calcResult, setCalcResult] = useState(null);

  const onSave = (params) => {
    dispatch(calculateDosemax(params)).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        setCalcResult(response.payload.data.data);
        reload();

        notification.success({
          message: "Cálculo finalizado!",
        });
      }
    });
  };

  const onCancel = () => {
    setOpen(false);
    setCalcResult(null);
  };

  return (
    <DefaultModal
      open={open}
      width={500}
      centered
      destroyOnClose
      onCancel={onCancel}
      onOk={onSave}
      okText="Calcular"
      cancelText={t("actions.cancel")}
      confirmLoading={status === "loading"}
      okButtonProps={{
        disabled: status === "loading" || calcResult,
      }}
      cancelButtonProps={{
        disabled: status === "loading",
      }}
      {...props}
    >
      <header>
        <Heading margin="0 0 11px">Calcular Dose Máxima</Heading>
      </header>

      {calcResult ? (
        <Result
          status="success"
          title="Cálculo Finalizado"
          subTitle={
            <p>
              Referências criadas/atualizadas: {calcResult?.converted}
              <br />
              Conversões pendentes: {calcResult?.notConverted}
              <br />
              Não possui dose de referência: {calcResult?.noReference}
              <br />
              Doses máximas atualizadas: {calcResult?.updated}
            </p>
          }
        ></Result>
      ) : (
        <Form>
          <p>
            Esta ação calcula as doses máximas dos medicamentos com base na
            curadoria de substâncias.
          </p>
          <p>
            Os valores de dose máxima só serão aplicados para os medicamentos
            onde a dose máxima estiver vazia ou tenha sido definida pela
            curadoria NoHarm. Caso contrário, o valor calculado é gravado para
            ser revisado.
          </p>

          <p>Requisitos:</p>
          <ul>
            <li>Definir tipos dos segmentos (Adulto ou Pediátrico);</li>
            <li>Configurar unidades de medida;</li>
            <li>Atribuir substâncias aos medicamentos.</li>
          </ul>
        </Form>
      )}
    </DefaultModal>
  );
}
