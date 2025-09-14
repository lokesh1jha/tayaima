import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions) as any;
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  try {
    // Get basic counts
    const [productsCount, ordersCount, customersCount, adminsCount] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: "USER" } }), // Only count customers, not admins
      prisma.user.count({ where: { role: "ADMIN" } }), // Count admins separately
    ]);

    // Calculate total revenue
    const orders = await prisma.order.findMany({
      select: { totalAmount: true },
    });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get recent orders with customer names
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        customerName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    });

    // Get sales by day for the last 7 days
    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const dayOrders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        select: { totalAmount: true },
      });

      const dayTotal = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      salesData.push({
        date: dateStr,
        sales: dayTotal,
        orders: dayOrders.length,
      });
    }

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const formattedOrdersByStatus = ordersByStatus.map(item => ({
      status: item.status,
      count: item._count.id,
    }));

    // Get top products by sales
    const topProductsData = await prisma.orderItem.groupBy({
      by: ['variantId'],
      _sum: {
        quantity: true,
        total: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get product names for top products
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const variant = await prisma.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        
        return {
          name: variant?.product.name || 'Unknown Product',
          sales: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      })
    );

    const dashboardStats = {
      productsCount,
      ordersCount,
      customersCount, // Only customers (role: USER)
      adminsCount,    // Only admins (role: ADMIN)
      totalRevenue,
      recentOrders: recentOrders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
      })),
      salesByDay: salesData,
      ordersByStatus: formattedOrdersByStatus,
      topProducts: topProducts.slice(0, 5),
    };

    return NextResponse.json(dashboardStats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
