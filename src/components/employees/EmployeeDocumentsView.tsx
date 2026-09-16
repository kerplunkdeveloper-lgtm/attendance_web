"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  EmployeeDocument,
  EmployeeDocumentChecklistItem,
  EmployeeDocumentsData,
  EmployeeDocumentType,
} from "@/types";
import { employeesApi } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Calendar,
  ShieldCheck,
  Bell,
  Search,
  Check,
  X,
  ExternalLink,
  Plus,
  Loader2,
  FileCheck2,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface EmployeeDocumentsViewProps {
  employeeId: string;
  employeeName?: string;
  employeeCode?: string;
  isCurrentUserAdmin?: boolean;
  onClose?: () => void;
}

const DOCUMENT_ICONS: Record<string, string> = {
  AADHAAR: "🪪",
  PAN: "💳",
  PASSPORT: "🛂",
  DRIVING_LICENCE: "🚗",
  EDUCATION_CERTIFICATE: "🎓",
  EXPERIENCE_LETTER: "💼",
  OFFER_LETTER: "📜",
  EMPLOYMENT_CONTRACT: "📝",
  BANK_DOCUMENT: "🏦",
  OTHER: "📁",
};

export default function EmployeeDocumentsView({
  employeeId,
  employeeName: initialName,
  employeeCode: initialCode,
  isCurrentUserAdmin = true,
  onClose,
}: EmployeeDocumentsViewProps) {
  const [data, setData] = useState<EmployeeDocumentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "UPLOADED" | "MISSING" | "PENDING" | "VERIFIED" | "EXPIRING">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload / Replace Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EmployeeDocumentType>("AADHAAR");
  const [docTitle, setDocTitle] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [targetDocIdToReplace, setTargetDocIdToReplace] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<EmployeeDocument | null>(null);

  // Rejection Reason Modal State
  const [rejectModalDoc, setRejectModalDoc] = useState<EmployeeDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await employeesApi.getDocuments(employeeId);
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        toast.error(res?.message || "Failed to load documents");
      }
    } catch (err: any) {
      console.error("Error loading documents:", err);
      toast.error(err.response?.data?.message || "Could not retrieve employee documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) {
      loadDocuments();
    }
  }, [employeeId]);

  const handleOpenUpload = (item: EmployeeDocumentChecklistItem, docToReplace?: EmployeeDocument) => {
    setSelectedType(item.type);
    setSelectedFile(null);
    setFilePreviewUrl(null);
    if (docToReplace) {
      setTargetDocIdToReplace(docToReplace.id);
      setDocTitle(docToReplace.title || "");
      setExpiryDate(docToReplace.expiryDate ? docToReplace.expiryDate.split("T")[0] : "");
    } else {
      setTargetDocIdToReplace(null);
      setDocTitle("");
      setExpiryDate("");
    }
    setUploadModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  const handleSubmitUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !targetDocIdToReplace) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      }
      formData.append("documentType", selectedType);
      if (docTitle) formData.append("title", docTitle);
      if (expiryDate) formData.append("expiryDate", expiryDate);

      let res;
      if (targetDocIdToReplace) {
        res = await employeesApi.updateDocument(employeeId, targetDocIdToReplace, formData);
        toast.success("Document updated successfully");
      } else {
        res = await employeesApi.uploadDocument(employeeId, formData);
        toast.success("Document uploaded successfully");
      }

      setUploadModalOpen(false);
      setSelectedFile(null);
      setTargetDocIdToReplace(null);
      loadDocuments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to delete the document "${docName}"?`)) return;

    try {
      const res = await employeesApi.deleteDocument(employeeId, docId);
      if (res?.success) {
        toast.success("Document removed");
        loadDocuments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete document");
    }
  };

  const handleVerify = async (docId: string, status: "VERIFIED" | "REJECTED", reason?: string) => {
    setIsVerifying(true);
    try {
      const res = await employeesApi.verifyDocument(employeeId, docId, {
        status,
        rejectionReason: reason,
      });
      if (res?.success) {
        toast.success(status === "VERIFIED" ? "Document approved & verified" : "Document rejected");
        setRejectModalDoc(null);
        setRejectionReason("");
        loadDocuments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update verification status");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemindExpiry = async (docId: string, type: string) => {
    try {
      const res = await employeesApi.sendExpiryReminder(employeeId, docId);
      if (res?.success) {
        toast.success(res.message || `Expiry reminder sent for ${type}`);
        loadDocuments();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send expiry reminder");
    }
  };

  const downloadFile = (fileUrl: string, fileName: string) => {
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter checklist
  const filteredChecklist = (data?.checklist || []).filter((item) => {
    const matchesSearch =
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === "UPLOADED") return item.isUploaded;
    if (filter === "MISSING") return !item.isUploaded;
    if (filter === "PENDING") return item.status === "PENDING";
    if (filter === "VERIFIED") return item.status === "VERIFIED";
    if (filter === "EXPIRING") {
      const doc = item.latestDocument;
      return doc && (doc.isExpired || doc.isExpiringSoon);
    }
    return true;
  });

  const empDisplayName = data?.employee?.name || initialName || "Employee";
  const empDisplayCode = data?.employee?.employeeCode || initialCode || "";
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Employees</span>
            <span>/</span>
            <span className="text-slate-300 font-semibold">{empDisplayName}</span>
            <span className="text-indigo-400 font-mono">({empDisplayCode})</span>
            <span>/</span>
            <span className="text-indigo-400 font-bold">Profile</span>
            <span>/</span>
            <span className="text-white font-bold">Documents</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCheck2 className="w-5 h-5" />
            </span>
            Employee Compliance & Statutory Documents
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aadhaar, PAN, Passports, Driving Licences, Education & Experience credentials with verification & expiry lifecycle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDocuments}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
            title="Refresh documents"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#090d16]/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mandatory</p>
            <div className="flex items-baseline justify-between mt-1">
              <p className="text-xl font-black text-white">
                {summary.uploadedMandatory} / {summary.totalMandatory}
              </p>
              <span className="text-xs font-bold text-indigo-400">{summary.completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full transition-all"
                style={{ width: `${summary.completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#090d16]/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified</p>
            <p className="text-xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {summary.verifiedCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Approved by HR</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#090d16]/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Review</p>
            <p className="text-xl font-black text-amber-400 mt-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {summary.pendingCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Awaiting action</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#090d16]/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rejected</p>
            <p className="text-xl font-black text-rose-400 mt-1 flex items-center gap-1.5">
              <XCircle className="w-4 h-4" />
              {summary.rejectedCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Needs re-upload</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#090d16]/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Expiring &lt;30d</p>
            <p className="text-xl font-black text-orange-400 mt-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {summary.expiringSoonCount}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Needs renewal</p>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#090d16]/70">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Stored</p>
            <p className="text-xl font-black text-slate-200 mt-1 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              {summary.totalDocuments}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">Across all slots</p>
          </div>
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto w-full sm:w-auto">
          {(
            [
              { key: "ALL", label: "All Slots (10)" },
              { key: "UPLOADED", label: "Uploaded" },
              { key: "MISSING", label: "Missing" },
              { key: "PENDING", label: "Pending" },
              { key: "VERIFIED", label: "Verified" },
              { key: "EXPIRING", label: "Expiring / Expired" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === t.key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search document slot..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm">Loading employee documents...</p>
        </div>
      ) : filteredChecklist.length === 0 ? (
        <div className="py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/80">
          <FileText className="w-10 h-10 mx-auto mb-2 text-slate-600" />
          <p className="text-sm font-medium">No documents matching this filter</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChecklist.map((item) => {
            const doc = item.latestDocument;
            const icon = DOCUMENT_ICONS[item.type] || "📄";

            return (
              <div
                key={item.type}
                className={`glass-card rounded-2xl p-5 border transition-all relative overflow-hidden ${
                  item.isVerified
                    ? "border-emerald-500/30 bg-emerald-950/10 hover:border-emerald-500/50"
                    : doc?.status === "PENDING"
                    ? "border-amber-500/30 bg-amber-950/10 hover:border-amber-500/50"
                    : doc?.status === "REJECTED"
                    ? "border-rose-500/30 bg-rose-950/10 hover:border-rose-500/50"
                    : doc?.isExpired
                    ? "border-rose-500/40 bg-rose-950/20"
                    : "border-slate-800 bg-[#090d16]/70 hover:border-slate-700"
                }`}
              >
                {/* Status indicator top bar */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center justify-center">
                      {icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{item.label}</h3>
                        {item.isMandatory ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                            Mandatory
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-slate-400">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {doc ? (
                      doc.status === "VERIFIED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      ) : doc.status === "REJECTED" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800/80 text-slate-400 border border-slate-700">
                        Missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Expiry Alert banner if applicable */}
                {doc && (doc.isExpired || doc.isExpiringSoon) && (
                  <div
                    className={`mb-3 px-3 py-2 rounded-xl flex items-center justify-between text-xs border ${
                      doc.isExpired
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {doc.isExpired
                          ? `Document EXPIRED on ${formatDate(doc.expiryDate!)}`
                          : `Expires in ${doc.daysUntilExpiry} days (${formatDate(doc.expiryDate!)})`}
                      </span>
                    </div>
                    {isCurrentUserAdmin && (
                      <button
                        onClick={() => handleRemindExpiry(doc.id, item.label)}
                        className="text-[11px] underline font-bold hover:text-white flex items-center gap-1"
                        title="Send in-app reminder to employee"
                      >
                        <Bell className="w-3 h-3" />
                        Remind
                      </button>
                    )}
                  </div>
                )}

                {/* Document Details if uploaded */}
                {doc ? (
                  <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">File Name:</span>
                      <span className="text-slate-200 font-mono font-medium truncate max-w-[200px]" title={doc.fileName}>
                        {doc.fileName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Uploaded:</span>
                      <span className="text-slate-300">{formatDate(doc.createdAt)}</span>
                    </div>

                    {doc.expiryDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Expiry Date:</span>
                        <span className="text-slate-300 font-medium">{formatDate(doc.expiryDate)}</span>
                      </div>
                    )}

                    {doc.verifiedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Verified By:</span>
                        <span className="text-emerald-400 font-medium">
                          {doc.verifiedBy} {doc.verifiedAt ? `(${formatDate(doc.verifiedAt)})` : ""}
                        </span>
                      </div>
                    )}

                    {doc.rejectionReason && (
                      <div className="p-2 bg-rose-950/40 rounded-lg border border-rose-800/40 text-rose-300 text-[11px]">
                        <strong>Rejection Reason:</strong> {doc.rejectionReason}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 rounded-xl p-4 border border-dashed border-slate-800 text-center mb-4">
                    <p className="text-xs text-slate-500">No document uploaded yet for this requirement.</p>
                  </div>
                )}

                {/* Card Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-1.5">
                    {doc ? (
                      <>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          title="Preview document"
                        >
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                          Preview
                        </button>
                        <button
                          onClick={() => downloadFile(doc.fileUrl, doc.fileName)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          title="Download file"
                        >
                          <Download className="w-3.5 h-3.5 text-sky-400" />
                          Download
                        </button>
                        <button
                          onClick={() => handleOpenUpload(item, doc)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
                          title="Replace with new file"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          Replace
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.fileName)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleOpenUpload(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload {item.label}
                      </button>
                    )}
                  </div>

                  {/* HR Review / Verification Buttons */}
                  {isCurrentUserAdmin && doc && (
                    <div className="flex items-center gap-1.5">
                      {doc.status !== "VERIFIED" && (
                        <button
                          onClick={() => handleVerify(doc.id, "VERIFIED")}
                          disabled={isVerifying}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-bold transition"
                          title="Approve and mark as verified"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Verify
                        </button>
                      )}
                      {doc.status !== "REJECTED" && (
                        <button
                          onClick={() => {
                            setRejectModalDoc(doc);
                            setRejectionReason("");
                          }}
                          disabled={isVerifying}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition"
                          title="Reject document"
                        >
                          <X className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Upload / Replace Modal ──────────────────────────────────────────────── */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Upload className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {targetDocIdToReplace ? "Replace Document" : "Upload Document"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Slot: <strong className="text-indigo-300">{selectedType.replace(/_/g, " ")}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitUpload} className="space-y-4 mt-5">
              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-indigo-500/70 bg-slate-900/50 hover:bg-slate-900/80 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    {filePreviewUrl ? (
                      <img
                        src={filePreviewUrl}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-xl mx-auto border border-slate-700 shadow"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
                    )}
                    <p className="text-xs font-bold text-white truncate max-w-[280px]">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    <span className="text-[10px] text-indigo-400 font-semibold underline">Click to choose a different file</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-200">
                      Click to browse or drag and drop document
                    </p>
                    <p className="text-[11px] text-slate-500">Supports PDF, PNG, JPG, JPEG (Max 15MB)</p>
                  </div>
                )}
              </div>

              {/* Document Title / Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Document Label / Note (Optional)
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Aadhaar Front & Back / Degree marksheets"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  Document Expiry Date (If applicable)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Essential for Passport, Driving Licence, and temporary contract agreements.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (!selectedFile && !targetDocIdToReplace)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {targetDocIdToReplace ? "Update Document" : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Preview Modal ──────────────────────────────────────────────────────── */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] bg-[#090d16] border border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-[#0f172a]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white truncate max-w-md">{previewDoc.fileName}</h3>
                  <p className="text-[11px] text-slate-400">
                    {previewDoc.documentType.replace(/_/g, " ")} • Status:{" "}
                    <strong
                      className={
                        previewDoc.status === "VERIFIED"
                          ? "text-emerald-400"
                          : previewDoc.status === "REJECTED"
                          ? "text-rose-400"
                          : "text-amber-400"
                      }
                    >
                      {previewDoc.status}
                    </strong>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadFile(previewDoc.fileUrl, previewDoc.fileName)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
                <a
                  href={previewDoc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/40 min-h-[400px]">
              {previewDoc.fileUrl.endsWith(".pdf") || previewDoc.mimeType === "application/pdf" ? (
                <iframe
                  src={previewDoc.fileUrl}
                  className="w-full h-[650px] rounded-xl border border-slate-800"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[650px] object-contain rounded-xl shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Reject Reason Modal ────────────────────────────────────────────────── */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Reject Document</h3>
                <p className="text-xs text-slate-400">{rejectModalDoc.documentType.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-xs text-slate-300">
                Provide a reason explaining why this document was rejected so the employee can upload an updated copy.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document copy is blurred / Missing government seal / Expired identity card"
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setRejectModalDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleVerify(rejectModalDoc.id, "REJECTED", rejectionReason)}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/25 flex items-center gap-1.5 transition"
              >
                {isVerifying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
