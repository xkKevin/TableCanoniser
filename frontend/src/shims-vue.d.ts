/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// declare png files as a module
declare module '*.png' {
  const value: string;
  export default value;
}

