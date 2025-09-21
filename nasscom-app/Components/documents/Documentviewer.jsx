
import React, { useState } from 'react';
import { Document } from "@/entities/Document";
import { InvokeLLM, GenerateImage } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Download, 
  Shield, 
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function DocumentViewer({ document, onBack, onUpdate }) {
  const [redactionMode, setRedactionMode] = useState(false);
  const [selectedPii, setSelectedPii] = useState(new Set());
  const [isRedacting, setIsRedacting] = useState(false);
  const [showRedactedView, setShowRedactedView] = useState(false);

  const togglePiiSelection = (index) => {
    const newSelected = new Set(selectedPii);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedPii(newSelected);
  };

  const handleRedaction = async () => {
    setIsRedacting(true);
    
    try {
      const selectedItems = document.detected_pii.filter((_, index) => selectedPii.has(index));
      
      // Create redacted version using AI
      const redactionResult = await InvokeLLM({
        prompt: `Create a redacted version of the document text by replacing the following PII items with appropriate redactions:

        Original text: "${document.metadata?.extracted_text || ''}"
        
        Items to redact:
        ${selectedItems.map(item => `- ${item.type}: "${item.value}"`).join('\n')}
        
        Replace each PII item with [REDACTED] or a more specific redaction like [REDACTED-NAME], [REDACTED-SSN], etc.
        Keep all other text exactly the same.
        
        Return the fully redacted text.`,
        response_json_schema: {
          type: "object",
          properties: {
            redacted_text: { type: "string" },
            redaction_summary: { type: "string" }
          }
        }
      });

      // Update document status - NO DOWNLOAD HERE
      const updatedDoc = await Document.update(document.id, {
        status: "redacted",
        detected_pii: document.detected_pii.map((pii, index) => ({
          ...pii,
          redacted: selectedPii.has(index)
        })),
        metadata: {
          ...document.metadata,
          redacted_text: redactionResult.redacted_text,
          redaction_summary: redactionResult.redaction_summary,
          redacted_items: selectedItems,
          redaction_date: new Date().toISOString()
        }
      });

      // Update the local document state
      Object.assign(document, updatedDoc);
      
      // Clean up UI state
      setRedactionMode(false);
      setSelectedPii(new Set());
      setShowRedactedView(true);
      
      // Refresh parent component data
      if (onUpdate) {
        onUpdate();
      }
      
    } catch (error) {
      console.error("Redaction error:", error);
    } finally {
      setIsRedacting(false);
    }
  };

  const handleDownload = () => {
    const fileUrl = showRedactedView && document.metadata?.redacted_text 
      ? null // We'll create a text download for redacted version
      : document.file_url;
      
    if (showRedactedView && document.metadata?.redacted_text) {
      // Download redacted text as a file
      const blob = new Blob([document.metadata.redacted_text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.name.replace(/\.[^/.]+$/, '')}_REDACTED.txt`;
      window.document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } else if (fileUrl) {
      // Download original file
      const a = window.document.createElement('a');
      a.href = fileUrl;
      a.download = document.name;
      a.target = '_blank';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
  };

  const isRedacted = document.status === "redacted";

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{document.name}</h1>
              <p className="text-slate-600">Document Analysis & Redaction</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isRedacted && (
              <Button
                variant={showRedactedView ? "default" : "outline"}
                onClick={() => setShowRedactedView(!showRedactedView)}
                className={showRedactedView ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {showRedactedView ? <Eye className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                {showRedactedView ? "Show Original" : "Show Redacted"}
              </Button>
            )}
            
            {document.detected_pii && document.detected_pii.length > 0 && !isRedacted && (
              <Button
                variant={redactionMode ? "default" : "outline"}
                onClick={() => setRedactionMode(!redactionMode)}
                className={redactionMode ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {redactionMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {redactionMode ? "Exit Redaction" : "Redaction Mode"}
              </Button>
            )}
            
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download {showRedactedView ? "Redacted" : "Original"}
            </Button>
          </div>
        </div>

        {isRedacted && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              This document has been processed for redaction. You can toggle between the original and redacted versions using the button above.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Document Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {showRedactedView ? "Redacted Document" : "Document Preview"}
                    {showRedactedView && <Badge className="ml-2 bg-green-100 text-green-700">REDACTED</Badge>}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50">
                      {document.file_type.toUpperCase()}
                    </Badge>
                    {document.file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(document.file_url, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in New Tab
                      </Button>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showRedactedView && document.metadata?.redacted_text ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Redacted Content
                    </h3>
                    <div className="bg-white border border-green-300 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <pre className="whitespace-pre-wrap text-sm text-slate-700 font-mono leading-relaxed">
                        {document.metadata.redacted_text}
                      </pre>
                    </div>
                    <p className="text-green-700 text-sm mt-3">
                      <strong>Redaction Summary:</strong> {document.metadata.redaction_summary || "PII items have been replaced with redaction markers."}
                    </p>
                  </div>
                ) : document.file_url ? (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <iframe
                      src={document.file_url}
                      className="w-full h-96 border border-slate-200 rounded"
                      title="Document Preview"
                    />
                    <p className="text-xs text-slate-500 mt-2 text-center">
                      Original document preview. {isRedacted ? "Use the 'Show Redacted' button to view the processed version." : "Apply redactions to protect sensitive information."}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    Document preview not available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* PII Analysis Panel */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Detected PII ({document.detected_pii?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!document.detected_pii || document.detected_pii.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 mx-auto text-green-500 mb-4" />
                    <p className="text-slate-600">No sensitive information detected</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {redactionMode && !isRedacted && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-purple-700 font-medium text-sm mb-2">
                          Select items to redact:
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-purple-600">
                            {selectedPii.size} of {document.detected_pii.length} selected
                          </span>
                          <Button
                            size="sm"
                            onClick={handleRedaction}
                            disabled={selectedPii.size === 0 || isRedacting}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            {isRedacting ? "Processing..." : "Apply Redaction"}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {document.detected_pii.map((pii, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg transition-all ${
                          pii.redacted 
                            ? "border-red-300 bg-red-50"
                            : redactionMode && !isRedacted
                              ? selectedPii.has(index)
                                ? "border-purple-300 bg-purple-50 cursor-pointer"
                                : "border-slate-200 hover:border-purple-200 cursor-pointer"
                              : "border-slate-200"
                        }`}
                        onClick={() => redactionMode && !isRedacted && togglePiiSelection(index)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {pii.type.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                          {pii.redacted && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              REDACTED
                            </Badge>
                          )}
                          {redactionMode && !isRedacted && (
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedPii.has(index) 
                                ? "bg-purple-600 border-purple-600" 
                                : "border-slate-300"
                            }`}>
                              {selectedPii.has(index) && (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              )}
                            </div>
                          )}
                        </div>
                        <p className={`text-sm font-medium truncate ${
                          pii.redacted ? "line-through text-red-600" : "text-slate-900"
                        }`}>
                          {pii.value}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Confidence: {Math.round(pii.confidence * 100)}%
                        </p>
                        {pii.location && (
                          <p className="text-xs text-slate-500">
                            Context: {pii.location}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {document.metadata && (
              <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-slate-900">Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {document.metadata.risk_level && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Risk Level</span>
                      <Badge className={
                        document.metadata.risk_level === "high" ? "bg-red-100 text-red-800" :
                        document.metadata.risk_level === "medium" ? "bg-amber-100 text-amber-800" :
                        "bg-green-100 text-green-800"
                      }>
                        {document.metadata.risk_level.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                  
                  {document.metadata.analysis_summary && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">Summary:</span>
                      <p className="text-sm text-slate-600 mt-1">
                        {document.metadata.analysis_summary}
                      </p>
                    </div>
                  )}

                  {isRedacted && document.metadata.redaction_date && (
                    <div>
                      <span className="text-sm font-medium text-slate-700">Redacted:</span>
                      <p className="text-sm text-slate-600 mt-1">
                        {new Date(document.metadata.redaction_date).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
