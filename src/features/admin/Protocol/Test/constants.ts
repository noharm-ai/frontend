// backend caps idPrescriptionList at 10 per request; 5 keeps each request
// comfortably inside the 30s API window
export const CHUNK_SIZE = 5;
