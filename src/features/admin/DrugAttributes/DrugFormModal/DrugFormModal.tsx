import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";

import DrugAttributesForm from "src/features/drugs/DrugAttributesForm/DrugAttributesForm";

import { setDrugForm } from "../DrugAttributesSlice";

export function DrugFormModal() {
  const dispatch = useAppDispatch();
  const drugFormData: any = useAppSelector(
    (state) => state.admin.drugAttributes.drugForm.data,
  );

  const onCancel = () => {
    dispatch(setDrugForm(null));
  };

  return (
    <DefaultModal
      open={drugFormData !== null}
      width={700}
      centered
      destroyOnHidden
      footer={null}
      onCancel={onCancel}
    >
      <header>
        <div className="modal-title">Atributos: {drugFormData?.name}</div>
      </header>

      {drugFormData && (
        <DrugAttributesForm
          idDrug={drugFormData.idDrug}
          idSegment={drugFormData.idSegment}
        />
      )}
    </DefaultModal>
  );
}
