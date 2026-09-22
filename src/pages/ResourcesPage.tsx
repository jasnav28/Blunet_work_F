import React, { useState, useEffect } from 'react';
import { FolderLock, Download, Plus, Search, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Resource } from '../types';

const PUBLIC_RESOURCES: Resource[] = [
  {
    id: 'public-blunet-portfolio',
    name: 'BluNet IT Services - Corporate Service Portfolio',
    description: 'Official corporate service portfolio detailing BluNet IT Services, enterprise solutions, and capabilities.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Company Policy',
    category: { id: 'Company Policy', name: 'Company Policy' },
    fileUploadId: 'public-blunet-portfolio-file',
    fileUpload: {
      id: 'public-blunet-portfolio-file',
      originalName: 'BluNet IT Services - Corporate Service Portfolio.pdf',
      size: 263643,
      storageKey: '/BluNet IT Services - Corporate Service Portfolio.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-blunet-it-services',
    name: 'BluNet IT Services Overview',
    description: 'Comprehensive overview of BluNet IT Services, core technologies, and enterprise service catalog.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Company Policy',
    category: { id: 'Company Policy', name: 'Company Policy' },
    fileUploadId: 'public-blunet-it-services-file',
    fileUpload: {
      id: 'public-blunet-it-services-file',
      originalName: 'BlunetITServices.pdf',
      size: 518545,
      storageKey: '/BlunetITServices.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-blunet-internship',
    name: 'BluNet Internship Program & Policy',
    description: 'Official BluNet Internship program overview, roles, learning paths, and policy document.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Company Policy',
    category: { id: 'Company Policy', name: 'Company Policy' },
    fileUploadId: 'public-blunet-internship-file',
    fileUpload: {
      id: 'public-blunet-internship-file',
      originalName: 'BluNet internship.pdf',
      size: 1319965,
      storageKey: '/BluNet internship.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g1',
    name: 'G1 - Company Policy & Standard Guidelines',
    description: 'Core organizational policies, employee code of conduct, and operational standards.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Company Policy',
    category: { id: 'Company Policy', name: 'Company Policy' },
    fileUploadId: 'public-g1-file',
    fileUpload: {
      id: 'public-g1-file',
      originalName: 'G 1.pdf',
      size: 1454588,
      storageKey: '/G 1.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g2',
    name: 'G2 - IT Infrastructure & Workstation Guidelines',
    description: 'Workstation configuration, network security protocols, and device access rules.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'IT & Security',
    category: { id: 'IT & Security', name: 'IT & Security' },
    fileUploadId: 'public-g2-file',
    fileUpload: {
      id: 'public-g2-file',
      originalName: 'G 2.pdf',
      size: 1111650,
      storageKey: '/G 2.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g3',
    name: 'G3 - Operational Standard Operating Procedures',
    description: 'Comprehensive SOP for internal team operations and project execution workflows.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Operations',
    category: { id: 'Operations', name: 'Operations' },
    fileUploadId: 'public-g3-file',
    fileUpload: {
      id: 'public-g3-file',
      originalName: 'G 3.pdf',
      size: 3812438,
      storageKey: '/G 3.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g4',
    name: 'G4 - Marketing Strategy & Lead Caller Playbook',
    description: 'Lead caller outreach scripts, marketing campaign strategies, and response guidelines.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Marketing',
    category: { id: 'Marketing', name: 'Marketing' },
    fileUploadId: 'public-g4-file',
    fileUpload: {
      id: 'public-g4-file',
      originalName: 'G4.pdf',
      size: 3005785,
      storageKey: '/G4.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g5',
    name: 'G5 - Human Resources Handbook & Leave Policy',
    description: 'Employee benefits, leave structure, attendance policies, and HR compliance rules.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Human Resources',
    category: { id: 'Human Resources', name: 'Human Resources' },
    fileUploadId: 'public-g5-file',
    fileUpload: {
      id: 'public-g5-file',
      originalName: 'G5.pdf',
      size: 2855510,
      storageKey: '/G5.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g6',
    name: 'G6 - Data Protection & Cybersecurity Handbook',
    description: 'Cybersecurity best practices, data handling rules, and credential privacy requirements.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'IT & Security',
    category: { id: 'IT & Security', name: 'IT & Security' },
    fileUploadId: 'public-g6-file',
    fileUpload: {
      id: 'public-g6-file',
      originalName: 'G6.pdf',
      size: 2311655,
      storageKey: '/G6.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'public-g7',
    name: 'G7 - Product Documentation & Service Specs',
    description: 'Technical product documentation, architecture overview, and platform capabilities.',
    version: '1.0',
    visibility: 'ALL',
    categoryId: 'Product Specs',
    category: { id: 'Product Specs', name: 'Product Specs' },
    fileUploadId: 'public-g7-file',
    fileUpload: {
      id: 'public-g7-file',
      originalName: 'G7.pdf',
      size: 1306441,
      storageKey: '/G7.pdf',
      mimeType: 'application/pdf',
      uploadedById: 'system',
      createdAt: new Date().toISOString(),
    },
    uploadedById: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ResourcesPage: React.FC = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [version, setVersion] = useState('1.0');
  const [visibility, setVisibility] = useState('ALL');
  const [uploading, setUploading] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await api.get('/resources', {
        params: {
          categoryId: selectedCategory !== 'ALL' ? selectedCategory : undefined,
          search: search || undefined,
        },
      });
      const apiResources = res.data.success ? res.data.data : [];
      const combined = [...PUBLIC_RESOURCES, ...apiResources];
      const filtered = combined.filter((r: Resource) => {
        const matchesCategory =
          selectedCategory === 'ALL' ||
          r.categoryId === selectedCategory ||
          r.category?.name === selectedCategory ||
          (selectedCategory.toLowerCase().includes('company') &&
            (r.categoryId?.toLowerCase().includes('company') || (r.category?.name && r.category.name.toLowerCase().includes('company'))));
        const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      setResources(filtered);
    } catch (err) {
      console.error('Failed to load resources from API, using public library:', err);
      const filtered = PUBLIC_RESOURCES.filter((r: Resource) => {
        const matchesCategory =
          selectedCategory === 'ALL' ||
          r.categoryId === selectedCategory ||
          r.category?.name === selectedCategory ||
          (selectedCategory.toLowerCase().includes('company') &&
            (r.categoryId?.toLowerCase().includes('company') || (r.category?.name && r.category.name.toLowerCase().includes('company'))));
        const matchesSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
      });
      setResources(filtered);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/resources/categories');
      if (res.data.success && res.data.data.length > 0) {
        setCategories(res.data.data);
      } else {
        setCategories([
          { id: 'Company Policy', name: 'Company Policy' },
          { id: 'IT & Security', name: 'IT & Security' },
          { id: 'Operations', name: 'Operations' },
          { id: 'Marketing', name: 'Marketing' },
          { id: 'Human Resources', name: 'Human Resources' },
          { id: 'Product Specs', name: 'Product Specs' },
        ]);
      }
    } catch (err) {
      setCategories([
        { id: 'Company Policy', name: 'Company Policy' },
        { id: 'IT & Security', name: 'IT & Security' },
        { id: 'Operations', name: 'Operations' },
        { id: 'Marketing', name: 'Marketing' },
        { id: 'Human Resources', name: 'Human Resources' },
        { id: 'Product Specs', name: 'Product Specs' },
      ]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [selectedCategory, search]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !categoryId) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('categoryId', categoryId);
    formData.append('version', version);
    formData.append('visibility', visibility);

    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsUploadOpen(false);
      setName('');
      setDescription('');
      setFile(null);
      fetchResources();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to upload resource.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = (resItem: Resource) => {
    if (resItem.fileUpload?.storageKey?.startsWith('/')) {
      window.open(resItem.fileUpload.storageKey, '_blank');
      return;
    }
    const token = localStorage.getItem('blunet_token');
    const downloadUrl = `${api.defaults.baseURL}/resources/${resItem.id}/download?token=${token}`;
    window.open(downloadUrl, '_blank');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Company Resource Library</h1>
          <p className="text-xs text-slate-500">Access policies, software documentation, and marketing assets</p>
        </div>

        {user?.role === 'ADMIN' && (
          <Button onClick={() => setIsUploadOpen(true)} icon={<Plus className="w-4 h-4" />}>
            Upload New Resource
          </Button>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search resources by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Cards Grid */}
      {resources.length === 0 ? (
        <Card className="text-center py-12">
          <FolderLock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No resources found</h3>
          <p className="text-xs text-slate-400 mt-1">Try refining your search or category filter.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <Card key={res.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="primary">{res.category?.name || 'General'}</Badge>
                  <span className="text-[10px] font-mono font-medium text-slate-400">v{res.version}</span>
                </div>

                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{res.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{res.description || 'No description provided.'}</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <div className="text-[10px] text-slate-400">
                    {formatFileSize(res.fileUpload?.size || 0)} • {res.fileUpload?.originalName}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(res)}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Download
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Resource Modal (Admin Only) */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Company Resource"
        maxWidth="lg"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Resource Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BluNet Security Compliance Guide 2026"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of document content..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Version</label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Visibility</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="EMPLOYEE">Employees Only</option>
                <option value="MARKETING_HEAD">Marketing Head Only</option>
                <option value="ADMIN">Admin Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Select File (PDF, DOCX, XLSX, ZIP)</label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={uploading}>
              Upload File
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
