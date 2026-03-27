"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Fade,
  Box,
  TextField,
  Autocomplete,
  Button,
  Typography,
  Stack,
  Divider,
  MenuItem,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import KeyboardArrowLeftRoundedIcon from "@mui/icons-material/KeyboardArrowLeftRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useForm, Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";

import { useNotification } from "@/hooks/useNotification";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";
import { useUpdateStaffMutation } from "../user";
import { IStaff } from "../type";

interface EditStaffPopupProps {
  open: boolean;
  staff: IStaff;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  roleType: "MANAGER" | "STAFF";
  position?: string;
  cinemaId?: string;
  avatar?: File;
}

type PopupStep = "selection" | "form" | "restricted";
type RoleType = FormValues["roleType"];

const STAFF_POSITIONS = [
  "TICKET_SELLER",
  "TICKET_CHECKER",
  "CLEANER",
  "SECURITY",
  "TECHNICIAN",
] as const;

export default function EditStaffPopup({
  open,
  staff,
  onClose,
  onSuccess,
}: EditStaffPopupProps) {
  const n = useNotification();
  const { user, isAdmin } = useAuth();
  const { mutate } = useUpdateStaffMutation();

  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));
  const cinemas = cinemaData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [step, setStep] = useState<PopupStep>("selection");

  const roleType = watch("roleType");

  const currentUserRole = String(
    (user as any)?.role || (user as any)?.position || "",
  ).toUpperCase();
  const isManagerAccount = !isAdmin || currentUserRole === "MANAGER";
  const isTargetManager =
    String(staff?.position || "").toUpperCase() === "MANAGER";
  const targetRoleType: RoleType = isTargetManager ? "MANAGER" : "STAFF";

  const currentCinemaName = useMemo(() => {
    if (!staff?.cinemaId) return "Chọn rạp phụ trách";
    const matchedCinema = cinemas.find(
      (cinema: any) => String(cinema.id) === String(staff.cinemaId),
    );
    return matchedCinema?.name || "Chọn rạp phụ trách";
  }, [cinemas, staff?.cinemaId]);

  useEffect(() => {
    if (!open || !staff) return;

    const resolvedPosition = isTargetManager ? undefined : staff.position || "";

    reset({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      roleType: targetRoleType,
      position: resolvedPosition,
      cinemaId: staff.cinemaId ? String(staff.cinemaId) : "",
      password: "",
    });

    setAvatarPreview(staff.avatarUrl || null);
    setValue("roleType", targetRoleType);

    if (isAdmin) {
      setStep("selection");
      return;
    }

    if (isManagerAccount && isTargetManager) {
      setStep("restricted");
      return;
    }

    setStep("form");
  }, [
    open,
    staff,
    reset,
    setValue,
    isAdmin,
    isManagerAccount,
    isTargetManager,
    targetRoleType,
  ]);

  const handleChooseRole = () => {
    setValue("roleType", targetRoleType);

    if (targetRoleType === "MANAGER") {
      setValue("position", undefined);
    } else {
      const nextPosition =
        staff?.position && STAFF_POSITIONS.includes(staff.position as any)
          ? staff.position
          : "";
      setValue("position", nextPosition);
    }

    setStep("form");
  };

  const onSubmit = (data: FormValues) => {
    if (targetRoleType === "STAFF" && !data.position) {
      n.error("Vui lòng chọn chức vụ cho nhân viên");
      return;
    }

    if (isAdmin && !data.cinemaId) {
      n.error("Vui lòng chọn rạp phụ trách");
      return;
    }

    if (!isAdmin && isTargetManager) {
      n.error("Quản lý chỉ được phép cập nhật tài khoản nhân viên");
      return;
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password || undefined,
      roleId: targetRoleType === "MANAGER" ? 2 : 3,
      position: targetRoleType === "MANAGER" ? "MANAGER" : data.position,
      cinemaId: isAdmin ? data.cinemaId : (user as any)?.cinemaId,
    };

    const formData = new FormData();
    formData.append(
      "data",
      new Blob([JSON.stringify(payload)], {
        type: "application/json",
      }),
    );

    if (data.avatar) {
      formData.append("avatar", data.avatar);
    } else if (staff.avatarUrl) {
      formData.append("avatarUrl", staff.avatarUrl);
    }

    mutate(
      { id: Number(staff.id), payload: formData },
      {
        onSuccess: () => {
          n.success("Cập nhật thành công");
          onSuccess();
          onClose();
        },
        onError: (err: any) => {
          n.error(err?.message || "Có lỗi xảy ra");
        },
      },
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const renderManagerCard = (disabled = false) => (
    <Box
      onClick={disabled ? undefined : handleChooseRole}
      sx={{
        flex: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        borderRadius: "14px",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        bgcolor: "#ffffff",
        p: 2.5,
        transition: "all 0.2s ease",
        "&:hover": disabled
          ? {}
          : {
              transform: "translateY(-3px)",
              boxShadow: "0 18px 35px rgba(15, 23, 42, 0.08)",
              borderColor: "rgba(220, 38, 38, 0.35)",
            },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "12px",
            bgcolor: "rgba(220, 38, 38, 0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#c81e1e",
            flexShrink: 0,
          }}
        >
          <StorefrontOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Cập nhật quản lý
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 14.5,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Tài khoản đang được chỉnh sửa là quản lý, vì vậy chỉ được mở biểu
            mẫu cập nhật quản lý tương ứng.
          </Typography>

          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{ mt: 2.25, color: "#334155" }}
          >
            <StorefrontOutlinedIcon sx={{ fontSize: 17 }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
              {currentCinemaName}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  const renderStaffCard = (disabled = false) => (
    <Box
      onClick={disabled ? undefined : handleChooseRole}
      sx={{
        flex: 1,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        borderRadius: "14px",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        bgcolor: "#ffffff",
        p: 2.5,
        transition: "all 0.2s ease",
        "&:hover": disabled
          ? {}
          : {
              transform: "translateY(-3px)",
              boxShadow: "0 18px 35px rgba(15, 23, 42, 0.08)",
              borderColor: "rgba(37, 99, 235, 0.35)",
            },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: "12px",
            bgcolor: "rgba(37, 99, 235, 0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb",
            flexShrink: 0,
          }}
        >
          <BadgeOutlinedIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            Cập nhật nhân viên
          </Typography>
          <Typography
            sx={{
              mt: 0.75,
              fontSize: 14.5,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Tài khoản đang được chỉnh sửa là nhân viên, vì vậy chỉ được mở biểu
            mẫu cập nhật nhân viên để tránh đổi sai loại tài khoản.
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            sx={{ mt: 2.25, color: "#334155" }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <StorefrontOutlinedIcon sx={{ fontSize: 17 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                Chọn rạp
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <BadgeOutlinedIcon sx={{ fontSize: 17 }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>
                Chọn chức vụ
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );

  const renderSelectRoleView = () => (
    <Box
      sx={{
        width: "min(92vw, 760px)",
        bgcolor: "#f8fafc",
        borderRadius: "18px",
        boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
        overflow: "hidden",
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 3.5 }, pb: 2.5 }}>
        <Typography
          sx={{
            fontSize: { xs: 28, md: 30 },
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: 1.15,
          }}
        >
          Chọn loại nhân sự
        </Typography>
        <Typography
          sx={{
            mt: 1.25,
            fontSize: 15,
            color: "#64748b",
            lineHeight: 1.7,
          }}
        >
          Khi chỉnh sửa tài khoản, hệ thống chỉ cho phép mở đúng biểu mẫu tương
          ứng với loại tài khoản hiện tại để tránh sửa sai role.
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)" }} />

      <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        <Typography
          sx={{
            mb: 2,
            fontSize: 15,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          Loại nhân sự
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {renderManagerCard(!isTargetManager)}
          {renderStaffCard(isTargetManager)}
        </Stack>
      </Box>
    </Box>
  );

  const renderRestrictedView = () => (
    <Box
      sx={{
        width: "min(92vw, 520px)",
        bgcolor: "#ffffff",
        borderRadius: "18px",
        boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
        overflow: "hidden",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        p: 4,
      }}
    >
      <Typography sx={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>
        Không đủ quyền cập nhật
      </Typography>
      <Typography
        sx={{ mt: 1.5, fontSize: 15, lineHeight: 1.75, color: "#64748b" }}
      >
        Tài khoản quản lý chỉ được phép cập nhật tài khoản nhân viên. Bạn không
        thể mở biểu mẫu chỉnh sửa cho quản lý khác.
      </Typography>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
          sx={{
            borderRadius: "12px",
            px: 3,
            py: 1.1,
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Đóng
        </Button>
      </Stack>
    </Box>
  );

  const renderFormView = () => (
    <Box
      sx={{
        width: "min(92vw, 720px)",
        maxHeight: "92vh",
        overflowY: "auto",
        bgcolor: "#f8fafc",
        borderRadius: "20px",
        boxShadow: "0 28px 80px rgba(15, 23, 42, 0.28)",
        overflowX: "hidden",
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box
        sx={{
          px: { xs: 3, md: 4 },
          pt: 3,
          pb: 2.5,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            {isAdmin && (
              <Button
                onClick={() => setStep("selection")}
                startIcon={<KeyboardArrowLeftRoundedIcon />}
                sx={{
                  minWidth: "unset",
                  px: 1.25,
                  py: 0.65,
                  borderRadius: "10px",
                  bgcolor: "rgba(15, 23, 42, 0.04)",
                  color: "#334155",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": {
                    bgcolor: "rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                Quay lại
              </Button>
            )}
          </Stack>

          <Typography
            sx={{
              mt: isAdmin ? 2 : 0,
              fontSize: { xs: 28, md: 30 },
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.15,
            }}
          >
            {targetRoleType === "MANAGER"
              ? "Cập nhật tài khoản quản lý"
              : "Cập nhật tài khoản nhân viên"}
          </Typography>
          <Typography
            sx={{
              mt: 1.1,
              fontSize: 15,
              color: "#64748b",
              lineHeight: 1.7,
            }}
          >
            Chỉnh sửa thông tin tài khoản, ảnh đại diện và dữ liệu phân quyền mà
            vẫn giữ nguyên loại tài khoản hiện tại.
          </Typography>
        </Box>

        <Box
          sx={{
            minWidth: 44,
            height: 44,
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor:
              targetRoleType === "MANAGER"
                ? "rgba(220, 38, 38, 0.10)"
                : "rgba(37, 99, 235, 0.10)",
            color: targetRoleType === "MANAGER" ? "#c81e1e" : "#2563eb",
          }}
        >
          <EditOutlinedIcon />
        </Box>
      </Box>

      <Divider sx={{ borderColor: "rgba(15, 23, 42, 0.08)" }} />

      <Box sx={{ px: { xs: 3, md: 4 }, py: 3.5 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.25}>
            <TextField
              {...register("fullName", { required: "Họ tên là bắt buộc" })}
              label="Họ và tên"
              error={!!errors.fullName}
              helperText={errors.fullName?.message}
              fullWidth
            />

            <TextField
              {...register("email", { required: "Email là bắt buộc" })}
              label="Email"
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />

            <TextField
              {...register("phone", { required: "Số điện thoại là bắt buộc" })}
              label="Số điện thoại"
              error={!!errors.phone}
              helperText={errors.phone?.message}
              fullWidth
            />

            <TextField
              {...register("password")}
              label="Mật khẩu mới (không bắt buộc)"
              type="password"
              fullWidth
            />

            {isAdmin && (
              <Controller
                name="cinemaId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={cinemas}
                    getOptionLabel={(option: any) => option?.name || ""}
                    value={
                      cinemas.find(
                        (cinema: any) =>
                          String(cinema.id) === String(field.value || ""),
                      ) || null
                    }
                    onChange={(_, value: any) =>
                      field.onChange(value?.id ? String(value.id) : "")
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Rạp phụ trách" fullWidth />
                    )}
                  />
                )}
              />
            )}

            {targetRoleType === "STAFF" && (
              <TextField
                select
                label="Chức vụ"
                {...register("position")}
                fullWidth
              >
                <MenuItem value="">-- Chọn chức vụ --</MenuItem>
                {STAFF_POSITIONS.map((position) => (
                  <MenuItem key={position} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Box
              sx={{
                p: 2,
                borderRadius: "16px",
                bgcolor: "#ffffff",
                border: "1px dashed rgba(148, 163, 184, 0.6)",
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 15, fontWeight: 800, color: "#0f172a" }}
                  >
                    Ảnh đại diện
                  </Typography>
                  <Typography sx={{ mt: 0.5, fontSize: 14, color: "#64748b" }}>
                    Có thể giữ nguyên ảnh cũ hoặc tải ảnh mới để thay thế.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    borderRadius: "12px",
                    px: 2.25,
                    py: 1,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",
                  }}
                >
                  Chọn ảnh mới
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>
              </Stack>

              {avatarPreview && (
                <Box mt={2}>
                  <img
                    src={avatarPreview}
                    alt="preview"
                    style={{
                      width: 96,
                      height: 96,
                      objectFit: "cover",
                      borderRadius: 16,
                      border: "1px solid rgba(148, 163, 184, 0.35)",
                    }}
                  />
                </Box>
              )}
            </Box>

            <Stack
              direction={{ xs: "column-reverse", sm: "row" }}
              spacing={1.5}
              justifyContent="flex-end"
            >
              <Button
                type="button"
                onClick={onClose}
                sx={{
                  borderRadius: "12px",
                  px: 2.5,
                  py: 1.1,
                  fontWeight: 700,
                  textTransform: "none",
                  color: "#334155",
                  bgcolor: "rgba(15, 23, 42, 0.04)",
                  "&:hover": {
                    bgcolor: "rgba(15, 23, 42, 0.08)",
                  },
                }}
              >
                Hủy
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="error"
                sx={{
                  borderRadius: "12px",
                  px: 2.75,
                  py: 1.1,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                }}
              >
                Cập nhật
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Box>
  );

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
            bgcolor: "rgba(15, 23, 42, 0.35)",
            backdropFilter: "blur(8px)",
          }}
        >
          {step === "selection" && isAdmin && renderSelectRoleView()}
          {step === "restricted" && renderRestrictedView()}
          {step === "form" && renderFormView()}
        </Box>
      </Fade>
    </Modal>
  );
}
