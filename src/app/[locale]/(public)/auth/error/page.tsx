import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Link } from "@/src/i18n/navigation";
import { Suspense } from "react";
import { ShieldX, AlertCircle } from "lucide-react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;
  const isUnauthorized = params?.error === "unauthorized";

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        {isUnauthorized ? (
          <ShieldX className="h-12 w-12 text-destructive" />
        ) : (
          <AlertCircle className="h-12 w-12 text-destructive" />
        )}
      </div>

      {params?.message ? (
        <p className="text-sm text-muted-foreground text-center">
          {params.message}
        </p>
      ) : params?.error ? (
        <p className="text-sm text-muted-foreground text-center">
          Error: {params.error}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          An unspecified error occurred.
        </p>
      )}

      <div className="flex flex-col gap-2 pt-4">
        <Button asChild variant="default">
          <Link href="/">Go to Home</Link>
        </Button>
        {isUnauthorized && (
          <Button asChild variant="outline">
            <Link href="/auth/login">Sign in with a different account</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
