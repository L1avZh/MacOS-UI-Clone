import { TrashIcon } from "@/icons/AppIcons";

export default function Trash() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        color: "var(--text-tertiary)",
      }}
    >
      <TrashIcon size={64} />
      <p>Trash is empty</p>
    </div>
  );
}
