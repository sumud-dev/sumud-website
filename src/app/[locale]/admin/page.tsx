"use client";

import { Link } from "@/src/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  FileText,
  Calendar,
  Megaphone,
  Users,
  TrendingUp,
  Eye,
  ArrowRight,
  Plus,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Progress } from "@/src/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// Mock data for charts
const viewsData = [
  { month: "Jan", views: 1200, articles: 5 },
  { month: "Feb", views: 1800, articles: 7 },
  { month: "Mar", views: 2400, articles: 8 },
  { month: "Apr", views: 2100, articles: 6 },
  { month: "May", views: 3200, articles: 10 },
  { month: "Jun", views: 2800, articles: 8 },
  { month: "Jul", views: 3500, articles: 12 },
  { month: "Aug", views: 4200, articles: 14 },
  { month: "Sep", views: 3800, articles: 11 },
  { month: "Oct", views: 4500, articles: 15 },
  { month: "Nov", views: 5200, articles: 18 },
  { month: "Dec", views: 4800, articles: 16 },
];

const weeklyActivityData = [
  { day: "Mon", articles: 3, events: 1, campaigns: 0 },
  { day: "Tue", articles: 5, events: 2, campaigns: 1 },
  { day: "Wed", articles: 2, events: 0, campaigns: 2 },
  { day: "Thu", articles: 4, events: 3, campaigns: 1 },
  { day: "Fri", articles: 6, events: 2, campaigns: 0 },
  { day: "Sat", articles: 1, events: 4, campaigns: 1 },
  { day: "Sun", articles: 2, events: 1, campaigns: 0 },
];

const contentDistribution = [
  { name: "Articles", value: 45, fill: "var(--color-articles)" },
  { name: "Events", value: 28, fill: "var(--color-events)" },
  { name: "Campaigns", value: 18, fill: "var(--color-campaigns)" },
  { name: "Categories", value: 9, fill: "var(--color-categories)" },
];

const engagementData = [
  { hour: "00:00", visitors: 120 },
  { hour: "03:00", visitors: 80 },
  { hour: "06:00", visitors: 150 },
  { hour: "09:00", visitors: 420 },
  { hour: "12:00", visitors: 580 },
  { hour: "15:00", visitors: 650 },
  { hour: "18:00", visitors: 520 },
  { hour: "21:00", visitors: 380 },
];

// Stats data - translation keys
const getStats = (t: (key: string) => string) => [
  {
    name: t("stats.totalArticles"),
    value: "124",
    change: "+12%",
    changeType: "positive",
    icon: FileText,
    description: t("stats.totalArticlesDesc"),
  },
  {
    name: t("stats.activeCampaigns"),
    value: "8",
    change: "+2",
    changeType: "positive",
    icon: Megaphone,
    description: t("stats.activeCampaignsDesc"),
  },
  {
    name: t("stats.upcomingEvents"),
    value: "15",
    change: "3 this week",
    changeType: "neutral",
    icon: Calendar,
    description: t("stats.upcomingEventsDesc"),
  },
  {
    name: t("stats.totalViews"),
    value: "48.2K",
    change: "+23%",
    changeType: "positive",
    icon: Eye,
    description: t("stats.totalViewsDesc"),
  },
];

const recentArticles = [
  {
    id: "1",
    title: "Understanding Palestinian Resilience",
    status: "published",
    views: 1234,
    date: "Dec 5, 2025",
    category: "Culture",
  },
  {
    id: "2",
    title: "Community Support Initiatives",
    status: "draft",
    views: 0,
    date: "Dec 4, 2025",
    category: "Community",
  },
  {
    id: "3",
    title: "Voices from the Ground",
    status: "published",
    views: 856,
    date: "Dec 3, 2025",
    category: "Stories",
  },
  {
    id: "4",
    title: "Educational Programs Update",
    status: "published",
    views: 642,
    date: "Dec 2, 2025",
    category: "Education",
  },
];

const upcomingEvents = [
  {
    id: "1",
    title: "Community Gathering",
    date: "Dec 15, 2025",
    location: "Community Center",
    attendees: 45,
    status: "upcoming",
  },
  {
    id: "2",
    title: "Cultural Exhibition",
    date: "Dec 20, 2025",
    location: "Art Gallery",
    attendees: 120,
    status: "upcoming",
  },
  {
    id: "3",
    title: "Educational Workshop",
    date: "Dec 22, 2025",
    location: "Online",
    attendees: 85,
    status: "upcoming",
  },
];

