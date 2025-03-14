import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Formik } from "formik";
import { UndoOutlined } from "@ant-design/icons";

import DefaultModal from "components/Modal";
import { Textarea } from "components/Inputs";
import notification from "components/notification";
import Heading from "components/Heading";
import Tooltip from "components/Tooltip";
import Button from "components/Button";

import { Form } from "styles/Form.style";
import { blocksToText } from "../verbalizers";

function SummaryText({ open, setOpen }) {
  const { t } = useTranslation();
  const blocks = useSelector((state) => state.summary.blocks);
  const initialValues = {
    text: blocksToText(blocks),
  };

  const handleOK = () => {
    navigator.clipboard.writeText(blocksToText(blocks));
    notification.success({ message: "Sumário de Alta copiado!" });
  };

  const undo = (setFieldValue) => {
    setFieldValue("text", blocksToText(blocks));
  };

  return (
    <Formik
      enableReinitialize
      onSubmit={handleOK}
      initialValues={initialValues}
    >
      {({ values, setFieldValue }) => (
        <DefaultModal
          width={"50vw"}
          centered
          destroyOnClose
          onOk={handleOK}
          onCancel={() => setOpen(false)}
          open={open}
          cancelText={t("actions.close")}
          okText={t("actions.copy")}
        >
          <header>
            <Heading $margin="0 0 11px">{t("summary.title")}</Heading>
          </header>
          <Form>
            <div className={`form-row`}>
              <div className="form-action">
                <Tooltip title={t("actions.undo")}>
                  <Button
                    shape="circle"
                    icon={<UndoOutlined />}
                    onClick={() => undo(setFieldValue)}
                  />
                </Tooltip>
              </div>
              <div className="form-input">
                <Textarea
                  value={values.text}
                  style={{ minHeight: "50vh" }}
                  onChange={({ target }) => setFieldValue("text", target.value)}
                ></Textarea>
              </div>
            </div>
          </Form>
        </DefaultModal>
      )}
    </Formik>
  );
}

export default SummaryText;
