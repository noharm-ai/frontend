import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  ReloadOutlined,
  RetweetOutlined,
  RobotOutlined,
  PlusOutlined,
  DownOutlined,
  AlertOutlined,
} from "@ant-design/icons";

import Dropdown from "components/Dropdown";
import Button from "components/Button";
import DefaultModal from "components/Modal";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

import { addDefaultUnits, addNewOutlier } from "../DrugAttributesSlice";
import CopyConversion from "../CopyConversion/CopyConversion";
import CopyAttributes from "../CopyAttributes/CopyAttributes";
import PredictSubstances from "../PredictSubstances/PredictSubstances";
import { CalculateDoseMaxDialog } from "../CalculateDoseMax/CalculateDoseMax";

export default function Actions({ reload }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [predictSubstancesVisibile, setPredictSubstancesVisible] =
    useState(false);
  const [copyConversionVisible, setCopyConversionVisible] = useState(false);
  const [copyAttributesVisible, setCopyAttributesVisible] = useState(false);
  const [calcDosemaxVisible, setCalcDosemaxVisible] = useState(false);
  const isAddingDefaultUnits =
    useSelector(
      (state) => state.admin.drugAttributes.addDefaultUnits.status
    ) === "loading";
  const isCopyingConversion =
    useSelector((state) => state.admin.drugAttributes.copyConversion.status) ===
    "loading";
  const isCopyingAttributes =
    useSelector((state) => state.admin.drugAttributes.copyAttributes.status) ===
    "loading";
  const isAddingNewOutliers =
    useSelector((state) => state.admin.drugAttributes.addNewOutlier.status) ===
    "loading";
  const isCalculatingDosemax =
    useSelector(
      (state) => state.admin.drugAttributes.calculateDosemax.status
    ) === "loading";

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
          <p>
            Esta ação também ajusta inconsistências entre as tabelas{" "}
            <strong>outlier - medatributos - medicamento</strong>.
          </p>
        </>
      ),
      onOk: executeAddDefaultUnits,
      okText: "Confirmar",
      cancelText: "Cancelar",
      width: 500,
    });
  };

  const showNewOutlierDialog = () => {
    DefaultModal.confirm({
      title: "Confirma a inclusão de novos medicamentos?",
      content: (
        <>
          <p>
            Esta operação busca novos medicamentos prescritos nos últimos 5 dias
            e cria os registros necessários para iniciar a curadoria destes
            itens.
          </p>
          <p>
            Após adicionar estes novos medicamentos, é recomendado utilizar a
            funcionalidade <strong>Atualizar Unidade Padrão</strong> e{" "}
            <strong>Inferir Substâncias</strong>.
          </p>
        </>
      ),
      onOk: executeAddNewOutlier,
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

  const executeAddNewOutlier = () => {
    dispatch(addNewOutlier()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        notification.success({
          message: "Novos medicamentos criados!",
          description: `${response.payload.data.data} medicamentos`,
        });

        reload();
      }
    });
  };

  const getActions = () => {
    const items = [
      {
        key: "updateDefaultMeasureUnit",
        label: "Atualizar unidade padrão",
        icon: <ReloadOutlined />,
      },
      {
        key: "calculateDosemax",
        label: "Calcular dose máxima",
        icon: <AlertOutlined />,
      },
      {
        key: "copyConversions",
        label: "Copiar conversões",
        icon: <RetweetOutlined />,
      },
      {
        key: "copyAttributes",
        label: "Copiar atributos",
        icon: <RetweetOutlined />,
      },
      {
        key: "inferSubstance",
        label: "Inferir substâncias",
        icon: <RobotOutlined />,
      },
      {
        key: "newDrugs",
        label: "Novos medicamentos",
        icon: <PlusOutlined />,
      },
    ];

    return items;
  };

  const handleActions = (item) => {
    switch (item.key) {
      case "inferSubstance":
        setPredictSubstancesVisible(true);
        break;

      case "updateDefaultMeasureUnit":
        showDefaultUnitDialog();
        break;

      case "newDrugs":
        showNewOutlierDialog();
        break;

      case "copyConversions":
        setCopyConversionVisible(true);
        break;

      case "copyAttributes":
        setCopyAttributesVisible(true);
        break;

      case "calculateDosemax":
        setCalcDosemaxVisible(true);
        break;

      default:
        console.log("invalid action");
    }
  };

  return (
    <>
      <Dropdown
        menu={{ items: getActions(), onClick: handleActions }}
        trigger={["click"]}
      >
        <Button
          type="primary"
          icon={<DownOutlined />}
          iconPosition="end"
          loading={
            isAddingDefaultUnits ||
            isCopyingAttributes ||
            isCopyingConversion ||
            isAddingDefaultUnits ||
            isAddingNewOutliers ||
            isCalculatingDosemax
          }
        >
          Ações
        </Button>
      </Dropdown>

      <CopyConversion
        open={copyConversionVisible}
        setOpen={setCopyConversionVisible}
        reload={reload}
      />

      <CopyAttributes
        open={copyAttributesVisible}
        setOpen={setCopyAttributesVisible}
        reload={reload}
      />

      <PredictSubstances
        open={predictSubstancesVisibile}
        setOpen={setPredictSubstancesVisible}
        reload={reload}
      />

      <CalculateDoseMaxDialog
        open={calcDosemaxVisible}
        setOpen={setCalcDosemaxVisible}
        reload={reload}
      />
    </>
  );
}
