/**
 * 环境检测工具函数
 * 用于判断当前代码运行在服务端还是客户端
 */

export type Environment = 'server' | 'browser' | 'webworker';

/**
 * 检查是否在服务端环境
 */
export const isServerSide = (): boolean => {
  return typeof window === 'undefined';
};

/**
 * 检查是否在客户端环境
 */
export const isClientSide = (): boolean => {
  return typeof window !== 'undefined';
};

/**
 * 检查是否在浏览器环境
 */
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * 获取当前运行环境
 */
export const getEnvironment = (): Environment => {
  if (typeof window === 'undefined') {
    return 'server';
  }
  
  if (typeof document === 'undefined') {
    return 'webworker';
  }
  
  return 'browser';
};

/**
 * 检查是否支持DOM操作
 */
export const canUseDOM = (): boolean => {
  return !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );
};

/**
 * 安全地获取window对象
 */
export const getWindow = (): Window | undefined => {
  return isClientSide() ? window : undefined;
};

/**
 * 安全地获取document对象
 */
export const getDocument = (): Document | undefined => {
  return canUseDOM() ? document : undefined;
};

/**
 * 检查是否在开发环境
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * 检查是否在生产环境
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};