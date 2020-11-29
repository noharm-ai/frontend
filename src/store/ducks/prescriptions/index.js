import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  prescriptionsFetchListStart: [''],
  prescriptionsFetchListError: ['error'],
  prescriptionsFetchListSuccess: ['list'],

  prescriptionsFetchSingleStart: [''],
  prescriptionsFetchSingleError: ['error'],
  prescriptionsFetchSingleSuccess: ['data'],

  prescriptionsCheckStart: ['idPrescription'],
  prescriptionsCheckError: ['error'],
  prescriptionsCheckSuccess: ['success'],

  prescriptionsSaveStart: [''],
  prescriptionsSaveError: ['error'],
  prescriptionsSaveSuccess: ['data', 'success'],
  prescriptionsSaveReset: [''],

  prescriptionDrugCheckStart: ['idPrescriptionDrug'],
  prescriptionDrugCheckError: ['error'],
  prescriptionDrugCheckSuccess: ['success'],

  prescriptionsUpdateListStatus: ['data'],

  prescriptionsUpdateIntervention: ['idPrescriptionDrug', 'source', 'intervention'],

  prescriptionsUpdatePrescriptionDrug: ['idPrescriptionDrug', 'source', 'data'],

  prescriptionInterventionCheckStart: ['id'],
  prescriptionInterventionCheckError: ['error'],
  prescriptionInterventionCheckSuccess: ['success'],

  prescriptionsFetchPeriodStart: [''],
  prescriptionsFetchPeriodError: ['error'],
  prescriptionsFetchPeriodSuccess: ['idPrescriptionDrug', 'source', 'data'],

  prescriptionsFetchExamsStart: [''],
  prescriptionsFetchExamsError: ['error'],
  prescriptionsFetchExamsSuccess: ['list']
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  single: {
    error: null,
    isFetching: true,
    isSaving: false,
    success: false,
    check: {
      error: null,
      success: {},
      isChecking: false,
      idPrescription: null,
      checkedPrescriptions: []
    },
    checkPrescriptionDrug: {
      error: null,
      success: {},
      isChecking: false,
      idPrescriptionDrug: null
    },
    checkIntervention: {
      error: null,
      success: {},
      isChecking: false,
      currentId: null
    },
    period: {
      error: null,
      isFetching: false
    },
    exams: {
      isFetching: true,
      error: null,
      list: []
    },
    data: {}
  }
};

const fetchListStart = (state = INITIAL_STATE) => ({
  ...state,
  isFetching: true
});

const fetchListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  error,
  isFetching: false
});

const fetchListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  list,
  error: null,
  isFetching: false
});

const fetchSingleStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isFetching: true
  }
});

const fetchSingleError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    error,
    isFetching: false
  }
});

const fetchSingleSuccess = (state = INITIAL_STATE, { data }) => ({
  ...state,
  single: {
    ...state.single,
    data,
    error: null,
    isFetching: false
  }
});

const checkStart = (state = INITIAL_STATE, { idPrescription }) => ({
  ...state,
  single: {
    ...state.single,
    check: {
      ...state.single.check,
      isChecking: true,
      idPrescription
    }
  }
});

const checkError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    check: {
      ...state.single.check,
      isChecking: false,
      error
    }
  }
});

const checkSuccess = (state = INITIAL_STATE, { success }) => {
  const list = [...state.list];
  const prescriptionIndex = list.findIndex(item => item.idPrescription === success.id);

  if (list.length > 0) {
    list[prescriptionIndex].status = success.newStatus;
  }

  const headers = [];
  Object.keys(state.single.data.headers).forEach(p => {
    headers[p] = { ...state.single.data.headers[p], status: success.newStatus };
  });

  return {
    ...state,
    list,
    single: {
      ...state.single,
      check: {
        ...state.single.check,
        error: null,
        isChecking: false,
        checkedPrescriptions: [...state.single.check.checkedPrescriptions, success.id],
        success
      },
      data: {
        ...state.single.data,
        headers,
        status: success.newStatus
      }
    }
  };
};

const saveStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: true
  }
});

const saveError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: false,
    error
  }
});

const saveSuccess = (state = INITIAL_STATE, { data, success }) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: false,
    error: null,
    success,
    data: {
      ...state.single.data,
      ...data
    }
  }
});

const saveReset = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    isSaving: false,
    error: null,
    success: false
  }
});

const updateListStatus = (state = INITIAL_STATE, { data }) => {
  const list = [...state.list];

  // TODO: perfomance?
  data.forEach(st => {
    const prescriptionIndex = list.findIndex(item => item.idPrescription === st.idPrescription);

    if (prescriptionIndex !== -1) {
      delete st.namePatient;
      list[prescriptionIndex] = { ...list[prescriptionIndex], ...st };
    }
  });

  return {
    ...state,
    list
  };
};

