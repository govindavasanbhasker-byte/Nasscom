import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Search, 
  Shield, 
  CheckCircle,
  Loader2 
} from "lucide-react";

const stepConfig = {
  uploading: {
    title: "Uploading Document",
    description: "Securely uploading your file...",
    icon: Upload
  },
  creating_record: {
    title: "Creating Record",
    description: "Setting up document tracking...",
    icon: FileText
  },
  extracting_content: {
    title: "Extracting Content",
    description: "Reading document content...",
    icon: Search
  },
  analyzing_pii: {
    title: "Analyzing for PII",
    description: "Scanning for sensitive information...",
    icon: Shield
  },
  finalizing: {
    title: "Finalizing Analysis",
    description: "Preparing results...",
    icon: CheckCircle
  }
};

export default function ProcessingStatus({ currentStep, progress, fileName }) {
  const config = stepConfig[currentStep];
  const Icon = config?.icon || Loader2;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Icon className={`w-5 h-5 ${currentStep === "finalizing" ? "text-green-600" : "text-blue-600"}`} />
            Processing Document
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {Math.round(progress)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-slate-700">{fileName}</span>
            <span className="text-sm text-slate-500">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-lg ${
            config ? "bg-blue-50 border border-blue-200" : "bg-slate-50"
          }`}>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
              {config && currentStep !== "finalizing" ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Icon className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-slate-900">{config?.title || "Processing"}</p>
              <p className="text-sm text-slate-600">{config?.description || "Working on your document..."}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              Local Processing
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              Privacy Protected
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              Secure Analysis
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}