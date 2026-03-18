"use client"

import ISchedule from "@/types/data/staff/schedule/schedule";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface StaffScheduleTableProps {
    schedule: ISchedule[],
    refetchSchedule: () => void
}

export default function StaffScheduleTable({ schedule, refetchSchedule }: StaffScheduleTableProps) {

    return <>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell>Staff Name</TableCell>
                        <TableCell>Work Date</TableCell>
                        <TableCell>Start Time</TableCell>
                        <TableCell>End Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Function</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        schedule != null && schedule.map((item) => (
                            <TableRow>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>{item.staff.fullName}</TableCell>
                                <TableCell>{item.workdate}</TableCell>
                                <TableCell>{item.shift.startTime}</TableCell>
                                <TableCell>{item.shift.endTime}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell className="p-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="bg-yellow-500 text-white rounded-md p-1"
                                            title="Chỉnh sửa"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">
                                                <EditIcon></EditIcon>
                                            </span>
                                        </button>
                                        <button
                                            className="bg-red-500 text-white rounded-md transition-colors p-1"
                                            title="Xóa"
                                        >
                                            <span className="text-[20px]">
                                                <DeleteIcon></DeleteIcon>
                                            </span>
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </>
}