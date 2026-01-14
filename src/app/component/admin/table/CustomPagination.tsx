import React from "react";
import { Pagination, Stack, Typography } from "@mui/material";
import { useRouteQuery } from "@/hooks/useRouteQuery";


export default function CustomPagination({
  count,
  page: pageProp,
  onChange,
  totalItems = 100,
  itemsPerPage = 3,
}: {
  count: number;
  page: number;
  onChange: () => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const { updateQuery, searchQuery } = useRouteQuery();
  
  // Đọc page từ query params, mặc định là 1
  const pageFromQuery = searchQuery.get("page");
  const currentPage = pageFromQuery 
    ? parseInt(pageFromQuery, 10) 
    : (pageProp || 1);
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

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
        count={Math.ceil(totalItems / itemsPerPage)}
        page={currentPage}
        onChange={(_, value) => {
          updateQuery({ page: value.toString() });
          onChange();
        }}
        shape="rounded"
        sx={{
           "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#ec131e", 
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

