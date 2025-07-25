
"use client";

import React, { useState, useRef, useMemo } from 'react';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import isUrl from 'is-url';
import mammoth from 'mammoth';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Folder as FolderIcon,
  File as FileIcon,
  FileImage,
  FileText,
  FileSpreadsheet,
  Upload,
  MoreVertical,
  FolderPlus,
  Download,
  Trash2,
  Edit,
  Users,
  Lock,
  Mail,
  Share2,
  ChevronDown,
  FileUp,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
  Loader,
  Building,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDms } from '@/context/dms-context';
import type { FileSystemItem, Folder, Document, User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { produce } from 'immer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const getIcon = (item: FileSystemItem) => {
  if (item.type === "folder") return <FolderIcon className="h-5 w-5 text-primary" />;
  if (item.type === "image") return <FileImage className="h-5 w-5 text-muted-foreground" />;
  if (item.type === "pdf") return <FileText className="h-5 w-5 text-red-500" />;
  if (item.type === 'excel') return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  return <FileIcon className="h-5 w-5 text-muted-foreground" />;
};

type ImportLink = {
  id: string;
  url: string;
  folderName: string;
  cell: string;
  status: 'pending' | 'downloading' | 'success' | 'failed';
};

export default function FileBrowser() {
  const { 
    activeItem, setActiveItem, findItem, updateItem, deleteItem, addItem, 
    currentUser, users, addRecentItem
  } = useDms();
  const [previewItem, setPreviewItem] = useState<Document | null>(null);
  const [renameItem, setRenameItem] = useState<FileSystemItem | null>(null);
  const [emailItem, setEmailItem] = useState<FileSystemItem | null>(null);
  const [shareItem, setShareItem] = useState<FileSystemItem | null>(null);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importLinks, setImportLinks] = useState<ImportLink[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);


  const currentFolder = findItem(activeItem.id) as Folder || findItem('root') as Folder;
  
  const hasPermission = (item: FileSystemItem) => {
    const userPerm = item.permissions[currentUser.id];
    const departmentPerm = item.departmentPermissions?.[currentUser.department];
    return !!userPerm || !!departmentPerm || currentUser.role === 'admin';
  }

  const canWriteInCurrentFolder = useMemo(() => {
    const userPerm = currentFolder.permissions[currentUser.id];
    const departmentPerm = currentFolder.departmentPermissions?.[currentUser.department];
    return userPerm === 'owner' || userPerm === 'write' || departmentPerm === 'write' || currentUser.role === 'admin';
  }, [currentFolder, currentUser]);


  const items = useMemo(() => {
    if (!currentFolder.children) return [];
    return currentFolder.children.filter(item => hasPermission(item));
  }, [currentFolder, currentUser]);


  const handleItemClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      setActiveItem(item);
    } else {
      setPreviewItem(item as Document);
      addRecentItem(item as Document);
    }
  };

  const handleUploadClick = () => {
    if (!canWriteInCurrentFolder) {
        toast({ variant: "destructive", title: "Permission Denied", description: "You don't have permission to upload here."});
        return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = async (e) => {
      const isDoc = file.name.endsWith('.doc') || file.name.endsWith('.docx');
      const isExcel = file.name.endsWith('.xls') || file.name.endsWith('.xlsx');
      let docContent: string | undefined = `Uploaded file: ${file.name}`;
      let fileType: Document['type'] = file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'doc');
      
      if (isDoc && e.target?.result) {
        try {
          const arrayBuffer = e.target.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          docContent = result.value;
          fileType = 'doc';
        } catch (error) {
          console.error("Error extracting text from doc:", error);
          docContent = "Could not extract text from document.";
        }
      } else if (isExcel && e.target?.result) {
         try {
            const arrayBuffer = e.target.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            docContent = XLSX.utils.sheet_to_html(worksheet);
            fileType = 'excel';
        } catch (error) {
            console.error("Error extracting data from excel:", error);
            docContent = "Could not parse Excel file.";
        }
      }

      const readerForUrl = new FileReader();
      readerForUrl.onload = (urlEvent) => {
          const newItem: Document = {
              id: `doc-${Date.now()}`,
              name: file.name,
              type: fileType,
              modified: new Date().toISOString().split('T')[0],
              size: `${(file.size / 1024).toFixed(2)} KB`,
              url: isDoc || isExcel ? undefined : urlEvent.target?.result as string,
              content: docContent,
              ownerId: currentUser.id,
              permissions: { [currentUser.id]: 'owner' }
          };
          addItem(currentFolder.id, newItem);
          toast({
              title: "File Uploaded",
              description: `${file.name} has been successfully uploaded.`,
          });
      }
       if (isDoc || isExcel) {
        readerForUrl.onload?.({ target: { result: null } } as any);
      } else {
        readerForUrl.readAsDataURL(file);
      }
    };
    
    reader.readAsArrayBuffer(file);

    if (event.target) {
      event.target.value = '';
    }
  };


  const handleRename = () => {
    if (renameItem && newName) {
      updateItem(renameItem.id, { name: newName });
      toast({ title: "Success", description: `Renamed to ${newName}` });
      setRenameItem(null);
      setNewName("");
    }
  };

  const handleDelete = (itemId: string) => {
    deleteItem(itemId);
    toast({ title: "Deleted", description: "The item has been deleted." });
  };
  
  const handleCreateFolder = () => {
    if (newName) {
      const newFolder: Folder = {
        id: `folder-${Date.now()}`,
        name: newName,
        type: 'folder',
        modified: new Date().toISOString().split('T')[0],
        size: '---',
        children: [],
        ownerId: currentUser.id,
        permissions: { [currentUser.id]: 'owner' }
      };
      addItem(currentFolder.id, newFolder);
      toast({ title: "Success", description: `Folder "${newName}" created.` });
      setShowNewFolderDialog(false);
      setNewName("");
    }
  };

  const handleSendEmail = () => {
    if (emailItem && recipientEmail) {
      toast({
        title: "Email Sent (Simulated)",
        description: `An email with a link to "${emailItem.name}" has been sent to ${recipientEmail}.`,
      });
      setEmailItem(null);
      setRecipientEmail("");
    }
  };
  
  const handleSharePermission = (
    type: 'user' | 'department',
    id: string,
    permission: 'read' | 'write' | 'remove'
  ) => {
    if (shareItem) {
      const isUser = type === 'user';
      const updatedPermissions = produce(shareItem, draft => {
        const target = isUser ? draft.permissions : (draft.departmentPermissions ??= {});
        if (permission === 'remove') {
          delete target[id];
        } else {
          target[id] = permission;
        }
      });
      updateItem(shareItem.id, { 
        permissions: updatedPermissions.permissions,
        departmentPermissions: updatedPermissions.departmentPermissions
      });

      const name = isUser ? users.find(u => u.id === id)?.name : id;
      toast({
        title: "Permissions Updated",
        description: `${name} permissions set to ${permission}.`
      });
    }
  };

   const handleSheetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            const links: ImportLink[] = [];
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

            for (let R = range.s.r; R <= range.e.r; ++R) {
                const firstCellInRow = worksheet[XLSX.utils.encode_cell({c: 0, r: R})];
                const folderName = firstCellInRow ? XLSX.utils.format_cell(firstCellInRow) : `Imported Row ${R + 1}`;

                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellAddress = XLSX.utils.encode_cell({c: C, r: R});
                    const cell = worksheet[cellAddress];

                    if (!cell) continue;

                    let linkUrl: string | null = null;
                    
                    // 1. Check for explicit hyperlinks
                    if (cell.l && cell.l.Target && isUrl(cell.l.Target)) {
                        linkUrl = cell.l.Target;
                    } 
                    // 2. Check for plain text that is a web URL
                    else if(cell.v && typeof cell.v === 'string' && isUrl(cell.v)) {
                         linkUrl = cell.v;
                    }
                    // 3. Check for plain text that looks like a file path
                    else if (cell.v && typeof cell.v === 'string' && cell.v.toLowerCase().endsWith('.pdf')) {
                        linkUrl = cell.v;
                    }

                    if (linkUrl) {
                        links.push({
                            id: `import-${R}-${C}`,
                            url: linkUrl,
                            folderName: folderName,
                            cell: cellAddress,
                            status: 'pending'
                        });
                    }
                }
            }
            
            if (links.length === 0) {
                toast({ variant: "destructive", title: "No Links Found", description: "The sheet does not contain any valid URLs or hyperlinks."});
                return;
            }
            setImportLinks(links);
        } catch (error) {
            console.error("Error parsing sheet:", error);
            toast({ variant: "destructive", title: "Error Parsing Sheet", description: "Could not read the Excel file. Please check the format."});
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  
  const handleImportPdfs = (retryFailed = false) => {
    const linksToProcess = retryFailed 
        ? importLinks.filter(link => link.status === 'failed') 
        : importLinks;

    if (linksToProcess.length === 0) {
        toast({ title: "Nothing to import", description: "No pending or failed items to process."});
        return;
    }

    setIsImporting(true);
    
    linksToProcess.forEach((link, index) => {
      setTimeout(() => {
        // Update status to downloading
        setImportLinks(produce(draft => {
            const linkToUpdate = draft.find(l => l.id === link.id);
            if(linkToUpdate) linkToUpdate.status = 'downloading';
        }));

        // Simulate network delay and potential failure
        setTimeout(() => {
            const success = Math.random() > 0.2; // 80% success rate
            
            if (success) {
                // 1. Create Folder
                const folderName = link.folderName;
                const folderId = `folder-import-${Date.now()}-${index}`;
                const newFolder: Folder = {
                    id: folderId,
                    name: folderName,
                    type: 'folder',
                    modified: new Date().toISOString().split('T')[0],
                    size: '---',
                    children: [],
                    ownerId: currentUser.id,
                    permissions: { [currentUser.id]: 'owner' }
                };
                addItem(currentFolder.id, newFolder);
                
                // 2. Add PDF to folder
                const pdfName = link.url.split('/').pop()?.split('\\').pop()?.split('?')[0] || "document.pdf";
                const newItem: Document = {
                    id: `doc-import-${Date.now()}-${index}`,
                    name: pdfName,
                    type: 'pdf',
                    modified: new Date().toISOString().split('T')[0],
                    size: `${(Math.random() * 5 + 1).toFixed(2)} MB`, // Mock size
                    url: link.url,
                    content: `Imported from Excel sheet. Original link: ${link.url}`,
                    ownerId: currentUser.id,
                    permissions: { [currentUser.id]: 'owner' }
                };
                addItem(folderId, newItem);

                setImportLinks(produce(draft => {
                    const linkToUpdate = draft.find(l => l.id === link.id);
                    if(linkToUpdate) linkToUpdate.status = 'success';
                }));
            } else {
                 setImportLinks(produce(draft => {
                    const linkToUpdate = draft.find(l => l.id === link.id);
                    if(linkToUpdate) linkToUpdate.status = 'failed';
                }));
            }
            
             // Check if all are done
            if (index === linksToProcess.length - 1) {
                setIsImporting(false);
                toast({ title: "Import process finished."});
            }

        }, 1000 + Math.random() * 1000);

      }, index * 500); // Stagger the "downloads"
    });
  };


  const getBreadcrumbs = () => {
    const crumbs: Folder[] = [];
    let currentId = activeItem.id;

    if (currentId === 'root') {
        const rootFolder = findItem('root');
        if (rootFolder?.type === 'folder') {
            return [rootFolder];
        }
        return [];
    }
    
    while(currentId) {
        const item = findItem(currentId);
        if (item?.type === 'folder') {
            crumbs.unshift(item);
        }
        const parent = findItem(currentId, true);
        currentId = parent ? parent.id : '';
         if(currentId === 'root') {
            const rootFolder = findItem('root');
            if (rootFolder?.type === 'folder') {
                 crumbs.unshift(rootFolder);
            }
            break;
        }
    }
    return crumbs;
  }
  
  const ItemActions = ({ item }: { item: FileSystemItem }) => {
    const userPerm = item.permissions[currentUser.id];
    const departmentPerm = item.departmentPermissions?.[currentUser.department];

    const canWrite = userPerm === 'owner' || userPerm === 'write' || departmentPerm === 'write' || currentUser.role === 'admin';
    const isOwner = userPerm === 'owner' || currentUser.role === 'admin';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem 
                    disabled={!isOwner}
                    onClick={() => setShareItem(item)}
                >
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                    disabled={!canWrite}
                    onClick={() => { setRenameItem(item); setNewName(item.name); }}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Rename</span>
              </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  if (item.type === 'folder') {
                    toast({
                      title: "Download Started (Simulated)",
                      description: `Zipping and downloading "${item.name}" folder.`
                    })
                  } else if ('url' in item && item.url) {
                      const link = document.createElement('a');
                      link.href = item.url;
                      link.download = item.name;
                      document.body.appendChild(link);
link.click();
                      document.body.removeChild(link);
                  } else {
                     toast({
                        variant: "destructive",
                        title: "Download Not Available",
                        description: "This file cannot be downloaded."
                     })
                  }
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Download</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEmailItem(item)}>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Send by Mail</span>
                </DropdownMenuItem>
               <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild disabled={!isOwner}>
                     <Button variant="ghost" className="text-red-500 hover:text-red-500 hover:bg-red-500/10 w-full justify-start px-2 py-1.5 h-auto font-normal relative flex cursor-default select-none items-center gap-2 rounded-sm text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete "{item.name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

            </DropdownMenuContent>
        </DropdownMenu>
    )
  }

  const breadcrumbs = getBreadcrumbs();

  const ShareDialog = () => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [permission, setPermission] = useState<'read' | 'write'>('read');
    const [department, setDepartment] = useState('');
    const [departmentPermission, setDepartmentPermission] = useState<'read' | 'write'>('read');


    if (!shareItem) return null;
    
    const itemUsers = users.filter(u => shareItem.permissions[u.id]);
    const otherUsers = users.filter(u => !shareItem.permissions[u.id]);
    
    const allDepartments = [...new Set(users.map(u => u.department))];
    const itemDepartments = Object.keys(shareItem.departmentPermissions || {});
    const otherDepartments = allDepartments.filter(d => !itemDepartments.includes(d));

    return (
        <Dialog open={!!shareItem} onOpenChange={() => setShareItem(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share "{shareItem.name}"</DialogTitle>
            <DialogDescription>
              Manage access for users and departments.
            </DialogDescription>
          </DialogHeader>
            <Tabs defaultValue="users" className="pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
                <TabsTrigger value="departments"><Building className="mr-2 h-4 w-4" />Departments</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="space-y-4 pt-4">
                  <div className="flex items-center space-x-2">
                    <Select onValueChange={(userId) => setSelectedUser(users.find(u => u.id === userId) || null)}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a user to add" />
                        </SelectTrigger>
                        <SelectContent>
                            {otherUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={permission} onValueChange={(val: 'read' | 'write') => setPermission(val)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="read">Can view</SelectItem>
                            <SelectItem value="write">Can edit</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => selectedUser && handleSharePermission('user', selectedUser.id, permission)} disabled={!selectedUser}>
                        Add
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">People with access</h4>
                      <ScrollArea className="h-48">
                        {itemUsers.map(user => (
                             <div key={user.id} className="flex items-center justify-between pr-4">
                                <div className="flex items-center gap-2">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                                 <Select 
                                    value={shareItem.permissions[user.id]}
                                    onValueChange={(val: 'read' | 'write' | 'remove') => handleSharePermission('user', user.id, val)}
                                    disabled={shareItem.ownerId === user.id}
                                >
                                    <SelectTrigger className="w-[120px] capitalize">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="read">Can view</SelectItem>
                                        <SelectItem value="write">Can edit</SelectItem>
                                        <SelectItem value="remove">Remove</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        ))}
                      </ScrollArea>
                    </div>
              </TabsContent>
              <TabsContent value="departments" className="space-y-4 pt-4">
                 <div className="flex items-center space-x-2">
                    <Select onValueChange={setDepartment}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a department to add" />
                        </SelectTrigger>
                        <SelectContent>
                            {otherDepartments.map(dep => (
                                <SelectItem key={dep} value={dep}>{dep}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={departmentPermission} onValueChange={(val: 'read' | 'write') => setDepartmentPermission(val)}>
                        <SelectTrigger className="w-[120px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="read">Can view</SelectItem>
                            <SelectItem value="write">Can edit</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => department && handleSharePermission('department', department, departmentPermission)} disabled={!department}>
                        Add
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Departments with access</h4>
                      <ScrollArea className="h-48">
                        {itemDepartments.map(dep => (
                             <div key={dep} className="flex items-center justify-between pr-4">
                                <div className="flex items-center gap-2">
                                     <Avatar className="h-8 w-8">
                                        <AvatarFallback><Building className="h-4 w-4"/></AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm font-medium">{dep}</p>
                                </div>
                                 <Select 
                                    value={shareItem.departmentPermissions?.[dep]}
                                    onValueChange={(val: 'read' | 'write' | 'remove') => handleSharePermission('department', dep, val)}
                                >
                                    <SelectTrigger className="w-[120px] capitalize">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="read">Can view</SelectItem>
                                        <SelectItem value="write">Can edit</SelectItem>
                                        <SelectItem value="remove">Remove</SelectItem>
                                    </SelectContent>
                                </Select>
                             </div>
                        ))}
                      </ScrollArea>
                    </div>
              </TabsContent>
            </Tabs>
          <DialogFooter className="pt-4">
            <Button onClick={() => setShareItem(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const hasFailedImports = importLinks.some(link => link.status === 'failed');

  return (
    <div className="flex h-full flex-col">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
      />
       <input
        type="file"
        ref={importFileInputRef}
        className="hidden"
        accept=".xlsx, .xls, .csv"
        onChange={handleSheetUpload}
      />
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <button 
                className="cursor-pointer hover:text-primary disabled:text-muted-foreground disabled:no-underline"
                onClick={() => setActiveItem(crumb)}
                disabled={index === breadcrumbs.length -1}>
                {crumb.name}
              </button>
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
        <div className='flex gap-2'>
            <Button variant="outline" onClick={() => setShowNewFolderDialog(true)} disabled={!canWriteInCurrentFolder}>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
            </Button>
            <Button variant="outline" onClick={() => setShowImportDialog(true)} disabled={!canWriteInCurrentFolder}>
                <FileUp className="mr-2 h-4 w-4" />
                Import from Sheet
            </Button>
            <Button onClick={handleUploadClick} disabled={!canWriteInCurrentFolder}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
            </Button>
        </div>
      </div>

      <div className="flex-grow rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">File Size</TableHead>
              <TableHead className="w-[100px] text-center">Shared</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
               const canRead = hasPermission(item);
               const owner = users.find(u => u.id === item.ownerId);

               return (
                  <TableRow
                    key={item.id}
                    className={cn("cursor-pointer", !canRead && "opacity-50 select-none")}
                    onDoubleClick={() => canRead && handleItemClick(item)}
                  >
                    <TableCell className="font-medium" onClick={() => canRead && handleItemClick(item)}>
                      <div className="flex items-center gap-3">
                        {getIcon(item)}
                        <span>{item.name}</span>
                        {!canRead && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => canRead && handleItemClick(item)}>
                        {owner?.name || 'Unknown'}
                    </TableCell>
                    <TableCell onClick={() => canRead && handleItemClick(item)}>{item.modified}</TableCell>
                    <TableCell className="text-right" onClick={() => canRead && handleItemClick(item)}>{item.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center -space-x-2">
                        <TooltipProvider>
                        {Object.keys(item.permissions).slice(0, 3).map(userId => {
                          const user = users.find(u => u.id === userId);
                          if (!user) return null;
                          return (
                            <Tooltip key={userId}>
                              <TooltipTrigger asChild>
                                  <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{user.name} ({item.permissions[userId]})</p>
                              </TooltipContent>
                            </Tooltip>
                          )
                        })}
                        {Object.keys(item.permissions).length > 3 && (
                           <Tooltip>
                              <TooltipTrigger asChild>
                                <Avatar className="h-6 w-6 border-2 border-background">
                                    <AvatarFallback>+{Object.keys(item.permissions).length - 3}</AvatarFallback>
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>And {Object.keys(item.permissions).length - 3} more</p>
                              </TooltipContent>
                          </Tooltip>
                        )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                       {canRead && <ItemActions item={item} />}
                    </TableCell>
                  </TableRow>
               )
            })}
          </TableBody>
        </Table>
      </div>

      {previewItem && (
        <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{previewItem.name}</DialogTitle>
              <DialogDescription>
                {previewItem.type} - {previewItem.size}
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-auto rounded-md border p-4">
              {previewItem.type === 'image' && previewItem.url && (
                <Image
                  src={previewItem.url}
                  alt={previewItem.name}
                  width={1200}
                  height={800}
                  className="h-full w-full object-contain"
                  data-ai-hint={(previewItem as any)['data-ai-hint']}
                />
              )}
              {previewItem.type === 'pdf' && previewItem.url && (
                <iframe src={previewItem.url} className="h-full w-full" />
              )}
              {(previewItem.type === 'doc') && (
                 <div className="p-4 whitespace-pre-wrap text-sm">
                   {previewItem.content}
                 </div>
              )}
               {previewItem.type === 'excel' && previewItem.content && (
                 <div className="p-4" dangerouslySetInnerHTML={{ __html: previewItem.content }} />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {renameItem && (
        <Dialog open={!!renameItem} onOpenChange={() => setRenameItem(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Rename {renameItem.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <Input 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        placeholder="Enter new name"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setRenameItem(null)}>Cancel</Button>
                    <Button onClick={handleRename}>Rename</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}
      
      {emailItem && (
        <Dialog open={!!emailItem} onOpenChange={() => setEmailItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send "{emailItem.name}" by Mail</DialogTitle>
              <DialogDescription>
                Enter the recipient's email address to send a link to this item.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipient-email" className="text-right">
                  To:
                </Label>
                <Input
                  id="recipient-email"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="name@example.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEmailItem(null)}>Cancel</Button>
              <Button onClick={handleSendEmail}>Send Email</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ShareDialog />

       <Dialog open={showImportDialog} onOpenChange={(isOpen) => {
            if (!isOpen) {
                setImportLinks([]);
                setIsImporting(false);
                if(importFileInputRef.current) importFileInputRef.current.value = '';
            }
            setShowImportDialog(isOpen);
       }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import from Sheet</DialogTitle>
            <DialogDescription>
              Upload an Excel file. The system will automatically detect URLs, create folders based on the first column's text, and download the linked PDFs.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {importLinks.length === 0 ? (
                <Button variant="outline" onClick={() => importFileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Select Excel File
                </Button>
            ) : (
                <div className='space-y-4'>
                    <p className="text-sm font-medium">Found {importLinks.length} URL(s). Ready to import?</p>
                    <ScrollArea className="h-64 w-full rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Folder Name</TableHead>
                                    <TableHead>URL</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {importLinks.map((link) => (
                                    <TableRow key={link.id}>
                                        <TableCell className="font-medium truncate max-w-[150px]">{link.folderName}</TableCell>
                                        <TableCell className="truncate max-w-[200px]">{link.url}</TableCell>
                                        <TableCell>{link.cell}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                link.status === 'success' ? 'default' : 
                                                link.status === 'failed' ? 'destructive' : 'secondary'
                                            } className="capitalize flex items-center gap-1 w-28 justify-center">
                                                {link.status === 'downloading' && <Loader className="animate-spin h-3 w-3" />}
                                                {link.status === 'success' && <FileCheck2 className="h-3 w-3" />}
                                                {link.status === 'failed' && <AlertTriangle className="h-3 w-3" />}
                                                {link.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>Cancel</Button>
            {hasFailedImports && (
                <Button variant="secondary" onClick={() => handleImportPdfs(true)} disabled={isImporting}>
                     <RefreshCw className="mr-2 h-4 w-4"/>
                    Retry Failed
                </Button>
            )}
            <Button onClick={() => handleImportPdfs()} disabled={importLinks.length === 0 || isImporting}>
                {isImporting ? <Loader className="mr-2 h-4 w-4 animate-spin"/> : <Download className="mr-2 h-4 w-4"/>}
                {isImporting ? 'Importing...' : 'Start Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              placeholder="Enter folder name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowNewFolderDialog(false); setNewName(""); }}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
