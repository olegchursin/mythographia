import { Fragment, type ReactNode } from "react";

/** Fill "{name}" placeholders in a dictionary string with text or elements: fill(t.kinship.shared, { a: <EntityLink …/> }). */
export function fill(template: string, values: Record<string, ReactNode>): ReactNode {
  return template.split(/(\{\w+\})/).map((part, i) => {
    const key = part.match(/^\{(\w+)\}$/)?.[1];
    return <Fragment key={i}>{key && key in values ? values[key] : part}</Fragment>;
  });
}

/** String-only variant, safe for client components and attributes. */
export const format = (template: string, values: Record<string, string | number>) => template.replace(/\{(\w+)\}/g, (m, k) => (k in values ? String(values[k]) : m));
