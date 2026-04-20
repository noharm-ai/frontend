import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckOutlined } from "@ant-design/icons";

import { Textarea } from "components/Inputs";
import Button from "components/Button";
import notification from "components/notification";
import { useAppDispatch, useAppSelector } from "store/index";
import { Creators as UserCreators } from "store/ducks/user";
import { SIGNATURE_MEMORY_TYPE } from "utils/memory";

import { saveSignature, resetSignatureSave } from "../UserProfileSlice";
import { Form } from "src/styles/Form.style";

export function Signature() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state: any) => state.user.account.userId);
  const accountSignature = useAppSelector(
    (state: any) => state.user.account.signature
  );
  const {
    saveStatus,
    data: signatureData,
    error,
  } = useAppSelector((state) => state.userProfile.signature);

  const [editedSignature, setSignature] = useState<string | null>(null);
  const memoryType = `${SIGNATURE_MEMORY_TYPE}_${userId}`;
  const signature = editedSignature ?? accountSignature ?? "";

  useEffect(() => {
    if (saveStatus === "succeeded") {
      dispatch(UserCreators.userSetAccountField({ signature }));
      notification.success({
        message: "Uhu! Assinatura salva com sucesso! :)",
      });
      dispatch(resetSignatureSave());
    }
  }, [saveStatus]); // eslint-disable-line

  useEffect(() => {
    if (error && saveStatus === "failed") {
      notification.error({
        message: t("error.title"),
        description: t("error.description"),
      });
    }
  }, [error, saveStatus, t]);

  const save = () => {
    dispatch(
      saveSignature({
        id: signatureData?.key ?? "",
        type: memoryType,
        value: signature,
      }),
    );
  };

  const isSaving = saveStatus === "loading";

  return (
    <Form>
      <div className="form-row">
        <div className="form-label">
          <label>Assinatura:</label>
        </div>
        <div className="form-input">
          <Textarea
            autoFocus
            style={{ minHeight: "150px" }}
            value={signature}
            onChange={({ target }: React.ChangeEvent<HTMLTextAreaElement>) =>
              setSignature(target.value)
            }
          />
        </div>
      </div>
      <div className="form-row">
        <Button
          type="primary"
          className="gtm-btn-save-signature"
          onClick={save}
          disabled={isSaving}
          loading={isSaving}
          icon={<CheckOutlined />}
        >
          Salvar
        </Button>
      </div>
    </Form>
  );
}
