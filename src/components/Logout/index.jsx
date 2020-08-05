import 'styled-components/macro';
import React, { useState, useEffect } from 'react';

import appInfo from '@utils/appInfo';
import { Container, Row, Col } from '@components/Grid';

import { Wrapper, Box, ForgotPass } from '../Login/Login.style';
import { Feedback, Stars, Brand } from './Logout.style';
import fortuneCookies from './fortuneCookies';

export default function Logout({ doLogout }) {
  const [stars, setStars] = useState(true);

  useEffect(() => {
    doLogout();
  }, [doLogout]);

  const handleClick = event => {
    event.preventDefault();
    setStars(false);
  };

  const rnd = Math.floor(Math.random() * fortuneCookies.length + 1);
  const fortuneCookie = fortuneCookies[rnd];

  const feedback = stars ? (
    <Feedback>
      Como foi sua experiência com a NoHarm hoje?
      <Stars>
        <span className="gtm-btn-stars-1" onClick={handleClick}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
              fill="#70bdc3"
            ></path>
          </svg>
        </span>

        <span className="gtm-btn-stars-2" onClick={handleClick}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
              fill="#70bdc3"
            ></path>
          </svg>
        </span>

        <span className="gtm-btn-stars-3" onClick={handleClick}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
              fill="#70bdc3"
            ></path>
          </svg>
        </span>

        <span className="gtm-btn-stars-4" onClick={handleClick}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
              fill="#70bdc3"
            ></path>
          </svg>
        </span>

        <span className="gtm-btn-stars-5" onClick={handleClick}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"
              fill="#70bdc3"
            ></path>
          </svg>
        </span>
      </Stars>
      <div className="legend">
        <span>Muito Ruim</span>
        <span>Muito Boa</span>
      </div>
    </Feedback>
  ) : (
    <>
      <Feedback>
        Agradecemos o seu feedback!
        <div className="fortune">{fortuneCookie}</div>
      </Feedback>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <ForgotPass href="/login">Voltar para o login</ForgotPass>
      </div>
    </>
  );

  return (
    <Wrapper as="form">
      <Container>
        <Row type="flex" justify="center">
          <Col span={24} md={8}>
            <Box>
              <Brand title="noHarm.ai | Cuidando dos pacientes" />

              {feedback}
            </Box>
          </Col>
        </Row>
      </Container>

      <p className="copyright">{appInfo.copyright}</p>
    </Wrapper>
  );
}
