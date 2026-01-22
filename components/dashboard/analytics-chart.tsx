"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

// Generate mock data for the last 7 days
function generateMockData() {
  const data = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      messages: Math.floor(Math.random() * 500) + 100,
      conversations: Math.floor(Math.random() * 50) + 10,
      responses: Math.floor(Math.random() * 300) + 50,
    })
  }
  
  return data
}

interface AnalyticsChartProps {
  tenantId: string
}

export function AnalyticsChart({ tenantId }: AnalyticsChartProps) {
  // In production, this would fetch real data
  const data = generateMockData()
  
  // Suppress unused variable warning
  void tenantId

  return (
    <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-gray-900">Message Activity (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: "#111827",
                }}
                labelStyle={{ color: "#111827" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="messages"
                name="Messages"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="conversations"
                name="Conversations"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="responses"
                name="Responses"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
