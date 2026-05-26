export const makeOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const expiresIn30Minutes = () => Date.now() + 30 * 60 * 1000;
