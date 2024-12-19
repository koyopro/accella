export const buildFile = () => {
  const fileContent = new Uint8Array([72, 101, 108, 108, 111]); // Binary data for "Hello"
  const blob = new Blob([fileContent], { type: "text/plain" });
  const file = new File([blob], "example.txt", { type: "text/plain" });
  return file;
};
