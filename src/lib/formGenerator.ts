import { getTenantDb } from '@/lib/db';

export async function generateFormHtml(
  subdomain: string,
  type: 'ASSIGN' | 'RETURN',
  asset: any,
  userCtx: any,
  targetUserId: string,
  actionNotes?: string
): Promise<string> {
  const db = await getTenantDb(subdomain);
  const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
  
  const settingsRows = await db.tenantSetting.findMany();
  const settings = settingsRows.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as any);

  const companyName = settings.companyName || `${subdomain.toUpperCase()} A.Ş.`;
  const logoUrl = settings.companyLogoUrl;
  const assignTerms = settings.assignTerms || 'Aşağıda detayları belirtilen şirket donanımını eksiksiz ve çalışır durumda teslim aldığımı, kullanımım süresince donanımın güvenliğinden sorumlu olduğumu ve işten ayrılışımda aynı şekilde iade edeceğimi kabul, beyan ve taahhüt ederim.';
  const returnTerms = settings.returnTerms || 'Tarafıma zimmetlenmiş olan aşağıda detayları belirtilen şirket donanımını eksiksiz olarak IT departmanına iade ettiğimi beyan ederim.';
  
  const terms = type === 'ASSIGN' ? assignTerms : returnTerms;
  const title = type === 'ASSIGN' ? 'DONANIM ZİMMET TUTANAĞI' : 'DONANIM İADE TUTANAĞI';
  const showSerialNo = settings.showSerialNo !== 'false';
  const showNotes = settings.showNotes !== 'false';
  const footerText = settings.footerText || '';
  
  let layout = ['header', 'assetInfo', 'userInfo', 'notes', 'signatures'];
  if (settings.formLayout) {
    try {
      layout = JSON.parse(settings.formLayout);
    } catch (e) {}
  }

  let html = `<div class="p-8 bg-white text-slate-900 space-y-8 max-w-4xl mx-auto font-sans leading-relaxed">`;

  for (const block of layout) {
    if (block === 'header') {
      html += `
        <div class="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-8">
          <div class="flex-1">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="h-16 object-contain mb-4" />` : ''}
            <h1 class="text-2xl font-black text-slate-900 tracking-tight uppercase">${companyName}</h1>
          </div>
          <div class="text-right whitespace-nowrap pl-8">
            <h2 class="text-xl font-bold text-slate-800 uppercase tracking-wide">${title}</h2>
            <p class="text-slate-500 mt-2 font-medium">Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>
      `;
    }

    if (block === 'assetInfo') {
      html += `
        <div class="mb-8">
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Cihaz Bilgileri</h3>
          <table class="w-full text-sm border-collapse">
            <tbody>
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold w-1/3">Kategori:</td>
                <td class="py-3 font-medium text-slate-900">${asset.category?.name || '-'}</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold">Marka / Model:</td>
                <td class="py-3 font-medium text-slate-900">${asset.brandModel}</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold">Demirbaş No:</td>
                <td class="py-3 font-medium text-slate-900">${asset.demiRbasNo}</td>
              </tr>
              ${showSerialNo ? `
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold">Seri No:</td>
                <td class="py-3 font-medium text-slate-900">${asset.serialNo || '-'}</td>
              </tr>
              ` : ''}
              ${showNotes && actionNotes ? `
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold">İşlem Notu:</td>
                <td class="py-3 font-medium text-slate-900">${actionNotes}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      `;
    }

    if (block === 'userInfo') {
      html += `
        <div class="mb-8">
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Kullanıcı Bilgileri</h3>
          <table class="w-full text-sm border-collapse">
            <tbody>
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold w-1/3">Ad Soyad:</td>
                <td class="py-3 font-medium text-slate-900">${targetUser?.name || 'Kullanıcı'}</td>
              </tr>
              <tr class="border-b border-slate-100">
                <td class="py-3 text-slate-500 font-semibold">E-Posta:</td>
                <td class="py-3 font-medium text-slate-900">${targetUser?.email || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `;
    }

    if (block === 'notes') {
      html += `
        <div class="mb-8">
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2 mb-4">Taahhütname</h3>
          <div class="prose prose-sm max-w-none text-slate-800 font-medium text-justify">
            <p>${terms}</p>
          </div>
        </div>
      `;
    }

    if (block === 'signatures') {
      html += `
        <div class="grid grid-cols-2 gap-16 mt-16 pt-8">
          <div class="text-center">
            <p class="font-bold text-slate-900 text-lg mb-1">${userCtx?.user?.name || 'IT Departmanı'}</p>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-12">${type === 'ASSIGN' ? 'Teslim Eden' : 'Teslim Alan'}</p>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
            <p class="text-xs text-slate-400">İmza</p>
          </div>
          <div class="text-center">
            <p class="font-bold text-slate-900 text-lg mb-1">${targetUser?.name || 'Kullanıcı'}</p>
            <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-12">${type === 'ASSIGN' ? 'Teslim Alan' : 'İade Eden'}</p>
            <div class="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
            <p class="text-xs text-slate-400">İmza</p>
          </div>
        </div>
      `;
    }
  }

  if (footerText) {
    html += `
      <div class="mt-16 pt-6 border-t-2 border-slate-200 text-center text-xs text-slate-500 font-medium">
        ${footerText}
      </div>
    `;
  }

  html += `</div>`;
  return html;
}
