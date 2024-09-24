export type Actions = Record<string, ((...args: any[]) => any) | undefined>;

const defineRpcSyncActions = (actions: Actions) => () => {
  return async function (params: { method: keyof Actions; args: any[] }) {
    const { method, args } = params || {};
    return actions[method]?.(args);
  };
};

export default defineRpcSyncActions({
  incr: async (a: number) => a + 1,
  ping: () => "pong!!",
});
