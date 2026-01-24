"use client";

import {
  Home,
  Inbox,
  Calendar,
  Search,
  Settings,
  User2,
  ChevronUp,
  Building2Icon,
  FileBoxIcon,
  PieChartIcon,
  LineChartIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

// Menu items.
const items = [
  {
    title: "Report MAS 3",
    url: "/",
    icon: FileBoxIcon,
  },
  {
    title: "Data Quadran",
    url: "/data-quadran",
    icon: PieChartIcon,
  },
  {
    title: "Data Capaian Anggaran",
    url: "/data-anggaran",
    icon: LineChartIcon,
  },
];

const AppSidebar = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("USER");
  const [fullName, setFullName] = useState<string>("Administrator");
  const [userRole, setUserRole] = useState<string>("user");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedName = Cookies.get("userName");
    const storedFullName = Cookies.get("fullName");
    const storedRole = Cookies.get("userRole");
    if (storedName) {
      setUserName(storedName);
    }
    if (storedFullName) {
      setFullName(storedFullName);
    }
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const adminMenu = userRole === "admin" ? [
    {
      title: "User Management",
      url: "/user-management",
      icon: User2,
    }
  ] : [];

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        Cookies.remove("userName");
        Cookies.remove("sessionToken");
        router.push("/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="h-20 group-data-[collapsible=icon]:justify-center">
              <Link href="/">
                <Avatar className="h-14 w-14 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 rounded-full border border-primary/20 transition-all duration-300">
                  <AvatarImage
                    src="/images/avatars/logo.png"
                    alt="Logo Jasa Raharja"
                    className="object-cover scale-110"
                  />
                  <AvatarFallback className="bg-primary/5">JR</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-3">
                  <span className="truncate font-bold tracking-tight text-primary text-base">
                    JASARAHARJA
                  </span>
                  <span className="truncate text-[9px] text-muted-foreground uppercase font-medium tracking-wider opacity-70">
                    Monitoring CICO
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
      </SidebarHeader>
      <SidebarContent>
        {/*
           - [/] UI Refinements
    - [x] Restore decorative image in Sidebar with dynamic resizing
    - [x] Implement dynamic user name display from session/cookie
    - [/] Sync Sidebar Header branding with Navbar
    - [x] Fix Logo scaling and visibility issues
        */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {adminMenu.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="px-4 py-2 mt-4 transition-all duration-300 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:opacity-0">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border-2 border-primary/10 shadow-lg bg-sidebar-accent/50 transition-all duration-300">
          <img
            src="/images/avatars/gntr.jpg"
            alt="Decoration"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            {mounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                    <User2 className="shrink-0" />
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                      <span className="truncate font-semibold uppercase">
                        {fullName || userName}
                      </span>
                      <span className="truncate text-[10px] text-muted-foreground tracking-tighter">Setting & Authentication</span>
                    </div>
                    <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width]">
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Setting</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>SignOut</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton size="lg">
                <User2 className="shrink-0" />
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ml-2">
                  <span className="truncate font-semibold uppercase">
                    {fullName || userName}
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground tracking-tighter">Setting & Authentication</span>
                </div>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar >
  );
};

export default AppSidebar;
