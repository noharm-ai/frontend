import { Fragment, useState } from "react";
import { Segmented } from "antd";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import { Checkbox } from "components/Inputs";
import Button from "components/Button";
import {
  ITriggerGroupNode,
  TriggerConnector,
  TriggerNode,
  serializeTriggerNode,
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
  const [collapsed, setCollapsed] = useState(false);

  const isRoot = path.length === 0;
  const connectorLabel = node.connector === "and" ? "e" : "ou";

  return (
    <GroupCard $depth={path.length}>
      <div className="group-header">
        <Button
          size="small"
          type="text"
          icon={collapsed ? <CaretRightOutlined /> : <CaretDownOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expandir grupo" : "Recolher grupo"}
        />
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

      {collapsed && (
        <div
          className="group-summary"
          onClick={() => setCollapsed(false)}
          title="Expandir grupo"
        >
          <code>{serializeTriggerNode(node) || "(grupo vazio)"}</code>
        </div>
      )}

      {!collapsed && (
        <>
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
        </>
      )}
    </GroupCard>
  );
}
