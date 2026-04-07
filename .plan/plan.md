# Price Action Trader 可视化桌面应用实现计划

## 1. 项目概述
（修改）项目使用ant-design-vue
- **项目名称**: price-action-trader-desktop
- **项目路径**: `D:\project\electron`
- **技术栈**: Electron + Vue3 + Vite + TypeScript
- **目标**: 为 `D:\project\python\price_action_trader` 项目创建可视化桌面应用

---

## 2. 界面布局设计

### 2.1 整体布局（类微信桌面端）

开始回测有两种选择：
- 突破买入回测：运行backtest_main.py（默认）
- 回调买入回测：运行backtest_retrace.py

```
┌─────────────────────────────────────────────────────────────────────────┐
│  左侧边栏    │              中间区域                   │   右侧日志面板    │
│   (60px)    │            (固定宽度)                   │  (可调整宽度)    │
│             │          适配股票代码宽度                │                 │
│  ┌───────┐  │  ┌───────────────────────────────┐   │  ┌───────────┐  │
│  │ 技术   │  │  │                               │   │  │           │  │
│  │ 分析   │  │  │   stock_list 或              │   │  │   日志    │  │
│  │(tooltip)│  │  │   stock_backtest_list       │   │  │   内容    │  │
│  ├───────┤  │  │                               │   │  │           │  │
│  │ 回测   │  │  │       (可编辑)                │   │  │  (滚动条) │  │
│  │(tooltip)│  │  │                               │   │  │           │  │
│  ├───────┤  │  └───────────────────────────────┘   │  │           │  │
│  │       │  │                                        │  └───────────┘  │
│  │       │  │  [开始分析⚙️] / [开始回测⚙️]           │                 │
│  ├───────┤  │                                        │                 │
│  │ 设置   │  │                                        │                 │
│  │(底部) │  │                                        │                 │
│  └───────┘  │                                        │                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**布局说明**:
- 中间区域: 固定宽度，宽度根据股票代码长度自适应（刚好显示一行）
- 右侧日志面板: 可拖拽调整宽度，默认280px，支持垂直滚动条
- 左侧图标: 悬停显示 tooltip，提示"点击切换到XXX"
- 设置页面右下角: 包含应用、重置按钮；应用按钮保存修改并提示立即生效或下次运行生效，重置按钮恢复默认设置并提示生效方式

```
┌───────────────────────────────────────────────────────────────────────┐
│  左侧边栏   │                    设置页面                               │
│   (60px)   │              (中间 + 右侧合并)                          │
│            │                                                              │
│  ┌───────┐ │  ┌─────────────────────────────────────────────────────┐ │
│  │ 技术   │ │  │ [技术分析|回测设置|代理设置|执行配置|提醒功能|...|关于]│ │
│  │ 分析   │ │  ├─────────────────────────────────────────────────────┤ │
│  ├───────┤ │  │                                                     │ │
│  │ 回测   │ │  │                   设置表单内容                      │ │
│  ├───────┤ │  │                   (根据Tab切换)                      │ │
│  │       │ │  │                                                     │ │
│  │       │ │  │                                                     │ │
│  ├───────┤ │  │                                                     │ │
│  │ 设置   │ │  └─────────────────────────────────────────────────────┘ │
│  │(高亮)  │ │                                                              │
│  └───────┘ │                                                              │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 3. 功能模块划分

### 3.1 左侧导航栏

| 图标 | 功能 | 说明 |
|------|------|------|
| 📊 | 技术分析 | 切换到技术分析视图，显示 stock_list |
| 📈 | 回测 | 切换到回测视图，显示 stock_backtest_list |
| ⚙️ | 设置 | 切换到设置页面（位于最底部） |

### 3.2 中间区域

#### 3.2.1 技术分析模式

- **stock_list 编辑区**: 显示 `data/stock_list.txt` 内容
- 每行一只股票代码（格式: `600519.SS`, `000858.SZ`）
- 支持手动添加/删除/修改
- **开始分析按钮**: 执行 `python main.py`

#### 3.2.2 回测模式

- **stock_backtest_list 编辑区**: 显示 `data/stock_backtest_list.txt` 内容
- 支持手动添加/删除/修改
- **开始回测按钮**: 支持两种回测模式：
  - 突破买入回测：执行 `python backtest_main.py`（默认）
  - 回调买入回测：执行 `python backtest_retrace.py`

### 3.3 右侧日志面板

- 实时显示 Python 脚本的 stdout/stderr 输出
- 根据当前模式显示对应日志：
  - 技术分析模式: `logs/stock_analysis.log`
  - 回测模式: `logs/backtest.log`
- 日志内容自动滚动到底部
- 支持清空日志按钮

### 3.4 设置页面

#### 3.4.1 Tab 分类

设置表单设计要求：
- 各配置需根据数据类型选择合适的表单控件（选择框或输入框），并添加提示文字说明
- 需对用户输入进行合法性校验，如回测时间范围中开始时间不能大于结束时间

