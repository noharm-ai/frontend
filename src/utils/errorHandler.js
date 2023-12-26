export const getErrorMessage = (response, translator) => {
  console.error(response);

  if (response.payload?.code) {
    const translated = translator(response.payload.code);
    if (translated === response.payload.code) {
      return response.payload.message;
    }

    return translated;
  }

  if (response.payload?.message) {
    return response.payload.message;
  }

  return translator("errors.generic");
};

export const getErrorMessageFromException = (error, translator) => {
  return getErrorMessage(
    {
      payload: error,
    },
    translator
  );
};
