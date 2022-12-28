const RenameObjectKey = (o, oldKey, newKey) => {
  const newObject = {};
  delete Object.assign(newObject, o, { [newKey]: o[oldKey] })[oldKey];
  return newObject
};

module.exports = { RenameObjectKey };
