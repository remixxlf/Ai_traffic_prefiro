'use client';

import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useRouter } from 'next/navigation';

/**
 * Página de Onboarding — acessível em /onboarding
 * Após conclusão, redireciona para o dashboard principal.
 */
export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = (empresaId: string) => {
    // Redireciona para o dashboard após completar o onboarding
    router.push(`/dashboard?empresaId=${empresaId}`);
  };

  return (
    <OnboardingWizard
      usuarioId="temp-user-id"
      onComplete={handleComplete}
    />
  );
}
