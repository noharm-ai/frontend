export const getErrorMessage = (response, translator) => {
  console.error(response);

  if (response.payload?.code) {
    return translator(response.payload.code);
  }

  if (response.payload?.message) {
    return response.payload.message;
  }

  return translator("errors.generic");
};
