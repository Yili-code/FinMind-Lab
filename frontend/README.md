# React + TypeScript + Vite

此範本提供最小化設定，讓你能在 Vite 中使用 React，並支援 HMR（熱模組替換）與部分 ESLint 規則。

目前有兩個官方外掛可用：

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) 透過 [Babel](https://babeljs.io/)（或在 [rolldown-vite](https://vite.dev/guide/rolldown) 中使用 [oxc](https://oxc.rs)）來實現 Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) 使用 [SWC](https://swc.rs/) 來實現 Fast Refresh

## React Compiler

此範本預設未啟用 React Compiler，主要是考量其對開發與建置效能的影響。若要加入，請參考[官方文件](https://react.dev/learn/react-compiler/installation)。

## 擴充 ESLint 設定

若你正在開發正式環境的應用，建議更新設定以啟用具型別感知的 Lint 規則：

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 其他設定...

      // 將 tseslint.configs.recommended 移除並改用下列設定
      tseslint.configs.recommendedTypeChecked,
      // 或者，可使用更嚴格的規則
      tseslint.configs.strictTypeChecked,
      // 選用：加入風格相關規則
      tseslint.configs.stylisticTypeChecked,

      // 其他設定...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // 其他選項...
    },
  },
])
```

你也可以安裝 [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) 與 [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) 以啟用 React 專用的 Lint 規則：

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // 其他設定...
      // 啟用 React 規則
      reactX.configs['recommended-typescript'],
      // 啟用 React DOM 規則
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // 其他選項...
    },
  },
])
```
