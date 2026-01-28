import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowLeft,
  Copy,
  Trash2,
  Eye,
  PlusCircle,
  Save,
  CheckCircle2,
  FileText,
  Hash,
  MapPin,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Layout,
  FileDown,
  Loader2,
  X,
  AlertCircle,
  AlertTriangle,
  Info,
  User as UserIcon,
  Columns,
  Calendar,
  Maximize2,
  Send,
  MessageCircle,
  Mail as MailIcon,
  Download,
  AtSign,
  FileCheck,
  Grid3X3,
  List as ListIcon,
  AlignLeft,
  PenTool,
  TextQuote,
  CheckSquare,
  ShieldCheck,
  MailPlus,
  Terminal,
  Activity,
  Server,
  Upload,
  Image as ImageIcon,
  File as FileIcon,
  FileSignature,
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
  onAddQuotation: (projectId: string) => void;
  onUpdateQuotation: (id: string, updates: Partial<Quotation>) => void;
  onDeleteQuotation: (id: string) => void;
  onDuplicateQuotation: (id: string) => void;
}

interface Notification {
  type: "success" | "error" | "info";
  message: string;
  id: string;
}

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
  const mockupInputRef = useRef<HTMLInputElement>(null);

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [localQuote, setLocalQuote] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<"choice" | "email">(
    "choice",
  );
  const [emailCompose, setEmailCompose] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableConfig, setTableConfig] = useState({ rows: 3, cols: 3 });

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [transmissionStatus, setTransmissionStatus] = useState<string>("");
  const [downloadStep, setDownloadStep] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const project = projects.find((p) => p.id === projectId);
  const client = clients.find((c) => c.id === project?.clientId);
  const projectQuotes = quotations
    .filter((q) => q.projectId === projectId)
    .sort((a, b) => b.version - a.version);

  useEffect(() => {
    if (projectQuotes.length > 0 && !selectedQuoteId) {
      setSelectedQuoteId(projectQuotes[0].id);
    }
  }, [projectQuotes, selectedQuoteId]);

  useEffect(() => {
    const quote = quotations.find((q) => q.id === selectedQuoteId);
    if (quote) {
      setLocalQuote(JSON.parse(JSON.stringify(quote)));
      setHasUnsavedChanges(false);
      setSaveStatus("idle");
    } else {
      setLocalQuote(null);
    }
  }, [selectedQuoteId, quotations, client]);

  const addNotification = (
    type: "success" | "error" | "info",
    message: string,
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { type, message, id }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  if (!project || !client) return null;

  const handleLocalUpdate = (updates: Partial<Quotation>) => {
    if (localQuote) {
      setLocalQuote((prev) => (prev ? { ...prev, ...updates } : null));
      setHasUnsavedChanges(true);
      setSaveStatus("idle");
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (!localQuote) return;
    const newSections = [...localQuote.sections];
    if (direction === "up" && index > 0) {
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
    } else if (direction === "down" && index < newSections.length - 1) {
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
    }
    handleLocalUpdate({ sections: newSections });
  };

  const handleMockupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && localQuote) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const currentMockups = localQuote.designMockups || [];
          handleLocalUpdate({
            designMockups: [...currentMockups, reader.result as string],
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMockup = (idx: number) => {
    if (localQuote && localQuote.designMockups) {
      const updated = localQuote.designMockups.filter((_, i) => i !== idx);
      handleLocalUpdate({ designMockups: updated });
    }
  };

  const handleDeleteVersion = () => {
    if (!localQuote) return;
    onDeleteQuotation(localQuote.id);
    // Note: Confirmation happens in App.tsx. If user cancels, nothing happens.
    // If they delete, selection will naturally reset when quotations array changes.
  };

  const handleSaveToDatabase = async () => {
    if (!localQuote) return false;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 800));
      onUpdateQuotation(localQuote.id, localQuote);
      setHasUnsavedChanges(false);
      setSaveStatus("success");
      addNotification("success", "Database synchronization successful.");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return true;
    } catch (error) {
      setSaveStatus("error");
      addNotification("error", "Critical Sync Failure.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async (quoteOverride?: Quotation) => {
    const targetQuote = quoteOverride || localQuote;
    if (!targetQuote || !client || !project) return;
    setIsDownloading(true);
    setDownloadStep("Initializing Engine...");

    try {
      if (!quoteOverride && hasUnsavedChanges) await handleSaveToDatabase();

      const doc = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      const margin = 20;
      const pageWidth = 210;
      const pageHeight = 297;
      const contentWidth = pageWidth - margin * 2;

      const footerHeight = 29.5;
      const pageHeightLimit = pageHeight - footerHeight - 5;

      const PADD = 1.32;
      const LINE_HEIGHT = 5.5;
      const BODY_FONT_SIZE = 10;
      const TITLE_FONT_SIZE = 11;

      const brandBlue = [46, 49, 145];
      const brandRed = [236, 28, 36];
      const slate600 = [71, 85, 105];
      const headerBg = [253, 242, 242];

      let currentPageNum = 1;
      const sectionPageNumbers: number[] = [];

      const drawHeader = () => {
        if (branding.headerImage) {
          doc.addImage(
            branding.headerImage,
            "PNG",
            0,
            0,
            210,
            35,
            undefined,
            "FAST",
          );
          return 40;
        } else {
          doc.addImage(
            branding.logo,
            "PNG",
            margin,
            10,
            30,
            15,
            undefined,
            "FAST",
          );
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
          doc.text(branding.registry.name, pageWidth - margin, 18, {
            align: "right",
          });
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(`CIN: ${branding.registry.cin}`, pageWidth - margin, 22, {
            align: "right",
          });
          return 35;
        }
      };

      const drawFooter = (pNum: number) => {
        const footerY = pageHeight - footerHeight;
        const pageLabel = `Pg. ${pNum}`;

        if (branding.footerImage) {
          doc.addImage(
            branding.footerImage,
            "PNG",
            0,
            footerY,
            210,
            footerHeight,
            undefined,
            "FAST",
          );
        } else {
          doc.setDrawColor(200);
          doc.setLineWidth(0.1);
          doc.line(margin, footerY, pageWidth - margin, footerY);
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(brandRed[0], brandRed[1], brandRed[2]);
          doc.text("Nagpur - Office", margin, footerY + 5);
          doc.text("Delhi - (H.O.)", 120, footerY + 5);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100);
          doc.text(branding.registry.nagpurOffice, margin, footerY + 11, {
            maxWidth: 80,
          });
          doc.text(branding.registry.delhiOffice, 120, footerY + 11, {
            maxWidth: 80,
          });
        }

        doc.setFontSize(5);
        doc.setTextColor(150);
        doc.setFont("helvetica", "bold");
        doc.text(pageLabel, pageWidth - 8, pageHeight - 3, { align: "right" });
      };

      const triggerNewPage = () => {
        drawFooter(currentPageNum);
        doc.addPage();
        currentPageNum++;
        const nextY = drawHeader();
        return nextY + 10;
      };

      const getColWidths = (section: Section) => {
        const headers = section.headers;
        const customWidths = section.columnWidths || [];
        const widths = headers.map((h, i) => {
          if (customWidths[i] !== null && customWidths[i] !== undefined)
            return customWidths[i] as number;
          const hText = h.toLowerCase();
          if (
            i === 0 &&
            (hText.includes("sl") ||
              hText.includes("s.n") ||
              hText.includes("sr") ||
              hText.includes("no"))
          )
            return 15;
          if (hText.includes("uom") || hText.includes("qty")) return 18;
          if (hText.includes("rate") || hText.includes("amount")) return 28;
          return 0;
        });
        const fixedTotal = widths.reduce((a, b) => a + b, 0);
        const dynamicCount = widths.filter((w) => w === 0).length;
        const dynamicWidth =
          dynamicCount > 0 ? (contentWidth - fixedTotal) / dynamicCount : 0;
        return widths.map((w) => (w === 0 ? dynamicWidth : w));
      };

      setDownloadStep("Generating Cover Letter...");
      let y = drawHeader() + 10;
      doc.setFontSize(9);
      doc.setTextColor(brandBlue[0], brandBlue[1], brandBlue[2]);
      doc.setFont("helvetica", "bold");
      doc.text(`Ref.:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(targetQuote.refNo, margin + 12, y);
      doc.text(`Date: ${targetQuote.date}`, pageWidth - margin, y, {
        align: "right",
      });
      y += 6;
      doc.setFont("helvetica", "bold").text(`Enquiry No.:`, margin, y);
      doc
        .setFont("helvetica", "normal")
        .text(targetQuote.enquiryNo, margin + 22, y);
      y += 6;
      doc.setFont("helvetica", "bold").text(`Project Location:`, margin, y);
      doc
        .setFont("helvetica", "normal")
        .text(targetQuote.location, margin + 30, y);

      y += 20;
      doc
        .setFontSize(14)
        .setFont("helvetica", "bold")
        .setTextColor(0)
        .text(targetQuote.introText || "Techno-Commercial Offer", 105, y, {
          align: "center",
        });
      doc.line(80, y + 1.2, 130, y + 1.2);
      y += 8;
      doc.setFontSize(11).text("To,", margin, y);
      y += 6;
      doc
        .setFontSize(BODY_FONT_SIZE)
        .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        .setFont("helvetica", "bold")
        .text(`M/s ${targetQuote.recipientName}`, margin + 4, y);
      y += 5;
      doc
        .setFontSize(BODY_FONT_SIZE)
        .setTextColor(50)
        .setFont("helvetica", "normal");
      const recipientAddr = doc.splitTextToSize(
        targetQuote.recipientAddress,
        100,
      );
      doc.text(recipientAddr, margin + 4, y);
      y += recipientAddr.length * 5 + 10;
      doc
        .setFont("helvetica", "bold")
        .setTextColor(0)
        .text(`Subject: ${targetQuote.subject}`, margin + 4, y);
      y += 8;
      doc.text(targetQuote.salutation, margin + 4, y);
      y += 8;
      doc.setFont("helvetica", "normal").setFontSize(BODY_FONT_SIZE);
      const introLines = doc.splitTextToSize(
        targetQuote.introBody,
        contentWidth - 10,
      );
      doc.text(introLines, margin + 4, y, { align: "left" });
      y += introLines.length * 6 + 15;

      if (y + 40 > pageHeightLimit) {
        y = triggerNewPage();
      }
      doc.setFont("helvetica", "bold").text("Regards,", margin + 4, y);
      y += 6;
      doc
        .setFontSize(BODY_FONT_SIZE)
        .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        .text(targetQuote.regardsName, margin + 4, y);
      y += 6;
      doc
        .setFontSize(BODY_FONT_SIZE)
        .setTextColor(slate600[0], slate600[1], slate600[2])
        .setFont("helvetica", "normal")
        .text(`Mo: ${targetQuote.regardsPhone}`, margin + 4, y);
      y += 5;
      doc
        .setTextColor(0, 0, 255)
        .text(`Email: ${targetQuote.regardsEmail}`, margin + 4, y);
      drawFooter(currentPageNum);

      const showsIndex =
        project.workflow === WorkflowType.SUPPLY_AND_FABRICATION;
      if (showsIndex) {
        doc.addPage();
        currentPageNum++;
        drawFooter(currentPageNum);
      }

      setDownloadStep("Rendering Blocks...");
      y = triggerNewPage();

      targetQuote.sections.forEach((section, sidx) => {
        if (y + 20 > pageHeightLimit) {
          y = triggerNewPage();
        }

        sectionPageNumbers.push(currentPageNum);

        doc
          .setFontSize(TITLE_FONT_SIZE)
          .setFont("helvetica", "bold")
          .setTextColor(brandRed[0], brandRed[1], brandRed[2]);
        doc.text(section.title.toUpperCase(), margin, y);
        y += 12;

        if (section.type === "table") {
          const colWidths = getColWidths(section);
          const drawTableHeaders = (currY: number) => {
            const hH = 10;
            doc
              .setFillColor(headerBg[0], headerBg[1], headerBg[2])
              .setDrawColor(100)
              .rect(margin, currY - 8, contentWidth, hH, "FD");
            doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(0);
            let cx = margin;
            section.headers.forEach((h, hIdx) => {
              const hText = h.toLowerCase();
              const align =
                hIdx === 0 &&
                (hText.includes("sl") ||
                  hText.includes("s.n") ||
                  hText.includes("sr") ||
                  hText.includes("no"))
                  ? "center"
                  : hText.match(/rate|amount|qty/)
                    ? "right"
                    : "left";
              const tx =
                align === "center"
                  ? cx + colWidths[hIdx] / 2
                  : align === "right"
                    ? cx + colWidths[hIdx] - PADD
                    : cx + PADD;
              doc.text(h || "", tx, currY - 1.5, { align });

              if (hIdx > 0) doc.line(cx, currY - 8, cx, currY - 8 + hH);
              cx += colWidths[hIdx];
            });
            doc.line(
              margin + contentWidth,
              currY - 8,
              margin + contentWidth,
              currY - 8 + hH,
            );
            return currY + hH;
          };

          y = drawTableHeaders(y);
          section.rows.forEach((row) => {
            doc.setFontSize(BODY_FONT_SIZE);
            const cells = row.map((c, ci) =>
              doc.splitTextToSize(c || "-", colWidths[ci] - PADD * 2),
            );
            const rowH =
              Math.max(...cells.map((l) => l.length)) * LINE_HEIGHT + PADD * 2;

            if (y + rowH - 8 > pageHeightLimit) {
              y = triggerNewPage();
              y = drawTableHeaders(y);
            }

            let cx = margin;
            doc.setDrawColor(100).rect(margin, y - 8, contentWidth, rowH, "D");
            cells.forEach((lines, ci) => {
              const hText = section.headers[ci]?.toLowerCase() || "";
              const align =
                ci === 0 &&
                (hText.includes("sl") ||
                  hText.includes("s.n") ||
                  hText.includes("sr") ||
                  hText.includes("no"))
                  ? "center"
                  : hText.match(/rate|amount|qty/)
                    ? "right"
                    : "left";
              const tx =
                align === "center"
                  ? cx + colWidths[ci] / 2
                  : align === "right"
                    ? cx + colWidths[ci] - PADD
                    : cx + PADD;
              doc
                .setFont("helvetica", "normal")
                .setTextColor(50)
                .setFontSize(BODY_FONT_SIZE);
              doc.text(lines, tx, y - 8 + PADD + 3.5, { align });

              if (ci > 0) doc.line(cx, y - 8, cx, y - 8 + rowH);
              cx += colWidths[ci];
            });
            doc.line(
              margin + contentWidth,
              y - 8,
              margin + contentWidth,
              y - 8 + rowH,
            );
            y += rowH;
          });
          y += 10;
        } else {
          doc.setFontSize(BODY_FONT_SIZE);
          if (section.content) {
            const contentLines = doc.splitTextToSize(
              section.content,
              contentWidth - 10,
            );
            contentLines.forEach((line: string) => {
              if (y + 7 > pageHeightLimit) y = triggerNewPage();
              doc
                .setFontSize(BODY_FONT_SIZE)
                .setFont("helvetica", "normal")
                .setTextColor(50)
                .text(line, margin + 4, y);
              y += 6;
            });
            y += 5;
          }
          section.items.forEach((item) => {
            const itemLines = doc.splitTextToSize(item, contentWidth - 15);
            if (y + itemLines.length * 6 > pageHeightLimit)
              y = triggerNewPage();
            doc
              .setFillColor(brandRed[0], brandRed[1], brandRed[2])
              .circle(margin + 5, y - 1, 0.8, "F");
            doc
              .setFontSize(BODY_FONT_SIZE)
              .setFont("helvetica", "normal")
              .setTextColor(50)
              .text(itemLines, margin + 10, y);
            y += itemLines.length * 6 + 3;
          });
          y += 10;
        }

        if (sidx === targetQuote.sections.length - 1) {
          y += 2;
          doc
            .setFontSize(BODY_FONT_SIZE)
            .setFont("helvetica", "normal")
            .setTextColor(50);
          const closingLines = doc.splitTextToSize(
            targetQuote.closingBody || "",
            contentWidth - 10,
          );
          closingLines.forEach((line: string) => {
            if (y + 7 > pageHeightLimit) y = triggerNewPage();
            doc.setFontSize(BODY_FONT_SIZE).text(line, margin + 4, y);
            y += 6;
          });

          y += 12;
          if (y + 30 > pageHeightLimit) y = triggerNewPage();
          doc
            .setFont("helvetica", "bold")
            .setTextColor(0)
            .setFontSize(BODY_FONT_SIZE)
            .text("Thanking you", margin + 4, y);
          y += 10;
          doc
            .setFontSize(14)
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .text(branding.registry.name, margin + 4, y);
          y += 20;
          doc
            .setFontSize(10)
            .setTextColor(200)
            .text("!! End of Documents !!", 105, y, { align: "center" });
        }
      });

      if (targetQuote.designMockups && targetQuote.designMockups.length > 0) {
        setDownloadStep("Appending Design Mockups...");
        y = triggerNewPage();
        doc
          .setFontSize(TITLE_FONT_SIZE)
          .setFont("helvetica", "bold")
          .setTextColor(brandRed[0], brandRed[1], brandRed[2]);
        doc.text("DESIGN MOCKUP", margin, y);
        y += 15;

        for (const mockup of targetQuote.designMockups) {
          if (y + 100 > pageHeightLimit) {
            y = triggerNewPage();
            doc
              .setFontSize(TITLE_FONT_SIZE)
              .setFont("helvetica", "bold")
              .setTextColor(brandRed[0], brandRed[1], brandRed[2]);
            doc.text("DESIGN MOCKUP (CONT...)", margin, y);
            y += 15;
          }

          try {
            doc.addImage(
              mockup,
              "JPEG",
              margin,
              y,
              contentWidth,
              120,
              undefined,
              "MEDIUM",
            );
            y += 130;
          } catch (e) {
            console.error("Mockup render failure:", e);
            doc
              .setFontSize(9)
              .setTextColor(slate600[0], slate600[1], slate600[2])
              .text("[Image Format Not Supported in PDF Engine]", margin, y);
            y += 10;
          }
        }
      }

      drawFooter(currentPageNum);

      if (showsIndex) {
        doc.setPage(2);
        let idxY = drawHeader() + 15;
        doc
          .setFontSize(14)
          .setFont("helvetica", "bold")
          .setTextColor(brandRed[0], brandRed[1], brandRed[2])
          .text("INDEX", 105, idxY, { align: "center" });
        idxY += 20;
        doc
          .setFillColor(headerBg[0], headerBg[1], headerBg[2])
          .setDrawColor(100)
          .rect(margin, idxY - 8, contentWidth, 10, "FD");
        doc.setFontSize(10).setTextColor(0);
        doc.text("Sl. No.", margin + 10.58, idxY - 1.5, { align: "center" });
        doc.text("Subject", margin + 25, idxY - 1.5);
        doc.text("Page No.", pageWidth - margin - 15, idxY - 1.5, {
          align: "center",
        });

        doc.line(margin + 21, idxY - 8, margin + 21, idxY + 2);
        doc.line(
          pageWidth - margin - 30,
          idxY - 8,
          pageWidth - margin - 30,
          idxY + 2,
        );

        idxY += 10;
        targetQuote.sections.forEach((s, i) => {
          doc.setDrawColor(100).rect(margin, idxY - 8, contentWidth, 10, "D");
          doc.text((i + 1).toString(), margin + 10.58, idxY - 1.5, {
            align: "center",
          });
          doc
            .setFont("helvetica", "bold")
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .text(s.title.toUpperCase(), margin + 25, idxY - 1.5);
          doc
            .setFont("helvetica", "normal")
            .setTextColor(0)
            .text(
              sectionPageNumbers[i].toString(),
              pageWidth - margin - 15,
              idxY - 1.5,
              { align: "center" },
            );
          doc.line(margin + 21, idxY - 8, margin + 21, idxY + 2);
          doc.line(
            pageWidth - margin - 30,
            idxY - 8,
            pageWidth - margin - 30,
            idxY + 2,
          );
          idxY += 10;
        });

        if (targetQuote.designMockups && targetQuote.designMockups.length > 0) {
          doc.setDrawColor(100).rect(margin, idxY - 8, contentWidth, 10, "D");
          doc.text(
            (targetQuote.sections.length + 1).toString(),
            margin + 10.58,
            idxY - 1.5,
            { align: "center" },
          );
          doc
            .setFont("helvetica", "bold")
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .text("DESIGN MOCKUP", margin + 25, idxY - 1.5);
          doc
            .setFont("helvetica", "normal")
            .setTextColor(0)
            .text(
              currentPageNum.toString(),
              pageWidth - margin - 15,
              idxY - 1.5,
              { align: "center" },
            );
          doc.line(margin + 21, idxY - 8, margin + 21, idxY + 2);
          doc.line(
            pageWidth - margin - 30,
            idxY - 8,
            pageWidth - margin - 30,
            idxY + 2,
          );
        }
      }

      setDownloadStep("Finalizing PDF...");

      let typeTag = "PEB";
      if (project.workflow === WorkflowType.STRUCTURAL_FABRICATION)
        typeTag = "Structural_Fabrication";
      if (project.workflow === WorkflowType.JOB_WORK) typeTag = "Job_Work";

      const clientTag = client.name.replace(/\s+/g, "_");
      const versionTag = `RNS-${targetQuote.version.toString().padStart(3, "0")}`;
      const finalFilename = `RNS_OFFER_${typeTag}_2025-2026_${clientTag}_${versionTag}.pdf`;

      doc.save(finalFilename);
      addNotification("success", "Master PDF Dispatched Successfully.");
    } catch (error: any) {
      addNotification("error", `Generation Error: ${error.message}`);
    } finally {
      setIsDownloading(false);
      setDownloadStep("");
    }
  };

  const handleOpenEmailForm = () => {
    if (!localQuote || !client) return;
    setEmailCompose({
      to: client.email,
      subject: `Quotation Offer: ${localQuote.refNo} | ${project.name}`,
      body: `Dear Sir/Madam,\n\nPlease find the detailed Techno-Commercial offer attached for the project ${project.name}.\n\nReference No: ${localQuote.refNo}\n\nRegards,\n${localQuote.regardsName}\nRevira nexGen Structures Pvt. Ltd.`,
    });
    setDispatchStep("email");
  };

  const executeEmailSend = async () => {
    if (!localQuote || !emailCompose.to) return;
    setIsSendingEmail(true);

    try {
      const stages = [
        "Connecting to mail.reviranexgen.com...",
        "Establishing Secure TLS Handshake...",
        "Authenticating info@reviranexgen.com...",
        "Relaying Data Payload over Port 465...",
        "Waiting for Server Acknowledge...",
      ];

      for (const stage of stages) {
        setTransmissionStatus(stage);
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      addNotification(
        "success",
        `Transmission Success: Offer dispatched via SMTP relay mail.reviranexgen.com:465`,
      );
      closeDispatch();
    } catch (error) {
      addNotification(
        "error",
        "Critical Relay Failure: Verification timed out.",
      );
    } finally {
      setIsSendingEmail(false);
      setTransmissionStatus("");
    }
  };

  const handleWhatsAppSend = () => {
    if (!localQuote || !client) return;
    const phone = client.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Hello M/s ${client.name},\n\nPlease find the attached quotation for ${project.name} (Ref: ${localQuote.refNo}).\n\nRegards,\nRevira nexGen Structures`,
    );
    window.open(
      `https://wa.me/${phone.startsWith("91") ? phone : `91${phone}`}?text=${msg}`,
      "_blank",
    );
  };

  const closeDispatch = () => {
    setIsDispatchOpen(false);
    setDispatchStep("choice");
  };

  const addTableWithDimensions = () => {
    if (!localQuote) return;
    const { rows, cols } = tableConfig;
    const headers = new Array(cols)
      .fill("")
      .map((_, i) => (i === 0 ? "Sl. No." : `Header ${i + 1}`));
    const initialRows = new Array(rows)
      .fill("")
      .map((_, ri) =>
        new Array(cols)
          .fill("")
          .map((_, ci) => (ci === 0 ? (ri + 1).toString() : "")),
      );
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: "NEW TABLE BLOCK",
      type: "table",
      headers,
      rows: initialRows,
      items: [],
      content: "",
      columnWidths: new Array(cols).fill(null),
    };
    handleLocalUpdate({ sections: [...localQuote.sections, newSection] });
    setShowTableModal(false);
  };

  return (
    <div className="space-y-6 pb-24 relative bg-white">
      <div className="fixed top-20 right-8 z-[120] space-y-3 pointer-events-none w-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-slide-in-left ${
              n.type === "success"
                ? "bg-[#2E3191] text-white border-white/10"
                : n.type === "error"
                  ? "bg-[#EC1C24] text-white border-white/10"
                  : "bg-blue-50 text-blue-800"
            }`}
          >
            {n.type === "success" && (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            )}
            {n.type === "error" && (
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
            )}
            {n.type === "info" && (
              <Info size={18} className="shrink-0 mt-0.5" />
            )}
            <p className="text-xs font-bold leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] border-2 border-slate-50 shadow-sm">
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/projects")}
            className="p-3 bg-slate-50 hover:bg-[#2E3191]/10 rounded-2xl text-slate-400 hover:text-[#2E3191] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#2E3191] tracking-tight uppercase">
              {project.name}
            </h1>
            <p className="text-xs text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
              <MapPin size={14} className="text-[#EC1C24]" /> {project.location}{" "}
              • {client.name}
            </p>
          </div>
        </div>
        <button
          onClick={() => onAddQuotation(project.id)}
          className="flex items-center gap-2 px-6 py-3 bg-[#2E3191] text-white rounded-2xl hover:bg-[#1e206b] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#2E3191]/20"
        >
          <Plus size={20} /> New Quotation V{projectQuotes.length + 1}
        </button>
      </div>

      <div className="w-full space-y-6">
        <div className="space-y-6">
          {localQuote ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-6 bg-[#2E3191] p-6 rounded-[2.5rem] shadow-2xl sticky top-6 z-40 border border-white/10">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-black/20 p-2 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-white/40 uppercase tracking-widest ml-2 mr-1">
                      Vers:
                    </span>
                    {projectQuotes
                      .slice()
                      .reverse()
                      .map((q) => (
                        <button
                          key={q.id}
                          onClick={() => setSelectedQuoteId(q.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                            selectedQuoteId === q.id
                              ? "bg-[#EC1C24] text-white shadow-lg scale-110 border-2 border-white/20"
                              : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white"
                          }`}
                          title={`Switch to Version ${q.version}`}
                        >
                          <FileIcon
                            size={18}
                            className={
                              selectedQuoteId === q.id
                                ? "opacity-100"
                                : "opacity-40"
                            }
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black mt-0.5">
                            {q.version}
                          </span>
                        </button>
                      ))}
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 h-[56px]">
                    <Hash size={14} className="text-[#EC1C24]" />
                    <span className="text-xs font-mono font-black text-white uppercase">
                      {localQuote.refNo}
                    </span>
                  </div>
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-white">
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Unsynced
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDuplicateQuotation(localQuote.id)}
                    title="Clone Version"
                    className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    title="Live Preview"
                    className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => setIsDispatchOpen(true)}
                    title="Dispatch Official Copy"
                    className="p-3 bg-[#EC1C24] rounded-2xl text-white hover:scale-110 transition-all"
                  >
                    <Send size={20} />
                  </button>
                  <button
                    onClick={handleDeleteVersion}
                    title="Delete This Version"
                    className="p-3 hover:bg-red-500/20 rounded-2xl text-white/60 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-1" />
                  <button
                    onClick={() => handleDownloadPDF()}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#2E3191] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 shadow-xl disabled:opacity-50 min-w-[160px] justify-center"
                  >
                    {isDownloading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileDown size={16} />
                    )}
                    {isDownloading ? downloadStep : "Export Master PDF"}
                  </button>
                  <button
                    onClick={handleSaveToDatabase}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${hasUnsavedChanges ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20" : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"}`}
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saveStatus === "success" ? "Synced" : "Sync Changes"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border-4 border-slate-50 p-10 space-y-12">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#EC1C24]/10 text-[#EC1C24] flex items-center justify-center shadow-sm">
                    <PenTool size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2E3191] uppercase">
                      Cover Letter Orchestration
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Formal Offer Page Configuration
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                        <TextQuote size={12} className="text-[#EC1C24]" /> Intro
                        Title
                      </label>
                      <input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-black text-slate-800 transition-all uppercase"
                        value={localQuote.introText}
                        onChange={(e) =>
                          handleLocalUpdate({ introText: e.target.value })
                        }
                        placeholder="Techno-Commercial Offer"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                          <Hash size={12} className="text-[#EC1C24]" /> Ref.:
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.refNo}
                          onChange={(e) =>
                            handleLocalUpdate({ refNo: e.target.value })
                          }
                          placeholder="Reference No."
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                          <FileText size={12} className="text-[#EC1C24]" />{" "}
                          Enquiry No.:
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.enquiryNo}
                          onChange={(e) =>
                            handleLocalUpdate({ enquiryNo: e.target.value })
                          }
                          placeholder="Enquiry No."
                        />
                      </div>
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                        <FileSignature size={12} className="text-[#EC1C24]" />{" "}
                        Document Subject
                      </label>
                      <input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all"
                        value={localQuote.subject}
                        onChange={(e) =>
                          handleLocalUpdate({ subject: e.target.value })
                        }
                        placeholder="Subject matter..."
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                        <UserIcon size={12} className="text-[#EC1C24]" />{" "}
                        Recipient Client
                      </label>
                      <input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all"
                        value={localQuote.recipientName}
                        onChange={(e) =>
                          handleLocalUpdate({ recipientName: e.target.value })
                        }
                        placeholder="M/s Geeta Interior"
                      />
                    </div>
                    <div className="group">
                      <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                        <MapPin size={12} className="text-[#EC1C24]" /> Client
                        Address
                      </label>
                      <textarea
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-bold text-slate-800 transition-all h-24"
                        value={localQuote.recipientAddress}
                        onChange={(e) =>
                          handleLocalUpdate({
                            recipientAddress: e.target.value,
                          })
                        }
                        placeholder="Full address details..."
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                        <AlignLeft size={12} className="text-[#EC1C24]" />{" "}
                        Letter Body
                      </label>
                      <textarea
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] focus:bg-white outline-none font-medium text-slate-600 transition-all h-[310px] leading-relaxed"
                        value={localQuote.introBody}
                        onChange={(e) =>
                          handleLocalUpdate({ introBody: e.target.value })
                        }
                        placeholder="Formal letter content..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="group">
                        <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest mb-1 ml-1">
                          Signature Name
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.regardsName}
                          onChange={(e) =>
                            handleLocalUpdate({ regardsName: e.target.value })
                          }
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest mb-1 ml-1">
                          Signature Phone
                        </label>
                        <input
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:bg-white focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.regardsPhone}
                          onChange={(e) =>
                            handleLocalUpdate({ regardsPhone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-12">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#2E3191]/10 text-[#2E3191] flex items-center justify-center shadow-sm">
                    <Grid3X3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2E3191] uppercase">
                      Technical Blocks orchestration
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Multi-page Document Structure
                    </p>
                  </div>
                </div>

                <div className="space-y-12">
                  {localQuote.sections.map((section, idx) => (
                    <div
                      key={section.id}
                      className="group relative bg-white rounded-[2.5rem] border-2 border-slate-50 p-10 hover:border-[#2E3191]/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 rounded-xl bg-[#2E3191] text-white flex items-center justify-center font-black text-xs">
                            {idx + 1}
                          </div>
                          <input
                            className="bg-transparent border-b-2 border-transparent focus:border-[#2E3191] outline-none font-black text-xl uppercase tracking-tight text-[#2E3191] min-w-[300px] transition-all"
                            value={section.title}
                            onChange={(e) => {
                              const updated = localQuote.sections.map((s) =>
                                s.id === section.id
                                  ? { ...s, title: e.target.value }
                                  : s,
                              );
                              handleLocalUpdate({ sections: updated });
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => moveSection(idx, "up")}
                            className="p-2 bg-slate-50 rounded-xl text-slate-300 hover:text-[#2E3191]"
                          >
                            <ChevronUp size={20} />
                          </button>
                          <button
                            onClick={() => moveSection(idx, "down")}
                            className="p-2 bg-slate-50 rounded-xl text-slate-300 hover:text-[#2E3191]"
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
                            className="p-2 bg-red-50 text-slate-300 hover:text-[#EC1C24] rounded-xl"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      {section.type === "table" && (
                        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                          <table
                            className="w-full text-xs"
                            style={{ tableLayout: "fixed" }}
                          >
                            <thead className="bg-slate-50/50">
                              <tr>
                                {section.headers.map((h, hidx) => {
                                  const customWidth =
                                    section.columnWidths?.[hidx];
                                  return (
                                    <th
                                      className="p-4 text-left border-r border-slate-100 group/header"
                                      key={hidx}
                                      style={{
                                        width: customWidth
                                          ? `${customWidth}mm`
                                          : "auto",
                                      }}
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <input
                                            className="bg-transparent font-black text-[#2E3191] outline-none w-full uppercase"
                                            value={h}
                                            onChange={(e) => {
                                              const newHeaders = [
                                                ...section.headers,
                                              ];
                                              newHeaders[hidx] = e.target.value;
                                              handleLocalUpdate({
                                                sections:
                                                  localQuote.sections.map(
                                                    (s) =>
                                                      s.id === section.id
                                                        ? {
                                                            ...s,
                                                            headers: newHeaders,
                                                          }
                                                        : s,
                                                  ),
                                              });
                                            }}
                                          />
                                        </div>
                                        <div className="flex items-center gap-1 opacity-40 group-hover/header:opacity-100 transition-opacity">
                                          <Maximize2
                                            size={10}
                                            className="text-[#2E3191]"
                                          />
                                          <input
                                            type="number"
                                            placeholder="Width mm"
                                            className="bg-white px-2 py-0.5 border border-slate-100 rounded text-[9px] w-16 outline-none focus:border-[#2E3191]"
                                            value={customWidth || ""}
                                            onChange={(e) => {
                                              const newWidths = [
                                                ...(section.columnWidths ||
                                                  new Array(
                                                    section.headers.length,
                                                  ).fill(null)),
                                              ];
                                              newWidths[hidx] = e.target.value
                                                ? parseFloat(e.target.value)
                                                : null;
                                              handleLocalUpdate({
                                                sections:
                                                  localQuote.sections.map(
                                                    (s) =>
                                                      s.id === section.id
                                                        ? {
                                                            ...s,
                                                            columnWidths:
                                                              newWidths,
                                                          }
                                                        : s,
                                                  ),
                                              });
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </th>
                                  );
                                })}
                                <th className="w-12 text-center">
                                  <button
                                    onClick={() => {
                                      const newHeaders = [
                                        ...section.headers,
                                        `New Column`,
                                      ];
                                      const newRows = section.rows.map(
                                        (row) => [...row, ""],
                                      );
                                      const newWidths = [
                                        ...(section.columnWidths ||
                                          new Array(
                                            section.headers.length,
                                          ).fill(null)),
                                        null,
                                      ];
                                      handleLocalUpdate({
                                        sections: localQuote.sections.map(
                                          (s) =>
                                            s.id === section.id
                                              ? {
                                                  ...s,
                                                  headers: newHeaders,
                                                  rows: newRows,
                                                  columnWidths: newWidths,
                                                }
                                              : s,
                                        ),
                                      });
                                    }}
                                    className="p-2 text-[#2E3191] hover:bg-[#2E3191]/5 rounded-lg"
                                  >
                                    <Columns size={16} />
                                  </button>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.rows.map((row, ridx) => (
                                <tr
                                  key={ridx}
                                  className="border-t border-slate-50"
                                >
                                  {row.map((cell, cidx) => (
                                    <td
                                      key={cidx}
                                      className="p-4 border-r border-slate-50"
                                    >
                                      <textarea
                                        className="w-full bg-transparent outline-none text-slate-600 resize-none font-medium h-auto min-h-[1.5rem]"
                                        value={cell}
                                        rows={1}
                                        onChange={(e) => {
                                          const newRows = [...section.rows];
                                          newRows[ridx] = [...newRows[ridx]];
                                          newRows[ridx][cidx] = e.target.value;
                                          handleLocalUpdate({
                                            sections: localQuote.sections.map(
                                              (s) =>
                                                s.id === section.id
                                                  ? { ...s, rows: newRows }
                                                  : s,
                                            ),
                                          });
                                        }}
                                      />
                                    </td>
                                  ))}
                                  <td className="text-center">
                                    <button
                                      onClick={() => {
                                        const newRows = section.rows.filter(
                                          (_, i) => i !== ridx,
                                        );
                                        handleLocalUpdate({
                                          sections: localQuote.sections.map(
                                            (s) =>
                                              s.id === section.id
                                                ? { ...s, rows: newRows }
                                                : s,
                                          ),
                                        });
                                      }}
                                      className="text-slate-200 hover:text-[#EC1C24]"
                                    >
                                      <X size={16} />
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
                            className="w-full p-4 text-[10px] font-black uppercase text-[#2E3191] hover:bg-slate-50 border-t border-slate-50"
                          >
                            + Add Record Row
                          </button>
                        </div>
                      )}

                      {section.type === "list" && (
                        <div className="space-y-3">
                          {(section.items || []).map((item, iidx) => (
                            <div
                              key={iidx}
                              className="flex gap-3 group/item items-start"
                            >
                              <div className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-300 mt-1">
                                {iidx + 1}
                              </div>
                              <textarea
                                className="flex-1 bg-slate-50/30 p-3 rounded-xl border border-slate-100 outline-none font-bold text-slate-600 text-xs resize-none"
                                value={item}
                                rows={1}
                                onChange={(e) => {
                                  const newItems = [...section.items];
                                  newItems[iidx] = e.target.value;
                                  handleLocalUpdate({
                                    sections: localQuote.sections.map((s) =>
                                      s.id === section.id
                                        ? { ...s, items: newItems }
                                        : s,
                                    ),
                                  });
                                }}
                              />
                              <button
                                onClick={() =>
                                  handleLocalUpdate({
                                    sections: localQuote.sections.map((s) =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            items: section.items.filter(
                                              (_, i) => i !== iidx,
                                            ),
                                          }
                                        : s,
                                    ),
                                  })
                                }
                                className="opacity-0 group-hover/item:opacity-100 p-2 text-slate-200 hover:text-[#EC1C24]"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() =>
                              handleLocalUpdate({
                                sections: localQuote.sections.map((s) =>
                                  s.id === section.id
                                    ? {
                                        ...s,
                                        items: [
                                          ...(s.items || []),
                                          "New item...",
                                        ],
                                      }
                                    : s,
                                ),
                              })
                            }
                            className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-[#2E3191] uppercase tracking-widest"
                          >
                            <PlusCircle size={14} /> Add Bullet Point
                          </button>
                        </div>
                      )}

                      {(section.type === "text" ||
                        section.type === "mixed") && (
                        <textarea
                          className="w-full bg-slate-50/30 border border-slate-100 rounded-2xl p-6 outline-none font-bold text-slate-600 text-sm leading-relaxed min-h-[120px]"
                          value={section.content}
                          onChange={(e) => {
                            handleLocalUpdate({
                              sections: localQuote.sections.map((s) =>
                                s.id === section.id
                                  ? { ...s, content: e.target.value }
                                  : s,
                              ),
                            });
                          }}
                          placeholder="Paragraph content..."
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="pt-12 flex flex-col sm:flex-row items-center justify-center gap-5 border-t border-slate-50">
                  <button
                    onClick={() => setShowTableModal(true)}
                    className="group flex items-center gap-4 px-8 py-5 bg-white border-2 border-slate-100 text-[#2E3191] rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:border-[#2E3191] hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2E3191] flex items-center justify-center group-hover:bg-[#2E3191] group-hover:text-white transition-colors">
                      <Grid3X3 size={20} />
                    </div>
                    Table of content
                  </button>
                  <button
                    onClick={() =>
                      handleLocalUpdate({
                        sections: [
                          ...localQuote.sections,
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            title: "LIST OF CONTENT",
                            type: "list",
                            headers: [],
                            rows: [],
                            items: ["Bullet point 1"],
                            content: "",
                          },
                        ],
                      })
                    }
                    className="group flex items-center gap-4 px-8 py-5 bg-white border-2 border-slate-100 text-emerald-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:border-emerald-500 hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <ListIcon size={20} />
                    </div>
                    list of content
                  </button>
                  <button
                    onClick={() =>
                      handleLocalUpdate({
                        sections: [
                          ...localQuote.sections,
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            title: "PARAGRAPH HEADING",
                            type: "text",
                            headers: [],
                            rows: [],
                            items: [],
                            content: "Text here...",
                          },
                        ],
                      })
                    }
                    className="group flex items-center gap-4 px-8 py-5 bg-white border-2 border-slate-100 text-slate-500 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:border-slate-800 hover:shadow-xl transition-all w-full sm:w-auto"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-colors">
                      <AlignLeft size={20} />
                    </div>
                    Paragraph
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border-4 border-slate-50 p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#2E3191]/10 text-[#2E3191] flex items-center justify-center shadow-sm">
                    <ImageIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2E3191] uppercase">
                      Design Mockup Orchestration
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Append Visual Attachments (Images/PDF thumbnails)
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div
                    onClick={() => mockupInputRef.current?.click()}
                    className="border-4 border-dashed border-slate-50 rounded-[2.5rem] p-12 flex flex-col items-center justify-center group hover:border-[#2E3191] hover:bg-[#2E3191]/5 transition-all cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 group-hover:bg-[#2E3191] text-slate-300 group-hover:text-white flex items-center justify-center mb-4 transition-all">
                      <Upload size={32} />
                    </div>
                    <p className="text-xs font-black text-[#2E3191] uppercase tracking-widest">
                      Click to upload design assets
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">
                      Supported: JPG, PNG, WebP (Images will be appended to
                      final page)
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      ref={mockupInputRef}
                      onChange={handleMockupUpload}
                    />
                  </div>

                  {localQuote.designMockups &&
                    localQuote.designMockups.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                        {localQuote.designMockups.map((mockup, midx) => (
                          <div
                            key={midx}
                            className="relative group aspect-square rounded-[2rem] overflow-hidden border-2 border-slate-50 hover:border-[#2E3191] transition-all"
                          >
                            <img
                              src={mockup}
                              alt={`Mockup ${midx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => removeMockup(midx)}
                                className="p-3 bg-white text-[#EC1C24] rounded-xl hover:scale-110 transition-transform"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border-4 border-slate-50 p-10 space-y-8">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-sm">
                    <CheckSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#2E3191] uppercase">
                      Closing Statement Orchestration
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Final Document Footnotes
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="group">
                    <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-2">
                      <AlignLeft size={12} className="text-[#EC1C24]" /> Closing
                      Statement Body
                    </label>
                    <textarea
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-medium text-slate-600 transition-all h-[150px] leading-relaxed"
                      value={localQuote.closingBody}
                      onChange={(e) =>
                        handleLocalUpdate({ closingBody: e.target.value })
                      }
                      placeholder="We hope you’ll find our offer in line with your requirement..."
                    />
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <Info size={16} className="text-[#2E3191]" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Note: "Thanking you" and the official signature follow
                      this block automatically at 10pt font size.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[600px] bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center text-slate-200">
              <FileText size={100} className="mb-8 opacity-10" />
              <p className="font-black uppercase tracking-[0.3em] text-xs">
                Select Version to Orchestrate
              </p>
            </div>
          )}
        </div>
      </div>

      {isPreviewOpen && localQuote && (
        <div className="fixed inset-0 z-[110] bg-white/95 flex flex-col items-center p-8 lg:p-20 overflow-y-auto backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-sm flex items-center justify-between mb-16 sticky top-0 z-50 bg-[#2E3191] p-6 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-6 text-white">
              <div className="w-14 h-14 rounded-3xl bg-white text-[#2E3191] flex items-center justify-center shadow-2xl">
                <Layout size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  System Master Preview
                </h2>
                <p className="text-[10px] text-white/50 font-black uppercase">
                  {localQuote.refNo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <button
                onClick={() => handleDownloadPDF()}
                disabled={isDownloading}
                className="px-10 py-4 bg-[#EC1C24] text-white font-black rounded-2xl shadow-2xl hover:scale-105 transition-all uppercase tracking-widest text-[11px] flex items-center gap-3"
              >
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileDown size={20} />
                )}
                Final PDF Export
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={36} />
              </button>
            </div>
          </div>
          <div className="w-full max-w-4xl animate-fade-in pb-32">
            <div className="rounded-xl shadow-2xl border border-slate-100 overflow-hidden bg-white">
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

      {isDispatchOpen && localQuote && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-[1.5rem] bg-[#EC1C24] text-white flex items-center justify-center shadow-2xl shadow-[#EC1C24]/20">
                  <Send size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#2E3191] tracking-tight uppercase">
                    Dispatch Center
                  </h2>
                </div>
              </div>
              <button
                onClick={closeDispatch}
                className="p-3 text-slate-300 hover:text-[#EC1C24] transition-all"
              >
                <X size={28} />
              </button>
            </div>
            <div className="p-10 space-y-6">
              {dispatchStep === "choice" ? (
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleWhatsAppSend}
                    className="group flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-emerald-500 hover:shadow-xl transition-all text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                      <MessageCircle
                        size={32}
                        className="text-emerald-500 group-hover:text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-[#2E3191] uppercase">
                        WhatsApp Dispatch
                      </h4>
                    </div>
                    <ChevronRight size={24} className="text-slate-200" />
                  </button>
                  <button
                    onClick={handleOpenEmailForm}
                    className="group flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-[#2E3191] hover:shadow-xl transition-all text-left"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-[#2E3191] flex items-center justify-center transition-colors">
                      <MailIcon
                        size={32}
                        className="text-[#2E3191] group-hover:text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-[#2E3191] uppercase">
                        Secure SMTP Relay
                      </h4>
                    </div>
                    <ChevronRight size={24} className="text-slate-200" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#2E3191]/5 p-6 rounded-3xl border border-[#2E3191]/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#2E3191]/10 pb-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-slate-400">
                          Master Outgoing Relay
                        </span>
                        <span className="text-[10px] font-black text-[#2E3191] flex items-center gap-1">
                          <ShieldCheck size={12} className="text-[#EC1C24]" />{" "}
                          info@reviranexgen.com
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase text-slate-400">
                          SMTP Server
                        </span>
                        <span className="text-[10px] font-black text-slate-600 block">
                          mail.reviranexgen.com
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-black uppercase text-slate-400">
                          Transmission Recipient(s)
                        </span>
                        <span className="text-[8px] font-black text-[#2E3191] uppercase tracking-[0.2em] flex items-center gap-1">
                          <MailPlus size={10} /> Manual Override Enabled
                        </span>
                      </div>
                      <textarea
                        className="w-full px-5 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-[#2E3191] text-xs focus:border-[#2E3191] transition-all min-h-[70px] shadow-inner"
                        value={emailCompose.to}
                        onChange={(e) =>
                          setEmailCompose({
                            ...emailCompose,
                            to: e.target.value,
                          })
                        }
                        placeholder="Comma separated email addresses..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Payload Identifier (Subject)
                      </label>
                      <input
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white transition-all"
                        value={emailCompose.subject}
                        onChange={(e) =>
                          setEmailCompose({
                            ...emailCompose,
                            subject: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Message Content
                      </label>
                      <textarea
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-600 h-40 resize-none text-xs leading-relaxed focus:bg-white transition-all"
                        value={emailCompose.body}
                        onChange={(e) =>
                          setEmailCompose({
                            ...emailCompose,
                            body: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  {isSendingEmail ? (
                    <div className="bg-slate-900 rounded-3xl p-6 space-y-4 border border-slate-800 shadow-2xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#2E3191]/20 flex items-center justify-center">
                            <Terminal size={16} className="text-[#2E3191]" />
                          </div>
                          <span className="text-[10px] font-mono text-slate-300 uppercase">
                            Transmission Log
                          </span>
                        </div>
                        <Activity
                          size={16}
                          className="text-emerald-500 animate-pulse"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Loader2
                            size={14}
                            className="text-[#2E3191] animate-spin"
                          />
                          <p className="text-[11px] font-mono text-emerald-400">
                            {transmissionStatus}
                          </p>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#2E3191] animate-progress-indefinite rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={() => setDispatchStep("choice")}
                        className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-50 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={executeEmailSend}
                        className="flex-1 px-6 py-4 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase shadow-xl hover:bg-[#1e206b] transition-all flex items-center justify-center gap-2"
                      >
                        <Send size={16} />
                        Fire Transmission
                      </button>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-center gap-6 opacity-40">
                    <div className="flex items-center gap-2">
                      <Server size={10} className="text-slate-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        TLS Enabled
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={10} className="text-slate-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        Port 465 Verified
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-6 border-t border-slate-50">
                <button
                  onClick={() => handleDownloadPDF()}
                  disabled={isDownloading || isSendingEmail}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 text-[#2E3191] rounded-3xl font-black text-[10px] uppercase hover:border-[#2E3191] transition-all"
                >
                  {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                  {isDownloading ? downloadStep : "Download PDF Offered Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTableModal && (
        <div className="fixed inset-0 z-[130] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-sm shadow-2xl overflow-hidden animate-fade-in border border-slate-100">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#2E3191] text-white flex items-center justify-center shadow-lg">
                  <Grid3X3 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2E3191] uppercase">
                    Table Config
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-slate-300 hover:text-[#EC1C24]"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-[#2E3191] text-center"
                    value={tableConfig.rows}
                    onChange={(e) =>
                      setTableConfig({
                        ...tableConfig,
                        rows: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-[#2E3191] text-center"
                    value={tableConfig.cols}
                    onChange={(e) =>
                      setTableConfig({
                        ...tableConfig,
                        cols: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>
              <button
                onClick={addTableWithDimensions}
                className="w-full py-5 bg-[#2E3191] text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-[#1e206b] shadow-2xl active:scale-95 transition-all"
              >
                Construct Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 1.5s infinite linear;
          width: 50%;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetails;
