import React from "react";
import { Tabs } from "antd";

import DefaultModal from "components/Modal";
import Heading from "components/Heading";
import Descriptions from "components/Descriptions";

export default function DiagnosticModal({ data, open, setOpen }) {
  const getDescriptions = (data) => {
    return (
      <Descriptions bordered size="small">
        {Object.keys(data).map((ki) => (
          <React.Fragment key={ki}>
            <Descriptions.Item label={ki} span={3}>
              {data[ki] instanceof Object
                ? getDescriptions(data[ki])
                : data[ki]}
            </Descriptions.Item>
          </React.Fragment>
        ))}
      </Descriptions>
    );
  };

  const items = [
    {
      key: "1",
      label: "Geral",
      children: (
        <Descriptions bordered size="small">
          {data &&
            Object.keys(data).map((k) => (
              <React.Fragment key={k}>
                {k !== "versionInfo" && (
                  <Descriptions.Item label={k} span={3}>
                    {data[k] instanceof Object
                      ? getDescriptions(data[k])
                      : data[k]}
                  </Descriptions.Item>
                )}
              </React.Fragment>
            ))}
        </Descriptions>
      ),
    },
    {
      key: "2",
      label: "Versão",
      children: (
        <Descriptions bordered size="small">
          {data?.versionInfo &&
            Object.keys(data?.versionInfo).map((k) => (
              <React.Fragment key={k}>
                <Descriptions.Item label={k} span={3}>
                  {data.versionInfo[k] instanceof Object
                    ? JSON.stringify(data.versionInfo[k])
                    : data.versionInfo[k]}
                </Descriptions.Item>
              </React.Fragment>
            ))}
        </Descriptions>
      ),
    },
  ];

  return (
    <DefaultModal
      width={"60vw"}
      centered
      destroyOnClose
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
    >
      <Heading margin="0 0 11px" size="18px">
        Diagnóstico
      </Heading>

      <Tabs defaultActiveKey="1" items={items} />
    </DefaultModal>
  );
}
