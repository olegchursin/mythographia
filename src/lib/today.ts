/** Days since the epoch — rotates the featured article without any stored state. */
export const dayIndex = () => Math.floor(Date.now() / 86_400_000);
