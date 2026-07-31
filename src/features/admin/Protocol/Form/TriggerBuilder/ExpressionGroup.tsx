import { Fragment } from "react";
import { Segmented } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

import { Checkbox } from "components/Inputs";
import Button from "components/Button";
import {
  ITriggerGroupNode,
  TriggerConnector,
  TriggerNode,
} from "./expressionTree";
import { ExpressionCondition } from "./ExpressionCondition";
import { GroupCard, ConnectorChip } from "./TriggerBuilder.style";

interface IExpressionGroupProps {
  node: ITriggerGroupNode;
  path: number[];
  variables: any[];
  onUpdate: (path: number[], updater: (node: TriggerNode) => TriggerNode) => void;
  onRemove: (path: number[]) => void;
  onAddCondition: (path: number[]) => void;
  onAddGroup: (path: number[]) => void;
}

export function ExpressionGroup({
  node,
  path,
  variables,
  onUpdate,
  onRemove,
  onAddCondition,
  onAddGroup,
}: IExpressionGroupProps) {
  const isRoot = path.length === 0;
  const connectorLabel = node.connector === "and" ? "e" : "ou";

  return (
    <GroupCard $depth={path.length}>
      <div className="group-header">
        <Segmented
          size="small"
          value={node.connector}
          options={[
            { label: "E", value: "and" },
            { label: "OU", value: "or" },
          ]}
          onChange={(value) =>
            onUpdate(path, (n) => ({
              ...n,
              connector: value as TriggerConnector,
            }))
          }
        />
        <Checkbox
          checked={node.negated}
          onChange={({ target }: any) =>
            onUpdate(path, (n) => ({ ...n, negated: target.checked }))
          }
        >
          NÃO
        </Checkbox>
        <div className="group-header-spacer" />
        {!isRoot && (
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => onRemove(path)}
            title="Remover grupo"
          />
        )}
      </div>

      <div className="group-children">
        {node.children.length === 0 && (
          <div className="group-empty">
            Nenhuma condição. Utilize os botões abaixo para adicionar.
          </div>
        )}
        {node.children.map((child, index) => (
          <Fragment key={index}>
            {index > 0 && <ConnectorChip>{connectorLabel}</ConnectorChip>}
            {child.kind === "var" ? (
              <ExpressionCondition
                node={child}
                path={[...path, index]}
                variables={variables}
                onUpdate={onUpdate}
                onRemove={onRemove}
              />
            ) : (
              <ExpressionGroup
                node={child}
                path={[...path, index]}
                variables={variables}
                onUpdate={onUpdate}
                onRemove={onRemove}
                onAddCondition={onAddCondition}
                onAddGroup={onAddGroup}
              />
            )}
          </Fragment>
        ))}
      </div>

      <div className="group-footer">
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => onAddCondition(path)}
        >
          condição
        </Button>
        <Button
          size="small"
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => onAddGroup(path)}
        >
          grupo
        </Button>
      </div>
    </GroupCard>
  );
}
