
'use client';

import { useDms } from '@/context/dms-context';
import FileBrowser from '@/components/dms/file-browser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { File as FileIcon, FileImage, FileText, FileSpreadsheet } from 'lucide-react';
import type { Document } from '@/types';

const getIcon = (item: Document) => {
  if (item.type === 'image') return <FileImage className="h-8 w-8 text-muted-foreground" />;
  if (item.type === 'pdf') return <FileText className="h-8 w-8 text-red-500" />;
  if (item.type === 'excel') return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
  return <FileIcon className="h-8 w-8 text-muted-foreground" />;
};

function RecentFiles() {
  const { recentItems, setActiveItem, findItem } = useDms();

  const handleRecentClick = (item: Document) => {
    // To navigate to the correct folder, we need to find the parent
    const parentFolder = findItem(item.id, true);
    if (parentFolder) {
      setActiveItem(parentFolder);
    }
    // The preview logic is handled within the FileBrowser component when an item is clicked,
    // but for now, we just navigate to the folder. A more direct preview could be implemented.
  };

  if (recentItems.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Recent Files</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {recentItems.map((item) => (
          <Card 
            key={item.id} 
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleRecentClick(item)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">{item.name}</CardTitle>
              {getIcon(item)}
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Modified: {item.modified}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


export default function DashboardPage() {
  return (
    <>
      <RecentFiles />
      <FileBrowser />
    </>
  );
}
