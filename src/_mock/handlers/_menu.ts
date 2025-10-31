import { HttpResponse, http } from "msw";
import { ResultStatus } from "@/types/enum";
import { convertFlatToTree } from "@/utils/tree";
import { RAW_MENU_DATA } from "../assets";

/**
 * 模拟菜单 API 端点
 * 拦截 GET /api/menu 请求
 */
const menuList = http.get("/api/menu", async () => {
  // 步骤 1: 从 "数据库" (assets.ts) 获取扁平数据
  const flatList = RAW_MENU_DATA;

  // 步骤 2: 调用工具函数，将扁平数据转换为树状结构
  const menuTree = convertFlatToTree(flatList);

  // 步骤 3: 按照标准格式返回一个 JSON 响应
  return HttpResponse.json(
    {
      status: ResultStatus.SUCCESS, // 业务状态码
      message: "Success",
      data: menuTree,
    },
    {
      status: 200, // HTTP 状态码
    },
  );
});

export const menuHandlers = [menuList];
