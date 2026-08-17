import DefaultModal from "components/Modal";

/** the code support_service._check_mandatory_training raises */
export const PENDING_TRAINING_ERROR = "errors.pendingMandatoryTraining";

/**
 * The client decides what to offer from counts that were computed server-side,
 * so it can be out of date: a mandatory module published mid-session, or a
 * session that predates the feature. In those cases the form is reachable and
 * the refusal only arrives on submit — show something actionable rather than a
 * bare toast the user cannot act on.
 *
 * Returns true when it handled the response, so callers can skip their generic
 * error notification.
 */
export function handlePendingTrainingError(
  response: any,
  goToTraining: () => void,
): boolean {
  if (response?.payload?.code !== PENDING_TRAINING_ERROR) {
    return false;
  }

  DefaultModal.warning({
    title: "Treinamento obrigatório pendente",
    content:
      "Para abrir chamados de suporte é necessário concluir os módulos " +
      "obrigatórios da Central de Treinamento.",
    width: 520,
    okText: "Ir para o treinamento",
    cancelText: "Fechar",
    okCancel: true,
    onOk: goToTraining,
    mask: { blur: false },
    wrapClassName: "default-modal",
  });

  return true;
}
