import type { ErrorRouteComponent } from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";

function Plain(_props: ErrorComponentProps) {
  return null;
}
export const a: ErrorRouteComponent = Plain;

function WithPreload(_props: ErrorComponentProps) {
  return null;
}
(WithPreload as { preload?: () => Promise<void> }).preload = () => Promise.resolve();
export const b: ErrorRouteComponent = WithPreload;
