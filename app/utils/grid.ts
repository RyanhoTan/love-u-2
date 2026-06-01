/** 将一维数组按每 col 个一组切分成二维行数组 */
export function chunk<T>(arr: T[], col: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += col) {
    rows.push(arr.slice(i, i + col));
  }
  return rows;
}
