"use client"

import ISchedule from "@/types/data/staff/schedule";
import { Table, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

interface StaffScheduleTableProps {
    schedule: ISchedule,
    refetchSchedule: () => void
}

export default function StaffScheduleTable({ schedule, refetchSchedule }: StaffScheduleTableProps) {


    return <>
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
            </Table>
        </TableContainer>
    </>
}