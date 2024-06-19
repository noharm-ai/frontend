export function flatStatuses(obj, result = {}) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] == "object") {
        if (
          property === "processorStatusSnapshot" ||
          property === "connectionStatusSnapshot"
        ) {
          result[obj[property].id] = obj[property];
        }

        flatStatuses(obj[property], result);
      }
    }
  }
}

export function actionTypeToDescription(actionType) {
  switch (actionType) {
    case "SET_STATE":
      return "Alterar status";
    case "REFRESH_STATE":
      return "Atualizar";
    case "CLEAR_QUEUE":
      return "Limpar fila";
    case "LIST_QUEUE":
      return "Visualizar fila";
    case "CLEAR_STATE":
      return "Limpar estado";
    case "TERMINATE_PROCESS":
      return "Terminate process";
    case "CUSTOM_CALLBACK":
      return "Callback";
    default:
      return actionType;
  }
}
