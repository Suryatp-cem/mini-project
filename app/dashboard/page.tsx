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
    Users
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
import { cn } from "@/lib/utils";
import {
    createApplication,
    getApplicationStats,
    getRecentApplications,
    updateApplicationStatus,
    getAllUsers,
    updateUserRole
} from "@/lib/actions";

const DashboardPage = () => {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
    const [applications, setApplications] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [form, setForm] = useState({
        type: "Sick Leave",
        duration: "1 day",
        priority: "normal",
        reason: ""
    });

    const userRole = (session?.user as any)?.role || "student";
    const userName = session?.user?.name || "User";
    const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase();

    useEffect(() => {
        if (!isPending && !session) {
            router.push("/sign-in");
        } else if (!isPending && session) {
            if (userRole === "admin") {
                router.push("/admin/dashboard");
            } else if (userRole === "faculty") {
                router.push("/faculty/dashboard");
            }
        }
    }, [session, isPending, router, userRole]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [statsData, appsData] = await Promise.all([
                getApplicationStats(),
                getRecentApplications()
            ]);
            setStats(statsData);
            setApplications(appsData);

            if (userRole === "admin") {
                const usersData = await getAllUsers();
                setUsers(usersData);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchData();
        }
    }, [session, userRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await createApplication(form);
            toast.success("Application submitted successfully");
            setIsDialogOpen(false);
            setForm({ type: "Sick Leave", duration: "1 day", priority: "normal", reason: "" });
            fetchData();
        } catch (error) {
            toast.error("Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateApplicationStatus(id, status);
            toast.success(`Application ${status}`);
            fetchData();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        try {
            await updateUserRole(userId, newRole);
            toast.success("User role updated");
            fetchData();
        } catch (error) {
            toast.error("Failed to update user role");
        }
    };

    const handleSignOut = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in");
                },
            },
        });
    };

    const statsCards = [
        {
            title: "Total Applications",
            value: stats.total,
            icon: FileText,
            color: "text-slate-900",
            progress: stats.total > 0 ? 100 : 0,
            description: userRole === "student" ? "Your total requests" : "All student requests"
        },
        {
            title: "Approved Requests",
            value: stats.approved,
            icon: CheckCircle,
            color: "text-emerald-600",
            progress: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0,
            description: "Successfully processed"
        },
        {
            title: "Pending Reviews",
            value: stats.pending,
            icon: Clock,
            color: "text-amber-600",
            progress: stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0,
            description: "Awaiting approval"
        },
    ];

    if (isPending || !session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium italic">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col">
            {/* Top Navigation */}
            <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
                        <div className="bg-indigo-600 p-1.5 rounded-lg">
                            <span className="text-white font-bold text-lg">🎓</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900">Portal</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-1">
                        <Button variant="ghost" className="text-indigo-600 font-bold px-4 h-9 bg-indigo-50/50">Dashboard</Button>
                        <Button variant="ghost" className="text-slate-500 font-medium px-4 h-9 hover:text-indigo-600">Applications</Button>
                        <Button variant="ghost" className="text-slate-500 font-medium px-4 h-9 hover:text-indigo-600">Notifications</Button>
                        {userRole === "admin" && (
                            <Button variant="ghost" className="text-slate-500 font-medium px-4 h-9 hover:text-indigo-600">User Management</Button>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-600 font-bold uppercase text-[10px] px-2.5 py-1">
                        <Shield className="w-3 h-3" /> {userRole}
                    </Badge>

                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 relative rounded-full">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></span>
                    </Button>

                    <Separator orientation="vertical" className="h-6 mx-1" />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="pl-1 pr-2 rounded-full hover:bg-slate-100 h-10 gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                                <div className="text-left hidden sm:block">
                                    <p className="text-sm font-semibold text-slate-900 leading-none">{userName}</p>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2"><User className="w-4 h-4" /> Profile</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2"><Settings className="w-4 h-4" /> Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 gap-2 focus:text-red-600" onClick={handleSignOut}>
                                <LogOut className="w-4 h-4" /> Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-black">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            {userRole === "admin" ? "Admin Panel" : userRole === "faculty" ? "Faculty Dashboard" : "Dashboard Overview"}
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg italic">
                            {userRole === "admin" ? "Manage users and global applications." : userRole === "faculty" ? "Review and manage student applications." : "Detailed insights and management for your leave applications."}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {userRole === "student" && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md gap-2 shadow-indigo-200">
                                        <PlusSquare className="w-4 h-4" /> New Request
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Submit New Request</DialogTitle>
                                        <DialogDescription>
                                            Fill out the details for your leave or application.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="type">Type</Label>
                                            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                                    <SelectItem value="Conference">Conference</SelectItem>
                                                    <SelectItem value="Personal">Personal</SelectItem>
                                                    <SelectItem value="OD (On Duty)">OD (On Duty)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="duration">Duration</Label>
                                            <Input
                                                id="duration"
                                                placeholder="e.g. 2 days"
                                                value={form.duration}
                                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="priority">Priority</Label>
                                            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select priority" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="low">Low</SelectItem>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Reason (Optional)</Label>
                                            <Input
                                                id="reason"
                                                placeholder="Brief explanation"
                                                value={form.reason}
                                                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button type="submit" className="w-full bg-indigo-600" disabled={isSubmitting}>
                                                {isSubmitting ? "Submitting..." : "Submit Application"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Button variant="outline" className="gap-2 shadow-sm border-slate-200" onClick={() => fetchData()}>
                            <History className="w-4 h-4" /> Refresh
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-8">
                    <TabsList className="bg-slate-100/80 p-1 rounded-xl">
                        <TabsTrigger value="overview" className="rounded-lg px-6">Overview</TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-lg px-6">Notifications</TabsTrigger>
                        {userRole === "admin" && (
                            <TabsTrigger value="users" className="rounded-lg px-6">Users</TabsTrigger>
                        )}
                        <TabsTrigger value="history" className="rounded-lg px-6">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {statsCards.map((stat, i) => (
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
                                                <span className="text-slate-400 uppercase">Proportion</span>
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
                                            <CardTitle className="text-xl font-bold">
                                                {userRole === "student" ? "My Recent Applications" : "Recent Student Requests"}
                                            </CardTitle>
                                            <CardDescription>A summary of recent activity in the system.</CardDescription>
                                        </div>
                                        <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50 px-4">See All</Button>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow className="hover:bg-transparent border-0">
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">
                                                    {userRole === "student" ? "Type" : "Student"}
                                                </TableHead>
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Details</TableHead>
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12">Date</TableHead>
                                                <TableHead className="px-8 font-bold text-slate-400 uppercase text-[10px] tracking-widest h-12 text-right">Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoading ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">Updating records...</TableCell>
                                                </TableRow>
                                            ) : applications.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center py-10 text-slate-400 italic">No applications found.</TableCell>
                                                </TableRow>
                                            ) : (
                                                applications.map((app, i) => (
                                                    <TableRow key={app.id} className="group border-slate-50">
                                                        <TableCell className="px-8 py-5">
                                                            <div>
                                                                <span className="font-bold text-slate-800">
                                                                    {userRole === "student" ? app.type : app.user.name}
                                                                </span>
                                                                {userRole !== "student" && (
                                                                    <div className="text-[10px] text-slate-400 font-medium">{app.type}</div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <Badge
                                                                    variant={app.priority === "high" ? "destructive" : "secondary"}
                                                                    className="h-1.5 w-1.5 rounded-full p-0 flex shrink-0"
                                                                />
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{app.priority} Priority</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-8 py-5 text-slate-500 font-medium text-sm">
                                                            {app.duration}
                                                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{app.reason || "No reason provided"}</p>
                                                        </TableCell>
                                                        <TableCell className="px-8 py-5 text-slate-400 font-medium tabular-nums text-xs">
                                                            {new Date(app.createdAt).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell className="px-8 py-5 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Badge
                                                                    variant={app.status === "approved" ? "default" : app.status === "pending" ? "secondary" : "destructive"}
                                                                    className={`rounded-full px-3 py-0.5 font-bold uppercase text-[10px] tracking-tight ${app.status === "approved" ? "bg-emerald-50 text-emerald-600" :
                                                                        app.status === "pending" ? "bg-amber-50 text-amber-600" :
                                                                            "bg-rose-50 text-rose-600"
                                                                        } border-0`}
                                                                >
                                                                    {app.status}
                                                                </Badge>

                                                                {(userRole === "faculty" || userRole === "admin") && app.status === "pending" && (
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                                                                                <MoreVertical className="w-3 h-3" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, "approved")}>Approve</DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(app.id, "rejected")} className="text-red-600">Reject</DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
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

                            {/* Sidebar: Info & Quick Actions */}
                            <div className="space-y-8">
                                {/* Profile Card Mini */}
                                <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-[100px] pointer-events-none"></div>
                                    <CardContent className="p-8">
                                        <Avatar className="h-14 w-14 mb-4 border-2 border-white/20 shadow-xl">
                                            <AvatarFallback className="bg-white text-indigo-900 font-bold">{userInitials}</AvatarFallback>
                                        </Avatar>
                                        <h3 className="text-xl font-bold">{userName}</h3>
                                        <p className="text-indigo-200 text-sm">Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                                        <Separator className="my-6 bg-white/10" />
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-indigo-300">Account Status</span>
                                                <span className="text-emerald-400 font-bold italic">Active</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm font-medium">
                                                <span className="text-indigo-300">Last Active</span>
                                                <span className="tabular-nums">Today</span>
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

                    <TabsContent value="notifications">
                        <Card className="border-none shadow-sm overflow-hidden bg-white">
                            <CardHeader className="border-b px-8 py-6">
                                <CardTitle className="text-xl font-bold">Recent Updates</CardTitle>
                                <CardDescription>Stay informed about your application status and feedback.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {applications.filter(a => a.status !== 'pending').length === 0 ? (
                                        <div className="p-12 text-center text-slate-400 italic">No status updates yet.</div>
                                    ) : (
                                        applications.filter(a => a.status !== 'pending').map((app) => (
                                            <div key={app.id} className="p-6 hover:bg-slate-50 transition-colors flex items-start gap-4">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    app.status === 'approved' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                                )}>
                                                    {app.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-slate-900">Request {app.status === 'approved' ? "Authorized" : "Rejected"}</h4>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(app.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        Your <strong>{app.type}</strong> ({app.duration}) has been marked as <strong>{app.status}</strong>.
                                                    </p>
                                                    {app.comment && (
                                                        <div className="mt-3 bg-slate-50 border border-slate-100 p-3 rounded-xl italic text-sm text-slate-700">
                                                            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Faculty Feedback</span>
                                                            "{app.comment}"
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {userRole === "admin" && (
                        <TabsContent value="users">
                            <Card className="border-none shadow-sm overflow-hidden">
                                <CardHeader className="bg-white px-8 py-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold">User Management</CardTitle>
                                            <CardDescription>Manage user roles and permissions.</CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm font-bold text-slate-600">{users.length} Users</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50/50">
                                            <TableRow>
                                                <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">User</TableHead>
                                                <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">Email</TableHead>
                                                <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest text-slate-400">Role</TableHead>
                                                <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest text-slate-400 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((u) => (
                                                <TableRow key={u.id} className="border-slate-50">
                                                    <TableCell className="px-8 py-4 font-bold text-slate-800">{u.name}</TableCell>
                                                    <TableCell className="px-8 py-4 text-slate-500 text-sm">{u.email}</TableCell>
                                                    <TableCell className="px-8 py-4">
                                                        <Badge variant="outline" className="capitalize font-bold text-[10px] text-indigo-600 border-indigo-200 bg-indigo-50/50">
                                                            {u.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-4 text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => handleRoleUpdate(u.id, "student")}>Set as Student</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleRoleUpdate(u.id, "faculty")}>Set as Faculty</DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleRoleUpdate(u.id, "admin")} className="text-indigo-600 font-bold">Set as Admin</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </main>

            <footer className="mt-auto border-t bg-white py-12 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="bg-slate-900 p-1 rounded-md">
                            <span className="text-white font-bold text-xs px-1">🎓</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 uppercase italic tracking-tighter">Mini Project Portal</span>
                    </div>

                    <div className="flex gap-10 text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Support</a>
                    </div>

                    <div className="text-xs text-slate-400 font-medium italic">
                        &copy; 2026 Academic Management System.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default DashboardPage;
