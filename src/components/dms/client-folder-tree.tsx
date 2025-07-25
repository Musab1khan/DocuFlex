
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDms } from '@/context/dms-context';
import type { Folder } from '@/types';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Folder as FolderIcon, ChevronRight } from "lucide-react";
import { Button } from '../ui/button';

const FolderTreeItem = ({
  item,
  level = 0,
}: {
  item: Folder;
  level?: number;
}) => {
  const { activeItem, setActiveItem, currentUser } = useDms();
  const [isOpen, setIsOpen] = React.useState(level < 2); // Auto-expand first 2 levels
  const router = useRouter();

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveItem(item);
    router.push('/dashboard');
  };
  
  const hasPermission = (item: Folder) => {
    const userPerm = item.permissions[currentUser.id];
    const departmentPerm = item.departmentPermissions?.[currentUser.department];
    return !!userPerm || !!departmentPerm || currentUser.role === 'admin';
  }

  const subFolders = useMemo(() => {
    if (!item.children) return [];
    return item.children.filter(child => {
      if (child.type !== 'folder') return false;
      return hasPermission(child);
    }) as Folder[];
  }, [item.children, currentUser]);
  
  const hasSubFolders = subFolders.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          onClick={handleSelect}
          className={cn(
            "w-full justify-start pl-3 pr-2 h-9",
            activeItem.id === item.id && "bg-accent text-accent-foreground",
          )}
          style={{ paddingLeft: `${0.75 + level * 1}rem` }}
        >
          <div className='flex items-center gap-2 w-full'>
            {hasSubFolders ? (
                <ChevronRight
                className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    isOpen && "rotate-90"
                )}
                />
            ) : (
                <span className="h-4 w-4 shrink-0" /> 
            )}
            <FolderIcon className="h-4 w-4 text-primary" />
            <span className="truncate flex-1 text-left">{item.name}</span>
          </div>
        </Button>
      </CollapsibleTrigger>
      {hasSubFolders && (
        <CollapsibleContent>
            <div className="flex flex-col space-y-1 py-1">
            {subFolders.map((child) => (
                <FolderTreeItem key={child.id} item={child} level={level + 1} />
            ))}
            </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

export const ClientFolderTree = () => {
  const { fileSystem, currentUser } = useDms();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const hasPermission = (item: Folder) => {
    const userPerm = item.permissions[currentUser.id];
    const departmentPerm = item.departmentPermissions?.[currentUser.department];
    return !!userPerm || !!departmentPerm || currentUser.role === 'admin';
  }

  const rootFolder = useMemo(() => {
     if (hasPermission(fileSystem)) {
        return fileSystem;
     }
     return null;
  }, [fileSystem, currentUser]);

  if (!isClient || !rootFolder) {
    return null;
  }

  return <FolderTreeItem item={rootFolder} level={0} />;
}
