export default function transformClinicalNotes(clinicalNotes) {
  const groups = [];

  clinicalNotes.forEach(c => {
    const dt = c.date.substr(0, 10);

    if (groups[dt]) {
      groups[dt].push(c);
    } else {
      groups[dt] = [c];
    }
  });

  return groups;
}
