export interface PaintOption {
  id: string;
  name: string;
  hex: string;
}

/** Paint finishes offered for the CLE Coupé (kept free of three.js so pages can import it eagerly). */
export const CLE_PAINTS: PaintOption[] = [
  { id: 'silver', name: 'High-Tech Silver', hex: '#b9bec4' },
  { id: 'black', name: 'Obsidian Black', hex: '#16191e' },
  { id: 'blue', name: 'Spectral Blue', hex: '#1f3f6e' },
  { id: 'white', name: 'Polar White', hex: '#eef0f0' },
  { id: 'red', name: 'Patagonia Red', hex: '#7a1420' },
];
