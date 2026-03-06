"use client"

import ISchedule from "@/types/data/staff/schedule/schedule";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

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
                                <TableCell>button</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    </>
}