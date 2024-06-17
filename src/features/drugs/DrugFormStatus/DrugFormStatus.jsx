import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { SaveOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

import Button from "components/Button";
import Tooltip from "components/Tooltip";
import notification from "components/notification";
import { getErrorMessage } from "utils/errorHandler";

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
        notification.error({
          message: getErrorMessage(response, t),
        });
      } else {
        dispatch(setDrugFormList(pdList));
        notification.success({
          message: t("success.generic"),
        });
      }
    });
  };

  const focusPending = () => {
    let pending = null;
    Object.keys(list).forEach((k) => {
      if (!pending && (!list[k] || !list[k].updated)) {
        pending = k;
      }
    });

    const elm = document.querySelector(`tr[data-row-key="${pending}"]`);

    if (elm) {
      document
        .querySelector(`tr[data-row-key].highlight`)
        ?.classList.remove("highlight");
      elm.classList.add("highlight");
      elm.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <DrugFormStatusContainer completed={count.updated === count.total}>
      <div className="drug-form-status" onClick={focusPending}>
        <div className="drug-form-status-header">{title}</div>
        <div className="drug-form-status-content">
          {count.updated} / {count.total}
        </div>
      </div>
      <div className="drug-form-status-action">
        <Tooltip title="Avaliar todos">
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
