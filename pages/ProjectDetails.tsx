import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Copy,
  Trash2,
  Eye,
  Save,
  FileText,
  MapPin,
  ChevronUp,
  ChevronDown,
  Loader2,
  X,
  PenTool,
  Grid3X3,
  Columns,
  List,
  Type,
  MessageSquare,
  Download,
  Contact,
  Ruler,
  FilePlus,
  PlusCircle,
  Building,
} from "lucide-react";
import {
  Project,
  Client,
  Quotation,
  Branding,
  Section,
  WorkflowType,
} from "../types";
import QuotationPreview from "../components/QuotationPreview";
import { jsPDF } from "https://esm.sh/jspdf@2.5.1";

interface ProjectDetailsProps {
  projects: Project[];
  clients: Client[];
  quotations: Quotation[];
  branding: Branding;
  onAddQuotation: (projectId: string, type?: WorkflowType) => void;
  onUpdateQuotation: (id: string, updates: Partial<Quotation>) => void;
  onDeleteQuotation: (id: string) => void;
  onDuplicateQuotation: (id: string, type?: WorkflowType) => void;
}

interface Notification {
  type: "success" | "error" | "info";
  message: string;
  id: string;
}

const AutoExpandingTextarea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}> = ({ value, onChange, className, placeholder }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} resize-none overflow-hidden block w-full outline-none focus:outline-none`}
      placeholder={placeholder}
      rows={1}
    />
  );
};

const ProjectDetails: React.FC<ProjectDetailsProps> = ({
  projects,
  clients,
  quotations,
  branding,
  onAddQuotation,
  onUpdateQuotation,
  onDeleteQuotation,
  onDuplicateQuotation,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [localQuote, setLocalQuote] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });

  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [isDirty, setIsDirty] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const project = projects.find((p) => p.id === projectId);
  const client = clients.find((c) => c.id === project?.clientId);
  const projectQuotes = quotations
    .filter((q) => q.projectId === projectId)
    .sort((a, b) => b.version - a.version);

  useEffect(() => {
    if (projectQuotes.length > 0 && !selectedQuoteId) {
      setSelectedQuoteId(projectQuotes[projectQuotes.length - 1].id);
    }
  }, [projectQuotes, selectedQuoteId]);

  useEffect(() => {
    const quote = quotations.find((q) => q.id === selectedQuoteId);
    if (quote) {
      setLocalQuote(JSON.parse(JSON.stringify(quote)));
      setSaveStatus("idle");
      setIsDirty(false);
    }
  }, [selectedQuoteId, quotations]);

  const addNotification = (
    type: "success" | "error" | "info",
    message: string,
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { type, message, id }]);
    setTimeout(
      () => setNotifications((prev) => prev.filter((n) => n.id !== id)),
      4000,
    );
  };

  if (!project || !client) return null;

  const handleLocalUpdate = (updates: Partial<Quotation>) => {
    if (localQuote) {
      setLocalQuote((prev) => (prev ? { ...prev, ...updates } : null));
      setIsDirty(true);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!localQuote) return;
    const newSections = [...localQuote.sections];
    if (direction === "up" && index > 0)
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
    else if (direction === "down" && index < newSections.length - 1)
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
    handleLocalUpdate({ sections: newSections });
  };

  const addTableWithDimensions = () => {
    if (!localQuote) return;
    const { rows, cols } = tableConfig;
    const headers = new Array(cols)
      .fill("")
      .map((_, i) => (i === 0 ? "Sr. No." : `Attribute ${i + 1}`));
    const initialRows = new Array(rows)
      .fill("")
      .map(() => new Array(cols).fill(""));
    const columnWidths = new Array(cols)
      .fill(null)
      .map((_, i) => (i === 0 ? 21 : null));

    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: "NEW DATA MATRIX",
      type: "table",
      headers,
      rows: initialRows,
      items: [],
      content: "",
      columnWidths,
    };
    handleLocalUpdate({ sections: [...localQuote.sections, newSection] });
    setShowTableModal(false);
  };

  const addColumnToSection = (sectionId: string) => {
    if (!localQuote) return;
    const newSections = localQuote.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          headers: [...s.headers, `Col ${s.headers.length + 1}`],
          rows: s.rows.map((r) => [...r, ""]),
          columnWidths: [
            ...(s.columnWidths || new Array(s.headers.length).fill(null)),
            null,
          ],
        };
      }
      return s;
    });
    handleLocalUpdate({ sections: newSections });
  };

  const removeColumnFromSection = (sectionId: string, colIdx: number) => {
    if (!localQuote) return;
    const newSections = localQuote.sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          headers: s.headers.filter((_, i) => i !== colIdx),
          rows: s.rows.map((r) => r.filter((_, i) => i !== colIdx)),
          columnWidths: (
            s.columnWidths || new Array(s.headers.length).fill(null)
          ).filter((_, i) => i !== colIdx),
        };
      }
      return s;
    });
    handleLocalUpdate({ sections: newSections });
  };

  const updateColumnWidth = (
    sectionId: string,
    colIdx: number,
    width: number | null,
  ) => {
    if (!localQuote) return;
    const newSections = localQuote.sections.map((s) => {
      if (s.id === sectionId) {
        const newWidths = [
          ...(s.columnWidths || new Array(s.headers.length).fill(null)),
        ];
        newWidths[colIdx] = width;
        return { ...s, columnWidths: newWidths };
      }
      return s;
    });
    handleLocalUpdate({ sections: newSections });
  };

  const handleSaveToDatabase = async () => {
    if (!localQuote) return;
    setIsSaving(true);
    try {
      await onUpdateQuotation(localQuote.id, localQuote);
      setSaveStatus("success");
      setIsDirty(false);
      addNotification("success", "Offer synchronized with master storage.");
    } catch (error) {
      setSaveStatus("error");
      addNotification("error", "Sync Failure.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!localQuote) return;
    setIsExporting(true);
    addNotification("info", "Rendering Dynamic PDF Matrix...");

    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const margin = 12;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - margin * 2;

      const headerH = (120 + 10) * 0.264583;
      const footerH = (100 + 5 + 4) * 0.264583;
      const footerY = pageHeight - footerH;

      const brandBlue = [46, 49, 145];
      const brandRed = [236, 28, 36];
      const tableHeaderBg = [253, 242, 242];
      const zebraBg = [249, 249, 250];

      let currentPage = 1;
      let indexPageNum = -1;
      const sectionPageMap: Record<string, number> = {};

      const drawHeader = (d: jsPDF) => {
        if (branding.headerImage) {
          try {
            d.addImage(branding.headerImage, "JPEG", 0, 0, pageWidth, headerH);
          } catch (e) {}
        } else {
          d.setFillColor(255, 255, 255).rect(0, 0, pageWidth, headerH, "F");
          d.setFontSize(14)
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .setFont("helvetica", "bold")
            .text(branding.registry.name, pageWidth / 2, 12, {
              align: "center",
            });
          d.setFontSize(8)
            .setTextColor(100)
            .setFont("helvetica", "normal")
            .text(`CIN - ${branding.registry.cin}`, pageWidth / 2, 17, {
              align: "center",
            });
        }
      };

      const drawFooter = (d: jsPDF, pageNum: number) => {
        if (branding.footerImage) {
          try {
            d.addImage(
              branding.footerImage,
              "JPEG",
              0,
              footerY,
              pageWidth,
              footerH,
            );
          } catch (e) {}
        } else {
          d.setFillColor(255, 255, 255).rect(
            0,
            footerY,
            pageWidth,
            footerH,
            "F",
          );
          d.setDrawColor(brandRed[0], brandRed[1], brandRed[2])
            .setLineWidth(0.4)
            .line(margin, footerY + 2, margin + contentWidth, footerY + 2);
          d.setFontSize(7)
            .setFont("helvetica", "bold")
            .setTextColor(brandRed[0], brandRed[1], brandRed[2]);
          d.text("Nagpur - Office", margin, footerY + 8);
          d.text("Delhi - (H.O.)", margin + contentWidth / 2 + 5, footerY + 8);
          d.setFontSize(6).setFont("helvetica", "normal").setTextColor(80);
          const nagText = d.splitTextToSize(
            branding.registry.nagpurOffice,
            contentWidth / 2 - 10,
          );
          d.text(nagText, margin, footerY + 12);
          const delText = d.splitTextToSize(
            branding.registry.delhiOffice,
            contentWidth / 2 - 10,
          );
          d.text(delText, margin + contentWidth / 2 + 5, footerY + 12);
        }
        d.setFontSize(8)
          .setTextColor(150)
          .setFont("helvetica", "normal")
          .text(
            `Pg. ${pageNum}`,
            pageWidth - margin - 5,
            footerY + footerH - 5,
          );
      };

      const addNewPage = (d: jsPDF) => {
        d.addPage();
        currentPage++;
        drawHeader(d);
        drawFooter(d, currentPage);
        return headerH + 8;
      };

      // --- PAGE 1: COVER ---
      drawHeader(doc);
      drawFooter(doc, currentPage);
      let y = headerH + 10;

      doc.setFontSize(9).setTextColor(0).setFont("helvetica", "bold");
      doc.text(`Ref.: ${localQuote.refNo}`, margin, y);
      doc.text(`Date: ${localQuote.date}`, pageWidth - margin, y, {
        align: "right",
      });
      y += 5;
      doc.text(`Enquiry No.: ${localQuote.enquiryNo}`, margin, y);
      y += 5;
      doc.text(`Project Location: ${localQuote.location}`, margin, y);

      y += 15;
      doc.setFontSize(13).setTextColor(0).setFont("helvetica", "bold");
      const coverTitle = localQuote.introText.toUpperCase();
      doc.text(coverTitle, pageWidth / 2, y, { align: "center" });
      doc.line(
        (pageWidth - doc.getTextWidth(coverTitle)) / 2,
        y + 1,
        (pageWidth + doc.getTextWidth(coverTitle)) / 2,
        y + 1,
      );

      y += 15;
      doc.setFontSize(10).setFont("helvetica", "bold").text("To,", margin, y);
      y += 6;
      doc
        .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        .setFontSize(11)
        .text(`M/s ${localQuote.recipientName}`, margin + 5, y);
      y += 6;
      doc
        .setFontSize(9)
        .setTextColor(100)
        .text(localQuote.location, margin + 5, y);
      y += 12;
      doc
        .setTextColor(0)
        .setFontSize(10)
        .setFont("helvetica", "bold")
        .text(`Subject: ${localQuote.subject}`, margin + 5, y);
      y += 8;
      doc.text(localQuote.salutation, margin + 5, y);

      y += 8;
      doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(60);
      const introLines = doc.splitTextToSize(
        localQuote.introBody,
        contentWidth - 10,
      );
      doc.text(introLines, margin + 5, y);
      y += introLines.length * 5 + 15;

      doc
        .setFont("helvetica", "bold")
        .setTextColor(150)
        .text("Regards,", margin + 5, y);
      y += 8;
      doc
        .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        .setFontSize(12)
        .text(localQuote.regardsName, margin + 5, y);
      y += 6;
      doc
        .setTextColor(80)
        .setFontSize(9)
        .setFont("helvetica", "normal")
        .text(`Mo: ${localQuote.regardsPhone}`, margin + 5, y);
      y += 5;
      doc.text(`Email: ${localQuote.regardsEmail}`, margin + 5, y);

      // --- PAGE 2: INDEX ---
      if (project.workflow === WorkflowType.SUPPLY_AND_FABRICATION) {
        y = addNewPage(doc);
        indexPageNum = currentPage;
        doc
          .setFontSize(14)
          .setFont("helvetica", "bold")
          .setTextColor(brandRed[0], brandRed[1], brandRed[2])
          .text("INDEX", pageWidth / 2, y, { align: "center" });
        y += 12;

        doc.setLineWidth(0.2).setDrawColor(150);
        doc
          .setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2])
          .rect(margin, y, contentWidth, 10, "F");
        doc.rect(margin, y, contentWidth, 10);
        doc.line(margin + 20, y, margin + 20, y + 10);
        doc.line(
          margin + contentWidth - 30,
          y,
          margin + contentWidth - 30,
          y + 10,
        );
        doc.setFontSize(10).setTextColor(0).setFont("helvetica", "bold");
        doc.text("Sr. No.", margin + 4, y + 6.5);
        doc.text("Subject", margin + 25, y + 6.5);
        doc.text("Page No.", margin + contentWidth - 25, y + 6.5);
        y += 10;
      }

      // --- DYNAMIC CONTENT ---
      localQuote.sections.forEach((section, sIdx) => {
        if (sIdx === 0 || y > footerY - 40) y = addNewPage(doc);
        else y += 10;

        sectionPageMap[section.id] = currentPage;
        doc
          .setFillColor(brandRed[0], brandRed[1], brandRed[2])
          .rect(margin, y - 4, 3, 7, "F");
        doc
          .setFontSize(11)
          .setFont("helvetica", "bold")
          .setTextColor(0)
          .text(section.title.toUpperCase(), margin + 6, y + 1.5);
        y += 10;

        if (section.content) {
          doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(60);
          const cLines = doc.splitTextToSize(section.content, contentWidth);
          doc.text(cLines, margin, y);
          y += cLines.length * 4.5 + 5;
        }

        if (section.type === "table") {
          const totalFixed = (section.columnWidths || []).reduce(
            (acc, w) => acc + (w || 0),
            0,
          );
          const autoColsCount =
            section.headers.length -
            (section.columnWidths || []).filter((w) => w !== null).length;
          const autoWidth =
            autoColsCount > 0 ? (contentWidth - totalFixed) / autoColsCount : 0;
          const colWidthsCalculated = section.headers.map(
            (_, i) => section.columnWidths?.[i] || autoWidth,
          );

          doc.setLineWidth(0.2).setDrawColor(180);
          doc
            .setFillColor(tableHeaderBg[0], tableHeaderBg[1], tableHeaderBg[2])
            .rect(margin, y, contentWidth, 10, "F");
          doc.rect(margin, y, contentWidth, 10);
          doc.setFontSize(8).setFont("helvetica", "bold").setTextColor(0);

          let currentHeaderX = margin;
          section.headers.forEach((h, hi) => {
            if (hi > 0) doc.line(currentHeaderX, y, currentHeaderX, y + 10);
            doc.text(h, currentHeaderX + 2, y + 6);
            currentHeaderX += colWidthsCalculated[hi];
          });
          y += 10;

          section.rows.forEach((row, ri) => {
            let maxLines = 1;
            const rowContents = row.map((cell, ci) => {
              const lines = doc.splitTextToSize(
                cell,
                colWidthsCalculated[ci] - 4,
              );
              maxLines = Math.max(maxLines, lines.length);
              return lines;
            });
            const rowH = maxLines * 4 + 3;

            if (y + rowH > footerY - 5) {
              y = addNewPage(doc);
              doc
                .setFillColor(
                  tableHeaderBg[0],
                  tableHeaderBg[1],
                  tableHeaderBg[2],
                )
                .rect(margin, y, contentWidth, 10, "F");
              doc.rect(margin, y, contentWidth, 10);
              let tempX = margin;
              section.headers.forEach((h, hi) => {
                if (hi > 0) doc.line(tempX, y, tempX, y + 10);
                doc.text(h, tempX + 2, y + 6);
                tempX += colWidthsCalculated[hi];
              });
              y += 10;
            }

            if (ri % 2 !== 0)
              doc
                .setFillColor(zebraBg[0], zebraBg[1], zebraBg[2])
                .rect(margin, y, contentWidth, rowH, "F");
            doc.rect(margin, y, contentWidth, rowH);

            let tempRowX = margin;
            rowContents.forEach((lines, ci) => {
              if (ci > 0) doc.line(tempRowX, y, tempRowX, y + rowH);
              doc
                .setFontSize(8)
                .setFont("helvetica", "normal")
                .setTextColor(20)
                .text(lines, tempRowX + 2, y + 4.5);
              tempRowX += colWidthsCalculated[ci];
            });
            y += rowH;
          });
        }

        if (section.type === "list" || section.type === "mixed") {
          section.items.forEach((item) => {
            const iLines = doc.splitTextToSize(item, contentWidth - 10);
            const itemH = iLines.length * 5 + 1.5;
            if (y + itemH > footerY - 5) y = addNewPage(doc);
            doc
              .setFillColor(brandRed[0], brandRed[1], brandRed[2])
              .circle(margin + 2.5, y + 1.5, 0.7, "F");
            doc
              .setFontSize(9)
              .setFont("helvetica", "normal")
              .setTextColor(60)
              .text(iLines, margin + 7, y + 2.5);
            y += itemH;
          });
        }

        if (sIdx === localQuote.sections.length - 1) {
          y += 12;
          if (y > footerY - 60) y = addNewPage(doc);
          doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(40);
          const closeLines = doc.splitTextToSize(
            localQuote.closingBody,
            contentWidth,
          );
          doc.text(closeLines, margin, y);
          y += closeLines.length * 5 + 10;
          doc.setDrawColor(240).line(margin, y, margin + contentWidth, y);
          y += 8;
          doc
            .setFontSize(10)
            .setTextColor(0)
            .setFont("helvetica", "bold")
            .text("Thanking you", margin, y);
          y += 8;
          doc
            .setFontSize(13)
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .setFont("helvetica", "bold")
            .text(branding.registry.name, margin, y);
          doc
            .setFontSize(9)
            .setTextColor(200)
            .setFont("helvetica", "bold")
            .text("!! End of Documents !!", pageWidth / 2, footerY - 3, {
              align: "center",
            });
        }
      });

      // Final pass for Index Page Numbers
      if (indexPageNum !== -1) {
        doc.setPage(indexPageNum);
        let indexY = headerH + 10 + 12 + 10;
        localQuote.sections.forEach((s, idx) => {
          doc.setLineWidth(0.2).setDrawColor(150);
          doc.rect(margin, indexY, contentWidth, 9);
          doc.line(margin + 20, indexY, margin + 20, indexY + 9);
          doc.line(
            margin + contentWidth - 30,
            indexY,
            margin + contentWidth - 30,
            indexY + 9,
          );
          doc.setFontSize(9).setTextColor(0).setFont("helvetica", "normal");
          doc.text(
            (idx + 1).toString().padStart(2, "0"),
            margin + 10,
            indexY + 6,
            { align: "center" },
          );
          doc
            .setFont("helvetica", "bold")
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
          doc.text(s.title.toUpperCase(), margin + 25, indexY + 6);
          doc.setFont("helvetica", "normal").setTextColor(150);
          doc.text(
            sectionPageMap[s.id].toString(),
            margin + contentWidth - 15,
            indexY + 6,
            { align: "center" },
          );
          indexY += 9;
        });
      }

      // --- STAMP ON FRONT Pass ---
      if (branding.stampSignature) {
        const totalPages = doc.getNumberOfPages();
        const sWidth = 70 * 0.264583;
        const sHeight = 70 * 0.264583;
        const sX = pageWidth - 50 * 0.264583 - sWidth;
        const sY = pageHeight - 100 * 0.264583 - sHeight;

        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          try {
            doc.addImage(
              branding.stampSignature,
              "PNG",
              sX,
              sY,
              sWidth,
              sHeight,
              undefined,
              "FAST",
            );
          } catch (e) {}
        }
      }

      doc.save(`Quotation_${localQuote.refNo.replace(/\//g, "_")}.pdf`);
      addNotification("success", "Corporate Offer Cluster Dispatched.");
    } catch (e: any) {
      addNotification("error", `PDF Render Conflict: ${e.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 relative bg-slate-50/20 min-h-full animate-fade-in">
      {/* Notifications */}
      <div className="fixed top-20 right-4 lg:right-8 z-[120] space-y-3 pointer-events-none w-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-slide-in-right ${
              n.type === "success"
                ? "bg-[#2E3191] text-white border-white/10"
                : n.type === "error"
                  ? "bg-[#EC1C24] text-white border-white/10"
                  : "bg-blue-50 text-blue-900 border-blue-100"
            }`}
          >
            <p className="text-[10px] font-black uppercase tracking-widest">
              {n.message}
            </p>
          </div>
        ))}
      </div>

      {/* Main Header with Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/projects")}
            className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-[#2E3191] transition-all focus:ring-2 focus:ring-[#2E3191]/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight">
              {project.name}
            </h1>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <MapPin size={12} className="text-[#EC1C24]" /> {project.location}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddQuotation(project.id)}
            className="px-6 py-4 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-[#2E3191]/20 hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <FilePlus size={16} /> New Quotation
          </button>
        </div>
      </div>

      {localQuote ? (
        <div className="space-y-6">
          {/* Version Switcher and Context Actions (Sticky Bar) */}
          <div className="bg-[#2E3191] p-4 lg:p-5 rounded-[2.5rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-40 border border-white/10 mx-1">
            <div className="flex items-center overflow-x-auto no-scrollbar space-x-3 py-1 px-1 flex-1">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-widest mr-2">
                Versions:
              </span>
              {projectQuotes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all shrink-0 border-2 ${
                    selectedQuoteId === q.id
                      ? "bg-[#EC1C24] text-white border-white shadow-[0_8px_16px_-4px_rgba(236,28,36,0.5)] scale-110 z-10"
                      : "bg-white/10 text-white/30 border-white/5 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {q.version}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all group"
                title="View Quotation (Preview)"
              >
                <Eye size={20} className="group-hover:scale-110" />
              </button>
              <button
                onClick={() => onDuplicateQuotation(localQuote.id)}
                className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all group"
                title="Duplicate Current Version"
              >
                <Copy size={20} className="group-hover:scale-110" />
              </button>
              <button
                onClick={handleExportPDF}
                disabled={isExporting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isExporting ? "bg-white/10 text-white/30" : "bg-emerald-500 text-white shadow-lg active:scale-95"}`}
              >
                {isExporting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Download size={16} />
                )}
                Export PDF
              </button>
              <button
                onClick={handleSaveToDatabase}
                disabled={!isDirty || isSaving}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isSaving ? "bg-white/10 text-white/30" : isDirty ? "bg-white text-[#2E3191] animate-save-pulse" : "bg-white/5 text-white/20 cursor-default"}`}
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saveStatus === "success" ? "Synced" : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  onDeleteQuotation(localQuote.id);
                  setSelectedQuoteId(null);
                }}
                className="p-3 bg-white/10 text-white/30 hover:text-[#EC1C24] rounded-xl transition-all"
                title="Purge Version"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>

          {/* Offer Editor */}
          <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-sm space-y-12">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
              <PenTool size={22} className="text-[#EC1C24]" />
              <h2 className="text-xl lg:text-2xl font-black text-[#2E3191] uppercase tracking-tight">
                Technical Proposal Metadata
              </h2>
            </div>

            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                      Ref ID
                    </label>
                    <input
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5"
                      value={localQuote.refNo}
                      onChange={(e) =>
                        handleLocalUpdate({ refNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                      Creation Date
                    </label>
                    <input
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5"
                      value={localQuote.date}
                      onChange={(e) =>
                        handleLocalUpdate({ date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                      Enquiry Ref
                    </label>
                    <input
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5"
                      value={localQuote.enquiryNo}
                      onChange={(e) =>
                        handleLocalUpdate({ enquiryNo: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                      Project Site (Legacy)
                    </label>
                    <input
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-[#2E3191]/5"
                      value={localQuote.location}
                      onChange={(e) =>
                        handleLocalUpdate({ location: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                      Proposal Header Title
                    </label>
                    <input
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black uppercase transition-all focus:ring-4 focus:ring-[#2E3191]/5"
                      value={localQuote.introText}
                      onChange={(e) =>
                        handleLocalUpdate({ introText: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                      Client Subject Specification
                    </label>
                    <input
                      className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold transition-all focus:ring-4 focus:ring-[#2E3191]/5"
                      value={localQuote.subject}
                      onChange={(e) =>
                        handleLocalUpdate({ subject: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* NEW RECIPIENT BLOCK INSIDE MAIN COVERING LETTER */}
              <div className="bg-white rounded-[2.5rem] p-8 lg:p-10 border-2 border-[#2E3191]/5 space-y-6 animate-fade-in shadow-lg shadow-[#2E3191]/5">
                <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                  <Building size={20} className="text-[#EC1C24]" />
                  <h3 className="text-sm font-black text-[#2E3191] uppercase tracking-tight">
                    Main Covering Letter (Recipient Block)
                  </h3>
                </div>

                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                  <p className="text-[11px] font-black text-[#EC1C24] uppercase tracking-[0.2em] mb-4">
                    To,
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                        Company Name
                      </label>
                      <input
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-black uppercase outline-none focus:ring-4 focus:ring-[#2E3191]/10 transition-all"
                        value={localQuote.recipientName}
                        onChange={(e) =>
                          handleLocalUpdate({ recipientName: e.target.value })
                        }
                        placeholder="M/s Organisation Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                        Project Location (Site)
                      </label>
                      <input
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-[#2E3191]/10 transition-all"
                        value={localQuote.location}
                        onChange={(e) =>
                          handleLocalUpdate({ location: e.target.value })
                        }
                        placeholder="Site Location Address"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                    Main Covering Letter Context (Body)
                  </label>
                  <textarea
                    className="w-full px-6 py-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] text-sm font-medium h-64 leading-relaxed outline-none focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 transition-all shadow-inner"
                    value={localQuote.introBody}
                    onChange={(e) =>
                      handleLocalUpdate({ introBody: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="bg-[#2E3191]/5 p-8 rounded-[2.5rem] border border-[#2E3191]/10 space-y-6">
                <div className="flex items-center gap-3 border-b border-[#2E3191]/10 pb-4">
                  <Contact size={20} className="text-[#EC1C24]" />
                  <h4 className="text-[10px] font-black text-[#2E3191] uppercase tracking-widest">
                    Master Signatory Authority
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase ml-1">
                      Full Legal Name
                    </p>
                    <input
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-black text-[#2E3191]"
                      value={localQuote.regardsName}
                      onChange={(e) =>
                        handleLocalUpdate({ regardsName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase ml-1">
                      Contact Handset
                    </p>
                    <input
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-[#2E3191]"
                      value={localQuote.regardsPhone}
                      onChange={(e) =>
                        handleLocalUpdate({ regardsPhone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase ml-1">
                      Official SMTP Channel
                    </p>
                    <input
                      className="w-full px-5 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-[#2E3191]"
                      value={localQuote.regardsEmail}
                      onChange={(e) =>
                        handleLocalUpdate({ regardsEmail: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {localQuote.sections.map((section, idx) => (
              <div
                key={section.id}
                className="bg-white rounded-[2.5rem] p-8 lg:p-10 border border-slate-100 shadow-sm space-y-6 group hover:border-[#2E3191]/20 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#2E3191] text-white flex items-center justify-center font-black text-xs">
                      {(idx + 1).toString().padStart(2, "0")}
                    </div>
                    <input
                      className="flex-1 bg-transparent border-b-2 border-transparent focus:border-[#EC1C24] outline-none font-black uppercase text-[#2E3191] text-sm py-1 transition-all"
                      value={section.title}
                      onChange={(e) =>
                        handleLocalUpdate({
                          sections: localQuote.sections.map((s) =>
                            s.id === section.id
                              ? { ...s, title: e.target.value }
                              : s,
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {section.type === "table" && (
                      <button
                        onClick={() => addColumnToSection(section.id)}
                        className="p-2 text-[#2E3191] hover:bg-blue-50 rounded-xl flex items-center gap-1 text-[9px] font-black uppercase"
                      >
                        <Columns size={16} /> + Column
                      </button>
                    )}
                    <button
                      onClick={() => moveSection(idx, "up")}
                      className="p-2 text-slate-300 hover:text-[#2E3191]"
                    >
                      <ChevronUp size={20} />
                    </button>
                    <button
                      onClick={() => moveSection(idx, "down")}
                      className="p-2 text-slate-300 hover:text-[#2E3191]"
                    >
                      <ChevronDown size={20} />
                    </button>
                    <button
                      onClick={() =>
                        handleLocalUpdate({
                          sections: localQuote.sections.filter(
                            (s) => s.id !== section.id,
                          ),
                        })
                      }
                      className="p-2 text-slate-200 hover:text-[#EC1C24] transition-all"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {section.type === "table" && (
                  <div className="overflow-x-auto rounded-3xl border border-slate-50 pb-4">
                    <table className="w-full text-xs border-collapse">
                      <thead className="bg-slate-50 font-black uppercase tracking-widest border-b border-slate-100">
                        <tr>
                          <th className="p-5 text-center border-r w-12 text-slate-400">
                            #
                          </th>
                          {section.headers.map((h, hi) => {
                            const isSrNo =
                              h.toLowerCase().includes("sr.") ||
                              h.toLowerCase().includes("sl.");
                            const currentWidth = section.columnWidths?.[hi];
                            return (
                              <th
                                key={hi}
                                className="p-5 text-left border-r last:border-r-0 relative group/col"
                              >
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      className="bg-transparent outline-none w-full font-black text-[#2E3191]"
                                      value={h}
                                      onChange={(e) => {
                                        const newH = [...section.headers];
                                        newH[hi] = e.target.value;
                                        handleLocalUpdate({
                                          sections: localQuote.sections.map(
                                            (s) =>
                                              s.id === section.id
                                                ? { ...s, headers: newH }
                                                : s,
                                          ),
                                        });
                                      }}
                                    />
                                    {!isSrNo && hi > 0 && (
                                      <button
                                        onClick={() =>
                                          removeColumnFromSection(
                                            section.id,
                                            hi,
                                          )
                                        }
                                        className="opacity-0 group-hover/col:opacity-100 text-[#EC1C24]"
                                      >
                                        <X size={14} />
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-20 group-hover/col:opacity-100 transition-opacity">
                                    <Ruler
                                      size={10}
                                      className="text-slate-400"
                                    />
                                    <input
                                      type="number"
                                      className="bg-white border border-slate-200 rounded px-1 text-[9px] w-12 outline-none font-bold"
                                      placeholder="Auto"
                                      value={currentWidth || ""}
                                      onChange={(e) =>
                                        updateColumnWidth(
                                          section.id,
                                          hi,
                                          e.target.value === ""
                                            ? null
                                            : parseInt(e.target.value),
                                        )
                                      }
                                    />
                                    <span className="text-[7px] text-slate-400 font-black">
                                      MM
                                    </span>
                                  </div>
                                </div>
                              </th>
                            );
                          })}
                          <th className="p-5 text-center w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {section.rows.map((row, ri) => (
                          <tr
                            key={ri}
                            className="hover:bg-slate-50/50 group/row"
                          >
                            <td className="p-5 text-center border-r text-xs font-black text-slate-300">
                              {ri + 1}
                            </td>
                            {row.map((cell, ci) => (
                              <td
                                key={ci}
                                className="p-5 border-r last:border-r-0 font-bold text-slate-600"
                              >
                                <AutoExpandingTextarea
                                  value={cell}
                                  onChange={(val) => {
                                    const newRows = [...section.rows];
                                    newRows[ri] = [...newRows[ri]];
                                    newRows[ri][ci] = val;
                                    handleLocalUpdate({
                                      sections: localQuote.sections.map((s) =>
                                        s.id === section.id
                                          ? { ...s, rows: newRows }
                                          : s,
                                      ),
                                    });
                                  }}
                                  className="bg-transparent text-xs"
                                />
                              </td>
                            ))}
                            <td className="p-5 text-center">
                              <button
                                onClick={() =>
                                  handleLocalUpdate({
                                    sections: localQuote.sections.map((s) =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            rows: s.rows.filter(
                                              (_, i) => i !== ri,
                                            ),
                                          }
                                        : s,
                                    ),
                                  })
                                }
                                className="opacity-0 group-hover/row:opacity-100 p-2 text-slate-200 hover:text-[#EC1C24] transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button
                      onClick={() =>
                        handleLocalUpdate({
                          sections: localQuote.sections.map((s) =>
                            s.id === section.id
                              ? {
                                  ...s,
                                  rows: [
                                    ...s.rows,
                                    new Array(s.headers.length).fill(""),
                                  ],
                                }
                              : s,
                          ),
                        })
                      }
                      className="w-full p-5 text-[10px] font-black uppercase text-[#2E3191] hover:bg-slate-50 border-t border-dashed border-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={16} /> Add Ledger Entry
                    </button>
                  </div>
                )}

                {section.type === "list" && (
                  <div className="space-y-4">
                    {section.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EC1C24] shrink-0"></div>
                        <AutoExpandingTextarea
                          value={item}
                          onChange={(val) => {
                            const newI = [...section.items];
                            newI[ii] = val;
                            handleLocalUpdate({
                              sections: localQuote.sections.map((s) =>
                                s.id === section.id ? { ...s, items: newI } : s,
                              ),
                            });
                          }}
                          className="flex-1 bg-slate-50/50 p-5 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-[#2E3191] focus:bg-white transition-all shadow-inner"
                        />
                        <button
                          onClick={() =>
                            handleLocalUpdate({
                              sections: localQuote.sections.map((s) =>
                                s.id === section.id
                                  ? {
                                      ...s,
                                      items: s.items.filter((_, i) => i !== ii),
                                    }
                                  : s,
                              ),
                            })
                          }
                          className="p-2 text-slate-200 hover:text-[#EC1C24] transition-all"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        handleLocalUpdate({
                          sections: localQuote.sections.map((s) =>
                            s.id === section.id
                              ? { ...s, items: [...s.items, ""] }
                              : s,
                          ),
                        })
                      }
                      className="text-[10px] font-black uppercase text-[#2E3191] ml-6 hover:underline transition-all"
                    >
                      + Append Bullet Specification
                    </button>
                  </div>
                )}

                {section.type === "text" && (
                  <textarea
                    className="w-full bg-slate-50/50 p-8 rounded-[2rem] text-xs font-medium leading-relaxed outline-none border border-transparent focus:border-[#2E3191] focus:bg-white h-48 transition-all shadow-inner"
                    value={section.content}
                    onChange={(e) =>
                      handleLocalUpdate({
                        sections: localQuote.sections.map((s) =>
                          s.id === section.id
                            ? { ...s, content: e.target.value }
                            : s,
                        ),
                      })
                    }
                  />
                )}
              </div>
            ))}

            <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <MessageSquare size={22} className="text-[#EC1C24]" />
                <h2 className="text-xl font-black text-[#2E3191] uppercase tracking-tight">
                  Closing Affirmation
                </h2>
              </div>
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-[#2E3191] tracking-widest ml-1">
                    Commercial Wrap-Up Text
                  </label>
                  <textarea
                    className="w-full px-6 py-6 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] text-xs font-medium h-40 leading-relaxed outline-none focus:bg-white transition-all shadow-inner"
                    value={localQuote.closingBody}
                    onChange={(e) =>
                      handleLocalUpdate({ closingBody: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Formal Sign-Off
                    </p>
                    <p className="text-sm font-bold text-slate-800 p-5 bg-slate-50 rounded-2xl border border-slate-100 italic">
                      Thanking you
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      Entity Authorization Signature
                    </p>
                    <p className="text-sm font-black text-[#2E3191] p-5 bg-slate-50 rounded-2xl border border-slate-100 uppercase tracking-tight">
                      {branding.registry.name}
                    </p>
                  </div>
                </div>
                <div className="pt-10 text-center">
                  <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.8em]">
                    !! DOCUMENT TERMINATION !!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => setShowTableModal(true)}
                className="px-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-[#2E3191] hover:border-[#2E3191] hover:shadow-xl transition-all flex items-center gap-3"
              >
                <Grid3X3 size={20} /> Deploy Matrix
              </button>
              <button
                onClick={() =>
                  handleLocalUpdate({
                    sections: [
                      ...localQuote.sections,
                      {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "NEW TECHNICAL SPECIFICATIONS",
                        type: "list",
                        headers: [],
                        rows: [],
                        items: [""],
                        content: "",
                      },
                    ],
                  })
                }
                className="px-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-emerald-600 hover:border-emerald-500 hover:shadow-xl transition-all flex items-center gap-3"
              >
                <List size={20} /> Deploy List
              </button>
              <button
                onClick={() =>
                  handleLocalUpdate({
                    sections: [
                      ...localQuote.sections,
                      {
                        id: Math.random().toString(36).substr(2, 9),
                        title: "TECHNICAL COMMENTARY",
                        type: "text",
                        headers: [],
                        rows: [],
                        items: [],
                        content: "Enter technical context here...",
                      },
                    ],
                  })
                }
                className="px-8 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-[10px] uppercase tracking-widest text-amber-600 hover:border-amber-500 hover:shadow-xl transition-all flex items-center gap-3"
              >
                <Type size={20} /> Deploy Text
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <div className="p-8 rounded-[2rem] bg-slate-50 mb-6">
            <FileText size={64} className="opacity-10" />
          </div>
          <p className="font-black uppercase tracking-[0.3em] text-xs mb-8">
            No Active Versions Discovered
          </p>
          <button
            onClick={() => onAddQuotation(project.id)}
            className="px-10 py-5 bg-[#2E3191] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-[#2E3191]/20 active:scale-95 transition-all"
          >
            Generate Master Draft V1
          </button>
        </div>
      )}

      {/* Full Preview Portal */}
      {isPreviewOpen && localQuote && (
        <div className="fixed inset-0 z-[110] bg-white flex flex-col animate-fade-in overflow-y-auto">
          <div className="flex items-center justify-between p-6 bg-[#2E3191] sticky top-0 z-50 no-print border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xs">
                V{localQuote.version}
              </div>
              <h2 className="text-white font-black uppercase text-xs tracking-widest">
                {localQuote.refNo}
              </h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleExportPDF}
                className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase transition-all active:scale-95 shadow-xl flex items-center gap-2"
              >
                <Download size={14} /> Download PDF
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-2.5 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-0 flex justify-center bg-slate-50/50 print:bg-white">
            <div className="w-full max-w-4xl shadow-2xl bg-white print:shadow-none print:max-w-none my-8 lg:my-16 border border-slate-200/50 rounded-lg overflow-hidden">
              <QuotationPreview
                quotation={localQuote}
                branding={branding}
                client={client}
                project={project}
              />
            </div>
          </div>
        </div>
      )}

      {/* Table Config Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-[130] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xs p-10 space-y-8 animate-fade-in border border-slate-100">
            <h3 className="text-xl font-black text-[#2E3191] uppercase text-center tracking-tight">
              Matrix Geometry
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Rows
                </label>
                <input
                  type="number"
                  className="w-full p-5 bg-slate-50 rounded-2xl text-center font-black text-[#2E3191] outline-none focus:ring-4 focus:ring-[#2E3191]/5"
                  value={tableConfig.rows}
                  onChange={(e) =>
                    setTableConfig({
                      ...tableConfig,
                      rows: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">
                  Columns
                </label>
                <input
                  type="number"
                  className="w-full p-5 bg-slate-50 rounded-2xl text-center font-black text-[#2E3191] outline-none focus:ring-4 focus:ring-[#2E3191]/5"
                  value={tableConfig.cols}
                  onChange={(e) =>
                    setTableConfig({
                      ...tableConfig,
                      cols: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowTableModal(false)}
                className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest"
              >
                Abort
              </button>
              <button
                onClick={addTableWithDimensions}
                className="flex-1 py-4 bg-[#EC1C24] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Construct
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
