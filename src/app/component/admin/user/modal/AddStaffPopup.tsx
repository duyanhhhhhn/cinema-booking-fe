"use client";
import React, { useState } from "react";
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
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
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

export default function AddStaffPopup({
  open,
  onClose,
  onSuccess,
}: AddStaffPopupProps) {
  const n = useNotification();
  const { user, isAdmin } = useAuth();
  const { mutate } = useCreateStaffMutation();

  const { data: cinemaData } = useQuery(useGetCinemaForAdminQuery(1, 100));
  const cinemas = cinemaData?.data || [];

  const {
    register,
    handleSubmit,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      roleType: isAdmin ? "STAFF" : "STAFF",
    },
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const roleType = watch("roleType");

  const onSubmit = (data: FormValues) => {
    if (roleType === "STAFF" && !data.position) {
      n.error("Vui lòng chọn vị trí cho Staff");
      return;
    }

    if (isAdmin && !data.cinemaId) {
      n.error("Vui lòng chọn rạp");
      return;
    }

    const payload = {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      roleId: roleType === "MANAGER" ? 2 : 3,
      position: roleType === "MANAGER" ? "MANAGER" : data.position,
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
    }

    mutate(formData, {
      onSuccess: () => {
        n.success("Tạo nhân sự thành công");
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

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" mb={2}>
            Thêm {isAdmin ? "Manager / Staff" : "Staff"}
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                {...register("fullName", { required: "Họ tên là bắt buộc" })}
                label="Họ tên"
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />

              <TextField
                {...register("email", { required: "Email là bắt buộc" })}
                label="Email"
              />

              <TextField
                {...register("phone", { required: "SĐT là bắt buộc" })}
                label="SĐT"
              />

              <TextField
                {...register("password", { required: "Mật khẩu là bắt buộc" })}
                label="Mật khẩu"
                type="password"
              />

              {/* ADMIN chọn roleType */}
              {isAdmin && (
                <TextField select label="Role Type" {...register("roleType")}>
                  <MenuItem value="STAFF">Staff</MenuItem>
                  <MenuItem value="MANAGER">Manager</MenuItem>
                </TextField>
              )}

              {/* ADMIN chọn rạp */}
              {isAdmin && (
                <Controller
                  name="cinemaId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={cinemas}
                      getOptionLabel={(option) => option.name}
                      onChange={(_, value) => field.onChange(value?.id || "")}
                      renderInput={(params) => (
                        <TextField {...params} label="Chọn rạp" />
                      )}
                    />
                  )}
                />
              )}

              {/* Dropdown position cho STAFF (ADMIN hoặc MANAGER đều thấy) */}
              {roleType === "STAFF" && (
                <TextField select label="Chức vụ" {...register("position")}>
                  <MenuItem value="">-- Chọn vị trí --</MenuItem>
                  <MenuItem value="TICKET_SELLER">TICKET_SELLER</MenuItem>
                  <MenuItem value="TICKET_CHECKER">TICKET_CHECKER</MenuItem>
                  <MenuItem value="CLEANER">CLEANER</MenuItem>
                  <MenuItem value="SECURITY">SECURITY</MenuItem>
                  <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
                </TextField>
              )}

              <Box>
                <Button variant="contained" component="label">
                  Chọn avatar
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Button>

                {avatarPreview && (
                  <Box mt={1}>
                    <img
                      src={avatarPreview}
                      alt="preview"
                      style={{ width: 80, height: 80, borderRadius: 8 }}
                    />
                  </Box>
                )}
              </Box>

              <Button type="submit" variant="contained" color="error">
                Tạo
              </Button>
            </Stack>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
}
