import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { ExperimentOutlined } from "@ant-design/icons";

import { stopTraining } from "../TrainingSlice";
import { Banner } from "./TrainingBanner.style";

export function TrainingBanner() {
  const dispatch = useDispatch<any>();
  const { t } = useTranslation();

  return (
    <Banner role="alert">
      <ExperimentOutlined />
      <span>{t("training.bannerMessage")}</span>
      <Button ghost size="small" onClick={() => dispatch(stopTraining())}>
        {t("training.exit")}
      </Button>
    </Banner>
  );
}
