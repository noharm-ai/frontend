export function findProcessGroup(groups, property, value) {
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    if (g[property] === value) {
      return g;
    } else {
      const found = findProcessGroup(g.processGroups, property, value);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

export function flatGroups(obj, result = {}) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] == "object") {
        if (property === "processGroups") {
          const groupArray = obj[property];
          for (const group in groupArray) {
            result[groupArray[group]?.instanceIdentifier] = groupArray[group];
          }
        }
        flatGroups(obj[property], result);
      }
    }
  }
}

export function flatStatuses(obj, result = {}, groups) {
  for (const property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] == "object") {
        if (
          property === "processorStatusSnapshot" ||
          property === "connectionStatusSnapshot"
        ) {
          result[obj[property].id] = obj[property];
          if (groups !== undefined) {
            if (obj[property].groupId) {
              const groupName = groups[obj[property].groupId]?.name;
              obj[property].groupName = groupName;
            }
          }
        }

        flatStatuses(obj[property], result, groups);
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
    case "VIEW_STATE":
      return "Visualizar estado";
    case "TERMINATE_PROCESS":
      return "Terminate process";
    case "CUSTOM_CALLBACK":
      return "Callback";
    case "REFRESH_TEMPLATE":
      return "Atualizar template";
    case "UPDATE_PROPERTY":
      return "Atualizar propriedade";
    case "VIEW_PROVENANCE":
      return "Ver data provenance";
    default:
      return actionType;
  }
}
