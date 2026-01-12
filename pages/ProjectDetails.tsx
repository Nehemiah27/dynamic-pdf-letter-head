import React, { useState, useEffect } from "react";
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

  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [localQuote, setLocalQuote] = useState<Quotation | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchStep, setDispatchStep] = useState<"choice" | "email">(
    "choice"
  );
  const [emailCompose, setEmailCompose] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStep, setDownloadStep] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle"
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
    }
  }, [selectedQuoteId, quotations, client]);

  const addNotification = (
    type: "success" | "error" | "info",
    message: string
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

  const handleSaveToDatabase = async () => {
    if (!localQuote) return false;
    setIsSaving(true);
    setSaveStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
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
    if (!targetQuote) return;
    setIsDownloading(true);
    setDownloadStep("Orchestrating Engine...");

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
      const contentWidth = pageWidth - margin * 2;
      const pageHeightLimit = 265;
      const startYAfterHeader = 45;

      const PADD = 1.32;
      const LINE_HEIGHT = 5.5;
      const BODY_FONT_SIZE = 10;
      const TITLE_FONT_SIZE = 12;

      const brandBlue = [46, 49, 145];
      const brandRed = [236, 28, 36];
      const slate600 = [71, 85, 105];
      const headerBg = [253, 242, 242];

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
            "FAST"
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
            "FAST"
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

      const drawFooter = (pageNum: number) => {
        const footerY = 270;
        const pageLabel = `PAGE NO. ${pageNum < 10 ? `0${pageNum}` : pageNum}`;
        if (branding.footerImage) {
          doc.addImage(
            branding.footerImage,
            "PNG",
            0,
            footerY - 5,
            210,
            25,
            undefined,
            "FAST"
          );
        } else {
          doc.setDrawColor(220);
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
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.setFont("helvetica", "bold");
        doc.text(pageLabel, 105, 292, { align: "center" });
      };

      const getColWidths = (section: Section) => {
        const headers = section.headers;
        const customWidths = section.columnWidths || [];

        const widths = headers.map((h, i) => {
          if (customWidths[i]) return customWidths[i] as number;
          const hText = h.toLowerCase();
          if (
            i === 0 &&
            (hText.includes("sl") ||
              hText.includes("s.n") ||
              hText.includes("sr") ||
              hText.includes("no"))
          )
            return 21.17;
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

      setDownloadStep("Calculating Layout...");
      let simY = startYAfterHeader;
      const showsIndex =
        project.workflow === WorkflowType.SUPPLY_AND_FABRICATION;
      let simPage = showsIndex ? 3 : 2;
      const sectionPageMap = new Map<string, number>();

      targetQuote.sections.forEach((section) => {
        sectionPageMap.set(section.id, simPage);
        simY += 15;

        if (section.type === "table") {
          const colWidthsSim = getColWidths(section);
          simY += 10;
          section.rows.forEach((row) => {
            doc.setFontSize(9);
            const rowH =
              Math.max(
                ...row.map(
                  (c, ci) =>
                    doc.splitTextToSize(c || "-", colWidthsSim[ci] - PADD * 2)
                      .length
                )
              ) *
                LINE_HEIGHT +
              PADD * 2;
            if (simY + rowH > pageHeightLimit) {
              simPage++;
              simY = startYAfterHeader + 15 + 10;
            }
            simY += rowH;
          });
        } else {
          doc.setFontSize(BODY_FONT_SIZE);
          if (section.content) {
            const lines = doc.splitTextToSize(
              section.content,
              contentWidth - 10
            );
            const contentH = lines.length * 6 + 5;
            if (simY + contentH > pageHeightLimit) {
              simPage++;
              simY = startYAfterHeader + 15;
            }
            simY += contentH;
          }
          section.items.forEach((item) => {
            const lines = doc.splitTextToSize(item, contentWidth - 15);
            const itemH = lines.length * 6 + 3;
            if (simY + itemH > pageHeightLimit) {
              simPage++;
              simY = startYAfterHeader + 15;
            }
            simY += itemH;
          });
        }
        simY += 10;
        if (simY > pageHeightLimit) {
          simPage++;
          simY = startYAfterHeader;
        }
      });

      setDownloadStep("Generating PDF Artifact...");
      let currentPageNum = 1;
      let y = drawHeader() + 10;

      // Cover Letter Page
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

      y += 10;
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
        .setFontSize(TITLE_FONT_SIZE)
        .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        .text(`M/s ${targetQuote.recipientName}`, margin + 4, y);
      y += 5;
      doc.setFontSize(BODY_FONT_SIZE).setTextColor(50);
      const recipientAddr = doc.splitTextToSize(
        targetQuote.recipientAddress,
        100
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
      doc.setFont("helvetica", "normal");
      const introLines = doc.splitTextToSize(
        targetQuote.introBody,
        contentWidth - 10
      );
      doc.text(introLines, margin + 4, y, { align: "left" });
      y += introLines.length * 6 + 15;

      if (y + 35 > pageHeightLimit) {
        drawFooter(currentPageNum);
        doc.addPage();
        currentPageNum++;
        drawHeader();
        y = startYAfterHeader;
      }
      doc.setFont("helvetica", "bold").text("Regards,", margin + 4, y);
      y += 6;
      doc
        .setFontSize(12)
        .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
        .text(targetQuote.regardsName, margin + 4, y);
      y += 6;
      doc
        .setFontSize(10)
        .setTextColor(slate600[0], slate600[1], slate600[2])
        .text(`Mo: ${targetQuote.regardsPhone}`, margin + 4, y);
      y += 5;
      doc
        .setTextColor(0, 0, 255)
        .text(`Email: ${targetQuote.regardsEmail}`, margin + 4, y);
      drawFooter(currentPageNum);

      if (showsIndex) {
        doc.addPage();
        currentPageNum = 2;
        y = drawHeader() + 15;
        doc
          .setFontSize(14)
          .setFont("helvetica", "bold")
          .setTextColor(brandRed[0], brandRed[1], brandRed[2])
          .text("INDEX", 105, y, { align: "center" });
        y += 20;
        doc
          .setFillColor(headerBg[0], headerBg[1], headerBg[2])
          .setDrawColor(150)
          .rect(margin, y - 8, contentWidth, 10, "FD");
        doc.setFontSize(10).setTextColor(0);
        doc.text("Sl. No.", margin + 10.58, y - 1.5, { align: "center" });
        doc.text("Subject", margin + 25, y - 1.5);
        doc.text("Page No.", pageWidth - margin - 15, y - 1.5, {
          align: "center",
        });
        doc.line(margin + 21.17, y - 8, margin + 21.17, y + 2);
        doc.line(
          pageWidth - margin - 35,
          y - 8,
          pageWidth - margin - 35,
          y + 2
        );
        y += 10;
        targetQuote.sections.forEach((s, i) => {
          doc
            .setFont("helvetica", "normal")
            .rect(margin, y - 8, contentWidth, 10, "D");
          doc.text((i + 1).toString(), margin + 10.58, y - 1.5, {
            align: "center",
          });
          doc
            .setFont("helvetica", "bold")
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .text(s.title.toUpperCase(), margin + 25, y);
          doc.setFont("helvetica", "normal").setTextColor(150);
          doc.text(
            (sectionPageMap.get(s.id) || 3).toString(),
            pageWidth - margin - 15,
            y - 1.5,
            { align: "center" }
          );
          doc.line(margin + 21.17, y - 8, margin + 21.17, y + 2);
          doc.line(
            pageWidth - margin - 35,
            y - 8,
            pageWidth - margin - 35,
            y + 2
          );
          y += 10;
        });
        drawFooter(currentPageNum);
      }

      let currentSectionY = startYAfterHeader;
      targetQuote.sections.forEach((section, sidx) => {
        const targetPageNum =
          sectionPageMap.get(section.id) || (showsIndex ? 3 : 2);
        while (currentPageNum < targetPageNum) {
          doc.addPage();
          currentPageNum++;
          drawHeader();
          drawFooter(currentPageNum);
          currentSectionY = startYAfterHeader + 5;
        }

        doc
          .setFontSize(11)
          .setFont("helvetica", "bold")
          .setTextColor(brandRed[0], brandRed[1], brandRed[2]);
        doc.text(section.title.toUpperCase(), margin, currentSectionY);
        currentSectionY += 12;

        if (section.type === "table") {
          const colWidths = getColWidths(section);

          const drawTableHeaders = (currY: number) => {
            const headerH = 10;
            doc
              .setFillColor(headerBg[0], headerBg[1], headerBg[2])
              .setDrawColor(150)
              .rect(margin, currY - 8, contentWidth, headerH, "FD");
            doc.setFont("helvetica", "bold").setFontSize(9).setTextColor(0);
            let cx = margin;
            section.headers.forEach((h, hi) => {
              const hText = h.toLowerCase();
              const align =
                hi === 0 &&
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
                  ? cx + colWidths[hi] / 2
                  : align === "right"
                  ? cx + colWidths[hi] - PADD
                  : cx + PADD;
              doc.text(h || "", tx, currY - 1.5, { align });
              if (hi < section.headers.length - 1)
                doc.line(
                  cx + colWidths[hi],
                  currY - 8,
                  cx + colWidths[hi],
                  currY - 8 + headerH
                );
              cx += colWidths[hi];
            });
            return currY + headerH;
          };

          currentSectionY = drawTableHeaders(currentSectionY);
          section.rows.forEach((row) => {
            doc.setFontSize(9);
            const splitCells = row.map((c, ci) =>
              doc.splitTextToSize(c || "-", colWidths[ci] - PADD * 2)
            );
            const rowH =
              Math.max(...splitCells.map((l) => l.length)) * LINE_HEIGHT +
              PADD * 2;

            if (currentSectionY + rowH - 8 > pageHeightLimit) {
              drawFooter(currentPageNum);
              doc.addPage();
              currentPageNum++;
              drawHeader();
              currentSectionY = startYAfterHeader + 10;
              currentSectionY = drawTableHeaders(currentSectionY);
            }

            let cx = margin;
            doc
              .setDrawColor(150)
              .rect(margin, currentSectionY - 8, contentWidth, rowH, "D");
            splitCells.forEach((lines, ci) => {
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
              doc.setFont("helvetica", "normal").setTextColor(50);
              const startTextY = currentSectionY - 8 + PADD + 3.5;
              doc.text(lines, tx, startTextY, { align });
              if (ci < section.headers.length - 1) {
                doc.line(
                  cx + colWidths[ci],
                  currentSectionY - 8,
                  cx + colWidths[ci],
                  currentSectionY - 8 + rowH
                );
              }
              cx += colWidths[ci];
            });
            currentSectionY += rowH;
          });
        } else {
          doc.setFontSize(BODY_FONT_SIZE);
          if (section.content) {
            const textLines = doc.splitTextToSize(
              section.content,
              contentWidth - 10
            );
            const textH = textLines.length * 6 + 5;
            if (currentSectionY + textH > pageHeightLimit) {
              drawFooter(currentPageNum);
              doc.addPage();
              currentPageNum++;
              drawHeader();
              currentSectionY = startYAfterHeader + 5;
            }
            doc.setFont("helvetica", "normal").setTextColor(50);
            doc.text(textLines, margin + 4, currentSectionY, { align: "left" });
            currentSectionY += textH;
          }
          section.items.forEach((item) => {
            const itemLines = doc.splitTextToSize(item, contentWidth - 15);
            const itemH = itemLines.length * 6 + 3;
            if (currentSectionY + itemH > pageHeightLimit) {
              drawFooter(currentPageNum);
              doc.addPage();
              currentPageNum++;
              drawHeader();
              currentSectionY = startYAfterHeader + 5;
            }
            doc
              .setFillColor(brandRed[0], brandRed[1], brandRed[2])
              .circle(margin + 5, currentSectionY - 1, 0.8, "F");
            doc
              .setFont("helvetica", "normal")
              .setTextColor(50)
              .text(itemLines, margin + 10, currentSectionY, { align: "left" });
            currentSectionY += itemH;
          });
        }

        currentSectionY += 10;

        if (sidx === targetQuote.sections.length - 1) {
          doc.setFontSize(BODY_FONT_SIZE);
          const closingLines = doc.splitTextToSize(
            targetQuote.closingBody,
            contentWidth - 10
          );
          const finalH = closingLines.length * 6 + 60;
          if (currentSectionY + finalH > pageHeightLimit) {
            drawFooter(currentPageNum);
            doc.addPage();
            currentPageNum++;
            drawHeader();
            currentSectionY = startYAfterHeader + 5;
          }
          currentSectionY += 10;
          doc
            .setFont("helvetica", "normal")
            .setTextColor(100)
            .text(closingLines, margin + 4, currentSectionY, { align: "left" });
          currentSectionY += closingLines.length * 6 + 25;
          doc
            .setFont("helvetica", "bold")
            .setTextColor(0)
            .text("Thanking you", margin + 4, currentSectionY);
          currentSectionY += 10;
          doc
            .setFontSize(14)
            .setTextColor(brandBlue[0], brandBlue[1], brandBlue[2])
            .text(branding.registry.name, margin + 4, currentSectionY);
          currentSectionY += 20;
          doc
            .setFontSize(10)
            .setTextColor(200)
            .text("!! End of Documents !!", 105, currentSectionY, {
              align: "center",
            });
          drawFooter(currentPageNum);
        }
      });

      setDownloadStep("Finalizing Artifact...");
      doc.save(`DNSPL_OFFER_${targetQuote.refNo.replace(/\//g, "_")}.pdf`);
      addNotification("success", "Master PDF Generated Successfully.");
    } catch (error: any) {
      console.error("PDF Export failed", error);
      addNotification("error", `Generation failure: ${error.message}`);
    } finally {
      setIsDownloading(false);
      setDownloadStep("");
    }
  };

  const addTableSection = () => {
    if (!localQuote) return;
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: "NEW TABLE BLOCK",
      type: "table",
      headers: ["Sl. No.", "Subject", "Details"],
      rows: [["1", "", ""]],
      items: [],
      content: "",
      columnWidths: [21.17, null, null],
    };
    handleLocalUpdate({ sections: [...localQuote.sections, newSection] });
  };

  const addMixedSection = () => {
    if (!localQuote) return;
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      title: "NEW TEXT BLOCK",
      type: "mixed",
      headers: [],
      rows: [],
      items: ["New point details..."],
      content: "Introductory paragraph content",
    };
    handleLocalUpdate({ sections: [...localQuote.sections, newSection] });
  };

  const handleWhatsAppSend = () => {
    if (!localQuote || !client) return;
    const phone = client.phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      `Hello M/s ${client.name},\n\nWe are pleased to share the quotation for ${project.name} (Ref: ${localQuote.refNo}).\n\nPlease find the attached PDF sent previously or check your email.\n\nRegards,\nRevira nexGen Structures`
    );
    window.open(
      `https://wa.me/${
        phone.startsWith("91") ? phone : `91${phone}`
      }?text=${message}`,
      "_blank"
    );
  };

  const handleOpenEmailForm = () => {
    if (!localQuote || !client) return;
    const defaultSubject = `Quotation Offer: ${localQuote.refNo} | ${project.name}`;
    const defaultBody = `Dear Sir/Madam,\n\nPlease find the detailed Techno-Commercial offer for the subject project attached.\n\nProject: ${project.name}\nLocation: ${localQuote.location}\nRef No: ${localQuote.refNo}\n\nWe look forward to your positive response.\n\nBest Regards,\n${localQuote.regardsName}\nRevira nexGen Structures Pvt. Ltd.`;

    setEmailCompose({
      to: client.email,
      subject: defaultSubject,
      body: defaultBody,
    });
    setDispatchStep("email");
  };

  const executeEmailSend = () => {
    const subject = encodeURIComponent(emailCompose.subject);
    const body = encodeURIComponent(emailCompose.body);
    window.location.href = `mailto:${emailCompose.to}?subject=${subject}&body=${body}`;
    addNotification(
      "info",
      "Opening system mail client. Please remember to attach the PDF file manually."
    );
    setIsDispatchOpen(false);
    setDispatchStep("choice");
  };

  const closeDispatch = () => {
    setIsDispatchOpen(false);
    setDispatchStep("choice");
  };

  return (
    <div className="space-y-6 pb-24 relative bg-white">
      <div className="fixed top-20 right-8 z-[120] space-y-3 pointer-events-none w-80">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border flex items-start gap-3 animate-slide-in-left ${
              n.type === "success"
                ? "bg-[#2E3191] border-white/20 text-white"
                : n.type === "error"
                ? "bg-[#EC1C24] border-white/20 text-white"
                : "bg-blue-50 border-blue-100 text-blue-800"
            }`}
          >
            {n.type === "success" && (
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-white" />
            )}
            {n.type === "error" && (
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-white" />
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
          className="flex items-center gap-2 px-6 py-3 bg-[#2E3191] text-white rounded-2xl hover:bg-[#1e206b] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[#2E3191]/20"
        >
          <Plus size={20} /> New Quotation V{projectQuotes.length + 1}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-1 space-y-4">
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden sticky top-6">
            <div className="p-5 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
              <h2 className="font-black text-[#2E3191] text-[10px] uppercase tracking-[0.2em]">
                Version Control
              </h2>
              {hasUnsavedChanges && (
                <AlertTriangle
                  size={14}
                  className="text-[#EC1C24] animate-pulse"
                />
              )}
            </div>
            <div className="divide-y divide-slate-50 max-h-[60vh] overflow-y-auto">
              {projectQuotes.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`group w-full text-left p-5 hover:bg-[#2E3191]/5 transition-all flex items-center justify-between ${
                    selectedQuoteId === q.id
                      ? "bg-[#2E3191]/10 border-l-4 border-[#EC1C24]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                        selectedQuoteId === q.id
                          ? "bg-[#2E3191] text-white shadow-lg"
                          : "bg-slate-50 text-slate-300 border border-slate-100"
                      }`}
                    >
                      {q.version}
                    </div>
                    <div>
                      <p
                        className={`text-[10px] font-black uppercase tracking-tight ${
                          selectedQuoteId === q.id
                            ? "text-[#2E3191]"
                            : "text-slate-600"
                        }`}
                      >
                        Rev. R-0{q.version - 1}
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadPDF(q);
                      }}
                      className="p-2 opacity-0 group-hover:opacity-100 bg-white shadow-md rounded-lg text-[#2E3191] hover:scale-110 transition-all"
                      title="Quick Download"
                    >
                      <Download size={14} />
                    </button>
                    {q.status === "Sent" && (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 space-y-6">
          {localQuote ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-[#2E3191] p-6 rounded-[2.5rem] shadow-2xl sticky top-6 z-40 border border-white/10">
                <div className="flex items-center gap-4 ml-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                    <Hash size={14} className="text-[#EC1C24]" />
                    <span className="text-xs font-mono font-black text-white uppercase tracking-tighter">
                      {localQuote.refNo}
                    </span>
                  </div>
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/30 rounded-lg text-white">
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Modified
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onDuplicateQuotation(localQuote.id)}
                    className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
                    title="Duplicate Version"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all"
                    title="Live Preview"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => setIsDispatchOpen(true)}
                    className="p-3 bg-[#EC1C24] rounded-2xl text-white hover:scale-110 transition-all shadow-lg animate-pulse"
                    title="Dispatch Center"
                  >
                    <Send size={20} />
                  </button>
                  <div className="w-px h-8 bg-white/10 mx-1" />

                  <button
                    onClick={() => handleDownloadPDF()}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-[#2E3191] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl disabled:opacity-50 min-w-[160px] justify-center"
                  >
                    {isDownloading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileDown size={16} />
                    )}
                    {isDownloading
                      ? downloadStep || "Exporting..."
                      : "Export Master PDF"}
                  </button>

                  <button
                    onClick={handleSaveToDatabase}
                    disabled={!hasUnsavedChanges || isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl ${
                      hasUnsavedChanges
                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20"
                        : "bg-white/10 text-white/30 cursor-not-allowed border border-white/10"
                    }`}
                  >
                    {isSaving ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saveStatus === "success" ? "Synchronized" : "Sync Changes"}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-12 relative overflow-hidden">
                <section className="space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Offer Metadata & Header
                    </h3>
                    <button
                      onClick={() => {
                        if (window.confirm("Reset all header metadata?"))
                          handleLocalUpdate({
                            refNo: "",
                            enquiryNo: "",
                            location: "",
                            recipientName: "",
                            recipientAddress: "",
                            subject: "",
                            salutation: "",
                            introBody: "",
                            closingBody: "",
                            introText: "Techno-Commercial Offer",
                          });
                      }}
                      className="flex items-center gap-2 text-[#EC1C24] hover:text-[#d11920] transition-colors"
                    >
                      <Trash2 size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        Purge Header
                      </span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                          <Hash size={12} className="text-[#EC1C24]" /> Ref
                          Identifier
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.refNo}
                          onChange={(e) =>
                            handleLocalUpdate({ refNo: e.target.value })
                          }
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                          <Calendar size={12} className="text-[#EC1C24]" />{" "}
                          Document Date
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.date}
                          onChange={(e) =>
                            handleLocalUpdate({ date: e.target.value })
                          }
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                          <Info size={12} className="text-[#EC1C24]" /> Enquiry
                          Reference
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.enquiryNo}
                          onChange={(e) =>
                            handleLocalUpdate({ enquiryNo: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                          <MapPin size={12} className="text-[#EC1C24]" />{" "}
                          Project Location
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.location}
                          onChange={(e) =>
                            handleLocalUpdate({ location: e.target.value })
                          }
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                          <UserIcon size={12} className="text-[#EC1C24]" />{" "}
                          Client Liaison (To:)
                        </label>
                        <input
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all"
                          value={localQuote.recipientName}
                          onChange={(e) =>
                            handleLocalUpdate({ recipientName: e.target.value })
                          }
                        />
                      </div>
                      <div className="group">
                        <label className="block text-[10px] font-black text-[#2E3191] uppercase tracking-widest ml-1 mb-1.5 flex items-center gap-2">
                          <MapPin size={12} className="text-[#EC1C24]" /> Full
                          Recipient Address
                        </label>
                        <textarea
                          className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-800 transition-all h-24"
                          value={localQuote.recipientAddress}
                          onChange={(e) =>
                            handleLocalUpdate({
                              recipientAddress: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="space-y-8">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-5">
                    <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Quotation Orchestration
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={addTableSection}
                        className="flex items-center gap-3 px-5 py-2.5 bg-[#2E3191] text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-[#1e206b] shadow-xl shadow-[#2E3191]/20 active:scale-95"
                      >
                        <PlusCircle size={14} /> Append Table Block
                      </button>
                      <button
                        onClick={addMixedSection}
                        className="flex items-center gap-3 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-95"
                      >
                        <PlusCircle size={14} /> Append Text/List Block
                      </button>
                    </div>
                  </div>

                  <div className="space-y-12">
                    {localQuote.sections.map((section, idx) => (
                      <div
                        key={section.id}
                        className="group relative bg-white rounded-[2.5rem] border-2 border-slate-50 p-10 hover:border-[#2E3191]/30 transition-all hover:shadow-2xl"
                      >
                        <div className="flex items-center justify-between mb-10">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#2E3191] text-white flex items-center justify-center font-black text-sm shadow-lg shadow-[#2E3191]/20">
                              {idx + 1}.0
                            </div>
                            <input
                              className="bg-transparent border-b-2 border-transparent focus:border-[#2E3191] outline-none font-black text-xl uppercase tracking-tight text-[#2E3191] min-w-[400px] transition-all"
                              value={section.title}
                              onChange={(e) => {
                                const updated = localQuote.sections.map((s) =>
                                  s.id === section.id
                                    ? { ...s, title: e.target.value }
                                    : s
                                );
                                handleLocalUpdate({ sections: updated });
                              }}
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={() => moveSection(idx, "up")}
                              className="p-2.5 bg-slate-50 hover:bg-[#2E3191]/10 rounded-xl text-slate-300 hover:text-[#2E3191] transition-all"
                            >
                              <ChevronUp size={20} />
                            </button>
                            <button
                              onClick={() => moveSection(idx, "down")}
                              className="p-2.5 bg-slate-50 hover:bg-[#2E3191]/10 rounded-xl text-slate-300 hover:text-[#2E3191] transition-all"
                            >
                              <ChevronDown size={20} />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Permanently delete this block?"
                                  )
                                )
                                  handleLocalUpdate({
                                    sections: localQuote.sections.filter(
                                      (s) => s.id !== section.id
                                    ),
                                  });
                              }}
                              className="p-2.5 bg-[#EC1C24]/5 text-slate-300 hover:text-[#EC1C24] rounded-xl transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        {section.type === "table" && (
                          <div className="overflow-hidden rounded-3xl border-2 border-slate-50 bg-white">
                            <table
                              className="w-full text-sm"
                              style={{ tableLayout: "fixed" }}
                            >
                              <thead className="bg-slate-50/50">
                                <tr>
                                  {section.headers.map((h, hidx) => {
                                    const hText = h.toLowerCase();
                                    const isSlNo =
                                      hidx === 0 &&
                                      (hText.includes("sl") ||
                                        hText.includes("s.n") ||
                                        hText.includes("sr") ||
                                        hText.includes("no"));
                                    const customWidth =
                                      section.columnWidths?.[hidx];
                                    const colWidth = customWidth
                                      ? `${customWidth}mm`
                                      : isSlNo
                                      ? "80px"
                                      : "auto";

                                    return (
                                      <th
                                        className="p-5 text-left border-r border-slate-100 last:border-0"
                                        key={hidx}
                                        style={{ width: colWidth }}
                                      >
                                        <div className="flex flex-col gap-3">
                                          <div className="flex items-center gap-2">
                                            <Maximize2
                                              size={12}
                                              className="text-[#EC1C24]"
                                            />
                                            <input
                                              type="number"
                                              placeholder="Width mm"
                                              className="bg-white w-20 px-2 py-1 text-[9px] border border-slate-100 rounded-lg outline-none font-black text-[#2E3191] focus:border-[#2E3191]"
                                              value={customWidth || ""}
                                              onChange={(e) => {
                                                const newWidths = [
                                                  ...(section.columnWidths ||
                                                    new Array(
                                                      section.headers.length
                                                    ).fill(null)),
                                                ];
                                                newWidths[hidx] = e.target.value
                                                  ? parseFloat(e.target.value)
                                                  : null;
                                                const updated =
                                                  localQuote.sections.map((s) =>
                                                    s.id === section.id
                                                      ? {
                                                          ...s,
                                                          columnWidths:
                                                            newWidths,
                                                        }
                                                      : s
                                                  );
                                                handleLocalUpdate({
                                                  sections: updated,
                                                });
                                              }}
                                            />
                                          </div>
                                          <div className="flex items-center gap-2 group/col">
                                            <input
                                              className="bg-transparent font-black text-[10px] uppercase tracking-widest text-[#2E3191] outline-none w-full"
                                              value={h}
                                              onChange={(e) => {
                                                const newHeaders = [
                                                  ...section.headers,
                                                ];
                                                newHeaders[hidx] =
                                                  e.target.value;
                                                const updated =
                                                  localQuote.sections.map((s) =>
                                                    s.id === section.id
                                                      ? {
                                                          ...s,
                                                          headers: newHeaders,
                                                        }
                                                      : s
                                                  );
                                                handleLocalUpdate({
                                                  sections: updated,
                                                });
                                              }}
                                            />
                                            {section.headers.length > 1 && (
                                              <button
                                                onClick={() => {
                                                  const newHeaders =
                                                    section.headers.filter(
                                                      (_, i) => i !== hidx
                                                    );
                                                  const newRows =
                                                    section.rows.map((row) =>
                                                      row.filter(
                                                        (_, i) => i !== hidx
                                                      )
                                                    );
                                                  const newWidths =
                                                    section.columnWidths?.filter(
                                                      (_, i) => i !== hidx
                                                    );
                                                  handleLocalUpdate({
                                                    sections:
                                                      localQuote.sections.map(
                                                        (s) =>
                                                          s.id === section.id
                                                            ? {
                                                                ...s,
                                                                headers:
                                                                  newHeaders,
                                                                rows: newRows,
                                                                columnWidths:
                                                                  newWidths,
                                                              }
                                                            : s
                                                      ),
                                                  });
                                                }}
                                                className="opacity-0 group-hover/col:opacity-100 text-[#EC1C24] hover:scale-110 transition-all"
                                              >
                                                <X size={14} />
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      </th>
                                    );
                                  })}
                                  <th className="w-16 p-4 text-center">
                                    <button
                                      onClick={() => {
                                        const newHeaders = [
                                          ...section.headers,
                                          `New Column` ||
                                            `Col ${section.headers.length + 1}`,
                                        ];
                                        const newRows = section.rows.map(
                                          (row) => [...row, ""]
                                        );
                                        const newWidths = [
                                          ...(section.columnWidths ||
                                            new Array(
                                              section.headers.length
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
                                                : s
                                          ),
                                        });
                                      }}
                                      className="p-3 text-[#2E3191] hover:bg-[#2E3191]/10 rounded-2xl transition-all"
                                      title="Add Column"
                                    >
                                      <Columns size={20} />
                                    </button>
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {section.rows.map((row, ridx) => (
                                  <tr
                                    key={ridx}
                                    className={`hover:bg-[#2E3191]/5 transition-colors ${
                                      ridx % 2 !== 0 ? "bg-slate-50/30" : ""
                                    }`}
                                  >
                                    {row.map((cell, cidx) => (
                                      <td
                                        key={cidx}
                                        className="p-5 border-r border-slate-50 last:border-0 overflow-hidden break-words"
                                      >
                                        <textarea
                                          className="w-full bg-transparent outline-none font-bold text-slate-600 resize-none h-auto overflow-hidden text-xs"
                                          value={cell}
                                          rows={1}
                                          onChange={(e) => {
                                            const newRows = [...section.rows];
                                            newRows[ridx] = [...newRows[ridx]];
                                            newRows[ridx][cidx] =
                                              e.target.value;
                                            handleLocalUpdate({
                                              sections: localQuote.sections.map(
                                                (s) =>
                                                  s.id === section.id
                                                    ? { ...s, rows: newRows }
                                                    : s
                                              ),
                                            });
                                          }}
                                        />
                                      </td>
                                    ))}
                                    <td className="p-4 text-center">
                                      <button
                                        onClick={() => {
                                          const newRows = section.rows.filter(
                                            (_, i) => i !== ridx
                                          );
                                          handleLocalUpdate({
                                            sections: localQuote.sections.map(
                                              (s) =>
                                                s.id === section.id
                                                  ? { ...s, rows: newRows }
                                                  : s
                                            ),
                                          });
                                        }}
                                        className="text-slate-200 hover:text-[#EC1C24] transition-all"
                                      >
                                        <X size={20} />
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
                                            new Array(s.headers.length).fill(
                                              ""
                                            ),
                                          ],
                                        }
                                      : s
                                  ),
                                })
                              }
                              className="w-full p-5 text-[10px] font-black uppercase text-[#2E3191] hover:bg-[#2E3191]/5 transition-all border-t border-slate-50 tracking-[0.2em]"
                            >
                              + Append Data Record
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-[600px] bg-white rounded-[3rem] border-4 border-dashed border-slate-50 flex flex-col items-center justify-center text-slate-200 animate-pulse-soft">
              <FileText size={100} className="mb-8 opacity-10" />
              <p className="font-black uppercase tracking-[0.3em] text-xs text-center">
                Select Quotation Version to Orchestrate
              </p>
            </div>
          )}
        </div>
      </div>

      {isPreviewOpen && localQuote && (
        <div className="fixed inset-0 z-[110] bg-white/95 flex flex-col items-center p-8 lg:p-20 overflow-y-auto backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-6xl flex items-center justify-between mb-16 sticky top-0 z-50 bg-[#2E3191] p-6 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center gap-6 text-white">
              <div className="w-14 h-14 rounded-3xl bg-white text-[#2E3191] flex items-center justify-center shadow-2xl shadow-black/20">
                <Layout size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  System Master Preview
                </h2>
                <p className="text-[10px] text-white/50 font-black uppercase tracking-[0.2em] mt-1">
                  {localQuote.refNo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <button
                onClick={() => handleDownloadPDF()}
                disabled={isDownloading}
                className="px-10 py-4 bg-[#EC1C24] text-white font-black rounded-2xl shadow-2xl shadow-[#EC1C24]/30 hover:scale-105 transition-all uppercase tracking-widest text-[11px] flex items-center gap-3"
              >
                {isDownloading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileDown size={20} />
                )}
                {isDownloading
                  ? downloadStep || "Exporting..."
                  : "Final PDF Export"}
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
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                    {dispatchStep === "choice"
                      ? "Multi-Channel Communication"
                      : "Compose Email Offer"}
                  </p>
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
                <>
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                      <UserIcon size={24} className="text-[#2E3191]" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        Target Partner
                      </p>
                      <p className="text-sm font-black text-[#2E3191] uppercase tracking-tight">
                        {client.name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <button
                      onClick={handleWhatsAppSend}
                      className="group flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all text-left"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-emerald-50 group-hover:bg-emerald-500 flex items-center justify-center transition-colors">
                        <MessageCircle
                          size={32}
                          className="text-emerald-500 group-hover:text-white transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-[#2E3191] uppercase tracking-tight">
                          WhatsApp Dispatch
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {client.phone}
                        </p>
                      </div>
                      <ChevronRight
                        size={24}
                        className="text-slate-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all"
                      />
                    </button>

                    <button
                      onClick={handleOpenEmailForm}
                      className="group flex items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-[#2E3191] hover:shadow-xl hover:shadow-[#2E3191]/5 transition-all text-left"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-[#2E3191] flex items-center justify-center transition-colors">
                        <MailIcon
                          size={32}
                          className="text-[#2E3191] group-hover:text-white transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-[#2E3191] uppercase tracking-tight">
                          Email Transmission
                        </h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {client.email}
                        </p>
                      </div>
                      <ChevronRight
                        size={24}
                        className="text-slate-200 group-hover:text-[#2E3191] group-hover:translate-x-1 transition-all"
                      />
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-[#2E3191]/5 p-6 rounded-3xl border border-[#2E3191]/10 space-y-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center">
                        <AtSign size={18} className="text-[#EC1C24]" />
                      </div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                        Official Sender Context:{" "}
                        <span className="text-[#2E3191]">
                          info@reviranexgen.com
                        </span>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-[#2E3191]/10 flex items-center gap-3">
                      <FileCheck size={14} className="text-emerald-500" />
                      <p className="text-[9px] font-black uppercase text-slate-400">
                        Step 1: Download PDF offered below. Step 2: Attach it in
                        your mail client after firing transmission.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                        Recipient Address (To:)
                      </label>
                      <input
                        type="email"
                        placeholder="recipient@domain.com"
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-700 transition-all"
                        value={emailCompose.to}
                        onChange={(e) =>
                          setEmailCompose({
                            ...emailCompose,
                            to: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                        Subject Header
                      </label>
                      <input
                        type="text"
                        placeholder="Offer Subject..."
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-black text-[#2E3191] transition-all"
                        value={emailCompose.subject}
                        onChange={(e) =>
                          setEmailCompose({
                            ...emailCompose,
                            subject: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-black text-[#2E3191] uppercase tracking-widest ml-1">
                        Email Body Message
                      </label>
                      <textarea
                        className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-[#2E3191]/5 focus:border-[#2E3191] outline-none font-bold text-slate-600 transition-all h-40 resize-none text-xs leading-relaxed"
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

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => setDispatchStep("choice")}
                      className="flex-1 px-6 py-4 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={executeEmailSend}
                      className="flex-1 px-6 py-4 bg-[#2E3191] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1e206b] transition-all shadow-xl shadow-[#2E3191]/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <MailIcon size={16} /> Fire Transmission
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-slate-50 flex flex-col items-center gap-4">
                <button
                  onClick={() => handleDownloadPDF()}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-slate-100 text-[#2E3191] rounded-3xl font-black text-[10px] uppercase tracking-widest hover:border-[#2E3191] hover:bg-[#2E3191]/5 transition-all disabled:opacity-50 group"
                >
                  {isDownloading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Download
                      size={18}
                      className="group-hover:translate-y-0.5 transition-transform"
                    />
                  )}
                  {isDownloading
                    ? downloadStep || "Exporting..."
                    : "Download PDF Offered Copy"}
                </button>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-300">
                  Revira nexGen Secure Dispatch Protocol
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
