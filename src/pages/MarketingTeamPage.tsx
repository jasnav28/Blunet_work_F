import React, { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, Trash2, PhoneCall, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { UserProfile } from '../types';

export const MarketingTeamPage: React.FC = () => {
  const [marketingMembers, setMarketingMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Marketing Member Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('Marketing Executive');
  const [temporaryPassword, setTemporaryPassword] = useState('Password123!');
  const [creating, setCreating] = useState(false);

  // Delete Member Modal
  const [selectedForDelete, setSelectedForDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Lead File Importer State
  const [file, setFile] = useState<File | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImportMsg('');
    }
  };

  const fetchMarketingTeam = async () => {
    try {
      const res = await api.get('/employees?role=MARKETING_HEAD');
      if (res.data.success) {
        setMarketingMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load marketing team:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingTeam();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      await api.post('/employees', {
        name,
        email,
        phone,
        role: 'MARKETING_HEAD',
        designation,
        temporaryPassword,
      });

      setIsAddOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchMarketingTeam();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to add marketing team member.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedForDelete) return;
    setDeleting(true);

    try {
      const res = await api.delete(`/employees/${selectedForDelete.id}`);
      if (res.data.success) {
        setSelectedForDelete(null);
        fetchMarketingTeam();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to delete marketing team member.');
    } finally {
      setDeleting(false);
    }
  };

  const handleAnalyzeFile = async () => {
    if (!file) return;
    setAnalyzing(true);
    setImportMsg('');

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
      alert(err.response?.data?.error?.message || 'Failed to parse lead contact file.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview || preview.validLeads.length === 0) return;
    setImporting(true);

    try {
      const res = await api.post('/leads/import/confirm', {
        campaignName: campaignName || file?.name.replace(/\.[^/.]+$/, '') || 'Marketing PDF Campaign',
        leads: preview.validLeads,
      });

      if (res.data.success) {
        setImportMsg(res.data.message);
        setPreview(null);
        setFile(null);
        setCampaignName('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to import lead contacts.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Marketing Team & PDF Lead Importer</h1>
          <p className="text-xs text-slate-500">Manage marketing team members, upload PDF lead contact lists, and monitor calling pipelines</p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} icon={<UserPlus className="w-4 h-4" />}>
          Add Marketing Member
        </Button>
      </div>

      {/* MARKETING TEAM MEMBERS TABLE */}
      <Card title={`Marketing Team Members (${marketingMembers.length} Members)`}>
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Name & Email</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {marketingMembers
                .filter((member) => member.employeeId !== 'AN1012' && !member.email?.toLowerCase().includes('anvi'))
                .map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{member.employeeId}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{member.name}</div>
                    <div className="text-[11px] text-slate-500">{member.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{member.designation}</td>
                  <td className="px-4 py-3">
                    <Badge variant="warning">Marketing Head</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={member.isActive ? 'success' : 'neutral'}>
                      {member.isActive ? 'Active' : 'Deactivated'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setSelectedForDelete(member)}
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* EXCEL / CSV / PDF LEAD FILE UPLOADER */}
      <Card title="Upload Lead File (Excel / CSV / PDF)">
        {importMsg && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium text-sm">{importMsg}</span>
          </div>
        )}

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
            <p className="text-xs text-slate-400 mt-1">Supports Excel (.xlsx, .xls), CSV, or PDF with business names & contact numbers</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/pdf"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                  setPreview(null);
                  setImportMsg('');
                }
              }}
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

              <Button onClick={handleAnalyzeFile} loading={analyzing}>
                Parse Contact Leads
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* PREVIEW & CONFIRM IMPORT */}
      {preview && (
        <Card title="Lead Contacts Import Preview">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-slate-50 border-slate-200">
                <div className="text-xs text-slate-500 font-medium">Leads Detected</div>
                <div className="text-2xl font-bold text-slate-900">{preview.detected}</div>
              </Card>
              <Card className="bg-emerald-50 border-emerald-200">
                <div className="text-xs text-emerald-700 font-medium">Valid Leads</div>
                <div className="text-2xl font-bold text-emerald-800">{preview.validCount}</div>
              </Card>
              <Card className="bg-amber-50 border-amber-200">
                <div className="text-xs text-amber-700 font-medium">Duplicates Filtered</div>
                <div className="text-2xl font-bold text-amber-800">{preview.duplicateCount}</div>
              </Card>
              <Card className="bg-rose-50 border-rose-200">
                <div className="text-xs text-rose-700 font-medium">Invalid Records</div>
                <div className="text-2xl font-bold text-rose-800">{preview.invalidCount}</div>
              </Card>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Campaign Title</label>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. September Enterprise PDF Leads"
                className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setPreview(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmImport} loading={importing} icon={<ArrowRight className="w-4 h-4" />}>
                Confirm Import of {preview.validCount} Valid Contact Leads
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ADD MARKETING MEMBER MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Marketing Team Member"
        maxWidth="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sneha Patel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="sneha@blunet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Designation</label>
            <input
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Initial Password</label>
            <input
              type="text"
              required
              value={temporaryPassword}
              onChange={(e) => setTemporaryPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={creating}>
              Add Marketing Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE MEMBER MODAL */}
      {selectedForDelete && (
        <Modal
          isOpen={!!selectedForDelete}
          onClose={() => setSelectedForDelete(null)}
          title="Confirm Delete Marketing Member"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>
                Are you sure you want to delete marketing team member <strong>{selectedForDelete.name}</strong> ({selectedForDelete.employeeId})?
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setSelectedForDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteMember} loading={deleting}>
                Delete Marketing Member
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
