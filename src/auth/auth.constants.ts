export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = Number(
  process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ?? 900,
);
export const REFRESH_TOKEN_EXPIRES_IN_SECONDS = Number(
  process.env.JWT_REFRESH_EXPIRES_IN_SECONDS ?? 604800,
);

export const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
export const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
