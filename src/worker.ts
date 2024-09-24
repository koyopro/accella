function init() {
  return async function (params: { method: string; args: any[] }) {
    // console.log(params);
    const { method, args } = params || {};
    const action = actions[method as keyof typeof actions];
    if (action) {
      return action(...(args || []));
    }
    return "from mjs worker";
  };
}

export const actions: Record<string, ((...args: any[]) => any) | undefined> = {
  incr: async (a: number) => a + 1,
  ping: () => "pong!",
};

export { init };
export default init;
