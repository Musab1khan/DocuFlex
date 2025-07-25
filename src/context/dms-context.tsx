
"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { FileSystemItem, Folder, User, Document } from '@/types';
import { MOCK_DATA, MOCK_USERS } from '@/lib/mock-data';
import { produce } from 'immer';

interface DmsContextType {
  fileSystem: Folder;
  users: User[];
  currentUser: User;
  activeItem: FileSystemItem;
  recentItems: Document[];
  appName: string;
  setAppName: (name: string) => void;
  setActiveItem: (item: FileSystemItem) => void;
  addRecentItem: (item: Document) => void;
  findItem: (itemId: string, findParent?: boolean) => FileSystemItem | undefined;
  updateItem: (itemId: string, updates: Partial<FileSystemItem>) => void;
  deleteItem: (itemId: string) => void;
  addItem: (parentId: string, newItem: FileSystemItem) => void;
  addUser: (user: Omit<User, 'id' | 'avatar'>) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setCurrentUser: (user: User) => void;
}

const DmsContext = createContext<DmsContextType | undefined>(undefined);

export function DmsProvider({ children }: { children: ReactNode }) {
  const [fileSystem, setFileSystem] = useState<Folder>(MOCK_DATA);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[3]); // Default to administrator
  const [activeItem, setActiveItem] = useState<FileSystemItem>(MOCK_DATA);
  const [appName, setAppName] = useState('DocuFlex');
  const [recentItems, setRecentItems] = useState<Document[]>([]);

  useEffect(() => {
    document.title = `${appName} - Document Management System`;
  }, [appName]);

  const findItemRecursive = (
    itemId: string,
    folder: Folder,
    findParent: boolean = false,
    parent?: Folder
  ): FileSystemItem | Folder | undefined => {
    if (findParent === false && folder.id === itemId) {
        return folder;
    }
    for (const item of folder.children) {
      if (item.id === itemId) {
        return findParent ? folder : item;
      }
      if (item.type === 'folder') {
        const found = findItemRecursive(itemId, item, findParent, folder);
        if (found) {
          return found;
        }
      }
    }
    return undefined;
  };
  
  const findItem = useCallback((itemId: string, findParent: boolean = false) => {
    return findItemRecursive(itemId, fileSystem, findParent);
  }, [fileSystem]);


  const updateItem = (itemId: string, updates: Partial<FileSystemItem>) => {
    setFileSystem(
      produce(draft => {
        const item = findItemRecursive(itemId, draft) as FileSystemItem | undefined;
        if (item) {
          Object.assign(item, updates);
        }
      })
    );
     // Also update the active item if it's the one being changed
    if (activeItem.id === itemId) {
        setActiveItem(prev => ({...prev, ...updates}));
    }
  };

  const deleteItem = (itemId: string) => {
    setFileSystem(
      produce(draft => {
        const parent = findItemRecursive(itemId, draft, true) as Folder | undefined;
        if (parent) {
          parent.children = parent.children.filter(child => child.id !== itemId);
        }
      })
    );
    // If deleted item was active, set parent as active
    if (activeItem.id === itemId) {
        const parent = findItem(itemId, true);
        setActiveItem(parent || fileSystem);
    }
     setRecentItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  const addItem = (parentId: string, newItem: FileSystemItem) => {
    setFileSystem(
      produce(draft => {
        const parent = findItemRecursive(parentId, draft) as Folder | undefined;
        if (parent && parent.type === 'folder') {
          parent.children.unshift(newItem); // Add to the top of the list
        }
      })
    );
  };

  const addUser = (user: Omit<User, 'id' | 'avatar'>) => {
    const newUser: User = {
        ...user,
        id: `user-${Date.now()}`,
        avatar: `https://placehold.co/40x40.png`,
        password: 'password123' // Default password for new users
    };
    setUsers(produce(draft => {
        draft.push(newUser);
    }));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(produce(draft => {
        const user = draft.find(u => u.id === userId);
        if (user) {
            Object.assign(user, updates);
        }
    }));
    if (currentUser.id === userId) {
        setCurrentUser(prev => ({ ...prev, ...updates}));
    }
  };

  const addRecentItem = (item: Document) => {
    setRecentItems(produce(draft => {
        // Remove if it already exists to move it to the front
        const existingIndex = draft.findIndex(ri => ri.id === item.id);
        if (existingIndex > -1) {
            draft.splice(existingIndex, 1);
        }
        // Add to the front
        draft.unshift(item);
        // Keep only the 4 most recent items
        if (draft.length > 4) {
            draft.length = 4;
        }
    }));
  };

  return (
    <DmsContext.Provider value={{ 
        fileSystem, 
        users,
        currentUser,
        setCurrentUser,
        activeItem, 
        setActiveItem, 
        addRecentItem,
        recentItems,
        findItem, 
        updateItem, 
        deleteItem, 
        addItem,
        addUser,
        updateUser,
        appName,
        setAppName,
    }}>
      {children}
    </DmsContext.Provider>
  );
}

export function useDms() {
  const context = useContext(DmsContext);
  if (!context) {
    throw new Error('useDms must be used within a DmsProvider');
  }
  return context;
}
