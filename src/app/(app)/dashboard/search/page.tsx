
'use client';

import { Suspense, use } from 'react';
import { semanticDocumentSearch } from '@/ai/flows/semantic-document-search';
import { getAllDocuments } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileSearch } from 'lucide-react';
import type { FileSystemItem } from '@/types';
import { useDms } from '@/context/dms-context';

function SearchResults({ query }: { query: string }) {
  const { fileSystem, currentUser } = useDms();

  if (!query) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <FileSearch className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Search in your documents</h2>
        <p className="text-muted-foreground">
          Enter a query in the search bar to find relevant information.
        </p>
      </div>
    );
  }

  // Filter documents based on user and department permissions before searching
  const allDocs = getAllDocuments(fileSystem).filter((item) => {
    if (item.type === 'folder') return false; // Exclude folders
    const userPerm = item.permissions[currentUser.id];
    const departmentPerm = item.departmentPermissions?.[currentUser.department];
    return !!userPerm || !!departmentPerm || currentUser.role === 'admin';
  }) as FileSystemItem[];

  const documentContent = allDocs
    .map((doc) => `Document: ${doc.name}\nContent: ${doc.content || ''}`)
    .join('\n\n');

  // Using `use` hook for client-side data fetching from a promise
  const searchResults = use(
    semanticDocumentSearch({ query, documentContent })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Search Results for &quot;{query}&quot;
      </h1>
      {searchResults.relevantPassages &&
      searchResults.relevantPassages.length > 0 ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{searchResults.reasoning}</p>
            </CardContent>
          </Card>

          <h2 className="pt-4 text-xl font-semibold">Relevant Passages</h2>
          {searchResults.relevantPassages.map((passage, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <blockquote className="border-l-2 pl-6 italic">
                  {passage}
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileSearch className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No results found</h2>
          <p className="text-muted-foreground">
            Try a different search query or check your permissions.
          </p>
        </div>
      )}
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </CardContent>
        </Card>
        <Skeleton className="h-6 w-1/3 pt-4" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const query = (searchParams?.q as string) || '';

  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchResults query={query} />
    </Suspense>
  );
}
