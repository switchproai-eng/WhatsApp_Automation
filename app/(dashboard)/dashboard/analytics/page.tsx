"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MessageSquare,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Download,
} from "lucide-react";

const messageData = [
  { date: "Jan 1", sent: 1200, delivered: 1180, read: 980 },
  { date: "Jan 2", sent: 1350, delivered: 1320, read: 1100 },
  { date: "Jan 3", sent: 1100, delivered: 1080, read: 890 },
  { date: "Jan 4", sent: 1500, delivered: 1470, read: 1250 },
  { date: "Jan 5", sent: 1400, delivered: 1380, read: 1150 },
  { date: "Jan 6", sent: 1250, delivered: 1230, read: 1020 },
  { date: "Jan 7", sent: 1600, delivered: 1570, read: 1320 },
];

const conversationData = [
  { date: "Jan 1", new: 45, resolved: 38 },
  { date: "Jan 2", new: 52, resolved: 48 },
  { date: "Jan 3", new: 38, resolved: 42 },
  { date: "Jan 4", new: 65, resolved: 55 },
  { date: "Jan 5", new: 58, resolved: 62 },
  { date: "Jan 6", new: 42, resolved: 45 },
  { date: "Jan 7", new: 70, resolved: 58 },
];

const agentPerformance = [
  { name: "Sarah J.", conversations: 145, avgResponse: "2.5 min", satisfaction: 4.8 },
  { name: "Mike W.", conversations: 128, avgResponse: "3.2 min", satisfaction: 4.6 },
  { name: "Emily D.", conversations: 112, avgResponse: "2.8 min", satisfaction: 4.7 },
  { name: "John S.", conversations: 98, avgResponse: "4.1 min", satisfaction: 4.4 },
];

const channelDistribution = [
  { name: "Direct Messages", value: 45, color: "#25D366" },
  { name: "Campaigns", value: 30, color: "#128C7E" },
  { name: "Automation", value: 25, color: "#075E54" },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7d");

  const stats = [
    {
      label: "Total Messages",
      value: "9,400",
      change: "+12.5%",
      trend: "up",
      icon: MessageSquare,
    },
    {
      label: "Delivery Rate",
      value: "98.2%",
      change: "+0.8%",
      trend: "up",
      icon: CheckCircle2,
    },
    {
      label: "Read Rate",
      value: "82.4%",
      change: "-2.1%",
      trend: "down",
      icon: Eye,
    },
    {
      label: "Avg Response Time",
      value: "3.2 min",
      change: "-15%",
      trend: "up",
      icon: Clock,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            Track your WhatsApp performance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px] bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Message Delivery</CardTitle>
                <CardDescription>
                  Track sent, delivered, and read messages over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={messageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="#25D366"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="delivered"
                      stroke="#128C7E"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="read"
                      stroke="#075E54"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Message Sources</CardTitle>
                <CardDescription>
                  Distribution by channel type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={channelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {channelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-4">
                  {channelDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversations" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Conversation Trends</CardTitle>
              <CardDescription>
                New vs resolved conversations over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={conversationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="new" fill="#25D366" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#128C7E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="mt-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Agent Performance</CardTitle>
              <CardDescription>
                Track individual agent metrics and productivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agent</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Conversations</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg Response</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agentPerformance.map((agent, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-4 px-4">
                          <span className="font-medium text-foreground">{agent.name}</span>
                        </td>
                        <td className="py-4 px-4 text-muted-foreground">{agent.conversations}</td>
                        <td className="py-4 px-4 text-muted-foreground">{agent.avgResponse}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">{agent.satisfaction}</span>
                            <span className="text-primary">★</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
