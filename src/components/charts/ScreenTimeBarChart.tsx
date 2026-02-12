import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ScreenTimeBarChartProps {
  data: { label: string; hours: number }[];
}

export default function ScreenTimeBarChart({ data }: ScreenTimeBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontFamily: 'JetBrains Mono' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontFamily: 'JetBrains Mono' }}
          tickFormatter={(v) => `${v}h`}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
            fontFamily: 'JetBrains Mono',
            fontSize: '12px',
          }}
          formatter={(value: number) => [`${value.toFixed(1)}h`, 'Screen Time']}
          cursor={{ fill: 'hsl(var(--neon-cyan) / 0.05)' }}
        />
        <Bar dataKey="hours" fill="hsl(var(--neon-cyan))" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
