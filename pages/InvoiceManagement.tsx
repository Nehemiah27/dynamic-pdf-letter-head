import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Eye, 
  Save, 
  CheckCircle2, 
  FileCheck, 
  Hash, 
  MapPin, 
  Send, 
  Loader2, 
  X, 
  AlertCircle, 
  PenTool, 
  Grid3X3,
  Calculator,
  PlusCircle,
  Building2,
  ReceiptText,
  Copy,
  MessageCircle,
  Mail as MailIcon,
  Download,
  Info
} from 'lucide-react';
import { Project, Client, Invoice, Branding, InvoiceItem } from '../types';
import InvoicePreview from '../components/InvoicePreview';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

interface InvoiceManagementProps {
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  branding: Branding;
  onAddInvoice: (projectId: string) => void;
  onUpdateInvoice: (id: string, updates: Partial<Invoice>) => void;
  onDeleteInvoice: (id: string) => void;
  onDuplicateInvoice: (id: string) => void;
}

interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
  id: string;
}

// Utility to convert number to words (Indian Rupee Format)
function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  
  return str.trim() + ' Only';
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ 
  projects, clients, invoices, branding, 
  onAddInvoice, onUpdateInvoice, onDeleteInvoice, onDuplicateInvoice 
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localInvoice, setLocalInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<'choice' | 'email'>('choice');
  const [emailCompose, setEmailCompose] = useState({ to: '', subject: '', body: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const project = projects.find(p => p.id === projectId);
  const client = clients.find(c => c.id === project?.clientId);
  const projectInvoices = invoices.filter(i => i.projectId === projectId).sort((a, b) => b.version - a.version);

  useEffect(() => {
    if (projectInvoices.length > 0 && !selectedId) {
      setSelectedId(projectInvoices[0].id);
    }
  }, [projectInvoices, selectedId]);

  useEffect(() => {
    const inv = invoices.find(i => i.id === selectedId);
    if (inv) {
      setLocalInvoice(JSON.parse(JSON.stringify(inv)));
      setHasUnsavedChanges(false);
      setSaveStatus('idle');
    } else {
      setLocalInvoice(null);
    }
  }, [selectedId, invoices]);

  const calculateTotals = (invoiceToCalc: Invoice | null) => {
    if (!invoiceToCalc) return { basic: 0, cgst: 0, sgst: 0, igst: 0, grand: 0, rounded: 0, diff: 0 };
    const basic = invoiceToCalc.items.reduce((sum, i) => sum + i.amount, 0);
    let cgst = 0, sgst = 0, igst = 0;
    if (invoiceToCalc.taxType === 'Intra-State') {
      cgst = basic * 0.09;
      sgst = basic * 0.09;
    } else {
      igst = basic * 0.18;
    }
    const grandRaw = basic + cgst + sgst + igst;
    const rounded = Math.round(grandRaw);
    const diff = rounded - grandRaw;
    return { basic, cgst, sgst, igst, grand: grandRaw, rounded, diff };
  };

  const totals = calculateTotals(localInvoice);

  // Auto-update amount in words whenever totals change
  useEffect(() => {
    if (localInvoice && totals.rounded > 0) {
      const words = numberToWords(totals.rounded);
      if (localInvoice.amountInWords !== words) {
        handleUpdate({ amountInWords: words });
      }
    }
  }, [totals.rounded]);

  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { type, message, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  if (!project || !client) return null;

  const handleUpdate = (updates: Partial<Invoice>) => {
    if (localInvoice) {
      setLocalInvoice(prev => prev ? { ...prev, ...updates } : null);
      setHasUnsavedChanges(true);
      setSaveStatus('idle');
    }
  };

  const updateItem = (itemId: string, updates: Partial<InvoiceItem>) => {
    if (!localInvoice) return;
    const newItems = localInvoice.items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        
        // New calculation logic: Basic Amount = Qty * RatePerKG * (Percentage/100)
        const qty = updatedItem.qty || 0;
        const ratePerKgValue = parseFloat(updatedItem.ratePerKg) || 0;
        const percentageValue = parseFloat(updatedItem.percentage) || 0;
        
        updatedItem.amount = qty * ratePerKgValue * (percentageValue / 100);
        
        return updatedItem;
      }
      return item;
    });
    handleUpdate({ items: newItems });
  };

  const addItem = () => {
    if (!localInvoice) return;
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      description: 'PEB',
      hsnCode: '-',
      qty: 1,
      uom: 'LS',
      ratePerKg: '60000',
      percentage: '100',
      rate: 60000,
      amount: 60000
    };
    handleUpdate({ items: [...localInvoice.items, newItem] });
  };

  const removeItem = (id: string) => {
    if (!localInvoice) return;
    handleUpdate({ items: localInvoice.items.filter(i => i.id !== id) });
  };

  const handleSave = async () => {
    if (!localInvoice) return;
    setIsSaving(true);
    try {
      await onUpdateInvoice(localInvoice.id, localInvoice);
      setHasUnsavedChanges(false);
      setSaveStatus('success');
      addNotification('success', 'PI synchronized with cloud storage.');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (e) {
      setSaveStatus('error');
      addNotification('error', 'Critical sync failure.');
    } finally {
      setIsSaving(false);
    }
  };

  const executeEmailSend = async () => {
    if (!localInvoice || !emailCompose.to) return;
    setIsSendingEmail(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      addNotification('success', 'PI Transmission Success');
      setIsDispatchOpen(false);
      setDispatchStep('choice');
    } catch (e) {
      addNotification('error', 'Failed to dispatch email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!localInvoice) return;
    setIsDownloading(true);
    
    try {
      if (hasUnsavedChanges) await handleSave();

      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const margin = 10;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - (margin * 2);
      
      const brandBlue = [46, 49, 145];

      // Draw Main Border
      doc.setDrawColor(0).setLineWidth(0.3).rect(margin, margin, contentWidth, 277);

      // Title Bar
      doc.setFillColor(240, 240, 240).rect(margin, margin, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(0).text('PROFORMA INVOICE', 105, margin + 5.5, { align: 'center' });
      doc.line(margin, margin + 8, margin + contentWidth, margin + 8);

      // Header Block (Increased Height by approx 12px -> ~4.23mm)
      const headH = 29.23;
      let y = margin + 8;
      if (branding.headerImage) {
        try {
          doc.addImage(branding.headerImage, 'PNG', margin, y, contentWidth, headH, undefined, 'FAST');
        } catch(e) {
          doc.setFontSize(16).setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(branding.registry.name, margin + 50, y + 12);
        }
      } else {
        if (branding.logo) {
          try { doc.addImage(branding.logo, 'PNG', margin + 5, y + 5, 35, 15); } catch(e) {}
        }
        doc.setFontSize(16).setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(branding.registry.name, margin + 50, y + 12);
      }
      
      y += headH;
      doc.line(margin, y, margin + contentWidth, y);

      // Info Grid
      doc.setFontSize(8).setTextColor(0).setFont('helvetica', 'normal');
      doc.text(`CIN:`, margin + 2, y + 5);
      doc.setFont('helvetica', 'bold').text(branding.registry.cin, margin + 12, y + 5);
      doc.setFont('helvetica', 'normal').text(`Company GSTIN:`, margin + 60, y + 5);
      doc.setFont('helvetica', 'bold').text(branding.registry.gstin, margin + 84, y + 5);
      doc.setFont('helvetica', 'normal').text(`PI No:`, margin + 125, y + 5);
      doc.setFont('helvetica', 'bold').text(localInvoice.piNo, margin + 136, y + 5);

      y += 8;
      doc.line(margin, y, margin + contentWidth, y);
      doc.setFont('helvetica', 'normal').text(`Email:`, margin + 2, y + 5);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(branding.registry.email, margin + 12, y + 5);
      doc.setTextColor(0).text(`Date:`, margin + 125, y + 5);
      doc.setFont('helvetica', 'bold').text(localInvoice.date, margin + 136, y + 5);

      y += 8;
      doc.line(margin, y, margin + contentWidth, y);

      // Client Details
      doc.setFillColor(240, 240, 240).rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold').setTextColor(0).text('Client Details:', margin + 2, y + 4.5);
      y += 6;
      doc.line(margin, y, margin + contentWidth, y);
      
      const drawRow = (label: string, value: string, rowY: number, h: number = 7) => {
        doc.setFillColor(250, 250, 250).rect(margin, rowY, 40, h, 'F');
        doc.setFont('helvetica', 'normal').text(label, margin + 2, rowY + (h/2) + 1);
        doc.line(margin + 40, rowY, margin + 40, rowY + h);
        doc.setFont('helvetica', 'bold').text(value, margin + 42, rowY + (h/2) + 1, { maxWidth: 145 });
        return rowY + h;
      };

      y = drawRow('Organisation Name:', `M/s ${localInvoice.clientName}`, y);
      doc.line(margin, y, margin + contentWidth, y);
      y = drawRow('Registered Address:', localInvoice.registeredAddress, y);
      doc.line(margin, y, margin + contentWidth, y);
      y = drawRow('Consignee Address:', localInvoice.consigneeAddress, y, 10);
      doc.line(margin, y, margin + contentWidth, y);
      y = drawRow('GSTIN:', localInvoice.gstin, y);
      doc.line(margin, y, margin + contentWidth, y);

      doc.setFillColor(250, 250, 250).rect(margin, y, 40, 7, 'F');
      doc.setFont('helvetica', 'normal').text('W.O.No.:', margin + 2, y + 4.5);
      doc.line(margin + 40, y, margin + 40, y + 7);
      doc.setFont('helvetica', 'bold').text(localInvoice.woNo, margin + 42, y + 4.5);
      doc.line(margin + 95, y, margin + 95, y + 7);
      doc.setFillColor(250, 250, 250).rect(margin + 95, y, 30, 7, 'F');
      doc.setFont('helvetica', 'normal').text('Dispatch Details:', margin + 97, y + 4.5);
      doc.line(margin + 125, y, margin + 125, y + 7);
      doc.setFont('helvetica', 'bold').text(localInvoice.dispatchDetails, margin + 127, y + 4.5);
      y += 7;
      doc.line(margin, y, margin + contentWidth, y);

      // Updated Table Headers
      const colWidths = [10, 80, 20, 15, 15, 20, 30];
      const headers = ['Sr.\nNo.', 'Description', 'HSN Code', 'Qty.\n(LS)', 'Rate per\nKG', 'Percentage', 'Basic Amount\n(INR)'];
      
      doc.setFontSize(7).setFont('helvetica', 'bold');
      let currentX = margin;
      doc.setFillColor(240, 240, 240).rect(margin, y, contentWidth, 10, 'F');
      headers.forEach((h, i) => {
        doc.text(h, currentX + colWidths[i]/2, y + 4, { align: 'center' });
        currentX += colWidths[i];
      });
      currentX = margin;
      colWidths.forEach((w) => {
        doc.line(currentX, y, currentX, y + 10);
        currentX += w;
      });
      doc.line(margin + contentWidth, y, margin + contentWidth, y + 10);
      y += 10;
      doc.line(margin, y, margin + contentWidth, y);

      // Items
      let tableYStart = y;
      localInvoice.items.forEach((item, idx) => {
        const descLines = doc.splitTextToSize(item.description, colWidths[1] - 4);
        const rowHeight = Math.max(descLines.length * 4, 8);
        if (idx % 2 !== 0) doc.setFillColor(252, 252, 252).rect(margin, y, contentWidth, rowHeight, 'F');

        let cellX = margin;
        doc.setFont('helvetica', 'normal').text((idx+1).toString(), cellX + colWidths[0]/2, y + 5, { align: 'center' });
        cellX += colWidths[0];
        doc.setFont('helvetica', 'bold').text(descLines, cellX + 2, y + 5);
        cellX += colWidths[1];
        doc.setFont('helvetica', 'normal').text(item.hsnCode, cellX + colWidths[2]/2, y + 5, { align: 'center' });
        cellX += colWidths[2];
        // Removed decimal values from Qty (LS)
        doc.text(Math.round(item.qty).toString(), cellX + colWidths[3]/2, y + 5, { align: 'center' });
        cellX += colWidths[3];
        doc.text(item.ratePerKg || '-', cellX + colWidths[4]/2, y + 5, { align: 'center' });
        cellX += colWidths[4];
        doc.text(item.percentage + '%', cellX + colWidths[5]/2, y + 5, { align: 'center' });
        cellX += colWidths[5];
        doc.setFont('helvetica', 'bold').text(item.amount.toLocaleString(), margin + contentWidth - 2, y + 5, { align: 'right' });
        y += rowHeight;
        doc.line(margin, y, margin + contentWidth, y);
      });

      y += 8; // Blank row
      doc.line(margin, y, margin + contentWidth, y);
      currentX = margin;
      colWidths.forEach((w) => {
        doc.line(currentX, tableYStart, currentX, y);
        currentX += w;
      });
      doc.line(margin + contentWidth, tableYStart, margin + contentWidth, y);

      // Summary
      doc.setFontSize(8).setFont('helvetica', 'normal').text('Total Amount (INR)', margin + 110, y + 5);
      doc.setFont('helvetica', 'bold').text(totals.basic.toLocaleString(), margin + contentWidth - 2, y + 5, { align: 'right' });
      y += 8;
      doc.line(margin, y, margin + contentWidth, y);

      const summaryYStart = y;
      doc.setFont('helvetica', 'normal').setFontSize(7).text(`Total Amount In Words:`, margin + 2, y + 5);
      doc.setFont('helvetica', 'bold').setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]).text(localInvoice.amountInWords || '', margin + 2, y + 10, { maxWidth: 100 });
      
      doc.setTextColor(0);
      let sy = summaryYStart;
      const rows = [
        ['Total Amount before Tax', totals.basic.toLocaleString()],
        [`(1) Add: CGST 9%`, totals.cgst.toLocaleString()],
        [`(2) Add: SGST 9%`, totals.sgst.toLocaleString()],
        [`(3) Add: IGST 18%`, totals.igst.toLocaleString()],
        [`Total GST (1+2+3)`, (totals.cgst + totals.sgst + totals.igst).toLocaleString()],
        [`Grand Total`, totals.rounded.toLocaleString()],
        [`Round Off`, totals.diff.toFixed(2)]
      ];

      rows.forEach((r, i) => {
        if (i === 5) doc.setFontSize(10).setFont('helvetica', 'bold');
        else doc.setFontSize(8).setFont('helvetica', i === 4 ? 'bold' : 'normal');
        doc.text(r[0], margin + 110, sy + 5);
        doc.text(r[1], margin + contentWidth - 2, sy + 5, { align: 'right' });
        sy += i === 5 ? 8 : 7;
        if (i < 6) doc.line(margin + 105, sy, margin + contentWidth, sy);
      });

      doc.line(margin + 105, summaryYStart, margin + 105, sy);
      
      let bankY = summaryYStart + 22;
      doc.setFont('helvetica', 'bold').setFontSize(8).text('Bank Details:', margin + 2, bankY);
      doc.setFont('helvetica', 'normal');
      doc.text(`Account Name: ${localInvoice.bankDetails.accountName}`, margin + 2, bankY + 5);
      doc.text(`Address: ${localInvoice.bankDetails.address}`, margin + 2, bankY + 10);
      doc.text(`Account Number: ${localInvoice.bankDetails.accountNumber}`, margin + 2, bankY + 15);
      doc.text(`IFSC Code: ${localInvoice.bankDetails.ifscCode}`, margin + 2, bankY + 20);

      y = Math.max(sy, bankY + 25);
      doc.line(margin, y, margin + contentWidth, y);
      
      // Signatory
      y += 5;
      doc.setFont('helvetica', 'bold').text(`For, ${branding.registry.name}`, margin + contentWidth - 10, y, { align: 'right' });
      
      if (branding.stampSignature) {
          try {
              doc.addImage(branding.stampSignature, 'PNG', margin + 130, y + 2, 35, 35, undefined, 'FAST');
          } catch(e) {}
      }

      y += 40;
      doc.setFontSize(9).setTextColor(0).text('Authorised Signatory', margin + 150, y, { align: 'center' });

      // Build requested filename format: PI Ref / project name / RNS-001 (using underscores for compatibility)
      const fileName = `${localInvoice.piNo.replace(/\//g, '_')}_${project.name.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      addNotification('success', 'Professional PDF Dispatched.');
    } catch (e: any) {
      addNotification('error', `PDF Error: ${e.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in bg-slate-50/20 relative min-h-full">
      <div className="fixed top-20 right-4 z-[120] space-y-3 pointer-events-none w-80">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-slide-in-right ${
              n.type === 'success' ? 'bg-[#2E3191] text-white border-white/10' :
              n.type === 'error' ? 'bg-[#EC1C24] text-white border-white/10' :
              'bg-blue-50 text-blue-800 border-blue-100'
            }`}>
            {n.type === 'success' && <CheckCircle2 size={16} className="shrink-0 mt-0.5" />}
            {n.type === 'error' && <AlertCircle size={16} className="shrink-0 mt-0.5" />}
            <p className="text-[10px] font-black uppercase tracking-widest">{n.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#2E3191] transition-all"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight">Billing Orchestrator</h1>
            <p className="text-[10px] lg:text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <Building2 size={12} className="text-[#EC1C24]" /> {project.name}
            </p>
          </div>
        </div>
        <button onClick={() => onAddInvoice(project.id)} className="px-6 py-4 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[#2E3191]/20 active:scale-95 transition-all">+ New Invoice</button>
      </div>

      {localInvoice ? (
        <div className="space-y-6">
          <div className="bg-[#2E3191] p-4 lg:p-6 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-40 border border-white/10">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar max-w-full">
               {projectInvoices.slice().reverse().map(inv => (
                 <button
                   key={inv.id}
                   onClick={() => setSelectedId(inv.id)}
                   className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 font-black text-xs ${
                     selectedId === inv.id ? 'bg-[#EC1C24] text-white shadow-lg scale-110' : 'bg-white/10 text-white/40 hover:bg-white/20'
                   }`}
                 >
                   {inv.version}
                 </button>
               ))}
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
               <button onClick={() => setIsPreviewOpen(true)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20" title="Full Render"><Eye size={20} /></button>
               <button onClick={handleDownloadPDF} disabled={isDownloading} className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg" title="Export PDF">
                 {isDownloading ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
               </button>
               <button onClick={() => setIsDispatchOpen(true)} className="p-3 bg-[#EC1C24] text-white rounded-xl shadow-lg" title="Dispatch"><Send size={20} /></button>
               <button onClick={() => onDuplicateInvoice(localInvoice.id)} className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20" title="Clone"><Copy size={20} /></button>
               <button onClick={() => {onDeleteInvoice(localInvoice.id); setSelectedId(null);}} className="p-3 bg-white/10 text-white/40 hover:text-red-400 rounded-xl" title="Purge"><Trash2 size={20} /></button>
               <div className="w-px h-6 bg-white/10 mx-1 hidden xs:block" />
               <button onClick={handleSave} disabled={!hasUnsavedChanges || isSaving} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${hasUnsavedChanges ? 'bg-white text-[#2E3191]' : 'bg-white/10 text-white/30 cursor-not-allowed'}`}>
                 {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                 {saveStatus === 'success' ? 'Synchronized' : 'Save Changes'}
               </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <ReceiptText size={20} className="text-[#EC1C24]" />
                  <h3 className="text-lg font-black text-[#2E3191] uppercase tracking-tight">Identity & Header Info</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">PI Reference No.</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-4 focus:ring-[#2E3191]/5 outline-none transition-all" value={localInvoice.piNo} onChange={e => handleUpdate({piNo: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Document Date</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs focus:ring-4 focus:ring-[#2E3191]/5 outline-none transition-all" value={localInvoice.date} onChange={e => handleUpdate({date: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <Building2 size={20} className="text-[#2E3191]" />
                  <h3 className="text-lg font-black text-[#2E3191] uppercase tracking-tight">Client & Consignee Details</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Organisation Name</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase" value={localInvoice.clientName} onChange={e => handleUpdate({clientName: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Registered Address</label>
                      <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs h-24" value={localInvoice.registeredAddress} onChange={e => handleUpdate({registeredAddress: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Consignee Address</label>
                      <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs h-24" value={localInvoice.consigneeAddress} onChange={e => handleUpdate({consigneeAddress: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Client GSTIN</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono font-black text-xs" value={localInvoice.gstin} onChange={e => handleUpdate({gstin: e.target.value})} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Work Order (W.O. No)</label>
                      <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={localInvoice.woNo} onChange={e => handleUpdate({woNo: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">Dispatch Details</label>
                    <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-xs" value={localInvoice.dispatchDetails} onChange={e => handleUpdate({dispatchDetails: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 lg:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                  <div className="flex items-center gap-3">
                    <Grid3X3 size={20} className="text-[#2E3191]" />
                    <h3 className="text-lg font-black text-[#2E3191] uppercase tracking-tight">Line Item Grid</h3>
                  </div>
                  <button onClick={addItem} className="px-4 py-2 bg-[#2E3191]/5 text-[#2E3191] rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#2E3191] hover:text-white transition-all">+ Add Asset</button>
                </div>
                <div className="space-y-4">
                  {localInvoice.items.map((item, idx) => (
                    <div key={item.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 relative group hover:border-[#2E3191]/20 transition-all">
                       <button onClick={() => removeItem(item.id)} className="absolute top-4 right-4 text-slate-200 hover:text-[#EC1C24] transition-colors"><X size={18} /></button>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="md:col-span-3 space-y-1.5">
                             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Description</label>
                             <input className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold" value={item.description} onChange={e => updateItem(item.id, {description: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">HSN Code</label>
                             <input className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-mono" value={item.hsnCode} onChange={e => updateItem(item.id, {hsnCode: e.target.value})} />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Qty (LS)</label>
                             <input type="number" step="1" className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold" value={item.qty} onChange={e => updateItem(item.id, {qty: parseFloat(e.target.value) || 0})} />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Rate per KG</label>
                             <input className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold" value={item.ratePerKg} onChange={e => updateItem(item.id, {ratePerKg: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Percentage (%)</label>
                             <input className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold" value={item.percentage} onChange={e => updateItem(item.id, {percentage: e.target.value})} />
                          </div>
                          <div className="space-y-1.5">
                             <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Basic Amount (Calculated)</label>
                             <input type="text" readOnly className="w-full px-4 py-3 bg-slate-100 border border-slate-100 rounded-xl text-xs font-black text-[#2E3191]" value={item.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})} />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
               <div className="bg-[#2E3191] p-8 rounded-[2.5rem] shadow-2xl text-white space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000"><Calculator size={120} /></div>
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                     <Calculator size={20} className="text-[#EC1C24]" />
                     <h3 className="text-sm font-black uppercase tracking-widest">Financial Summary</h3>
                  </div>
                  <div className="space-y-4 text-xs font-bold relative z-10">
                     <div className="flex justify-between">
                        <span className="opacity-40 uppercase tracking-widest">Basic Value</span>
                        <span>₹ {totals.basic.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase text-white/30 tracking-widest">Tax Configuration</label>
                        <select className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-black uppercase text-white outline-none cursor-pointer" value={localInvoice.taxType} onChange={e => handleUpdate({taxType: e.target.value as any})}>
                           <option value="Intra-State" className="bg-[#2E3191]">Intra-State (9+9)</option>
                           <option value="Inter-State" className="bg-[#2E3191]">Inter-State (18)</option>
                        </select>
                     </div>
                     {localInvoice.taxType === 'Intra-State' ? (
                       <>
                         <div className="flex justify-between">
                            <span className="opacity-40 uppercase tracking-widest">Add: CGST (9%)</span>
                            <span>₹ {totals.cgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                         </div>
                         <div className="flex justify-between">
                            <span className="opacity-40 uppercase tracking-widest">Add: SGST (9%)</span>
                            <span>₹ {totals.sgst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                         </div>
                       </>
                     ) : (
                       <div className="flex justify-between">
                          <span className="opacity-40 uppercase tracking-widest">Add: IGST (18%)</span>
                          <span>₹ {totals.igst.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                       </div>
                     )}
                     <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                        <div>
                           <p className="text-[9px] opacity-40 uppercase tracking-widest mb-1">Grand Total (R.O.)</p>
                           <p className="text-2xl font-black text-white">₹ {totals.rounded.toLocaleString('en-IN')}</p>
                        </div>
                        <span className="text-[9px] bg-[#EC1C24] px-2 py-1 rounded font-black tracking-widest">RO: {totals.diff.toFixed(2)}</span>
                     </div>
                  </div>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                     <PenTool size={20} className="text-[#2E3191]" />
                     <h3 className="text-xs font-black text-[#2E3191] uppercase tracking-widest">Amount in Words</h3>
                  </div>
                  <textarea className="w-full bg-slate-50 p-4 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#2E3191] transition-all h-20" placeholder="Grand total in words..." value={localInvoice.amountInWords} readOnly />
                  <p className="text-[8px] text-slate-400 uppercase font-black tracking-widest ml-1 italic">* Auto-generated from Grand Total</p>
               </div>

               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                     <Building2 size={20} className="text-[#2E3191]" />
                     <h3 className="text-xs font-black text-[#2E3191] uppercase tracking-widest">Remittance Path</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1">Account Name</label>
                        <input className="w-full bg-slate-50 p-4 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#2E3191] transition-all" value={localInvoice.bankDetails.accountName} onChange={e => handleUpdate({bankDetails: {...localInvoice.bankDetails, accountName: e.target.value}})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1">Bank Address</label>
                        <input className="w-full bg-slate-50 p-4 rounded-xl text-[10px] font-bold outline-none border border-transparent focus:border-[#2E3191] transition-all" value={localInvoice.bankDetails.address} onChange={e => handleUpdate({bankDetails: {...localInvoice.bankDetails, address: e.target.value}})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1">Account No.</label>
                        <input className="w-full bg-slate-50 p-4 rounded-xl text-[10px] font-mono font-black text-[#2E3191] outline-none border border-transparent focus:border-[#2E3191] transition-all" value={localInvoice.bankDetails.accountNumber} onChange={e => handleUpdate({bankDetails: {...localInvoice.bankDetails, accountNumber: e.target.value}})} />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[8px] font-black uppercase text-slate-300 tracking-widest ml-1">IFSC Code</label>
                        <input className="w-full bg-slate-50 p-4 rounded-xl text-[10px] font-mono font-black text-[#EC1C24] outline-none border border-transparent focus:border-[#2E3191] transition-all" value={localInvoice.bankDetails.ifscCode} onChange={e => handleUpdate({bankDetails: {...localInvoice.bankDetails, ifscCode: e.target.value}})} />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-300">
           <ReceiptText size={48} className="mb-4 opacity-10 animate-pulse" />
           <p className="font-black uppercase tracking-widest text-[10px]">Select PI Master Version</p>
        </div>
      )}

      {isDispatchOpen && localInvoice && (
        <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in border border-slate-100">
            <div className="p-6 lg:p-8 border-b border-slate-50 flex items-center justify-between">
              <h2 className="text-lg lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight">PI Dispatch Command</h2>
              <button onClick={() => setIsDispatchOpen(false)} className="text-slate-300 hover:text-[#EC1C24] transition-colors"><X size={28}/></button>
            </div>
            <div className="p-6 lg:p-10 space-y-4">
              {dispatchStep === 'choice' ? (
                <div className="space-y-3">
                  <button onClick={() => window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank')} className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-emerald-500 transition-all text-left">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0"><MessageCircle size={24} className="text-emerald-500" /></div>
                    <span className="font-black text-[#2E3191] uppercase text-xs tracking-widest">WhatsApp Direct</span>
                  </button>
                  <button onClick={() => setDispatchStep('email')} className="w-full flex items-center gap-4 p-5 bg-white border-2 border-slate-50 rounded-2xl hover:border-[#2E3191] transition-all text-left">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0"><MailIcon size={24} className="text-[#2E3191]" /></div>
                    <span className="font-black text-[#2E3191] uppercase text-xs tracking-widest">SMTP Email Relay</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 text-xs" value={emailCompose.to} onChange={e => setEmailCompose({...emailCompose, to: e.target.value})} />
                  <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 h-32 text-xs leading-relaxed" value={emailCompose.body} onChange={e => setEmailCompose({...emailCompose, body: e.target.value})} />
                  <button onClick={executeEmailSend} disabled={isSendingEmail} className="w-full py-5 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl disabled:opacity-50 tracking-widest">
                    {isSendingEmail ? 'Transmitting...' : 'Dispatch Payload'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isPreviewOpen && localInvoice && (
        <div className="fixed inset-0 z-[110] bg-white overflow-y-auto animate-fade-in p-4 lg:p-10 flex flex-col items-center">
           <div className="w-full max-w-5xl flex items-center justify-between mb-8 sticky top-0 bg-[#2E3191] p-4 lg:p-6 rounded-2xl shadow-2xl z-50 border border-white/10">
              <h2 className="text-white font-black uppercase tracking-widest text-[10px] lg:text-xs">PI Rendering Engine</h2>
              <div className="flex gap-4">
                 <button onClick={handleDownloadPDF} className="px-6 py-3 bg-[#EC1C24] text-white font-black text-[10px] rounded-xl uppercase shadow-xl tracking-widest active:scale-95 transition-all">Download PDF</button>
                 <button onClick={() => setIsPreviewOpen(false)} className="p-3 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              </div>
           </div>
           <InvoicePreview invoice={localInvoice} branding={branding} client={client} project={project} />
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default InvoiceManagement;