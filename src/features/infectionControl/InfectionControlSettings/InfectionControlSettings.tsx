import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Tabs } from "antd";
import { SettingOutlined } from "@ant-design/icons";
import styled from "styled-components";

import DefaultModal from "components/Modal";

import { ReviewExceptions } from "../ReviewExceptions/ReviewExceptions";
import { TimelineExams } from "../TimelineExams/TimelineExams";

const Body = styled.div`
  .ant-tabs-nav {
    margin-bottom: 16px;
  }
`;

/**
 * The schema's infection control settings, opened from the worklist header:
 * one tab per setting (the antimicrobials whose courses need no review, the
 * exams the antimicrobial timeline opens with). Anyone who sees the worklist reads them; each tab says who may
 * change it. `onSaved` reloads the worklist
 */
export function InfectionControlSettings({ onSaved }: { onSaved: () => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        icon={<SettingOutlined />}
        onClick={() => setOpen(true)}
        data-kb="infectionControl.worklist.settings"
      >
        {t("infectionControl.settings.open")}
      </Button>

      <DefaultModal
        open={open}
        width={640}
        centered
        destroyOnHidden
        onCancel={close}
        footer={null}
      >
        <Body
          data-kb="infectionControl.settings.modal"
          data-testid="infection-control-settings"
        >
          <h2 className="modal-title">
            {t("infectionControl.settings.title")}
          </h2>
          <Tabs
            defaultActiveKey="reviewExceptions"
            items={[
              {
                key: "reviewExceptions",
                label: t("infectionControl.reviewExceptions.tab"),
                children: (
                  <ReviewExceptions onSaved={onSaved} onClose={close} />
                ),
              },
              {
                key: "timelineExams",
                label: t("infectionControl.timelineExams.tab"),
                children: <TimelineExams onClose={close} />,
              },
            ]}
          />
        </Body>
      </DefaultModal>
    </>
  );
}
