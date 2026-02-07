import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  IconButton,
  Chip,
  Box,
} from "@mui/material";
import { Lock, LockOpen, Edit, Visibility } from "@mui/icons-material";
import dayjs from "dayjs";

import { IStaff } from "../type";
import DeletePopup from "../DeletePopup";
import { useLockStaffMutation, useUnlockStaffMutation } from "../user"; // từ user.ts

interface StaffTableProps {
  staffs: IStaff[];
  refetch: () => void;
  onEdit: (staff: IStaff) => void;
  cinemaMap: Map<string, string>; // ✅ thêm
}

export default function StaffTable({
  staffs,
  refetch,
  onEdit,
  cinemaMap,
}: StaffTableProps) {
  const lockMutation = useLockStaffMutation();
  const unlockMutation = useUnlockStaffMutation();

  const [selectedStaff, setSelectedStaff] = useState<IStaff | null>(null);
  const [openPopup, setOpenPopup] = useState(false);

  const handleClickLockUnlock = (staff: IStaff) => {
    setSelectedStaff(staff);
    setOpenPopup(true);
  };

  const handleConfirm = () => {
    if (!selectedStaff) return;
    const action = selectedStaff.isActive ? lockMutation : unlockMutation;
    action.mutate(Number(selectedStaff.id), {
      onSuccess: () => {
        refetch();
        setSelectedStaff(null);
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
        sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}
      >
        <Table>
          <TableHead sx={{ background: "#f4f4f5" }}>
            <TableRow>
              <TableCell>STT</TableCell>
              <TableCell>Avatar</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell>Chức vụ</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>SĐT</TableCell>
              <TableCell>Rạp</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staffs.map((staff, idx) => (
              <TableRow key={staff.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundImage: `url(${staff.avatarUrl || "/default-avatar.png"})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                </TableCell>
                <TableCell>{staff.fullName}</TableCell>
                <TableCell>{staff.position}</TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>{staff.phone}</TableCell>
                <TableCell>
                  {cinemaMap.get(String(staff.cinemaId).trim()) || "-"}
                </TableCell>
                <TableCell>{renderStatusChip(staff.isActive)}</TableCell>
                <TableCell>
                  {dayjs(staff.createdAt).format("DD/MM/YYYY")}
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={1} justifyContent="center">
                    <IconButton onClick={() => onEdit(staff)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      color={staff.isActive ? "error" : "success"}
                      onClick={() => handleClickLockUnlock(staff)}
                    >
                      {staff.isActive ? (
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
          selectedStaff?.isActive
            ? `Khóa tài khoản "${selectedStaff.fullName}"?`
            : `Mở khóa tài khoản "${selectedStaff?.fullName}"?`
        }
      />
    </>
  );
}
