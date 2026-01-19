import { Model } from "@/types/core/model";
import { IResponse } from "@/types/core/api";
import { IUser } from "./type";

export class Profile extends Model {
  static queryKey = {
    USER_PROFILE: "USER_PROFILE",
  };

  // PUT /users/me
  static editProfile(data: Partial<IUser>) {
    return this.api.put<IResponse<IUser>>({
      url: "/users/me",
      data,
    });
  }

}

Profile.setup();
