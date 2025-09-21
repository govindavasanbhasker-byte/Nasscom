import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { FileText, Eye, Download, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig = {
  uploaded: { color: "bg-slate-100 text-slate-700", icon: Clock },
  processing: { color: "bg-blue-100 text-blue-700", icon: Clock },
  analyzed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
  redacted: { color: "bg-purple-100 text-purple-700", icon: CheckCircle },
  exported: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle }
};

export default function RecentDocuments({ documents, isLoading, onRefresh }) {
  if (isLoading) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-900">Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-lg">
                <Skeleton className="w-10 h-10 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="border-b border-slate-100">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-slate-900">Recent Documents</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {documents.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <h3 className="font-semibold text-slate-700 mb-2">No documents yet</h3>
              <p className="text-slate-500 mb-4">Upload your first document to start protecting sensitive information</p>
              <Link to={createPageUrl("Upload")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </Link>
            </div>
          ) : (
            documents.slice(0, 8).map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-slate-25 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-slate-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{doc.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-slate-500">
                        {format(new Date(doc.created_date), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      {doc.detected_pii && doc.detected_pii.length > 0 && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-amber-600 font-medium">
                            {doc.detected_pii.length} PII detected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={statusConfig[doc.status].color}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </Badge>
                    
                    <div className="flex gap-1">
                      <Link to={createPageUrl(`Documents?id=${doc.id}`)}>
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      {doc.redacted_file_url && (
                        <Button variant="ghost" size="icon" className="hover:bg-slate-100">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}