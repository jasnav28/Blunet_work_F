import React from 'react';
import AuthSectionTwo from '../components/ui/auth-section-2';
import { NetworkStatusBanner } from '../components/common/NetworkStatusBanner';

export const LoginPage: React.FC = () => {
  return (
    <>
      <NetworkStatusBanner />
      <AuthSectionTwo />
    </>
  );
};
