import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";

export interface IVoucher {
    id: number;
    code: string;
    description: string;
    type: string;
    discountType: string;
    discountValue: number;
    minOrderAmount: number;
    startAt: string;
    endAt: string;
    usageLimit: number;
    usedCount: number;
}
export interface VoucherFormData {
    code: string;
    description: string;
    type: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number;
    start_at: string;
    end_at: string;
    usage_limit: number;
}
export const initialVoucherData: VoucherFormData = {
    code: "",
    description: "",
    type: "",
    discount_type: "",
    discount_value: 0,
    min_order_amount: 0,
    start_at: "",
    end_at: "",
    usage_limit: 0,
}
const modelConfig = {
    path: '/public/vouchers',
    modal: 'VoucherList'
}
export class Voucher extends Model {
    static queryKeys = {
        paginate: 'VOUCHER_PAGINATE_QUERY',
        findOne: 'VOUCHERS_FIND_ONE_QUERY',
        getRelate: 'VOUCHERS_FIND_RELATE'
    }
    static objects = ObjectsFactory.factory<IVoucher>(modelConfig, this.queryKeys)
    static voucherInfo(id: number) {
        return {
            queryKey: [this.queryKeys.findOne],
            queryFn: () => {
                return this.api
                    .get<IVoucher>({
                        url: `/public/vouchers/${id}`,
                    })
                    .then((res) => res.data);
            }
        }
    }
    static createVoucher(payload: FormData) {
        return this.api.post<IResponse<IVoucher>>({
            url: "/vouchers",
            data: payload,
        })
    }
    static editVoucher(id: Number, payload: FormData) {
        return this.api.put<IResponse<IVoucher>>({
            url: `/vouchers/${id}`,
            data: payload,
        })
    }
    static deleteVoucher(id: Number) {
        return this.api.delete<IResponse<IVoucher>>({
            url: `/vouchers/${id}`
        })
    }
}
Voucher.setup();
export function useCreateVoucherMutation() {
    return useMutation<IResponse<IVoucher>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Voucher.createVoucher(payload).then((r) => r.data);
        },
    });
}
export function useUpdateVoucherMutation() {
    return useMutation<IResponse<IVoucher>, IHttpError, { id: Number, payload: FormData }>({
        mutationFn: ({ id, payload }: { id: Number, payload: FormData }) => {
            return Voucher.editVoucher(id, payload).then((r) => r.data);
        },
    });
}
export function useDeleteVoucherMutation() {
    return useMutation<IResponse<IVoucher>, IHttpError, number>({
        mutationFn: (id) => {
            return Voucher.deleteVoucher(id).then((r) => r.data);
        }
    })
}