/**
 * 工具信息接口
 */
export interface ToolInfo {
  toolCode: string;
  toolName: string;
  description: string;
  status: string;
}

/**
 * API 响应接口
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 聊天响应
 */
export interface AkaneChatResponse {
  groupId?: string;
  reply?: string;
}

/**
 * 工具列表响应
 */
export type ToolListResponse = ApiResponse<ToolInfo[]>;
