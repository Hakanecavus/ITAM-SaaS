import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SetupPasswordForm } from './SetupPasswordForm';
import { KeyRound } from 'lucide-react';

export default async function SetupPasswordPage({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) {
  // allowSetup = true diyerek bu sayfaya erişimine izin veriyoruz
  const session = await requireAuth(true);
  const resolvedParams = await params;

  // Eğer kullanıcının şifre değiştirmesine gerek yoksa, onu dashboard'a yönlendir
  if (!session.mustChangePassword) {
    redirect(`/my-assets`);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100 dark:border-slate-800">
          
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform -rotate-6">
            <KeyRound size={32} />
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-3">
              Hesabınızı Güvenceye Alın
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Sisteme giriş yapabilmek için geçici şifrenizi, kendi belirlediğiniz güçlü bir şifre ile değiştirmeniz gerekmektedir.
            </p>
          </div>

          <SetupPasswordForm subdomain={resolvedParams.subdomain} />

        </div>
      </div>
    </div>
  );
}
