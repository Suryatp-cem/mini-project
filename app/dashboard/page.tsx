"use client";

import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText,
    CheckCircle,
    Clock,
    PlusSquare,
    Search,
    History,
    LogOut,
    Bell,
    ArrowRight,
    ChevronRight,
    MoreVertical,
    Settings,
    HelpCircle,
    AlertCircle,
    User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const DashboardPage = () => {
    const stats = [
        {
            title: "Total Applications",
            value: 12,
            icon: FileText,
            color: "text-slate-900",
            progress: 75,
            description: "Across all categories"
        },
        {
            title: "Approved Requests",
            value: 8,
            icon: CheckCircle,
            color: "text-indigo-600",
            progress: 66,
            description: "Successful applications"
        },
        {
            title: "Pending Reviews",
            value: 4,
            icon: Clock,
            color: "text-amber-600",
            progress: 33,
            description: "Awaiting final approval"
        },
    ];

    const quickActions = [
        { title: "New Application", icon: PlusSquare, href: "/apply" },
        { title: "Check Status", icon: Search, href: "/status" },
        { title: "History", icon: History, href: "/history" },
    ];

    const recentApplications = [
        { type: "Sick Leave", duration: "2 days", status: "Approved", date: "Oct 24, 2023", priority: "Normal" },
        { type: "Conference", duration: "1 day", status: "Pending", date: "Oct 26, 2023", priority: "High" },
        { type: "Personal", duration: "3 days", status: "Rejected", date: "Oct 20, 2023", priority: "Low" },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {/* Top Navigation */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <span className="text-white font-bold text-lg">🎓</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Portal</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        <Button variant="ghost" className="text-slate-600 font-medium px-4 h-9">Dashboard</Button>
                        <Button variant="ghost" className="text-slate-500 font-medium px-4 h-9 hover:text-indigo-600">Applications</Button>
                        <Button variant="ghost" className="text-slate-500 font-medium px-4 h-9 hover:text-indigo-600">Schedule</Button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 relative rounded-full">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="pl-1 pr-2 rounded-full hover:bg-slate-100 h-10 gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">AJ</AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 leading-none">Alex Johnson</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2"><User className="w-4 h-4" /> Profile</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><Settings className="w-4 h-4" /> Settings</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><HelpCircle className="w-4 h-4" /> Support</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 gap-2 focus:text-red-600"><LogOut className="w-4 h-4" /> Sign out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                        <p className="text-slate-500 mt-2 text-lg">Detailed insights and management for your leave applications.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 shadow-sm border-slate-200">
                            <History className="w-4 h-4" /> Export Report
                        </Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 shadow-indigo-200">
                            <PlusSquare className="w-4 h-4" /> New Request
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                        <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                        <TabsTrigger value="applications" className="rounded-lg px-6">Active Applications</TabsTrigger>
                        <TabsTrigger value="documents" className="rounded-lg px-6">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {stats.map((stat, i) => (
                                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                                        <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between text-xs font-semibold">
                                                <span className="text-slate-400 uppercase">Usage</span>
                                                <span className="text-slate-900">{stat.progress}%</span>
                                            </div>
                                            <Progress value={stat.progress} className="h-1.5" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Main Grid: Activity & Info */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Activity Table */}
                            <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                                <CardHeader className="border-b bg-white/50 px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold">Recent Applications</CardTitle>
                                            <CardDescription>A summary of your most recent leave requests.</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 px-4">See All</Button>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-0">
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Leave Type</TableHead>
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Duration</TableHead>
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Date</TableHead>
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentApplications.map((app, i) => (
                                                <TableRow key={i} className="group border-slate-50">
                                                    <TableCell className="px-8 py-5">
                                                        <span className="font-bold text-slate-800">{app.type}</span>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            {app.priority === "High" && <Badge variant="destructive" className="h-1.5 w-1.5 rounded-full p-0 flex shrink-0" />}
                                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{app.priority} Priority</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-5 text-slate-500 font-medium tabular-nums">{app.duration}</TableCell>
                                                    <TableCell className="px-8 py-5 text-slate-400 font-medium tabular-nums">{app.date}</TableCell>
                                                    <TableCell className="px-8 py-5 text-right">
                                                        <Badge
                                                            variant={app.status === "Approved" ? "default" : app.status === "Pending" ? "secondary" : "destructive"}
                                                            className={`rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-tight ${app.status === "Approved" ? "bg-emerald-50 text-emerald-600" :
                                                                app.status === "Pending" ? "bg-amber-50 text-amber-600" :
                                                                    "bg-rose-50 text-rose-600"
                                                                } border-0`}
                                                        >
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>

                            {/* Sidebar: Info & Quick Actions */}
                            <div className="space-y-8">
                                {/* Profile Card Mini */}
                                <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none"></div>
                                    <CardContent className="p-8">
                                        <Avatar className="h-14 w-14 mb-4 border-2 border-white/20 shadow-xl">
                                            <AvatarFallback className="bg-white text-indigo-900 font-bold">AJ</AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-bold">Alex Johnson</h3>
                                        <p className="text-indigo-200 text-sm">Computer Science Department</p>
                                        <Separator className="my-6 bg-white/10" />
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-indigo-300">Student ID</span>
                                                <span className="tabular-nums">#2024-CS102</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-indigo-300">Attendance</span>
                                                <span className="tabular-nums text-emerald-400">92.4%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Help Card */}
                                <Card className="border-none shadow-sm bg-white p-6">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="bg-amber-50 p-2 rounded-lg">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900">Need Assistance?</h4>
                                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">Our support team is available 24/7 for technical issues or leave policy clarifications.</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                                        Open Support Ticket
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Sleek Minimal Footer */}
            <footer className="mt-auto border-t bg-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-900 p-1 rounded-md">
                            <span className="text-white font-bold text-xs px-1">X</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">Leave Portal</span>
                    </div>

                    <div className="flex gap-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Accessibility</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Cookies</a>
                    </div>

                    <div className="text-xs text-slate-400 font-medium">
                        &copy; 2024 University Administration System.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;
