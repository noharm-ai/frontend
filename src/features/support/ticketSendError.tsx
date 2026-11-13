import notification from "components/notification";
import DefaultModal from "components/Modal";
import { getErrorMessage } from "utils/errorHandler";

type Translator = (key: string, options?: Record<string, unknown>) => string;

/**
 * Tells the user a support request (ticket or attachment) was not sent.
 *
 * statusCode 0 means the browser never saw an HTTP answer: the request was
 * refused before reaching the backend (typically an oversized body) or the
 * connection failed. A plain toast there left users retrying the same
 * request over and over, so they get a modal with something to act on.
 */
export function showTicketSendError(response: any, t: Translator) {
  const statusCode = response?.payload?.statusCode;
  const supportEmail = import.meta.env.VITE_APP_SUPPORT_EMAIL;

  if (statusCode === 0) {
    DefaultModal.error({
      title: t("errors.supportTicketNetworkTitle"),
      content: (
        <div data-kb="support.sendError">
          <p>{t("errors.supportTicketNetwork")}</p>
          <p>{t("errors.supportTicketNetworkAttachments")}</p>
          {supportEmail && (
            <p>
              {t("errors.supportTicketNetworkEmail")}{" "}
              <strong>{supportEmail}</strong>.
            </p>
          )}
        </div>
      ),
      mask: { blur: false },
      width: 500,
      okText: t("actions.close"),
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
    });
    return;
  }

  notification.error({
    message: getErrorMessage(response, t),
  });

  if (statusCode >= 500) {
    DefaultModal.error({
      title: "Serviço Offline",
      content: (
        <>
          <p>
            Nosso serviço de registro de chamados está fora do ar. Por favor,
            encaminhe o seu pedido de ajuda para{" "}
            <strong>{supportEmail}</strong>.
          </p>
        </>
      ),
      mask: { blur: false },
      width: 500,
      okText: "Fechar",
      okButtonProps: { type: "default" },
      wrapClassName: "default-modal",
    });
  }
}
