import { requireAuth } from '@/lib/auth';
import { ChangePasswordForm } from './ChangePasswordForm';

export default async function ChangePasswordPage() {
  const session = await requireAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">Şifre Değişikliği Gerekli</h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Güvenliğiniz için lütfen ilk girişinizde şifrenizi değiştirin.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ChangePasswordForm email={session.email} subdomain={session.subdomain} />
        </div>
      </div>
    </div>
  );
}
