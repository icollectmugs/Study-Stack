export const COLORS = [
  "#FF6B6B", // red
  "#4ECDC4", // teal
  "#45B7D1", // blue
  "#FDCB82", // orange
  "#6C5CE7", // purple
  "#00B894", // green
  "#FF9FF3", // pink
];

export const randomColor = () =>
  COLORS[Math.floor(Math.random() * COLORS.length)];
