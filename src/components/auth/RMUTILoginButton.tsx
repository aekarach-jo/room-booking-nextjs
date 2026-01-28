'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface RMUTILoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

export function RMUTILoginButton({ className, variant = 'outline' }: RMUTILoginButtonProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleRMUTILogin = () => {
    setIsLoading(true);
    // Redirect to RMUTI SSO endpoint
    window.location.href = '/api/auth/rmuti';
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleRMUTILogin}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('auth.redirecting')}
        </>
      ) : (
        <>
          <RMUTILogo className="mr-2 h-5 w-5" />
          {t('auth.loginWithRMUTI')}
        </>
      )}
    </Button>
  );
}

// RMUTI Logo SVG Component
function RMUTILogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simple university/building icon representing RMUTI */}
      <path
        d="M12 2L2 7V9H22V7L12 2Z"
        fill="currentColor"
      />
      <path
        d="M4 10V20H8V14H10V20H14V14H16V20H20V10H4Z"
        fill="currentColor"
      />
      <path
        d="M2 21H22V23H2V21Z"
        fill="currentColor"
      />
    </svg>
  );
}
