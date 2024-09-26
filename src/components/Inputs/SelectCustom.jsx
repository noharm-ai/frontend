import React from "react";
import { useTranslation } from "react-i18next";
import { Select, Button, Divider, Flex, Space } from "antd";

export const SelectCustom = ({ children, onSelectAll, ...props }) => {
  const { t } = useTranslation();

  return (
    <Select
      dropdownRender={(menu) => (
        <>
          {menu}
          {props.mode === "multiple" && (
            <>
              <Divider style={{ margin: "10px 0" }} />
              <Flex justify="flex-end">
                <Space>
                  <Button
                    type="text"
                    onClick={() => props.onChange([])}
                    disabled={props.value?.length === 0}
                  >
                    Limpar
                  </Button>
                  <Button type="text" onClick={onSelectAll}>
                    {t("labels.selectAll")}
                  </Button>
                </Space>
              </Flex>
            </>
          )}
        </>
      )}
      {...props}
    >
      {children}
    </Select>
  );
};
