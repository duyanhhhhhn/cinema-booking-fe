import { IHttpError, IPaginateResponse, IResponse } from "@/types/core/api";
import { Model } from "@/types/core/model";
import { ObjectsFactory } from "@/types/core/objectFactory";
import { useMutation } from "@tanstack/react-query";


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
    data: T[];
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
    path: '/public/posts',
    modal: 'NewsList'
}
export class Post extends Model {
    static queryKeys = {
        paginate: 'POSTS_PAGINATE_QUERY',
        findOne: 'POSTS_FIND_ONE_QUERY',
        getRelate: 'POSTS_FIND_RELATE'
    }
    static objects = ObjectsFactory.factory<IPost>(modelConfig, this.queryKeys)
    static getPosts() {
        return {
            queryKey: [this.queryKeys.paginate],
            queryFn: () => {
                return this.api
                    .get<IPaginateResponse<IPost>>({
                        url: '/public/posts',
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
                    .get<IListResponse<IPost>>({
                        url: `/public/posts/${id}`,
                    })
                    .then(r => r.data)
            }
        }
    }
    static createPost(payload: FormData) {
        return this.api.post<IResponse<IPost>>({
            url: "/posts/new",
            data: payload
        })
    }
}
Post.setup();
export function useCreatePostMutation() {
    return useMutation<IResponse<IPost>, IHttpError, FormData>({
        mutationFn: (payload: FormData) => {
            return Post.createPost(payload).then((r) => r.data);
        },
    });
}