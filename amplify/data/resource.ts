import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
// 1. ⚠️ 注意：确保你在同一级或上级目录有创建好的 lambda 函数，并在这里正确 import 它
import { createLivenessSession as livenessLambda } from "../functions/create-liveness-session/resource";

const schema = a.schema({
  // == 原有的 Todo 保持不变 ==
  Todo: a
    .model({
      content: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // == 🚀 新增：活体检测自定义 Query ==
  createLivenessSession: a
    .query()
    .returns(a.json()) // 声明返回结构为 JSON 字符串
    .handler(a.handler.function(livenessLambda)) // 将这个接口绑定到你的 Lambda 函数
    .authorization((allow) => [allow.authenticated()]), // 🔒 严格限制：只有登录后的用户才能调用
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    // 2. ⚠️ 极其重要：因为增加了用户认证规则，这里必须把默认授权模式改为 userPool (Cognito)
    defaultAuthorizationMode: "userPool", 
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
