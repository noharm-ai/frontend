import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import {
  selectPrescriptionDrugThunk,
  savePrescriptionDrugThunk,
  savePrescriptionDrugNoteThunk,
  suspendPrescriptionDrugThunk,
  copyPrescriptionDrugThunk,
} from "store/ducks/prescriptionDrugs/thunk";
import { searchDrugs, fetchDrugResources } from "features/drugs/DrugsSlice";

import PrescriptionDrug from "components/Forms/PrescriptionDrug";

const mapStateToProps = ({ prescriptionDrugs, drugs }) => ({
  isSaving: prescriptionDrugs.single.isSaving,
  success: prescriptionDrugs.single.success,
  error: prescriptionDrugs.single.error,
  item: prescriptionDrugs.single.item,
  drugs: drugs.search,
  drugSummary: drugs.summary,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      select: selectPrescriptionDrugThunk,
      save: savePrescriptionDrugThunk,
      saveNotes: savePrescriptionDrugNoteThunk,
      copy: copyPrescriptionDrugThunk,
      suspend: suspendPrescriptionDrugThunk,
      searchDrugs: (idSegment, params) => searchDrugs({ idSegment, params }),
      fetchDrugSummary: (idDrug, idSegment, idHospital) =>
        fetchDrugResources({ idDrug, idSegment, idHospital }),
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PrescriptionDrug);
