import { createActions, createReducer } from 'reduxsauce';
import { sourceToStoreType } from '@utils/transformers/prescriptions';

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

  prescriptionDrugCheckStart: ['idPrescriptionDrug', 'source'],
  prescriptionDrugCheckError: ['error', 'source'],
  prescriptionDrugCheckSuccess: ['success', 'source'],

  prescriptionsUpdateListStatus: ['data'],

  prescriptionsUpdateIntervention: ['idPrescriptionDrug', 'source', 'intervention'],

  prescriptionsUpdatePrescriptionDrug: ['idPrescriptionDrug', 'source', 'data'],

  prescriptionInterventionCheckStart: ['id', 'source'],
  prescriptionInterventionCheckError: ['error', 'source'],
  prescriptionInterventionCheckSuccess: ['success', 'source'],

  prescriptionsFetchPeriodStart: ['source'],
  prescriptionsFetchPeriodError: ['error', 'source'],
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
    exams: {
      isFetching: true,
      error: null,
      list: []
    },
    data: {},
    patient: {
      list: [],
      checkPrescriptionDrug: {
        error: null,
        success: {},
        isChecking: false,
        idPrescriptionDrug: null
      }
    },
    prescription: {
      list: [],
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
      }
    },
    solution: {
      list: [],
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
      }
    },
    procedure: {
      list: [],
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
      }
    },
    diet: {
      list: [],
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
      }
    },
    intervention: {
      list: [],
      checkIntervention: {
        error: null,
        success: {},
        isChecking: false,
        currentId: null
      }
    }
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

const fetchSingleSuccess = (state = INITIAL_STATE, { data }) => {
  const { prescription, solution, procedures, diet, interventions, ...cleanData } = data;

  return {
    ...state,
    single: {
      ...state.single,
      data: cleanData,
      error: null,
      isFetching: false,
      intervention: {
        ...state.single.prescription,
        list: interventions
      },
      prescription: {
        ...state.single.prescription,
        list: prescription
      },
      solution: {
        ...state.single.solution,
        list: solution
      },
      procedure: {
        ...state.single.procedure,
        list: procedures
      },
      diet: {
        ...state.single.diet,
        list: diet
      }
    }
  };
};

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
  let prescriptionStatus = success.newStatus;

  if (list.length > 0) {
    list[prescriptionIndex].status = success.newStatus;
  }

  const headers = [];
  if (state.single.data.headers) {
    let allChecked = true;

    if (state.single.data.headers[success.id]) {
      Object.keys(state.single.data.headers).forEach(p => {
        headers[p] = { ...state.single.data.headers[p] };
        if (p === success.id) {
          headers[p].status = success.newStatus;
        }

        if (headers[p].status !== 's') {
          allChecked = false;
        }
      });

      prescriptionStatus = allChecked ? 's' : '0';
    } else {
      Object.keys(state.single.data.headers).forEach(p => {
        headers[p] = { ...state.single.data.headers[p], status: success.newStatus };
      });
    }
  }

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
        status: prescriptionStatus
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

const checkPrescriptionDrugStart = (state = INITIAL_STATE, { idPrescriptionDrug, source }) => ({
  ...state,
  single: {
    ...state.single,
    [source]: {
      ...state.single[source],
      checkPrescriptionDrug: {
        ...state.single.checkPrescriptionDrug,
        isChecking: true,
        idPrescriptionDrug
      }
    }
  }
});

const checkPrescriptionDrugError = (state = INITIAL_STATE, { error, source }) => ({
  ...state,
  single: {
    ...state.single,
    [source]: {
      ...state.single[source],
      checkPrescriptionDrug: {
        ...state.single.checkPrescriptionDrug,
        isChecking: false,
        error
      }
    }
  }
});

