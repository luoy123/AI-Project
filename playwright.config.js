// Playwright配置文件
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './playwright-tests',

  // 测试超时时间
  timeout: 30000,

  // 期望超时时间
  expect: {
    timeout: 5000
  },

  // 失败时重试次数
  retries: 1,

  // 并行执行的worker数量
  workers: 1,

  // 报告配置
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // 输出目录
  outputDir: 'test-results/',

  use: {
    // 基础URL
    baseURL: 'http://localhost:1234',

    // 浏览器选项
    headless: false, // 显示浏览器窗口

    // 视口大小
    viewport: { width: 1920, height: 1080 },

    // 忽略HTTPS错误
    ignoreHTTPSErrors: true,

    // 截图设置
    screenshot: 'only-on-failure',

    // 视频设置
    video: 'retain-on-failure',

    // 追踪设置
    trace: 'on-first-retry',

    // 操作超时
    actionTimeout: 10000,

    // 导航超时
    navigationTimeout: 30000
  },

  // 项目配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  // Web服务器配置(如果需要自动启动服务器)
  // webServer: {
  //   command: 'mvn spring-boot:run',
  //   port: 1234,
  //   timeout: 120000,
  //   reuseExistingServer: true,
  // },
});
