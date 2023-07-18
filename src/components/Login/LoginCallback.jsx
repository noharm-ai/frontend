import "styled-components/macro";
import React, { useEffect } from "react";
import { Spin } from "antd";
import { useParams, useLocation } from "react-router-dom";

import { Container, Row, Col } from "components/Grid";
import message from "components/message";
import appInfo from "utils/appInfo";
import { isEmpty } from "utils/lodash";

import { Wrapper, Box, Brand } from "./Login.style";

export default function LoginCallback({ doLogin, error }) {
  const params = useParams();
  const { hash } = useLocation();

  useEffect(() => {
    const schema = params.schema;
    const queryString = new URLSearchParams(hash);
    const code = queryString.get("id_token");

    doLogin({
      schema,
      code,
    });
  }, [params.schema, hash, doLogin]);

  useEffect(() => {
    if (!isEmpty(error)) {
      message.error(error.message);
    }
  }, [error]);

  return (
    <Wrapper as="form">
      <Container>
        <Row type="flex" justify="center">
          <Col span={24} md={8}>
            <Box>
              <Brand title="noHarm.ai | Cuidando dos pacientes" />

              <div className="loader">
                <Spin size="large" />
                Efetuando login...
              </div>
            </Box>
          </Col>
        </Row>
      </Container>

      <p className="copyright">{appInfo.copyright}</p>
    </Wrapper>
  );
}
