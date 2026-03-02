import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { IComboItem } from "./comboitem";
import { useMutation } from "@tanstack/react-query";

export interface ICombo {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    isActive: boolean;
    createdAt: string;
    stock: number;
    type: string;
    itemList: IComboItem[];
}
export interface IComboData {
    name: string;
    price: number;
    bannerFile: string;
    comboItem: ICombo[];
}
export interface CartItem extends ICombo {
    quantity: number;
}
export const initialComboData: IComboData = {
    name: "",
    price: 0,
    bannerFile: "",
    comboItem: null,
}
const modelConfig = {
    path: '/public/combo',
    modal: 'ConcessionList'
}
export class Combo extends Model {
    static queryKeys = {
        paginate: 'COMBOS_PAGINATE_QUERY',
        findOne: 'COMBOS_FIND_ONE_QUERY',
    }
    static objects = ObjectsFactory.factory<ICombo>(modelConfig, this.queryKeys)
    static createCombo(payload: FormData) {
        return this.api.post<IResponse<ICombo>>({
            url: '/combo/add',
            data: payload
        })
    }
}
Combo.setup();
export function useCreateComboMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Combo.createCombo(payload).then((r) => r.data);
        },
    });
}