| Tab 名称 | 对应 config.py 内容 |
|----------|---------------------|
| 技术分析设置 | `PA_PARAMS` 相关参数 |
| 回测设置 | 回测时间范围、频率、资金管理等参数 |
| 代理设置 | `proxy` |
| 执行配置 | `ENABLE_LOOP`, `INTERVAL_SECONDS` |
| 提醒功能 | `ENABLE_NOTIFICATION`, `ENABLE_POPUP`, `ENABLE_EMAIL`, `ENABLE_SYSTEM_NOTIFY`, `EMAIL_CONFIG` |
| 文件路径 | `BASE_DIR`, `DATA_DIR`, `LOGS_DIR`, `STOCK_FILE_PATH`, `STOCK_BACKTEST_FILE_PATH` |
| 系统设置 | 字体大小、主题模式（不涉及 config.py） |
| 关于/帮助 | README + 免责声明 |

#### 3.4.2 技术分析设置 Tab（新增）

- **K线形态参数**: `pinbar_body_ratio`, `pinbar_shadow_ratio`, `swing_window`, `consolidation_lookback`
- **均线系统**: `ma_type`, `ma_short_period`, `ma_long_period`
- **止损配置**: `stop_loss_pct`
- **资金管理**: `risk_reward_ratio`, `min_volume`

#### 3.4.3 回测设置 Tab（新增）

- **时间范围**: 开始日期、结束日期
- **回测频率**: 日线/周线/月线
- **资金参数**: 初始资金、佣金费率、印花税率
- **风控参数**: 单笔风险比例、总风险敞口上限、移动止损

#### 3.4.4 系统设置 Tab

- **字体大小**: 小/中/大 三档
- **界面主题**: 跟随系统 / 浅色模式 / 深色模式

#### 3.4.5 关于/帮助 Tab

- **README**: 显示项目说明、使用指南（主要文档内容放在单独的弹框中展示）
- **免责声明**: 交易风险提示、盈亏自负声明，需醒目显示

### 3.5 消息通知系统

当 Python 端发送交易信号时，Electron 桌面端通过以下方式提醒用户：

| 通知方式 | 实现方案 |
|----------|----------|
| 系统通知 | 使用 Electron `Notification` API |
| 窗口闪烁 | ` BrowserWindow.flashFrame()` |
| 任务栏图标 | 使用 `electron-windows-notifications` 或原生实现 |

**触发时机**:
- 技术分析完成，出现"买入"信号时
- 回测完成时
- Python 进程异常退出时

### 3.6 IPC 通信设计

```
┌─────────────────┐         IPC          ┌─────────────────┐
│   Vue Renderer  │ ◄─────────────────► │   Main Process  │
│                 │                      │                 │
│  - 导航状态     │   invoke/send       │  - Python 进程  │
│  - 列表数据     │   handle/on         │    管理         │
│  - 日志流       │                      │  - 文件读写     │
│  - 设置表单     │                      │  - config 读写 │
└─────────────────┘                      └─────────────────┘
```

#### IPC 通道定义

| 通道名 | 方向 | 用途 |
|--------|------|------|
| `python:run-analysis` | renderer → main | 启动技术分析 |
| `python:run-backtest` | renderer → main | 启动回测（带参数） |
| `python:output` | main → renderer | 日志输出流 |
| `python:exit` | main → renderer | 进程结束通知 |
| `file:read-stock-list` | renderer → main | 读取股票列表 |
| `file:save-stock-list` | renderer → main | 保存股票列表 |
| `config:read` | renderer → main | 读取配置 |
| `config:write` | renderer → main | 写入配置 |
| `config:get-categories` | renderer → main | 获取配置分类 |
| `notification:show` | main → renderer | 显示系统通知 |
| `window:flash` | main → renderer | 窗口闪烁提醒 |

---

## 4. 技术实现方案

### 4.1 项目结构

```
electron/
├── package.json
├── vite.config.ts
├── electron-builder.json
├── tsconfig.json
├── README.md              # 项目说明
├── DISCLAIMER.md           # 免责声明
├── src/
│   ├── main/                    # Electron 主进程
│   │   ├── index.ts             # 入口
│   │   ├── python-runner.ts     # Python 进程管理
│   │   ├── ipc-handlers.ts      # IPC 处理器
│   │   └── file-ops.ts          # 文件操作
│   ├── preload/
│   │   └── index.ts             # 预加载脚本
│   └── renderer/                # Vue3 渲染进程
│       ├── index.html
│       ├── src/
│       │   ├── main.ts
│       │   ├── App.vue
│       │   ├── components/
│       │   │   ├── LeftSidebar.vue
│       │   │   ├── StockListEditor.vue
│       │   │   ├── LogPanel.vue
│       │   │   └── Settings/
│       │   │       ├── SettingsView.vue
│       │   │       ├── TechnicalAnalysisSettings.vue
│       │   │       ├── BacktestSettings.vue
│       │   │       ├── ProxySettings.vue
│       │   │       ├── ExecutionSettings.vue
│       │   │       ├── NotificationSettings.vue
│       │   │       ├── FilePathSettings.vue
│       │   │       ├── SystemSettings.vue
│       │   │       └── AboutSettings.vue
│       │   ├── stores/
│       │   │   ├── app.ts        # 主状态（当前视图、日志）
│       │   │   ├── stock.ts      # 股票列表状态
│       │   │   └── settings.ts   # 设置状态
│       │   ├── types/
│       │   │   └── index.ts       # TypeScript 类型定义
│       │   └── styles/
│       │       └── main.css
│       └── public/
└── resources/
    └── icon.png
```

