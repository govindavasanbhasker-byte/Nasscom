import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Image, Shield } from "lucide-react";

export default function FileUploadZone({ onFileSelect, disabled }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      onFileSelect(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={`border-2 border-dashed border-slate-300 rounded-xl p-12 text-center transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
      }`}
      onClick={!disabled ? handleClick : undefined}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.tiff"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
      />
      
      <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
        <Upload className="w-10 h-10 text-slate-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        Drop your document here
      </h3>
      <p className="text-slate-600 mb-6">
        or click to browse your files
      </p>
      
      <Button 
        variant="outline" 
        disabled={disabled}
        className="mb-6 hover:bg-blue-50 hover:border-blue-400"
      >
        <FileText className="w-4 h-4 mr-2" />
        Choose File
      </Button>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-500">
        <div className="flex items-center justify-center gap-1">
          <FileText className="w-4 h-4" />
          PDF
        </div>
        <div className="flex items-center justify-center gap-1">
          <Image className="w-4 h-4" />
          JPEG
        </div>
        <div className="flex items-center justify-center gap-1">
          <Image className="w-4 h-4" />
          PNG
        </div>
        <div className="flex items-center justify-center gap-1">
          <Image className="w-4 h-4" />
          TIFF
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center justify-center gap-2 text-green-700">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-medium">100% Secure Processing</span>
        </div>
        <p className="text-xs text-green-600 mt-1">
          All documents are processed locally. No data is shared externally.
        </p>
      </div>
    </div>
  );
}