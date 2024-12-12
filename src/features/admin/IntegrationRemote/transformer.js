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

export function optimisticUpdateProperties(template, id, properties) {
  const tpl = JSON.parse(JSON.stringify(template));

  tpl.flowContents.processGroups.forEach((group) => {
    group.processors.forEach((processor) => {
      if (processor.instanceIdentifier === id) {
        processor.properties = {
          ...processor.properties,
          ...properties,
        };
      }
    });
  });

  return tpl;
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
      return "Solicitar fila";
    case "CLEAR_STATE":
      return "Limpar estado";
    case "TERMINATE_PROCESS":
      return "Terminate process";
    case "CUSTOM_CALLBACK":
      return "Callback";
    case "REFRESH_TEMPLATE":
      return "Atualizar template";
    case "UPDATE_PROPERTY":
      return "Atualizar propriedade";
    default:
      return actionType;
  }
}
