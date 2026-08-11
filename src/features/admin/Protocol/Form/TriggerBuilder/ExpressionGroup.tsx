import { useState } from "react";
import {
  CaretDownOutlined,
  CaretRightOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";

import Button from "components/Button";
import {
  ITriggerGroupNode,
  TriggerNode,
  serializeTriggerNode,
} from "components/ProtocolDescription/expressionTree";
import { ExpressionCondition } from "./ExpressionCondition";
import {
  GroupCard,
  BuilderRow,
  ConnectorToggle,
  NotChip,
} from "./TriggerBuilder.style";

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

  const toggleConnector = () =>
    onUpdate(path, (n) =>
      n.kind === "group"
        ? { ...n, connector: n.connector === "and" ? "or" : "and" }
        : n
    );

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
        <NotChip
          type="button"
          $active={node.negated}
          onClick={() =>
            onUpdate(path, (n) => ({ ...n, negated: !n.negated }))
          }
          title={node.negated ? "Remover negação do grupo" : "Negar grupo"}
        >
          NÃO
        </NotChip>
        {collapsed ? (
          <div
            className="group-summary"
            onClick={() => setCollapsed(false)}
            title="Expandir grupo"
          >
            <code>{serializeTriggerNode(node) || "(grupo vazio)"}</code>
          </div>
        ) : (
          <div className="group-header-spacer" />
        )}
        {!isRoot && (
          <Button
            className="row-delete"
            type="text"
            icon={<DeleteOutlined />}
            onClick={() => onRemove(path)}
            title="Remover grupo"
          />
        )}
      </div>

      {!collapsed && (
        <>
          <div className="group-children">
            {node.children.length === 0 && (
              <div className="group-empty">
                Nenhuma condição. Utilize os botões abaixo para adicionar.
              </div>
            )}
            {node.children.map((child, index) => (
              <BuilderRow key={index}>
                <div className="row-gutter">
                  {index > 0 && (
                    <ConnectorToggle
                      type="button"
                      $connector={node.connector}
                      onClick={toggleConnector}
                      title="Alternar entre E e OU"
                    >
                      {connectorLabel}
                    </ConnectorToggle>
                  )}
                </div>
                <div className="row-content">
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
                </div>
              </BuilderRow>
            ))}
          </div>

          <div className="group-footer">
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              onClick={() => onAddCondition(path)}
            >
              condição
            </Button>
            <Button
              size="small"
              type="text"
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
