type Translator = (key: string) => string;

interface ErrorPayload {
  code?: string;
  message: string;
}

interface ErrorResponse {
  // responses of rejected thunks carry arbitrary payloads
  payload?: unknown;
}

export const getErrorMessage = (
  response: ErrorResponse,
  translator: Translator
): string => {
  console.error(response);

  const payload = response.payload as ErrorPayload | null | undefined;

  if (payload?.code) {
    const translated = translator(payload.code);
    if (translated === payload.code) {
      return payload.message;
    }

    return translated;
  }

  if (payload?.message) {
    return payload.message;
  }

  return translator("errors.generic");
};

export const getErrorMessageFromException = (
  error: unknown,
  translator: Translator
) => {
  return getErrorMessage(
    {
      payload: error,
    },
    translator
  );
};
