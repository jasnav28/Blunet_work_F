export const isMarketingHead = (user: any): boolean => {
  if (!user || user.role !== 'MARKETING_HEAD') return false;
  const des = (user.designation || '').toLowerCase();
  // If the designation specifies an individual role like executive, caller, specialist, agent, intern, associate
  if (
    des.includes('executive') ||
    des.includes('caller') ||
    des.includes('specialist') ||
    des.includes('associate') ||
    des.includes('intern') ||
    des.includes('representative') ||
    des.includes('agent')
  ) {
    return false;
  }
  // If designation includes 'head', 'lead', 'director', 'manager', or is empty/generic, they are head
  return true;
};

export const isMarketingIndividual = (user: any): boolean => {
  if (!user) return false;
  const des = (user.designation || '').toLowerCase();
  const dept = typeof user.department === 'string' ? user.department.toLowerCase() : (user.department?.name || '').toLowerCase();
  const isMkt = des.includes('marketing') || dept.includes('marketing') || user.role === 'MARKETING_HEAD';
  return isMkt && !isMarketingHead(user);
};
