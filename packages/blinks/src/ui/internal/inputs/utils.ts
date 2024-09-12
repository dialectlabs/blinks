export const buildDefaultTextDescription = ({
  min,
  max,
}: {
  min?: number;
  max?: number;
}) => {
  if (min && max) return `Type between ${min} and ${max} characters`;
  if (min) return `Type minimum ${min} characters`;
  if (max) return `Type maximum ${max} characters`;
  return null;
};

export const buildDefaultNumberDescription = ({
  min,
  max,
}: {
  min?: number;
  max?: number;
}) => {
  if (min && max) return `Enter a number between ${min} and ${max}`;
  if (min) return `Enter a number greater than ${min}`;
  if (max) return `Enter a number less than ${max}`;
  return null;
};

export const buildDefaultDateDescription = ({
  min,
  max,
  includeTime,
}: {
  min?: string;
  max?: string;
  includeTime?: boolean;
}) => {
  const minDate = min ? new Date(min) : null;
  const maxDate = max ? new Date(max) : null;
  const formatter = new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: includeTime ? 'numeric' : undefined,
    minute: includeTime ? 'numeric' : undefined,
  });

  if (minDate && maxDate)
    return `Pick a date between ${formatter.format(minDate)} and ${formatter.format(maxDate)}`;
  if (minDate) return `Pick a date after ${formatter.format(minDate)}`;
  if (maxDate) return `Pick a date before ${formatter.format(maxDate)}`;
  return null;
};

export const buildDefaultCheckboxGroupDescription = ({
  min,
  max,
}: {
  min?: number;
  max?: number;
}) => {
  if (min && max) return `Select between ${min} and ${max} options`;
  if (min) return `Select minimum ${min} options`;
  if (max) return `Select maximum ${max} options`;
  return null;
};
