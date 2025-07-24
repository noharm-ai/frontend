import "styled-components";
import React, { useEffect } from "react";
import axios from "axios";
import { Spin } from "antd";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import message from "components/message";
import appInfo from "utils/appInfo";
import { isEmpty } from "utils/lodash";
import notification from "components/notification";
import api from "services/api";

import { LoginContainer, Brand } from "./Login.style";

export default function LoginCallback({ doLogin, error }) {
  const params = useParams();
  const { hash } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const schema = params.schema;
    const queryString = new URLSearchParams(
      hash ? hash.substring(1) : window.location.search
    );

    const idToken = queryString.get("id_token");
    const authCode = queryString.get("code");

    const login = async () => {
      try {
        const { data } = await api.getAuthProvider(schema);
        const config = { ...data.data };

        if (config.flow === "pkce") {
          const payload = {
            client_id: config.clientId,
            grant_type: "authorization_code",
            code: authCode,
            redirect_uri: config.redirectUri,
            code_verifier: localStorage.getItem("oauth_verifier"),
          };
          if (config.clientSecret && config.clientSecret !== "") {
            payload.client_secret = config.clientSecret;
          }

          const params = new URLSearchParams(payload);
          const response = await axios.post(config.loginUrl, params);

          doLogin({
            schema,
            code: response.data["id_token"],
          }).then((response) => {
            if (response.permissions.indexOf("MULTI_SCHEMA") !== -1) {
              navigate("/switch-schema");
            } else {
              navigate("/");
            }
          });
        } else {
          doLogin({
            schema,
            code: idToken ?? authCode,
          }).then((response) => {
            if (response.permissions.indexOf("MULTI_SCHEMA") !== -1) {
              navigate("/switch-schema");
            } else {
              navigate("/");
            }
          });
        }
      } catch {
        notification.error({
          message: "Inválido ou inexistente",
        });
      }
    };

    login();
  }, [params.schema, hash, doLogin, navigate]);

  useEffect(() => {
    if (!isEmpty(error)) {
      console.error(error.message);
      message.error(error.message);
    }
  }, [error]);

  return (
    <LoginContainer>
      <div className="form">
        <Brand title="noHarm.ai | Cuidando dos pacientes" />

        <div className="form-container">
          <div className="loader">
            <Spin size="large" />
          </div>
        </div>
      </div>
      <div className="bg">
        <div className="gradient"></div>
      </div>
      <p className="copyright">{appInfo.copyright}</p>
    </LoginContainer>
  );
}
