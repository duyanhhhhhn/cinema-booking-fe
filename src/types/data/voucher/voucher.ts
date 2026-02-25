import { IPaginateResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";

export interface IVoucher {
    id: number;
    code: string;
    description: string;
    type: string;
    discountType: string;
    discountValue: number;
    minOrderAmmount: number;
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
    min_order_ammount: number;
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
    min_order_ammount: 0,
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

}
