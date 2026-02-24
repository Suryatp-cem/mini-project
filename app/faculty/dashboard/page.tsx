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
    Plus,
    XCircle,
    Loader2,
    GraduationCap,
    School,
    TrendingUp,
    LayoutDashboard,
    ClipboardList,
    Send
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
    getApplicationStats,
    getRecentApplications,
    updateApplicationStatus,
    createApplication,
    getAnnouncements
} from "@/lib/actions";
import { cn } from '@/lib/utils';

const FacultyDashboard = () => {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
    const [applications, setApplications] = useState<any[]>([]);
    const [myApplications, setMyApplications] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const [leaveForm, setLeaveForm] = useState({ type: "Personal", duration: "1 day", priority: "normal", reason: "" });
    const [decisionApp, setDecisionApp] = useState<any>(null);
    const [decisionType, setDecisionType] = useState<string>("");
    const [decisionComment, setDecisionComment] = useState<string>("");
    const [isDecisionDialogOpen, setIsDecisionDialogOpen] = useState(false);

    const userRole = (session?.user as any)?.role || "faculty";
    const userName = session?.user?.name || "Faculty Member";
    const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

    useEffect(() => {
        if (!isPending && (!session || userRole !== "faculty")) {
            router.push(session ? "/dashboard" : "/sign-in");
        }
    }, [session, isPending, router, userRole]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, allAppsData, newsData] = await Promise.all([
                getApplicationStats(),
                getRecentApplications(50),
                getAnnouncements()
            ]);

            setStats(statsData);
            setAnnouncements(newsData);

            // Separate student applications from faculty's own applications
            const studentApps = allAppsData.filter((app: any) => app.user.role === 'student');
            const selfApps = allAppsData.filter((app: any) => app.userId === session?.user?.id);

            setApplications(studentApps);
            setMyApplications(selfApps);
        } catch (error) {
            console.error("Failed to fetch faculty data", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session && userRole === "faculty") {
            fetchData();
        }
    }, [session, userRole]);

    const handleAction = async (action: () => Promise<any>, successMsg: string, errorMsg: string) => {
        try {
            await action();
            toast.success(successMsg);
            fetchData();
        } catch (err) {
            console.error("Dashboard action error:", err);
            toast.error(errorMsg);
        }
    };

    const handleLeaveSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await handleAction(
            () => createApplication(leaveForm),
            "Your request has been submitted",
            "Failed to submit request"
        );
        setLeaveForm({ type: "Personal", duration: "1 day", priority: "normal", reason: "" });
        setIsSubmitting(false);
    };

    const handleDecision = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("handleDecision triggered", { decisionApp, decisionType, decisionComment });
        if (!decisionApp) {
            console.error("No decisionApp selected!");
            return;
        }
        setIsSubmitting(true);
        console.log("Calling updateApplicationStatus with:", decisionApp.id, decisionType, decisionComment);
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

    if (isPending || !session || userRole !== "faculty") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-cyan-600 animate-spin" />
                    <p className="text-slate-500 font-bold italic uppercase text-xs tracking-widest">Initialising Faculty Console</p>
                </div>
            </div>
        );
    }

    const statsCards = [
        {
            title: "Student Requests",
            value: applications.length,
            icon: ClipboardList,
            color: "text-slate-900 border-cyan-200",
            description: "Total applications to review",
            accent: "bg-cyan-600"
        },
        {
            title: "Pending Approval",
            value: applications.filter(a => a.status === 'pending').length,
            icon: Clock,
            color: "text-amber-600 border-amber-100",
            description: "Awaiting your decision",
            accent: "bg-amber-500"
        },
        {
            title: "Approved by me",
            value: applications.filter(a => a.status === 'approved').length,
            icon: CheckCircle,
            color: "text-emerald-600 border-emerald-100",
            description: "Successfully processed",
            accent: "bg-emerald-500"
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                        <div className="bg-cyan-600 p-1.5 rounded-lg shadow-lg shadow-cyan-600/20">
                            <span className="text-white font-bold text-lg">🏫</span>
                        </div>
                        <span className="text-xl font-bold tracking-tighter text-slate-900">Faculty<span className="text-cyan-600 font-bold">Portal</span></span>
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'overview' ? "text-cyan-600 bg-cyan-50" : "text-slate-500 hover:text-cyan-600")} onClick={() => setActiveTab('overview')}>Overview</Button>
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'requests' ? "text-cyan-600 bg-cyan-50" : "text-slate-500 hover:text-cyan-600")} onClick={() => setActiveTab('requests')}>Applications</Button>
                        <Button variant="ghost" className={cn("px-4 h-9 font-bold transition-all", activeTab === 'history' ? "text-cyan-600 bg-cyan-50" : "text-slate-500 hover:text-cyan-600")} onClick={() => setActiveTab('history')}>My Requests</Button>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 bg-cyan-50 text-cyan-700 font-bold uppercase text-[10px] px-3 py-1 border border-cyan-100 rounded-full">
                        <User className="w-3 h-3" /> Faculty Access
                    </Badge>

                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 relative rounded-full hover:bg-slate-100">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-cyan-600 rounded-full border-2 border-white"></span>
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="pl-1 pr-2 rounded-full hover:bg-slate-100 h-10 gap-2 transition-all">
                                <Avatar className="h-8 w-8 border-2 border-slate-100">
                                    <AvatarFallback className="bg-cyan-100 text-cyan-700 font-bold text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 font-sans">Faculty</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-100 font-sans">
                            <DropdownMenuLabel className="font-bold text-slate-900">Academic Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 font-bold py-2.5 rounded-lg focus:bg-cyan-50 font-sans"><User className="w-4 h-4" /> My Profile</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 font-bold py-2.5 rounded-lg focus:bg-cyan-50 font-sans"><Settings className="w-4 h-4" /> Account Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-rose-600 gap-2 font-bold py-2.5 rounded-lg focus:text-rose-600 focus:bg-rose-50 font-sans" onClick={handleSignOut}>
                                <LogOut className="w-4 h-4" /> Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10 font-sans">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="text-black">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {activeTab === "overview" && "Faculty Console"}
                            {activeTab === "requests" && "Review Pipeline"}
                            {activeTab === "history" && "My Official Requests"}
                        </h1>
                        <p className="text-slate-500 mt-3 text-lg font-medium italic opacity-75">
                            {activeTab === "overview" && "High-level summary of student activity and your trajectory."}
                            {activeTab === "requests" && "Review and decide on pending student leave applications."}
                            {activeTab === "history" && "Manage your own leave and official duty requests."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="bg-cyan-600 hover:bg-cyan-700 h-11 px-6 rounded-xl shadow-xl shadow-cyan-600/20 gap-2 font-bold group transition-all">
                                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" /> File Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-100 text-black font-sans">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold">Official Request</DialogTitle>
                                    <DialogDescription className="font-bold">Submit a request for leave or official duty.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleLeaveSubmit} className="space-y-6 pt-4 text-black">
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-slate-500 ml-1">Request Type</Label>
                                        <Select value={leaveForm.type} onValueChange={(v) => setLeaveForm({ ...leaveForm, type: v })}>
                                            <SelectTrigger className="rounded-xl border-slate-200 h-11 font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl font-sans">
                                                <SelectItem value="Personal">Personal Leave</SelectItem>
                                                <SelectItem value="Conference">External Conference</SelectItem>
                                                <SelectItem value="OD">On Duty (OD)</SelectItem>
                                                <SelectItem value="Medical">Medical Leave</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-slate-500 ml-1">Expected Duration</Label>
                                        <Input className="rounded-xl border-slate-200 h-11 font-bold font-sans" value={leaveForm.duration} onChange={(e) => setLeaveForm({ ...leaveForm, duration: e.target.value })} placeholder="e.g. 2 Days" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-slate-500 ml-1">Reason / Context</Label>
                                        <textarea className="w-full bg-transparent border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600/20 min-h-[100px] transition-all resize-none shadow-sm font-sans" placeholder="Detailed reason..." value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                                    </div>
                                    <Button type="submit" className="w-full bg-cyan-600 h-12 rounded-xl font-bold shadow-lg shadow-cyan-600/10 transition-all font-sans" disabled={isSubmitting}>
                                        {isSubmitting ? "Processing..." : "Deploy Request"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-all gap-2 shadow-sm font-sans" onClick={fetchData}>
                            <Activity className="w-4 h-4" /> Live Sync
                        </Button>

                        {/* Decision Dialog */}
                        <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
                            <DialogContent className="sm:max-w-[425px] rounded-2xl border-slate-100 text-black font-sans">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold italic uppercase tracking-tight">
                                        {decisionType === 'approved' ? "Authorize Request" : "Reject Application"}
                                    </DialogTitle>
                                    <DialogDescription className="font-bold italic">
                                        Providing feedback helps students understand your decision.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleDecision} className="space-y-6 pt-4 text-black">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Student</p>
                                        <p className="font-bold text-slate-900">{decisionApp?.user?.name}</p>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-2">Request</p>
                                        <p className="font-bold text-slate-700">{decisionApp?.type} ({decisionApp?.duration})</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-bold text-[10px] uppercase tracking-widest text-slate-500 ml-1">Optional Comment</Label>
                                        <textarea
                                            className="w-full bg-transparent border border-slate-200 rounded-xl p-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-600/20 min-h-[120px] transition-all resize-none shadow-sm font-sans"
                                            placeholder="Write your feedback here (optional)..."
                                            value={decisionComment}
                                            onChange={(e) => setDecisionComment(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1 rounded-xl h-12 font-bold italic uppercase text-[10px] tracking-widest"
                                            onClick={() => setIsDecisionDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className={cn("flex-1 h-12 rounded-xl font-bold italic uppercase text-[10px] tracking-widest shadow-lg transition-all",
                                                decisionType === 'approved' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10" : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/10"
                                            )}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? "Processing..." : decisionType === 'approved' ? "Confirm Authorization" : "Confirm Rejection"}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "overview" && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {statsCards.map((stat, i) => (
                                    <Card key={i} className="border-none shadow-xl shadow-slate-200/50 bg-white rounded-[2rem] hover:scale-[1.02] transition-all group">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 px-8 pt-8">
                                            <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.title}</CardTitle>
                                            <div className={cn("p-2 rounded-xl bg-slate-50 transition-colors", stat.color.split(' ')[0])}>
                                                <stat.icon className="h-5 w-5" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-8 pb-10">
                                            <div className="text-5xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                                            <p className="text-xs text-slate-500 mt-2 font-medium opacity-75">{stat.description}</p>
                                            <div className="mt-8 flex items-center justify-between">
                                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden mr-4">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: i === 0 ? '100%' : i === 1 ? '40%' : '60%' }}
                                                        className={cn("h-full rounded-full", stat.accent)}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-900 uppercase">Active</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Activity Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/60 bg-white rounded-[2.5rem] overflow-hidden">
                                    <CardHeader className="border-b border-slate-50 px-10 py-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardDescription className="text-slate-500 font-medium text-xs mt-1">Pending student applications for review</CardDescription>
                                            </div>
                                            <Button variant="ghost" className="text-cyan-600 font-bold hover:bg-cyan-50 px-5 rounded-xl h-10 group transition-all" onClick={() => setActiveTab('requests')}>View All <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" /></Button>
                                        </div>
                                    </CardHeader>
                                    <div className="p-0">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow className="hover:bg-transparent border-0 h-14">
                                                    <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Student</TableHead>
                                                    <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Type</TableHead>
                                                    <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Registry</TableHead>
                                                    <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Decision</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {isLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-24">
                                                            <Loader2 className="w-8 h-8 text-cyan-600 animate-spin mx-auto mb-4" />
                                                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic opacity-40">Syncing database...</p>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : applications.filter(a => a.status === 'pending').length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} className="text-center py-24 text-slate-400 italic font-bold uppercase tracking-widest opacity-30 h-40">NO PENDING ACTIONS</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    applications.filter(a => a.status === 'pending').slice(0, 5).map((app) => (
                                                        <TableRow key={app.id} className="group border-slate-50 transition-all hover:bg-slate-50/50 h-20">
                                                            <TableCell className="px-10 font-sans">
                                                                <div className="flex items-center gap-4">
                                                                    <Avatar className="h-10 w-10 ring-2 ring-slate-100 border-0">
                                                                        <AvatarFallback className="bg-cyan-50 text-cyan-600 font-bold text-[10px] uppercase italic">{app.user.name.slice(0, 2)}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="text-slate-900 font-bold text-sm tracking-tight leading-none mb-1">{app.user.name}</p>
                                                                        <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest opacity-60 tabular-nums italic">{app.user.email}</p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="px-10 font-sans">
                                                                <div className="text-slate-800 font-bold text-xs uppercase italic tracking-tighter mb-1">{app.type}</div>
                                                                <div className="text-[10px] text-slate-400 font-bold max-w-[120px] truncate opacity-80">{app.reason || "Standard application"}</div>
                                                            </TableCell>
                                                            <TableCell className="px-10 font-sans">
                                                                <span className="text-slate-500 font-bold tabular-nums text-[10px] tracking-widest italic">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                            </TableCell>
                                                            <TableCell className="px-10 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-emerald-600 hover:bg-emerald-50 font-bold text-[10px] uppercase tracking-widest transition-all" onClick={() => openDecisionDialog(app, 'approved')}>
                                                                        Allow
                                                                    </Button>
                                                                    <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-[10px] uppercase tracking-widest transition-all" onClick={() => openDecisionDialog(app, 'rejected')}>
                                                                        Deny
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </Card>

                                <div className="space-y-10">


                                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white p-10 rounded-[2.5rem] relative overflow-hidden font-sans">
                                        <h4 className="text-xl font-bold text-slate-900 tracking-tight mb-4">Announcements</h4>
                                        <div className="space-y-6">
                                            {announcements.slice(0, 2).map((news, i) => (
                                                <div key={i} className="flex gap-4">
                                                    <div className="w-1.5 h-auto bg-cyan-100 rounded-full shrink-0"></div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 uppercase italic tracking-tight mb-1">{news.title}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium italic line-clamp-2">{news.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {announcements.length === 0 && (
                                                <p className="text-[10px] font-bold text-slate-300 uppercase italic tracking-widest text-center py-6">No active broadcasts</p>
                                            )}
                                        </div>
                                        <Button variant="ghost" className="w-full mt-8 text-cyan-600 font-bold h-12 rounded-xl hover:bg-cyan-50 transition-all uppercase text-[10px] tracking-widest border border-slate-50 shadow-sm">
                                            View Collective News
                                        </Button>
                                    </Card>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "requests" && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 text-black">
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                                <CardHeader className="bg-slate-50/50 px-10 py-10 border-b border-zinc-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div>
                                            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Institutional Applications</CardTitle>
                                            <CardDescription className="text-slate-500 font-medium text-sm mt-1 opacity-75 tracking-tight">Managing {applications.length} student identity requests</CardDescription>
                                        </div>
                                        <div className="relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                                            <Input className="bg-white border-slate-200 h-12 pl-12 pr-6 w-80 rounded-2xl focus:ring-cyan-600 transition-all font-bold placeholder:text-slate-300 placeholder:italic font-sans" placeholder="Search applications..." />
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/30">
                                            <TableRow className="border-slate-50 hover:bg-transparent h-16">
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Student Identity</TableHead>
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Request Context</TableHead>
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Submission Date</TableHead>
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Administrative Decision</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applications.map((app) => (
                                                <TableRow key={app.id} className="group border-slate-50 hover:bg-slate-50/50 h-24 transition-all">
                                                    <TableCell className="px-10 font-sans">
                                                        <div className="flex items-center gap-5">
                                                            <Avatar className="h-12 w-12 ring-4 ring-white border-0 shadow-lg">
                                                                <AvatarFallback className="bg-slate-100 text-slate-400 font-bold text-[10px] uppercase italic">{app.user.name.slice(0, 2)}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <p className="text-slate-900 font-bold text-base tracking-tight leading-none mb-1.5">{app.user.name}</p>
                                                                <p className="text-slate-400 text-xs font-bold tracking-tight opacity-70 italic">{app.user.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-10 font-sans">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-900 font-bold text-sm italic tracking-tight mb-1">{app.type}</span>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 text-slate-400 h-5 px-2 italic">{app.priority} PRIORITY</Badge>
                                                                <span className="text-[10px] text-slate-400 font-bold opacity-60 italic">{app.duration}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-10 font-sans">
                                                        <span className="text-slate-400 font-bold tabular-nums text-[10px] tracking-widest italic opacity-60 uppercase">{new Date(app.createdAt).toLocaleDateString()}</span>
                                                    </TableCell>
                                                    <TableCell className="px-10 text-right">
                                                        <div className="flex items-center justify-end gap-5">
                                                            <Badge className={cn("rounded-full px-4 py-1.5 font-bold uppercase text-[9px] tracking-[0.15em] border-0 shadow-sm transition-all",
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
                                                    <TableCell colSpan={4} className="text-center py-40 text-slate-300 italic font-bold uppercase tracking-widest text-[10px] opacity-40">NO STUDENT APPLICATIONS RECORDED</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === "history" && (
                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10 text-black">
                            <Card className="border-none shadow-2xl bg-white rounded-[3rem] overflow-hidden">
                                <CardHeader className="bg-slate-50/50 px-10 py-10 border-b border-zinc-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Self-Service Requests</CardTitle>
                                            <CardDescription className="text-slate-500 font-medium text-sm mt-1 opacity-75 tracking-tight">Audit trail of your personal and official trajectories</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/30">
                                            <TableRow className="border-slate-50 hover:bg-transparent h-16">
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Request Context</TableHead>
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Timeline</TableHead>
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest">Submission Date</TableHead>
                                                <TableHead className="px-10 font-bold text-slate-400 uppercase text-[10px] tracking-widest text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {myApplications.map((app) => (
                                                <TableRow key={app.id} className="group border-slate-50 hover:bg-slate-50/50 h-20 transition-all font-sans">
                                                    <TableCell className="px-10">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-900 font-bold text-sm italic tracking-tight">{app.type}</span>
                                                            <p className="text-[10px] text-slate-400 font-bold opacity-60 italic truncate max-w-xs">{app.reason || "Formal declaration"}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-10 tabular-nums text-xs font-bold italic text-slate-600 uppercase tracking-widest">{app.duration}</TableCell>
                                                    <TableCell className="px-10 text-slate-400 font-bold tabular-nums text-[10px] tracking-widest italic opacity-60 uppercase">{new Date(app.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell className="px-10 text-right">
                                                        <Badge className={cn("rounded-full px-4 py-1 font-bold uppercase text-[9px] tracking-[0.15em] border-0 shadow-sm",
                                                            app.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                                                app.status === "pending" ? "bg-amber-50 text-amber-600" :
                                                                    "bg-rose-50 text-rose-600"
                                                        )}>
                                                            {app.status}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {myApplications.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-40 text-slate-300 italic font-bold uppercase tracking-widest text-[10px] opacity-40">NO PERSONAL REQUESTS FILED</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="mt-auto border-t bg-white py-16 px-10 font-sans">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-black">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 p-2 rounded-xl shadow-lg ring-1 ring-white/10">
                            <span className="text-white font-bold text-lg px-0.5">🏫</span>
                        </div>
                        <div className="flex flex-col text-black">
                            <span className="text-sm font-bold text-slate-900">Academic Faculty</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Certified Educator</span>
                        </div>
                    </div>

                    <div className="flex gap-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-cyan-600 transition-all">Support Desk</a>
                        <a href="#" className="hover:text-cyan-600 transition-all">Institutional Policy</a>
                        <a href="#" className="hover:text-cyan-600 transition-all">Node Data</a>
                    </div>

                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-50">
                        &copy; 2026 Educational Registry.
                    </div>
                </div>
            </footer>

            {/* Global Decision Dialog */}
            <Dialog open={isDecisionDialogOpen} onOpenChange={setIsDecisionDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-slate-100 rounded-[2rem] text-black">
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
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white uppercase">{decisionApp.user.name[0]}</div>
                                        <span className="text-sm font-bold text-slate-900">{decisionApp.user.name}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium italic">Type: <span className="text-slate-900 not-italic font-bold">{decisionApp.type}</span></p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Faculty Comment (Optional)</Label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-slate-600/5 min-h-[120px] transition-all resize-none shadow-sm"
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

export default FacultyDashboard;
