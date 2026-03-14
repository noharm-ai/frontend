import { useTranslation } from "react-i18next";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import { useAppDispatch, useAppSelector } from "store/index";
import {
  removeOutlier,
  setDrugRemoveOutlierOpen,
} from "./DrugRemoveOutlierSlice";

interface DrugRemoveOutlierProps {
  onAfterSave?: () => void;
}

export function DrugRemoveOutlier({ onAfterSave }: DrugRemoveOutlierProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.drugRemoveOutlier.open);
  const idSegment = useAppSelector(
    (state) => state.drugRemoveOutlier.idSegment,
  );
  const idDrug = useAppSelector((state) => state.drugRemoveOutlier.idDrug);
  const status = useAppSelector((state) => state.drugRemoveOutlier.status);

  const isLoading = status === "loading";

  const onClose = () => {
    dispatch(setDrugRemoveOutlierOpen({ open: false }));
  };

  const onConfirm = () => {
    if (!idSegment || !idDrug) return;

    dispatch(removeOutlier({ idSegment, idDrug })).then((response: any) => {
      if (response.error) {
        notification.error({ message: getErrorMessage(response, t) });
      } else {
        notification.success({
          message: "Outlier removido com sucesso!",
        });
        onAfterSave?.();
        onClose();
      }
    });
  };

  return (
    <DefaultModal
      open={open}
      width={500}
      centered
      destroyOnHidden
      onCancel={onClose}
      onOk={onConfirm}
      okText="Confirmar"
      cancelText={t("actions.close")}
      confirmLoading={isLoading}
      okButtonProps={{ loading: isLoading }}
      cancelButtonProps={{ loading: isLoading }}
      maskClosable={false}
      closable={false}
    >
      <header>
        <Heading style={{ fontSize: "20px" }}>Remover Outlier</Heading>
      </header>

      <>
        <p>Confirma a remoção deste registro?</p>
        <p>
          Esta ação remove apenas o registro de escore deste medicamento. Desta
          forma, ele não aparecerá na lista da curadoria.
        </p>
      </>
    </DefaultModal>
  );
}
