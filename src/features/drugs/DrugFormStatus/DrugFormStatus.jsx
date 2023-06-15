import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { SaveOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";

import { updateAllDrugForms, setDrugFormList } from "./DrugFormStatusSlice";

import { DrugFormStatusContainer } from "./DrugFormStatus.style";

function DrugFormStatus({ title, template }) {
  const { t } = useTranslation();
  const list = useSelector((state) => state.drugFormStatus.list);
  const status = useSelector((state) => state.drugFormStatus.status);
  const dispatch = useDispatch();

  const count = {
    updated: 0,
    total: Object.keys(list).length,
  };

  Object.keys(list).forEach((k) => {
    if (list[k] && list[k].updated) {
      count.updated += 1;
    }
  });

  const saveAll = () => {
    const errors = [];
    const requiredQuestions = {};
    template.data.forEach((g) => {
      g.questions.forEach((q) => {
        if (q.required) {
          requiredQuestions[q.id] = true;
        }
      });
    });

    const pdList = { ...list };
    Object.keys(pdList).forEach((k) => {
      pdList[k] = {
        ...(pdList[k] || {}),
        updated: true,
      };

      Object.keys(requiredQuestions).forEach((rq) => {
        if (
          pdList[k][rq] === null ||
          pdList[k][rq] === undefined ||
          pdList[k][rq] === ""
        ) {
          errors.push(k);
        }
      });
    });

    if (errors.length) {
      const elm = document.querySelector(`tr[data-row-key="${errors[0]}"]`);

      if (elm) {
        document
          .querySelector(`tr[data-row-key].highlight`)
          ?.classList.remove("highlight");
        elm.classList.add("highlight");
        elm.scrollIntoView({ behavior: "smooth" });
      }

      notification.error({
        message: "Existem campos obrigatórios que não foram preenchidos.",
      });
      return;
    }

    dispatch(updateAllDrugForms(pdList)).then((response) => {
      if (response.error) {
        if (response.payload?.code) {
          notification.error({
            message: t(response.payload.code),
          });
        } else if (response.payload?.message) {
          notification.error({
            message: response.payload.message,
          });
        } else {
          notification.error({
            message: t("errors.generic"),
          });
        }
        console.error(response);
      } else {
        dispatch(setDrugFormList(pdList));
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  return (
    <DrugFormStatusContainer completed={count.updated === count.total}>
      <div className="drug-form-status">
        <div className="drug-form-status-header">{title}</div>
        <div className="drug-form-status-content">
          {count.updated} / {count.total}
        </div>
      </div>
      <div className="drug-form-status-action">
        <Tooltip title="Salvar todos">
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={<SaveOutlined />}
            disabled={count.updated === count.total}
            loading={status === "loading"}
            onClick={saveAll}
          />
        </Tooltip>
      </div>
    </DrugFormStatusContainer>
  );
}

export default DrugFormStatus;
