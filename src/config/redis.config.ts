export default () => {
  const opts = {
    port: Number(process.env.REDIS_PORT),
    host: process.env.REDIS_HOST,
  };
  return process.env.NODE_ENV === 'test'
    ? {
        ...opts,
        db: 2,
      }
    : {
        ...opts,
        db: 1,
      };
};
