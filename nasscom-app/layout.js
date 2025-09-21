import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Shield, Upload, FileText, Settings, BarChart3, Power } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: BarChart3 },
  { title: "Upload Document", url: "/upload", icon: Upload },
  { title: "Documents", url: "/Documents", icon: FileText },
];

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        <style jsx>{`
          :root {
            --primary: 215 25% 27%;
            --primary-foreground: 210 40% 98%;
            --secondary: 210 40% 96%;
            --secondary-foreground: 215 25% 27%;
            --accent: 210 40% 93%;
            --accent-foreground: 215 25% 27%;
          }
        `}</style>

        {/* Sidebar */}
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-100 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">PrivGuard</h2>
                <p className="text-sm text-slate-500">Document Privacy Protection</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-xl ${
                          router.pathname === item.url
                            ? "bg-blue-50 text-blue-700 shadow-sm"
                            : "text-slate-600"
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                  <span className="text-slate-600 font-semibold text-sm">U</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm truncate">Compliance Team</p>
                  <p className="text-xs text-slate-500 truncate">Document Security</p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
                <Power className="w-4 h-4" />
              </button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-slate-900">PrivGuard</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
          <footer className="bg-white border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} PrivGuard. All rights reserved.
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
}
