import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = todayStart.toISOString();

    // Today's revenue
    const todaySales = await db.sale.findMany({
      where: {
        tenantId: TENANT_ID,
        status: 'completed',
        createdAt: { gte: todayStr },
      },
      select: { total: true },
    });
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

    // Today's appointment count
    const todayAppointments = await db.appointment.findMany({
      where: {
        tenantId: TENANT_ID,
        date: { gte: todayStr, lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString() },
      },
    });

    // Average ticket from all sales
    const allSales = await db.sale.findMany({
      where: { tenantId: TENANT_ID, status: 'completed' },
      select: { total: true },
    });
    const avgTicket = allSales.length > 0
      ? allSales.reduce((sum, s) => sum + s.total, 0) / allSales.length
      : 0;

    // Active clients count
    const activeClientsCount = await db.client.count({
      where: { tenantId: TENANT_ID, isActive: true },
    });

    // Appointments by status (today)
    const appointmentsByStatus: Record<string, number> = {};
    for (const appt of todayAppointments) {
      appointmentsByStatus[appt.status] = (appointmentsByStatus[appt.status] || 0) + 1;
    }

    // Revenue chart data (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const recentSales = await db.sale.findMany({
      where: {
        tenantId: TENANT_ID,
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo.toISOString() },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    });

    const revenueByDay: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      revenueByDay[key] = 0;
    }
    for (const sale of recentSales) {
      const key = new Date(sale.createdAt).toISOString().split('T')[0];
      if (key in revenueByDay) {
        revenueByDay[key] += sale.total;
      }
    }
    const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));

    // Top 5 clients by totalSpent
    const topClients = await db.client.findMany({
      where: { tenantId: TENANT_ID, isActive: true },
      orderBy: { totalSpent: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        totalSpent: true,
        totalVisits: true,
        avgTicket: true,
        phone: true,
        email: true,
      },
    });

    // Next upcoming appointments (today, scheduled/confirmed)
    const upcomingAppointments = await db.appointment.findMany({
      where: {
        tenantId: TENANT_ID,
        date: { gte: todayStr, lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000).toISOString() },
        status: { in: ['scheduled', 'confirmed'] },
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true, color: true } },
        services: { include: { service: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    // Low stock products
    const lowStockProducts = await db.product.findMany({
      where: {
        tenantId: TENANT_ID,
        isActive: true,
        stock: { lte: 5 },
      },
      orderBy: { stock: 'asc' },
    });

    // Recent sales (last 5)
    const recentSalesData = await db.sale.findMany({
      where: { tenantId: TENANT_ID, status: 'completed' },
      include: {
        client: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Team performance (appointments this week per professional)
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekAppointments = await db.appointment.findMany({
      where: {
        tenantId: TENANT_ID,
        date: { gte: weekStart.toISOString(), lt: weekEnd.toISOString() },
      },
      include: {
        professional: { select: { id: true, name: true, color: true } },
      },
    });

    const teamPerformanceMap: Record<string, { name: string; color: string; count: number }> = {};
    for (const apt of weekAppointments) {
      const proId = apt.professional.id;
      if (!teamPerformanceMap[proId]) {
        teamPerformanceMap[proId] = {
          name: apt.professional.name,
          color: apt.professional.color || '#888',
          count: 0,
        };
      }
      teamPerformanceMap[proId].count++;
    }
    const teamPerformance = Object.values(teamPerformanceMap);

    // Popular services (top 5 by appointment count)
    const appointmentServices = await db.appointmentService.findMany({
      where: {
        appointment: { tenantId: TENANT_ID },
      },
      include: {
        service: { select: { id: true, name: true, category: true } },
      },
    });

    const serviceCountMap: Record<string, { name: string; category: string; count: number }> = {};
    for (const as of appointmentServices) {
      const sId = as.service.id;
      if (!serviceCountMap[sId]) {
        serviceCountMap[sId] = {
          name: as.service.name,
          category: as.service.category || 'Outros',
          count: 0,
        };
      }
      serviceCountMap[sId].count++;
    }
    const popularServices = Object.values(serviceCountMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Client segments (count by tag)
    const clientTags = await db.clientTagAssignment.findMany({
      where: {
        client: { tenantId: TENANT_ID, isActive: true },
      },
      include: {
        tag: { select: { id: true, name: true, color: true } },
      },
    });

    const segmentMap: Record<string, { name: string; color: string; count: number }> = {};
    // Also count clients without tags as "Sem Tag"
    const totalActiveClients = activeClientsCount;
    for (const ct of clientTags) {
      const tId = ct.tag.id;
      if (!segmentMap[tId]) {
        segmentMap[tId] = {
          name: ct.tag.name,
          color: ct.tag.color,
          count: 0,
        };
      }
      segmentMap[tId].count++;
    }
    const taggedCount = Object.values(segmentMap).reduce((sum, s) => sum + s.count, 0);
    if (taggedCount < totalActiveClients) {
      segmentMap['no-tag'] = {
        name: 'Sem Tag',
        color: '#94a3b8',
        count: totalActiveClients - taggedCount,
      };
    }
    const clientSegments = Object.values(segmentMap);

    // Upcoming birthdays (this month)
    const currentMonth = now.getMonth() + 1;
    const allClientsWithBirthday = await db.client.findMany({
      where: {
        tenantId: TENANT_ID,
        isActive: true,
        birthday: { not: null },
      },
      select: {
        id: true,
        name: true,
        phone: true,
        birthday: true,
      },
    });

    const upcomingBirthdays = allClientsWithBirthday.filter((c) => {
      if (!c.birthday) return false;
      const bMonth = new Date(c.birthday).getMonth() + 1;
      return bMonth === currentMonth;
    }).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      birthday: c.birthday!.toISOString(),
      day: new Date(c.birthday!).getDate(),
    }));

    // Smart suggestions (top 3)
    const smartSuggestions = await db.smartSuggestion.findMany({
      where: { tenantId: TENANT_ID, isRead: false, isResolved: false },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 3,
    });

    return Response.json({
      todayRevenue: Math.round(todayRevenue * 100) / 100,
      todayAppointments: todayAppointments.length,
      avgTicket: Math.round(avgTicket * 100) / 100,
      activeClientsCount,
      appointmentsByStatus,
      revenueChart,
      topClients,
      upcomingAppointments,
      lowStockProducts,
      recentSales: recentSalesData,
      teamPerformance,
      popularServices,
      clientSegments,
      upcomingBirthdays,
      smartSuggestions,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return Response.json(
      { error: 'Failed to fetch dashboard data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
