import { getUserScopedJson, setUserScopedJson } from './storage';

// Records are written only after a successful API response, scoped to the signed-in user.
export async function getImportedVehicles(user) {
  const records = await getUserScopedJson('search.imported', user, []);
  return Array.isArray(records) ? records : [];
}

export async function rememberImportedVehicle(user, car, previousId) {
  const records = await getImportedVehicles(user);
  await setUserScopedJson('search.imported', user, [car, ...records.filter(item => item.id !== car.id && item.id !== previousId)]);
}
