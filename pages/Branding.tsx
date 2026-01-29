
import React, { useState, useRef } from 'react';
import { Save, RefreshCw, Palette, Building2, Globe, Mail, MapPin, Upload, Image as ImageIcon, Trash2, Link as LinkIcon, FileSignature } from 'lucide-react';
import { Branding } from '../types';

interface BrandingProps {
  branding: Branding;
  onUpdateBranding: (branding: Branding) => void;
}

const BrandingPage: React.FC<BrandingProps> = ({ branding, onUpdateBranding }) => {
  const [formData, setFormData] = useState<Branding>(branding);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const footerInputRef = useRef<HTMLInputElement>(null);
  const stampInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateBranding(formData);
      setIsSaving(false);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'headerImage' | 'footerImage' | 'stampSignature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegistryChange = (field: keyof Branding['registry'], value: string) => {
    setFormData({
      ...formData,
      registry: {
        ...formData.registry,
        [field]: value
      }
    });
  };

  const clearImage = (field: 'logo' | 'headerImage' | 'footerImage' | 'stampSignature') => {
    setFormData(prev => ({ ...prev, [field]: field === 'logo' ? '' : undefined }));
  };

  const useDefaultAssets = () => {
    setFormData(prev => ({
      ...prev,
      headerImage: 'https://reviranexgen.com/assets/header.jpg',
      footerImage: 'https://reviranexgen.com/assets/footer.jpg',
      stampSignature: 'https://reviranexgen.com/assets/stamp.png'
    }));
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in bg-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2E3191] tracking-tight uppercase">Branding & Theme</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Design your corporate identity across the ERP ecosystem.</p>
        </div>
        <div className="flex gap-4">
          <button 
            type="button"
            onClick={useDefaultAssets}
            className="text-[#2E3191] border-2 border-[#2E3191] px-6 py-4 rounded-2xl flex items-center gap-2 hover:bg-[#2E3191]/5 transition-all font-black text-xs uppercase tracking-widest active:scale-95"
          >
            <RefreshCw size={20} />
            Apply Defaults
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="text-white px-10 py-4 rounded-2xl flex items-center gap-3 hover:scale-105 transition-all shadow-2xl disabled:opacity-50 font-black text-xs uppercase tracking-widest active:scale-95"
            style={{ backgroundColor: formData.brandColor, boxShadow: `0 20px 30px -10px ${formData.brandColor}66` }}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? 'Synchronizing...' : 'Save Theme'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left: Visual Identity & Color */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8 hover:shadow-2xl transition-all">
            <h3 className="font-black text-[#2E3191] flex items-center gap-3 uppercase tracking-widest text-[10px]">
              <Palette size={20} style={{ color: formData.brandColor }} />
              Theme Engine
            </h3>
            
            <div className="space-y-8">
              {/* Brand Color */}
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Primary Theme Color</label>
                <div className="flex gap-5 items-center">
                  <div 
                    className="w-20 h-20 rounded-3xl border-4 border-white shadow-2xl cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: formData.brandColor }}
                  >
                    <input 
                      type="color" 
                      className="w-full h-full opacity-0 cursor-pointer"
                      value={formData.brandColor}
                      onChange={e => setFormData({...formData, brandColor: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 text-sm border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-mono font-black text-[#2E3191]"
                      value={formData.brandColor}
                      onChange={e => setFormData({...formData, brandColor: e.target.value})}
                    />
                    <p className="text-[8px] text-slate-300 mt-2 uppercase font-black tracking-widest">Hex Color Descriptor</p>
                  </div>
                </div>
              </div>

              {/* Logo Background Color Selection */}
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-50">
                <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4">Logo Backdrop Color</label>
                <div className="flex gap-5 items-center">
                  <div 
                    className="w-20 h-20 rounded-3xl border-4 border-white shadow-2xl cursor-pointer transition-transform hover:scale-110"
                    style={{ backgroundColor: formData.logoBackgroundColor }}
                  >
                    <input 
                      type="color" 
                      className="w-full h-full opacity-0 cursor-pointer"
                      value={formData.logoBackgroundColor}
                      onChange={e => setFormData({...formData, logoBackgroundColor: e.target.value})}
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 text-sm border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-mono font-black text-[#2E3191]"
                      value={formData.logoBackgroundColor}
                      onChange={e => setFormData({...formData, logoBackgroundColor: e.target.value})}
                    />
                    <p className="text-[8px] text-slate-300 mt-2 uppercase font-black tracking-widest">Logo Background Hex</p>
                  </div>
                </div>
              </div>

              {/* Company Logo Upload */}
              <div className="space-y-4">
                <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">Company Seal (Logo)</label>
                <div 
                  className="group relative h-56 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-8 overflow-hidden transition-all hover:border-[#2E3191] shadow-inner"
                  style={{ backgroundColor: formData.logoBackgroundColor }}
                >
                  {formData.logo ? (
                    <>
                      <img src={formData.logo} alt="Logo" className="max-h-full max-w-full object-contain animate-fade-in" />
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 bg-white rounded-xl text-[#2E3191] hover:scale-110 transition-transform"><Upload size={22}/></button>
                        <button type="button" onClick={() => clearImage('logo')} className="p-3 bg-white rounded-xl text-[#EC1C24] hover:scale-110 transition-transform"><Trash2 size={22}/></button>
                      </div>
                    </>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 text-slate-400 group-hover:text-[#2E3191] transition-colors">
                      <ImageIcon size={40} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Upload Master Seal</span>
                    </button>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle/Right: Image Overrides & Registry */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Header/Footer/Stamp Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all">
              <h3 className="font-black text-[#2E3191] uppercase tracking-widest text-[10px] flex items-center gap-3">
                <Upload size={16} className="text-[#EC1C24]" /> Document Header Strip
              </h3>
              <div className="group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-6 transition-all hover:bg-white hover:border-[#2E3191]">
                {formData.headerImage ? (
                  <>
                    <img src={formData.headerImage} alt="Header" className="max-h-full max-w-full object-contain rounded-xl" />
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => headerInputRef.current?.click()} className="p-3 bg-[#2E3191] text-white rounded-xl shadow-xl"><Upload size={20}/></button>
                      <button type="button" onClick={() => clearImage('headerImage')} className="p-3 bg-[#EC1C24] text-white rounded-xl shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </>
                ) : (
                  <button type="button" onClick={() => headerInputRef.current?.click()} className="text-slate-300 flex flex-col items-center gap-2 hover:text-[#2E3191] transition-colors">
                    <ImageIcon size={32} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Select Header Media</span>
                  </button>
                )}
                <input type="file" ref={headerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'headerImage')} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Or Header Asset URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-[10px] transition-all"
                    placeholder="https://example.com/header.jpg"
                    value={formData.headerImage || ''}
                    onChange={e => setFormData({...formData, headerImage: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all">
              <h3 className="font-black text-[#2E3191] uppercase tracking-widest text-[10px] flex items-center gap-3">
                <Upload size={16} className="text-[#EC1C24]" /> Document Footer Strip
              </h3>
              <div className="group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-6 transition-all hover:bg-white hover:border-[#2E3191]">
                {formData.footerImage ? (
                  <>
                    <img src={formData.footerImage} alt="Footer" className="max-h-full max-w-full object-contain rounded-xl" />
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => footerInputRef.current?.click()} className="p-3 bg-[#2E3191] text-white rounded-xl shadow-xl"><Upload size={20}/></button>
                      <button type="button" onClick={() => clearImage('footerImage')} className="p-3 bg-[#EC1C24] text-white rounded-xl shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </>
                ) : (
                  <button type="button" onClick={() => footerInputRef.current?.click()} className="text-slate-300 flex flex-col items-center gap-2 hover:text-[#2E3191] transition-colors">
                    <ImageIcon size={32} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Select Footer Media</span>
                  </button>
                )}
                <input type="file" ref={footerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'footerImage')} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Or Footer Asset URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-[10px] transition-all"
                    placeholder="https://example.com/footer.jpg"
                    value={formData.footerImage || ''}
                    onChange={e => setFormData({...formData, footerImage: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Stamp & Signature Section */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 hover:shadow-2xl transition-all">
              <h3 className="font-black text-[#2E3191] uppercase tracking-widest text-[10px] flex items-center gap-3">
                <FileSignature size={16} className="text-[#EC1C24]" /> Stamp & Signature
              </h3>
              <div className="group relative h-40 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-3xl flex items-center justify-center p-6 transition-all hover:bg-white hover:border-[#2E3191]">
                {formData.stampSignature ? (
                  <>
                    <img src={formData.stampSignature} alt="Stamp" className="max-h-full max-w-full object-contain rounded-xl" />
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" onClick={() => stampInputRef.current?.click()} className="p-3 bg-[#2E3191] text-white rounded-xl shadow-xl"><Upload size={20}/></button>
                      <button type="button" onClick={() => clearImage('stampSignature')} className="p-3 bg-[#EC1C24] text-white rounded-xl shadow-xl"><Trash2 size={20}/></button>
                    </div>
                  </>
                ) : (
                  <button type="button" onClick={() => stampInputRef.current?.click()} className="text-slate-300 flex flex-col items-center gap-2 hover:text-[#2E3191] transition-colors">
                    <FileSignature size={32} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Select Stamp Media</span>
                  </button>
                )}
                <input type="file" ref={stampInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'stampSignature')} />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-slate-300 uppercase tracking-widest ml-1">Or Stamp Asset URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                  <input 
                    type="text" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 text-[10px] transition-all"
                    placeholder="https://reviranexgen.com/assets/stamp.png"
                    value={formData.stampSignature || ''}
                    onChange={e => setFormData({...formData, stampSignature: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Registry Details */}
          <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-125 transition-transform duration-1000">
              <Building2 size={200} />
            </div>
            
            <h3 className="text-3xl font-black text-[#2E3191] mb-12 flex items-center gap-5 uppercase tracking-tighter">
              <Building2 size={40} className="text-[#EC1C24]" />
              Registry Data Core
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Entity Registered Identity</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-black text-[#2E3191] uppercase tracking-tight transition-all"
                    value={formData.registry.name}
                    onChange={e => handleRegistryChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Universal Digital Hub (Website)</label>
                  <div className="relative">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="text" 
                      className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                      value={formData.registry.website}
                      onChange={e => handleRegistryChange('website', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Corporate Registration (CIN)</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-mono font-black text-[#EC1C24] transition-all"
                    value={formData.registry.cin}
                    onChange={e => handleRegistryChange('cin', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Master Digital Channel (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      type="email" 
                      className="w-full pl-14 pr-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-700 transition-all"
                      value={formData.registry.email}
                      onChange={e => handleRegistryChange('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-[#EC1C24]" /> Nagpur Regional Hub
                  </label>
                  <textarea 
                    className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none h-32 text-xs font-bold leading-relaxed transition-all"
                    value={formData.registry.nagpurOffice}
                    onChange={e => handleRegistryChange('nagpurOffice', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-[0.2em] flex items-center gap-2 mb-2">
                    <MapPin size={14} className="text-[#EC1C24]" /> Delhi Strategic H.O.
                  </label>
                  <textarea 
                    className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none h-32 text-xs font-bold leading-relaxed transition-all"
                    value={formData.registry.delhiOffice}
                    onChange={e => handleRegistryChange('delhiOffice', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BrandingPage;
