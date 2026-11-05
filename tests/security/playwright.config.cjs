const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'.', testMatch:'security.spec.cjs', fullyParallel:true,
  workers:2, retries:0, timeout:30000, reporter:'list',
  use:{browserName:'chromium',headless:true,serviceWorkers:'block'},
});
