import React, { useState } from 'react';
import { FileText, Plus, Download, AlertCircle, Check, Loader2 } from 'lucide-react';
import api from '../../../services/api.js';

const MyDocuments = ({ employee, onRefresh }) => {
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);
    setLoading(true);

    if (!docName || !docUrl) {
      setUploadError('Document name and secure URL are required.');
      setLoading(false);
      return;
    }

    try {
      await api.post(`/api/v1/hr/employees/${employee._id}/documents`, {
        name: docName,
        url: docUrl
      });
      setUploadSuccess(true);
      setDocName('');
      setDocUrl('');
      if (onRefresh) onRefresh();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Failed to attach document.');
    } finally {
      setLoading(false);
    }
  };

  const docs = employee?.documents || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 font-sans">My Documents Directory</h2>
        <p className="text-xs text-gray-500 font-medium mt-1">Manage, audit, and attach employee documents and verification certificates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Documents List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
            Attached Files Archive
          </div>
          
          {docs.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs font-semibold flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-gray-300" />
              <span>No documents attached to your employee profile yet.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {docs.map((doc) => (
                <div key={doc._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{doc.name}</p>
                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                        Uploaded on: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="View Document"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Form */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold text-xs uppercase tracking-wider text-gray-700">
            Attach New Document
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs font-medium text-gray-700">
            {uploadError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[11px] font-semibold flex items-start gap-2">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Document attached successfully!</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Document Label</label>
              <input
                type="text"
                placeholder="e.g. Identity Card, Contract"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-500">Document Secure URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg py-2.5 font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              <span>Attach File</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
