import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import DOMPurify from "dompurify";

import Button from "components/Button";
import { textToHtml } from "utils/transformers/utils";

import { SummaryPanel } from "../Summary.style";

function SummaryPanelAI({ url, apikey, payload, introduction }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (url) {
      axios
        .post(url, payload, {
          headers: {
            authorization: `Key ${apikey}`,
          },
        })
        .then((response) => {
          setResult(response.data?.answer);
          setLoading(false);
        })
        .catch((err) => {
          console.log("error");
          setError(true);
        });
    }
  }, [url, apikey, payload]);

  const reload = () => {
    setLoading(true);
    setError(false);

    axios
      .post(url, payload, {
        headers: {
          authorization: `Key ${apikey}`,
        },
      })
      .then((response) => {
        setResult(response.data?.answer);
        setLoading(false);
      })
      .catch(() => {
        console.log("error");
        setError(true);
      });
  };

  if (error) {
    return (
      <SummaryPanel className="error">
        <div className="error-container">
          <Button
            shape="circle"
            danger
            icon={<ReloadOutlined />}
            onClick={reload}
            size="large"
          />
        </div>
      </SummaryPanel>
    );
  }

  return (
    <SummaryPanel className={loading ? "loading" : ""}>
      {loading ? (
        <div className="loader">
          <Spin />
        </div>
      ) : (
        <>
          {introduction && <div className="intro">{introduction}</div>}

          <div
            className="answer"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(textToHtml(result)),
            }}
          ></div>
        </>
      )}
    </SummaryPanel>
  );
}

export default SummaryPanelAI;
