import React from "react";
import { useSelector } from "react-redux";
import { Spin } from "antd";
import DOMPurify from "dompurify";

export default function DrugReference() {
  const drugAttributes = useSelector(
    (state) => state.admin.unitConversion.fetchDrugAttributes.data
  );
  const status = useSelector(
    (state) => state.admin.unitConversion.fetchDrugAttributes.status
  );

  return (
    <Spin spinning={status === "loading"}>
      {drugAttributes?.drugRef ? (
        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(drugAttributes.drugRef),
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
  );
}
