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
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import {
  Bell,
  ChevronUp,
  Home,
  PiggyBank,
  Target,
  WalletMinimal,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Link, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

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
    title: "Goals",
    url: "/goals",
    icon: PiggyBank,
  },
  {
    title: "Notifications",
    url: "/notifications",
    icon: Bell,
  },
];

export function AppSidebar() {
  const { data: user, isLoading } = useSuspenseQuery(
    convexQuery(api.user.getCurrentUser, {})
  );

  const { signOut } = useAuthActions();

  const router = useRouter();

  if (isLoading) {
    return (
      <SidebarMenu>
        {items.map((_, index) => (
          <SidebarMenuItem key={index}>
            <SidebarMenuSkeleton showIcon />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Sidebar className="border-black border-2">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* <img src="/logo.png" className="w-10 h-10 object-contain" alt="" /> */}
            <div className="w-10 h-10 rounded-sm bg-linear-to-br from-yellow-600 to-amber-600 shadow-lg flex items-center justify-center">
              <div className="text-xl font-bold text-white">$</div>
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
                      activeProps={{
                        className:
                          "bg-yellow-300 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px] font-semibold",
                      }}
                      inactiveProps={{
                        className:
                          "bg-gray-50 border-2 border-transparent hover:border-black hover:translate-x-[-1px] hover:translate-y-[-1px] font-medium",
                      }}
                    >
                      <item.icon />

                      <span className="text-lg">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>

                  {item.url === "/notifications" && (
                    <SidebarMenuBadge>24</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="text-lg font-semibold h-fit border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5">
                  <div className="w-16 h-16 flex items-center justify-center relative overflow-hidden rounded-full">
                    <img
                      src="https://cdn.pixabay.com/photo/2025/10/17/15/16/halloween-9900545_1280.jpg"
                      className="w-[60%] h-[60%] object-cover absolute"
                      alt=""
                    />

                    <img
                      src="/frames/default.svg"
                      className="w-full h-full object-cover z-10"
                      alt=""
                    />
                  </div>

                  <div className="flex flex-col leading-none gap-0">
                    <p>{user?.name}</p>

                    <div className="flex items-center">
                      <Zap width={16} height={16} />

                      <p className="text-sm">2000 XP</p>
                    </div>
                  </div>

                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[200px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-x-0.5 -translate-y-0.5"
              >
                <DropdownMenuItem className="bg-gray-50 border-2 border-transparent hover:border-black hover:-translate-x-px hover:-translate-y-px font-medium">
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-gray-50 border-2 border-transparent hover:border-black hover:-translate-x-px hover:-translate-y-px font-medium">
                  <span>Achievements</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="bg-gray-50 border-2 border-transparent hover:border-black hover:-translate-x-px hover:-translate-y-px font-medium">
                  <span>Insights</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void signOut();
                    router.navigate({ to: "/auth/login" });
                  }}
                  className="bg-gray-50 border-2 border-transparent hover:border-black hover:-translate-x-px hover:-translate-y-px font-medium"
                >
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
