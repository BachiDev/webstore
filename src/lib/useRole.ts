import { useUser } from './UserContext';

export const useRole = () => {
  const { role } = useUser();

  const isStarter = role === 'Starter' || role === 'Pro' || role === 'Premium';
  const isPro = role === 'Pro' || role === 'Premium';
  const isPremium = role === 'Premium';

  return { isStarter, isPro, isPremium };
};
