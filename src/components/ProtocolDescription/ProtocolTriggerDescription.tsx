import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "antd";

import api from "services/api";
import LoadBox from "components/LoadBox";
import { getErrorMessageFromException } from "utils/errorHandler";

import { ProtocolDescription } from "./ProtocolDescription";
import { collectVariableNames, parseTriggerExpression } from "./expressionTree";
import { LabelKind, labelLookupFromMap } from "./labels";

interface IProtocolTriggerDescriptionProps {
  idProtocol: number | string;
}

interface IFetchResult {
  idProtocol: number | string;
  data?: IProtocolDescriptionPayload | null;
  // Kept raw and translated at render time so the effect does not depend on
  // `t` — its identity changes between renders and would refetch.
  errorData?: any;
}

interface IProtocolDescriptionPayload {
  id: number;
  name: string;
  trigger: string | null;
  variables: any[];
  labels: Partial<Record<LabelKind, Record<string, string>>>;
  onlyLatestExpireDate?: boolean;
}

/**
 * Loads a protocol trigger and renders it in plain language. The item
 * descriptions come resolved from the server, so this works for end users
 * without access to the admin lookup endpoints.
 */
export function ProtocolTriggerDescription({
  idProtocol,
}: IProtocolTriggerDescriptionProps) {
  const { t } = useTranslation();
  // The result carries the id it belongs to, so a change of protocol shows the
  // loader again instead of the previous protocol's description.
  const [result, setResult] = useState<IFetchResult | null>(null);

  useEffect(() => {
    let active = true;

    api.protocols
      .getProtocolDescription(idProtocol)
      .then((response: any) => {
        if (active) {
          setResult({ idProtocol, data: response.data?.data ?? null });
        }
      })
      .catch((err: any) => {
        if (active) {
          setResult({ idProtocol, errorData: err.response?.data });
        }
      });

    return () => {
      active = false;
    };
  }, [idProtocol]);

  const current =
    result && String(result.idProtocol) === String(idProtocol) ? result : null;

  if (!current) {
    return <LoadBox />;
  }

  if (current.errorData !== undefined) {
    return (
      <Alert
        type="error"
        showIcon
        message={getErrorMessageFromException(current.errorData, t)}
      />
    );
  }

  const data = current.data;

  const unavailable = (
    <Alert
      type="info"
      showIcon
      message={t("messages.protocolDescriptionUnavailable")}
    />
  );

  if (!data?.trigger) {
    return unavailable;
  }

  // Expressions written by hand in the advanced editor may use constructs the
  // builder cannot represent; there is nothing to describe in that case.
  const tree = parseTriggerExpression(data.trigger).tree;

  if (!tree) {
    return unavailable;
  }

  const variables = data.variables ?? [];

  // Conditions whose variable no longer exists are skipped, so an expression
  // that references nothing describable would render as an empty sentence.
  const describable = collectVariableNames(tree).some((name) =>
    variables.some((variable: any) => variable?.name === name),
  );

  if (!describable) {
    return unavailable;
  }

  return (
    <>
      <ProtocolDescription
        tree={tree}
        variables={variables}
        getLabel={labelLookupFromMap(data.labels)}
        title={`${data.name} dispara quando`}
      />
      {data.onlyLatestExpireDate && (
        <div style={{ opacity: 0.7, marginTop: "5px" }}>
          Avaliado somente contra o grupo de medicamentos com a data de vigência
          mais recente da prescrição.
        </div>
      )}
    </>
  );
}
