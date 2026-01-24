import { useNotification } from "@/hooks/useNotification";
import { Paper, Table, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

export default function BannerTable({ banner }) {
    const n = useNotification();
    return (
        <>
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: "1px solid #e4e4e7", borderRadius: 2 }}
            >
                <Table sx={{ minWidth: 650 }} aria-label="banner table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Title
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Image Url
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Link Url
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Position
                            </TableCell>
                            <TableCell sx={{ fontWeight: "bold", color: "#3f3f46" }}>
                                Trạng Thái
                            </TableCell>
                            <TableCell
                                align="center"
                                sx={{ fontWeight: "bold", color: "#3f3f46" }}
                            >
                                Hành Động
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </>
    )
}