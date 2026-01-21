import { IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";

export interface IBanner {
    id: number;
    title: string;
    imageUrl: string;
    linkUrl: string;
    isActive: boolean;
    createdAt: string;
}
export interface BannerFormData {
    title: string;
    image_url: string;
    link_url: string;
    is_active: boolean;
    position: string;
}
export const initialBannerData: BannerFormData = {
    title: "",
    image_url: "",
    link_url: "",
    is_active: true,
    position: "HOME"
};
const modelConfig = {
    path: '/banner',
    modal: 'BannerList'
}
export class Banner extends Model {
    static queryKeys = {
        paginate: 'BANNERS_PAGINATE_QUERY',
        findOne: 'BANNERS_FIND_ONE_QUERY'
    }
    static objects = ObjectsFactory.factory<IBanner>(modelConfig, this.queryKeys)
    static getBanner(position = "HOME", count = 3) {
        return {
            queryKey: [this.queryKeys.paginate, position, count],
            queryFn: () => {
                return this.api.get<IResponse<IBanner>>({
                    url: `/banner/get`,
                    params: {
                        position,
                        count
                    }
                }).then(r => r.data)
            }
        }
    }
}
Banner.setup();