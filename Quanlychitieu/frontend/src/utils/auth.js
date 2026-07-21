export function getTokenPayload() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      window
        .atob(normalized)
        .split('')
        .map(
          (character) =>
            `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`,
        )
        .join(''),
    );

    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  const payload = getTokenPayload();

  return Number(
    payload?.sub ??
      payload?.userId ??
      payload?.id ??
      0,
  );
}