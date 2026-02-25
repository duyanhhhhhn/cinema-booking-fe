import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import { Lock, LockOpen, Visibility } from "@mui/icons-material";
import dayjs from "dayjs";

import { IUser } from "../type";
import DeletePopup from "../DeletePopup";
import { useLockUserMutation, useUnlockUserMutation } from "../user";

const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8080";

const getAvatarUrl = (avatarUrl?: string) => {
  if (!avatarUrl) return "/default-avatar.png";
  if (avatarUrl.startsWith("http")) return avatarUrl;
  if (avatarUrl.startsWith("/"))
    return `${IMAGE_URL}${avatarUrl}?t=${Date.now()}`;
  return `${IMAGE_URL}/${avatarUrl}?t=${Date.now()}`;
};

interface UserTableProps {
  users: IUser[];
  refetchUsers: () => void;
  currentPage: number;
  rowsPerPage: number;
}

export default function UserTable({
  users,
  refetchUsers,
  currentPage,
  rowsPerPage,
}: UserTableProps) {
  const lockMutation = useLockUserMutation();
  const unlockMutation = useUnlockUserMutation();

  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [openPopup, setOpenPopup] = useState(false);

  const handleClickLockUnlock = (user: IUser) => {
    setSelectedUser(user);
    setOpenPopup(true);
  };

  const handleConfirm = () => {
    if (!selectedUser) return;

    const action = selectedUser.isActive ? lockMutation : unlockMutation;
    action.mutate(Number(selectedUser.id), {
      onSuccess: () => {
        refetchUsers();
        setSelectedUser(null);
        setOpenPopup(false);
      },
    });
  };

  const renderStatusChip = (isActive: boolean) => (
    <Chip
      label={isActive ? "Hoạt động" : "Bị khóa"}
      color={isActive ? "success" : "default"}
      size="small"
      sx={{ fontWeight: 500 }}
    />
  );

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}
      >
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ background: "#f4f4f5" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Avatar</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Họ tên</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>SĐT</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Trạng thái</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Ngày tạo</TableCell>
              <TableCell align="center" sx={{ fontWeight: "bold" }}>
                Hành động
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id} hover>
                <TableCell>{currentPage * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundImage: `url(${getAvatarUrl(user.avatarUrl)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundColor: "#e4e4e7",
                      border: "1px solid #e5e7eb",
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{renderStatusChip(user.isActive)}</TableCell>
                <TableCell>
                  {dayjs(user.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    <IconButton size="small">
                      <Visibility fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color={user.isActive ? "error" : "success"}
                      onClick={() => handleClickLockUnlock(user)}
                    >
                      {user.isActive ? (
                        <Lock fontSize="small" />
                      ) : (
                        <LockOpen fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeletePopup
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onConfirm={handleConfirm}
        description={
          selectedUser?.isActive
            ? `Khóa tài khoản "${selectedUser.fullName}"?`
            : `Mở khóa tài khoản "${selectedUser?.fullName}"?`
        }
      />
    </>
  );
}
