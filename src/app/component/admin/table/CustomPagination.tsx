import React from "react";
import { Pagination, Stack, Typography } from "@mui/material";


export default function CustomPagination({
  count,
  page,
  onChange,
  totalItems = 100,
  itemsPerPage = 3,
}: {
  count: number;
  page: number;
  onChange: () => void;
  totalItems?: number;
  itemsPerPage?: number;
}) {
  const startItem = (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, totalItems);

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ paddingTop: 2 }}
    >
      <Typography variant="body2" color="text.secondary">
        Hiển thị{" "}
        <b>
          {startItem}-{endItem}
        </b>{" "}
        trên <b>{totalItems}</b>
      </Typography>

      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        shape="rounded"
        sx={{
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#ec131e", // Màu đỏ primary
            color: "white",
            "&:hover": {
              backgroundColor: "#c91019",
            },
          },
        }}
      />
    </Stack>
  );
};

