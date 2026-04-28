import axios from "axios";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Avatar, Tag, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";

import { Row, Col } from "components/Grid";
import Card from "components/Card";
import Button from "components/Button";
import notification from "components/notification";
import { useAppDispatch, useAppSelector, IRootState } from "store/index";
import { cleanCacheThunk } from "store/ducks/patients/thunk";
import { clearCache as cleanPatientCache } from "utils/patientCache";
import { Creators as AppCreators } from "store/ducks/app/index";

import { Signature } from "./Signature/Signature";
import { ChangePassword } from "./ChangePassword/ChangePassword";
import { PageHeader } from "src/styles/PageHeader.style";

const { appResetScreeningListFilter } = AppCreators;

export function UserProfile() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  // @ts-expect-error - app duck is not typed
  const endpointConfig = useSelector((state: IRootState) => state.app.config);
  const userName = useAppSelector((state: any) => state.user.account.userName);
  const email = useAppSelector((state: any) => state.user.account.email);
  const roles: string[] = useAppSelector(
    (state: any) => state.user.account.roles ?? [],
  );

  const executeCleanCache = async () => {
    dispatch(cleanCacheThunk());
    dispatch(appResetScreeningListFilter({}));
    cleanPatientCache();

    const urlRequest = endpointConfig.nameUrl.replace("{idPatient}", "clear");

    try {
      await axios.get(urlRequest, {
        timeout: 8000,
        headers: endpointConfig.nameHeaders,
      });
    } catch (error) {
      console.error(error);
    }

    notification.success({
      message: "Cache limpo com sucesso!",
    });
  };

  const initials = userName ? userName.charAt(0).toUpperCase() : undefined;
  const translatedRoles = roles.filter((role) => i18n.exists(`roles.${role}`));

  return (
    <>
      <PageHeader>
        <div>
          <h1 className="page-header-title">{t("menu.userConfig")}</h1>
          <h1 className="page-header-legend">
            Central de configurações do usuário.
          </h1>
        </div>
      </PageHeader>

      <Card style={{ marginBottom: 16 }}>
        <Flex align="center" gap={16}>
          <Avatar
            size={64}
            icon={!initials ? <UserOutlined /> : undefined}
            style={{
              backgroundColor: "#2e3c5a",
              flexShrink: 0,
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {initials}
          </Avatar>
          <div>
            <div
              style={{
                color: "#2e3c5a",
                fontWeight: 600,
                fontSize: 18,
                lineHeight: "1.3",
              }}
            >
              {userName}
            </div>
            <div style={{ color: "#696766", fontSize: 14, marginTop: 2 }}>
              {email}
            </div>
            {translatedRoles.length > 0 && (
              <Flex wrap gap={6} style={{ marginTop: 10 }}>
                {translatedRoles.map((role) => (
                  <Tag key={role} color="#a991d6">
                    {t(`roles.${role}`)}
                  </Tag>
                ))}
              </Flex>
            )}
          </div>
        </Flex>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="Textos padrão">
            <Signature />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <ChangePassword />
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Cache">
            <Button type="primary" onClick={executeCleanCache}>
              Limpar cache de nomes dos pacientes
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}
