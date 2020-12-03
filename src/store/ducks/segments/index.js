import { createActions, createReducer } from 'reduxsauce';

export const { Types, Creators } = createActions({
  segmentsFetchListStart: [''],
  segmentsFetchListError: ['error'],
  segmentsFetchListSuccess: ['list'],

  segmentsFetchSingleStart: [''],
  segmentsFetchSingleError: ['error'],
  segmentsFetchSingleSuccess: ['content', 'firstFilter'],
  segmentsFetchSingleReset: [''],

  segmentsSaveSingleStart: [''],
  segmentsSaveSingleSuccess: [''],
  segmentsSaveSingleReset: [''],
  segmentsSaveSingleError: ['error'],

  segmentsSelectExam: ['item'],
  segmentsUpdateExam: ['item'],
  segmentsSaveExamStart: [''],
  segmentsSaveExamSuccess: ['item'],
  segmentsSaveExamReset: [''],
  segmentsSaveExamError: ['error'],

  segmentsFetchExamTypesListStart: [''],
  segmentsFetchExamTypesListError: ['error'],
  segmentsFetchExamTypesListSuccess: ['list'],

  segmentsUpdateExamOrderStart: [''],
  segmentsUpdateExamOrderError: ['error'],
  segmentsUpdateExamOrderSuccess: ['exams'],
  segmentsUpdateExamOrderReset: ['']
});

const INITIAL_STATE = {
  error: null,
  isFetching: true,
  list: [],
  firstFilter: {
    idSegment: undefined
  },
  save: {
    isSaving: false,
    success: false,
    error: null
  },
  single: {
    error: null,
    isFetching: false,
    content: {}
  },
  saveExam: {
    isSaving: false,
    success: false,
    error: null,
    item: {}
  },
  sortExam: {
    isSaving: false,
    success: false,
    error: null
  },
  examTypes: {
    error: null,
    isFetching: true,
    list: []
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

const fetchSingleSuccess = (state = INITIAL_STATE, { content, firstFilter }) => ({
  ...state,
  firstFilter,
  single: {
    ...state.single,
    content,
    error: null,
    isFetching: false
  }
});

const fetchSingleReset = (state = INITIAL_STATE) => ({
  ...state,
  single: {
    ...INITIAL_STATE.single
  }
});

const saveSingleStart = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    isSaving: true
  }
});

const saveSingleError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  save: {
    ...state.save,
    error,
    isSaving: false
  }
});

const saveSingleReset = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...INITIAL_STATE.save
  }
});

const saveSingleSuccess = (state = INITIAL_STATE) => ({
  ...state,
  save: {
    ...state.save,
    error: null,
    success: true,
    isSaving: false
  }
});

const selectExam = (state = INITIAL_STATE, { item }) => ({
  ...state,
  saveExam: {
    ...state.saveExam,
    item
  }
});

const updateExam = (state = INITIAL_STATE, { item }) => ({
  ...state,
  saveExam: {
    ...state.saveExam,
    item: {
      ...state.saveExam.item,
      ...item
    }
  }
});

const updateExamOrderSuccess = (state = INITIAL_STATE, { exams }) => ({
  ...state,
  single: {
    ...state.single,
    content: {
      ...state.single.content,
      exams
    }
  }
});

const updateExamOrderStart = (state = INITIAL_STATE) => ({
  ...state,
  sortExam: {
    ...state.sortExam,
    isSaving: true
  }
});

const updateExamOrderError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  sortExam: {
    ...state.sortExam,
    error,
    isSaving: false
  }
});

const updateExamOrderReset = (state = INITIAL_STATE) => ({
  ...state,
  sortExam: {
    ...INITIAL_STATE.sortExam
  }
});

const saveExamStart = (state = INITIAL_STATE) => ({
  ...state,
  saveExam: {
    ...state.saveExam,
    isSaving: true
  }
});

