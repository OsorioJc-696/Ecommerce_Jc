
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";
import { BarChart, LineChart } from "@/components/ui/chart"; // Assuming chart components exist
import { getAllOrders } from "@/lib/orders"; // Fetch order data
import { getAllProducts } from "@/lib/products"; // Fetch product data
import { useEffect, useState, useMemo } from "react";

// Mock data structure for charts - replace with actual data fetching and processing
const salesData = [
  { month: "Jan", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Feb", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Mar", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Apr", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "May", revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: "Jun", revenue: Math.floor(Math.random() * 5000) + 1000 },
];

const productSalesData = [
    { name: 'Custom PC', sales: Math.floor(Math.random() * 50) + 10 },
    { name: 'XPS 15', sales: Math.floor(Math.random() * 50) + 10 },
    { name: 'MacBook Air', sales: Math.floor(Math.random() * 50) + 10 },
    { name: 'Nikon D550', sales: Math.floor(Math.random() * 50) + 10 },
    { name: 'MX Master 3S', sales: Math.floor(Math.random() * 50) + 10 },
];

const chartConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  sales: { label: "Sales", color: "hsl(var(--chart-2))" },
} satisfies import("@/components/ui/chart").ChartConfig; // Use ChartConfig type


export default function AdminDashboardPage() {
   // In a real app, fetch user count from your auth system/database
  const [userCount, setUserCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

   // Fetch data on component mount (client-side)
   useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Esperar a que se resuelva la promesa
        const orders = await getAllOrders();
        setTotalOrders(orders.length);
        const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
        setTotalRevenue(revenue);
  
        const products = await getAllProducts();
        setTotalProducts(products.length);
  
        const storedUsers = localStorage.getItem('registeredUsers');
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        setUserCount(users.length);
  
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      }
    }
  
    fetchData();
  }, []);
  


  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month (mock)</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{userCount}</div>
            <p className="text-xs text-muted-foreground">+19% from last month (mock)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Live in store</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue trends.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
             {/* Placeholder: Requires Recharts integration */}
             {/* Example using assumed LineChart component */}
              {/*} <LineChart
                 data={salesData}
                 config={chartConfig}
                 index="month"
                 categories={["revenue"]}
             /> */}
             <div className="flex items-center justify-center h-full text-muted-foreground">
                 Revenue Chart Placeholder
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Based on recent sales volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
             {/* Placeholder: Requires Recharts integration */}
             {/* Example using assumed BarChart component */}
             {/**  <BarChart
                 data={productSalesData}
                 config={chartConfig}
                 index="name"
                 categories={["sales"]}
                 layout="vertical"
             />*/}
            <div className="flex items-center justify-center h-full text-muted-foreground">
                 Product Sales Chart Placeholder
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Recent orders will be displayed here...</p>
          {/* Add a table component here later */}
        </CardContent>
      </Card>
    </div>
  );
}
