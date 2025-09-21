
import React, { useState, useEffect, useCallback } from "react";
import { Document } from "@/entities/Document";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  Filter,
  Eye,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

import DocumentViewer from "../components/documents/DocumentViewer";
import FilterPanel from "../components/documents/FilterPanel";

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    status: "all",
    riskLevel: "all",
    fileType: "all"
  });

  const loadDocuments = async () => {
    try {
      const user = await User.me(); // Fetch the current user
      // Filter documents based on the user's email
      const docs = await Document.filter({ user_email: user.email }, "-created_date");
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = documents;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (activeFilters.status !== "all") {
      filtered = filtered.filter(doc => doc.status === activeFilters.status);
    }

    // Risk level filter
    if (activeFilters.riskLevel !== "all") {
      filtered = filtered.filter(doc => 
        doc.metadata?.risk_level === activeFilters.riskLevel
      );
    }

    // File type filter
    if (activeFilters.fileType !== "all") {
      filtered = filtered.filter(doc => doc.file_type === activeFilters.fileType);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, activeFilters]); // Dependencies for useCallback

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Now depends on the memoized applyFilters function

  const statusConfig = {
    uploaded: { color: "bg-slate-100 text-slate-700", icon: Clock },
    processing: { color: "bg-blue-100 text-blue-700", icon: Clock },
    analyzed: { color: "bg-green-100 text-green-700", icon: CheckCircle },
    redacted: { color: "bg-purple-100 text-purple-700", icon: CheckCircle },
    exported: { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle }
  };

  if (selectedDocument) {
    return (
      <DocumentViewer 
        document={selectedDocument}
        onBack={() => setSelectedDocument(null)}
        onUpdate={loadDocuments}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Document Library</h1>
            <p className="text-slate-600 mt-1">Manage and review your processed documents</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <FilterPanel 
            activeFilters={activeFilters}
            onFiltersChange={setActiveFilters}
            documents={documents}
          />
        </div>

        {/* Documents Grid */}
        <div className="grid gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </Card>
            ))
          ) : filteredDocuments.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No Documents Found</h3>
              <p className="text-slate-500">
                {searchQuery || Object.values(activeFilters).some(f => f !== "all") 
                  ? "Try adjusting your search or filters"
                  : "Upload your first document to get started"
                }
              </p>
            </Card>
          ) : (
            filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-all duration-200 border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-slate-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 truncate">{doc.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-slate-500">
                          {format(new Date(doc.created_date), "MMM d, yyyy")}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {doc.file_type.toUpperCase()}
                        </Badge>
                        {doc.detected_pii && doc.detected_pii.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-xs text-amber-600">
                              {doc.detected_pii.length} PII items
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
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setSelectedDocument(doc)}
                          className="hover:bg-slate-100"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {doc.file_url && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => window.open(doc.file_url, '_blank')}
                            className="hover:bg-slate-100"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
