# 🧪 测试指南

## 概述

项目已配置 Vitest 作为测试框架，支持 React 组件测试、工具函数测试和 API 测试。

## 测试框架

- **Vitest**: 快速、现代的测试框架，与 Vite 完美集成
- **React Testing Library**: React 组件测试
- **jsdom**: DOM 环境模拟

## 运行测试

### 基本命令

```bash
# 运行所有测试
npm run test

# 运行测试并监听文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 打开测试 UI
npm run test:ui
```

### 在开发中

```bash
# 在 watch 模式下运行测试
npm run test:watch
```

## 测试结构

```
frontend/src/
├── test/
│   ├── setup.ts              # 测试环境配置
│   └── utils/
│       └── testUtils.tsx     # 测试工具函数
├── utils/
│   └── __tests__/
│       └── errorHandler.test.ts
├── lib/
│   └── __tests__/
│       └── utils.test.ts
└── components/
    └── __tests__/
        └── ErrorBoundary.test.tsx

api/
└── __tests__/
    └── utils/
        └── envValidator.test.ts
```

## 编写测试

### 工具函数测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('should work correctly', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### React 组件测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/testUtils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### API 测试示例

```typescript
import { describe, it, expect } from 'vitest';
import { validateEnv } from '../../utils/envValidator';

describe('envValidator', () => {
  it('should validate environment variables', () => {
    const result = validateEnv();
    expect(result.isValid).toBe(true);
  });
});
```

## 测试工具函数

### renderWithProviders

用于渲染需要路由或其他提供者的组件：

```typescript
import { renderWithProviders } from '@/test/utils/testUtils';

renderWithProviders(<MyComponent />);
```

### Mock 数据

在 `test/utils/testUtils.tsx` 中提供了常用的 mock 数据：

- `mockUser` - 用户数据
- `mockResume` - 简历数据
- `mockApiResponse` - API 响应

## 测试覆盖率

目标覆盖率: **60%+**

查看覆盖率报告：

```bash
npm run test:coverage
```

报告将生成在 `coverage/` 目录中。

## 最佳实践

1. **测试命名**: 使用描述性的测试名称
2. **测试隔离**: 每个测试应该独立运行
3. **Mock 外部依赖**: 使用 vi.mock() 模拟 API 调用
4. **测试用户行为**: 测试用户如何与组件交互
5. **避免测试实现细节**: 测试行为而非实现

## 当前测试覆盖

### ✅ 已实现的测试

- ✅ 错误处理工具 (`errorHandler.test.ts`)
- ✅ 工具函数 (`utils.test.ts`)
- ✅ ErrorBoundary 组件 (`ErrorBoundary.test.tsx`)
- ✅ 环境变量验证器 (`envValidator.test.ts`)

### ⏳ 待添加的测试

- [ ] Store 测试 (Zustand stores)
- [ ] API 集成测试
- [ ] 关键页面组件测试
- [ ] Hook 测试
- [ ] E2E 测试

## CI/CD 集成

在 CI/CD 流程中运行测试：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: npm run test:coverage
```

## 故障排除

### 常见问题

1. **jsdom 错误**: 确保已安装 `jsdom` 依赖
2. **模块导入错误**: 检查 `vitest.config.ts` 中的路径配置
3. **React 组件测试失败**: 确保使用 `renderWithProviders` 包装组件

## 资源

- [Vitest 文档](https://vitest.dev/)
- [React Testing Library 文档](https://testing-library.com/react)
- [测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**最后更新**: 2026-02-03
