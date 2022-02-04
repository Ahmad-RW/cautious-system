export interface IAppConfigOptions {
  nodeEnv: string;
  frontendUrl: string;
}

export const appConfig = (): IAppConfigOptions => {
  const env = process.env.NODE_ENV;
  const feURL =
    env === 'production'
      ? process.env.FRONTEND_URL
      : process.env.LOCAL_FRONTEND_URL;

  return {
    nodeEnv: env,
    frontendUrl: feURL,
  };
};
