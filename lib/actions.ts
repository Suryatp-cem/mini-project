"use server";

import { prisma } from "./prisma";
import { auth } from "./auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getSession() {
    return await auth.api.getSession({
        headers: await headers(),
    });
}

export async function createApplication(formData: {
    type: string;
    duration: string;
    priority: string;
    reason?: string;
}) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const application = await prisma.application.create({
        data: {
            userId: session.user.id,
            type: formData.type,
            duration: formData.duration,
            priority: formData.priority,
            reason: formData.reason,
            status: "pending",
        },
    });

    revalidatePath("/dashboard");
    return application;
}

export async function updateApplicationStatus(id: string, status: string, comment?: string) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    // Check if user is Faculty or Admin
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || (user.role !== "faculty" && user.role !== "admin")) {
        console.error("Forbidden access attempt. User:", user);
        throw new Error("Forbidden: Only Faculty or Admin can update status");
    }

    console.log("Updating application status:", { id, status, comment });

    try {
        const application = await prisma.application.update({
            where: { id },
            data: {
                status,
                comment: comment || null
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/faculty/dashboard");
        revalidatePath("/admin/dashboard");
        return application;
    } catch (dbError) {
        console.error("Prisma update error:", dbError);
        throw dbError;
    }
}

export async function getApplicationStats() {
    const session = await getSession();
    if (!session || !session.user) {
        return { total: 0, approved: 0, pending: 0 };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) return { total: 0, approved: 0, pending: 0 };

    let whereClause = {};
    if (user.role === "student") {
        whereClause = { userId: user.id };
    }

    const [total, approved, pending] = await Promise.all([
        prisma.application.count({ where: whereClause }),
        prisma.application.count({ where: { ...whereClause, status: "approved" } }),
        prisma.application.count({ where: { ...whereClause, status: "pending" } }),
    ]);

    return { total, approved, pending };
}

export async function getRecentApplications(limit = 5) {
    const session = await getSession();
    if (!session || !session.user) {
        return [];
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) return [];

    let whereClause = {};
    if (user.role === "student") {
        whereClause = { userId: user.id };
    }

    return await prisma.application.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

export async function getAllUsers() {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user || user.role !== "admin") {
        throw new Error("Forbidden: Only Admin can manage users");
    }

    return await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });
}

export async function updateUserRole(userId: string, role: string) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!adminUser || adminUser.role !== "admin") {
        throw new Error("Forbidden: Only Admin can update roles");
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
    });

    revalidatePath("/dashboard");
    return updatedUser;
}

export async function createAnnouncement(data: { title: string; content: string; priority: string }) {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "admin") throw new Error("Forbidden");

    const announcement = await prisma.announcement.create({
        data: {
            ...data,
            authorId: user.id,
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin/dashboard");
    return announcement;
}

export async function getAnnouncements() {
    return await prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            author: { select: { name: true } },
        },
    });
}

export async function getSystemAnalytics() {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "admin") throw new Error("Forbidden");

    // Real analytics for various types/statuses
    const [userCounts, applicationTrends] = await Promise.all([
        prisma.user.groupBy({
            by: ['role'],
            _count: true,
        }),
        prisma.application.groupBy({
            by: ['status'],
            _count: true,
        }),
    ]);

    // Format for charts
    const userStats = userCounts.map(u => ({ role: u.role, count: u._count }));
    const appStats = applicationTrends.map(a => ({ status: a.status, count: a._count }));

    return { userStats, appStats };
}

export async function getAuditLogs() {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "admin") throw new Error("Forbidden");

    return await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: { select: { name: true, email: true } },
        },
        take: 50,
    });
}

export async function deleteAnnouncement(id: string) {
    const session = await getSession();
    if (!session || !session.user) throw new Error("Unauthorized");

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user || user.role !== "admin") throw new Error("Forbidden");

    await prisma.announcement.delete({ where: { id } });

    revalidatePath("/dashboard");
    revalidatePath("/admin/dashboard");
}
