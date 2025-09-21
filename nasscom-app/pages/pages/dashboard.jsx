
import React, { useState, useEffect } from "react";
import { Document } from "@/entities/Document";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  FileText, 
  Upload, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentDocuments from "../components/dashboard/RecentDocuments";
import PiiSummary from "../components/dashboard/PiiSummary";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    processed: 0,
    piiDetected: 0,
    riskLevel: "low"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const docs = await Document.filter({ user_email: user.email }, "-created_date", 20);
      setDocuments(docs);
      
      // Calculate stats
      const processed = docs.filter(d => d.status === "analyzed" || d.status === "redacted").length;
      const withPii = docs.filter(d => d.detected_pii && d.detected_pii.length > 0).length;
      
      setStats({
        total: docs.length,
        processed,
        piiDetected: withPii,
        riskLevel: withPii > docs.length * 0.7 ? "high" : withPii > docs.length * 0.3 ? "medium" : "low"
      });
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Security Dashboard</h1>
            <p className="text-slate-600">Monitor and protect sensitive information across your documents</p>
          </div>
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm px-6 py-3 text-base font-medium">
              <Upload className="w-5 h-5 mr-2" />
              Upload Document
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} isLoading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Documents - Takes 2 columns */}
          <div className="lg:col-span-2">
            <RecentDocuments 
              documents={documents}
              isLoading={isLoading}
              onRefresh={loadData}
            />
          </div>

          {/* PII Summary - Takes 1 column */}
          <div className="space-y-6">
            <PiiSummary documents={documents} isLoading={isLoading} />
            
            {/* Quick Actions */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to={createPageUrl("Upload")} className="block">
                  <Button variant="outline" className="w-full justify-start hover:bg-slate-50">
                    <Upload className="w-4 h-4 mr-3" />
                    Process New Document
                  </Button>
                </Link>
                <Link to={createPageUrl("Documents")} className="block">
                  <Button variant="outline" className="w-full justify-start hover:bg-slate-50">
                    <FileText className="w-4 h-4 mr-3" />
                    View All Documents
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

