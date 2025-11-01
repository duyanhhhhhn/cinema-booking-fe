"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";

export default function ComboSelection({ onComboSelect, selectedCombos = [] }) {
  const [combos, setCombos] = useState(selectedCombos);

  // Sample combo data - replace with API call
  const availableCombos = [
    {
      id: 1,
      name: "Combo Solo",
      description: "1 bắp lớn + 1 nước ngọt",
      image: "/logo/logo.png",
      price: 89000,
      items: ["Bắp lớn", "Nước ngọt 500ml"],
      available: true,
    },
    {
      id: 2,
      name: "Combo Đôi",
      description: "2 bắp vừa + 2 nước ngọt",
      image: "/logo/logo.png",
      price: 159000,
      items: ["Bắp vừa x2", "Nước ngọt 500ml x2"],
      available: true,
    },
    {
      id: 3,
      name: "Combo Gia Đình",
      description: "2 bắp lớn + 4 nước ngọt + 2 snack",
      image: "/logo/logo.png",
      price: 299000,
      items: ["Bắp lớn x2", "Nước ngọt 500ml x4", "Snack x2"],
      available: true,
    },
    {
      id: 4,
      name: "Bắp lớn",
      description: "Bắp rang bơ size lớn",
      image: "/logo/logo.png",
      price: 45000,
      items: ["Bắp lớn"],
      available: true,
    },
    {
      id: 5,
      name: "Nước ngọt",
      description: "Các loại nước ngọt 500ml",
      image: "/logo/logo.png",
      price: 25000,
      items: ["Nước ngọt 500ml"],
      available: true,
    },
    {
      id: 6,
      name: "Combo Premium",
      description: "2 bắp lớn + 2 nước + 1 snack + 1 kẹo",
      image: "/logo/logo.png",
      price: 189000,
      items: ["Bắp lớn x2", "Nước ngọt 500ml x2", "Snack", "Kẹo"],
      available: false,
    },
  ];

  const updateQuantity = (comboId, change) => {
    const updatedCombos = [...combos];
    const existingIndex = updatedCombos.findIndex((c) => c.id === comboId);

    if (existingIndex >= 0) {
      const newQuantity = updatedCombos[existingIndex].quantity + change;
      if (newQuantity <= 0) {
        updatedCombos.splice(existingIndex, 1);
      } else {
        updatedCombos[existingIndex].quantity = newQuantity;
      }
    } else if (change > 0) {
      const combo = availableCombos.find((c) => c.id === comboId);
      if (combo) {
        updatedCombos.push({ ...combo, quantity: 1 });
      }
    }

    setCombos(updatedCombos);
    if (onComboSelect) {
      onComboSelect(updatedCombos);
    }
  };

  const getQuantity = (comboId) => {
    const combo = combos.find((c) => c.id === comboId);
    return combo ? combo.quantity : 0;
  };

  const calculateTotal = () => {
    return combos.reduce((total, combo) => total + combo.price * combo.quantity, 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Box className="container mx-auto px-4 py-6">
      <Typography variant="h5" className="font-bold mb-6 text-gray-900">
        Chọn combo đồ ăn
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <div className="mb-4">
            <Typography variant="subtitle1" className="text-gray-600 mb-2">
              Bạn có thể bỏ qua bước này nếu không muốn mua đồ ăn
            </Typography>
          </div>

          <Grid container spacing={3}>
            {availableCombos.map((combo) => (
              <Grid item xs={12} sm={6} key={combo.id}>
                <Card
                  className={`h-full ${
                    !combo.available ? "opacity-60" : ""
                  } hover:shadow-lg transition-shadow`}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={combo.image}
                    alt={combo.name}
                    className="object-cover"
                  />
                  <CardContent>
                    <div className="flex items-start justify-between mb-2">
                      <Typography variant="h6" className="font-bold">
                        {combo.name}
                      </Typography>
                      {!combo.available && (
                        <Chip label="Hết hàng" size="small" className="bg-red-500 text-white" />
                      )}
                    </div>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      {combo.description}
                    </Typography>
                    <div className="mb-3">
                      {combo.items.map((item, idx) => (
                        <Chip
                          key={idx}
                          label={item}
                          size="small"
                          variant="outlined"
                          className="mr-1 mb-1"
                        />
                      ))}
                    </div>
                    <Typography variant="h6" className="font-bold text-teal-600 mb-3">
                      {formatPrice(combo.price)}
                    </Typography>
                  </CardContent>
                  <CardActions className="px-3 pb-3">
                    {combo.available ? (
                      <div className="flex items-center gap-3 w-full">
                        <IconButton
                          onClick={() => updateQuantity(combo.id, -1)}
                          disabled={getQuantity(combo.id) === 0}
                          className="border border-gray-300"
                        >
                          <i className="ti ti-minus"></i>
                        </IconButton>
                        <Typography variant="h6" className="flex-1 text-center font-semibold">
                          {getQuantity(combo.id)}
                        </Typography>
                        <IconButton
                          onClick={() => updateQuantity(combo.id, 1)}
                          className="border border-gray-300 bg-teal-500 text-white hover:bg-teal-600"
                        >
                          <i className="ti ti-plus"></i>
                        </IconButton>
                      </div>
                    ) : (
                      <Button disabled fullWidth>
                        Hết hàng
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Summary Sidebar */}
        <Grid item xs={12} md={4}>
          <Card className="sticky top-20 shadow-lg">
            <CardContent className="p-6">
              <Typography variant="h6" className="font-bold mb-4">
                Đơn hàng
              </Typography>

              {combos.length === 0 ? (
                <Typography variant="body2" className="text-gray-500 text-center py-8">
                  Chưa có sản phẩm nào
                </Typography>
              ) : (
                <div className="space-y-3 mb-4">
                  {combos.map((combo) => (
                    <div
                      key={combo.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div className="flex-1">
                        <Typography variant="subtitle2" className="font-semibold">
                          {combo.name}
                        </Typography>
                        <Typography variant="caption" className="text-gray-600">
                          SL: {combo.quantity} x {formatPrice(combo.price)}
                        </Typography>
                      </div>
                      <Typography variant="subtitle2" className="font-semibold text-teal-600">
                        {formatPrice(combo.price * combo.quantity)}
                      </Typography>
                    </div>
                  ))}
                </div>
              )}

              <Divider className="my-4" />

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(calculateTotal())}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng tiền:</span>
                  <span className="text-teal-600">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <Button
                variant="contained"
                fullWidth
                size="large"
                className="bg-teal-500 hover:bg-teal-600 mt-4"
              >
                Tiếp tục thanh toán
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