const checkPrescriptionDrugSuccess = (state = INITIAL_STATE, { success, source }) => {
  if (success.id === '0') {
    return {
      ...state,
      single: {
        ...state.single,
        data: {
          ...state.single.data,
          intervention: {
            ...state.single.data.intervention,
            status: success.status
          }
        },
        patient: {
          ...state.single.patient,
          checkPrescriptionDrug: {
            ...state.single.patient.checkPrescriptionDrug,
            error: null,
            isChecking: false,
            success
          }
        }
      }
    };
  }

  const prescriptions = [...state.single.prescription.list];
  const solutions = [...state.single.solution.list];
  const procedures = [...state.single.procedure.list];
  const diet = [...state.single.diet.list];

  const updateStatus = (list, id, newStatus) => {
    for (let i = 0; i < list.length; i++) {
      const group = list[i];
      const index = group.value.findIndex(item => item.idPrescriptionDrug === id);

      if (index !== -1) {
        group.value[index].intervention.status = newStatus;
        // deprecated
        group.value[index].status = newStatus;
        break;
      }
    }
  };

  const getUpdatedState = (storeType, list) => ({
    ...state,
    single: {
      ...state.single,

      [storeType]: {
        ...state.single[storeType],
        list: list,
        checkPrescriptionDrug: {
          ...state.single[storeType].checkPrescriptionDrug,
          error: null,
          isChecking: false,
          success
        }
      }
    }
  });

  switch (sourceToStoreType(success.type)) {
    case 'prescription':
      updateStatus(prescriptions, success.id, success.newStatus);
      return getUpdatedState(sourceToStoreType(success.type), prescriptions);
    case 'solution':
      updateStatus(solutions, success.id, success.newStatus);
      return getUpdatedState(sourceToStoreType(success.type), solutions);
    case 'procedure':
      updateStatus(procedures, success.id, success.newStatus);
      return getUpdatedState(sourceToStoreType(success.type), procedures);
    case 'diet':
      updateStatus(diet, success.id, success.newStatus);
      return getUpdatedState(sourceToStoreType(success.type), diet);
    default:
      break;
  }
};

const checkInterventionStart = (state = INITIAL_STATE, { id, source }) => ({
  ...state,
  single: {
    ...state.single,
    [sourceToStoreType(source)]: {
      ...state.single[sourceToStoreType(source)],
      checkIntervention: {
        ...state.single.checkIntervention,
        isChecking: true,
        currentId: id
      }
    }
  }
});

const checkInterventionError = (state = INITIAL_STATE, { error, source }) => ({
  ...state,
  single: {
    ...state.single,
    [sourceToStoreType(source)]: {
      ...state.single[sourceToStoreType(source)],
      checkIntervention: {
        ...state.single.checkIntervention,
        isChecking: false,
        error
      }
    }
  }
});

const checkInterventionSuccess = (state = INITIAL_STATE, { success }) => {
  const interventions = [...state.single.intervention.list];
  const prescriptions = [...state.single.prescription.list];
  const solutions = [...state.single.solution.list];
  const procedures = [...state.single.procedure.list];
  const diet = [...state.single.diet.list];

  const index = interventions.findIndex(
    item => item.id === success.id && item.idPrescription === success.idPrescription
  );
  interventions[index].status = success.newStatus;

  const updatePrevIntervention = (list, id, newStatus) => {
    for (let i = 0; i < list.length; i++) {
      const group = list[i];
      const itemIndex = group.value.findIndex(
        item => item.prevIntervention && item.prevIntervention.id === id
      );

      if (itemIndex !== -1) {
        group.value[itemIndex].prevIntervention.status = newStatus;
        return true;
      }
    }

    return false;
  };

  const getUpdatedState = (storeType, list, interventionList) => ({
    ...state,
    single: {
      ...state.single,
      [storeType]: {
        ...state.single.procedure,
        list: list,
        checkIntervention: {
          ...state.single[storeType].checkIntervention,
          error: null,
          isChecking: false,
          success
        }
      },
      intervention: {
        ...state.single.intervention,
        list: interventionList,
        checkIntervention: {
          ...state.single.intervention.checkIntervention,
          error: null,
          isChecking: false,
          success
        }
      }
    }
  });

  if (updatePrevIntervention(prescriptions, success.id, success.newStatus)) {
    return getUpdatedState('prescription', prescriptions, interventions);
  }
  if (updatePrevIntervention(solutions, success.id, success.newStatus)) {
    return getUpdatedState('solution', solutions, interventions);
  }

  if (updatePrevIntervention(procedures, success.id, success.newStatus)) {
    return getUpdatedState('procedure', procedures, interventions);
  }

  if (updatePrevIntervention(diet, success.id, success.newStatus)) {
    return getUpdatedState('diet', diet, interventions);
  }

  return {
    ...state,
    single: {
      ...state.single,
      intervention: {
        ...state.single.intervention,
        list: interventions,
        checkIntervention: {
          ...state.single.intervention.checkIntervention,
          error: null,
          isChecking: false,
          success
        }
      }
    }
  };
};