### 4.2 核心依赖

```json
{
  "dependencies": {
    "vue": "^3.4.x",
    "pinia": "^2.1.x",
    "chokidar": "^3.5.x"
  },
  "devDependencies": {
    "electron": "^28.x",
    "electron-builder": "^24.x",
    "vite": "^5.x",
    "vite-plugin-electron": "^0.28.x",
    "@vitejs/plugin-vue": "^5.x",
    "typescript": "^5.x",
    "electron-log": "^5.x"
  }
}
```

### 4.3 Python 进程管理

```typescript
// main/python-runner.ts 核心逻辑
class PythonRunner {
  private process: ChildProcess | null = null;

  runAnalysis(): void {
    this.process = spawn('python', ['main.py'], {
      cwd: 'D:/project/python/price_action_trader'
    });
    // 管道 stdout/stderr 到 renderer
  }

  runBacktest(args?: string[]): void {
    this.process = spawn('python', ['backtest_main.py', ...args], {
      cwd: 'D:/project/python/price_action_trader'
    });
  }

  kill(): void {
    this.process?.kill();
  }
}
```

### 4.4 日志文件监听

使用 `chokidar` 监听日志文件变化，实时推送到 renderer：

```typescript
// main/file-ops.ts
watchLogFile(filepath: string, callback: (line: string) => void) {
  const watcher = watch(filepath, { persistent: true });
  // 读取新行内容，通过 IPC 发送
}
```

### 4.5 配置管理

- 读取 `config.py`，解析为 JSON 结构
- 写入时保持 Python 语法格式
- 设置页面修改后自动同步到 config.py

---

## 5. 实现步骤

### Phase 1: 项目脚手架
1. 初始化 Vite + Vue3 + TypeScript 项目
2. 配置 electron-vite 插件
3. 创建基础目录结构
4. 配置 electron-builder

### Phase 2: 主进程开发
1. 实现 Python 进程管理器
2. 实现 IPC 处理器
3. 实现文件读写操作
4. 实现日志文件监听
5. 实现系统通知功能

### Phase 3: 预加载脚本
1. 暴露安全的 IPC API 到 renderer
2. 定义 TypeScript 接口

### Phase 4: 渲染进程开发
1. 实现左侧导航栏组件
2. 实现股票列表编辑器
3. 实现日志面板组件
4. 实现设置页面及各个 Tab

### Phase 5: 状态管理
1. 配置 Pinia stores
2. 实现视图切换逻辑
3. 实现设置同步逻辑

### Phase 6: 样式与主题
1. 实现浅色/深色主题
2. 实现字体大小切换
3. 实现跟随系统主题

### Phase 7: 测试与打包
1. 功能测试
2. 构建 Windows 安装包

---

## 6. 关键文件映射

| config.py 字段 | 设置 Tab | 表单组件 |
|----------------|----------|----------|
| `PA_PARAMS` | 技术分析设置 | Multiple inputs |
| 回测参数（命令行） | 回测设置 | DatePicker + Select |
| `proxy` | 代理设置 | Input + Switch |
| `ENABLE_LOOP`, `INTERVAL_SECONDS` | 执行配置 | Switch + NumberInput |
| `ENABLE_NOTIFICATION`, `ENABLE_POPUP`, `ENABLE_EMAIL`, `ENABLE_SYSTEM_NOTIFY` | 提醒功能 | Switch |
| `EMAIL_CONFIG` | 提醒功能 | Object (子表单) |
| `BASE_DIR`, `DATA_DIR`, `LOGS_DIR` | 文件路径 | ReadOnly / PathPicker |
| `STOCK_FILE_PATH`, `STOCK_BACKTEST_FILE_PATH` | 文件路径 | PathPicker |
| 无（新增） | 系统设置 | Theme + FontSize |
| 无（新增） | 关于/帮助 | Markdown 显示组件 |

---

## 7. 注意事项

1. **Python 路径**: 硬编码为 `D:/project/python/price_action_trader`
2. **日志编码**: 使用 `utf-8` 读取日志文件
3. **进程清理**: 应用退出时确保 Python 进程被终止
4. **配置同步**: config.py 修改后实时生效
5. **主题持久化**: 使用 electron-store 保存主题和字体大小设置
6. **消息通知**: 买入信号触发系统通知时，需要解析 Python 日志内容获取信号详情
7. **日志面板宽度**: 默认280px，可拖拽调整，调整结果持久化到 electron-store
8. **中间区域宽度**: 根据股票代码长度自适应（单行显示）
