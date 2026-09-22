export const getUserSlug = (user: any): string => {
  if (!user) return 'user';
  
  const namePart = (user.name || 'user')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

  let roleSuffix = 'emp';
  const role = (user.role || '').toUpperCase();
  if (role === 'MARKETING_HEAD') roleSuffix = 'marketing';
  else if (role === 'ADMIN') roleSuffix = 'admin';
  else if (role === 'FOUNDER') roleSuffix = 'founder';
  else if (role === 'EMPLOYEE') roleSuffix = 'emp';
  else roleSuffix = role ? role.toLowerCase() : 'emp';

  if (namePart === 'systemadministrator' || namePart === 'admin') {
    return 'admin';
  }

  return `${namePart}-${roleSuffix}`;
};
