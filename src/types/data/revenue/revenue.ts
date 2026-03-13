import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";

export default interface IRevenue {
    id: number;
    date: string;
    revenue: number;
}
export interface RevenueFormData {
    date: string;
    revenue: number;
}
export const initialRevenueData: RevenueFormData = {
    date: "",
    revenue: 0,
}
export const modelConfig = {
    path: '/revenue/month',
    modal: 'RevenueList'
}
export class Revenue extends Model {
    static queryKeys = {
        paginate: 'REVENUE_PAGINATE_QUERY',
        findOne: 'REVENUE_FIND_ONE_QUERY',
        getByDate: 'REVENUE_GET_BY_DATE_QUERY',
        getByMonth: 'REVENUE_GET_BY_MONTH_QUERY'
    }
    static objects = ObjectsFactory.factory<IRevenue>(modelConfig, this.queryKeys);
    static getRevenue(month) {
        return {
            queryKey: [this.queryKeys.paginate],
            queryFn: () => {
                return this.api
                    .get<IRevenue[]>({
                        url: '/revenue/month',
                        params: {
                            month: month
                        }
                    })
                    .then((res) => res.data);
            }
        }
    }
    static getRevenueByMonth() {
        return {
            queryKey: [this.queryKeys.paginate],
            queryFn: () => {
                return this.api
                    .get<IRevenue[]>({
                        url: '/revenue/month/all',
                    })
                    .then((res) => res.data);
            }
        }
    }
    static getRevenueByDate(date) {
        return {
            queryKey: [this.queryKeys.getByDate, date],
            queryFn: () => {
                return this.api
                    .get<IRevenue[]>({
                        url: '/revenue/week',
                        params: {
                            date: date
                        }
                    })
                    .then((res) => res.data);
            }
        }
    }
}
Revenue.setup();