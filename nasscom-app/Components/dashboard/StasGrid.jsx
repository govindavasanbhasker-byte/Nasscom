import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function StatsGrid({ stats, isLoading }) {
  const statItems = [
    {
      title: "Total Documents",
      value: stats.total,
      icon: FileText,
      bgColor: "bg-blue-600",
      description: "Documents uploaded"
    },
    {
      title: "Processed",
      value: stats.processed,
      icon: CheckCircle,
      bgColor: "bg-green-600",
      description: "Analysis complete"
    },
    {
      title: "PII Detected",
      value: stats.piiDetected,
      icon: AlertTriangle,
      bgColor: "bg-amber-600",
      description: "Contains sensitive data"
    },
    {
      title: "Risk Level",
      value: stats.riskLevel.toUpperCase(),
      icon: Shield,
      bgColor: stats.riskLevel === "high" ? "bg-red-600" : stats.riskLevel === "medium" ? "bg-amber-600" : "bg-green-600",
      description: "Current security status"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index} className="shadow-sm border-slate-200 hover:shadow-md transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl ${item.bgColor} bg-opacity-10`}>
                <item.icon className={`w-6 h-6 ${item.bgColor.replace('bg-', 'text-')}`} />
              </div>
              {index === 3 && (
                <Badge 
                  variant="outline"
                  className={`${
                    stats.riskLevel === "high" ? "border-red-200 text-red-700 bg-red-50" :
                    stats.riskLevel === "medium" ? "border-amber-200 text-amber-700 bg-amber-50" :
                    "border-green-200 text-green-700 bg-green-50"
                  }`}
                >
                  {stats.riskLevel}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-slate-900">
                  {typeof item.value === 'number' ? item.value : item.value}
                </p>
              )}
              <p className="font-semibold text-slate-700">{item.title}</p>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}