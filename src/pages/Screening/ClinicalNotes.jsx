import React, { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { useParams } from "react-router-dom";

import ClinicalNotes from "containers/Screening/ClinicalNotes";
import { fetchClinicalNotesListThunk } from "store/ducks/clinicalNotes/thunk";

function ClinicalNotesPage({ fetchClinicalNotes }) {
  const params = useParams();
  const admissionNumber = params?.admissionNumber;

  useEffect(() => {
    if (admissionNumber) {
      fetchClinicalNotes(admissionNumber);
    }
  }, [fetchClinicalNotes, admissionNumber]);

  return <ClinicalNotes popup admissionNumberPopup={admissionNumber} />;
}

const mapStateToProps = () => ({});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchClinicalNotes: fetchClinicalNotesListThunk,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ClinicalNotesPage);
