import slugify from 'slugify';
import isEmpty from 'lodash.isempty';

const noValues = [0, 'None', null, undefined];

export const stringify = (data = [], noValueSymbol = '#', separator = ' | ') =>
  !isEmpty(data)
    ? data.map(item => (noValues.includes(item) ? noValueSymbol : item)).join(separator)
    : '';

export const createSlug = function(/*arguments*/) {
  const args = arguments;
  return slugify(Array.from(args).join('-')).toLowerCase();
};
