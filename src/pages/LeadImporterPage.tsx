import React, { useState, useRef } from 'react';
import { Upload, FileCheck, AlertCircle, CheckCircle2, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

interface PreviewData {
  detected: number;
  validCount: number;
  duplicateCount: number;
  invalidCount: number;
  validLeads: any[];
  duplicates: any[];
  invalidLeads: any[];
}

export const LeadImporterPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(null);
      setSuccessMessage('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setPreview(null);
      setSuccessMessage('');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/leads/import/preview', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setPreview(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to parse lead file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const isAnvi = window.location.pathname.startsWith('/8328246413');
  const targetOrg = isAnvi ? 'ANVI' : 'BLUNET';

  const handleConfirmImport = async () => {
    if (!preview || preview.validLeads.length === 0) return;
    setImporting(true);

    try {
      const res = await api.post('/leads/import/confirm', {
        campaignName: campaignName || file?.name.replace(/\.[^/.]+$/, '') || `${targetOrg} Campaign`,
        leads: preview.validLeads,
        organization: targetOrg,
      });

      if (res.data.success) {
        setSuccessMessage(res.data.message);
        setPreview(null);
        setFile(null);
        setCampaignName('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Import failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase ${
            isAnvi ? 'bg-rose-100 text-[#800020] border border-rose-300' : 'bg-blue-100 text-blue-700'
          }`}>
            {isAnvi ? 'ANVI SECRET IMPORTER' : 'BLUNET IMPORTER'}
          </span>
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {isAnvi ? 'Anvi Lead Excel & File Importer' : 'BluNet Lead Excel & File Importer'}
        </h1>
        <p className="text-xs text-slate-500">
          {isAnvi
            ? 'Upload Excel (.xlsx, .xls), CSV, or PDF lead files for Anvi. Leads imported here are exclusively visible to Anvi staff.'
            : 'Upload Excel (.xlsx, .xls), CSV, or PDF lead files for BluNet IT Services. Leads imported here are visible to both BluNet and Anvi staff.'}
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMessage}</span>
        </div>
      )}

      {/* Upload Box */}
      <Card title="Upload Lead File (Excel / CSV / PDF)">
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed transition-colors rounded-xl p-8 text-center cursor-pointer ${
              isDragging ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-500 bg-slate-50/50'
            }`}
          >
            <Upload className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-800">
              Drag & Drop Excel / CSV / PDF lead file here, or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports .xlsx, .xls, .csv, .pdf (Up to 25MB)</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Excel / File
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{file.name}</div>
                  <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                </div>
              </div>

              <Button onClick={handleAnalyze} loading={analyzing}>
                Analyze File
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Preview Section */}
      {analyzing && (
        <Card className="text-center py-12">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-800">Analyzing file & extracting leads...</p>
          <p className="text-xs text-slate-400 mt-1">Validating field formats and checking database duplicates</p>
        </Card>
      )}

      {preview && (
        <div className="space-y-6">
          {/* Summary Breakdown Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-50 border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Leads Detected</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{preview.detected}</div>
            </Card>

            <Card className="bg-emerald-50 border-emerald-200">
              <div className="text-xs text-emerald-700 font-medium">Valid Leads</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1">{preview.validCount}</div>
            </Card>

            <Card className="bg-amber-50 border-amber-200">
              <div className="text-xs text-amber-700 font-medium">Duplicates Removed</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{preview.duplicateCount}</div>
            </Card>

            <Card className="bg-rose-50 border-rose-200">
              <div className="text-xs text-rose-700 font-medium">Invalid Leads</div>
              <div className="text-2xl font-bold text-rose-800 mt-1">{preview.invalidCount}</div>
            </Card>
          </div>

          {/* Import Action Box */}
          <Card title="Import Preview Confirmation">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Q4 Enterprise Leads Bengaluru"
                  className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Sample extracted leads table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 font-semibold text-xs text-slate-700 border-b border-slate-200 flex justify-between">
                  <span>Sample Valid Leads Preview ({preview.validLeads.length} Total)</span>
                  <span>Lead #1 will be AVAILABLE, Lead #2+ LOCKED</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {preview.validLeads.slice(0, 10).map((l: any, i: number) => (
                    <div key={i} className="px-4 py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{l.businessName}</span>
                        <span className="text-slate-400 ml-2">{l.phone}</span>
                      </div>
                      <Badge variant={i === 0 ? 'success' : 'neutral'}>
                        {i === 0 ? 'AVAILABLE (#1)' : `LOCKED (#${i + 1})`}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" onClick={() => setPreview(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  loading={importing}
                  disabled={preview.validLeads.length === 0}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Import {preview.validCount} Valid Leads
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
