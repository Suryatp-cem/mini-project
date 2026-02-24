"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    User,
    Shield,
    Users,
    Activity,
    MessageSquare,
    AlertTriangle,
    Plus,
    XCircle,
    Loader2,
    ShieldCheck,
    GraduationCap,
    School,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
    getAllUsers,
    updateUserRole,
    getApplicationStats,
    getRecentApplications,
    updateApplicationStatus,
    createAnnouncement,
    getAnnouncements,
    getSystemAnalytics,
    getAuditLogs,
    createApplication,
    deleteAnnouncement
} from "@/lib/actions";
import { cn } from '@/lib/utils';

const AdminDashboard = () => {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
    const [analytics, setAnalytics] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    // Form states
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: "normal" });
    const [leaveForm, setLeaveForm] = useState({ type: "Personal", duration: "1 day", priority: "normal", reason: "" });
    const [decisionApp, setDecisionApp] = useState<any>(null);
    const [decisionType, setDecisionType] = useState<string>("");
    const [decisionComment, setDecisionComment] = useState<string>("");
    const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);

    const userRole = (session?.user as any)?.role || "student";
    const userName = session?.user?.name || "Administrator";
    const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

    useEffect(() => {
        if (!isPending && (!session || userRole !== "admin")) {
            router.push(session ? "/dashboard" : "/sign-in");
        }
    }, [session, isPending, router, userRole]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, appsData, usersData, announcementsData, analyticsData, logsData] = await Promise.all([
                getApplicationStats(),
                getRecentApplications(20),
                getAllUsers(),
                getAnnouncements(),
                getSystemAnalytics(),
                getAuditLogs()
            ]);
            setStats(statsData);
            setApplications(appsData);
            setUsers(usersData);
            setAnnouncements(announcementsData);
            setAnalytics(analyticsData);
            setAuditLogs(logsData);
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session && userRole === "admin") {
            fetchData();
        }
    }, [session, userRole]);

    const handleAction = async (action: () => Promise<any>, successMsg: string, errorMsg: string) => {
        try {
            await action();
            toast.success(successMsg);
            fetchData();
        } catch (err) {
            toast.error(errorMsg);
        }
    };

    const handleCreateAnnouncement = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await handleAction(
            () => createAnnouncement(newAnnouncement),
            "Announcement published",
            "Failed to publish"
        );
        setNewAnnouncement({ title: "", content: "", priority: "normal" });
        setIsSubmitting(false);
    };

    const handleLeaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await handleAction(
            () => createApplication(leaveForm),
            "Request submitted",
            "Failed to submit"
        );
        setLeaveForm({ type: "Personal", duration: "1 day", priority: "normal", reason: "" });
        setIsSubmitting(false);
    };

    const handleDecision = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!decisionApp) return;
        setIsSubmitting(true);
        await handleAction(
            () => updateApplicationStatus(decisionApp.id, decisionType, decisionComment),
            `Application ${decisionType} successfully`,
            "Failed to update application"
        );
        setIsDecisionDialogOpen(false);
        setDecisionApp(null);
        setDecisionComment("");
        setIsSubmitting(false);
    };

    const openDecisionDialog = (app: any, type: string) => {
        setDecisionApp(app);
        setDecisionType(type);
        setDecisionComment("");
        setIsDecisionDialogOpen(true);
    };

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => router.push("/sign-in"),
            },
        });
    };

    if (isPending || !session || userRole !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-violet-600 animate-spin" />
                    <p className="text-zinc-500 font-bold italic uppercase text-xs tracking-widest">Initialising Admin Console</p>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: "Total Applications",
            value: stats.total,
            icon: FileText,
            color: "text-zinc-900 border-violet-200",
            progress: 100,
            description: "All student requests",
            accent: "bg-violet-600"
        },
        {
            title: "Approved Requests",
            value: stats.approved,
            icon: CheckCircle,
            color: "text-emerald-600 border-emerald-100",
            progress: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
            description: "Successfully processed",
            accent: "bg-emerald-500"
        },
        {
            title: "Pending Reviews",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-600 border-amber-100",
            progress: stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0,
            description: "Awaiting approval",
            accent: "bg-amber-500"
        },
    ];

    return (
        <div className="min-h-screen bg-zinc-50/50 flex flex-col font-sans">
            {/* Top Navigation (Aligned with Student Dashboard) */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                        <div className="bg-violet-600 p-1.5 rounded-lg shadow-lg shadow-violet-600/20">
                            <span className="text-white font-bold text-lg">🛡️</span>
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-zinc-900">Admin<span className="text-violet-600 font-bold">Portal</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'overview' ? "text-violet-600 bg-violet-50" : "text-zinc-500 hover:text-violet-600")} onClick={() => setActiveTab('overview')}>Overview</Button>
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'users' ? "text-violet-600 bg-violet-50" : "text-zinc-500 hover:text-violet-600")} onClick={() => setActiveTab('users')}>Users</Button>
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'apps' ? "text-violet-600 bg-violet-50" : "text-zinc-500 hover:text-violet-600")} onClick={() => setActiveTab('apps')}>Pipeline</Button>
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'news' ? "text-violet-600 bg-violet-50" : "text-zinc-500 hover:text-violet-600")} onClick={() => setActiveTab('news')}>News feed</Button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 bg-violet-50 text-violet-700 font-black uppercase text-[10px] px-3 py-1 border border-violet-100 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Root access
                    </Badge>

                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-900 relative rounded-full hover:bg-zinc-100">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-violet-600 rounded-full border-2 border-white"></span>
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="pl-1 pr-2 rounded-full hover:bg-zinc-100 h-10 gap-2 transition-all">
                                <Avatar className="h-8 w-8 border-2 border-zinc-100">
                                    <AvatarFallback className="bg-violet-100 text-violet-700 font-black text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-black text-zinc-900 leading-none">{userName}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Admin</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-zinc-100">
                            <DropdownMenuLabel className="font-black text-zinc-900">Security Center</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 font-bold py-2.5 rounded-lg"><User className="w-4 h-4" /> Profile Details</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 font-bold py-2.5 rounded-lg" onClick={() => setActiveTab('settings')}><Settings className="w-4 h-4" /> Global Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-600 gap-2 font-black py-2.5 rounded-lg focus:text-rose-600 focus:bg-rose-50" onClick={handleSignOut}>
                                <LogOut className="w-4 h-4" /> Terminate Session
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
                {/* Header Section (Aligned with Student Dashboard) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="text-black">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            {activeTab === "overview" && "Executive Overview"}
                            {activeTab === "users" && "User Registry"}
                            {activeTab === "apps" && "Request Pipeline"}
                            {activeTab === "news" && "Communication Hub"}
                            {activeTab === "logs" && "Audit Pipeline"}
                        </h1>
                        <p className="text-zinc-500 mt-3 text-lg font-medium opacity-75">
                            {activeTab === "overview" && "High-level insights into your institution's digital ecosystem."}
                            {activeTab === "users" && "Manage permissions and institutional roles for verified accounts."}
                            {activeTab === "apps" && "Unified trajectory of all pending student and faculty requests."}
                            {activeTab === "news" && "Broadcast authoritative messages across the collective network."}
                            {activeTab === "logs" && "Security-hardened trace of system manipulations and overrides."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-violet-600 hover:bg-violet-700 h-11 px-6 rounded-xl shadow-xl shadow-violet-600/20 gap-2 font-black group">
                                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> New Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-2xl border-zinc-100 text-black">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Admin Request</DialogTitle>
                                    <DialogDescription className="font-medium">File a personal or official request for yourself.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleLeaveSubmit} className="space-y-6 pt-4 text-black">
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Context Type</Label>
                                        <Select value={leaveForm.type} onValueChange={(v) => setLeaveForm({ ...leaveForm, type: v })}>
                                            <SelectTrigger className="rounded-xl border-zinc-200 h-11 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Personal">Personal Leave</SelectItem>
                                                <SelectItem value="Official">Official Duty</SelectItem>
                                                <SelectItem value="Sick">Medical Emergency</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Timeline</Label>
                                        <Input className="rounded-xl border-zinc-200 h-11 font-bold" value={leaveForm.duration} onChange={(e) => setLeaveForm({ ...leaveForm, duration: e.target.value })} placeholder="e.g. 3 Days" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Justification</Label>
                                        <textarea className="w-full bg-transparent border border-zinc-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-600/20 min-h-[100px] transition-all resize-none shadow-sm" placeholder="Reason for request..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                                    </div>
                                    <Button type="submit" className="w-full bg-violet-600 h-12 rounded-xl font-black shadow-lg shadow-violet-600/10" disabled={isSubmitting}>
                                        {isSubmitting ? "Processing..." : "Deploy Request"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="h-11 px-5 rounded-xl border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-100 transition-all gap-2 shadow-sm" onClick={fetchData}>
                            <Activity className="w-4 h-4" /> Live Sync
                        </Button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                            {/* Dashboard Stats (Aligned Structure) */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {statsCards.map((stat, i) => (
                                    <Card key={i} className="border-none shadow-xl shadow-zinc-200/50 bg-white rounded-[2rem] hover:scale-[1.02] transition-all cursor-default">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-8 pt-8">
                                            <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
                                            <div className={cn("p-2 rounded-xl bg-zinc-50", stat.color.split(' ')[0])}>
                                                <stat.icon className="h-5 w-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-10">
                                            <div className="text-5xl font-bold text-zinc-900 tracking-tight">{stat.value}</div>
                                            <p className="text-xs text-zinc-500 mt-2 font-medium opacity-75">{stat.description}</p>
                                            <div className="mt-8 space-y-3">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-zinc-400">Proportion</span>
                                                    <span className="text-zinc-900 tabular-nums">{stat.progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden p-0.5 shadow-inner">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${stat.progress}%` }}
                                                        className={cn("h-full rounded-full shadow-lg", stat.accent)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                {/* Recent Activity Table */}
                                <Card className="lg:col-span-2 border-none shadow-2xl shadow-zinc-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                                    <CardHeader className="border-b border-zinc-50 px-10 py-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">Real-time Pipeline</CardTitle>
                                                <CardDescription className="text-zinc-500 font-medium text-sm mt-1 opacity-70 tracking-tight">Snapshot of latest institutional activity</CardDescription>
                                            </div>
                                            <Button variant="ghost" className="text-violet-600 font-black hover:bg-violet-50 px-5 rounded-xl h-10 group" onClick={() => setActiveTab('apps')}>Full Pipe <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" /></Button>
                                        </div>
                                    </CardHeader>
                                    <div className="p-0">
                                        <Table>
                                            <TableHeader className="bg-zinc-50/50">
                                                <TableRow className="hover:bg-transparent border-0 h-14">
                                                    <TableHead className="px-10 font-black text-zinc-400 uppercase text-[10px] tracking-[0.25em]">Entity</TableHead>
                                                    <TableHead className="px-10 font-black text-zinc-400 uppercase text-[10px] tracking-[0.25em]">Objective</TableHead>
                                                    <TableHead className="px-10 font-black text-zinc-400 uppercase text-[10px] tracking-[0.25em]">Registry</TableHead>
                                                    <TableHead className="px-10 font-black text-zinc-400 uppercase text-[10px] tracking-[0.25em] text-right">Status</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-24">
                                                            <Loader2 className="w-8 h-8 text-violet-600 animate-spin mx-auto mb-4" />
                                                            <p className="text-zinc-500 font-black text-xs uppercase tracking-widest italic opacity-40">Syncing with pipeline...</p>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : applications.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-24 text-zinc-400 italic font-black uppercase tracking-widest opacity-30 h-40">NO ACTIVITY DETECTED</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    applications.slice(0, 8).map((app) => (
                                                        <TableRow key={app.id} className="group border-zinc-50 transition-all hover:bg-zinc-50/50 h-20">
                                                            <TableCell className="px-10">
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="h-10 w-10 ring-2 ring-zinc-100 border-0">
                                                                        <AvatarFallback className="bg-violet-50 text-violet-600 font-black text-[10px] uppercase italic">{app.user.name.slice(0, 2)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="text-zinc-900 font-black text-sm tracking-tight leading-none mb-1">{app.user.name}</p>
                                                                        <p className="text-zinc-400 text-[9px] font-black uppercase tracking-widest tabular-nums italic opacity-60">ID: {app.id.slice(-6)}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-10">
                                                                <div className="text-zinc-800 font-black text-xs uppercase italic tracking-tighter mb-1">{app.type}</div>
                                                                <div className="text-[10px] text-zinc-400 font-bold max-w-[120px] truncate opacity-80">{app.reason || "Formal filing"}</div>
                                                            </TableCell>
                                                            <TableCell className="px-10">
                                                                <span className="text-zinc-500 font-black tabular-nums text-[10px] tracking-widest italic">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                            </TableCell>
                                                            <TableCell className="px-10 text-right">
                                                                <div className="flex items-center justify-end gap-5">
                                                                    <Badge className={cn("rounded-full px-4 py-1.5 font-bold uppercase text-[9px] tracking-widest border-0 shadow-sm transition-all",
                                                                        app.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                                                            app.status === "pending" ? "bg-amber-50 text-amber-600" :
                                                                                "bg-rose-50 text-rose-600"
                                                                    )}>
                                                                        {app.status}
                                                                    </Badge>
                                                                    {app.status === 'pending' && (
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                                            <Button variant="ghost" size="icon" className="h-9 w-9 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm" onClick={() => openDecisionDialog(app, 'approved')}>
                                                                                <CheckCircle className="w-4 h-4" />
                                                                            </Button>
                                                                            <Button variant="ghost" size="icon" className="h-9 w-9 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm" onClick={() => openDecisionDialog(app, 'rejected')}>
                                                                                <XCircle className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>

                                {/* System Insights Sidebar */}
                                <div className="space-y-10">
                                    <Card className="border-none shadow-2xl shadow-violet-200/40 bg-violet-600 text-white rounded-[2.5rem] overflow-hidden relative group">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-bl-[150px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
                                        <CardContent className="p-10">
                                            <div className="bg-white/10 w-fit p-4 rounded-[1.5rem] mb-8 border border-white/20">
                                                <TrendingUp className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-3xl font-black italic italic tracking-tighter leading-tight mb-4 uppercase">Predictive Pulse</h3>
                                            <p className="text-violet-100/70 text-sm font-medium leading-relaxed italic pr-4">Global institutional operation is currently optimal. All metrics are within nominal ranges.</p>
                                            <Separator className="my-8 bg-white/10" />
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em]">
                                                    <span className="text-violet-200 opacity-60 italic">Node Status</span>
                                                    <span className="text-white bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">Active</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs font-black uppercase tracking-[0.2em]">
                                                    <span className="text-violet-200 opacity-60 italic">Latent Load</span>
                                                    <span className="tabular-nums font-bold">0.04s</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-2xl shadow-zinc-200/50 bg-white p-10 rounded-[2.5rem] relative overflow-hidden group">
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-zinc-50 rounded-full group-hover:scale-110 transition-transform"></div>
                                        <div className="relative z-10 flex flex-col gap-6 font-bold text-black leading-none">
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-zinc-900 tracking-tight">Security Notice</h4>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 opacity-75">Admin Override Enabled</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium leading-relaxed italic">Administrative privileges are globally active. All manipulations are being recorded in the secure audit pipeline.</p>
                                            <Button variant="outline" className="w-full border-zinc-200 text-zinc-900 font-black h-12 rounded-xl hover:bg-zinc-50 transition-all uppercase text-[10px] tracking-widest mt-4" onClick={() => setActiveTab('logs')}>
                                                Access System Logs
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "users" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 text-black">
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                                <CardHeader className="bg-zinc-50/50 px-10 py-10 border-b border-zinc-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div>
                                            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Institutional Registry</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium text-sm mt-1 opacity-75 tracking-tight">Total {users.length} verified identifiers in current cycle</CardDescription>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="relative group">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-violet-600 transition-colors" />
                                                <Input className="bg-white border-zinc-200 h-12 pl-12 pr-6 w-80 rounded-2xl focus:ring-violet-600 transition-all font-bold placeholder:text-zinc-300 placeholder:italic" placeholder="Search registry..." />
                                            </div>
                                            <Button variant="ghost" className="h-12 w-12 bg-white border border-zinc-200 rounded-2xl p-0 hover:bg-zinc-50 hover:text-violet-600 transition-all shadow-sm">
                                                <Filter className="w-5 h-5 opacity-75" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/30">
                                            <TableRow className="border-zinc-50 hover:bg-transparent h-16">
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Node Metadata</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Access Tier</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">ISO Registry</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((u) => (
                                                <TableRow key={u.id} className="group border-zinc-50 hover:bg-zinc-50/50 h-24 transition-all">
                                                    <TableCell className="px-10">
                                                        <div className="flex items-center gap-5">
                                                            <Avatar className="h-12 w-12 ring-4 ring-white border-0 shadow-lg">
                                                                <AvatarFallback className="bg-zinc-100 text-zinc-400 font-bold text-[10px] uppercase">{u.name.slice(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-zinc-900 font-bold text-base tracking-tight leading-none mb-1.5">{u.name}</p>
                                                                <p className="text-zinc-400 text-xs font-bold tracking-tight opacity-70 italic">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-10">
                                                        <Badge className={cn("capitalize px-4 py-1.5 rounded-xl font-bold text-[9px] tracking-widest border-0 shadow-sm",
                                                            u.role === 'admin' ? 'bg-violet-600 text-white' :
                                                                u.role === 'faculty' ? 'bg-emerald-100 text-emerald-700' :
                                                                    'bg-zinc-100 text-zinc-500'
                                                        )}>
                                                            {u.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-10">
                                                        <span className="text-zinc-400 font-black tabular-nums text-[10px] tracking-widest italic opacity-60 uppercase">{new Date(u.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                    </TableCell>
                                                    <TableCell className="px-10 text-right">
                                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                            <Button variant="ghost" size="sm" className={cn("h-10 px-5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                                                                u.role === 'faculty' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                            )} onClick={() => handleAction(() => updateUserRole(u.id, u.role === 'faculty' ? 'student' : 'faculty'), "Privileges updated", "Sync failure")}>
                                                                {u.role === 'faculty' ? 'Revoke Faculty' : 'Elevate Faculty'}
                                                            </Button>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-10 w-10 bg-zinc-100/50 rounded-xl hover:bg-zinc-900 hover:text-white transition-all">
                                                                        <MoreVertical className="w-5 h-5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-zinc-100 p-2 text-black">
                                                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 py-2">Entity Control</DropdownMenuLabel>
                                                                    <DropdownMenuItem className="rounded-xl h-11 font-bold" onClick={() => handleAction(() => updateUserRole(u.id, "student"), "Resigned to student", "Error")}>Resign Student</DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-xl h-11 font-bold" onClick={() => handleAction(() => updateUserRole(u.id, "faculty"), "Escalated faculty", "Error")}>Escalate Faculty</DropdownMenuItem>
                                                                    <DropdownMenuItem className="rounded-xl h-11 font-black text-violet-600" onClick={() => handleAction(() => updateUserRole(u.id, "admin"), "Promoted admin", "Error")} disabled={u.role === 'admin'}>Promote Root</DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-zinc-50 my-2" />
                                                                    <DropdownMenuItem className="rounded-xl h-11 font-black text-rose-600 focus:bg-rose-50 italic">Emergency Suspension</DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === "apps" && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10 text-black">
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                                <CardHeader className="bg-zinc-50/50 px-10 py-10 border-b border-zinc-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div>
                                            <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Institutional Pipeline</CardTitle>
                                            <CardDescription className="text-zinc-500 font-medium text-sm mt-1 opacity-75 tracking-tight">Full trace of all active student and faculty requests</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/30">
                                            <TableRow className="border-zinc-50 hover:bg-transparent h-16">
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Requester</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Request Context</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Submission Date</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest text-right">Decision Control</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.map((app) => (
                                                <TableRow key={app.id} className="group border-zinc-50 hover:bg-zinc-50/50 h-24 transition-all">
                                                    <TableCell className="px-10">
                                                        <div className="flex items-center gap-5">
                                                            <Avatar className="h-12 w-12 ring-4 ring-white border-0 shadow-lg">
                                                                <AvatarFallback className="bg-violet-50 text-violet-600 font-bold text-[10px] uppercase">{app.user.name.slice(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-zinc-900 font-bold text-base tracking-tight leading-none mb-1.5">{app.user.name}</p>
                                                                <p className="text-zinc-400 text-xs font-bold tracking-tight opacity-70 italic">{app.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-10">
                                                        <div className="flex flex-col">
                                                            <span className="text-zinc-900 font-bold text-sm tracking-tight">{app.type}</span>
                                                            <p className="text-[10px] text-zinc-400 font-bold opacity-60 truncate max-w-xs">{app.reason || "Formal declaration"}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-10">
                                                        <span className="text-zinc-400 font-bold tabular-nums text-[10px] tracking-widest opacity-60 uppercase">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </TableCell>
                                                    <TableCell className="px-10 text-right">
                                                        <div className="flex items-center justify-end gap-5">
                                                            <Badge className={cn("rounded-full px-4 py-1.5 font-bold uppercase text-[9px] tracking-widest border-0 shadow-sm",
                                                                app.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                                                    app.status === "pending" ? "bg-amber-50 text-amber-600" :
                                                                        "bg-rose-50 text-rose-600"
                                                            )}>
                                                                {app.status}
                                                            </Badge>

                                                            {app.status === 'pending' && (
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                                    <Button variant="ghost" size="icon" className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm" onClick={() => openDecisionDialog(app, 'approved')}>
                                                                        <CheckCircle className="w-5 h-5" />
                                                                    </Button>
                                                                    <Button variant="ghost" size="icon" className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm" onClick={() => openDecisionDialog(app, 'rejected')}>
                                                                        <XCircle className="w-5 h-5" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {applications.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-40 text-zinc-300 font-bold uppercase tracking-widest text-[10px] opacity-40">NO INSTITUTIONAL REQUESTS RECORDED</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === "news" && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-black">
                            {/* Compose Announcement (Left Column) */}
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] p-4 md:p-10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50 rounded-bl-[250px] pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                                <CardHeader className="mb-10 p-0 relative z-10">
                                    <div className="w-20 h-20 bg-violet-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-2xl shadow-violet-600/30">
                                        <MessageSquare className="w-10 h-10 text-white" />
                                    </div>
                                    <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Transmission Engine</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium text-sm mt-1 opacity-75">Broadcast authoritative messages across the collective network.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleCreateAnnouncement} className="relative z-10 text-black">
                                    <CardContent className="space-y-8 p-0">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-2">Broadcast Header</Label>
                                            <Input
                                                className="bg-zinc-50 border-zinc-100 h-16 rounded-2xl text-xl font-black italic px-8 focus:ring-violet-600/20 placeholder:text-zinc-200"
                                                placeholder="e.g. SEMESTER SYNC"
                                                value={newAnnouncement.title}
                                                onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-2">Priority Tier</Label>
                                                <Select value={newAnnouncement.priority} onValueChange={(v) => setNewAnnouncement({ ...newAnnouncement, priority: v })}>
                                                    <SelectTrigger className="bg-zinc-50 border-zinc-100 h-14 rounded-2xl px-6 font-black italic text-zinc-700 uppercase text-xs tracking-widest">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border-zinc-100">
                                                        <SelectItem value="low" className="font-bold">Standard</SelectItem>
                                                        <SelectItem value="normal" className="font-bold">Priority</SelectItem>
                                                        <SelectItem value="urgent" className="font-black text-rose-600">Urgent</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-2">Target Node</Label>
                                                <div className="bg-zinc-100/50 border border-zinc-50 h-14 rounded-2xl flex items-center px-6 text-[10px] font-black text-violet-600 italic uppercase tracking-[0.2em] shadow-inner">Global Broadcast</div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 ml-2">Transmission Body</Label>
                                            <textarea
                                                className="w-full bg-zinc-50/50 border border-zinc-100 rounded-[2rem] p-8 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-violet-600/5 min-h-[180px] transition-all resize-none shadow-inner text-zinc-800"
                                                placeholder="Draft message content..."
                                                value={newAnnouncement.content}
                                                onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-0 pt-10">
                                        <Button type="submit" className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-16 text-lg font-bold rounded-2xl shadow-xl transition-all active:scale-[0.98] tracking-tight" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Initiate Transmission"}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>

                            {/* Feed (Right Column) */}
                            <div className="space-y-10 py-4">
                                <div className="flex items-center justify-between px-6">
                                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Live Transmissions</h3>
                                    <Badge variant="outline" className="h-7 rounded-full border-zinc-200 text-zinc-500 font-bold px-4 uppercase text-[9px] tracking-widest">{announcements.length} ACTIVE</Badge>
                                </div>
                                <div className="space-y-6 max-h-[750px] overflow-y-auto pr-6 scrollbar-hide pb-20">
                                    {announcements.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-zinc-200 rounded-[3rem] text-zinc-300">
                                            <Mail className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-black italic uppercase tracking-widest text-xs opacity-50">Node silent. No transmissions detected.</p>
                                        </div>
                                    ) : (
                                        announcements.map((news) => (
                                            <motion.div key={news.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                                <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300 relative border border-white">
                                                    <div className={cn("absolute top-0 left-0 w-1.5 h-full opacity-40",
                                                        news.priority === 'urgent' ? 'bg-rose-500' : 'bg-violet-600'
                                                    )}></div>
                                                    <CardHeader className="p-8 pb-4">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <Badge className={cn("uppercase text-[8px] font-black tracking-widest italic rounded-md border-0 py-0.5 px-3",
                                                                    news.priority === 'urgent' ? 'bg-rose-50 text-rose-600' : 'bg-violet-50 text-violet-600'
                                                                )}>
                                                                    {news.priority} TIER
                                                                </Badge>
                                                                <span className="text-[10px] text-zinc-400 font-black tabular-nums tracking-widest italic opacity-60 uppercase">{new Date(news.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-300 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all active:scale-90" onClick={() => handleAction(() => deleteAnnouncement(news.id), "Transmission nuked", "Error")}>
                                                                <XCircle className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">{news.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-8 pt-0">
                                                        <p className="text-zinc-500 font-medium leading-relaxed italic text-base pr-4 line-clamp-3">{news.content}</p>
                                                    </CardContent>
                                                    <CardFooter className="px-8 py-5 border-t border-zinc-50 bg-zinc-50/30 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-5 h-5 rounded-lg bg-zinc-900 flex items-center justify-center text-[9px] font-black text-white italic transform -rotate-12 uppercase">{news.author.name.slice(0, 1)}</div>
                                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{news.author.name}</p>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "logs" && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10 text-black">
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                                <CardHeader className="bg-zinc-50/50 px-10 py-10 border-b border-zinc-100 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-3xl font-bold tracking-tight text-zinc-900">Audit Pipeline</CardTitle>
                                        <CardDescription className="text-zinc-500 font-medium text-sm mt-1 opacity-75">Trace verified manipulation events in real-time</CardDescription>
                                    </div>
                                    <Button variant="outline" className="h-12 border-zinc-200 text-zinc-400 font-black px-6 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all hover:border-rose-100 uppercase text-[10px] tracking-widest shadow-sm">
                                        PURGE AUDIT HASH
                                    </Button>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/30">
                                            <TableRow className="border-zinc-50 hover:bg-transparent h-16">
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Administrative Node</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Cipher Operation</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest">Hash Context</TableHead>
                                                <TableHead className="px-10 font-bold text-zinc-400 uppercase text-[10px] tracking-widest text-right">ISO TIMESTAMP</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {auditLogs.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-40 text-zinc-300 font-bold uppercase tracking-widest text-[10px] opacity-40">NO EVENTS DETECTED IN TRANSIT</TableCell>
                                                </TableRow>
                                            ) : (
                                                auditLogs.map(log => (
                                                    <TableRow key={log.id} className="border-zinc-50 group hover:bg-zinc-50/50 transition-all h-20">
                                                        <TableCell className="px-10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center border border-violet-500 shadow-lg shadow-violet-600/10">
                                                                    <Shield className="w-4 h-4 text-white" />
                                                                </div>
                                                                <span className="text-zinc-900 font-bold text-xs uppercase tracking-tight">{log.user.name}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-10">
                                                            <Badge variant="outline" className="text-[9px] font-bold uppercase border-zinc-200 text-zinc-500 bg-zinc-100/50 h-6 rounded-md px-3 tracking-widest">
                                                                {log.action}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-10 text-zinc-500 text-xs font-bold leading-relaxed max-w-sm truncate italic italic opacity-70 group-hover:text-zinc-900 transition-colors uppercase tracking-tight">{log.details || "SYSTEM GENERATED CIPHER"}</TableCell>
                                                        <TableCell className="px-10 text-right text-zinc-400 text-[10px] font-bold tabular-nums tracking-widest opacity-50 uppercase">
                                                            {new Date(log.createdAt).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="mt-auto border-t bg-white py-16 px-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <div className="bg-zinc-900 p-2 rounded-xl shadow-lg ring-1 ring-white/10">
                            <span className="text-white font-bold text-lg px-0.5">🛡️</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900">Academic Authority</span>
                            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">Institutional Core</span>
                        </div>
                    </div>

                    <div className="flex gap-12 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-violet-600 transition-colors">Privacy Proto</a>
                        <a href="#" className="hover:text-violet-600 transition-colors">Usage Cipher</a>
                        <a href="#" className="hover:text-violet-600 transition-colors">Node Support</a>
                    </div>

                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest opacity-50">
                        &copy; 2026 Collective Registry. Node SEC-A1.
                    </div>
                </div>
            </footer>

            {/* Global Decision Dialog */}
            <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-zinc-100 rounded-[2rem] text-black">
                    <form onSubmit={handleDecision}>
                        <div className={cn(
                            "p-8 text-white flex items-center justify-between",
                            decisionType === 'approved' ? "bg-emerald-600" : "bg-rose-600"
                        )}>
                            <div>
                                <DialogTitle className="text-2xl font-bold tracking-tight">Finalize Decision</DialogTitle>
                                <DialogDescription className="text-white/70 text-sm font-medium mt-1 uppercase tracking-widest">{decisionType === 'approved' ? "Granting Authorization" : "Denying Trajectory"}</DialogDescription>
                            </div>
                            <div className="bg-white/20 p-3 rounded-2xl">
                                {decisionType === 'approved' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {decisionApp && (
                                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">{decisionApp.user.name[0]}</div>
                                        <span className="text-sm font-bold text-zinc-900">{decisionApp.user.name}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-medium italic">Type: <span className="text-zinc-900 not-italic font-bold">{decisionApp.type}</span></p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1">Administrative Comment (Optional)</Label>
                                <textarea
                                    className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-zinc-600/5 min-h-[120px] transition-all resize-none shadow-sm"
                                    placeholder="Add context for this decision..."
                                    value={decisionComment}
                                    onChange={(e) => setDecisionComment(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter className="p-8 pt-0 flex gap-3">
                            <Button type="button" variant="ghost" className="h-12 rounded-xl font-bold flex-1" onClick={() => setIsDecisionDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" className={cn(
                                "h-12 rounded-xl font-bold flex-1 text-white shadow-lg transition-all active:scale-95",
                                decisionType === 'approved' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20" : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                            )}>
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirm ${decisionType}`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminDashboard;
