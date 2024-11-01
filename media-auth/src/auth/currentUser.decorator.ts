import { createParamDecorator, ExecutionContext } from "@nestjs/common";

const getCurrentUserByContext = (context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    return req.user;
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, context: ExecutionContext) => getCurrentUserByContext(context)
);