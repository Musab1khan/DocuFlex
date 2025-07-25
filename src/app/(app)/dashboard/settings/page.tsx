
"use client";

import React, { useState, useRef } from 'react';
import { useDms } from '@/context/dms-context';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export default function SettingsPage() {
  const { users, addUser, updateUser, appName, setAppName, currentUser } = useDms();
  const { toast } = useToast();
  const [isUserDialog, setIsUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [newUserDepartment, setNewUserDepartment] = useState('');
  
  const [gmailAddress, setGmailAddress] = useState('');
  const [appPassword, setAppPassword] = useState('');

  const [tempAppName, setTempAppName] = useState(appName);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const openNewUserDialog = () => {
    setEditingUser(null);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('viewer');
    setNewUserDepartment('');
    setIsUserDialog(true);
  };

  const openEditUserDialog = (user: User) => {
    setEditingUser(user);
    setNewUserName(user.name);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setNewUserDepartment(user.department);
    setIsUserDialog(true);
  };

  const handleSaveUser = () => {
    if (!newUserName || !newUserEmail || !newUserDepartment) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Please fill in all fields.",
        });
        return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        department: newUserDepartment,
      });
      toast({ title: "User Updated", description: `${newUserName}'s details have been updated.` });
    } else {
      addUser({ name: newUserName, email: newUserEmail, role: newUserRole, department: newUserDepartment });
      toast({ title: "User Added", description: `${newUserName} has been added.` });
    }
    setIsUserDialog(false);
  };

  const handleSaveEmailSettings = () => {
    // In a real app, you'd encrypt and save this to a secure backend.
    toast({
        title: "Email Settings Saved (Simulated)",
        description: "Your email configuration has been saved.",
    });
  }

  const handleSaveBranding = () => {
    setAppName(tempAppName);
    toast({
        title: "Branding Settings Saved",
        description: "Your new application name has been saved.",
    });
  }
  
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // In a real app, you'd upload this file and update the logo URL
        toast({
            title: "Icon Uploaded (Simulated)",
            description: `${file.name} has been set as the new icon.`,
        });
    }
  }
  
  if (currentUser.role !== 'admin') {
    return (
        <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">You do not have permission to view this page. Please contact an administrator.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings and user permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>
            Customize the look and feel of your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="app-name">Software Name</Label>
            <Input 
              id="app-name"
              type="text"
              placeholder="Enter your application name"
              value={tempAppName}
              onChange={(e) => setTempAppName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Software Icon</Label>
            <div className="flex items-center gap-3">
                 <input
                    type="file"
                    ref={iconInputRef}
                    className="hidden"
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleIconUpload}
                 />
                 <Button variant="outline" onClick={() => iconInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Icon
                 </Button>
                 <p className="text-sm text-muted-foreground">PNG, JPG, or SVG.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveBranding}>Save Branding</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>
            Configure your Gmail account to send files and folders. Use an App Password for security.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gmail-address">Gmail Address</Label>
            <Input 
              id="gmail-address"
              type="email"
              placeholder="your-email@gmail.com"
              value={gmailAddress}
              onChange={(e) => setGmailAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-password">App Password</Label>
            <Input 
              id="app-password"
              type="password"
              placeholder="••••••••••••••••"
               value={appPassword}
              onChange={(e) => setAppPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSaveEmailSettings}>Save Email Settings</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>Manage who has access to your document system.</CardDescription>
                </div>
                 <Button onClick={openNewUserDialog}>Add User</Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell className="capitalize">{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditUserDialog(user)}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={isUserDialog} onOpenChange={setIsUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update the user's details below." : 'Enter the details for the new user.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="name" className="text-right">Name</Label>
               <Input id="name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="col-span-3" />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="email" className="text-right">Email</Label>
               <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="col-span-3" />
             </div>
              <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="department" className="text-right">Department</Label>
               <Input id="department" value={newUserDepartment} onChange={(e) => setNewUserDepartment(e.target.value)} className="col-span-3" />
             </div>
             <div className="grid grid-cols-4 items-center gap-4">
               <Label htmlFor="role" className="text-right">Role</Label>
                <Select value={newUserRole} onValueChange={(value: 'admin' | 'editor' | 'viewer') => setNewUserRole(value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveUser}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
