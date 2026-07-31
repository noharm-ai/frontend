import { Dropdown } from "antd";
import { DeleteOutlined, DownOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import { getVariableSummary } from "../variableSummary";
import { ITriggerVarNode, TriggerNode } from "./expressionTree";
import { ConditionRow, ConditionError, NotChip } from "./TriggerBuilder.style";

interface IExpressionConditionProps {
  node: ITriggerVarNode;
  path: number[];
  variables: any[];
  onUpdate: (path: number[], updater: (node: TriggerNode) => TriggerNode) => void;
  onRemove: (path: number[]) => void;
}

export function ExpressionCondition({
  node,
  path,
  variables,
  onUpdate,
  onRemove,
}: IExpressionConditionProps) {
  const isDangling =
    !!node.name && !variables.some((v: any) => v.name === node.name);

  const menuItems = variables.length
    ? variables.map((v: any) => ({
        key: v.name,
        label: `${v.name} · ${getVariableSummary(v)}`,
      }))
    : [
        {
          key: "__empty__",
          label: "Nenhuma variável definida",
          disabled: true,
        },
      ];

  const selected = variables.find((v: any) => v.name === node.name);

  const tooltip = isDangling
    ? "Variável removida"
    : selected
    ? getVariableSummary(selected)
    : undefined;

  return (
    <div>
      <ConditionRow>
        <NotChip
          type="button"
          $active={node.negated}
          onClick={() =>
            onUpdate(path, (n) => ({ ...n, negated: !n.negated }))
          }
          title={node.negated ? "Remover negação" : "Negar condição"}
        >
          NÃO
        </NotChip>
        <Dropdown
          trigger={["click"]}
          menu={{
            items: menuItems,
            selectable: true,
            selectedKeys: node.name ? [node.name] : [],
            onClick: ({ key }) =>
              onUpdate(path, (n) => ({ ...n, name: key })),
          }}
        >
          <Tooltip title={tooltip}>
            <Button
              size="small"
              danger={isDangling}
              type={node.name ? "default" : "dashed"}
            >
              {node.name || "selecionar variável"} <DownOutlined />
            </Button>
          </Tooltip>
        </Dropdown>
        <div className="condition-spacer" />
        <Button
          className="row-delete"
          type="text"
          icon={<DeleteOutlined />}
          onClick={() => onRemove(path)}
          title="Remover condição"
        />
      </ConditionRow>
      {isDangling && <ConditionError>Variável inexistente</ConditionError>}
    </div>
  );
}
