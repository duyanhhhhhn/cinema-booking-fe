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
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import AlternateEmailRoundedIcon from "@mui/icons-material/AlternateEmailRounded";
import LocalPhoneRoundedIcon from "@mui/icons-material/LocalPhoneRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { useQuery } from "@tanstack/react-query";
import { useNotification } from "@/hooks/useNotification";
import { useCreateStaffMutation } from "../user";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCinemaForAdminQuery } from "@/types/data/cinema/cinema";

interface AddStaffPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  roleType: "MANAGER" | "STAFF";
  position?: string;
  cinemaId?: string;
  avatar?: File;
}

const STAFF_POSITIONS = [
  "TICKET_SELLER",
  "TICKET_CHECKER",
  "CLEANER",
  "SECURITY",
  "TECHNICIAN",
] as const;

export default function AddStaffPopup({
  open,
  onClose,
  onSuccess,
}: AddStaffPopupProps) {
  const n = useNotification();
  const { user, isAdmin } = useAuth();
  const { mutate } = useCreateStaffMutation();

  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 1000));
  const cinemas = cinemaData?.data || [];
  const canChooseRoleType = useMemo(() => {
    const currentRole = String((user as any)?.role || "").toUpperCase();
    return Boolean(isAdmin) || currentRole === "ADMIN";
  }, [isAdmin, user]);

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      roleType: canChooseRoleType ? undefined : "STAFF",
      position: "",
      cinemaId: "",
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const roleType = watch("roleType");

  const popupTitle = useMemo(() => {
    if (!canChooseRoleType) return "Thêm nhân viên";
    if (!roleType) return "Chọn loại nhân sự";
    if (roleType === "MANAGER") return "Thêm quản lý";
    return "Thêm nhân viên";
  }, [canChooseRoleType, roleType]);

  useEffect(() => {
    if (!open) return;

    reset({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      roleType: canChooseRoleType ? undefined : "STAFF",
      position: "",
      cinemaId: "",
      avatar: undefined,
    });
    setAvatarPreview(null);
  }, [open, canChooseRoleType, reset]);

  useEffect(() => {
    if (roleType === "MANAGER") {
      setValue("position", "");
    }
  }, [roleType, setValue]);

  const handleSelectRoleType = (value: "MANAGER" | "STAFF") => {
    setValue("roleType", value, { shouldValidate: true, shouldDirty: true });
    if (value === "MANAGER") {
      setValue("position", "");
    }
  };

  const handleBackToOptions = () => {
    reset({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      roleType: undefined,
      position: "",
      cinemaId: "",
      avatar: undefined,
    });
    setAvatarPreview(null);
  };

  const handleClose = () => {
    onClose();
  };

  const onSubmit = (data: FormValues) => {
    if (canChooseRoleType && !data.roleType) {
      n.error("Vui lòng chọn loại nhân sự");
      return;
    }

    if (data.roleType === "STAFF" && !data.position) {
      n.error("Vui lòng chọn vị trí cho nhân viên");
      return;
    }

    if (canChooseRoleType && !data.cinemaId) {
      n.error("Vui lòng chọn rạp");
      return;
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      roleId: data.roleType === "MANAGER" ? 2 : 3,
      position: data.roleType === "MANAGER" ? "MANAGER" : data.position,
      cinemaId: canChooseRoleType ? data.cinemaId : (user as any)?.cinemaId,
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
    }

    mutate(formData, {
      onSuccess: () => {
        n.success(
          data.roleType === "MANAGER"
            ? "Tạo quản lý thành công"
            : "Tạo nhân viên thành công",
        );
        onSuccess();
        onClose();
      },
      onError: (err: any) => {
        n.error(err?.message || "Có lỗi xảy ra");
      },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("avatar", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const shouldShowOptions = canChooseRoleType && !roleType;
  const shouldShowForm = !canChooseRoleType || roleType === "MANAGER" || roleType === "STAFF";

  const commonFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.25,
      fontWeight: 700,
      backgroundColor: "#fff",
    },
    "& .MuiInputLabel-root": {
      fontWeight: 700,
      color: "#374151",
    },
  };

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "calc(100vw - 24px)", sm: 760 },
            maxWidth: "calc(100vw - 24px)",
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            bgcolor: "#ffffff",
            borderRadius: 3,
            boxShadow: "0 24px 80px rgba(15, 23, 42, 0.18)",
            border: "1px solid #e5e7eb",
            p: 0,
          }}
        >
          <Box
            sx={{
              px: { xs: 2.25, sm: 3.25 },
              py: 2.5,
              borderBottom: "1px solid #e5e7eb",
              background:
                "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 100%)",
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: "#111827", letterSpacing: "-0.03em", fontSize: 32 }}
                >
                  {popupTitle}
                </Typography>
                <Typography sx={{ mt: 0.75, fontSize: 15, color: "#6b7280", fontWeight: 500 }}>
                  {canChooseRoleType
                    ? !roleType
                      ? "Chọn thêm quản lý hoặc nhân viên, sau đó mở đúng biểu mẫu tương ứng."
                      : "Nhập đầy đủ thông tin rồi bấm tạo để lưu nhân sự mới."
                    : "Nhập thông tin để tạo nhân viên mới cho rạp của bạn."}
                </Typography>
              </Box>

              {canChooseRoleType && roleType && (
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<ArrowBackRoundedIcon />}
                  onClick={handleBackToOptions}
                  sx={{
                    flexShrink: 0,
                    minWidth: 150,
                    height: 44,
                    borderRadius: 2,
                    fontWeight: 800,
                    textTransform: "none",
                  }}
                >
                  Quay lại
                </Button>
              )}
            </Stack>
          </Box>

          <Box sx={{ p: { xs: 2.25, sm: 3.25 } }}>
            {shouldShowOptions && (
              <Stack spacing={1.75} mb={1}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Loại nhân sự
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Button
                    type="button"
                    onClick={() => handleSelectRoleType("MANAGER")}
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      textAlign: "left",
                      minHeight: 150,
                      px: 2.5,
                      py: 2.25,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      borderWidth: 2,
                      borderColor: "#d1d5db",
                      color: "#111827",
                      backgroundColor: "#fff",
                      textTransform: "none",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(185,28,28,0.08)",
                          color: "#b91c1c",
                          flexShrink: 0,
                        }}
                      >
                        <AdminPanelSettingsRoundedIcon sx={{ fontSize: 30 }} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827", lineHeight: 1.15 }}>
                          Thêm quản lý
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 15, fontWeight: 600, color: "#6b7280", lineHeight: 1.55 }}>
                          Tạo tài khoản quản lý cho một rạp cụ thể. Luồng này chỉ cần chọn rạp phụ trách, không cần chọn chức vụ staff.
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: "#374151" }}>
                          <BusinessRoundedIcon sx={{ fontSize: 19 }} />
                          <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                            Chọn rạp phụ trách
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleSelectRoleType("STAFF")}
                    variant="outlined"
                    sx={{
                      justifyContent: "flex-start",
                      alignItems: "stretch",
                      textAlign: "left",
                      minHeight: 150,
                      px: 2.5,
                      py: 2.25,
                      borderRadius: 2.5,
                      fontWeight: 800,
                      borderWidth: 2,
                      borderColor: "#d1d5db",
                      color: "#111827",
                      backgroundColor: "#fff",
                      textTransform: "none",
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: "rgba(30,64,175,0.08)",
                          color: "#1d4ed8",
                          flexShrink: 0,
                        }}
                      >
                        <BadgeRoundedIcon sx={{ fontSize: 30 }} />
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 24, fontWeight: 900, color: "#111827", lineHeight: 1.15 }}>
                          Thêm nhân viên
                        </Typography>
                        <Typography sx={{ mt: 1, fontSize: 15, fontWeight: 600, color: "#6b7280", lineHeight: 1.55 }}>
                          Tạo tài khoản nhân viên vận hành. Luồng này cần chọn rạp làm việc và vị trí chức vụ cụ thể trước khi lưu.
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2, color: "#374151", flexWrap: "wrap" }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <BusinessRoundedIcon sx={{ fontSize: 19 }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                              Chọn rạp
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <WorkOutlineRoundedIcon sx={{ fontSize: 19 }} />
                            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                              Chọn chức vụ
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </Button>
                </Box>
              </Stack>
            )}

            {shouldShowForm && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.15}>
                  <TextField
                    {...register("fullName", { required: "Họ tên là bắt buộc" })}
                    label="Họ tên"
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineRoundedIcon sx={{ color: "#6b7280" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("email", { required: "Email là bắt buộc" })}
                    label="Email"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AlternateEmailRoundedIcon sx={{ color: "#6b7280" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("phone", { required: "Số điện thoại là bắt buộc" })}
                    label="Số điện thoại"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocalPhoneRoundedIcon sx={{ color: "#6b7280" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    {...register("password", { required: "Mật khẩu là bắt buộc" })}
                    label="Mật khẩu"
                    type="password"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    fullWidth
                    sx={commonFieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockRoundedIcon sx={{ color: "#6b7280" }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {canChooseRoleType && (
                    <Controller
                      name="cinemaId"
                      control={control}
                      render={({ field }) => (
                        <Autocomplete
                          options={cinemas}
                          value={cinemas.find((item) => String(item.id) === String(field.value)) || null}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          onChange={(_, value) => field.onChange(value?.id ? String(value.id) : "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Chọn rạp"
                              fullWidth
                              sx={commonFieldSx}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <>
                                    <InputAdornment position="start">
                                      <BusinessRoundedIcon sx={{ color: "#6b7280" }} />
                                    </InputAdornment>
                                    {params.InputProps.startAdornment}
                                  </>
                                ),
                              }}
                            />
                          )}
                        />
                      )}
                    />
                  )}

                  {roleType === "STAFF" && (
                    <TextField
                      select
                      label="Chức vụ"
                      {...register("position")}
                      fullWidth
                      sx={commonFieldSx}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkOutlineRoundedIcon sx={{ color: "#6b7280" }} />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="">-- Chọn vị trí --</MenuItem>
                      {STAFF_POSITIONS.map((position) => (
                        <MenuItem key={position} value={position}>
                          {position}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <Box>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<AddCircleRoundedIcon />}
                      sx={{
                        borderRadius: 2,
                        fontWeight: 800,
                        height: 42,
                        textTransform: "none",
                      }}
                    >
                      Chọn avatar
                      <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                    </Button>

                    {avatarPreview && (
                      <Box mt={1.5}>
                        <img
                          src={avatarPreview}
                          alt="preview"
                          style={{
                            width: 88,
                            height: 88,
                            borderRadius: 12,
                            objectFit: "cover",
                            border: "1px solid #e5e7eb",
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <Stack direction="row" spacing={1.5} justifyContent="flex-end" pt={1}>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleClose}
                      sx={{ minWidth: 110, borderRadius: 2, fontWeight: 800, textTransform: "none" }}
                    >
                      Đóng
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      color="error"
                      sx={{ minWidth: 160, borderRadius: 2, fontWeight: 900, textTransform: "none" }}
                    >
                      {roleType === "MANAGER" ? "Tạo quản lý" : "Tạo nhân viên"}
                    </Button>
                  </Stack>
                </Stack>
              </form>
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}
