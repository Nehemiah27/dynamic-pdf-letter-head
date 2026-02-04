import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, FileText, Download, Trash2, Copy, Eye, Plus, X, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LayoutShell } from "@/components/layout-shell";
import { useUser } from "@/hooks/use-auth";
import type { Project, Client, Invoice, InvoiceItem, Branding } from "@shared/schema";
import jsPDF from "jspdf";

interface InvoiceLineItem {
  id: number;
  serialNo: number;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  ratePerUnit: number;
  percentage: number;
  amount: number;
  remarks: string;
}

export default function InvoicePage() {
  const params = useParams<{ id: string; invoiceId?: string }>();
  const projectId = params.id;
  const invoiceId = params.invoiceId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: "",
    revision: "R-001",
    organisationName: "",
    registeredAddress: "",
    consigneeAddress: "",
    clientGstin: "",
    workOrderNo: "NIL",
    dispatchDetails: "-",
    appliedTaxType: "igst" as "cgst_sgst" | "igst",
    cgstRate: "9",
    sgstRate: "9",
    igstRate: "18",
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: 1, serialNo: 1, description: "", hsnCode: "940610", quantity: 1, unit: "LS", ratePerUnit: 0, percentage: 0, amount: 0, remarks: "" }
  ]);

  const { data: user } = useUser();

  const { data: project } = useQuery<Project>({
    queryKey: ["/revira/api/projects", projectId],
    queryFn: async () => {
      const res = await fetch(`/revira/api/projects/${projectId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: client } = useQuery<Client>({
    queryKey: ["/revira/api/clients", project?.clientId],
    queryFn: async () => {
      const res = await fetch(`/revira/api/clients/${project?.clientId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch client");
      return res.json();
    },
    enabled: !!project?.clientId,
  });

  const { data: branding } = useQuery<Branding>({
    queryKey: ["/revira/api/branding"],
    enabled: !!user,
  });

  const { data: existingInvoice } = useQuery<Invoice>({
    queryKey: ["/revira/api/invoices", invoiceId],
    queryFn: async () => {
      if (invoiceId) {
        const res = await fetch(`/revira/api/invoices/${invoiceId}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch invoice");
        return res.json();
      }
      const res = await fetch(`/revira/api/projects/${projectId}/invoice`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch invoice");
      }
      return res.json();
    },
    enabled: !!projectId,
  });

  const { data: existingItems } = useQuery<InvoiceItem[]>({
    queryKey: ["/revira/api/invoices", existingInvoice?.id, "items"],
    queryFn: async () => {
      const res = await fetch(`/revira/api/invoices/${existingInvoice?.id}/items`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch items");
      return res.json();
    },
    enabled: !!existingInvoice?.id,
  });

  const { data: invoiceVersions } = useQuery<Invoice[]>({
    queryKey: ["/revira/api/projects", projectId, "invoice-versions"],
    queryFn: async () => {
      const res = await fetch(`/revira/api/projects/${projectId}/invoice-versions`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!projectId,
  });

  // Set defaults for new invoices
  useEffect(() => {
    if (project && client && !existingInvoice) {
      const date = new Date();
      const financeYear = date.getMonth() >= 3 
        ? `${date.getFullYear()}-${(date.getFullYear() + 1).toString().slice(-2)}`
        : `${date.getFullYear() - 1}-${date.getFullYear().toString().slice(-2)}`;
      
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: `RNS/${financeYear}/RNS-SL-${String(project.id).padStart(3, '0')}`,
        organisationName: `M/s ${client.name}`,
        registeredAddress: client.location,
        consigneeAddress: `M/s ${client.name}, ${client.location}`,
        clientGstin: client.gstNo || "",
      }));
    }
  }, [project, client, existingInvoice]);

  // Load existing invoice data
  useEffect(() => {
    if (existingInvoice) {
      setInvoiceData({
        invoiceNumber: existingInvoice.invoiceNumber,
        revision: existingInvoice.revision,
        organisationName: existingInvoice.organisationName,
        registeredAddress: existingInvoice.registeredAddress,
        consigneeAddress: existingInvoice.consigneeAddress,
        clientGstin: existingInvoice.clientGstin || "",
        workOrderNo: existingInvoice.workOrderNo || "NIL",
        dispatchDetails: existingInvoice.dispatchDetails || "-",
        appliedTaxType: (existingInvoice.appliedTaxType as "cgst_sgst" | "igst") || "igst",
        cgstRate: existingInvoice.cgstRate || "9",
        sgstRate: existingInvoice.sgstRate || "9",
        igstRate: existingInvoice.igstRate || "18",
      });
    }
  }, [existingInvoice]);

  // Load existing items
  useEffect(() => {
    if (existingItems && existingItems.length > 0) {
      setLineItems(existingItems.map(item => ({
        id: item.id,
        serialNo: item.serialNo,
        description: item.description,
        hsnCode: item.hsnCode || "940610",
        quantity: Number(item.quantity) || 1,
        unit: item.unit || "LS",
        ratePerUnit: Number(item.ratePerUnit) || 0,
        percentage: Number(item.percentage) || 0,
        amount: Number(item.amount) || 0,
        remarks: item.remarks || "",
      })));
    }
  }, [existingItems]);

  // Calculate totals
  const calculateTotals = useCallback(() => {
    const totalAmount = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (invoiceData.appliedTaxType === "cgst_sgst") {
      cgstAmount = totalAmount * (Number(invoiceData.cgstRate) / 100);
      sgstAmount = totalAmount * (Number(invoiceData.sgstRate) / 100);
    } else {
      igstAmount = totalAmount * (Number(invoiceData.igstRate) / 100);
    }

    const totalTax = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = totalAmount + totalTax;

    return { totalAmount, cgstAmount, sgstAmount, igstAmount, totalTax, grandTotal };
  }, [lineItems, invoiceData.appliedTaxType, invoiceData.cgstRate, invoiceData.sgstRate, invoiceData.igstRate]);

  const totals = calculateTotals();

  // Number to words conversion
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    const convertToIndianSystem = (n: number): string => {
      if (n === 0) return '';
      
      const crore = Math.floor(n / 10000000);
      const lakh = Math.floor((n % 10000000) / 100000);
      const thousand = Math.floor((n % 100000) / 1000);
      const remainder = n % 1000;
      
      let result = '';
      if (crore > 0) result += convertLessThanThousand(crore) + ' Crore ';
      if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh ';
      if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
      if (remainder > 0) result += convertLessThanThousand(remainder);
      
      return result.trim();
    };
    
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    
    let result = convertToIndianSystem(rupees) + ' Rupees';
    if (paise > 0) {
      result += ' and ' + convertLessThanThousand(paise) + ' Paise';
    }
    result += ' Only';
    
    return result;
  };

  const createInvoiceMutation = useMutation({
    mutationFn: async () => {
      const invoiceRes = await apiRequest("POST", "/revira/api/invoices", {
        projectId: Number(projectId),
        ...invoiceData,
        totalAmount: String(totals.totalAmount),
        totalTax: String(totals.totalTax),
        grandTotal: String(totals.grandTotal),
      });
      const invoice = await invoiceRes.json();
      
      for (const item of lineItems) {
        if (item.description.trim()) {
          await apiRequest("POST", `/revira/api/invoices/${invoice.id}/items`, {
            serialNo: item.serialNo,
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: String(item.quantity),
            unit: item.unit,
            ratePerUnit: String(item.ratePerUnit),
            percentage: String(item.percentage),
            amount: String(item.amount),
            remarks: item.remarks,
          });
        }
      }
      
      return invoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/revira/api/invoices", invoiceId] });
      queryClient.invalidateQueries({ queryKey: ["/revira/api/projects", projectId, "invoice-versions"] });
      setLocation(`/revira/projects/${projectId}/invoice/${data.id}`);
      toast({
        title: "Invoice saved",
        description: "The invoice has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/revira/api/invoices/${existingInvoice?.id}`, {
        ...invoiceData,
        totalAmount: String(totals.totalAmount),
        totalTax: String(totals.totalTax),
        grandTotal: String(totals.grandTotal),
      });

      await fetch(`/revira/api/invoices/${existingInvoice?.id}/items`, {
        method: "DELETE",
        credentials: "include",
      }).catch(() => {});

      for (const item of lineItems) {
        if (item.description.trim()) {
          await apiRequest("POST", `/revira/api/invoices/${existingInvoice?.id}/items`, {
            serialNo: item.serialNo,
            description: item.description,
            hsnCode: item.hsnCode,
            quantity: String(item.quantity),
            unit: item.unit,
            ratePerUnit: String(item.ratePerUnit),
            percentage: String(item.percentage),
            amount: String(item.amount),
            remarks: item.remarks,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/revira/api/invoices", existingInvoice?.id] });
      queryClient.invalidateQueries({ queryKey: ["/revira/api/invoices", existingInvoice?.id, "items"] });
      queryClient.invalidateQueries({ queryKey: ["/revira/api/projects", projectId, "invoice-versions"] });
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const duplicateInvoiceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/revira/api/invoices/${existingInvoice?.id}/duplicate`, {});
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/revira/api/projects", projectId, "invoice-versions"] });
      setLocation(`/revira/projects/${projectId}/invoice/${data.id}`);
      toast({
        title: "Invoice duplicated",
        description: `Created new version: ${data.revision}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate invoice",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/revira/api/invoices/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/revira/api/projects", projectId, "invoice-versions"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice version has been deleted.",
      });
      setVersionsDialogOpen(false);
      if (invoiceVersions && invoiceVersions.length > 1) {
        const remaining = invoiceVersions.filter(v => v.id !== existingInvoice?.id);
        if (remaining.length > 0) {
          setLocation(`/revira/projects/${projectId}/invoice/${remaining[0].id}`);
        } else {
          setLocation(`/revira/projects/${projectId}/invoice`);
        }
      } else {
        setLocation(`/revira/projects/${projectId}/invoice`);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (existingInvoice) {
      updateInvoiceMutation.mutate();
    } else {
      createInvoiceMutation.mutate();
    }
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(i => i.id), 0) + 1;
    setLineItems([...lineItems, {
      id: newId,
      serialNo: lineItems.length + 1,
      description: "",
      hsnCode: "940610",
      quantity: 1,
      unit: "LS",
      ratePerUnit: 0,
      percentage: 0,
      amount: 0,
      remarks: "",
    }]);
  };

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      const updated = lineItems.filter(item => item.id !== id);
      setLineItems(updated.map((item, idx) => ({ ...item, serialNo: idx + 1 })));
    }
  };

  const updateLineItem = (id: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === "quantity" || field === "ratePerUnit") {
          updated.amount = Number(updated.quantity) * Number(updated.ratePerUnit);
        }
        return updated;
      }
      return item;
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount).replace('₹', '₹ ');
  };

  const exportToPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = 20;

    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text("PROFORMA INVOICE", pageWidth / 2, currentY, { align: "center" });
    currentY += 15;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`CIN: ${branding?.cin || ""}`, margin, currentY);
    pdf.text(`Company GSTIN: ${branding?.cin?.slice(0, 15) || "22AOBPA5409G1ZO"}`, pageWidth / 2 - 20, currentY);
    pdf.text(`PI No: ${invoiceData.invoiceNumber}`, pageWidth - margin - 50, currentY);
    currentY += 5;
    pdf.text(`Email: ${branding?.email || "sales@reviranexgen.com"}`, pageWidth / 2 - 20, currentY);
    pdf.text(`Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, pageWidth - margin - 50, currentY);
    currentY += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Client Details:", margin, currentY);
    currentY += 6;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Organisation Name: ${invoiceData.organisationName}`, margin, currentY);
    currentY += 5;
    pdf.text(`Registered Address: ${invoiceData.registeredAddress}`, margin, currentY);
    currentY += 5;
    pdf.text(`Consignee Address: ${invoiceData.consigneeAddress}`, margin, currentY);
    currentY += 5;
    pdf.text(`GSTIN: ${invoiceData.clientGstin || ""}`, margin, currentY);
    currentY += 5;
    pdf.text(`W.O.No.: ${invoiceData.workOrderNo}`, margin, currentY);
    currentY += 5;
    pdf.text(`Dispatch Details: ${invoiceData.dispatchDetails}`, margin, currentY);
    currentY += 10;

    const tableHeaders = ["Sr.No.", "Description", "HSN Code", "Qty.", "Rate", "%age", "Amount (INR)"];
    const colWidths = [12, 70, 20, 15, 20, 15, 28];
    
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, currentY, contentWidth, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    
    let xPos = margin;
    tableHeaders.forEach((header, i) => {
      pdf.text(header, xPos + 2, currentY + 5);
      xPos += colWidths[i];
    });
    currentY += 10;

    pdf.setFont("helvetica", "normal");
    lineItems.forEach(item => {
      if (item.description.trim()) {
        xPos = margin;
        pdf.text(String(item.serialNo), xPos + 2, currentY);
        xPos += colWidths[0];
        const descLines = pdf.splitTextToSize(item.description, colWidths[1] - 4);
        pdf.text(descLines, xPos + 2, currentY);
        xPos += colWidths[1];
        pdf.text(item.hsnCode, xPos + 2, currentY);
        xPos += colWidths[2];
        pdf.text(String(item.quantity), xPos + 2, currentY);
        xPos += colWidths[3];
        pdf.text(String(item.ratePerUnit || "-"), xPos + 2, currentY);
        xPos += colWidths[4];
        pdf.text(String(item.percentage || "-"), xPos + 2, currentY);
        xPos += colWidths[5];
        pdf.text(formatCurrency(item.amount).replace('₹ ', ''), xPos + 2, currentY);
        currentY += Math.max(5, descLines.length * 4);
      }
    });
    
    currentY += 5;
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    const summaryX = pageWidth - margin - 80;
    pdf.text("Total Amount (INR)", summaryX, currentY);
    pdf.text(formatCurrency(totals.totalAmount), pageWidth - margin - 5, currentY, { align: "right" });
    currentY += 5;
    pdf.text("Total Amount before Tax", summaryX, currentY);
    pdf.text(formatCurrency(totals.totalAmount), pageWidth - margin - 5, currentY, { align: "right" });
    currentY += 5;

    if (invoiceData.appliedTaxType === "cgst_sgst") {
      pdf.text(`(1) Add: CGST ${invoiceData.cgstRate}%`, summaryX, currentY);
      pdf.text(formatCurrency(totals.cgstAmount), pageWidth - margin - 5, currentY, { align: "right" });
      currentY += 5;
      pdf.text(`(2) Add: SGST ${invoiceData.sgstRate}%`, summaryX, currentY);
      pdf.text(formatCurrency(totals.sgstAmount), pageWidth - margin - 5, currentY, { align: "right" });
      currentY += 5;
      pdf.text("(3) Add: IGST 0%", summaryX, currentY);
      pdf.text("0", pageWidth - margin - 5, currentY, { align: "right" });
    } else {
      pdf.text("(1) Add: CGST 0%", summaryX, currentY);
      pdf.text("0", pageWidth - margin - 5, currentY, { align: "right" });
      currentY += 5;
      pdf.text("(2) Add: SGST 0%", summaryX, currentY);
      pdf.text("0", pageWidth - margin - 5, currentY, { align: "right" });
      currentY += 5;
      pdf.text(`(3) Add: IGST ${invoiceData.igstRate}%`, summaryX, currentY);
      pdf.text(formatCurrency(totals.igstAmount), pageWidth - margin - 5, currentY, { align: "right" });
    }
    currentY += 5;
    pdf.text("Total GST", summaryX, currentY);
    pdf.text(formatCurrency(totals.totalTax), pageWidth - margin - 5, currentY, { align: "right" });
    currentY += 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Grand Total", summaryX, currentY);
    pdf.text(formatCurrency(totals.grandTotal), pageWidth - margin - 5, currentY, { align: "right" });
    currentY += 10;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const amountWords = numberToWords(totals.grandTotal);
    pdf.text(`Total Amount In Words: ${amountWords}`, margin, currentY);
    currentY += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Bank Details:", margin, currentY);
    currentY += 5;
    pdf.setFont("helvetica", "normal");
    pdf.text(`Account Name: ${branding?.entityName || "Revira NexGen Structures Pvt. Ltd"}`, margin, currentY);
    currentY += 4;
    pdf.text(`Address: ${branding?.headOfficeAddress || "28 E2 Block, Shivram Park, Nangloi, Delhi 41"}`, margin, currentY);
    currentY += 4;
    pdf.text("Account Number: 073361900002657", margin, currentY);
    currentY += 4;
    pdf.text("IFSC Code: YESB0000733", margin, currentY);
    currentY += 15;

    pdf.text(`For, ${branding?.entityName || "Revira NexGen Structures Pvt. Ltd"}`, pageWidth - margin - 60, currentY);
    currentY += 20;
    pdf.text("Authorised Signatory", pageWidth - margin - 50, currentY);

    const date = new Date();
    const dateStr = `${String(date.getDate()).padStart(2, '0')}${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear()}`;
    const companyShort = (branding?.entityName || "RNS").split(' ').map(w => w[0]).join('');
    const fileName = `PROFORMA_INVOICE_${dateStr}_${companyShort}_${invoiceData.revision}.pdf`;
    
    pdf.save(fileName);
    toast({
      title: "PDF exported",
      description: `Invoice saved as ${fileName}`,
    });
  };

  if (!project || !client || !user) {
    return (
      <LayoutShell user={user}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell user={user}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation("/revira/projects")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{project.projectName}</h1>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <MapPin className="h-4 w-4" />
                {project.location}
              </div>
            </div>
          </div>
          
          <Button
            className="bg-[#d92134] hover:bg-[#b51c2c]"
            data-testid="button-new-invoice"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>

        {/* Action Bar */}
        <div className="bg-[#d92134] rounded-xl p-4 mb-6 flex items-center justify-between">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-90"
            onClick={() => setVersionsDialogOpen(true)}
            data-testid="button-versions-count"
          >
            <span className="text-white font-medium">Versions</span>
            <div className="flex items-center justify-center px-3 h-8 bg-white text-[#d92134] rounded font-bold">
              {existingInvoice?.revision || invoiceData.revision || 'R-001'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => setVersionsDialogOpen(true)}
              data-testid="button-view-versions"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            {existingInvoice && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => duplicateInvoiceMutation.mutate()}
                disabled={duplicateInvoiceMutation.isPending}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-testid="button-duplicate"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
            
            <Button
              onClick={exportToPDF}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-white"
              data-testid="button-export-pdf"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              data-testid="button-save-invoice"
            >
              <Save className="w-4 h-4 mr-2" />
              {createInvoiceMutation.isPending || updateInvoiceMutation.isPending 
                ? "Saving..." 
                : "Save Changes"}
            </Button>
            
            {existingInvoice && invoiceVersions && invoiceVersions.length > 1 && (
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-red-200"
                onClick={async () => {
                  if (confirm(`Are you sure you want to delete this invoice (${existingInvoice.revision})?`)) {
                    deleteInvoiceMutation.mutate(existingInvoice.id);
                  }
                }}
                data-testid="button-delete-invoice"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Content */}
        <div className="space-y-6">
        {/* Invoice Header Info */}
        <Card>
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              INVOICE DETAILS
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-500">PI No.</label>
              <Input
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                data-testid="input-invoice-number"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Date</label>
              <Input
                value={new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Details */}
        <Card>
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-lg text-slate-700">CLIENT DETAILS</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">Organisation Name</label>
                <Input
                  value={invoiceData.organisationName}
                  onChange={(e) => setInvoiceData({ ...invoiceData, organisationName: e.target.value })}
                  data-testid="input-organisation-name"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Client GSTIN</label>
                <Input
                  value={invoiceData.clientGstin}
                  onChange={(e) => setInvoiceData({ ...invoiceData, clientGstin: e.target.value })}
                  data-testid="input-client-gstin"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-500">Registered Address</label>
              <Input
                value={invoiceData.registeredAddress}
                onChange={(e) => setInvoiceData({ ...invoiceData, registeredAddress: e.target.value })}
                data-testid="input-registered-address"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500">Consignee Address</label>
              <Textarea
                value={invoiceData.consigneeAddress}
                onChange={(e) => setInvoiceData({ ...invoiceData, consigneeAddress: e.target.value })}
                rows={2}
                data-testid="input-consignee-address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-500">W.O. No.</label>
                <Input
                  value={invoiceData.workOrderNo}
                  onChange={(e) => setInvoiceData({ ...invoiceData, workOrderNo: e.target.value })}
                  data-testid="input-work-order"
                />
              </div>
              <div>
                <label className="text-sm text-slate-500">Dispatch Details</label>
                <Input
                  value={invoiceData.dispatchDetails}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dispatchDetails: e.target.value })}
                  data-testid="input-dispatch-details"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items Table */}
        <Card>
          <CardHeader className="bg-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-slate-700">INVOICE ITEMS</CardTitle>
            <Button size="sm" onClick={addLineItem} data-testid="button-add-item">
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-sm font-medium text-slate-600 w-16">Sr.</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-600">Description</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-600 w-24">HSN Code</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-600 w-20">Qty</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-600 w-20">Unit</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-600 w-24">Rate</th>
                    <th className="p-3 text-left text-sm font-medium text-slate-600 w-28">Amount</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">
                        <Input
                          value={item.serialNo}
                          onChange={(e) => updateLineItem(item.id, "serialNo", parseInt(e.target.value) || 1)}
                          className="w-14 text-center"
                          data-testid={`input-serial-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                          rows={2}
                          placeholder="Description"
                          data-testid={`input-description-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={item.hsnCode}
                          onChange={(e) => updateLineItem(item.id, "hsnCode", e.target.value)}
                          data-testid={`input-hsn-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                          data-testid={`input-qty-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={item.unit}
                          onChange={(e) => updateLineItem(item.id, "unit", e.target.value)}
                          data-testid={`input-unit-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.ratePerUnit}
                          onChange={(e) => updateLineItem(item.id, "ratePerUnit", parseFloat(e.target.value) || 0)}
                          data-testid={`input-rate-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={item.amount}
                          onChange={(e) => updateLineItem(item.id, "amount", parseFloat(e.target.value) || 0)}
                          data-testid={`input-amount-${item.id}`}
                        />
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLineItem(item.id)}
                          disabled={lineItems.length === 1}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`button-remove-item-${item.id}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Totals */}
        <Card>
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-lg text-slate-700">TAX & TOTALS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-500">Tax Type</label>
                  <Select
                    value={invoiceData.appliedTaxType}
                    onValueChange={(value) => setInvoiceData({ ...invoiceData, appliedTaxType: value as "cgst_sgst" | "igst" })}
                  >
                    <SelectTrigger data-testid="select-tax-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="igst">IGST (Interstate)</SelectItem>
                      <SelectItem value="cgst_sgst">CGST + SGST (Intrastate)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {invoiceData.appliedTaxType === "cgst_sgst" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-500">CGST Rate (%)</label>
                      <Input
                        type="number"
                        value={invoiceData.cgstRate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, cgstRate: e.target.value })}
                        data-testid="input-cgst-rate"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-500">SGST Rate (%)</label>
                      <Input
                        type="number"
                        value={invoiceData.sgstRate}
                        onChange={(e) => setInvoiceData({ ...invoiceData, sgstRate: e.target.value })}
                        data-testid="input-sgst-rate"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-slate-500">IGST Rate (%)</label>
                    <Input
                      type="number"
                      value={invoiceData.igstRate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, igstRate: e.target.value })}
                      data-testid="input-igst-rate"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Amount</span>
                  <span className="font-medium">{formatCurrency(totals.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Amount before Tax</span>
                  <span className="font-medium">{formatCurrency(totals.totalAmount)}</span>
                </div>
                {invoiceData.appliedTaxType === "cgst_sgst" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">CGST ({invoiceData.cgstRate}%)</span>
                      <span>{formatCurrency(totals.cgstAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">SGST ({invoiceData.sgstRate}%)</span>
                      <span>{formatCurrency(totals.sgstAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">IGST ({invoiceData.igstRate}%)</span>
                    <span>{formatCurrency(totals.igstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-slate-600">Total Tax</span>
                  <span className="font-medium">{formatCurrency(totals.totalTax)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg">
                  <span className="font-bold text-slate-700">Grand Total</span>
                  <span className="font-bold text-blue-600">{formatCurrency(totals.grandTotal)}</span>
                </div>
                <div className="text-sm text-slate-500 mt-2">
                  {numberToWords(totals.grandTotal)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card>
          <CardHeader className="bg-slate-100">
            <CardTitle className="text-lg text-slate-700">BANK DETAILS</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Account Name:</span>
                <span className="ml-2 font-medium">{branding?.entityName || "Revira NexGen Structures Pvt. Ltd"}</span>
              </div>
              <div>
                <span className="text-slate-500">Account Number:</span>
                <span className="ml-2 font-medium">073361900002657</span>
              </div>
              <div>
                <span className="text-slate-500">Bank Address:</span>
                <span className="ml-2 font-medium">{branding?.headOfficeAddress || "28 E2 Block, Shivram Park, Nangloi, Delhi 41"}</span>
              </div>
              <div>
                <span className="text-slate-500">IFSC Code:</span>
                <span className="ml-2 font-medium">YESB0000733</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Versions Dialog */}
      <Dialog open={versionsDialogOpen} onOpenChange={setVersionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invoice Versions</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {invoiceVersions?.map((v) => (
              <div
                key={v.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  v.id === existingInvoice?.id
                    ? "bg-red-50 border-red-200"
                    : "hover:bg-slate-50"
                }`}
                onClick={() => {
                  setLocation(`/revira/projects/${projectId}/invoice/${v.id}`);
                  setVersionsDialogOpen(false);
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center justify-center px-3 h-7 bg-[#d92134] text-white rounded font-bold text-sm mb-1 w-fit">
                      {v.revision}
                    </div>
                    <p className="text-sm text-slate-600">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {invoiceVersions && invoiceVersions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete version ${v.revision}?`)) {
                          deleteInvoiceMutation.mutate(v.id);
                        }
                      }}
                      data-testid={`button-delete-version-${v.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </LayoutShell>
  );
}
