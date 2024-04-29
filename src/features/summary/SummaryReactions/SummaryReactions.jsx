import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { LikeOutlined, DislikeOutlined } from "@ant-design/icons";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import Dropdown from "components/Dropdown";

import { setLike } from "../SummarySlice";

export default function SummaryReactions({ position, admissionNumber }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const likeStatus = useSelector(
    (state) => state.summary.blocks[position]?.like
  );
  const blockText = useSelector(
    (state) => state.summary.blocks[position]?.text
  );

  const likeAction = (type, extraInfo = {}) => {
    dispatch(
      setLike({
        type: `summary-${type}`,
        block: position,
        status: type,
        value: {
          admissionNumber,
          block: position,
          text: blockText,
          ...extraInfo,
        },
      })
    );
  };

  const dislikeItems = [
    {
      key: "1",
      label: t("summary.incorrectInfo"),
      danger: true,
    },
    {
      key: "2",
      label: t("summary.insufficientInfo"),
      danger: true,
    },
    {
      key: "3",
      label: t("summary.excessiveInfo"),
      danger: true,
    },
  ];

  const onMenuClick = ({ key }) => {
    const dislikeItem = dislikeItems.find((i) => `${i.key}` === `${key}`);

    likeAction("dislike", {
      idReason: key,
      reason: dislikeItem?.label,
    });
  };

  return (
    <>
      <Tooltip title={t("labels.useful")}>
        <Button
          shape="circle"
          icon={<LikeOutlined />}
          onClick={() => likeAction("like")}
          size="large"
          type={likeStatus === "like" ? "primary" : "default"}
          loading={likeStatus === "loading"}
        />
      </Tooltip>

      <Tooltip title={t("labels.notUseful")}>
        <Dropdown menu={{ items: dislikeItems, onClick: onMenuClick }}>
          <Button
            shape="circle"
            icon={<DislikeOutlined />}
            size="large"
            danger={likeStatus === "dislike"}
            loading={likeStatus === "loading"}
          />
        </Dropdown>
      </Tooltip>
    </>
  );
}
