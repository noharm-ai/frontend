import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { List, Button } from "antd";
import { RightOutlined } from "@ant-design/icons";

import Modal from "components/Modal";
import { trainingRegistry } from "../trainings";
import { localize } from "../types";
import { startTraining } from "../TrainingSlice";

interface TrainingModuleModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Entry point for training mode: lets the user pick which module to start.
 * New trainings only need to be registered in trainings/index.ts to show up
 * here.
 */
export function TrainingModuleModal({
  open,
  onClose,
}: TrainingModuleModalProps) {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const startModule = (trainingId: string, path: string) => {
    onClose();
    navigate(path);
    dispatch(startTraining(trainingId));
  };

  return (
    <Modal
      title={t("training.selectModuleTitle")}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <p>{t("training.selectModuleDescription")}</p>
      <List
        itemLayout="horizontal"
        dataSource={Object.values(trainingRegistry)}
        renderItem={(training) => (
          <List.Item
            actions={[
              <Button
                key="start"
                type="primary"
                icon={<RightOutlined />}
                onClick={() => startModule(training.id, training.path)}
              >
                {t("training.launch")}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={localize(training.title)}
              description={localize(training.description)}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
}
