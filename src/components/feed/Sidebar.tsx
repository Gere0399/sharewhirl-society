import { Link, useLocation } from "react-router-dom";
import { Home, PlusCircle, Bell, Sparkles, CreditCard } from "lucide-react";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarOptionsMenu } from "./sidebar/SidebarOptionsMenu";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

export function Sidebar({ isCreatePostOpen, setIsCreatePostOpen }: SidebarProps) {
  const location = useLocation();
  const isMobile = useIsMobile();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={`fixed ${
        isMobile ? "bottom-0 left-0 right-0 h-16" : "left-0 top-0 h-screen w-16"
      } z-30 flex ${
        isMobile ? "flex-row" : "flex-col"
      } items-center border-r bg-background pb-4`}
    >
      {!isMobile && (
        <>
          <SidebarLogo />
          <div className="h-4" />
        </>
      )}

      <div
        className={`flex ${
          isMobile ? "flex-row justify-around w-full" : "flex-col space-y-2"
        }`}
      >
        <SidebarNavItem to="/" icon={Home} label="Home" isActive={isActive("/")} />
        <SidebarNavItem
          to="#"
          icon={PlusCircle}
          label="Create Post"
          isActive={isCreatePostOpen}
          onClick={() => setIsCreatePostOpen(true)}
          asButton
        />
        <SidebarNavItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
          isActive={isActive("/notifications")}
        />
        <SidebarNavItem
          to="/generate"
          icon={Sparkles}
          label="Generate"
          isActive={isActive("/generate")}
        />
        <SidebarNavItem
          to="/subscriptions"
          icon={CreditCard}
          label="Subscriptions"
          isActive={isActive("/subscriptions")}
        />
      </div>

      {!isMobile && (
        <div className="mt-auto">
          <SidebarOptionsMenu />
        </div>
      )}
    </aside>
  );
}