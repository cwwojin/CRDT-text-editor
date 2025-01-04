const escapeRegExp = (string: string) => {
  return string.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
};

export const allowedDocumentNameRegex = (name: string) => {
  const replacedName = escapeRegExp(name).replaceAll(/\*/g, '.*');

  return new RegExp(`^${replacedName}$`);
};
