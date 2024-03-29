import config from "./config.json";

export function Config() {
  return (
    <>
      <p>Config:</p>
      <p>{config.OPENAI_KEY}</p>
    </>
  );
}
