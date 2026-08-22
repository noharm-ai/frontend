import { passwordValidation } from "utils";

const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1";

const getGreeting = (name) => {
  const firstName = (name || "").trim().split(" ")[0];

  return firstName ? `Olá, ${firstName}!` : "Olá!";
};

const getEmailSubject = () => "NoHarm: link para cadastrar uma nova senha";

const getEmailBody = (name, link) =>
  `${getGreeting(name)}

Segue o link para você cadastrar uma nova senha de acesso à NoHarm:

${link}

Atenção:
- O link é válido por 6 horas e pode ser utilizado uma única vez.
- ${passwordValidation.message}.

Se o link expirar, responda este email que geramos um novo.

Equipe NoHarm`;

export const getGmailComposeUrl = ({ email, name, link }) => {
  const params = new URLSearchParams({
    to: email || "",
    su: getEmailSubject(),
    body: getEmailBody(name, link),
  });

  return `${GMAIL_COMPOSE_URL}&${params.toString()}`;
};
