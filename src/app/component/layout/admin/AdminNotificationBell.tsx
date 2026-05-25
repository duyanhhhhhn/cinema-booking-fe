"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FiberManualRecordRoundedIcon from "@mui/icons-material/FiberManualRecordRounded";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  UserNotificationModel,
  type IUserNotificationItem,
} from "@/types/data/notification/notification";

function formatRelativeTime(value?: string | null) {
  if (!value) return "Vừa xong";

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return "Vừa xong";

  const diffMs = target.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / (60 * 1000));
  const rtf = new Intl.RelativeTimeFormat("vi", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return rtf.format(diffDays, "day");
}

function resolveActivityCenter(role?: string | null) {
  const normalizedRole = String(role || "").toUpperCase();
  if (normalizedRole === "STAFF") {
    return "/admin/staff-schedules/my/swaps";
  }
  if (normalizedRole === "MANAGER") {
    return "/admin/staff-schedules/swaps";
  }
  if (normalizedRole === "ADMIN") {
    return "/admin/staff-schedules";
  }
  return "/admin";
}

export default function AdminNotificationBell({
  role,
}: {
  role?: string | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const readyToastRef = useRef(false);
  const announcedNotificationIdsRef = useRef<Set<number>>(new Set());

  const qNotifications = useQuery({
    ...UserNotificationModel.getMyNotifications({
      limit: 8,
    }),
    refetchInterval: 20000,
    staleTime: 5000,
  });

  const qUnreadCount = useQuery({
    ...UserNotificationModel.getUnreadCount(),
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const notifications = useMemo(
    () =>
      Array.isArray(qNotifications.data?.data) ? qNotifications.data.data : [],
    [qNotifications.data],
  );

  const unreadCount = Number(qUnreadCount.data?.data?.unreadCount || 0);
  const open = Boolean(anchorEl);
  const fallbackRoute = resolveActivityCenter(role);

  const invalidateNotificationQueries = () => {
    queryClient.invalidateQueries({
      queryKey: [UserNotificationModel.queryKeys.list],
    });
    queryClient.invalidateQueries({
      queryKey: [UserNotificationModel.queryKeys.unreadCount],
    });
  };

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) =>
      UserNotificationModel.markAsRead(notificationId).then((response) => response.data),
    onSuccess: () => {
      invalidateNotificationQueries();
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () =>
      UserNotificationModel.markAllAsRead().then((response) => response.data),
    onSuccess: () => {
      invalidateNotificationQueries();
    },
  });

  const handleNavigate = (targetUrl?: string | null) => {
    router.push(targetUrl || fallbackRoute);
    setAnchorEl(null);
  };

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (item: IUserNotificationItem) => {
    if (item.read) {
      handleNavigate(item.actionUrl);
      return;
    }

    markAsReadMutation.mutate(item.id, {
      onSettled: () => {
        handleNavigate(item.actionUrl);
      },
    });
  };

  useEffect(() => {
    const unreadSwapNotifications = notifications.filter(
      (item) => !item.read && String(item.type || "").startsWith("STAFF_SWAP"),
    );

    if (!readyToastRef.current) {
      unreadSwapNotifications.forEach((item) => {
        announcedNotificationIdsRef.current.add(item.id);
      });
      readyToastRef.current = true;
      return;
    }

    unreadSwapNotifications
      .filter((item) => !announcedNotificationIdsRef.current.has(item.id))
      .slice(0, 3)
      .forEach((item) => {
        announcedNotificationIdsRef.current.add(item.id);
        toast.info(item.title || "Có thông báo mới", {
          id: `admin-notification-${item.id}`,
          description: item.message || "Mở để xem chi tiết.",
          duration: 7000,
          action: {
            label: item.actionLabel || "Mở",
            onClick: () => handleNotificationClick(item),
          },
        });
      });
  }, [notifications]);

  const handleOpenActivityCenter = () => {
    handleNavigate(fallbackRoute);
  };

  return (
    <>
      <IconButton
        color="inherit"
        aria-label="Thông báo"
        onClick={handleOpen}
        sx={{
          color: "#555",
          borderRadius: 1.5,
          bgcolor: open ? "#fff1f2" : "transparent",
          "&:hover": { bgcolor: "#f8fafc" },
        }}
      >
        <Badge
          badgeContent={unreadCount > 99 ? "99+" : unreadCount}
          color="error"
          overlap="circular"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 380,
            maxWidth: "calc(100vw - 24px)",
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            boxShadow: "0 18px 48px rgba(15,23,42,0.14)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            px: 2,
            py: 1.5,
            bgcolor: "#fff7ed",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
              Thông báo hoạt động
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748b" }}>
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Bạn đang không có thông báo mới"}
            </Typography>
          </Box>

          <Button
            size="small"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={!unreadCount || markAllAsReadMutation.isPending}
            sx={{
              minWidth: 0,
              px: 1.5,
              fontSize: 12,
              fontWeight: 700,
              color: "#be123c",
            }}
          >
            {markAllAsReadMutation.isPending ? "Đang xử lý..." : "Đọc hết"}
          </Button>
        </Box>

        <Divider />

        {qNotifications.isLoading ? (
          <Box
            sx={{
              px: 2,
              py: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              color: "#64748b",
            }}
          >
            <CircularProgress size={18} />
            <Typography sx={{ fontSize: 13 }}>Đang tải thông báo...</Typography>
          </Box>
        ) : qNotifications.isError ? (
          <Box sx={{ px: 2, py: 4 }}>
            <Typography sx={{ fontSize: 13, color: "#b91c1c" }}>
              Không tải được thông báo. Bạn vẫn có thể mở trung tâm hoạt động bên dưới.
            </Typography>
          </Box>
        ) : notifications.length ? (
          <Box sx={{ maxHeight: 460, overflowY: "auto" }}>
            {notifications.map((item) => (
              <MenuItem
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                sx={{
                  alignItems: "flex-start",
                  gap: 1.5,
                  px: 2,
                  py: 1.75,
                  borderBottom: "1px solid #f1f5f9",
                  bgcolor: item.read ? "#ffffff" : "#fff7f7",
                  "&:hover": {
                    bgcolor: item.read ? "#f8fafc" : "#fff1f2",
                  },
                }}
              >
                <Box sx={{ pt: 0.5 }}>
                  <FiberManualRecordRoundedIcon
                    sx={{
                      fontSize: 10,
                      color: item.read ? "#cbd5e1" : "#ef4444",
                    }}
                  />
                </Box>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: item.read ? 700 : 800,
                        color: "#0f172a",
                        lineHeight: 1.35,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: "nowrap",
                        fontSize: 11,
                        color: "#64748b",
                      }}
                    >
                      {formatRelativeTime(item.createdAt)}
                    </Typography>
                  </Box>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontSize: 12.5,
                      lineHeight: 1.5,
                      color: "#475569",
                      whiteSpace: "normal",
                    }}
                  >
                    {item.message}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#be123c",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {item.actionLabel || "Mở chi tiết"}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        ) : (
          <Box sx={{ px: 2, py: 4 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b" }}>
              Chưa có thông báo nào. Khi có yêu cầu làm thay hoặc duyệt làm thay, bạn sẽ thấy ở đây.
            </Typography>
          </Box>
        )}

        <Divider />

        <Box sx={{ px: 2, py: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleOpenActivityCenter}
            sx={{
              borderRadius: 1.5,
              bgcolor: "#e11d48",
              fontWeight: 700,
              "&:hover": { bgcolor: "#be123c" },
            }}
          >
            Mở trung tâm hoạt động
          </Button>
        </Box>
      </Menu>
    </>
  );
}
