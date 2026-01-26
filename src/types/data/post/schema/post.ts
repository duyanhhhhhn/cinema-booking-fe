import * as yup from "yup";
export const createPostSchema = () => {
    return yup.object().shape({
        title: yup.string().required("Title is required"),
    });
}