const defineRpcSyncActions = (actions: Record<string, ((...args: any[]) => any) | undefined>) => {
  return () => {
    return async function (params: { method: string; args: any[] }) {
      // console.log(params);
      const { method, args } = params || {};
      const action = actions[method as keyof typeof actions];
      if (action) {
        return action(...(args || []));
      }
      return "from mjs worker";
    };
  };
};

export default defineRpcSyncActions({
  incr: async (a: number) => a + 1,
  ping: () => "pong!!",
});
