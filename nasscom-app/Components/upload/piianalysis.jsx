import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  Shield,
  User,
  Mail,
  Phone,
  CreditCard
} from "lucide-react";

const piiIcons = {
  name: User,
  email: Mail,
  phone: Phone,
  ssn: CreditCard,
  credit_card: CreditCard,
  address: AlertTriangle,
  date_of_birth: User,
  medical_id: Shield,
  license_number: CreditCard,
  other: AlertTriangle
};

const riskColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200"
};

export default function PiiAnalysis({ analysis, fileName, onViewDocument }) {
  const { detected_pii = [], risk_level = "low", summary = "" } = analysis;
  
  const piiByType = detected_pii.reduce((acc, pii) => {
    acc[pii.type] = (acc[pii.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Analysis Complete
          </CardTitle>
          <Badge className={`${riskColors[risk_level]} border font-medium`}>
            {risk_level.toUpperCase()} RISK
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">{fileName}</h3>
          {summary && (
            <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">{summary}</p>
          )}
        </div>

        {detected_pii.length > 0 ? (
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Sensitive Information Detected ({detected_pii.length} items)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {Object.entries(piiByType).map(([type, count]) => {
                const Icon = piiIcons[type] || AlertTriangle;
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-slate-700 capitalize">
                        {type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {count}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <Shield className="w-4 h-4" />
                <span className="font-semibold">Security Alert</span>
              </div>
              <p className="text-red-700 text-sm">
                This document contains sensitive personal information that should be redacted before sharing. 
                Review the detected items and apply appropriate redactions.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
            <h3 className="font-semibold text-slate-900 mb-2">No Sensitive Information Detected</h3>
            <p className="text-slate-600">This document appears to be safe for sharing without redaction.</p>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-slate-100">
          <Button 
            onClick={onViewDocument}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            View & Edit Document
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}