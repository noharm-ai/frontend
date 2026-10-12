import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "src/store";
import DefaultModal from "components/Modal";
import ClinicalNotes from "components/Screening/ClinicalNotes";
import {
  fetchClinicalNotesListThunk,
  fetchExtraClinicalNotesListThunk,
  selectClinicalNoteThunk,
  updateClinicalNoteThunk,
} from "store/ducks/clinicalNotes/thunk";

interface InfectionControlClinicalNotesProps {
  admissionNumber: number;
  open: boolean;
  onClose: () => void;
}

/**
 * The clinical notes of the admission in a modal, the same view the
 * prescription screen opens
 */
export function InfectionControlClinicalNotes({
  admissionNumber,
  open,
  onClose,
}: InfectionControlClinicalNotesProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  // the clinical notes and user ducks and their thunks are untyped legacy JS,
  // hence the any below
  const clinicalNotes = useAppSelector((state: any) => state.clinicalNotes);
  const account = useAppSelector((state: any) => state.user.account);

  useEffect(() => {
    if (open) {
      dispatch(fetchClinicalNotesListThunk(admissionNumber) as any);
    }
  }, [open, admissionNumber, dispatch]);

  return (
    <DefaultModal
      title={t("tableHeader.clinicalNotes")}
      destroyOnHidden
      open={open}
      onCancel={onClose}
      width="90%"
      footer={null}
      style={{ top: "10px", height: "100vh" }}
      styles={{ body: { padding: 0 } }}
      maskClosable={false}
    >
      <div data-kb="infectionControl.clinicalNotes">
        <ClinicalNotes
          isFetching={clinicalNotes.isFetching}
          isFetchingExtra={clinicalNotes.isFetchingExtra}
          list={clinicalNotes.list}
          dates={clinicalNotes.dates}
          positionList={clinicalNotes.positionList}
          previousAdmissions={clinicalNotes.previousAdmissions}
          selected={clinicalNotes.single}
          saveStatus={clinicalNotes.save}
          userId={account.userId}
          features={account.features}
          admissionNumber={admissionNumber}
          admissionNumberPopup={null}
          popup={false}
          visibleState={open}
          fetchByDate={(...args: any[]) =>
            dispatch((fetchExtraClinicalNotesListThunk as any)(...args))
          }
          select={(...args: any[]) =>
            dispatch((selectClinicalNoteThunk as any)(...args))
          }
          update={(...args: any[]) =>
            dispatch((updateClinicalNoteThunk as any)(...args))
          }
        />
      </div>
    </DefaultModal>
  );
}
