import { onBeforeMount, onServerPrefetch, ref, useSSRContext, watch, type Ref, type WatchSource } from 'vue';
import { usePrefetchStore } from '@/stores/prefetch';

export type MultiWatchSources = (WatchSource<unknown> | object)[];

export interface AsyncDataContext {
  serverContext?: Record<string, any>,
  handleSuccess?: boolean,
}

export interface AsyncDataHandlerResult {
  isSuccess: boolean,
  data?: any,
}

export interface AsyncDataOptions<ResT, DataT = ResT> {
  cache?: boolean,
  server?: boolean,
  pick?: string[],
  watch?: MultiWatchSources,
  default?: () => ResT,
  transform?: (input: DataT) => ResT,
  onAfterHandle?: (ctx: AsyncDataContext) => void,
}

export interface AsyncDataParams<ResT, DataT = ResT> {
  key: string,
  handler: () => Promise<AsyncDataHandlerResult>,
  options?: AsyncDataOptions<ResT, DataT>,
}

export interface AsyncDataResult<ResT> {
  data: Ref<ResT>,
  pending: Ref<boolean>,
  refresh: () => Promise<void>,
  reset: () => void,
}

const getStoreKey = (key: string) => key;

const pick = (obj: Record<string, any>, keys: string[]) => {
  const newObj = {};

  for (const key of keys) {
    if (obj?.[key] !== undefined) {
      (newObj as any)[key] = obj[key];
    }
  }

  return newObj;
}

export function useAsyncData<ResT = any, DataT = ResT>(key: string, handler: () => Promise<AsyncDataHandlerResult>, options?: AsyncDataOptions<ResT, DataT>): AsyncDataResult<ResT>;
export function useAsyncData<ResT = any, DataT = ResT>(...args: AsyncDataParams<ResT, DataT>[]): AsyncDataResult<ResT>[];

export function useAsyncData<ResT = any, DataT = ResT>(...args: any[]): (AsyncDataResult<ResT> | AsyncDataResult<ResT>[]) {
  let argsQueue: AsyncDataParams<ResT, DataT>[] = [];
  const store = usePrefetchStore();

  if (typeof args[0] === 'string') {
    const [key, handler, options = {}] = args as [string, () => Promise<AsyncDataHandlerResult>, AsyncDataOptions<ResT, DataT>];
    argsQueue.push({ key, handler, options });
  }
  else {
    argsQueue = args;
  }

  const resultQueue: AsyncDataResult<ResT>[] = argsQueue.map((item) => {
    const defaultValue = item?.options?.default ? item.options.default() : null;
    const data = ref(defaultValue) as Ref<ResT>;
    const pending = ref(false);
    const storeKey = getStoreKey(item.key);

    // 只在开发环境检查重复 Key
    if (import.meta.env.DEV && import.meta.env.SSR && store.definedKeys) {
      if (store.definedKeys[storeKey]) {
        console.warn('Duplicate useAsyncData key: ' + item.key);
        store.duplicateKeys.push(item.key);
      }
      else {
        store.definedKeys[storeKey] = true;
      }
    }

    const refresh = async () => {
      pending.value = true;

      const result = await item.handler();

      pending.value = false;

      if (result.isSuccess) {
        let resultData = result.data as ResT;

        if (item.options?.transform) {
          resultData = item.options.transform(resultData as unknown as DataT);
        }

        if (item.options?.pick) {
          resultData = pick(resultData as any, item.options.pick) as ResT;
        }

        data.value = resultData;
      }

      if (item.options?.onAfterHandle) {
        item.options.onAfterHandle({
          handleSuccess: result.isSuccess,
        });
      }
    };

    const reset = () => {
      data.value = defaultValue as ResT;
    };

    if (item.options?.watch) {
      watch(item.options.watch, () => refresh());
    }

    return {
      data,
      pending,
      refresh,
      reset,
    };
  });

  onServerPrefetch(async () => {
    const ctx = useSSRContext() as Record<string, any>;

    for (let i = 0; i < argsQueue.length; i++) {
      const { key, handler, options } = argsQueue[i];
      const { data } = resultQueue[i];

      if (options?.server !== false) {
        const storeKey = getStoreKey(key);

        const result = await handler();

        if (result.isSuccess) {
          let resultData = result.data as ResT;

          if (options?.transform) {
            resultData = options.transform(resultData as unknown as DataT);
          }

          if (options?.pick) {
            resultData = pick(resultData as any, options.pick) as ResT;
          }

          store.data[storeKey] = resultData;
          data.value = resultData;
        }

        if (options?.onAfterHandle) {
          options?.onAfterHandle({
            serverContext: ctx,
            handleSuccess: result.isSuccess,
          });
        }
      }
    }
  });

  onBeforeMount(async () => {
    for (let i = 0; i < argsQueue.length; i++) {
      const { key, handler, options } = argsQueue[i];
      const { data, pending } = resultQueue[i];
      const storeKey = getStoreKey(key);
      let handleSuccess = true;

      // 只在开发环境检查重复 Key
      if (import.meta.env.DEV && store.duplicateKeys && store.duplicateKeys.length > 0) {
        console.warn('Duplicate useAsyncData key: ' + store.duplicateKeys.join(', '));
      }

      if (options?.server !== false && store.data[storeKey]) {
        data.value = store.data[storeKey];

        if (options?.cache === false) {
          store.data[storeKey] = null;
        }
      }
      else {
        pending.value = true;

        const result = await handler();

        pending.value = false;

        handleSuccess = result.isSuccess;

        if (result.isSuccess) {
          let resultData = result.data as ResT;

          if (options?.transform) {
            resultData = options.transform(resultData as unknown as DataT);
          }

          if (options?.pick) {
            resultData = pick(resultData as any, options.pick) as ResT;
          }

          data.value = resultData;
        }
      }

      if (options?.onAfterHandle) {
        options?.onAfterHandle({
          handleSuccess,
        });
      }
    }
  });

  if (typeof args[0] === 'string') {
    return { ...resultQueue[0] };
  }
  else {
    return resultQueue;
  }
}
