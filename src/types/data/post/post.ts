import { IPaginateResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";


export interface IPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    coverUrl: string;
    published: number;
    publishedAt: string;
    createAt: string;
}
export interface PostFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: string;
    cover_url: string;
    is_published: number;
    published_at: string;
}
export interface IListResponse<T> {
    list: T[];
    is_success: boolean;
    message: string;
}
export const initialPostData: PostFormData = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    cover_url: "",
    is_published: 0,
    published_at: "",
}
const modelConfig = {
    path: '/news',
    modal: 'NewsList'
}
export class Post extends Model {
    static queryKeys = {
        paginate: 'POSTS_PAGINATE_QUERY',
        findOne: 'POSTS_FIND_ONE_QUERY'
    }
    static objects = ObjectsFactory.factory<IPost>(modelConfig, this.queryKeys)
    static getPosts() {
        return {
            queryKey: [this.queryKeys.paginate],
            queryFn: () => {
                return this.api
                    .get<IPaginateResponse<IPost>>({
                        url: '/posts/paging?page=1&size=10',
                    })
                    .then(r => r.data)
            }
        }
    }
    static getPostsInfo(id) {
        return {
            queryKey: [this.queryKeys.findOne],
            queryFn: () => {
                return this.api
                    .get<IPost>({
                        url: `/posts/${id}`,
                    })
                    .then(r => r.data)
            }
        }
    }
}
Post.setup();