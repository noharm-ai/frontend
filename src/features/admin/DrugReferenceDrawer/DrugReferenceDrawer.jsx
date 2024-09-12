import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Spin, Drawer } from "antd";
import DOMPurify from "dompurify";

import { getErrorMessage } from "utils/errorHandler";
import notification from "components/notification";
import { setDrawerSctid, fetchDrugReference } from "./DrugReferenceDrawerSlice";

export default function DrugReferenceDrawer() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const sctid = useSelector((state) => state.admin.drugReferenceDrawer.sctid);
  const data = useSelector((state) => state.admin.drugReferenceDrawer.data);
  const status = useSelector((state) => state.admin.drugReferenceDrawer.status);

  useEffect(() => {
    if (sctid) {
      dispatch(fetchDrugReference({ sctid })).then((response) => {
        if (response.error) {
          notification.error({
            message: getErrorMessage(response, t),
          });
        }
      });
    }
  }, [sctid, dispatch, t]);

  return (
    <Drawer
      title={data?.name || "--"}
      open={sctid}
      onClose={() => dispatch(setDrawerSctid(null))}
      mask={false}
      width={"23%"}
    >
      <Spin spinning={status === "loading"}>
        {data?.ref ? (
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(data.ref),
            }}
          />
        ) : (
          <p>
            {" "}
            {status !== "loading" && (
              <>Este medicamento não possui referência cadastrada</>
            )}
          </p>
        )}
      </Spin>
    </Drawer>
  );
}
