import { useUser } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: user, isLoading } = useUser();

  if (isLoading) return null;

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      change: "+20.1%",
      trend: "up",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Active Users",
      value: "2,350",
      change: "+180.1%",
      trend: "up",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Bounce Rate",
      value: "12.23%",
      change: "-4.5%",
      trend: "down",
      icon: Activity,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Growth",
      value: "+573",
      change: "+201%",
      trend: "up",
      icon: TrendingUp,
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    }
  ];

  return (
    <LayoutShell user={user}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, {user?.name}. Here's what's happening today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white">
              Download Report
            </Button>
            <Button className="shadow-lg shadow-primary/25">
              Create New
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={stat.title}
              className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.trend === 'up' ? (
                  <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.change} <ArrowUpRight className="w-3 h-3 ml-1" />
                  </span>
                ) : (
                  <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                    {stat.change} <ArrowDownRight className="w-3 h-3 ml-1" />
                  </span>
                )}
              </div>
              <h3 className="text-slate-500 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in animate-delay-300">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-slate-900">Recent Transactions</h2>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-5 h-5 text-slate-400" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                          JD
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">John Doe</p>
                          <p className="text-xs text-slate-500">john@example.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      Oct 24, 2024
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium text-right">
                      $250.00
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