const topCategories = [
  { name: "Culture", articles: 32, percentage: 26 },
  { name: "Community", articles: 28, percentage: 23 },
  { name: "Stories", articles: 24, percentage: 19 },
  { name: "Education", articles: 22, percentage: 18 },
  { name: "News", articles: 18, percentage: 14 },
];

// Chart configurations
const viewsChartConfig = {
  views: {
    label: "Views",
    color: "hsl(var(--chart-1))",
  },
  articles: {
    label: "Articles",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const activityChartConfig = {
  articles: {
    label: "Articles",
    color: "hsl(var(--chart-1))",
  },
  events: {
    label: "Events",
    color: "hsl(var(--chart-2))",
  },
  campaigns: {
    label: "Campaigns",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const pieChartConfig = {
  articles: {
    label: "Articles",
    color: "hsl(var(--chart-1))",
  },
  events: {
    label: "Events",
    color: "hsl(var(--chart-2))",
  },
  campaigns: {
    label: "Campaigns",
    color: "hsl(var(--chart-3))",
  },
  categories: {
    label: "Categories",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const engagementChartConfig = {
  visitors: {
    label: "Visitors",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const t = useTranslations("admin.dashboard");
  
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("welcome")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/articles">
              <BarChart3 className="h-4 w-4 mr-2" />
              {t("viewAnalytics")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/articles/new">
              <Plus className="h-4 w-4 mr-2" />
              {t("newArticle")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {getStats(t).map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-muted-foreground"
                  }
                >
                  {stat.change}
                </span>
                <span className="text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Views & Articles Trend */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{t("monthlyOverview")}</CardTitle>
            <CardDescription>
              {t("monthlyOverviewDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={viewsChartConfig} className="h-[300px]">
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-views)"
                  fill="var(--color-views)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Content Distribution */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t("contentDistribution")}</CardTitle>
            <CardDescription>{t("contentDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieChartConfig} className="h-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={contentDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {contentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {contentDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row of charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Content created by day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={activityChartConfig} className="h-[250px]">
              <BarChart data={weeklyActivityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="articles"
                  fill="var(--color-articles)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="events"
                  fill="var(--color-events)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="campaigns"
                  fill="var(--color-campaigns)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Visitor Engagement */}
        <Card>
          <CardHeader>
            <CardTitle>{t("visitorEngagement")}</CardTitle>
            <CardDescription>{t("visitorEngagementDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={engagementChartConfig} className="h-[250px]">
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="var(--color-visitors)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Content sections */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Articles */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("recentArticles")}</CardTitle>
                <CardDescription>{t("recentArticlesDesc")}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/articles">
                  {t("viewAll")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <Link
                      href={`/articles/${article.id}/edit`}
                      className="font-medium hover:underline truncate block"
                    >
                      {article.title}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          article.status === "published"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}
                      >
                        {t(article.status)}
                      </span>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        {article.category}
                      </span>
                      <span className="hidden sm:inline">{article.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground ml-4">
                    <Eye className="h-4 w-4" />
                    {article.views.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>{t("topCategories")}</CardTitle>
            <CardDescription>{t("topCategoriesDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.map((category) => (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{category.name}</span>
                    <span className="text-muted-foreground">
                      {category.articles} {t("articles")}
                    </span>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("upcomingEventsCard")}</CardTitle>
                <CardDescription>{t("upcomingEventsCardDesc")}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/events">
                  {t("viewAll")}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-medium">
                      {event.date.split(" ")[0]}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {event.date.split(" ")[1].replace(",", "")}
                    </span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="font-medium hover:underline"
                    >
                      {event.title}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {event.attendees}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("quickActions")}</CardTitle>
            <CardDescription>{t("quickActionsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="create" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">{t("createTab")}</TabsTrigger>
                <TabsTrigger value="manage">{t("manageTab")}</TabsTrigger>
              </TabsList>
              <TabsContent value="create" className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/articles/new">
                    <FileText className="h-4 w-4 mr-2" />
                    {t("createNewArticle")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/campaigns/new">
                    <Megaphone className="h-4 w-4 mr-2" />
                    {t("startACampaign")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/events/new">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("scheduleAnEvent")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/page-builder/new">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {t("addNewPage")}
                  </Link>
                </Button>
              </TabsContent>
              <TabsContent value="manage" className="mt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/articles">
                    <FileText className="h-4 w-4 mr-2" />
                    {t("manageArticles")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/campaigns">
                    <Megaphone className="h-4 w-4 mr-2" />
                    {t("viewCampaigns")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    {t("manageEvents")}
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/admin/page-builder">
                    <Users className="h-4 w-4 mr-2" />
                    {t("managePages")}
                  </Link>
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
