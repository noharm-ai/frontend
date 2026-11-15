import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Dropdown, MenuProps } from "antd";
import { DownOutlined } from "@ant-design/icons";

import Button from "components/Button";
import {
  getClinicalNoteVariableMenus,
  VariableMenuItem,
} from "utils/clinicalNoteVariables";

import { FormGroup } from "../types";

interface VariableMenuProps {
  groups: FormGroup[];
  onInsert: (variable: string) => void;
}

// only the variables inserted as they are: the ones that open a picker first
// (a chosen substance or class) belong to the saved texts modal
const insertableOnly = (items: VariableMenuItem[]): VariableMenuItem[] =>
  items
    .map((item) =>
      item.children
        ? { ...item, children: insertableOnly(item.children) }
        : item,
    )
    .filter((item) =>
      item.children
        ? item.children.length > 0
        : !!item.key?.startsWith("{{"),
    );

// antd menus: a submenu takes its label as key
const toMenuItems = (items: VariableMenuItem[]): MenuProps["items"] =>
  items.map((item) =>
    item.children
      ? {
          key: item.key ?? item.label,
          label: item.label,
          children: toMenuItems(item.children),
        }
      : { key: item.key ?? item.label, label: item.label },
  );

/** Dropdowns that insert a form answer or a clinical note variable. */
export function VariableMenu({ groups, onInsert }: VariableMenuProps) {
  const { t } = useTranslation();

  const answerItems: VariableMenuItem[] = groups
    .map((group, gIdx) => ({
      key: `group-${gIdx}`,
      label: group.group || `Grupo ${gIdx + 1}`,
      children: (group.questions ?? [])
        .filter((q) => q.id)
        .map((q) => ({
          key: `{{${q.id}}}`,
          label: q.label ? `${q.label} (${q.id})` : q.id,
        })),
    }))
    .filter((group) => group.children.length > 0);

  const noteMenus = useMemo(() => {
    const menus = getClinicalNoteVariableMenus(t);
    return [
      { label: "Paciente", items: menus.patientVariables },
      { label: "Exames", items: menus.examVariables },
      { label: "Medicamentos", items: menus.drugVariables },
      { label: "Conciliação", items: menus.conciliaVariables },
      { label: "Intervenções", items: menus.interventionVariables },
      { label: "Alertas", items: menus.alertVariables },
      { label: "Utilidades", items: menus.utilsVariables },
    ].map((menu) => ({ ...menu, items: insertableOnly(menu.items) }));
  }, [t]);

  const onClick = ({ key }: { key: string }) => {
    if (key.startsWith("{{")) onInsert(key);
  };

  return (
    <>
      <Dropdown
        menu={{ items: toMenuItems(answerItems), onClick }}
        trigger={["click"]}
        disabled={answerItems.length === 0}
      >
        <Button size="small" type="primary" ghost icon={<DownOutlined />}>
          Respostas do formulário
        </Button>
      </Dropdown>
      {noteMenus.map((menu) => (
        <Dropdown
          key={menu.label}
          menu={{ items: toMenuItems(menu.items), onClick }}
          trigger={["click"]}
        >
          <Button size="small" icon={<DownOutlined />}>
            {menu.label}
          </Button>
        </Dropdown>
      ))}
    </>
  );
}
