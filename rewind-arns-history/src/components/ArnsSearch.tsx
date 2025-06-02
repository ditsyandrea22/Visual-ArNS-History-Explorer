import React, { useState } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
  loading: boolean;
}

export default function ArnsSearch({ value, onChange, loading }: Props) {
  const [local, setLocal] = useState(value);

  React.useEffect(() => {
    setLocal(value);
  }, [value]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange(local.trim());
  };

  return (
    <form
      onSubmit={submit}
      className="w-full flex flex-col items-center gap-2"
      autoComplete="off"
    >
      <label htmlFor="arns" className="sr-only">ArNS Name</label>
      <div className="flex w-full max-w-md">
        <input
          id="arns"
          type="text"
          placeholder="Enter ArNS name (e.g. rewind.ar)"
          className="flex-1 rounded-l border border-blue-300 px-4 py-2 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={local}
          onChange={e => setLocal(e.target.value)}
          disabled={loading}
          autoFocus
          required
        />
        <button
          type="submit"
          className="rounded-r bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-semibold transition disabled:bg-blue-300"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
      <div className="text-xs text-gray-400">Only enter the name (no ".ar" needed)</div>
    </form>
  );
}