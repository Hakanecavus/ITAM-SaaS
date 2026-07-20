import { getTenantDb } from '@/lib/db';
import { notFound } from 'next/navigation';
import { PrintButton } from '@/components/PrintButton';
import fs from 'fs/promises';
import path from 'path';

export default async function AssignmentFormPage({
  params,
}: {
  params: Promise<{ subdomain: string; id: string; historyId: string }>;
}) {
  const resolvedParams = await params;
  const db = await getTenantDb(resolvedParams.subdomain);
  
  const asset = await db.asset.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true }
  });

  const history = await db.assetHistory.findUnique({
    where: { id: resolvedParams.historyId },
    include: { user: true }
  });

  if (!asset || !history) return notFound();

  // Fetch Tenant Settings
  const settingsArray = await db.tenantSetting.findMany();
  const settings = settingsArray.reduce((acc, setting) => {
    acc[setting.key] = setting.value;
    return acc;
  }, {} as Record<string, string>);

  const isAssign = history.actionType === 'ASSIGN';
  
  const companyName = settings.companyName || `${resolvedParams.subdomain.toUpperCase()} BİLİŞİM TEKNOLOJİLERİ`;
  const defaultAssignTerms = 'Yukarıda detayları belirtilen cihazı, eksiksiz ve çalışır durumda teslim aldım. Cihazın kullanımı ve muhafazası süresince doğabilecek her türlü sorumluluğun şahsıma ait olduğunu beyan ve kabul ederim.';
  const defaultReturnTerms = 'Yukarıda detayları belirtilen cihaz, ilgili kullanıcıdan kontrol edilerek iade alınmış ve kurum stoklarına eklenmiştir.';
  
  const termsText = isAssign ? (settings.assignTerms || defaultAssignTerms) : (settings.returnTerms || defaultReturnTerms);

  const showSerialNo = settings.showSerialNo !== 'false';
  const showNotes = settings.showNotes !== 'false';
  const footerText = settings.footerText || '';

  const DEFAULT_LAYOUT = ['header', 'assetInfo', 'userInfo', 'notes', 'signatures'];
  let layout = DEFAULT_LAYOUT;
  try {
    if (settings.formLayout) {
      layout = JSON.parse(settings.formLayout);
      // Fallback for missing blocks
      const missingBlocks = DEFAULT_LAYOUT.filter(b => !layout.includes(b));
      if (missingBlocks.length > 0) {
        layout = [...layout, ...missingBlocks];
      }
    }
  } catch (e) {}

  // Convert local and external logo to base64 to avoid html2canvas CORS / Loading issues
  let base64Logo = '';
  if (settings.companyLogoUrl) {
    if (settings.companyLogoUrl.startsWith('http')) {
      try {
        const response = await fetch(settings.companyLogoUrl, { cache: 'no-store' });
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const contentType = response.headers.get('content-type') || 'image/png';
          base64Logo = `data:${contentType};base64,${buffer.toString('base64')}`;
        } else {
          console.error('Failed to fetch external logo:', response.status);
          base64Logo = settings.companyLogoUrl; // Fallback to raw url
        }
      } catch (e) {
        console.error('Failed to fetch external logo:', e);
        base64Logo = settings.companyLogoUrl;
      }
    } else if (settings.companyLogoUrl.startsWith('/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', settings.companyLogoUrl);
        const ext = path.extname(filePath).substring(1).toLowerCase() || 'png';
        const mimeType = ext === 'svg' ? 'image/svg+xml' : (ext === 'jpg' ? 'image/jpeg' : `image/${ext}`);
        const imageBuffer = await fs.readFile(filePath);
        base64Logo = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      } catch (e) {
        console.error('Failed to load local logo for PDF:', e);
        base64Logo = settings.companyLogoUrl;
      }
    }
  }

  return (
    <div className="bg-[#ffffff] text-[#000000] p-8 max-w-4xl mx-auto flex flex-col relative shadow-2xl my-8 print:my-0 print:p-4 print:shadow-none" id="pdf-content">
      
      {/* 
        Inject global styles to hide the Sidebar and Header from the parent layout.tsx 
        so this page looks like a pure document viewer.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        aside { display: none !important; }
        header { display: none !important; }
        main { background-color: #f1f5f9 !important; }
        .max-w-7xl { max-width: 100% !important; margin: 0 !important; }
        @media print {
          @page { margin: 0; } /* Hides browser URL and Date headers/footers */
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}} />

      {/* Yazdırma Butonu (Sadece Ekranda Görünür, Print'te Gizlenir) */}
      <div className="mb-4 print:hidden flex justify-end">
        <PrintButton />
      </div>

      <div className="border-2 border-[#1e293b] p-6 flex-1 text-sm">
        
        {/* Dynamic Blocks based on Layout */}
        {layout.map((blockId) => {
          switch (blockId) {
            case 'header':
              return (
                <div key="header" className="flex items-center justify-between border-b-2 border-[#1e293b] pb-4 mb-4 break-inside-avoid">
                  <div className="flex-1">
                    <h1 className="text-xl font-bold uppercase tracking-wider text-center">{companyName}</h1>
                    <h2 className="text-base font-semibold mt-1 text-center text-[#334155]">
                      {isAssign ? 'CİHAZ TESLİM (ZİMMET) TUTANAĞI' : 'CİHAZ İADE TUTANAĞI'}
                    </h2>
                  </div>
                  {base64Logo && (
                    <div className="ml-4 flex-shrink-0 flex items-center justify-center">
                      <img 
                        src={base64Logo} 
                        alt="Company Logo" 
                        style={{ maxHeight: '64px', maxWidth: '200px', display: 'block' }} 
                        crossOrigin="anonymous"
                      />
                    </div>
                  )}
                </div>
              );

            case 'assetInfo':
              return (
                <div key="assetInfo" className="mb-4 break-inside-avoid">
                  <h3 className="text-base font-bold bg-[#f1f5f9] p-2 border border-[#1e293b] mb-2">Cihaz Bilgileri</h3>
                  <table className="w-full text-left border-collapse border border-[#1e293b] text-sm">
                    <tbody>
                      <tr>
                        <th className="border border-[#1e293b] p-2 w-1/3">Cihaz Kategorisi</th>
                        <td className="border border-[#1e293b] p-2">{asset.category.name}</td>
                      </tr>
                      <tr>
                        <th className="border border-[#1e293b] p-2">Marka / Model</th>
                        <td className="border border-[#1e293b] p-2">{asset.brandModel}</td>
                      </tr>
                      {showSerialNo && (
                        <tr>
                          <th className="border border-[#1e293b] p-2">Seri No</th>
                          <td className="border border-[#1e293b] p-2">{asset.serialNo || '-'}</td>
                        </tr>
                      )}
                      <tr>
                        <th className="border border-[#1e293b] p-2">Demirbaş No</th>
                        <td className="border border-[#1e293b] p-2">{asset.demiRbasNo}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );

            case 'userInfo':
              return (
                <div key="userInfo" className="mb-4 break-inside-avoid">
                  <h3 className="text-base font-bold bg-[#f1f5f9] p-2 border border-[#1e293b] mb-2">Kullanıcı Bilgileri</h3>
                  <table className="w-full text-left border-collapse border border-[#1e293b] text-sm">
                    <tbody>
                      <tr>
                        <th className="border border-[#1e293b] p-2 w-1/3">Adı Soyadı</th>
                        <td className="border border-[#1e293b] p-2">{history.user?.name || '-'}</td>
                      </tr>
                      <tr>
                        <th className="border border-[#1e293b] p-2">E-posta Adresi</th>
                        <td className="border border-[#1e293b] p-2">{history.user?.email || '-'}</td>
                      </tr>
                      <tr>
                        <th className="border border-[#1e293b] p-2">İşlem Tarihi</th>
                        <td className="border border-[#1e293b] p-2">{history.createdAt.toLocaleDateString('tr-TR')}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );

            case 'notes':
              return (
                <div key="notes" className="mb-6 break-inside-avoid">
                  {showNotes && (
                    <>
                      <h3 className="text-base font-bold bg-[#f1f5f9] p-2 border border-[#1e293b] mb-2">Açıklamalar / Notlar</h3>
                      <div className="border border-[#1e293b] p-3 min-h-16 text-sm">
                        {history.notes || 'Herhangi bir not eklenmemiştir.'}
                      </div>
                    </>
                  )}
                  <p className={`text-xs text-justify whitespace-pre-wrap ${showNotes ? 'mt-3' : ''}`}>
                    {termsText}
                  </p>
                </div>
              );

            case 'signatures':
              return (
                <div key="signatures" className="grid grid-cols-2 gap-8 text-center mt-8 pt-4 break-inside-avoid">
                  <div>
                    <p className="font-bold mb-12">{isAssign ? 'Teslim Eden (IT)' : 'Teslim Alan (IT)'}</p>
                    <p>Ad Soyad / İmza</p>
                  </div>
                  <div>
                    <p className="font-bold mb-12">{isAssign ? 'Teslim Alan (Kullanıcı)' : 'Teslim Eden (Kullanıcı)'}</p>
                    <p>Ad Soyad / İmza</p>
                  </div>
                </div>
              );

            default:
              return null;
          }
        })}

      </div>

      {/* Footer / Altbilgi */}
      {footerText && (
        <div className="absolute bottom-4 left-0 w-full text-center text-xs text-[#64748b] mt-8 pt-4 border-t border-[#cbd5e1]">
          {footerText}
        </div>
      )}
    </div>
  );
}
