import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Home,
  LogOut,
  PiggyBank,
  Split,
  Target,
  Trophy,
  User,
  WalletMinimal,
} from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  getAvatarById,
  getBackgroundById,
  getFrameById,
} from "@/constants/prizes";
import { AvatarDisplay } from "./avatar-display";
import { Progress } from "./ui/progress";

const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: WalletMinimal,
  },
  {
    title: "Budgets",
    url: "/budgets",
    icon: Target,
  },
  {
    title: "Split Bills",
    url: "/splits",
    icon: Split,
  },
  {
    title: "Achievements",
    url: "/achievements",
    icon: Trophy,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
];

export function AppSidebar() {
  const { data: user } = useQuery(convexQuery(api.user.getCurrentUser, {}));

  const { data: pendingInvites } = useQuery(
    convexQuery(api.splits.getUserPendingInvites, {})
  );

  const { signOut } = useAuthActions();

  const router = useRouter();

  return (
    <Sidebar className="border-black border-2">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-sm bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 flex items-center justify-center">
              <PiggyBank className="w-7 h-7 text-black" />
            </div>
            <p className="text-2xl uppercase font-semibold">Spendie</p>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className="rounded-sm"
                      activeProps={{
                        className:
                          "bg-yellow-300 hover:bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 font-semibold",
                      }}
                      inactiveProps={{
                        className:
                          "bg-gray-50 border-2 border-transparent hover:border-black hover:-translate-x-0.5 hover:-translate-y-0.5 font-medium",
                      }}
                    >
                      <item.icon />

                      <span className="text-lg">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  {item.url === "/splits" &&
                  pendingInvites &&
                  pendingInvites > 0 ? (
                    <SidebarMenuBadge className="w-5 h-5 rounded-full flex items-center justify-center leading-none bg-yellow-300 border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5 text-xs font-black animate-bounce">
                      {pendingInvites}
                    </SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => {
                    await signOut();
                    router.navigate({ to: "/auth/login" });
                  }}
                  className="bg-gray-50 border-2 border-transparent hover:border-black hover:-translate-x-0.5 hover:-translate-y-0.5 font-medium"
                >
                  <LogOut />

                  <span className="text-lg">Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="text-lg font-semibold rounded-sm h-fit border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5">
                <AvatarDisplay
                  src={getAvatarById(user.image)?.src}
                  bgColor={getBackgroundById(user.background)?.color}
                  frameStyle={getFrameById(user.frame)?.style}
                  size={64}
                />

                <div className="flex flex-col leading-none gap-0 w-full">
                  <p>{user?.name}</p>

                  <div className="flex items-center gap-2">
                    <Progress value={user?.percentageProgress} />

                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-yellow-300 shrink-0 font-black leading-none border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5">
                      {user?.level}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <p className="text-sm">
                      {" "}
                      {user?.totalXP} / {user?.xpForNextLevel} XP
                    </p>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
