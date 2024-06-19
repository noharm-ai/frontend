import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin } from "antd";

import { fetchTemplate, reset } from "./IntegrationRemoteSlice";
import Graph from "./components/Graph";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";
import NifiQueue from "./components/NifiQueue";

export default function Nifi() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const status = useSelector((state) => state.admin.integrationRemote.status);

  useEffect(() => {
    dispatch(fetchTemplate()).then((response) => {
      if (response.error) {
        notification.error({
          message: getErrorMessage(response, t),
        });
      }
    });

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  return (
    <Spin spinning={status === "loading"}>
      <div
        style={{
          height: "100vh",
          width: "100vw",
          backgroundSize: "20px 20px",
          backgroundImage:
            "linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa, 1px, transparent 1px)",
        }}
      >
        <Graph />

        <NifiQueue />
      </div>
    </Spin>
  );
}
