'use client';

import { useState } from 'react';
import { saveEmailTemplates, saveEmailRules } from '@/app/actions/settings';
import { Save, Loader2, Plus, Trash2, Edit2, Check, X, Settings2, FileText, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface EmailRule {
  isEnabled: boolean;
  templateId: string;
}

export const AVAILABLE_ACTIONS = [
  { id: 'ASSIGN', name: 'Zimmetleme İşlemi (Cihaz Teslim)' },
  { id: 'RETURN', name: 'İade İşlemi (Cihaz İade Alındığında)' },
  { id: 'STATUS_CHANGE', name: 'Durum Değişikliği (Arızalandı vb.)' },
  { id: 'RETIRE', name: 'Hurdaya Ayırma / Kayıp Bildirimi' }
];

export function EmailSettingsManager({ 
  subdomain, 
  initialTemplates,
  initialRules
}: { 
  subdomain: string,
  initialTemplates: EmailTemplate[],
  initialRules: Record<string, EmailRule>
}) {
  const [activeTab, setActiveTab] = useState<'RULES' | 'TEMPLATES'>('RULES');
  
  // State for Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>(initialTemplates);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savingTemplates, setSavingTemplates] = useState(false);

  // State for Rules
  const [rules, setRules] = useState<Record<string, EmailRule>>(initialRules);
  const [savingRules, setSavingRules] = useState(false);
  const router = useRouter();

  // ----- RULES TAB HANDLERS -----
  const handleRuleChange = (actionId: string, field: 'isEnabled' | 'templateId', value: any) => {
    setRules(prev => ({
      ...prev,
      [actionId]: {
        ...prev[actionId],
        [field]: value
      }
    }));
  };

  const handleSaveRules = async () => {
    setSavingRules(true);
    const res = await saveEmailRules(subdomain, rules);
    if (res.error) alert(res.error);
    else {
      alert('Kurallar başarıyla kaydedildi.');
      router.refresh();
    }
    setSavingRules(false);
  };

  // ----- TEMPLATES TAB HANDLERS -----
  const handleAddTemplate = () => {
    const newTemplate: EmailTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Yeni Şablon',
      subject: 'ITAM SaaS - Bildirim: {{assetName}}',
      body: `<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>ITAM SaaS - Bildirim</h2>
  <p>Merhaba <strong>{{userName}}</strong>,</p>
  <p><strong>{{companyName}}</strong> tarafından üzerinize bir cihaz işlemi yapıldı.</p>
  
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Cihaz Adı:</strong> {{assetName}}</p>
    <p style="margin: 5px 0;"><strong>Demirbaş No:</strong> {{assetTag}}</p>
    <p style="margin: 5px 0;"><strong>Tarih:</strong> {{returnDate}}</p>
  </div>

  <div style="text-align: center; margin-top: 30px;">
    <a href="{{actionLink}}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Detayları Görüntüle</a>
  </div>
</div>`
    };
    setEditingTemplate(newTemplate);
    setShowPreview(false);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz? Eğer kurallarda kullanılıyorsa hata alabilirsiniz.')) return;
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveTemplateList = async (newList: EmailTemplate[]) => {
    setSavingTemplates(true);
    const res = await saveEmailTemplates(subdomain, newList);
    if (res.error) alert(res.error);
    else {
      setTemplates(newList);
      setEditingTemplate(null);
      alert('Şablon başarıyla kaydedildi.');
      router.refresh();
    }
    setSavingTemplates(false);
  };

  const handleSaveEditingTemplate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTemplate) return;
    
    let newList = [...templates];
    const index = newList.findIndex(t => t.id === editingTemplate.id);
    if (index >= 0) {
      newList[index] = editingTemplate;
    } else {
      newList.push(editingTemplate);
    }
    handleSaveTemplateList(newList);
  };

  return (
    <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-white/40 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden">
      
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => { setActiveTab('RULES'); setEditingTemplate(null); }}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${
            activeTab === 'RULES' 
              ? 'text-fuchsia-600 border-b-2 border-fuchsia-600 bg-fuchsia-50/50 dark:bg-fuchsia-900/10' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Settings2 size={18} /> Kural Motoru
        </button>
        <button 
          onClick={() => setActiveTab('TEMPLATES')}
          className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold transition-all ${
            activeTab === 'TEMPLATES' 
              ? 'text-fuchsia-600 border-b-2 border-fuchsia-600 bg-fuchsia-50/50 dark:bg-fuchsia-900/10' 
              : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <FileText size={18} /> Şablon Yöneticisi
        </button>
      </div>

      <div className="p-8">
        
        {/* === RULES TAB === */}
        {activeTab === 'RULES' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Hangi aksiyonda hangi şablon gönderilsin?</h2>
              <p className="text-sm text-slate-500">Listeden istediğiniz aksiyonu aktif edip, gönderilmesini istediğiniz e-posta şablonunu seçebilirsiniz.</p>
            </div>

            <div className="space-y-4">
              {AVAILABLE_ACTIONS.map(action => {
                const rule = rules[action.id] || { isEnabled: false, templateId: '' };
                return (
                  <div key={action.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      {/* Custom Toggle */}
                      <button 
                        onClick={() => handleRuleChange(action.id, 'isEnabled', !rule.isEnabled)}
                        className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${rule.isEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform ${rule.isEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </button>
                      <div className="font-semibold text-slate-700 dark:text-slate-200">{action.name}</div>
                    </div>

                    <div className="flex-1 md:max-w-xs">
                      <select 
                        disabled={!rule.isEnabled}
                        value={rule.templateId}
                        onChange={(e) => handleRuleChange(action.id, 'templateId', e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all disabled:opacity-50"
                      >
                        <option value="">-- Şablon Seçin --</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-8">
              <button 
                onClick={handleSaveRules}
                disabled={savingRules}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-fuchsia-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
              >
                {savingRules ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Kuralları Kaydet
              </button>
            </div>
          </div>
        )}

        {/* === TEMPLATES TAB === */}
        {activeTab === 'TEMPLATES' && !editingTemplate && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Mevcut Şablonlar</h2>
                <p className="text-sm text-slate-500">Sistemde kayıtlı e-posta şablonları.</p>
              </div>
              <button 
                onClick={handleAddTemplate}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Plus size={18} /> Yeni Şablon Ekle
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Henüz hiç e-posta şablonu oluşturmadınız.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(template => (
                  <div key={template.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between group">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg mb-1">{template.name}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-1">Konu: {template.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <button 
                        onClick={() => setEditingTemplate(template)}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-8">
               <button 
                onClick={() => handleSaveTemplateList(templates)}
                disabled={savingTemplates}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-fuchsia-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
              >
                {savingTemplates ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        )}

        {/* === EDIT TEMPLATE === */}
        {activeTab === 'TEMPLATES' && editingTemplate && (
          <form onSubmit={handleSaveEditingTemplate} className="space-y-6 animate-in slide-in-from-right-4">
            
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <button type="button" onClick={() => setEditingTemplate(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500">
                  <ArrowLeft size={20} />
                </button>
                Şablon Düzenle
              </h2>
              <button 
                type="button" 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg"
              >
                {showPreview ? <><EyeOff size={16} /> Editöre Dön</> : <><Eye size={16} /> Önizlemeyi Göster</>}
              </button>
            </div>

            <div className={showPreview ? 'hidden' : 'space-y-6'}>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Şablon Adı</label>
                <input 
                  required
                  value={editingTemplate.name}
                  onChange={(e) => setEditingTemplate({...editingTemplate, name: e.target.value})}
                  placeholder="Örn: Standart İade Şablonu"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">E-Posta Konusu (Subject)</label>
                <input 
                  required
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                  placeholder="Yeni Cihaz Zimmeti: {{assetName}}"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">E-Posta İçeriği (HTML Body)</label>
                <textarea 
                  required
                  value={editingTemplate.body}
                  onChange={(e) => setEditingTemplate({...editingTemplate, body: e.target.value})}
                  rows={14}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-fuchsia-500 outline-none transition-all font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-200/50 dark:border-amber-500/20 text-sm text-amber-700 dark:text-amber-300/80">
                <span className="font-bold">Kullanılabilir Değişkenler:</span> {`{{userName}}`}, {`{{assetName}}`}, {`{{assetTag}}`}, {`{{companyName}}`}, {`{{returnDate}}`}, {`{{actionLink}}`}
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  disabled={savingTemplates}
                  type="submit" 
                  className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-fuchsia-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-70"
                >
                  {savingTemplates ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  Taslağı Onayla (Ana Menüden Kaydedin)
                </button>
              </div>
            </div>

            {showPreview && (
              <div className="space-y-4 animate-in fade-in">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Gönderilecek Konu</span>
                  <div className="text-slate-800 dark:text-slate-200">
                    {editingTemplate.subject
                      .replace(/\{\{userName\}\}/g, 'Ahmet Yılmaz')
                      .replace(/\{\{assetName\}\}/g, 'Apple MacBook Pro M3')
                      .replace(/\{\{assetTag\}\}/g, 'IT-MAC-0042')
                      .replace(/\{\{companyName\}\}/g, 'Bilişim Teknolojileri A.Ş.')
                      .replace(/\{\{returnDate\}\}/g, '25.12.2026')}
                  </div>
                </div>
                
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white">
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-xs font-medium text-slate-400 ml-2">E-posta İstemcisi Önizlemesi</span>
                  </div>
                  <div 
                    className="p-6"
                    dangerouslySetInnerHTML={{ __html: editingTemplate.body
                      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                      .replace(/\{\{userName\}\}/g, 'Ahmet Yılmaz')
                      .replace(/\{\{assetName\}\}/g, 'Apple MacBook Pro M3')
                      .replace(/\{\{assetTag\}\}/g, 'IT-MAC-0042')
                      .replace(/\{\{companyName\}\}/g, 'Bilişim Teknolojileri A.Ş.')
                      .replace(/\{\{returnDate\}\}/g, '25.12.2026')
                      .replace(/\{\{actionLink\}\}/g, '#')
                    }} 
                  />
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
