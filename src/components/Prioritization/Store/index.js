import { getListStats } from "../Util";

export const initState = () => {
  return {
    loading: false,
    affixed: false,
    currentPage: 1,
    filter: {},
    prioritization: "globalScore",
    prioritizationOrder: "desc",
    highlightPrioritization: false,
    listStats: getListStats([]),
  };
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "set_loading":
      return { ...state, loading: action.payload };
    case "set_affixed":
      return { ...state, affixed: action.payload };
    case "set_page":
      return { ...state, currentPage: action.payload };
    case "set_filter":
      return {
        ...state,
        loading: true,
        currentPage: 1,
        filter: { ...state.filter, ...action.payload },
      };
    case "set_filter_direct":
      return {
        ...state,
        currentPage: 1,
        filter: { ...state.filter, ...action.payload },
      };
    case "set_prioritization":
      return {
        ...state,
        loading: true,
        currentPage: 1,
        prioritization: action.payload,
      };

    case "set_prioritization_order":
      return {
        ...state,
        loading: true,
        currentPage: 1,
        prioritizationOrder: action.payload,
      };
    case "after_update_list":
      return {
        ...state,
        listStats: action.payload,
      };
    case "highlight_prioritization":
      return {
        ...state,
        highlightPrioritization: action.payload,
      };
    case "reset":
      return initState(action.payload);
    default:
      throw new Error();
  }
};
