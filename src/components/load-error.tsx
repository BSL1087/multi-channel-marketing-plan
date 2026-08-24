import { AlertTriangle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Shown when loading the actions failed.
 *
 * Deliberately loud: a failed query used to render exactly like "there are no
 * actions". In a planning tool that is worse than an error message — somebody
 * could conclude nothing is scheduled and plan on top of running campaigns.
 */
export function LoadError({
  detail,
  hint,
}: {
  /** Technical message from the database, so support can act on it. */
  detail?: string;
  /** Optional next step for the user. */
  hint?: string;
}) {
  return (
    <Alert variant="destructive" className="mt-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Aktionen konnten nicht geladen werden</AlertTitle>
      <AlertDescription>
        <p>
          Die Liste ist deshalb leer — das bedeutet <strong>nicht</strong>, dass
          keine Aktionen geplant sind. Bitte lade die Seite neu.
        </p>
        {hint && <p className="mt-2">{hint}</p>}
        {detail && (
          <p className="mt-2 text-xs opacity-80">Technische Meldung: {detail}</p>
        )}
      </AlertDescription>
    </Alert>
  );
}
