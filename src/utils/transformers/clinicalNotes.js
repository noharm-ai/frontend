import { uniq } from '@utils/lodash';

export const transformClinicalNotes = clinicalNotes => {
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
};

export const getPositionList = clinicalNotes => {
  const positions = [];

  clinicalNotes.forEach(c => {
    if (c.position && c.position !== '') {
      positions.push(c.position);
    }
  });

  return uniq(positions).sort();
};
