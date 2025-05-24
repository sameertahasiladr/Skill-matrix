import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { IGetUser } from "../interfaces/get-user.interface";

export const GetUser = createParamDecorator(
  (data: keyof IGetUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: IGetUser = request.user;
    return data ? user?.[data] : user;
  },
);
