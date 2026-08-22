const GMAIL_COMPOSE_URL = "https://mail.google.com/mail/?view=cm&fs=1";

const getFirstName = (name) => (name || "").trim().split(" ")[0];

const getEmailSubject = () => "NoHarm: link para cadastrar uma nova senha";

const getEmailBody = (name, link) =>
  `Olá, ${getFirstName(name)}!

Segue o link para você cadastrar uma nova senha de acesso à NoHarm:

${link}

Atenção:
- O link é válido por 6 horas e pode ser utilizado uma única vez.
- A senha deve ter no mínimo 8 caracteres, com letras maiúsculas, minúsculas e números.

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
