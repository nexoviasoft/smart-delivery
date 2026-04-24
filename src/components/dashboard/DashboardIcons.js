import React from "react";
import {
  Bell,
  Box,
  ChartColumn,
  Cog,
  LayoutGrid,
  LogOut,
  Megaphone,
  Search,
  Send,
  ShoppingBag,
  SquareUserRound,
  UserRoundCheck,
  WalletCards,
} from "lucide-react";

export const OverviewIcon = () => (
  <LayoutGrid className="h-5 w-5" />
);

export const UsageIcon = () => (
  <ChartColumn className="h-5 w-5" />
);

export const PromotionIcon = () => (
  <Megaphone className="h-5 w-5" />
);

export const CampaignIcon = () => (
  <Send className="h-5 w-5" />
);

export const LeadIcon = () => (
  <UserRoundCheck className="h-5 w-5" />
);

export const OrderIcon = () => (
  <ShoppingBag className="h-5 w-5" />
);

export const DeliveryIcon = () => (
  <Box className="h-5 w-5" />
);

export const SettingsIcon = () => (
  <Cog className="h-5 w-5" />
);

export const UserIcon = () => (
  <SquareUserRound className="h-5 w-5" />
);

export const SubscriptionIcon = () => (
  <WalletCards className="h-5 w-5" />
);

export const LogoutIcon = () => (
  <LogOut className="h-5 w-5" />
);

export const NotificationIcon = () => (
  <Bell className="h-6 w-6" />
);

export const SearchIcon = () => (
  <Search className="h-5 w-5" />
);
