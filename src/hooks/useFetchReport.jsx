import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";

import DefaultModal from "components/Modal";
import notification from "components/notification";

export default function useFetchReport({ action, reset, onAfterFetch }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = () => {
      dispatch(action()).then((response) => {
        if (response.error) {
          DefaultModal.confirm({
            title: "Não foi possível exibir este relatório.",
            content: (
              <>
                <p>
                  Por favor, tente novamente.
                  <br />
                  Se o problema persistir, entre em contato com a Ajuda.
                </p>
              </>
            ),
            width: 500,
            okText: "Tentar novamente",
            cancelText: "Fechar",
            onOk: () => fetchData(),
            wrapClassName: "default-modal",
          });
        } else if (!response.payload.data.data.cached) {
          DefaultModal.info({
            title: "Não foi possível exibir este relatório.",
            content: (
              <>
                <p>
                  Este relatório ainda não foi processado. O processamento
                  ocorre durante a noite, portanto a partir de amanhã ele estará
                  disponível.
                  <br />
                  Se o problema persistir, entre em contato com a Ajuda.
                </p>
              </>
            ),
            width: 500,
            okText: "Ok",
            cancelText: "Fechar",
            wrapClassName: "default-modal",
          });
        } else {
          onAfterFetch(
            response.payload.cacheData.body,
            response.payload.cacheData.header
          );
        }
      });
    };

    fetchData();

    return () => {
      dispatch(reset());
    };
  }, []); //eslint-disable-line

  return {
    loadArchive: (archive) => {
      dispatch(action({ archive })).then((response) => {
        if (response.error) {
          notification.error({
            message: t("error.title"),
            description: t("error.description"),
          });
        } else {
          notification.success({
            message: "Cache limpo com sucesso!",
          });

          onAfterFetch(
            response.payload.cacheData.body,
            response.payload.cacheData.header
          );
        }
      });
    },
  };
}
