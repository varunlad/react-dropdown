# @varunlad9/multi-dropdown

A customizable React dropdown with single select, multi select, search, a custom accent color, and smooth animations.

## Install

```bash
npm install @varunlad9/multi-dropdown
```

## Usage

```tsx
import { useState } from "react";
import { Dropdown } from "@varunlad9/multi-dropdown";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

export default function App() {
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <Dropdown
      options={fruits}
      value={selected}
      onChange={setSelected}
      multiple
      searchable
      placeholder="Pick fruits"
      accentColor="#ec4899"
    />
  );
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `options` | `{ value, label, disabled? }[]` | The items to choose from |
| `value` | `string[]` | Selected values |
| `onChange` | `(value: string[]) => void` | Called when the selection changes |
| `multiple` | `boolean` | Allow more than one selection |
| `searchable` | `boolean` | Show a search box |
| `placeholder` | `string` | Text shown when nothing is selected |
| `accentColor` | `string` | Highlight color, such as `"#6366f1"` |

## License

MIT