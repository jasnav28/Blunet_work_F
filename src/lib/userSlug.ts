import { isMarketingHead, isMarketingIndividual } from './roleUtils';

export { isMarketingHead, isMarketingIndividual };

export const getUserSlug = (user: any): string => {
  if (!user) return 'user';
  
  const namePart = (user.name || 'user')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '');

  let roleSuffix = 'emp';
  const role = (user.role || '').toUpperCase();
  
  if (role === 'MARKETING_HEAD') {
    if (isMarketingHead(user)) {
      roleSuffix = 'marketing-head';
    } else {
      roleSuffix = 'marketing';
    }
  } else if (role === 'ADMIN') {
    roleSuffix = 'admin';
  } else if (role === 'FOUNDER') {
    roleSuffix = 'founder';
  } else if (isMarketingIndividual(user)) {
    roleSuffix = 'marketing';
  } else {
    roleSuffix = 'emp';
  }

  if (namePart === 'systemadministrator' || namePart === 'admin') {
    return 'admin';
  }

  return `${namePart}-${roleSuffix}`;
};
