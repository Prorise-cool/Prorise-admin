// src/api/services/menuService.ts

import type { MenuEntity } from "@/types/entity";
import apiClient from "../apiClient";

export enum MenuApi {
  Menu = "/menu",
}

const getMenuList = () => apiClient.get<MenuEntity[]>({ url: MenuApi.Menu });

export default {
  getMenuList,
};
