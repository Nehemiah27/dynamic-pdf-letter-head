import React from 'react';
import { Quotation, Branding, Client, Project, WorkflowType } from '../types';

interface QuotationPreviewProps {
  quotation: Quotation;
  branding: Branding;
  client: Client;
  project: Project;
}

const QuotationPreview: React.FC<QuotationPreviewProps> = ({ quotation, branding, client, project }) => {
  const sections = quotation.sections;
  const showsIndex = project.workflow === WorkflowType.SUPPLY_AND_FABRICATION;

  const PageSeparator = ({ num }: { num: number }) => (
    <div className="no-print w-full flex items-center gap-4 py-12 pointer-events-none select-none">
      <div className="h-px flex-1 bg-dashed border-t-2 border-slate-100"></div>
      <div className="px-4 py-1 bg-slate-50 border border-slate-100 rounded-full flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[#EC1C24] animate-pulse"></div>
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">SYSTEM PAGE {num < 10 ? `0${num}` : num}</span>
      </div>
      <div className="h-px flex-1 bg-dashed border-t-2 border-slate-100"></div>
    </div>
  );

  const OfficialFooter = (pageNum?: number) => (
    <div className="mt-auto no-print">
      {branding.footerImage ? (
        <div className="w-full relative">
          <img src={branding.footerImage} alt="Footer Banner" className="w-full object-fill h-32 mb-0" />
          {pageNum && (
            <div className="absolute bottom-1 right-2 text-[5px] font-black text-slate-400 uppercase tracking-widest bg-white/10 px-1 rounded">
              Pg. {pageNum}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-between items-end border-t border-slate-100 pt-4 p-8">
          <div className="grid grid-cols-2 gap-8 text-[9px] text-slate-500 font-medium">
            <div className="space-y-1">
              <p className="font-black text-[#EC1C24] uppercase tracking-widest text-[10px]">Nagpur - Office</p>
              <p>📞 {branding.registry.phone1}</p>
              <p>✉️ {branding.registry.email}</p>
              <p>📍 {branding.registry.nagpurOffice}</p>
            </div>
            <div className="space-y-1">
              <p className="font-black text-[#EC1C24] uppercase tracking-widest text-[10px]">Delhi - (H.O.)</p>
              <p>📞 {branding.registry.phone2}</p>
              <p>✉️ info@reviranexgen.com</p>
              <p>📍 {branding.registry.delhiOffice}</p>
            </div>
          </div>
          {pageNum && (
            <div className="text-[5px] font-black text-slate-500 uppercase tracking-[0.2em]">
              Pg. {pageNum}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const HeaderSection = () => (
    branding.headerImage ? (
      <div className="w-full mb-8">
        <img src={branding.headerImage} alt="Header" className="w-full object-contain" />
      </div>
    ) : (
      <div className="flex justify-between items-start mb-12 p-12 pb-0">
        <div className="flex flex-col">
          <div 
            className="p-3 rounded-xl mb-2 flex items-center justify-center" 
            style={{ backgroundColor: branding.logoBackgroundColor || 'transparent' }}
          >
            <img src={branding.logo} alt="Logo" className="h-14 object-contain" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{branding.headerText}</p>
        </div>
        <div className="text-right">
          <h1 className="text-xl font-black text-[#2E3191]">{branding.registry.name}</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase">CIN: {branding.registry.cin}</p>
        </div>
      </div>
    )
  );

  const StampOverlay = () => (
    branding.stampSignature ? (
      <div 
        className="absolute z-[100] pointer-events-none opacity-90"
        style={{
          right: '50px',
          bottom: '100px',
          width: '70px',
          height: '70px'
        }}
      >
        <img src={branding.stampSignature} alt="Official Stamp" className="w-full h-full object-contain" />
      </div>
    ) : null
  );

  let globalPageCounter = 1;

  return (
    <div className="bg-white print:p-0 min-h-screen font-['Inter'] text-slate-800">
      {/* PAGE 1: COVER LETTER */}
      <div className="max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden">
        <HeaderSection />
        <StampOverlay />

        <div className="flex-1 px-12 pb-12">
          <div className="mb-10 text-[12px] leading-relaxed">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p><span className="font-bold">Ref.:</span> {quotation.refNo}</p>
                <p><span className="font-bold">Enquiry No.:</span> {quotation.enquiryNo}</p>
                <p><span className="font-bold">Project Location:</span> {quotation.location}</p>
              </div>
              <div className="text-right space-y-1">
                <p><span className="font-bold">Date:</span> {quotation.date}</p>
                <p><span className="font-bold">Revision:</span> R-00{quotation.version - 1}</p>
              </div>
            </div>
          </div>

          <div className="mb-4 text-center">
            <h2 className="text-lg font-black border-b-2 border-slate-900 inline-block pb-0.5 px-4 uppercase tracking-tight">{quotation.introText}</h2>
          </div>

          <div className="mb-8 text-[12px]">
            <p className="font-bold mb-2 uppercase text-slate-400">To,</p>
            <div className="ml-4 space-y-1 pt-2">
              <p className="font-black text-[#2E3191] text-sm uppercase">M/s {quotation.recipientName}</p>
              <p className="font-bold text-slate-500 uppercase">{quotation.location}</p>
              <div className="pt-4">
                <p className="font-bold text-slate-900">Subject: <span className="font-bold">{quotation.subject}</span></p>
                <p className="font-bold pt-4">{quotation.salutation}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 text-[12px] leading-relaxed ml-4 text-slate-700">
            {quotation.introBody.split('\n\n').map((para, idx) => (
              <p key={idx} className="text-left leading-6">{para}</p>
            ))}
          </div>

          <div className="mt-16 text-[12px] ml-4">
            <p className="font-bold mb-4 text-slate-400 uppercase tracking-widest">Regards,</p>
            <div className="space-y-1">
              <p className="font-black text-lg text-[#2E3191] leading-tight">{quotation.regardsName}</p>
              <p className="font-bold text-slate-700">Mo: <span className="font-normal">{quotation.regardsPhone}</span></p>
              <p className="font-bold text-slate-700">Email: <span className="font-normal text-blue-600 underline">{quotation.regardsEmail}</span></p>
            </div>
          </div>
        </div>

        {OfficialFooter(globalPageCounter++)}
      </div>

      <PageSeparator num={globalPageCounter} />

      {/* PAGE 2: INDEX (Conditional) */}
      {showsIndex && (
        <div className="max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden">
          <HeaderSection />
          <StampOverlay />
          
          <div className="flex-1 px-12 pb-12">
            <div className="mb-12 text-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] border-b-2 border-[#EC1C24] inline-block pb-1 px-16">INDEX</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="quotation-table w-full border-collapse text-[11px] border border-slate-400" style={{ tableLayout: 'fixed' }}>
                <thead>
                  <tr className="header-row">
                    <th className="border border-slate-400 p-[5px] text-center font-black uppercase w-[80px]">Sr. No.</th>
                    <th className="border border-slate-400 p-[5px] text-left font-black uppercase">Subject</th>
                    <th className="border border-slate-400 p-[5px] text-center font-black uppercase w-[120px]">Page No.</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, idx) => (
                    <tr key={section.id} className={idx % 2 !== 0 ? 'zebra-row' : ''}>
                      <td className="border border-slate-400 p-[5px] text-center font-bold text-slate-700 w-[80px]">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="border border-slate-400 p-[5px] text-left font-bold text-[#2E3191] uppercase tracking-tight break-words">
                        <a href={`#section-${section.id}`} className="hover:underline">{section.title}</a>
                      </td>
                      <td className="border border-slate-400 p-[5px] text-center font-bold text-slate-400 w-[120px]">
                        {idx + 3}
                      </td>
                    </tr>
                  ))}
                  {quotation.designMockups && quotation.designMockups.length > 0 && (
                    <tr className={sections.length % 2 !== 0 ? 'zebra-row' : ''}>
                      <td className="border border-slate-400 p-[5px] text-center font-bold text-slate-700 w-[80px]">{(sections.length + 1).toString().padStart(2, '0')}</td>
                      <td className="border border-slate-400 p-[5px] text-left font-bold text-[#2E3191] uppercase tracking-tight break-words">
                        DESIGN MOCKUP
                      </td>
                      <td className="border border-slate-400 p-[5px] text-center font-bold text-slate-400 w-[120px]">
                        {sections.length + 3}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {OfficialFooter(globalPageCounter++)}
        </div>
      )}

      {showsIndex && <PageSeparator num={globalPageCounter} />}

      {/* PAGE 3+: DYNAMIC CONTENT */}
      {sections.map((section, idx) => (
        <React.Fragment key={section.id}>
          <div id={`section-${section.id}`} className="max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden">
            <HeaderSection />
            <StampOverlay />

            <div className="flex-1 px-12 pb-12">
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-900 tracking-tight uppercase border-l-4 border-[#EC1C24] pl-4">
                  {section.title}
                </h3>
              </div>

              {section.content && (
                <div className="text-[12px] text-slate-700 mb-6 leading-relaxed text-left whitespace-pre-wrap">
                  {section.content}
                </div>
              )}

              {section.type === 'table' && (
                <div className="overflow-x-auto mb-8">
                  <table className="quotation-table w-full border-collapse text-[11px] border border-slate-400" style={{ tableLayout: 'fixed' }}>
                    <thead>
                      <tr className="header-row">
                        {section.headers.map((h, i) => {
                          const hText = h.toLowerCase();
                          const isSrNo = (hText.includes('sr.') || hText.includes('sl.') || hText.includes('sr. no.') || hText.includes('sl. no.') || hText === 'no' || hText === 'no.');
                          
                          const customWidth = section.columnWidths?.[i];
                          
                          let width = 'auto';
                          if (isSrNo) width = '80px'; // Forced fixed 80px for Sr. No.
                          else if (customWidth) width = `${customWidth}mm`;
                          else if (hText.includes('uom') || hText.includes('qty')) width = '80px';
                          else if (hText.includes('rate') || hText.includes('amount')) width = '120px';

                          return (
                            <th key={i} style={{ width }} className={`border border-slate-400 p-[5px] font-black uppercase break-words ${
                              isSrNo ? 'text-center' : 'text-left'
                            }`}>
                              {isSrNo ? 'Sr. No.' : h}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {section.rows.map((row, ri) => (
                        <tr key={ri} className={ri % 2 !== 0 ? 'zebra-row' : ''}>
                          {row.map((cell, ci) => {
                            const hText = section.headers[ci]?.toLowerCase() || '';
                            const isSrNo = (hText.includes('sr.') || hText.includes('sl.') || hText.includes('sr. no.') || hText.includes('sl. no.') || hText === 'no' || hText === 'no.');
                            const isNumeric = hText.includes('rate') || hText.includes('amount') || hText.includes('qty');
                            return (
                              <td key={ci} className={`border border-slate-400 p-[5px] font-medium text-slate-800 break-words ${
                                isSrNo ? 'text-center font-bold align-top' : 
                                isNumeric ? 'text-right align-top' : 'text-left align-top'
                              }`}>
                                <div className="whitespace-pre-wrap leading-relaxed h-auto overflow-visible">{cell}</div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {(section.type === 'list' || section.type === 'mixed') && (
                <div className="space-y-4 text-[12px] leading-relaxed">
                  {section.items && section.items.length > 0 && (
                    <ul className="space-y-4 pl-6">
                      {section.items.map((item, i) => (
                        <li key={i} className="list-disc marker:text-[#EC1C24] text-slate-700 font-normal leading-relaxed text-left">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {idx === sections.length - 1 && (
                <div className="mt-16 text-left space-y-8 animate-fade-in pb-12">
                  <div className="text-[12px] text-slate-700 font-medium max-w-full space-y-4">
                    {(quotation.closingBody || '').split('\n\n').map((para, pIdx) => (
                      <p key={pIdx} className="text-left leading-6">{para}</p>
                    ))}
                  </div>
                  <div className="pt-10 border-t border-slate-100">
                    <p className="font-bold text-[12px] mb-3 text-slate-900 tracking-tight italic">Thanking you</p>
                    <h4 className="text-base font-black text-[#2E3191] uppercase tracking-tighter leading-tight">{branding.registry.name}</h4>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mt-16 text-center">!! End of Documents!!</p>
                  </div>
                </div>
              )}
            </div>
            {OfficialFooter(globalPageCounter++)}
          </div>
          {idx < sections.length - 1 && <PageSeparator num={globalPageCounter} />}
        </React.Fragment>
      ))}

      {/* FINAL PAGE: DESIGN MOCKUP */}
      {quotation.designMockups && quotation.designMockups.length > 0 && (
        <>
          <PageSeparator num={globalPageCounter} />
          <div className="max-w-4xl mx-auto shadow-sm border border-slate-100 mb-0 print:shadow-none print:border-none print:mb-0 print:p-0 relative page-break min-h-[1120px] flex flex-col overflow-hidden">
            <HeaderSection />
            <StampOverlay />
            <div className="flex-1 px-12 pb-12">
              <div className="mb-8">
                <h3 className="text-sm font-black text-[#EC1C24] tracking-tight uppercase border-b-2 border-[#EC1C24] inline-block pb-1">
                  Design Mockup
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-12">
                {quotation.designMockups.map((mockup, midx) => (
                  <div key={midx} className="w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                    <img src={mockup} alt={`Design Mockup ${midx + 1}`} className="w-full object-contain max-h-[700px] bg-slate-50" />
                  </div>
                ))}
              </div>
            </div>
            {OfficialFooter(globalPageCounter++)}
          </div>
        </>
      )}

      <style>{`
        @media print {
          .page-break { page-break-after: always; break-after: page; }
          body { background-color: white !important; }
          .no-print { display: none !important; }
        }
        .header-row { background-color: #FDF2F2 !important; }
        .zebra-row { background-color: #F9F9FA !important; }
        .quotation-table { border: 1px solid #94a3b8 !important; border-collapse: collapse !important; width: 100% !important; }
        .quotation-table th, .quotation-table td { border: 1px solid #94a3b8 !important; padding: 6px !important; }
        .quotation-table th { color: #1e293b; line-height: 1.2; text-align: center; vertical-align: middle; }
        .quotation-table td { line-height: 1.5; }
      `}</style>
    </div>
  );
};

export default QuotationPreview;