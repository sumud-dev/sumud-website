"use client";

import React from "react";
import { Users, UserCheck, UserPlus, Clock } from "lucide-react";
import UserStatsCard from "./UserStatsCard";

interface UserStatsProps {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  newUsersThisMonth: number;
}

const UserStats = ({
  totalUsers,
  activeUsers,
  pendingUsers,
  newUsersThisMonth,
}: UserStatsProps) => {
  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      description: "All registered users",
      icon: Users,
      iconClassName: "text-blue-500",
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: "Currently active",
      icon: UserCheck,
      iconClassName: "text-green-500",
    },
    {
      title: "Pending Approval",
      value: pendingUsers,
      description: "Awaiting verification",
      icon: Clock,
      iconClassName: "text-yellow-500",
    },
    {
      title: "New This Month",
      value: newUsersThisMonth,
      description: "Joined recently",
      icon: UserPlus,
      iconClassName: "text-purple-500",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <UserStatsCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
          iconClassName={stat.iconClassName}
        />
      ))}
    </div>
  );
};

export default UserStats;
