import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, User, Phone, Mail, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const piiTypeConfig = {
  name: { label: "Names", icon: User, color: "bg-blue-100 text-blue-700" },
  email: { label: "Email Addresses", icon: Mail, color: "bg-green-100 text-green-700" },
  phone: { label: "Phone Numbers", icon: Phone, color: "bg-purple-100 text-purple-700" },
  ssn: { label: "SSN/IDs", icon: CreditCard, color: "bg-red-100 text-red-700" },
  address: { label: "Addresses", icon: AlertTriangle, color: "bg-amber-100 text-amber-700" },
  credit_card: { label: "Credit Cards", icon: CreditCard, color: "bg-red-100 text-red-700" },
  date_of_birth: { label: "Birth Dates", icon: User, color: "bg-orange-100 text-orange-700" },
  other: { label: "Other PII", icon: AlertTriangle, color: "bg-slate-100 text-slate-700" }
};

export default function PiiSummary({ documents, isLoading }) {
  const getPiiStats = () => {
    const stats = {};
    let totalPii = 0;
    
    documents.forEach(doc => {
      if (doc.detected_pii) {
        doc.detected_pii.forEach(pii => {
          stats[pii.type] = (stats[pii.type] || 0) + 1;
          totalPii++;
        });
      }
    });
    
    return { stats, totalPii };
  };

  const { stats, totalPii } = getPiiStats();
  const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);

  if (isLoading) {
    return (
      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle>PII Detection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-8" />
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
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          PII Detection Summary
        </CardTitle>
        {totalPii > 0 && (
          <p className="text-sm text-slate-500">
            {totalPii} sensitive items detected across {documents.filter(d => d.detected_pii && d.detected_pii.length > 0).length} documents
          </p>
        )}
      </CardHeader>
      <CardContent className="p-6">
        {totalPii === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="font-semibold text-slate-700 mb-2">No PII Detected</h3>
            <p className="text-slate-500 text-sm">All processed documents appear to be clean</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedStats.map(([type, count]) => {
              const config = piiTypeConfig[type] || piiTypeConfig.other;
              const percentage = (count / totalPii) * 100;
              
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <config.icon className="w-4 h-4 text-slate-600" />
                      <span className="font-medium text-slate-700">{config.label}</span>
                    </div>
                    <Badge variant="secondary" className={config.color}>
                      {count}
                    </Badge>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold text-sm">Security Recommendation</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                {totalPii > 50 ? "High volume of PII detected. Consider implementing stricter access controls." :
                 totalPii > 20 ? "Moderate PII exposure. Review redaction policies." :
                 "PII levels are manageable. Continue monitoring."}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}