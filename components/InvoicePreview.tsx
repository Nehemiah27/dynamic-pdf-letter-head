import React from 'react';
import { Invoice, Branding, Client, Project } from '../types';

interface InvoicePreviewProps {
  invoice: Invoice;
  branding: Branding;
  client: Client;
  project: Project;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, branding, client, project }) => {
  const basicTotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const igst = invoice.taxType === 'Inter-State' ? basicTotal * 0.18 : 0;
  const cgst = invoice.taxType === 'Intra-State' ? basicTotal * 0.09 : 0;
  const sgst = invoice.taxType === 'Intra-State' ? basicTotal * 0.09 : 0;
  const grandTotal = basicTotal + igst + cgst + sgst;
  const rounded = Math.round(grandTotal);
  const roundOff = rounded - grandTotal;

  return (
    <div className="w-full max-w-[210mm] bg-white p-[10mm] border border-slate-200 mx-auto shadow-2xl print:p-0 print:border-none print:shadow-none text-slate-900 font-['Inter']">
      <div className="border-[0.5pt] border-slate-900 flex flex-col min-h-[277mm]">
        {/* Title Bar */}
        <div className="text-center py-1.5 border-b-[0.5pt] border-slate-900 bg-slate-100">
          <h1 className="text-sm font-black uppercase tracking-[0.2em]">PROFORMA INVOICE</h1>
        </div>

        {/* Corporate Header */}
        {branding.headerImage ? (
           <div className="w-full border-b-[0.5pt] border-slate-900">
              <img src={branding.headerImage} alt="Brand Header" className="w-full h-auto block" />
           </div>
        ) : (
          <div className="flex border-b-[0.5pt] border-slate-900 p-4 items-center">
            <div className="w-1/3">
              <img src={branding.logo} alt="Company Logo" className="h-16 object-contain" />
            </div>
            <div className="w-2/3 text-center pr-12">
              <h2 className="text-xl font-black text-[#2E3191] leading-tight">{branding.registry.name}</h2>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">CIN - {branding.registry.cin}</p>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-12 border-b-[0.5pt] border-slate-900 text-[8.5pt] leading-tight">
          <div className="col-span-5 border-r-[0.5pt] border-slate-900 p-2 space-y-1">
            <p><span className="font-medium">CIN:</span> <span className="font-bold">{branding.registry.cin}</span></p>
          </div>
          <div className="col-span-4 border-r-[0.5pt] border-slate-900 p-2 space-y-1">
            <p><span className="font-medium">Company GSTIN:</span> <span className="font-bold">{branding.registry.gstin}</span></p>
          </div>
          <div className="col-span-3 p-2 space-y-1">
            <p><span className="font-medium">PI No:</span> <span className="font-bold">{invoice.piNo}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-12 border-b-[0.5pt] border-slate-900 text-[8.5pt] leading-tight">
          <div className="col-span-9 border-r-[0.5pt] border-slate-900 p-2 space-y-1">
            <p><span className="font-medium">Email:</span> <span className="font-bold text-[#2E3191]">{branding.registry.email}</span></p>
          </div>
          <div className="col-span-3 p-2 space-y-1">
            <p><span className="font-medium">Date:</span> <span className="font-bold">{invoice.date}</span></p>
          </div>
        </div>

        {/* Client Block Title */}
        <div className="bg-slate-100 p-2 border-b-[0.5pt] border-slate-900">
           <p className="text-[8.5pt] font-black uppercase tracking-widest">Client Details:</p>
        </div>

        {/* Client Details - Formal Table Format */}
        <table className="w-full border-collapse text-[8.5pt] border-b-[0.5pt] border-slate-900">
           <tbody>
              <tr className="border-b-[0.5pt] border-slate-900">
                 <td className="w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50">Organisation Name:</td>
                 <td className="p-2 font-bold uppercase">M/s {invoice.clientName}</td>
              </tr>
              <tr className="border-b-[0.5pt] border-slate-900">
                 <td className="w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50">Registered Address:</td>
                 <td className="p-2 font-bold uppercase">{invoice.registeredAddress}</td>
              </tr>
              <tr className="border-b-[0.5pt] border-slate-900">
                 <td className="w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50">Consignee Address:</td>
                 <td className="p-2 font-bold uppercase whitespace-pre-wrap">{invoice.consigneeAddress}</td>
              </tr>
              <tr className="border-b-[0.5pt] border-slate-900">
                 <td className="w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50">GSTIN:</td>
                 <td className="p-2 font-bold uppercase">{invoice.gstin}</td>
              </tr>
              <tr>
                 <td className="w-40 p-2 border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50">W.O.No.:</td>
                 <td className="p-0">
                    <div className="flex w-full h-full items-center">
                       <div className="flex-1 p-2 font-bold uppercase">{invoice.woNo}</div>
                       <div className="w-40 p-2 border-l-[0.5pt] border-r-[0.5pt] border-slate-900 font-medium bg-slate-50/50 h-full flex items-center">Dispatch Details:</div>
                       <div className="flex-1 p-2 font-bold uppercase">{invoice.dispatchDetails}</div>
                    </div>
                 </td>
              </tr>
           </tbody>
        </table>

        {/* Updated Line Items Table */}
        <div className="flex-1">
           <table className="w-full border-collapse text-[8pt] border-none">
              <thead>
                <tr className="bg-slate-100 border-b-[0.5pt] border-slate-900 font-bold">
                  <th className="border-r-[0.5pt] border-slate-900 p-1 w-10 text-center">Sr.<br/>No.</th>
                  <th className="border-r-[0.5pt] border-slate-900 p-1 text-left">Description</th>
                  <th className="border-r-[0.5pt] border-slate-900 p-1 w-20 text-center">HSN Code</th>
                  <th className="border-r-[0.5pt] border-slate-900 p-1 w-16 text-center">Qty. (LS)</th>
                  <th className="border-r-[0.5pt] border-slate-900 p-1 w-16 text-center">Rate per KG</th>
                  <th className="border-r-[0.5pt] border-slate-900 p-1 w-16 text-center">Percentage</th>
                  <th className="p-1 w-32 text-right">Basic Amount (INR)</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, idx) => (
                  <tr key={item.id} className={`align-top border-b-[0.5pt] border-slate-900 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="border-r-[0.5pt] border-slate-900 p-2 text-center">{idx + 1}</td>
                    <td className="border-r-[0.5pt] border-slate-900 p-2 font-bold uppercase">{item.description}</td>
                    <td className="border-r-[0.5pt] border-slate-900 p-2 text-center">{item.hsnCode}</td>
                    <td className="border-r-[0.5pt] border-slate-900 p-2 text-center font-bold">{Math.round(item.qty)}</td>
                    <td className="border-r-[0.5pt] border-slate-900 p-2 text-center">{item.ratePerKg || '-'}</td>
                    <td className="border-r-[0.5pt] border-slate-900 p-2 text-center">{item.percentage}%</td>
                    <td className="p-2 text-right font-black text-[9.5pt]">{item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  </tr>
                ))}
                {/* Exactly one blank row */}
                <tr className={`h-8 align-top border-b-[0.5pt] border-slate-900 ${invoice.items.length % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                   <td className="border-r-[0.5pt] border-slate-900"></td>
                   <td className="border-r-[0.5pt] border-slate-900"></td>
                   <td className="border-r-[0.5pt] border-slate-900"></td>
                   <td className="border-r-[0.5pt] border-slate-900"></td>
                   <td className="border-r-[0.5pt] border-slate-900"></td>
                   <td className="border-r-[0.5pt] border-slate-900"></td>
                   <td></td>
                </tr>
              </tbody>
           </table>
        </div>

        {/* Summary Block */}
        <div className="grid grid-cols-12 text-[8.5pt] border-t-[0.5pt] border-slate-900">
           <div className="col-span-8 border-r-[0.5pt] border-slate-900 flex flex-col">
              <div className="p-2 min-h-14 border-b-[0.5pt] border-slate-900 flex flex-col justify-start bg-white">
                 <p className="font-medium text-slate-500 uppercase text-[7pt] mb-1">Total Amount In Words:</p>
                 <p className="font-bold text-[#2E3191] uppercase leading-tight italic">{invoice.amountInWords}</p>
              </div>
              <div className="p-2 bg-slate-50/30 flex-1">
                 <p className="font-black text-[9pt] mb-2 uppercase border-b-[0.5pt] border-slate-200 inline-block">Bank Details:</p>
                 <div className="grid grid-cols-1 gap-1 text-[8pt]">
                    <p><span className="font-bold w-28 inline-block">Account Name:</span> {invoice.bankDetails.accountName}</p>
                    <p><span className="font-bold w-28 inline-block">Address:</span> {invoice.bankDetails.address}</p>
                    <p><span className="font-bold w-28 inline-block">Account Number:</span> {invoice.bankDetails.accountNumber}</p>
                    <p><span className="font-bold w-28 inline-block">IFSC Code:</span> {invoice.bankDetails.ifscCode}</p>
                 </div>
              </div>
           </div>
           <div className="col-span-4 flex flex-col divide-y-[0.5pt] divide-slate-900 font-bold">
              <div className="flex justify-between p-2"><span>Total Amount (INR)</span><span>{basicTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between p-2 bg-slate-100"><span>Total Amount before Tax</span><span>{basicTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between p-2 font-medium"><span>(1) Add: CGST 9%</span><span>{cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between p-2 font-medium"><span>(2) Add: SGST 9%</span><span>{sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between p-2 font-medium"><span>(3) Add: IGST 18%</span><span>{igst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between p-2 bg-slate-100 font-black"><span>Total GST</span><span>{(cgst + sgst + igst).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></div>
              <div className="flex justify-between p-2 text-[11pt] font-black text-[#EC1C24] bg-red-50/50"><span>Grand Total</span><span>{rounded.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between p-2 text-[7.5pt] font-medium text-slate-400"><span>Round Off</span><span>{roundOff.toFixed(2)}</span></div>
           </div>
        </div>

        {/* Signatory Block */}
        <div className="flex border-t-[0.5pt] border-slate-900 h-32 relative">
           <div className="w-1/2"></div>
           <div className="w-1/2 border-l-[0.5pt] border-slate-900 flex flex-col">
              <div className="text-center p-1.5 text-[8.5pt] font-black uppercase">For, {branding.registry.name}</div>
              <div className="flex-1 flex items-center justify-center p-3 relative">
                 {branding.stampSignature ? (
                   <img src={branding.stampSignature} alt="Official Stamp" className="h-24 w-auto object-contain opacity-90 absolute" />
                 ) : (
                    <div className="border border-slate-200 p-2 rounded-lg rotate-[-3deg] opacity-20">
                        <p className="font-mono text-[7pt] uppercase tracking-widest">Verified Digitally</p>
                    </div>
                 )}
              </div>
              <div className="text-center border-t-[0.5pt] border-slate-900 p-1.5 text-[8.5pt] font-black bg-slate-100 uppercase tracking-widest">Authorised Signatory</div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;