const updatePrescriptionDrugData = (
  state = INITIAL_STATE,
  { idPrescriptionDrug, source, data }
) => {
  const prescriptions = [...state.single.prescription.list];
  const solutions = [...state.single.solution.list];
  const procedures = [...state.single.procedure.list];
  const diet = [...state.single.diet.list];

  const updateData = (list, idPrescriptionDrug, newData) => {
    for (let i = 0; i < list.length; i++) {
      const group = list[i];
      const index = group.value.findIndex(item => item.idPrescriptionDrug === idPrescriptionDrug);

      if (index !== -1) {
        const { key } = group.value[index];
        group.value[index] = { ...group.value[index], ...newData, key };
        break;
      }
    }
  };

  const getUpdatedState = (storeType, list) => ({
    ...state,
    single: {
      ...state.single,
      [storeType]: {
        ...state.single[storeType],
        list: list
      }
    }
  });

  switch (sourceToStoreType(source)) {
    case 'prescription':
      console.log('update prescription');
      updateData(prescriptions, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), prescriptions);
    case 'solution':
      updateData(solutions, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), solutions);
    case 'procedure':
      updateData(procedures, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), procedures);
    case 'diet':
      updateData(diet, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), diet);
    default:
      console.error('prescription type not found', source);
  }
};

const updateInterventionData = (
  state = INITIAL_STATE,
  { idPrescriptionDrug, source, intervention }
) => {
  if (idPrescriptionDrug === '0') {
    return {
      ...state,
      single: {
        ...state.single,
        data: {
          ...state.single.data,
          intervention
        }
      }
    };
  }

  const prescriptions = [...state.single.prescription.list];
  const solutions = [...state.single.solution.list];
  const procedures = [...state.single.procedure.list];
  const diet = [...state.single.diet.list];

  const updateData = (list, idPrescriptionDrug, newData) => {
    for (let i = 0; i < list.length; i++) {
      const group = list[i];
      const index = group.value.findIndex(item => item.idPrescriptionDrug === idPrescriptionDrug);

      if (index !== -1) {
        group.value[index].intervention = newData;
        group.value[index].status = 's';
        break;
      }
    }
  };

  const getUpdatedState = (storeType, list) => ({
    ...state,
    single: {
      ...state.single,
      [storeType]: {
        ...state.single[storeType],
        list: list
      }
    }
  });

  switch (sourceToStoreType(source)) {
    case 'prescription':
      updateData(prescriptions, idPrescriptionDrug, intervention);
      return getUpdatedState(sourceToStoreType(source), prescriptions);
    case 'solution':
      updateData(solutions, idPrescriptionDrug, intervention);
      return getUpdatedState(sourceToStoreType(source), solutions);
    case 'procedure':
      updateData(procedures, idPrescriptionDrug, intervention);
      return getUpdatedState(sourceToStoreType(source), procedures);
    case 'diet':
      updateData(diet, idPrescriptionDrug, intervention);
      return getUpdatedState(sourceToStoreType(source), diet);
    default:
      console.error('prescription type not found', source);
  }
};

const fetchPeriodStart = (state = INITIAL_STATE, { source }) => ({
  ...state,
  single: {
    ...state.single,
    [sourceToStoreType(source)]: {
      ...state.single[sourceToStoreType(source)],
      period: {
        ...state.single[sourceToStoreType(source)].period,
        isFetching: true
      }
    }
  }
});

const fetchPeriodError = (state = INITIAL_STATE, { error, source }) => ({
  ...state,
  single: {
    ...state.single,
    [sourceToStoreType(source)]: {
      ...state.single[sourceToStoreType(source)],
      period: {
        ...state.single[sourceToStoreType(source)].period,
        error,
        isFetching: false
      }
    }
  }
});

const fetchPeriodSuccess = (state = INITIAL_STATE, { idPrescriptionDrug, source, data }) => {
  const prescriptions = [...state.single.prescription.list];
  const solutions = [...state.single.solution.list];
  const procedures = [...state.single.procedure.list];
  const diet = [...state.single.diet.list];

  const updateData = (list, idPrescriptionDrug, newData) => {
    for (let i = 0; i < list.length; i++) {
      const group = list[i];
      const index = group.value.findIndex(item => item.idPrescriptionDrug === idPrescriptionDrug);

      if (index !== -1) {
        group.value[index].periodDates = newData;
        break;
      }
    }
  };

  const getUpdatedState = (storeType, list) => ({
    ...state,
    single: {
      ...state.single,

      [storeType]: {
        ...state.single[storeType],
        list: list,
        period: {
          ...state.single[storeType].period,
          error: null,
          isFetching: false
        }
      }
    }
  });

  switch (sourceToStoreType(source)) {
    case 'prescription':
      updateData(prescriptions, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), prescriptions);

    case 'solution':
      updateData(solutions, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), solutions);

    case 'procedure':
      updateData(procedures, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), procedures);

    case 'diet':
      updateData(diet, idPrescriptionDrug, data);
      return getUpdatedState(sourceToStoreType(source), diet);

    default:
      console.error('prescription type not found', source);
  }
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
