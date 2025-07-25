
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Settings, Clapperboard } from "lucide-react";
import { Button } from '../ui/button';
import { Logo } from './logo';
import { ScrollArea } from '../ui/scroll-area';
import { ClientFolderTree } from './client-folder-tree';

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b px-4 md:px-6">
            <Logo/>
        </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col space-y-1 p-2">
            <ClientFolderTree />
            <Link href="/dashboard/video">
                <Button variant="ghost" className={cn(
                    "w-full justify-start",
                    pathname === '/dashboard/video' && 'bg-accent'
                )}>
                <Clapperboard className="mr-2 h-4 w-4" />
                Video Generation
                </Button>
            </Link>
        </div>
      </ScrollArea>
       <div className="mt-auto p-2">
         <Link href="/dashboard/settings">
            <Button variant="ghost" className={cn(
                "w-full justify-start",
                pathname === '/dashboard/settings' && 'bg-accent'
            )}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
      </div>
    </div>
  );
}
