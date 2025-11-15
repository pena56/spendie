import Layout from "@/components/layout";
import NotificationCard from "@/components/notifications/notification-card";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/notifications")({
  component: RouteComponent,
});

const notifications = [
  {
    id: "1",
    type: "achievement",
    title: "7-Day Spending Streak!",
    description: "You've tracked your expenses for 7 consecutive days",
    unread: true,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: "🔥",
    color: "bg-orange-50",
  },
  {
    id: "2",
    type: "alert",
    title: "Budget Alert",
    description: "You've used 85% of your Entertainment budget",
    unread: true,
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    icon: "⚠️",
    color: "bg-red-50",
  },
  {
    id: "3",
    type: "invite",
    title: "Split Bill Invite",
    description: "Sarah invited you to split dinner expenses",
    avatar: "👩",
    actionText: "Accept",
    unread: true,
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    icon: "👥",
    color: "bg-blue-50",
  },
  {
    id: "4",
    type: "insight",
    title: "Spending Insight",
    description: "Your coffee spending is 20% higher this month",
    unread: false,
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    icon: "💡",
    color: "bg-purple-50",
  },
  {
    id: "5",
    type: "settlement",
    title: "Settlement Complete",
    description: "You received ₦5,000 from Mike for split expenses",
    avatar: "👨",
    unread: false,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: "✅",
    color: "bg-green-50",
  },
  {
    id: "6",
    type: "alert",
    title: "Monthly Limit Approaching",
    description: "You've spent ₦450,000 of your ₦500,000 monthly limit",
    unread: false,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    icon: "💰",
    color: "bg-amber-50",
  },
];

function RouteComponent() {
  return (
    <Layout title="Notifications">
      {notifications.map((notif, index) => (
        <NotificationCard key={index} notification={notif} />
      ))}
    </Layout>
  );
}
