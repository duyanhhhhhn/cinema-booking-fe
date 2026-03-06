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
export interface ISCombo {
    name: string;
    price: number;
    comboItem: IComboItem[];
}
export interface IComboData {
    name: string;
    price: number;
    bannerFile: FileList;
    comboItem: ICombo[];
}
export interface IProductData {
    name: string;
    price: number;
    description: string;
    stock: number;
    bannerFile: FileList;
}
export interface CartItem extends ICombo {
    quantity: number;
    productId: number;
}
export const initialProductData: IProductData = {
    name: "",
    price: 0,
    description: "",
    stock: 0,
    bannerFile: null,
}
export const initialComboData: IComboData = {
    name: "",
    price: 0,
    bannerFile: null,
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
            url: '/public/combo/add',
            data: payload
        })
    }
    static createProduct(payload: FormData) {
        return this.api.post<IResponse<ICombo>>({
            url: '/product/add',
            data: payload
        })
    }
    static editCombo(id: number, payload: FormData) {
        return this.api.put<IResponse<ICombo>>({
            url: `/public/combo/${id}`,
            data: payload
        })
    }
    static editProduct(id: number, payload: FormData) {
        return this.api.put<IResponse<ICombo>>({
            url: `/public/product/${id}`,
            data: payload
        })
    }
    static deleteCombo(id: number) {
        return this.api.delete<IResponse<ICombo>>({
            url: `/public/combo/${id}`,
        })
    }
    static deleteProduct(id: number) {
        return this.api.delete<IResponse<ICombo>>({
            url: `/public/product/${id}`,
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
export function useCreateProductMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Combo.createProduct(payload).then((r) => r.data);
        },
    });
}
export function useEditComboMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, { payload: FormData, id: number }>({
        mutationFn: ({ id, payload }: { id: number, payload: FormData }) => {
            return Combo.editCombo(id, payload).then((r) => r.data);
        }
    })
}
export function useEditProductMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, { payload: FormData, id: number }>({
        mutationFn: ({ id, payload }: { id: number, payload: FormData }) => {
            return Combo.editProduct(id, payload).then((r) => r.data);
        }
    })
}

export function useDeleteComboMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, number>({
        mutationFn: (id: number) => {
            return Combo.deleteCombo(id).then((r) => r.data)
        }
    })
}
export function useDeleteProductMutation() {
    return useMutation<IResponse<ICombo>, IHttpError, number>({
        mutationFn: (id: number) => {
            return Combo.deleteProduct(id).then((r) => r.data)
        }
    })
}
export const convertIComboToISCombo = (
    item: ICombo
): ISCombo => {
    return {
        name: item.name as string,
        price: item.price,
        comboItem: item.itemList as IComboItem[],
    }
};