const saveExamError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  saveExam: {
    ...state.saveExam,
    error,
    isSaving: false
  }
});

const saveExamReset = (state = INITIAL_STATE) => ({
  ...state,
  saveExam: {
    ...INITIAL_STATE.saveExam
  }
});

const fetchExamTypesListStart = (state = INITIAL_STATE) => ({
  ...state,
  examTypes: {
    ...state.examTypes,
    isFetching: true
  }
});

const fetchExamTypesListError = (state = INITIAL_STATE, { error }) => ({
  ...state,
  examTypes: {
    ...state.examTypes,
    isFetching: false,
    error
  }
});

const fetchExamTypesListSuccess = (state = INITIAL_STATE, { list }) => ({
  ...state,
  examTypes: {
    ...state.examTypes,
    isFetching: false,
    error: null,
    list
  }
});

const saveExamSuccess = (state = INITIAL_STATE, { item }) => {
  const exams = [...state.single.content.exams];
  const index = exams.findIndex(e => item.type === e.type);

  if (index !== -1) {
    exams[index] = { ...exams[index], ...item };
  } else {
    exams.push({ ...item, new: false });
  }

  return {
    ...state,
    single: {
      ...state.single,
      content: {
        ...state.single.content,
        exams
      }
    },
    saveExam: {
      ...state.saveExam,
      error: null,
      success: true,
      isSaving: false
    }
  };
};

const HANDLERS = {
  [Types.SEGMENTS_FETCH_LIST_START]: fetchListStart,
  [Types.SEGMENTS_FETCH_LIST_ERROR]: fetchListError,
  [Types.SEGMENTS_FETCH_LIST_SUCCESS]: fetchListSuccess,

  [Types.SEGMENTS_FETCH_SINGLE_START]: fetchSingleStart,
  [Types.SEGMENTS_FETCH_SINGLE_ERROR]: fetchSingleError,
  [Types.SEGMENTS_FETCH_SINGLE_SUCCESS]: fetchSingleSuccess,
  [Types.SEGMENTS_FETCH_SINGLE_RESET]: fetchSingleReset,

  [Types.SEGMENTS_SAVE_SINGLE_START]: saveSingleStart,
  [Types.SEGMENTS_SAVE_SINGLE_ERROR]: saveSingleError,
  [Types.SEGMENTS_SAVE_SINGLE_RESET]: saveSingleReset,
  [Types.SEGMENTS_SAVE_SINGLE_SUCCESS]: saveSingleSuccess,

  [Types.SEGMENTS_SAVE_EXAM_START]: saveExamStart,
  [Types.SEGMENTS_SAVE_EXAM_ERROR]: saveExamError,
  [Types.SEGMENTS_SAVE_EXAM_RESET]: saveExamReset,
  [Types.SEGMENTS_SAVE_EXAM_SUCCESS]: saveExamSuccess,

  [Types.SEGMENTS_SELECT_EXAM]: selectExam,
  [Types.SEGMENTS_UPDATE_EXAM]: updateExam,

  [Types.SEGMENTS_UPDATE_EXAM_ORDER_START]: updateExamOrderStart,
  [Types.SEGMENTS_UPDATE_EXAM_ORDER_ERROR]: updateExamOrderError,
  [Types.SEGMENTS_UPDATE_EXAM_ORDER_SUCCESS]: updateExamOrderSuccess,
  [Types.SEGMENTS_UPDATE_EXAM_ORDER_RESET]: updateExamOrderReset,

  [Types.SEGMENTS_FETCH_EXAM_TYPES_LIST_START]: fetchExamTypesListStart,
  [Types.SEGMENTS_FETCH_EXAM_TYPES_LIST_ERROR]: fetchExamTypesListError,
  [Types.SEGMENTS_FETCH_EXAM_TYPES_LIST_SUCCESS]: fetchExamTypesListSuccess
};

const reducer = createReducer(INITIAL_STATE, HANDLERS);

export default reducer;
