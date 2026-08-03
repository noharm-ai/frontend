import { useState } from "react";
import { useTranslation } from "react-i18next";

import Tooltip from "components/Tooltip";
import { ITriggerVarNode } from "./expressionTree";
import { LabelLookup } from "./useItemLabels";
import {
  IDescriptionCriterion,
  IDescriptionItem,
  buildVariableDescription,
} from "./variableDescription";
import { ConditionCard } from "./TriggerBuilder.style";

// Beyond this the list is folded behind a "+N" toggle so a variable with a
// hundred substances cannot bury the rest of the sentence.
const VISIBLE_ITEMS = 6;

interface ISentenceConditionProps {
  node: ITriggerVarNode;
  variables: any[];
  getLabel: LabelLookup;
}

function ItemList({ items }: { items: IDescriptionItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = items.length - VISIBLE_ITEMS;
  const visible = expanded ? items : items.slice(0, VISIBLE_ITEMS);

  return (
    <span className="criterion-items">
      {visible.map((item) => (
        <span
          className={`item-chip ${item.resolved ? "" : "is-unresolved"}`}
          key={item.id}
          title={item.resolved ? undefined : `Descrição não encontrada`}
        >
          {item.label}
        </span>
      ))}
      {hidden > 0 && (
        <button
          type="button"
          className="items-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "ver menos" : `+${hidden} ${hidden > 1 ? "itens" : "item"}`}
        </button>
      )}
    </span>
  );
}

function Criterion({ criterion }: { criterion: IDescriptionCriterion }) {
  return (
    <div className="condition-criterion">
      {criterion.label && (
        <span className="criterion-label">{criterion.label}</span>
      )}
      <span className="criterion-phrase">{criterion.phrase}</span>
      {criterion.text && (
        <span className="criterion-text">{criterion.text}</span>
      )}
      {criterion.items && <ItemList items={criterion.items} />}
    </div>
  );
}

export function SentenceCondition({
  node,
  variables,
  getLabel,
}: ISentenceConditionProps) {
  const { t } = useTranslation();
  const variable = variables.find((v: any) => v.name === node.name);

  if (!variable) {
    return (
      <ConditionCard className="is-dangling">
        <div className="condition-header">
          {node.negated && <span className="condition-not">NÃO</span>}
          <span className="condition-subject">
            a variável {node.name} não existe mais
          </span>
        </div>
      </ConditionCard>
    );
  }

  const description = buildVariableDescription(variable, getLabel, t);

  return (
    <ConditionCard className={description.incomplete ? "is-incomplete" : ""}>
      <div className="condition-header">
        {node.negated && (
          <Tooltip title="A condição precisa ser falsa para o gatilho disparar">
            <span className="condition-not">NÃO</span>
          </Tooltip>
        )}
        <span className="condition-subject">{description.subject}</span>
        <Tooltip title={`Variável ${node.name}`}>
          <span className="condition-varname">{node.name}</span>
        </Tooltip>
      </div>

      {description.criteria.map((criterion, index) => (
        <Criterion criterion={criterion} key={index} />
      ))}

      {description.notes.map((note) => (
        <div className="condition-note" key={note}>
          {note}
        </div>
      ))}
    </ConditionCard>
  );
}
