import { useNavigate } from "react-router-dom";

import Alert from "components/Alert";
import Button from "components/Button";
import { setSupportOpen } from "features/support/SupportSlice";
import { useAppDispatch } from "src/store";

interface PendingTrainingNoticeProps {
  /** an ADMIN_SUPPORT holder can still open an urgent ticket */
  canOpenUrgent?: boolean;
}

export function PendingTrainingNotice({
  canOpenUrgent = false,
}: PendingTrainingNoticeProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const goToTraining = () => {
    dispatch(setSupportOpen(false));
    navigate("/treinamento");
  };

  return (
    <Alert
      type="warning"
      showIcon
      message="Treinamento obrigatório pendente"
      description={
        <>
          <p style={{ marginTop: 0 }}>
            Para abrir chamados de suporte é necessário concluir os módulos
            obrigatórios da Central de Treinamento.
          </p>
          {canOpenUrgent && (
            <p>
              Como você possui permissão de administração do suporte, ainda pode
              abrir um <strong>chamado urgente</strong> pelo formulário padrão. O
              chamado será registrado como aberto com treinamento pendente.
            </p>
          )}
          <Button type="primary" onClick={goToTraining}>
            Ir para o treinamento
          </Button>
        </>
      }
    />
  );
}
