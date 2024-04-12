import { Config } from "./Config";
import { Speaker } from "./Speaker";

export function App() {
  return (
    <>
      <p>{"Hello2!"}</p>
      <Config />
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Speaker />
        <Speaker />
        <Speaker />
      </div>
    </>
  );
}
