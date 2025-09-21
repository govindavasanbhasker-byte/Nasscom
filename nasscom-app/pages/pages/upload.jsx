
import React, { useState, useCallback, useRef } from "react";
import { Document } from "@/entities/Document";
import { User } from "@/entities/User";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload as UploadIcon, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import FileUploadZone from "../components/upload/FileUploadZone";
import ProcessingStatus from "../components/upload/ProcessingStatus";
import PiiAnalysis from "../components/upload/PiiAnalysis";

export default function Upload() {
  const navigate = useNavigate();
  const [currentFile, setCurrentFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("idle");
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [documentId, setDocumentId] = useState(null);

  const processDocument = async (file) => {
    setProcessing(true);
    setProgress(0);
    setCurrentStep("uploading");
    setError(null);

    try {
      // Step 1: Upload file
      setProgress(20);
      const { file_url } = await UploadFile({ file });
      
      // Step 2: Create document record
      setProgress(30);
      setCurrentStep("creating_record");
      
      const user = await User.me();
      const doc = await Document.create({
        name: file.name,
        file_url,
        file_type: file.type.includes('pdf') ? 'pdf' : file.type.split('/')[1],
        status: "processing",
        user_email: user.email
      });
      
      setDocumentId(doc.id);
      
      // Step 3: Extract text content
      setProgress(50);
      setCurrentStep("extracting_content");
      
      const extractedData = await ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            extracted_text: {
              type: "string",
              description: "All text content from the document"
            }
          }
        }
      });

      // Step 4: Analyze for PII
      setProgress(70);
      setCurrentStep("analyzing_pii");
      
      const piiAnalysis = await InvokeLLM({
        prompt: `Analyze the following document text for personally identifiable information (PII) and sensitive data. 
        
        Document text: "${extractedData.output?.extracted_text || ''}"
        
        Identify and extract any instances of:
        - Names (full names, first/last names)
        - Email addresses
        - Phone numbers
        - Social Security Numbers (SSN)
        - Addresses (physical addresses)
        - Date of birth
        - Credit card numbers
        - Medical ID numbers
        - License numbers
        - Any other sensitive personal information
        
        For each detected PII item, provide:
        1. The type of PII
        2. The actual value found
        3. Confidence level (0.0 to 1.0)
        4. Context/location in document
        
        Be thorough and err on the side of caution - it's better to flag potential PII than miss it.`,
        response_json_schema: {
          type: "object",
          properties: {
            detected_pii: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["ssn", "phone", "email", "address", "name", "date_of_birth", "credit_card", "medical_id", "license_number", "other"]
                  },
                  value: { type: "string" },
                  confidence: { type: "number" },
                  location: { type: "string" },
                  redacted: { type: "boolean" }
                }
              }
            },
            risk_level: {
              type: "string",
              enum: ["low", "medium", "high"]
            },
            summary: {
              type: "string",
              description: "Brief summary of PII found"
            }
          }
        }
      });

      // Step 5: Update document with analysis
      setProgress(90);
      setCurrentStep("finalizing");
      
      await Document.update(doc.id, {
        status: "analyzed",
        detected_pii: piiAnalysis.detected_pii || [],
        metadata: {
          extracted_text: extractedData.output?.extracted_text,
          analysis_summary: piiAnalysis.summary,
          risk_level: piiAnalysis.risk_level,
          processed_at: new Date().toISOString()
        }
      });

      setProgress(100);
      setCurrentStep("complete");
      setAnalysis(piiAnalysis);
      
    } catch (error) {
      console.error("Processing error:", error);
      setError("Failed to process document. Please try again.");
      setCurrentStep("error");
    } finally {
      setProcessing(false);
    }
  };

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      setCurrentFile(files[0]);
      processDocument(files[0]);
    }
  };

  const handleRetry = () => {
    if (currentFile) {
      processDocument(currentFile);
    }
  };

  const handleViewDocument = () => {
    navigate(createPageUrl(`Documents?id=${documentId}`));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Upload & Analyze Document</h1>
            <p className="text-slate-600 mt-1">Secure PII detection and redaction</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {currentStep === "idle" && (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <FileText className="w-5 h-5" />
                  Select Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone 
                  onFileSelect={handleFileSelect}
                  disabled={processing}
                />
              </CardContent>
            </Card>
          )}

          {processing && (
            <ProcessingStatus 
              currentStep={currentStep}
              progress={progress}
              fileName={currentFile?.name}
            />
          )}

          {currentStep === "complete" && analysis && (
            <PiiAnalysis 
              analysis={analysis}
              fileName={currentFile?.name}
              onViewDocument={handleViewDocument}
            />
          )}

          {currentStep === "error" && (
            <Card className="border-red-200 shadow-sm">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h3 className="font-semibold text-slate-900 mb-2">Processing Failed</h3>
                <p className="text-slate-600 mb-4">There was an error processing your document.</p>
                <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