const checkPrescriptionDrugStart = (state = INITIAL_STATE, { idPrescriptionDrug }) => ({
  ...state,
  single: {
    ...state.single,
    checkPrescriptionDrug: {
      ...state.single.checkPrescriptionDrug,
      isChecking: true,
      idPrescriptionDrug
    }
  }
});

const checkPrescriptionDrugError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    checkPrescriptionDrug: {
      ...state.single.checkPrescriptionDrug,
      isChecking: false,
      error
    }
  }
});

const checkPrescriptionDrugSuccess = (state = INITIAL_STATE, { success }) => {
  const prescriptions = [...state.single.data.prescription];
  const solutions = [...state.single.data.solution];
  const procedures = [...state.single.data.procedures];

  const updateStatus = (list, id, newStatus) => {
    const index = list.findIndex(item => item.idPrescriptionDrug === id);
    list[index].status = newStatus;
  };

  switch (success.type) {
    case 'prescriptions':
    case 'Medicamentos':
      updateStatus(prescriptions, success.id, success.newStatus);
      break;
    case 'solutions':
    case 'Soluções':
      updateStatus(solutions, success.id, success.newStatus);
      break;
    case 'procedures':
    case 'Procedimentos':
      updateStatus(procedures, success.id, success.newStatus);
      break;
    default:
      break;
  }

  return {
    ...state,
    single: {
      ...state.single,
      checkPrescriptionDrug: {
        ...state.single.checkPrescriptionDrug,
        error: null,
        isChecking: false,
        success
      },
      data: {
        ...state.single.data,
        prescription: prescriptions,
        solution: solutions,
        procedures
      }
    }
  };
};

const checkInterventionStart = (state = INITIAL_STATE, { id }) => ({
  ...state,
  single: {
    ...state.single,
    checkIntervention: {
      ...state.single.checkIntervention,
      isChecking: true,
      currentId: id
    }
  }
});

const checkInterventionError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    checkIntervention: {
      ...state.single.checkIntervention,
      isChecking: false,
      error
    }
  }
});

const checkInterventionSuccess = (state = INITIAL_STATE, { success }) => {
  const interventions = [...state.single.data.interventions];
  const prescriptions = [...state.single.data.prescription];
  const solutions = [...state.single.data.solution];
  const procedures = [...state.single.data.procedures];

  const index = interventions.findIndex(item => item.id === success.id);
  interventions[index].status = success.newStatus;

  const updatePrevIntervention = (list, id, newStatus) => {
    const index = list.findIndex(item => item.prevIntervention.id === id);
    if (index !== -1) {
      list[index].prevIntervention.status = newStatus;
    }
  };

  updatePrevIntervention(prescriptions, success.id, success.newStatus);
  updatePrevIntervention(solutions, success.id, success.newStatus);
  updatePrevIntervention(procedures, success.id, success.newStatus);

  return {
    ...state,
    single: {
      ...state.single,
      checkIntervention: {
        ...state.single.checkIntervention,
        error: null,
        isChecking: false,
        success
      },
      data: {
        ...state.single.data,
        interventions,
        prescription: prescriptions,
        solution: solutions,
        procedures
      }
    }
  };
};

const updatePrescriptionDrugData = (
  state = INITIAL_STATE,
  { idPrescriptionDrug, source, data }
) => {
  const prescriptions = [...state.single.data.prescription];
  const solutions = [...state.single.data.solution];
  const procedures = [...state.single.data.procedures];

  const updateData = (list, idPrescriptionDrug, newData) => {
    const index = list.findIndex(item => item.idPrescriptionDrug === idPrescriptionDrug);
    list[index] = newData;
  };

  // TODO: rever este tipo
  switch (source) {
    case 'prescriptions':
    case 'Medicamentos':
      updateData(prescriptions, idPrescriptionDrug, data);
      break;
    case 'solutions':
    case 'Soluções':
      updateData(solutions, idPrescriptionDrug, data);
      break;
    default:
      updateData(procedures, idPrescriptionDrug, data);
      break;
  }

  return {
    ...state,
    single: {
      ...state.single,
      data: {
        ...state.single.data,
        prescription: prescriptions,
        solution: solutions,
        procedures
      }
    }
  };
};

const updateInterventionData = (
  state = INITIAL_STATE,
  { idPrescriptionDrug, source, intervention }
) => {
  const prescriptions = [...state.single.data.prescription];
  const solutions = [...state.single.data.solution];
  const procedures = [...state.single.data.procedures];

  const updateData = (list, idPrescriptionDrug, newData) => {
    const index = list.findIndex(item => item.idPrescriptionDrug === idPrescriptionDrug);
    list[index].intervention = newData;
    list[index].status = 's';
  };

  // TODO: rever este tipo
  switch (source) {
    case 'Medicamentos':
      updateData(prescriptions, idPrescriptionDrug, intervention);
      break;
    case 'Soluções':
      updateData(solutions, idPrescriptionDrug, intervention);
      break;
    default:
      updateData(procedures, idPrescriptionDrug, intervention);
      break;
  }

  return {
    ...state,
    single: {
      ...state.single,
      data: {
        ...state.single.data,
        prescription: prescriptions,
        solution: solutions,
        procedures
      }
    }
  };
};

const fetchPeriodStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    period: {
      ...state.single.period,
      isFetching: true
    }
  }
});

const fetchPeriodError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    period: {
      ...state.single.period,
      error,
      isFetching: false
    }
  }
});

const fetchPeriodSuccess = (state = INITIAL_STATE, { idPrescriptionDrug, source, data }) => {
  const prescriptions = [...state.single.data.prescription];
  const solutions = [...state.single.data.solution];
  const procedures = [...state.single.data.procedures];

  const updateData = (list, idPrescriptionDrug, newData) => {
    const index = list.findIndex(item => item.idPrescriptionDrug === idPrescriptionDrug);
    list[index].periodDates = newData;
  };

  // TODO: rever este tipo
  switch (source) {
    case 'Medicamentos':
      updateData(prescriptions, idPrescriptionDrug, data);
      break;
    case 'Soluções':
      updateData(solutions, idPrescriptionDrug, data);
      break;
    default:
      updateData(procedures, idPrescriptionDrug, data);
      break;
  }

  return {
    ...state,
    single: {
      ...state.single,
      period: {
        ...state.single.period,
        error: null,
        isFetching: false
      },
      data: {
        ...state.single.data,
        prescription: prescriptions,
        solution: solutions,
        procedures
      }
    }
  };
};

const fetchExamsStart = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...state.single,
    exams: {
      ...state.single.exams,
      isFetching: true
    }
  }
});

const fetchExamsError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  single: {
    ...state.single,
    exams: {
      ...state.single.exams,
      isFetching: false,
      error
    }
  }
});

const fetchExamsSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  single: {
    ...state.single,
    exams: {
      ...state.single.exams,
      isFetching: false,
      error: null,
      list
    }
  }
});

const HANDLERS = {
  [Types.PRESCRIPTIONS_FETCH_LIST_START]: fetchListStart,
  [Types.PRESCRIPTIONS_FETCH_LIST_ERROR]: fetchListError,
  [Types.PRESCRIPTIONS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.PRESCRIPTIONS_FETCH_SINGLE_START]: fetchSingleStart,
  [Types.PRESCRIPTIONS_FETCH_SINGLE_ERROR]: fetchSingleError,
  [Types.PRESCRIPTIONS_FETCH_SINGLE_SUCCESS]: fetchSingleSuccess,

  [Types.PRESCRIPTIONS_CHECK_START]: checkStart,
  [Types.PRESCRIPTIONS_CHECK_ERROR]: checkError,
  [Types.PRESCRIPTIONS_CHECK_SUCCESS]: checkSuccess,

  [Types.PRESCRIPTIONS_SAVE_START]: saveStart,
  [Types.PRESCRIPTIONS_SAVE_ERROR]: saveError,
  [Types.PRESCRIPTIONS_SAVE_SUCCESS]: saveSuccess,
  [Types.PRESCRIPTIONS_SAVE_RESET]: saveReset,

  [Types.PRESCRIPTION_DRUG_CHECK_START]: checkPrescriptionDrugStart,
  [Types.PRESCRIPTION_DRUG_CHECK_ERROR]: checkPrescriptionDrugError,
  [Types.PRESCRIPTION_DRUG_CHECK_SUCCESS]: checkPrescriptionDrugSuccess,

  [Types.PRESCRIPTIONS_UPDATE_LIST_STATUS]: updateListStatus,

  [Types.PRESCRIPTIONS_UPDATE_INTERVENTION]: updateInterventionData,
  [Types.PRESCRIPTIONS_UPDATE_PRESCRIPTION_DRUG]: updatePrescriptionDrugData,

  [Types.PRESCRIPTION_INTERVENTION_CHECK_START]: checkInterventionStart,
  [Types.PRESCRIPTION_INTERVENTION_CHECK_ERROR]: checkInterventionError,
  [Types.PRESCRIPTION_INTERVENTION_CHECK_SUCCESS]: checkInterventionSuccess,

  [Types.PRESCRIPTIONS_FETCH_PERIOD_START]: fetchPeriodStart,
  [Types.PRESCRIPTIONS_FETCH_PERIOD_ERROR]: fetchPeriodError,
  [Types.PRESCRIPTIONS_FETCH_PERIOD_SUCCESS]: fetchPeriodSuccess,

  [Types.PRESCRIPTIONS_FETCH_EXAMS_START]: fetchExamsStart,
  [Types.PRESCRIPTIONS_FETCH_EXAMS_ERROR]: fetchExamsError,
  [Types.PRESCRIPTIONS_FETCH_EXAMS_SUCCESS]: fetchExamsSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
